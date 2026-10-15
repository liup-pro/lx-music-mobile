import { useCallback, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

import { LIST_IDS } from '@/config/constant'

// 直连 entry 而非 '@/newui/navigation' 桶口：避免 navigation/index → register → screens → 本文件的循环引用
import { pushNewUiLocalListDetail, pushNewUiPlayer, pushNewUiSonglistDetail } from '@/newui/navigation/entry'

import {
  CardGrid,
  EmptyTip,
  FavCard,
  FootNote,
  MineHeader,
  PlCard,
  Section,
  SongRow,
  StatRow,
} from '@/newui/components'
import {
  getPlatformMeta,
  NEW_UI_BOARD_LIST_ID_PREFIX,
  NEW_UI_MINE_EDIT,
  NEW_UI_MINE_EMPTY,
  NEW_UI_MINE_FOOT_NOTE,
  NEW_UI_MINE_HEAD_SUB,
  NEW_UI_MINE_LOVE_PREVIEW_COUNT,
  NEW_UI_MINE_MORES,
  NEW_UI_MINE_STAT_LABELS,
  NEW_UI_MINE_TITLES,
  NEW_UI_MINE_TOAST,
  NEW_UI_PLAYLIST_ART_SEED,
  NEW_UI_PLAYLIST_EMPTY,
} from '@/newui/const'
import {
  useApiSupport,
  useGridItemWidth,
  useLoveSongs,
  useMyPlaylistCovers,
  useMyPlaylists,
  type MyPlaylistItem,
  useNickName,
  useNowPlaying,
  useRecentPlays,
} from '@/newui/hooks'
import { PLATFORM_TINTS, SONG_ROW, type PlatformTintKey } from '@/newui/theme'
import { clearNewUiRecentPlays, isOnlineMusic, playQueue, showNewUiToast, toSongDisplay } from '@/newui/utils'

import type { NewUiPageProps } from '../../types'

/** 最近播放列表最多列几首（原型 state.history 上限就是 30 条） */
const RECENT_LIMIT = 30

/**
 * 「我的」页（原型 #page-mine）容器：头部（.mine-head）+ 统计（.stat-row）+
 * 我喜欢（.fav-card）+ 最近播放（.song-list.compact）+ 我的歌单（.pl-grid）。
 * 数据来源：收藏 = @/store/list 的「我喜欢」列表（useLoveSongs）；
 * 最近播放 = 新 UI 自记的收听历史（useRecentPlays → utils/recentPlay，
 * 播核心的 playedList 只是随机模式去重池、非随机恒空，不能当最近播放用）；
 * 本地歌单 = store/list 的 allList（useMyPlaylists，与歌单页同源）；
 * 昵称 = 新 UI 自有存储（useNickName，旧 AppSetting 无用户信息键）。
 * 播放统一走 utils/play。我喜欢卡双动作（2026-10-14 用户条目）：整卡 = 打开内置歌单详情
 * （新 UI 详情层 local 形态，与「我的歌单」卡同一入口），圆钮 = 播放全部（原整卡动作保留，
 * 播放链阶段 9a 已换线新 UI 播放页）。
 */
export const MinePage = ({ componentId, onOpenNameSheet, onOpenMore, onOpenCreateListSheet }: NewUiPageProps) => {
  const { nickName, initial } = useNickName()
  const loveSongs = useLoveSongs()
  const recentPlays = useRecentPlays()
  const myLists = useMyPlaylists()
  // 走查现象 4：平台导入的歌单按坐标取真封面；纯自建与存榜条目取不到图，如实退回种子渐变底
  const listCovers = useMyPlaylistCovers(myLists)
  const nowPlaying = useNowPlaying()
  const assertApiSupport = useApiSupport()
  const cardWidth = useGridItemWidth()

  // 收藏里能进临时队列的只有在线曲目；「可播」再按当前音源逐平台筛（原型 play(can[0], can) 的口径）
  const onlineLove = useMemo(() => {
    const songs: LX.Music.MusicInfoOnline[] = []
    for (const musicInfo of loveSongs) {
      if (isOnlineMusic(musicInfo)) songs.push(musicInfo)
    }
    return songs
  }, [loveSongs])
  const playableLove = useMemo(
    () => onlineLove.filter(song => assertApiSupport(song.source)),
    [assertApiSupport, onlineLove],
  )

  // .fav-card p：`${n} 首 · 前三首曲名`；空收藏用原型原句
  const loveSub = useMemo(() => {
    if (!onlineLove.length) return NEW_UI_MINE_EMPTY.love
    const preview = onlineLove
      .slice(0, NEW_UI_MINE_LOVE_PREVIEW_COUNT)
      .map(song => song.name)
      .join(' · ')
    return `${onlineLove.length} 首 · ${preview}`
  }, [onlineLove])

  // 最近播放：新 UI 自记的收听历史（utils/recentPlay，切歌即记、本机留存、已按曲去重、只含在线曲）
  const recentSongs = useMemo(
    () => recentPlays.slice(0, RECENT_LIMIT),
    [recentPlays],
  )

  // 整卡 = 打开「我喜欢」内置歌单详情（2026-10-14 用户条目）：与「我的歌单」卡同一入口、
  // 同一详情层形态。LOVE 是内置列表，详情层 isDeletableUserListId 兜住，自然不出现删除钮
  // （不额外加「内置」判断分支）
  const handleLoveCardPress = useCallback(() => {
    pushNewUiLocalListDetail(componentId, { id: LIST_IDS.LOVE, name: NEW_UI_MINE_TITLES.love }, 'mine')
  }, [componentId])

  // 圆钮 = 播放全部（原整卡动作保留）：沿用原型 play(can[0], can) + openLayer(player()) 口径，
  // 播放成功即打开新 UI 播放页（阶段 9a 换线）
  const handleLovePlay = useCallback(() => {
    if (!playableLove.length) {
      showNewUiToast(NEW_UI_MINE_TOAST.loveUnplayable)
      return
    }
    void playQueue('love', playableLove, 0).then(ok => {
      if (ok) pushNewUiPlayer(componentId)
    })
  }, [componentId, playableLove])

  const handleRecentPress = useCallback((index: number) => {
    void playQueue('played', recentSongs, index)
  }, [recentSongs])

  const handleRecentClear = useCallback(() => {
    clearNewUiRecentPlays()
    showNewUiToast(NEW_UI_MINE_TOAST.recentCleared)
  }, [])

  // 原型 #mineEdit（app.js L1591）：点「改昵称」弹 #nameSheet（浮层本体挂在 MainScreen 根层，9e）
  const handleEditNick = useCallback(() => {
    onOpenNameSheet?.()
  }, [onOpenNameSheet])

  // 与歌单页同款判定：平台导入的自建卡进新 UI 详情层（阶段 9c 换线）。
  // 「存整榜」进来的那份坐标带 board__ 前缀（榜单存榜口径，见 const/songlistDetail），
  // 按歌单坐标原样开进详情层会取不到歌——剥掉前缀、按 rank 形态开，榜才和歌单一样打得开
  const handleListPress = useCallback((list: MyPlaylistItem) => {
    if (list.source && list.sourceListId) {
      const isBoard = list.sourceListId.startsWith(NEW_UI_BOARD_LIST_ID_PREFIX)
      pushNewUiSonglistDetail(componentId, {
        id: isBoard
          ? list.sourceListId.slice(NEW_UI_BOARD_LIST_ID_PREFIX.length)
          : list.sourceListId,
        source: list.source,
        name: list.name,
        author: '',
      }, isBoard ? 'rank' : 'mine', 'mine')
      return
    }
    // 纯自建 / 本地：没有平台坐标，用同一详情页的「本地歌单」形态打开（listId 定位，
    // 2026-10-12 修复：与歌单页同款入口，不再是弹一句提示的假动作）
    pushNewUiLocalListDetail(componentId, { id: list.id, name: list.name }, 'mine')
  }, [componentId])

  return (
    <>
      <MineHeader
        initial={initial}
        name={nickName}
        sub={NEW_UI_MINE_HEAD_SUB}
        editLabel={NEW_UI_MINE_EDIT}
        onEditPress={handleEditNick}
      />

      <StatRow
        items={[
          { key: 'love', value: loveSongs.length, label: NEW_UI_MINE_STAT_LABELS.love },
          { key: 'lists', value: myLists.length, label: NEW_UI_MINE_STAT_LABELS.lists },
          { key: 'recent', value: recentSongs.length, label: NEW_UI_MINE_STAT_LABELS.recent },
        ]}
      />

      <FavCard
        title={NEW_UI_MINE_TITLES.love}
        sub={loveSub}
        onPress={handleLoveCardPress}
        onPlayPress={handleLovePlay}
      />

      <Section
        sub
        title={NEW_UI_MINE_TITLES.recent}
        more={recentSongs.length ? NEW_UI_MINE_MORES.recent : undefined}
        onMorePress={handleRecentClear}
      >
        {recentSongs.length
          ? (
            <View style={styles.songList}>
              {recentSongs.map((song, index) => {
                const playable = assertApiSupport(song.source)
                const display = toSongDisplay(song, playable)
                const active = nowPlaying.id === song.id
                return (
                  <SongRow
                    key={song.id}
                    rank={index + 1}
                    artSeed={display.artSeed}
                    artUri={display.artUri}
                    // 历史曲目没带封面图时，行内共通补图（2026-10-12 走查现象 1）
                    musicInfo={song}
                    title={display.title}
                    artist={display.artist}
                    album={display.album}
                    sourceLabel={display.sourceLabel}
                    sourceTint={display.sourceTint}
                    qualityLabel={display.qualityLabel}
                    durationText={display.durationText}
                    active={active}
                    playing={active && nowPlaying.playing}
                    dimmed={!playable}
                    compact
                    onPress={() => handleRecentPress(index)}
                    // 原型「最近播放」行带 ⋯（app.js L607，songRow 未传 noMenu）：9e 接线
                    onMore={onOpenMore == null ? undefined : () => { onOpenMore(song) }}
                  />
                )
              })}
            </View>
          )
          : <EmptyTip text={NEW_UI_MINE_EMPTY.recent} />}
      </Section>

      <Section
        sub
        title={NEW_UI_MINE_TITLES.lists}
        more={NEW_UI_MINE_MORES.lists}
        // 2026-10-13 bug-fix「我的」7a：这一角原是「去歌单页」切 Tab，换成「新建歌单」开输入浮层
        //（原型该角是 .section-more 文字 + chevron，index.html L232，视觉口径不变只换动作；
        // 浮层本体挂在 MainScreen 根层，建单成功后 mylistUpdated 事件让下面的卡即时出现）
        onMorePress={onOpenCreateListSheet}
      >
        {myLists.length
          ? (
            <CardGrid>
              {myLists.map(list => (
                <PlCard
                  key={list.id}
                  width={cardWidth}
                  title={list.name}
                  artSeed={`${NEW_UI_PLAYLIST_ART_SEED.mine}:${list.id}`}
                  artUri={listCovers[list.id]}
                  meta={
                    list.count == null
                      ? '还在数有几首'
                      : list.source
                        ? `${list.count} 首 · 来自${getPlatformMeta(list.source).short}`
                        : `${list.count} 首`
                  }
                  tint={
                    list.source
                      ? PLATFORM_TINTS[list.source as PlatformTintKey]
                      : undefined
                  }
                  onPress={() => handleListPress(list)}
                />
              ))}
            </CardGrid>
          )
          : <EmptyTip text={NEW_UI_PLAYLIST_EMPTY.mine} />}
      </Section>

      <FootNote text={NEW_UI_MINE_FOOT_NOTE} />
    </>
  )
}

const styles = StyleSheet.create({
  /** .song-list：竖向排布，行间距 2px */
  songList: {
    gap: SONG_ROW.listGap,
  },
})

MinePage.displayName = 'NewUIMinePage'
