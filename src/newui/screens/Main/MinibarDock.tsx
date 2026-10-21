import { useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Easing, StyleSheet } from 'react-native'

import { getPlayQuality } from '@/core/music/utils'
import { playNext, togglePlay } from '@/core/player/player'
import { usePlayMusicInfo, useProgress } from '@/store/player/hook'
import { useSettingValue } from '@/store/setting/hook'

import { Minibar } from '@/newui/components'
import { QUALITY_LABEL, getPlatformMeta } from '@/newui/const'
import { useFavoriteToggle, useNowPlaying, useWideLayout } from '@/newui/hooks'
import { MINIBAR, MOTION, PLATFORM_TINTS, TAB_BAR, Z_LAYER, type PlatformTintKey } from '@/newui/theme'
import { isOnlineMusic } from '@/newui/utils'

// 直连 entry 而非 '@/newui/navigation' 桶口：避免 navigation/index → register → screens → 本文件的循环引用
import { pushNewUiPlayer } from '@/newui/navigation/entry'

/* ---- 进退场：原型 `.minibar` / `.minibar.show`（styles.css L659-L669）---- */
const EASE = Easing.bezier(MOTION.easing[0], MOTION.easing[1], MOTION.easing[2], MOTION.easing[3])
/** `.minibar{transform:translateY(120%)}`：沿自身高度下移一又两成 */
const HIDE_OFFSET_RATIO = 1.2
/** `transition:transform .42s var(--ease)`（原型给的 420，MOTION 里没有现成的一档） */
const SLIDE_MS = 420
/** `transition:opacity .3s var(--ease)` = MOTION.slow */
const FADE_MS = MOTION.slow

export interface MinibarDockProps {
  /** MainScreen 的 RNN 组件 ID（push 播放页的挂载点） */
  componentId: string
  /** 底部安全区（同 TabBar 口径） */
  bottomInset: number
}

/** 进退场要沿用的展示数据（回调不进来：那几颗钮只在条可见时才有意义） */
interface MinibarView {
  artSeed: string
  artUri?: string
  title: string
  artist: string
  sourceLabel: string
  sourceTint: string
  qualityLabel: string
  playing: boolean
  loved: boolean
  ratio: number
}

/**
 * 主屏上的迷你播放条挂点（对应原型 .minibar 常驻 .screen 的形态）。
 * 单独成容器组件：每秒的进度订阅只让它重渲染，
 * MainScreen 与各 Tab 页面完全不感知播放进度（性能口径）。
 * 数据全部只读取自 store/player；动作走 core/player 现成函数。
 * 进出场（原型 `.minibar` ↔ `.minibar.show` 的 transform/opacity 两段 transition）也落在这里：
 * `Minibar` 保持纯展示，不持有动画。首次挂载本来就有歌时直接落在「已进场」，不播入场。
 */
export const MinibarDock = ({ componentId, bottomInset }: MinibarDockProps) => {
  const nowPlaying = useNowPlaying()
  const playMusicInfo = usePlayMusicInfo()
  const { nowPlayTime, maxPlayTime } = useProgress()
  const playQuality = useSettingValue('player.playQuality')
  const { loved, toggle: toggleFav } = useFavoriteToggle()
  /* 本条的竖直摆位按档走（判据只在 useWideLayout 一处）：
     - 竖屏档：bottom = 安全区 + Tab 60 + 间隙 6 = 安全区 + 66，与原型 `.minibar{bottom:calc(var(--safe-b) + 66px)}`（styles.css:660）同式；
     - 宽屏档：原型 `.wide .minibar{bottom:calc(var(--safe-b) + 52px)}`（styles.css:1326）给的是**整条底距 52**
       （= Tab 44 + 间隙 8），故这里直接取 `wide.minibarBottomAboveSafe`，不再用「Tab 高 + 6」拼——
       6 那一档是竖屏的间隙，宽屏原型没写它。 */
  const { wide } = useWideLayout()

  // 没有在播曲目、或取不到曲目来源（理论不会发生）时不出现（原型只在 state.song 存在时 show）
  // PlayMusic 联合里下载项（ListItem）无 source：用 'source' 收窄，
  // 与旧口径一致（core/init/player/playProgress.ts、newui/hooks/useMyPlaylists.ts）
  const currentMusic = playMusicInfo.musicInfo
  const sourceKey = currentMusic && 'source' in currentMusic ? currentMusic.source : undefined
  const hasSong = nowPlaying.hasSong && sourceKey != null

  /**
   * 退场那 420ms 里 store 可能已经把曲目清空，正在下滑的条不能先空掉 ——
   * 所以在有歌时攒一份展示用视图模型，无歌那一段沿用它（不额外订阅、不复制播放逻辑）。
   */
  const lastViewRef = useRef<MinibarView | null>(null)
  const { album, picUrl, playing: isPlaying, singer, title } = nowPlaying
  const view = useMemo<MinibarView | null>(() => {
    if (!hasSong || currentMusic == null || sourceKey == null) return lastViewRef.current
    return {
      artSeed: `album:${album || title}`,
      artUri: picUrl ?? undefined,
      title,
      artist: singer,
      sourceLabel: getPlatformMeta(sourceKey).short,
      sourceTint: PLATFORM_TINTS[sourceKey as PlatformTintKey],
      // 音质标签回显「实际生效档」而不是设置里存的那档（2026-10-13 兜底条）：
      // 直接调用播放核心取地址用的同一个 getPlayQuality（core/music/utils.ts L218-230，只读复用），
      // 它按曲目音质 × 音源档位表自动降档；本地/下载曲目无此降档语境，仍按所选档显示。
      qualityLabel: QUALITY_LABEL[
        isOnlineMusic(currentMusic) ? getPlayQuality(playQuality, currentMusic) : playQuality
      ],
      playing: isPlaying,
      loved,
      ratio: maxPlayTime > 0 ? Math.min(nowPlayTime / maxPlayTime, 1) : 0,
    }
  }, [album, currentMusic, hasSong, isPlaying, loved, maxPlayTime, nowPlayTime, picUrl, playQuality, singer, sourceKey, title])
  useEffect(() => {
    if (view != null) lastViewRef.current = view
  }, [view])

  /**
   * 进出场（原型 `.minibar` / `.minibar.show` 的 transform/opacity 两段 transition）：
   * 无歌 → 下移 + 淡出，**跑完才卸载**；重新有歌 → 上滑 + 淡入。
   * 首次挂载本来就有歌时初值直接是「已进场」，不播入场动画（否则启动会先滑一下）。
   * 换曲不触发：整段只认 `hasSong` 这一个开关。
   *
   * 外层 `Animated.View` 常驻（内容是唯一挂卸的部分）：动画节点从首帧起就接着一个真视图，
   * 起 native 动画时不必赌「值先挂上、视图后挂」这种时序。
   */
  const [contentShown, setContentShown] = useState(view != null)
  const [slide] = useState(() => new Animated.Value(view != null ? 1 : 0))
  const [fade] = useState(() => new Animated.Value(view != null ? 1 : 0))

  useEffect(() => {
    if (hasSong) {
      setContentShown(true)
      Animated.parallel([
        Animated.timing(slide, { toValue: 1, duration: SLIDE_MS, easing: EASE, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: FADE_MS, easing: EASE, useNativeDriver: true }),
      ]).start()
      return
    }
    // 退场：原型靠 visibility 0s linear .45s 兜住「动完再藏」，RN 侧等价于动画跑完再卸载内容
    Animated.parallel([
      Animated.timing(slide, { toValue: 0, duration: SLIDE_MS, easing: EASE, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 0, duration: FADE_MS, easing: EASE, useNativeDriver: true }),
    ]).start(({ finished }) => { if (finished) setContentShown(false) })
  }, [fade, hasSong, slide])

  useEffect(() => () => {
    slide.stopAnimation()
    fade.stopAnimation()
  }, [fade, slide])

  const barHeight = wide?.minibarHeight ?? MINIBAR.height
  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [barHeight * HIDE_OFFSET_RATIO, 0] })

  return (
    <Animated.View
      // 退场期间整条不吃触摸：用户点不到一条正在消失的条
      pointerEvents={hasSong ? 'box-none' : 'none'}
      style={[
        styles.wrap,
        {
          bottom: bottomInset + (wide?.minibarBottomAboveSafe ?? TAB_BAR.height + MINIBAR.gapAboveTabBar),
          opacity: fade,
          transform: [{ translateY }],
        },
      ]}
    >
      {contentShown && view != null && (
        <Minibar
          artSeed={view.artSeed}
          artUri={view.artUri}
          title={view.title}
          artist={view.artist}
          sourceLabel={view.sourceLabel}
          sourceTint={view.sourceTint}
          qualityLabel={view.qualityLabel}
          playing={view.playing}
          loved={view.loved}
          ratio={view.ratio}
          onPress={() => pushNewUiPlayer(componentId)}
          onTogglePlay={togglePlay}
          onToggleFav={toggleFav}
          // playNext 首参是 isAutoToggle（布尔），不能直接接 onPress（会收到事件对象），
          // 必须无参转接——同播放页口径（screens/Player/index.tsx L258）
          onPlayNext={() => { void playNext() }}
        />
      )}
    </Animated.View>
  )
}

MinibarDock.displayName = 'NewUIMinibarDock'

const styles = StyleSheet.create({
  /**
   * .minibar position:absolute left/right 12（bottom 按安全区 + Tab 栏高推算）。
   * 显式层叠数：本条浮在页面滚动内容之上（原型 .minibar z-index:45），
   * 靠声明顺序赌 Android 绘制顺序已被走查证伪（2026-10-12 现象 2）。
   */
  wrap: {
    position: 'absolute',
    left: MINIBAR.marginX,
    right: MINIBAR.marginX,
    zIndex: Z_LAYER.minibar,
  },
})
