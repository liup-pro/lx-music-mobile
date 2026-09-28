import { useCallback, useEffect, useRef, useState } from 'react'
import { ScrollView, TouchableOpacity, View, StyleSheet, Dimensions, Platform } from 'react-native'
import { useTheme } from '@/store/theme/hook'
import { useI18n } from '@/lang'
import { scaleSizeW, scaleSizeH } from '@/utils/pixelRatio'
import Text from '@/components/common/Text'
import Image from '@/components/common/Image'
import { Icon } from '@/components/common/Icon'
import { navigations } from '@/navigation'
import commonState from '@/store/common/state'
import { getList } from '@/core/songlist'
import { getBoardsList, getListDetail } from '@/core/leaderboard'
import { setNavActiveId } from '@/core/common'
import { getActiveSource } from '@/core/onlineSource'
import { type ListInfoItem } from '@/store/songlist/state'

const SCREEN_WIDTH = Dimensions.get('window').width
const PAGE_PADDING = scaleSizeW(16)
const CARD_GAP = scaleSizeW(12)
const COVER_SIZE = scaleSizeW(122)
const HERO_HEIGHT = scaleSizeH(168)
const TRY_SOURCES: LX.OnlineSource[] = ['kw', 'kg', 'tx', 'wy', 'mg']

type SongItem = LX.Music.MusicInfoOnline

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

const fetchBoardSongs = (matcher: (name: string) => boolean, fallbackIndex: number) => trySources(async s => {
  const boards = await getBoardsList(s)
  if (!boards?.length) throw new Error('empty')
  const board = boards.find(b => matcher(b.name)) ?? boards[fallbackIndex] ?? boards[0]
  // board.id 自带来源前缀（如 kw__16），不能再拼一次
  const detail = await getListDetail(board.id, 1)
  if (!detail?.list?.length) throw new Error('empty')
  return detail.list.slice(0, 8)
})

const SectionHeader = ({ title, onPressMore }: { title: string, onPressMore?: () => void }) => {
  const theme = useTheme()
  const t = useI18n()
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle} size={20} color={theme['c-font']}>{title}</Text>
      {
        onPressMore ? (
          <TouchableOpacity style={styles.moreBtn} activeOpacity={.6} onPress={onPressMore}>
            <Text size={13} color={theme['c-font-label']}>{t('home_more')}</Text>
            <Icon name="chevron-right-2" size={13} color={theme['c-font-label']} style={styles.moreIcon} />
          </TouchableOpacity>
        ) : null
      }
    </View>
  )
}

const HeroCard = ({ item, onPress }: { item: ListInfoItem, onPress: () => void }) => {
  const t = useI18n()
  const width = SCREEN_WIDTH - PAGE_PADDING * 2
  return (
    <TouchableOpacity activeOpacity={.85} onPress={onPress} style={{ width, height: HERO_HEIGHT }}>
      <View style={{ ...styles.hero, width, height: HERO_HEIGHT }}>
        <Image url={item.img} style={{ width, height: HERO_HEIGHT }} />
        <View style={styles.heroOverlay} />
        <View style={styles.heroBottom}>
          <Text size={11} color="rgba(255,255,255,0.75)" style={styles.heroLabel}>{t('home_daily_recommend')}</Text>
          <Text size={17} color="#fff" numberOfLines={2} style={styles.heroTitle}>{item.name}</Text>
          <Text size={12} color="rgba(255,255,255,0.7)" numberOfLines={1}>{item.author}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const CoverCard = ({ item, onPress }: { item: ListInfoItem, onPress: () => void }) => {
  const theme = useTheme()
  return (
    <TouchableOpacity activeOpacity={.7} onPress={onPress} style={{ width: COVER_SIZE }}>
      <View style={{ ...styles.coverWrap, width: COVER_SIZE, height: COVER_SIZE, }}>
        <Image url={item.img} style={{ width: COVER_SIZE, height: COVER_SIZE, borderRadius: 12 }} />
        {
          item.play_count ? (
            <View style={styles.playCountBadge}>
              <Icon name="play-outline" size={8} color="#fff" />
              <Text size={8} color="#fff" style={{ marginLeft: 3 }}>{item.play_count}</Text>
            </View>
          ) : null
        }
      </View>
      <Text size={12} numberOfLines={2} style={styles.coverName} color={theme['c-font']}>{item.name}</Text>
    </TouchableOpacity>
  )
}

const RankRow = ({ index, item, onPress }: { index: number, item: SongItem, onPress: () => void }) => {
  const theme = useTheme()
  const rankColor = index < 3 ? theme['c-primary-font-active'] : theme['c-font-label']
  return (
    <TouchableOpacity activeOpacity={.6} onPress={onPress} style={{ ...styles.rankRow, borderBottomColor: theme['c-border-background'] }}>
      <Text style={{ ...styles.rankNum, color: rankColor }} size={16}>{index + 1}</Text>
      <View style={styles.rankInfo}>
        <Text size={14} numberOfLines={1} style={styles.rankName} color={theme['c-font']}>{item.name}</Text>
        <Text size={12} color={theme['c-font-label']} numberOfLines={1}>{item.singer}</Text>
      </View>
      {item.interval ? <Text size={11} color={theme['c-font-label']}>{item.interval}</Text> : null}
    </TouchableOpacity>
  )
}

const RankCard = ({ songs, onPress }: { songs: SongItem[], onPress: (song: SongItem) => void }) => {
  const theme = useTheme()
  return (
    <View style={{ ...styles.rankCard, backgroundColor: theme['c-button-background'] }}>
      {songs.map((song, i) => <RankRow key={song.id || i} index={i} item={song} onPress={() => { onPress(song) }} />)}
    </View>
  )
}

const Home = () => {
  const theme = useTheme()
  const t = useI18n()
  const [hotPlaylists, setHotPlaylists] = useState<ListInfoItem[]>([])
  const [newPlaylists, setNewPlaylists] = useState<ListInfoItem[]>([])
  const [hotSongs, setHotSongs] = useState<SongItem[]>([])
  const [newSongs, setNewSongs] = useState<SongItem[]>([])
  const [loading, setLoading] = useState(true)
  const loadingRef = useRef(false)

  const loadData = useCallback(() => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    Promise.all([
      fetchPlaylists('hot'),
      fetchPlaylists('new'),
      fetchBoardSongs(name => /热|爆/.test(name), 0),
      fetchBoardSongs(name => /新/.test(name), 1),
    ]).then(([hots, news, hotBoard, newBoard]) => {
      setHotPlaylists(hots ?? [])
      setNewPlaylists(news ?? [])
      setHotSongs(hotBoard ?? [])
      setNewSongs(newBoard ?? [])
    }).finally(() => {
      loadingRef.current = false
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    loadData()
    const handleApiUpdate = () => {
      loadingRef.current = false
      loadData()
    }
    const handleSourceUpdate = () => {
      loadingRef.current = false
      loadData()
    }
    global.state_event.on('apiSourceUpdated', handleApiUpdate)
    global.state_event.on('onlineSourceUpdated', handleSourceUpdate)
    return () => {
      global.state_event.off('apiSourceUpdated', handleApiUpdate)
      global.state_event.off('onlineSourceUpdated', handleSourceUpdate)
    }
  }, [loadData])

  const handlePlaylistPress = useCallback((item: ListInfoItem) => {
    navigations.pushSonglistDetailScreen(commonState.componentIds.home!, item)
  }, [])

  const handleGoSonglist = useCallback(() => {
    setNavActiveId('nav_songlist')
  }, [])

  const handleGoLeaderboard = useCallback(() => {
    setNavActiveId('nav_top')
  }, [])

  const handleSongPress = useCallback(() => {
    setNavActiveId('nav_top')
  }, [])

  const dailyItem = hotPlaylists[0] ?? null
  const carouselItems = hotPlaylists.slice(1)
  const nothing = !loading && !dailyItem && !carouselItems.length && !hotSongs.length && !newPlaylists.length && !newSongs.length

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ ...styles.scrollContent, paddingHorizontal: PAGE_PADDING }}
      showsVerticalScrollIndicator={false}>

      {
        dailyItem ? (
          <View style={styles.heroSection}>
            <SectionHeader title={t('home_daily_recommend')} onPressMore={handleGoSonglist} />
            <HeroCard item={dailyItem} onPress={() => { handlePlaylistPress(dailyItem) }} />
          </View>
        ) : null
      }

      {
        carouselItems.length ? (
          <View style={styles.section}>
            <SectionHeader title={t('home_featured_playlist')} onPressMore={handleGoSonglist} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
              {
                carouselItems.map((item, i) => (
                  <View key={item.id || i} style={{ marginRight: CARD_GAP }}>
                    <CoverCard item={item} onPress={() => { handlePlaylistPress(item) }} />
                  </View>
                ))
              }
            </ScrollView>
          </View>
        ) : null
      }

      {
        hotSongs.length ? (
          <View style={styles.section}>
            <SectionHeader title={t('home_hot_music')} onPressMore={handleGoLeaderboard} />
            <RankCard songs={hotSongs} onPress={handleSongPress} />
          </View>
        ) : null
      }

      {
        newPlaylists.length ? (
          <View style={styles.section}>
            <SectionHeader title={t('home_albums')} onPressMore={handleGoSonglist} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
              {
                newPlaylists.map((item, i) => (
                  <View key={item.id || i} style={{ marginRight: CARD_GAP }}>
                    <CoverCard item={item} onPress={() => { handlePlaylistPress(item) }} />
                  </View>
                ))
              }
            </ScrollView>
          </View>
        ) : null
      }

      {
        newSongs.length ? (
          <View style={styles.section}>
            <SectionHeader title={t('home_new_songs')} onPressMore={handleGoLeaderboard} />
            <RankCard songs={newSongs} onPress={handleSongPress} />
          </View>
        ) : null
      }

      {
        nothing ? (
          <View style={styles.empty}>
            <Text size={13} color={theme['c-font-label']}>{t('home_empty_tip')}</Text>
            <TouchableOpacity style={{ ...styles.retryBtn, backgroundColor: theme['c-primary-background-active'] }} activeOpacity={.7} onPress={() => { loadData() }}>
              <Text size={13} color={theme['c-button-font']} style={styles.retryText}>{t('home_retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : null
      }

      <View style={{ height: scaleSizeH(24) }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: scaleSizeH(6),
  },
  heroSection: {
    marginBottom: scaleSizeH(24),
  },
  section: {
    marginBottom: scaleSizeH(24),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaleSizeH(12),
  },
  sectionTitle: {
    fontWeight: '700',
  },
  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreIcon: {
    marginLeft: 2,
  },
  hero: {
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: HERO_HEIGHT * 0.55,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  heroBottom: {
    padding: scaleSizeW(14),
  },
  heroLabel: {
    fontWeight: '600',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontWeight: '700',
    marginBottom: 3,
    lineHeight: scaleSizeH(22),
  },
  carousel: {
    paddingRight: PAGE_PADDING,
  },
  coverWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: scaleSizeH(6),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  playCountBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 9,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  coverName: {
    lineHeight: scaleSizeH(15),
  },
  rankCard: {
    borderRadius: 16,
    overflow: 'hidden',
    paddingTop: scaleSizeH(2),
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: scaleSizeH(54),
    paddingHorizontal: scaleSizeW(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rankNum: {
    width: scaleSizeW(28),
    textAlign: 'center',
    fontWeight: '700',
  },
  rankInfo: {
    flex: 1,
    marginLeft: scaleSizeW(6),
  },
  rankName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  empty: {
    alignItems: 'center',
    paddingTop: scaleSizeH(48),
    paddingBottom: scaleSizeH(24),
  },
  retryBtn: {
    marginTop: scaleSizeH(14),
    paddingHorizontal: scaleSizeW(22),
    paddingVertical: scaleSizeH(8),
    borderRadius: 20,
  },
  retryText: {
    fontWeight: '600',
  },
})

export default Home
