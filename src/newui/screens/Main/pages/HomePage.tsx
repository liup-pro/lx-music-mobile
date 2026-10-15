import { useCallback, useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import type { ListInfoItem } from '@/store/songlist/state'

// 直连 entry 而非 '@/newui/navigation' 桶口：避免 navigation/index → register → screens → 本文件的循环引用
import { pushNewUiPlayer, pushNewUiSonglistDetail } from '@/newui/navigation/entry'

import {
  ArtistCard,
  Banner,
  CardGrid,
  ChipRow,
  DailyCard,
  EmptyTip,
  FootNote,
  GhostButton,
  HScroll,
  PlCard,
  QuickRow,
  RadioCard,
  RecentCard,
  Section,
  SongRow,
} from '@/newui/components'
import {
  NEW_UI_HOME_ARTISTS_NOTE,
  NEW_UI_HOME_ART_SEED,
  NEW_UI_HOME_BANNER_KEYS,
  NEW_UI_HOME_DAILY_KICKER,
  NEW_UI_HOME_EMPTY,
  NEW_UI_HOME_LIMITS,
  NEW_UI_HOME_MORES,
  NEW_UI_HOME_PLAY_TOAST,
  NEW_UI_HOME_QUICK_ITEMS,
  NEW_UI_HOME_QUICK_KEYS,
  NEW_UI_HOME_RADIO_ITEMS,
  NEW_UI_HOME_TITLES,
  NEW_UI_RECENT_CLEARED_TOAST,
  NEW_UI_HOME_TODO_TOAST,
  type RadioEntry,
} from '@/newui/const'
import type { NewUiPageProps } from '../../types'
import {
  useApiSupport,
  useDailyRecommend,
  useGridItemWidth,
  useHomeBanners,
  useHomeRanks,
  useNowPlaying,
  useRecommendPlaylists,
  useRecentPlays,
  useSingerPics,
} from '@/newui/hooks'
import { FONT_SIZE, PLATFORM_TINTS, RADIO_CARD, SONG_ROW, SPACING, useTheme, type PlatformTintKey } from '@/newui/theme'
import { clearNewUiRecentPlays, getSingerMidOfSong, getToday, playQueue, showNewUiToast, toSongDisplay } from '@/newui/utils'

/** 上屏上限（原型刻意设计值，集中在 const/home 的 NEW_UI_HOME_LIMITS，含各处原型行号） */
const RECENT_LIMIT = NEW_UI_HOME_LIMITS.recent
const ARTIST_LIMIT = NEW_UI_HOME_LIMITS.artists

/** 首页「热门歌手」的一条：名字 + 可用于取真人头像的歌手 id（null = 这个平台没给出歌手 id） */
interface ArtistEntry {
  name: string
  /** 只可能是「这首歌的第一位署名歌手」——SDK 侧只带得出 singer[0] 的 id（tx） */
  mid: string | null
}

/**
 * 从「歌手名」拆出可能的多位歌手。分隔符两家：网易/酷我等用「/」，QQ 用「、」
 * （`utils/musicSdk/utils.js` formatSingerName 默认 join='、'），两种都得拆，
 * 否则合唱曲目会被当成一位「A、B」歌手，既不像人也对不上头像。
 */
const splitSingers = (singer: string): string[] =>
  singer.split(/[\/、]/).map(s => s.trim()).filter(s => s.length > 0)

/**
 * 首页（原型 #page-home）容器：只做「取真实数据 + 分派动作」，视觉全部交给共通组件。
 * 数据来源：轮播 = 当前音源与在放曲目；继续收听 = 新 UI 自记的收听历史
 * （useRecentPlays → utils/recentPlay，与「我的」页最近播放同一份；播核心 playedList
 * 只是随机模式去重池、换列表即清空，非随机恒空，2026-10-12 走查后换掉）；
 * 每日推荐 = 听过 + 我喜欢的推算；推荐歌单 = core/songlist；热门单曲 = core/leaderboard
 * （推荐歌单与热门单曲跟随音源浮层选定的内容平台，见 hooks/useContentPlatform）；
 * 热门歌手 = 从当前榜单曲目认人，头像复用同一批曲目带出的歌手 id（hooks/useSingerPics
 * → utils/singerPic，只有 tx 源给得出真人照，其余平台如实回落示意插画）。
 */
export const HomePage = ({ componentId, onSwitchTab, onOpenSourceSheet }: NewUiPageProps) => {
  const theme = useTheme()
  const banners = useHomeBanners()
  const recentPlays = useRecentPlays()
  const daily = useDailyRecommend()
  const playlists = useRecommendPlaylists(4)
  const ranks = useHomeRanks()
  const nowPlaying = useNowPlaying()
  const assertApiSupport = useApiSupport()

  const cardWidth = useGridItemWidth()
  const radioWidth = useGridItemWidth(2, RADIO_CARD.gridGap)

  // 历史已在记录侧按曲去重（新播在前），这里只截上屏数量
  const recentSongs = useMemo(
    () => recentPlays.slice(0, RECENT_LIMIT),
    [recentPlays],
  )

  // 歌手不再另取接口：从当前榜单的曲目里认人，点谁就播这个榜里他的歌。
  // 头像顺同一批曲目带出：只有 tx（QQ）的 SDK 会把首位歌手 id 归一化进 meta.singerMid，
  // 且只对「第一位署名歌手」成立（合唱的第二位往后拿不到），其余平台 mid 恒为 null → 示意插画占位。
  const artists = useMemo<ArtistEntry[]>(() => {
    const picked: ArtistEntry[] = []
    for (const song of ranks.songs) {
      const names = splitSingers(song.singer)
      if (names.length === 0) continue
      const mid = getSingerMidOfSong(song)
      for (const name of names) {
        // mid 属于这首歌的第一位歌手，别的名字不能冒领（拿别人的脸更假）
        const entry = { name, mid: name === names[0] ? mid : null }
        const existed = picked.find(a => a.name === name)
        // 同名已在排内：之前只当过合唱的第二位（没拿到图），这次以首位身份出现就补上 mid
        if (existed != null) {
          if (existed.mid == null && entry.mid != null) existed.mid = entry.mid
          continue
        }
        picked.push(entry)
        if (picked.length >= ARTIST_LIMIT) return picked
      }
    }
    return picked
  }, [ranks.songs])

  // 待探测的歌手 id（去重；同一位歌手只发一次 HEAD，结果模块级缓存跨进页复用）
  const singerMids = useMemo(() => {
    const mids: string[] = []
    for (const artist of artists) {
      if (artist.mid == null || mids.includes(artist.mid)) continue
      mids.push(artist.mid)
    }
    return mids
  }, [artists])
  const { pics: singerPics, pending: singerPicsPending } = useSingerPics(singerMids)
  // 真人照片就绪的才带 artUri；没 mid / 探不到的交给 Art 的「无真图铺种子纹理」降级（组件零改动）
  const artistCards = useMemo(
    () => artists.map(artist => ({
      ...artist,
      artUri: artist.mid != null ? singerPics[artist.mid] ?? null : null,
    })),
    [artists, singerPics],
  )
  // 「平台未提供歌手照片」这句结论只在整排都是占位时说；探测未定期间不下断言，免得刚进页就被真图打脸
  const artistsAllPlaceholder = !artistCards.some(card => card.artUri != null) && !singerPicsPending

  const playableRankSongs = useMemo(
    () => ranks.songs.filter(song => assertApiSupport(song.source)),
    [assertApiSupport, ranks.songs],
  )

  // 轮播三条动线（原型 app.js L128-131）：正在播放 → 播放页；电台还没做 → 一句话提示；
  // 「音源公告」卡 → 开音源设置浮层（原型 openLayer($('#sourceSheet'))，9d 接通）
  const handleBannerPress = useCallback((key: string) => {
    switch (key) {
      case NEW_UI_HOME_BANNER_KEYS.nowPlaying:
        pushNewUiPlayer(componentId)
        break
      case NEW_UI_HOME_BANNER_KEYS.radio:
        showNewUiToast(NEW_UI_HOME_TODO_TOAST.radio)
        break
      default:
        onOpenSourceSheet?.()
    }
  }, [componentId, onOpenSourceSheet])

  const playDaily = useCallback(() => {
    if (!daily.songs.length) {
      showNewUiToast(NEW_UI_HOME_EMPTY.recent)
      return
    }
    void playQueue(`${NEW_UI_HOME_ART_SEED.daily}`, daily.songs, 0).then(ok => {
      if (ok) showNewUiToast(NEW_UI_HOME_PLAY_TOAST.daily)
    })
  }, [daily.songs])

  const handleQuickPress = useCallback((key: string) => {
    switch (key) {
      case NEW_UI_HOME_QUICK_KEYS.daily:
        playDaily()
        break
      case NEW_UI_HOME_QUICK_KEYS.chart:
        onSwitchTab('rank')
        break
      case NEW_UI_HOME_QUICK_KEYS.liked:
        onSwitchTab('mine')
        break
      default:
        showNewUiToast(NEW_UI_HOME_TODO_TOAST.radio)
    }
  }, [onSwitchTab, playDaily])

  const handleRecentPress = useCallback((index: number) => {
    void playQueue('played', recentSongs, index)
  }, [recentSongs])

  const handleRecentClear = useCallback(() => {
    // 清的是本页展示的那份历史（与「我的」页同一存储）；旧实现清 playedList 是随机池，与展示内容对不上
    clearNewUiRecentPlays()
    // QA 2026-10-14 D-11：清完无声无息等于假动作——与「我的」页同款 toast（原型两处入口共用一条实现）
    showNewUiToast(NEW_UI_RECENT_CLEARED_TOAST)
  }, [])

  // 歌单卡 → 新 UI 歌单详情层（阶段 9c 换线；旧详情页保留未动）。
  // fromTab='home'（QA D-16）：详情返回时落回本页
  const handlePlaylistPress = useCallback((info: ListInfoItem) => {
    pushNewUiSonglistDetail(componentId, info, 'pl', 'home')
  }, [componentId])

  const handleSongPress = useCallback((song: LX.Music.MusicInfoOnline) => {
    if (!assertApiSupport(song.source)) {
      showNewUiToast('这首歌所在的平台，当前音源放不出来')
      return
    }
    void playQueue(ranks.activeId, ranks.songs, ranks.songs.indexOf(song))
  }, [assertApiSupport, ranks.activeId, ranks.songs])

  const handlePlayAll = useCallback(() => {
    if (!playableRankSongs.length) {
      showNewUiToast(NEW_UI_HOME_PLAY_TOAST.nothingPlayable)
      return
    }
    void playQueue(ranks.activeId, playableRankSongs, 0)
  }, [playableRankSongs, ranks.activeId])

  const handleArtistPress = useCallback((name: string) => {
    const songs = ranks.songs.filter(song => song.singer.includes(name))
    if (!songs.length) {
      showNewUiToast(NEW_UI_HOME_TODO_TOAST.artists)
      return
    }
    void playQueue(`${ranks.activeId}__${name}`, songs, 0)
  }, [ranks.activeId, ranks.songs])

  const handleRadioPress = useCallback((entry: RadioEntry) => {
    showNewUiToast(NEW_UI_HOME_TODO_TOAST.radio)
  }, [])

  const today = getToday()

  return (
    <>
      <Banner items={banners} onPress={handleBannerPress} />

      <QuickRow items={NEW_UI_HOME_QUICK_ITEMS} onPress={handleQuickPress} />

      <Section
        title={NEW_UI_HOME_TITLES.recent}
        more={recentSongs.length ? NEW_UI_HOME_MORES.recent : undefined}
        onMorePress={handleRecentClear}
      >
        {recentSongs.length
          ? (
            <HScroll>
              {recentSongs.map((song, index) => {
                const display = toSongDisplay(song, assertApiSupport(song.source))
                return (
                  <RecentCard
                    key={song.id}
                    title={display.title}
                    // 原型 .rs 只给歌手（app.js L277），专辑不进卡片；字段统一走 toSongDisplay
                    subtitle={display.artist}
                    artSeed={display.artSeed}
                    artUri={display.artUri}
                    onPress={() => handleRecentPress(index)}
                  />
                )
              })}
            </HScroll>
          )
          : <EmptyTip text={NEW_UI_HOME_EMPTY.recent} />}
      </Section>

      {/* QA 2026-10-14 首页 D-04：原型每日推荐区块没有页头大标题（index.html L122 直接铺 .daily-card），
          卡内 kicker+标题已自带身份；Section 不传 title 即整行不渲染（组件注释同款约定） */}
      <Section>
        <DailyCard
          kicker={NEW_UI_HOME_DAILY_KICKER}
          title={NEW_UI_HOME_TITLES.daily}
          sub={daily.sub}
          date={today.label}
          artSeed={`${NEW_UI_HOME_ART_SEED.daily}:${today.key}`}
          onPress={playDaily}
        />
      </Section>

      <Section
        title={NEW_UI_HOME_TITLES.playlists}
        more={NEW_UI_HOME_MORES.playlists}
        onMorePress={() => onSwitchTab('playlist')}
      >
        {playlists.error
          ? <EmptyTip text={playlists.error} />
          : playlists.items.length
            ? (
              <CardGrid>
                {playlists.items.map(item => (
                  <PlCard
                    key={`${item.source}-${item.id}`}
                    width={cardWidth}
                    title={item.name}
                    artSeed={`${NEW_UI_HOME_ART_SEED.playlist}:${item.id}`}
                    artUri={item.img ?? undefined}
                    meta={[item.play_count, item.total ? `${item.total} 首` : null]
                      .filter(Boolean)
                      .join(' · ')}
                    tint={/* QA 2026-10-14 D-14：原型 .pl-card .ps 恒有 .src-dot（app.js L341-343），项目口径换平台 tint 上色（与歌单页池子卡/我的页同款） */
                      PLATFORM_TINTS[item.source as PlatformTintKey]}
                    onPress={() => handlePlaylistPress(item)}
                  />
                ))}
              </CardGrid>
            )
            : <EmptyTip text={NEW_UI_HOME_EMPTY.loading} />}
      </Section>

      <Section
        title={NEW_UI_HOME_TITLES.songs}
        more={NEW_UI_HOME_MORES.songs}
        onMorePress={() => onSwitchTab('rank')}
      >
        {ranks.tabs.length > 0 && (
          <ChipRow
            items={ranks.tabs.map(tab => ({ key: tab.id, label: tab.name }))}
            activeKey={ranks.activeId}
            onSelect={ranks.selectTab}
          />
        )}
        {ranks.error
          ? <EmptyTip text={ranks.error} />
          : ranks.songs.length
            ? (
              <View style={styles.songList}>
                {ranks.songs.map((song, index) => {
                  const playable = assertApiSupport(song.source)
                  const display = toSongDisplay(song, playable)
                  const active = nowPlaying.id === song.id
                  return (
                    <SongRow
                      key={song.id}
                      rank={index + 1}
                      artSeed={display.artSeed}
                      artUri={display.artUri}
                      // 榜单明细没带逐曲封面时（酷我），行内共通补图（2026-10-12 走查现象 1）
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
                      onPress={() => handleSongPress(song)}
                    />
                  )
                })}
              </View>
            )
            : <EmptyTip text={NEW_UI_HOME_EMPTY.loading} />}
        {ranks.songs.length > 0 && (
          <GhostButton
            icon="play"
            label={`播放全部 ${playableRankSongs.length} 首`}
            onPress={handlePlayAll}
            style={styles.playAll}
          />
        )}
      </Section>

      {artists.length > 0 && (
        <Section title={NEW_UI_HOME_TITLES.artists}>
          {/* 头像优先用平台官方歌手照（tx 曲目带 singerMid → utils/singerPic 探到图）；
              拿不到时才回落种子渐变 + 示意插画，此时才如实说明「平台未提供歌手照片」，
              有真图的排面不再挂这句（2026-10-15 方案 B）。原「更多」无落地页已撤下 */}
          {artistsAllPlaceholder && (
            <Text style={[styles.artistsNote, { color: theme.colors.text3 }]}>
              {NEW_UI_HOME_ARTISTS_NOTE}
            </Text>
          )}
          <HScroll>
            {artistCards.map(card => (
              <ArtistCard
                key={card.name}
                name={card.name}
                artSeed={`${NEW_UI_HOME_ART_SEED.artist}:${card.name}`}
                artUri={card.artUri ?? undefined}
                onPress={() => handleArtistPress(card.name)}
              />
            ))}
          </HScroll>
        </Section>
      )}

      <Section title={NEW_UI_HOME_TITLES.radio}>
        <CardGrid rowGap={RADIO_CARD.gridGap} columnGap={RADIO_CARD.gridGap}>
          {NEW_UI_HOME_RADIO_ITEMS.map(entry => (
            <RadioCard
              key={entry.key}
              width={radioWidth}
              title={entry.title}
              sub={entry.sub}
              artSeed={entry.artSeed}
              icon={entry.icon}
              tag={entry.tag}
              onPress={() => handleRadioPress(entry)}
            />
          ))}
        </CardGrid>
      </Section>

      <FootNote text="曲库内容来自各平台 · 能否播放取决于当前音源" />
    </>
  )
}

const styles = StyleSheet.create({
  /** 热门歌手区块的一句话说明：紧贴标题下方（.section-head 之后、卡片行之前） */
  artistsNote: {
    marginBottom: SPACING.md,
    fontSize: FONT_SIZE.caption,
  },
  /** .song-list：竖向排布，行间距 2px */
  songList: {
    gap: SONG_ROW.listGap,
  },
  /** .ghost-btn 在区块尾部留一段距离（原型 margin-top:12px） */
  playAll: {
    marginTop: 12,
  },
})
