import { useCallback, useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { Navigation } from 'react-native-navigation'

import { MUSIC_TOGGLE_MODE_LIST } from '@/config/constant'
import { getPlayQuality } from '@/core/music/utils'
import { playNext, playPrev, togglePlay } from '@/core/player/player'
import { useTimeoutExitTimeInfo } from '@/core/player/timeoutExit'
import { updateSetting } from '@/core/common'
import { useLrcPlay, useLrcSet } from '@/plugins/lyric'
import { useIsPlay, usePlayMusicInfo, usePlayerMusicInfo, useProgress } from '@/store/player/hook'
import { useSettingValue } from '@/store/setting/hook'

import {
  DiscArt,
  IconButton,
  LyricList,
  NewUiToastHost,
  PcButton,
  PlayerToolButton,
  QTag,
  SeekControl,
  SrcBadge,
  StageDots,
  pickArtPalette,
} from '@/newui/components'
import {
  NEW_UI_PLAYER_CRUMB,
  NEW_UI_PLAYER_LYRIC_EMPTY,
  NEW_UI_PLAYER_LYRIC_NOTE,
  NEW_UI_PLAYER_NO_SONG,
  NEW_UI_PLAYER_TOOL_ARIA,
  NEW_UI_SHEET_COMMENT,
  PLAYER_PLAY_MODE_META,
  QUALITY_LABEL,
  getPlatformMeta,
  newUiPlayerApiSourceText,
  newUiPlayerLoopAria,
} from '@/newui/const'
import {
  useApiSourceName,
  useDesktopLyricToggle,
  useFavoriteToggle,
  useNewUiSystemBar,
  useSafeArea,
} from '@/newui/hooks'
import {
  FONT_SIZE,
  FONT_WEIGHT,
  LETTER_SPACING,
  PLATFORM_TINTS,
  PLAYER,
  type PlatformTintKey,
  useTheme,
} from '@/newui/theme'
import { formatDuration, isOnlineMusic, showNewUiToast } from '@/newui/utils'

import { CommentSheet, TimerSheet } from './sheets'
import {
  PlayerStageSwipe,
  type StageSwipeDirection,
} from './PlayerStageSwipe'

export interface PlayerScreenProps {
  /** react-native-navigation 注入的组件 ID */
  componentId: string
}

/**
 * 播放页（对应原型 .player-layer，styles.css L504-588 / app.js paintPlayer + renderLyric）。
 * 界面层容器：全部数据只读订阅既有 store/player 与 plugins/lyric，
 * 动作全部转发现有 core/player、core/common、app_event —— 不触碰播放逻辑。
 * 阶段 9b：定时 / 评论 / LRC 浮窗入口接真浮层与真逻辑（sheets/）。
 * 2026-10-13（清单第 4 条）：均衡器为假能力（播放内核无频段增益通道），已整体移除。
 * 2026-10-12（原型同步轮 6）：主行改三颗居中（定时移出）、工具行四颗纯图标（状态只换图标）、
 * 舞台下方新增唱片/歌词指示点。
 */
export const PlayerScreen = ({ componentId }: PlayerScreenProps) => {
  const theme = useTheme()
  const { top, bottom } = useSafeArea()
  useNewUiSystemBar(componentId)

  // —— 真实数据（只读复用）——
  const musicInfo = usePlayerMusicInfo()
  const playMusicInfo = usePlayMusicInfo()
  const playing = useIsPlay()
  const { nowPlayTime, maxPlayTime, nowPlayTimeStr, maxPlayTimeStr } = useProgress()
  const playQuality = useSettingValue('player.playQuality')
  const togglePlayMethod = useSettingValue('player.togglePlayMethod')
  const apiName = useApiSourceName()
  const { loved, toggle: toggleFav } = useFavoriteToggle()

  const lrcLines = useLrcSet()
  const { line: lrcIndex } = useLrcPlay()

  // 原型 .player-layer.lyric-on：歌词与唱片互斥占同一个舞台。
  // 2026-10-13（清单第 2 条）：切换入口从【歌词】工具钮换成舞台横滑（右滑进歌词 / 左滑回唱片），
  // 显示状态仍是这一个 boolean，没为手势新造一套
  const [lyricOn, setLyricOn] = useState(false)

  // —— 阶段 9b：入口的真接线（定时 / 评论 / LRC 浮窗）——
  // 休眠定时剩余秒数（到点行为由 core/player/timeoutExit 决定）
  const { time: timerTime } = useTimeoutExitTimeInfo()
  // LRC 浮窗 = 系统级桌面歌词（core/desktopLyric），非本屏浮层
  const { enabled: floatEnabled, toggle: toggleFloat } = useDesktopLyricToggle()
  // 底部 sheets：一次只开一个（同原型 #sheet 单实例）
  const [openSheet, setOpenSheet] = useState<'timer' | 'comment' | null>(null)
  // 评论浮层取当前曲目的在线信息；本地曲目为 null（入口直接 toast）
  // playMusicInfo.musicInfo 类型为 PlayMusic | null，isOnlineMusic 只接 PlayMusic，先判空再收窄
  const currentMusic = playMusicInfo.musicInfo
  const commentMusic = useMemo(
    () => (currentMusic != null && isOnlineMusic(currentMusic) ? currentMusic : null),
    [currentMusic],
  )

  // 平台角标取曲目自身的 source（本地曲目为 'local'；没有在播曲目时为空，不显示角标）
  // 'source' in 收窄：下载项（ListItem）无顶层 source，口径同 MinibarDock
  const sourceKey = currentMusic && 'source' in currentMusic ? currentMusic.source : undefined
  const sourceMeta = sourceKey ? getPlatformMeta(sourceKey) : null
  const sourceTint = sourceKey
    ? PLATFORM_TINTS[sourceKey as PlatformTintKey] ?? theme.colors.text3
    : theme.colors.text3
  // 音质标签回显「实际生效档」而不是设置里存的那档（2026-10-13 兜底条）：
  // 在线曲目直接问播放核心取地址用的同一个 getPlayQuality（core/music/utils.ts L218-230，只读复用），
  // 它按曲目音质 × 音源档位表自动降档；本地/下载曲目无此降档语境，仍按所选档显示。
  const qualityLabel = QUALITY_LABEL[
    commentMusic != null ? getPlayQuality(playQuality, commentMusic) : playQuality
  ]
  const artSeed = `album:${musicInfo.album || musicInfo.name}`
  // 背景降级：blur(70) 无依赖可用，用同一种子色板画对角渐变 × .45 透明度
  const [bgC1, bgC2] = useMemo(() => pickArtPalette(artSeed), [artSeed])

  // progress.progress 字段在既有 action 里口径不稳，一律用原始秒数自算比例
  const ratio = maxPlayTime > 0 ? Math.min(nowPlayTime / maxPlayTime, 1) : 0

  const handleClose = useCallback(() => {
    void Navigation.pop(componentId)
  }, [componentId])

  const handleSeekCommit = useCallback(
    (next: number) => {
      if (maxPlayTime > 0) global.app_event.setProgress(next * maxPlayTime)
    },
    [maxPlayTime],
  )

  // 循环五态循着既有 MUSIC_TOGGLE_MODE_LIST 轮转（同旧 PlayDetail 的 PlayModeBtn 口径）
  const modeMeta = PLAYER_PLAY_MODE_META[togglePlayMethod] ?? PLAYER_PLAY_MODE_META[MUSIC_TOGGLE_MODE_LIST[0]]
  const handleLoopToggle = useCallback(() => {
    const index = MUSIC_TOGGLE_MODE_LIST.indexOf(togglePlayMethod)
    const next = MUSIC_TOGGLE_MODE_LIST[(index + 1) % MUSIC_TOGGLE_MODE_LIST.length]
    updateSetting({ 'player.togglePlayMethod': next })
    showNewUiToast(PLAYER_PLAY_MODE_META[next]?.label ?? '')
  }, [togglePlayMethod])

  // 舞台横滑落定时翻一次互斥状态（右滑 → 歌词，左滑 → 唱片）
  const handleStageSwipe = useCallback((direction: StageSwipeDirection) => {
    setLyricOn(direction === 'right')
  }, [])

  return (
    <View
      nativeID="newui.player.content"
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.bg,
          paddingTop: top + PLAYER.paddingTopReserve,
          paddingHorizontal: PLAYER.paddingX,
          paddingBottom: PLAYER.paddingBottom,
        },
      ]}
    >
      {/* .player-bg：封面色渐变铺底（毛玻璃降级方案） */}
      <LinearGradient
        colors={[bgC1, bgC2]}
        start={PLAYER.bgStart}
        end={PLAYER.bgEnd}
        style={[StyleSheet.absoluteFill, { opacity: PLAYER.bgOpacity }]}
        pointerEvents="none"
      />

      {/* .player-top：grid 34 / 1fr / 34（右侧留空位保持面包屑居中） */}
      <View style={styles.top}>
        <IconButton
          name="chevron"
          strong
          onPress={handleClose}
          iconStyle={styles.closeIcon}
          accessibilityLabel="收起播放页"
        />
        <View style={styles.crumb}>
          <Text style={[styles.crumbText, { color: theme.colors.text2 }]}>
            {NEW_UI_PLAYER_CRUMB}
          </Text>
          <QTag label={qualityLabel} />
        </View>
        <View style={styles.topSlot} />
      </View>

      {/* .player-stage：唱片 ↔ 歌词（横滑切换：右滑进歌词、左滑回唱片） */}
      <View style={styles.stage}>
        <PlayerStageSwipe
          phase={lyricOn ? 'lyric' : 'disc'}
          onSwipe={handleStageSwipe}
          enabled={openSheet == null}
        >
          {lyricOn ? (
            lrcLines.length > 0 ? (
              <LyricList lines={lrcLines} activeIndex={lrcIndex} note={NEW_UI_PLAYER_LYRIC_NOTE} />
            ) : (
              <Text style={[styles.emptyLyric, { color: theme.colors.text3 }]}>
                {NEW_UI_PLAYER_LYRIC_EMPTY}
              </Text>
            )
          ) : musicInfo.id ? (
            <DiscArt playing={playing} artSeed={artSeed} artUri={musicInfo.pic ?? undefined} />
          ) : (
            <Text style={[styles.emptyLyric, { color: theme.colors.text3 }]}>
              {NEW_UI_PLAYER_NO_SONG}
            </Text>
          )}
        </PlayerStageSwipe>
      </View>

      {/* .stage-dots：唱片 ↔ 歌词翻页的纯视觉指示（aria-hidden，不挂点击；RN 固定竖屏常显） */}
      <StageDots lyricOn={lyricOn} />

      {/* .player-meta：曲名 / 歌手 + 收藏 */}
      <View style={styles.meta}>
        <View style={styles.info}>
          <Text
            numberOfLines={1}
            style={[styles.title, { color: theme.colors.text }]}
          >
            {musicInfo.name || NEW_UI_PLAYER_NO_SONG}
          </Text>
          <Text numberOfLines={1} style={[styles.artist, { color: theme.colors.text2 }]}>
            {musicInfo.album ? `${musicInfo.singer} — ${musicInfo.album}` : musicInfo.singer}
          </Text>
        </View>
        <PcButton kind="fav" name="heart" active={loved} onPress={toggleFav} />
      </View>

      {/* .player-source：平台角标 + 音质 + 音源说明 */}
      <View style={styles.sourceRow}>
        {sourceMeta != null && <SrcBadge label={sourceMeta.short} tint={sourceTint} />}
        <QTag label={qualityLabel} />
        <Text style={[styles.sourceText, { color: theme.colors.text3 }]}>
          {newUiPlayerApiSourceText(apiName)}
        </Text>
      </View>

      {/* .seek + .seek-time */}
      <SeekControl ratio={ratio} onCommit={handleSeekCommit} />
      <View style={styles.seekTime}>
        <Text style={[styles.timeText, { color: theme.colors.text3 }]}>{nowPlayTimeStr}</Text>
        <Text style={[styles.timeText, { color: theme.colors.text3 }]}>{maxPlayTimeStr}</Text>
      </View>

      {/* .player-controls：上一曲 / 播停 / 下一曲（原型 index.html L339-343：居中 gap 38 三颗制；
          「定时」已按改版挪进次级工具行，第 5 枚「均衡」钮早已随假能力移除） */}
      <View style={styles.controls}>
        {/* playPrev/playNext 首参是 isAutoToggle（布尔），不能直接接 onPress（会收到事件对象），必须无参转接 */}
        <PcButton kind="ghost" name="prev" onPress={() => { void playPrev() }} accessibilityLabel="上一曲" />
        <PcButton
          kind="main"
          name={playing ? 'pause' : 'play'}
          onPress={togglePlay}
        />
        <PcButton kind="ghost" name="next" onPress={() => { void playNext() }} accessibilityLabel="下一曲" />
      </View>

      {/* .player-tools：定时 / 循环 / LRC 浮窗 / 评论（原型 index.html L346-351）——
          纯图标四颗：无选中底色、无文字标签，状态只靠换图标（timer↔timerOn、float↔floatOn、循环五态五轮廓），
          剩余倒计时不显示在按钮上，只进 aria 文案与定时面板副标题，逐秒回写（原型 app.js L1765-1776） */}
      <View style={styles.tools}>
        <PlayerToolButton
          name={timerTime > 0 ? 'timerOn' : 'timer'}
          accessibilityLabel={timerTime > 0 ? NEW_UI_PLAYER_TOOL_ARIA.timerOn(formatDuration(timerTime)) : NEW_UI_PLAYER_TOOL_ARIA.timerOff}
          onPress={() => setOpenSheet('timer')}
        />
        <PlayerToolButton
          name={modeMeta.icon}
          accessibilityLabel={newUiPlayerLoopAria(modeMeta.label)}
          onPress={handleLoopToggle}
        />
        <PlayerToolButton
          name={floatEnabled ? 'floatOn' : 'float'}
          accessibilityLabel={floatEnabled ? NEW_UI_PLAYER_TOOL_ARIA.floatOn : NEW_UI_PLAYER_TOOL_ARIA.floatOff}
          onPress={toggleFloat}
        />
        <PlayerToolButton
          name="comment"
          accessibilityLabel={NEW_UI_PLAYER_TOOL_ARIA.comment}
          onPress={() => {
            // 评论只对在线曲目有意义：本地曲 / 无歌时如实提示，不开空面板
            if (playMusicInfo.musicInfo == null) {
              showNewUiToast(NEW_UI_SHEET_COMMENT.noSong)
              return
            }
            if (commentMusic == null) {
              showNewUiToast(NEW_UI_SHEET_COMMENT.localSong)
              return
            }
            setOpenSheet('comment')
          }}
        />
      </View>

      {/* 阶段 9b 底部浮层：定时 / 评论（同原型单实例 #sheet） */}
      <TimerSheet
        visible={openSheet === 'timer'}
        onClose={() => setOpenSheet(null)}
        bottomInset={bottom}
      />
      <CommentSheet
        visible={openSheet === 'comment'}
        musicInfo={commentMusic}
        onClose={() => setOpenSheet(null)}
        bottomInset={bottom}
      />
      {/* 提示胶囊（QA D-09 观感）：屏幕根层最后一子——原型 .toast z-index:90 压在浮层之上 */}
      <NewUiToastHost bottomInset={bottom} />
    </View>
  )
}

PlayerScreen.displayName = 'NewUIPlayerScreen'

const styles = StyleSheet.create({
  /** .player-layer flex 纵排；子层浮在渐变底之上（RN 天然按文档顺序叠放） */
  root: {
    flex: 1,
  },
  /** .player-top grid 34px 1fr 34px */
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topSlot: {
    width: PLAYER.topRightSlot,
  },
  closeIcon: {
    transform: [{ rotate: '90deg' }],
  },
  /** .player-crumb：居中 gap 8 / 12px / text-2 / letter-spacing .4 */
  crumb: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: PLAYER.crumbGap,
  },
  crumbText: {
    fontSize: FONT_SIZE.small,
    letterSpacing: LETTER_SPACING.wide,
  },
  /** .player-stage flex:1 / place-items:center / padding 16px 0 */
  stage: {
    flex: 1,
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: PLAYER.stagePaddingY,
  },
  emptyLyric: {
    fontSize: FONT_SIZE.body,
    textAlign: 'center',
    paddingHorizontal: PLAYER.paddingX,
  },
  /** .player-meta gap 12 */
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PLAYER.metaGap,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  /** .player-info h3：21 / 900 / letter-spacing .3（字号令牌 FONT_SIZE.playerTitle） */
  title: {
    fontSize: FONT_SIZE.playerTitle,
    fontWeight: FONT_WEIGHT.black,
    letterSpacing: LETTER_SPACING.normal,
  },
  /** .player-artist：13 / text-2 / margin-top 5 */
  artist: {
    marginTop: PLAYER.artistMarginTop,
    fontSize: FONT_SIZE.body,
  },
  /** .player-source：margin-top 10 / gap 7 / 11px / 可换行 */
  sourceRow: {
    marginTop: PLAYER.sourceMarginTop,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: PLAYER.sourceGap,
  },
  sourceText: {
    fontSize: FONT_SIZE.caption,
    letterSpacing: LETTER_SPACING.normal,
  },
  /** .seek-time：两端对齐 / 11px tabular */
  seekTime: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: FONT_SIZE.caption,
    fontVariant: ['tabular-nums'],
  },
  /** .player-controls：居中 gap 38 / margin-top 18（styles.css L641，三颗制改版） */
  controls: {
    marginTop: PLAYER.controlsMarginTop,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: PLAYER.controlsGap,
  },
  /** .player-tools：两端对齐 / gap 2 / margin-top 14（钮都是 flex:1，四枚等分整行、无空槽） */
  tools: {
    marginTop: PLAYER.toolsMarginTop,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: PLAYER.toolsGap,
  },
})
