import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native'
import { useTheme } from '@/store/theme/hook'
import { useI18n } from '@/lang'
import Text from '@/components/common/Text'
import Image from '@/components/common/Image'
import { useWindowSize } from '@/utils/hooks'
import { isHorizontalMode } from '@/utils/tools'
import { Icon } from '@/components/common/Icon'
import CoverCard from '@/components/common/CoverCard'
import SectionHeader from '@/components/common/SectionHeader'
import BoardTile from '@/components/common/BoardTile'
import { navigations } from '@/navigation'
import commonState from '@/store/common/state'
import { getList } from '@/core/songlist'
import { getBoardsList, getListDetail } from '@/core/leaderboard'
import { setNavActiveId } from '@/core/common'
import { setSearchText } from '@/core/search/search'
import { getActiveSource } from '@/core/onlineSource'
import { handlePlay } from '../Leaderboard/listAction'
import { type ListInfoItem } from '@/store/songlist/state'

const PAGE_PADDING = 16
const GAP = 12
const TRY_SOURCES: LX.OnlineSource[] = ['kw', 'kg', 'tx', 'wy', 'mg']

type SongItem = LX.Music.MusicInfoOnline
interface BoardData { id: string, name: string, list: SongItem[] }

const trySources = async(fn: (source: LX.OnlineSource) => Promise<any>): Promise<any> => {
  const active = getActiveSource()
  const order = [active, ...TRY_SOURCES.filter(s => s != active)]
  for (const s of order) {
    try {
      return await fn(s)
    } catch { }
  }
  return null
}

const fetchPlaylists = (sortId: string) => trySources(async s => {
  const r = await getList(s, '', sortId, 1)
  if (!r?.list?.length) throw new Error('empty')
  return r.list.slice(0, 8)
})

// board.id 自带来源前缀（如 kw__16），不能再拼一次
const fetchBoard = (matcher: (name: string) => boolean, fallbackIndex: number) => trySources(async s => {
  const boards = await getBoardsList(s)
  if (!boards?.length) throw new Error('empty')
  const board = boards.find(b => matcher(b.name)) ?? boards[fallbackIndex] ?? boards[0]
  const detail = await getListDetail(board.id, 1)
  if (!detail?.list?.length) throw new Error('empty')
  return { id: board.id, name: board.name, list: detail.list.slice(0, 8) } as BoardData
})

const SingerItem = ({ name, img, onPress }: { name: string, img?: string, onPress: () => void }) => {
  const theme = useTheme()
  const size = 64
  return (
    <TouchableOpacity activeOpacity={.7} onPress={onPress} style={styles.singerItem}>
      {
        img
          ? <Image url={img} style={{ width: size, height: size, borderRadius: size / 2 }} />
          : <BoardTile id={name} name={name[0] ?? '?'} size={size} radius={size / 2} centered labelSize={12} />
      }
      <Text size={12} color={theme['c-font']} numberOfLines={1} style={styles.singerName}>{name}</Text>
    </TouchableOpacity>
  )
}

const SongRow = ({ index, item, onPress }: { index: number, item: SongItem, onPress: () => void }) => {
  const theme = useTheme()
  const pic = item.meta?.picUrl
  return (
    <TouchableOpacity activeOpacity={.6} onPress={onPress} style={styles.songRow}>
      <Text size={13} color={index < 3 ? theme['c-primary-font'] : theme['c-font-label']} style={styles.songIndex}>{index + 1}</Text>
      {
        pic
          ? <Image url={pic} style={styles.songPic} />
          : <BoardTile id={item.id} name={item.name[0] ?? '?'} size={46} radius={10} centered labelSize={10} />
      }
      <View style={styles.songInfo}>
        <Text size={15} color={theme['c-font']} numberOfLines={1} style={styles.songName}>{item.name}</Text>
        <Text size={12} color={theme['c-font-label']} numberOfLines={1}>{item.singer}</Text>
      </View>
    </TouchableOpacity>
  )
}

const Home = () => {
  const theme = useTheme()
  const t = useI18n()
  const [hotPlaylists, setHotPlaylists] = useState<ListInfoItem[]>([])
  const [hotBoard, setHotBoard] = useState<BoardData | null>(null)
  const [newBoard, setNewBoard] = useState<BoardData | null>(null)
  const [loading, setLoading] = useState(true)
  const loadingRef = useRef(false)
  const { width: winWidth, height: winHeight } = useWindowSize()
  const [bodyWidth, setBodyWidth] = useState(0)
  const pageWidth = bodyWidth || winWidth || 360
  const columns = isHorizontalMode(winWidth, winHeight) ? 3 : 2
  const gridWidth = (pageWidth - PAGE_PADDING * 2 - GAP * (columns - 1)) / columns
  const heroHeight = Math.round(pageWidth * (columns == 2 ? .46 : .3))

  const loadData = useCallback(() => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    Promise.all([
      fetchPlaylists('hot'),
      fetchBoard(name => /热|爆/.test(name), 0),
      fetchBoard(name => /新/.test(name), 1),
    ]).then(([hots, hot, fresh]) => {
      setHotPlaylists(hots ?? [])
      setHotBoard(hot)
      setNewBoard(fresh)
    }).finally(() => {
      loadingRef.current = false
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    loadData()
    const reload = () => {
      loadingRef.current = false
      loadData()
    }
    global.state_event.on('apiSourceUpdated', reload)
    global.state_event.on('onlineSourceUpdated', reload)
    return () => {
      global.state_event.off('apiSourceUpdated', reload)
      global.state_event.off('onlineSourceUpdated', reload)
    }
  }, [loadData])

  const openPlaylist = useCallback((item: ListInfoItem) => {
    navigations.pushSonglistDetailScreen(commonState.componentIds.home!, item)
  }, [])

  const goSonglist = useCallback(() => { setNavActiveId('nav_songlist') }, [])
  const searchSinger = useCallback((name: string) => {
    setSearchText(name)
    setNavActiveId('nav_search')
  }, [])

  const dailyItem = hotPlaylists[0] ?? null
  const hotCards = hotPlaylists.slice(1, 7)
  const newSongs = newBoard?.list ?? []
  const nothing = !loading && !dailyItem && !hotCards.length && !newSongs.length

  const singers = useMemo(() => {
    const list: { name: string, img?: string }[] = []
    for (const song of hotBoard?.list ?? []) {
      for (const singer of song.singer.split('/')) {
        const name = singer.trim()
        if (!name || list.some(s => s.name == name)) continue
        list.push({ name, img: song.meta?.picUrl ?? undefined })
        if (list.length >= 10) return list
      }
    }
    return list
  }, [hotBoard])

  const renderCards = (items: ListInfoItem[]) => (
    <View style={styles.grid}>
      {
        items.map((item, i) => (
          <View key={item.id || i} style={{ width: gridWidth, marginRight: (i + 1) % columns ? GAP : 0, marginBottom: 16 }}>
            <CoverCard
              img={item.img}
              title={item.name}
              subtitle={item.author}
              playCount={item.play_count}
              width={gridWidth}
              onPress={() => { openPlaylist(item) }}
            />
          </View>
        ))
      }
    </View>
  )

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      onLayout={e => { setBodyWidth(e.nativeEvent.layout.width) }}>

      <Text size={12} color={theme['c-font-label']} style={styles.pageDesc}>{t('home_desc')}</Text>

      {
        dailyItem ? (
          <TouchableOpacity activeOpacity={.85} onPress={() => { openPlaylist(dailyItem) }} style={{ ...styles.hero, height: heroHeight, backgroundColor: theme['c-primary-alpha-900'] }}>
            <Image url={dailyItem.img} style={styles.fill} />
            <View style={styles.heroMask} />
            <View style={styles.heroContent}>
              <Text size={20} color="#fff" numberOfLines={1} style={styles.heroTitle}>{t('home_daily_recommend')}</Text>
              <Text size={12} color="rgba(255,255,255,0.85)" numberOfLines={1} style={styles.heroSub}>{dailyItem.name}</Text>
              <View style={styles.heroBottomRow}>
                {
                  dailyItem.total ? (
                    <View style={styles.heroPill}>
                      <Icon name="album" size={10} color="rgba(255,255,255,0.9)" />
                      <Text size={10} color="rgba(255,255,255,0.9)" style={styles.heroPillText}>{dailyItem.total}{t('home_unit_song')}</Text>
                    </View>
                  ) : <View />
                }
                <View style={styles.heroPlay}>
                  <Icon name="play-outline" size={16} color={theme['c-primary']} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ) : null
      }
      {
        hotCards.length ? (
          <>
            <SectionHeader title={t('home_hot_music')} onPressMore={goSonglist} />
            {renderCards(hotCards)}
          </>
        ) : null
      }

      {
        singers.length ? (
          <>
            <SectionHeader title={t('home_hot_singer')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.singerRow}>
              {
                singers.map(s => (
                  <SingerItem key={s.name} name={s.name} img={s.img} onPress={() => { searchSinger(s.name) }} />
                ))
              }
            </ScrollView>
          </>
        ) : null
      }

      {
        newSongs.length ? (
          <>
            <SectionHeader title={t('home_new_songs')} onPressPlayAll={() => { if (newBoard) void handlePlay(newBoard.id, newSongs, 0) }} />
            <View style={{ ...styles.songCard, backgroundColor: theme['c-button-background'] }}>
              {
                newSongs.map((song, i) => (
                  <SongRow key={song.id || i} index={i} item={song} onPress={() => { if (newBoard) void handlePlay(newBoard.id, newSongs, i) }} />
                ))
              }
            </View>
          </>
        ) : null
      }

      {
        nothing ? (
          <View style={styles.empty}>
            <Text size={13} color={theme['c-font-label']}>{t('home_empty_tip')}</Text>
            <TouchableOpacity style={{ ...styles.retryBtn, backgroundColor: theme['c-primary-background-active'] }} activeOpacity={.7} onPress={loadData}>
              <Text size={13} color={theme['c-button-font']} style={styles.retryText}>{t('home_retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : null
      }

      <View style={{ height: 24 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 4,
  },
  pageDesc: {
    marginBottom: 12,
  },
  hero: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 4,
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  heroMask: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  heroContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'flex-end',
  },
  heroTitle: {
    fontWeight: '800',
  },
  heroSub: {
    marginTop: 3,
  },
  heroBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  heroPillText: {
    marginLeft: 4,
    fontWeight: '600',
  },
  heroPlay: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  singerRow: {
    paddingRight: PAGE_PADDING,
  },
  singerItem: {
    width: 68,
    marginRight: 10,
    alignItems: 'center',
  },
  singerName: {
    marginTop: 6,
    textAlign: 'center',
  },
  songCard: {
    borderRadius: 18,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingTop: 4,
    paddingBottom: 4,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  songIndex: {
    width: 22,
    fontWeight: '700',
  },
  songPic: {
    width: 46,
    height: 46,
    borderRadius: 10,
  },
  songInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 6,
  },
  songName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 48,
  },
  retryBtn: {
    marginTop: 14,
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryText: {
    fontWeight: '600',
  },
})

export default Home
