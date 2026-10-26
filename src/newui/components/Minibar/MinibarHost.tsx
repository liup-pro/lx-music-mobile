import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
  AppState,
  Easing,
  PanResponder,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native'
import { Navigation } from 'react-native-navigation'

import { getPlayQuality } from '@/core/music/utils'
import { playNext, togglePlay } from '@/core/player/player'
import { usePlayMusicInfo, useProgress } from '@/store/player/hook'
import { useSettingValue } from '@/store/setting/hook'

import { QUALITY_LABEL, getPlatformMeta } from '@/newui/const'
import { useNowPlaying, useWideLayout } from '@/newui/hooks'
import { MINIBAR, MOTION, PLATFORM_TINTS, TAB_BAR, Z_LAYER, type PlatformTintKey } from '@/newui/theme'
import {
  getNewUiMiniSide,
  hydrateNewUiMiniSide,
  isOnlineMusic,
  setNewUiMiniSide,
  type NewUiMiniSide,
} from '@/newui/utils'

import { Minibar } from './Minibar'
import { MinibarSnapped } from './MinibarSnapped'

// 直连 entry 而非 '@/newui/navigation' 桶口：避免 navigation/index → register → screens → 本文件的循环引用
import { pushNewUiPlayer } from '@/newui/navigation/entry'

/* ---- 进退场：原型 `.minibar` / `.minibar.show`（styles.css L687-715）---- */
const EASE = Easing.bezier(MOTION.easing[0], MOTION.easing[1], MOTION.easing[2], MOTION.easing[3])
/** 吸附 / 两态互相变形那条缓动：`--ease-snap:cubic-bezier(.3,.72,.2,1)` */
const SNAP_EASE = Easing.bezier(
  MINIBAR.snapEasing[0],
  MINIBAR.snapEasing[1],
  MINIBAR.snapEasing[2],
  MINIBAR.snapEasing[3],
)
/** `.minibar{transform:translateY(120%)}`：沿自身高度下移一又两成 */
const HIDE_OFFSET_RATIO = 1.2
/** `transition:transform .42s var(--ease)`（原型给的 420，MOTION 里没有现成的一档） */
const SLIDE_MS = 420
/** `transition:opacity .3s var(--ease)` = MOTION.slow */
const FADE_MS = MOTION.slow
/** 两态交叉那 200ms 里的收放起点：完整条略缩 0.97、圆点收到 0.92，观感是「收进去」 */
const FULL_SCALE_FROM = 0.97
const SNAPPED_SCALE_FROM = 0.92

/** 圆点贴左 / 贴右时它的基准 left（原型 `.is-snapped{left:var(--nav-w) + 3}` 与
 *  `[data-mini-side="right"]{left:calc(100% - dot - 3)}`；本 App 无侧栏，--nav-w 为 0） */
const dotLeftOf = (side: NewUiMiniSide, windowWidth: number, dotSize: number) =>
  side === 'left'
    ? MINIBAR.snappedEdge
    : windowWidth - dotSize - MINIBAR.snappedEdge

/**
 * 拖动时真正写进 transform 的位移（原型 miniPullPx，app.js L2614-2621）：
 * 贴边圆点可以满屏跑（左右都钳在内容区沿）；完整条几乎铺满屏宽，只给一段被压缩的余量。
 */
const pullOf = (
  raw: number,
  isSnapped: boolean,
  side: NewUiMiniSide,
  windowWidth: number,
  dotSize: number,
) => {
  if (!isSnapped) {
    const damped = raw * MINIBAR.pullDamp
    return Math.max(-MINIBAR.pull, Math.min(MINIBAR.pull, damped))
  }
  const left = dotLeftOf(side, windowWidth, dotSize)
  const min = -left
  const max = windowWidth - dotSize - left
  return Math.max(min, Math.min(max, raw))
}

export interface MinibarHostProps {
  /** 本屏的 RNN 组件 ID（点完整条要 push 播放页） */
  componentId: string
  /** 底部安全区（同 TabBar 口径） */
  bottomInset: number
  /**
   * 本屏的默认形态（原型 `miniPageSnapped()`，app.js L2600-2603）：
   * 只有首页那一屏给完整条（false），其余所有画面——另外四个 Tab、歌单详情、搜索、
   * 已缓存、电台 / 播客详情、单集屏——一律是磁吸圆点（true）。
   */
  defaultSnapped: boolean
  /**
   * 页面标识：一变就按该页默认态重置（原型「手动在非首页展开后切页 → 重置回该页默认态」）。
   * 主屏传当前 Tab key；推入层整屏只有一个形态，不传。
   * 注：屏内切页走这个 key，**离开本屏**（被盖住 / 被弹掉）走下面的 componentDidDisappear 监听，
   * 两者都收敛到 defaultSnapped 这一个值，别在别处再记一份「刚才展开过」。
   */
  resetKey?: string
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
  ratio: number
}

/**
 * 迷你播放条的**挂点**（全站常驻那一颗播放条的数据 / 动画 / 手势都在这里；对应原型 .minibar，
 * RN 侧拆成「挂点」与「本体」两件：挂点管接入与行为，`Minibar` / `MinibarSnapped` 只管画）。
 *
 * 为什么每个屏各挂一份、而不是全站真·一份：RNN 的每个屏是各自独立的原生视图（ViewController /
 * ViewGroup），主屏上挂的浮层压不到推入层的视图之上——`Navigation.showOverlay` 那样的全局窗倒是能
 * 压住一切，却会连播放页与弹层遮罩一起盖掉，与「弹层打开时圆点被遮罩盖住、播放页不显示圆点」直接冲突。
 * 所以落点是「每屏一份挂点 + 一份模块级共享状态」：任何时刻屏上只有一颗（下层屏那颗被上层屏整个盖住），
 * 侧边（left / right）跨屏记忆并持久化，形态按各屏默认态走。
 *
 * 两种形态共用同一个挂点（原型 `.minibar` / `.minibar.is-snapped`）：
 *  - 完整条：左右各留 12、58 高、20 圆角，点非拖拽区开全屏播放页（原有行为不变）；
 *  - 磁吸圆点：56 正圆贴边（离屏边 3），半透明 + 轻模糊，内含封面、正中播放态与外圈一弧进度，
 *    点它展开回完整条（不直接进播放页）。
 * 手势（原型 app.js `MINI` L2589-2695）：<8px 算点击；8–24px 弹回、什么都不做；≥24px 吸附。
 * 完整条拖向哪侧就吸哪侧；圆点过内容区中线换边。拖拽那一下不补发点击——手势一旦成立，
 * 内层 `Pressable` 会被 responder 打断，点击自然不成立（原型靠 endAt 时间戳挡的那件事）。
 */
export const MinibarHost = ({
  componentId,
  bottomInset,
  defaultSnapped,
  resetKey,
}: MinibarHostProps) => {
  const nowPlaying = useNowPlaying()
  const playMusicInfo = usePlayMusicInfo()
  const { nowPlayTime, maxPlayTime } = useProgress()
  const playQuality = useSettingValue('player.playQuality')
  const { wide } = useWideLayout()
  const { width: windowWidth } = useWindowDimensions()

  /* 本条的竖直摆位按档走（判据只在 useWideLayout 一处）：
     竖屏档 bottom = 安全区 + Tab 60 + 间隙 6 = 安全区 + 66，与原型
     `.minibar{bottom:calc(var(--safe-b) + 66px)}`（styles.css L687-710）同式；
     宽屏档原型 `.wide .minibar{bottom:calc(var(--safe-b) + 52px)}`（styles.css L1446）= 整条底距 52。
     **推入层沿用同一个数**（原型也是：圆点在详情 / 搜索层上仍浮在安全区 + 66 那一档，不贴到屏底）。 */
  const bottom = bottomInset + (wide?.minibarBottomAboveSafe ?? TAB_BAR.height + MINIBAR.gapAboveTabBar)
  const barHeight = wide?.minibarHeight ?? MINIBAR.height
  // 圆点直径走自己的那一档 token（原型 `--mini-dot:56px`，`.wide` 里改成 52），
  // 与完整条高 52 数值恰好相同但语义无关，别拿条高顶替
  const dotSize = wide ? MINIBAR.snappedSizeWide : MINIBAR.snappedSize
  const layerHeight = Math.max(barHeight, dotSize)

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
      ratio: maxPlayTime > 0 ? Math.min(nowPlayTime / maxPlayTime, 1) : 0,
    }
  }, [album, currentMusic, hasSong, isPlaying, maxPlayTime, nowPlayTime, picUrl, playQuality, singer, sourceKey, title])
  useEffect(() => {
    if (view != null) lastViewRef.current = view
  }, [view])

  /* ---- 形态与侧边（原型 MINI.snapped / MINI.side） ---- */
  // morph：1 = 完整条，0 = 磁吸圆点（原型那条 left/width/height/border-radius 联动）
  const morph = useRef(new Animated.Value(defaultSnapped ? 0 : 1)).current
  const morphAnimRef = useRef<Animated.CompositeAnimation | null>(null)
  const [snapped, setSnapped] = useState(defaultSnapped)
  const [side, setSide] = useState<NewUiMiniSide>(getNewUiMiniSide)

  /**
   * 形态的**唯一写入口**（原型 `syncMiniPage(instant)`，app.js L2748-2757）。
   * `instant` = 这一下只落位、不跑 morph：切 Tab / 进出推入层那一帧页面刚整页重铺过，
   * 再叠几何过渡必掉帧（原型 6× CPU 节流实测：铺页 39–55ms，叠 8 条过渡后首帧 50–83ms），
   * 所以那几路一帧到位；用户自己动手那两路（点圆点展开、拖到边缘松手吸附）没有重铺，
   * 照旧走 MINIBAR.morphMs 的 180ms。
   */
  const applySnap = useCallback((target: boolean, instant: boolean) => {
    setSnapped(target)
    morphAnimRef.current?.stop()
    if (instant) {
      morphAnimRef.current = null
      morph.setValue(target ? 0 : 1)
      return
    }
    const animation = Animated.timing(morph, {
      toValue: target ? 0 : 1,
      duration: MINIBAR.morphMs,
      easing: SNAP_EASE,
      // 这一档只动 opacity / scale（不逐帧改宽高），可以整段交给原生驱动
      useNativeDriver: true,
    })
    morphAnimRef.current = animation
    animation.start()
  }, [morph])

  // 页面默认态只在一处落：切换 Tab / 进出一层，按该页默认重置（原型 syncMiniPage 的口径）。
  // 手动展开过的那一份记忆不许跨页飘着——那比每次都收回去更让人抓不到规律。
  // 重置一律 instant：挂载时初值本来就是 defaultSnapped，这一下 setValue 到同一个值，不会多播一次入场。
  useEffect(() => {
    applySnap(defaultSnapped, true)
  }, [applySnap, defaultSnapped, resetKey])

  /* 切 Tab 那条只管屏内换页；**离开本屏**（被推入层 / 播放页盖住、被弹掉）算另一次「进了一页」，
   * 回来也得是默认态 —— 原型 syncMiniPage 就是在开 / 收那一层时立刻按新页重算（app.js L2606-2611），
   * 所以手动展开过的完整条不该从下层屏里冒出来。 */
  // 监听回调里要读「此刻」的默认态，但不该因此重注册监听：收一条 ref
  const defaultSnappedRef = useRef(defaultSnapped)
  defaultSnappedRef.current = defaultSnapped

  /**
   * RNN 侧等价物是**本屏自己的** componentDidDisappear（7.39.2 签名：
   * `Navigation.events().registerComponentListener(listener, componentId)` → `{ remove() }`，
   * 见 lib/src/events/ComponentEventsObserver.ts L84-100；Android 由视图可见性回调发
   * （ComponentViewController.onViewDisappear L92-99），iOS 由 viewDidDisappear 发
   * （RNNComponentViewController.m L52-56））。按 componentId 过滤，一屏一个监听、只认自己。
   * 收回发生在被盖住那一刻（此刻本屏已被上层视图遮住，形态动画看不见），返回时就是干净的默认态；
   * 主屏 + 7 个推入屏共用这一份挂点，不必逐屏接。
   *
   * 三种情况不收回：
   *  - 屏内浮层（音源列表 / 评论 / 更多操作…）是屏内 absolute-fill 覆盖层，不走 RNN 路由，
   *    压根不产生这个事件（Sheet.tsx 头注口径）；
   *  - App 切后台：RNN 只在视图层级变化时发这个事件（Android 走 onGlobalLayout 的可见性判定、
   *    iOS 走 viewDidDisappear），切后台本身两处都不发；这里再补一道 AppState 守卫，
   *    万一某机型补发一次，也不会把用户刚展开的条收掉；
   *  - 卸载：监听在 effect 清理时注销，迟到事件由 alive 标记挡掉（不给已卸载的挂点 setState）。
   */
  useEffect(() => {
    let alive = true
    const subscription = Navigation.events().registerComponentListener({
      componentDidDisappear: () => {
        if (!alive) return
        if (AppState.currentState !== 'active') return
        // 离开本屏也算「进了一页」：只落位，不跑 morph（与切 Tab 同口径）
        applySnap(defaultSnappedRef.current, true)
      },
    }, componentId)
    return () => {
      alive = false
      subscription.remove()
    }
  }, [applySnap, componentId])

  // 侧边跨屏记住，并在一生一次的异步读盘后跟上本机存过的值
  useEffect(() => {
    let alive = true
    void hydrateNewUiMiniSide().then(saved => {
      if (alive) setSide(saved)
    })
    return () => { alive = false }
  }, [])

  /* ---- 动画 ---- */
  // 拖拽位移（跟手，JS 侧 setValue；松手后同一段缓动归零）。这一条始终走 JS 驱动，
  // 因为它的位移是手势逐帧写的，不能中途被「原生驱动」接管（RN 不允许同一个值半路换驱动）
  const dragX = useRef(new Animated.Value(0)).current
  const [dragging, setDragging] = useState(false)

  // morph 的驱动全交给 applySnap（来源分明：重置落位 / 用户动作走动画）；卸载时收掉在途动画
  useEffect(() => () => {
    morphAnimRef.current?.stop()
  }, [])

  /**
   * 进退场（原型 `.minibar` / `.minibar.show` 的 transform/opacity 两段 transition）：
   * 无歌 → 下移 + 淡出，**跑完才卸载**；重新有歌 → 上滑 + 淡入。
   * 首次挂载本来就有歌时初值直接是「已进场」，不播入场动画（否则启动会先滑一下）。
   * 换曲不触发：整段只认 `hasSong` 这一个开关。
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

  /* ---- 手势（原型 bindMiniDock L2642-2698 / miniPullPx / release 那一支） ---- */
  // 手势回调里要读「此刻」的形态 / 侧边 / 宽度，但 responder 不该因此重建：收在一条 ref 里
  const liveRef = useRef({ snapped, side, windowWidth, dotSize })
  liveRef.current = { snapped, side, windowWidth, dotSize }
  const pullRef = useRef(0)

  /**
   * 「手指正落在播停 / 下一曲钮上」的标记（原型 `bindMiniDock` 首段对 `.mini-act` 做
   * `pointerdown` stopPropagation，注释原话：想按播放却把整条拖走了，是最典型的一次误触）。
   * RN 的父级 responder 没法阻止子级按下，所以反过来：子钮按下时置位，手势判定读到就让路；
   * 只在「还没成立」的判定里读，一旦已进入拖拽就不再打断。
   */
  const controlTouchRef = useRef(false)
  const handleControlTouchChange = useCallback((active: boolean) => {
    controlTouchRef.current = active
  }, [])

  /**
   * 松手：先定形态 / 侧边，再让位移归零。
   * - 已经贴边：过没过内容区中线就是「换不换边」的判据（原型 release 里 snapped 那一支）；
   * - 完整条：|dx| ≥ 24 才吸附（8–24 那一档算手抖，弹回原形、什么都不做，这一下也不算点击）。
   * 换边时先把基准 left 换成新侧，同时把位移改写成「相对新基准的同一视觉位置」，随后归零 ——
   * 观感就是从旧边滑到新边（原型清 inline transform、靠 left 的 transition 滑过去，没有多余一跳）。
   */
  const commitRef = useRef<(dx: number) => void>(() => {})
  commitRef.current = (dx: number) => {
    setDragging(false)
    const live = liveRef.current
    if (live.snapped) {
      const oldBase = dotLeftOf(live.side, live.windowWidth, live.dotSize)
      const center = oldBase + pullRef.current + live.dotSize / 2
      const next: NewUiMiniSide = center < live.windowWidth / 2 ? 'left' : 'right'
      /* 换边要补偿位移：基准从旧侧跳到新侧，位移若还留在拖拽值上，新基准 + 旧位移会把圆点推到
         屏外（右侧换边尤其明显），再飞回来。先按旧基准量出此刻的视觉位置，再改写成相对新基准的
         同一位置（Animated 值可同步写，setSide 要到下一帧才渲染），换基准那一帧视觉才不动。
         同侧则沿用现有行为：不动基准，直接从当前位移补间到 0。 */
      if (next !== live.side) {
        const nextBase = dotLeftOf(next, live.windowWidth, live.dotSize)
        dragX.setValue(oldBase + pullRef.current - nextBase)
      }
      setSide(next)
      setNewUiMiniSide(next)
    } else if (Math.abs(dx) >= MINIBAR.commit) {
      const next: NewUiMiniSide = dx < 0 ? 'left' : 'right'
      setSide(next)
      setNewUiMiniSide(next)
      // 用户自己拖到边缘吸附：这一帧没有整页重铺，走 morphMs 的动画（instant=false）
      applySnap(true, false)
    }
    pullRef.current = 0
    Animated.timing(dragX, {
      toValue: 0,
      duration: MINIBAR.morphMs,
      easing: SNAP_EASE,
      useNativeDriver: false,
    }).start()
  }

  const responder = useRef(
    PanResponder.create({
      // 起手与点击一律先让给内层 Pressable（整条点击、三颗动作钮都还在）
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      // 只有「横向优势」的移动才认成拖拽：竖着划仍交给页面滚（原型 touch-action:pan-y 的等价物）；
      // 压在动作钮上的这一下不参与拖拽（原型 stopPropagation 的等价物，见 controlTouchRef）
      onMoveShouldSetPanResponder: (_, g) =>
        !controlTouchRef.current &&
        Math.abs(g.dx) >= MINIBAR.slop &&
        Math.abs(g.dx) > Math.abs(g.dy),
      onMoveShouldSetPanResponderCapture: (_, g) =>
        !controlTouchRef.current &&
        Math.abs(g.dx) >= MINIBAR.slop &&
        Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderGrant: () => {
        setDragging(true)
        dragX.stopAnimation()
      },
      onPanResponderMove: (_, g) => {
        const live = liveRef.current
        const next = pullOf(g.dx, live.snapped, live.side, live.windowWidth, live.dotSize)
        pullRef.current = next
        dragX.setValue(next)
      },
      onPanResponderRelease: (_, g) => { commitRef.current(g.dx) },
      // 被系统 / 上层打断（比如来电遮罩）：直接弹回，不留半点位移
      onPanResponderTerminate: () => {
        setDragging(false)
        pullRef.current = 0
        Animated.timing(dragX, {
          toValue: 0,
          duration: MINIBAR.morphMs,
          easing: SNAP_EASE,
          useNativeDriver: false,
        }).start()
      },
      // 拖到一半不许被下方滚动容器抢走（横向优势手势一旦成立就归本条）
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
    }),
  ).current

  /* ---- 两态交叉的一点点收放（那 200ms 用缩放 + 交叉淡化表达，不逐帧改宽高） ---- */
  const fullScale = morph.interpolate({ inputRange: [0, 1], outputRange: [FULL_SCALE_FROM, 1] })
  const snappedOpacity = morph.interpolate({ inputRange: [0, 1], outputRange: [1, 0] })
  const snappedScale = morph.interpolate({ inputRange: [0, 1], outputRange: [1, SNAPPED_SCALE_FROM] })
  const translateY = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [layerHeight * HIDE_OFFSET_RATIO, 0],
  })

  // 拖拽中整条压到 .94（原型 .minibar.is-dragging，transition 关掉、跟手）
  const dragDim = dragging ? MINIBAR.dragOpacity : 1

  /**
   * 点击分岔（原型 miniBarClick L2634-2640）：
   * - 圆点 → 展开回完整条，**不**进播放页；
   * - 完整条 → 打开现有全屏播放器（行为不变）。
   */
  const handleFullPress = () => { pushNewUiPlayer(componentId) }
  // 用户自己点圆点展开：同样没有整页重铺，照旧走 morphMs 的动画
  const handleSnappedPress = () => { applySnap(false, false) }

  if (!contentShown || view == null) return null

  return (
    <Animated.View
      // 退场期间整条不吃触摸：用户点不到一条正在消失的条；空档处一律放行给页面
      pointerEvents={hasSong ? 'box-none' : 'none'}
      style={[
        styles.root,
        { bottom, height: layerHeight, opacity: fade, transform: [{ translateY }] },
      ]}
    >
      {/* 拖拽位移单独一层：与进场的 translateY 分开，两个驱动源互不串 */}
      <Animated.View
        pointerEvents="box-none"
        style={[StyleSheet.absoluteFill, { transform: [{ translateX: dragX }] }]}
      >
        <Animated.View
          pointerEvents={snapped ? 'none' : 'auto'}
          style={[styles.fullLayer, { opacity: morph, transform: [{ scale: fullScale }] }]}
          {...responder.panHandlers}
        >
          <View style={{ opacity: dragDim }}>
            <Minibar
              artSeed={view.artSeed}
              artUri={view.artUri}
              title={view.title}
              artist={view.artist}
              sourceLabel={view.sourceLabel}
              sourceTint={view.sourceTint}
              qualityLabel={view.qualityLabel}
              playing={view.playing}
              ratio={view.ratio}
              barHeight={barHeight}
              onPress={handleFullPress}
              onTogglePlay={togglePlay}
              // playNext 首参是 isAutoToggle（布尔），不能直接接 onPress（会收到事件对象），
              // 必须无参转接——同播放页口径（screens/Player/index.tsx L258）
              onPlayNext={() => { void playNext() }}
              // 动作钮按下期间让出手势判定（原型 .mini-act stopPropagation 的等价物）
              onControlTouchChange={handleControlTouchChange}
            />
          </View>
        </Animated.View>

        <Animated.View
          pointerEvents={snapped ? 'auto' : 'none'}
          style={[
            styles.snappedLayer,
            side === 'left' ? { left: MINIBAR.snappedEdge } : { right: MINIBAR.snappedEdge },
            { opacity: snappedOpacity, transform: [{ scale: snappedScale }] },
          ]}
          {...responder.panHandlers}
        >
          <View style={{ opacity: dragDim }}>
            <MinibarSnapped
              artSeed={view.artSeed}
              artUri={view.artUri}
              playing={view.playing}
              ratio={view.ratio}
              size={dotSize}
              onPress={handleSnappedPress}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  )
}

MinibarHost.displayName = 'NewUIMinibarHost'

const styles = StyleSheet.create({
  /**
   * 挂点本体：整块占满屏宽、贴着安全区之上的那一条（高度按档取完整条高；圆点比它矮一点，
   * 两者都底对齐 —— 与原型 `bottom` 固定、两态各自 height 的口径一致）。
   * 显式层叠数：原型 .minibar z-index:68，压在滚动内容与推入层内容之上、弹层（80）之下。
   */
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: Z_LAYER.minibar,
  },
  /** 完整条：左右各留 12（.minibar left/right 12），底对齐 */
  fullLayer: {
    position: 'absolute',
    left: MINIBAR.marginX,
    right: MINIBAR.marginX,
    bottom: 0,
  },
  /** 磁吸圆点：贴哪一侧那一线由渲染期的 left / right 给（side === 'left' 走 left） */
  snappedLayer: {
    position: 'absolute',
    bottom: 0,
  },
})
