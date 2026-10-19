/**
 * 电台单集的**真实播放**。
 *
 * 本轮用户拍板：「接上，能真听」——③ 给每条单集都带的音频直链 `episodeUrl` 不再只是透传字段，
 * 点单集要真出声，屏上的进度、播停、倍速、后退 15/前进 30 全部换成真音频驱动的状态。
 *
 * ## 一、只用既有能力（不新增依赖、不改播放核心）
 * - 引擎就是项目里已在用的 `react-native-track-player`（fork 版，`src/plugins/player` 包的那一层）。
 *   本机只有这一个能播外部 URL 的音频引擎，所以**不需要新增依赖**。
 * - 初始化走既有 `initial()`，入参与 `src/core/player/player.ts` 的 `handlePlay` 那五行设置一致；
 *   播停、跳转、时长与位置、倍速走既有 `setPlay / setPause / setCurrentTime / getPosition / getDuration / setPlaybackRate`。
 * - `TrackPlayer` 只直接调用队列级的 `reset / add / getState / getCurrentTrack / getTrack / updateNowPlayingMetadata`
 *   ——既有导出里没有等价封装。这些都是**往既有能力里新增一次调用**：`src/core/`、`src/plugins/`、`src/store/`
 *   里既有函数的签名、行为、内部逻辑一律未改动，`@/store/setting/state` 只读。
 *
 * ## 二、与歌曲那侧的互斥口径（为什么这样不伤歌曲链路）
 * 1. **单集不是歌曲**：不替单集造 `musicId` / `original` / `source` 这类歌曲字段，不进播放列表面板、
 *    不进播放历史、不进 `playList`。这条 track 只带 `url / title / artist / artwork / duration`；
 *    id 形如 `podcast#<集id>__//<序号>`，**永远不会以 `//default` 结尾**，歌曲那侧的判空规则
 *    （`isEmpty` / `isTempId`）命中不到它，它也就不可能被当成歌曲记进任何歌曲账本。
 * 2. **抢占前先停歌**：起播单集前调既有 `setPause()`。不走既有 `stop()`——`setStop()` 内部会
 *    `skipToNext()`，那一下会踩到既有 `playerEnded → playNext` 的自动连播（本仓 UI 从没调用过 `stop()`，
 *    属未验证路径），电台不该替歌曲把下一首顶出来。
 * 3. **把 `global.lx.playerTrackId` 写回它自己的初值 `''`**（本轮唯一一次写既有全局，且只写回初值）。
 *    目的：让 `src/plugins/player/service.ts` 的 PlaybackState 处理在第一行 `isTempId()` 就早退，
 *    于是 `playerState.isPlay`、`playProgress` 的每秒轮询与 `savePlayInfo` 都不会被单集带着跑——
 *    不这么做的话，单集的秒数会被当成歌曲进度写进磁盘（正是用户点名的「混污」）。
 *    `''` 是 `src/config/globalData.ts` 给这个字段的初值，不是我们发明的中间态。
 * 4. **谁占着队列谁说话，电台只借不用**：单集只在 `EpisodeScreen` 挂载期间占队列（原型
 *    `closeEpisodeLayer` 就是关层即停），离场 `reset()` 清空队列。歌曲那侧随后 `add/skip` 会自我对齐
 *    （`src/plugins/player/playList.ts` 的 `list` 与原生队列的长度差在下一次点歌时自愈，已逐行推演）。
 *    若歌曲那侧抢在单集之前改了队列，我们的 `playback-track-changed` 监听会立刻认出「当前轨不是我们的」并让位。
 * 5. **通知栏/锁屏的远程控制本轮不归电台管（已知限制，非待办）**：既有 `src/plugins/player/service.ts`
 *    把远控按键一律接到**歌曲**那套逻辑上，本轮不许改它，电台这侧也不去截这些事件。用户点名的三条逐条记明
 *    （行号以 `service.ts` 现状为准），用户 **2026-10-19 拍板：记为已知限制，待真机验收**
 *    ——不是待办、不是待决策；同一条另记在 `PROTOTYPE_INVENTORY.md` 第七节 7.9：
 *    - **RemotePlay / RemotePause**（`service.ts:31-34` / `:36-39` → 歌曲的 `play() / pause()`）：单集播着时
 *      按锁屏播放，最坏结果是歌曲重新取流并接管队列，电台这侧由 `reclaimOwnership()` 立刻认出
 *      「当前轨不是我们的」并让位，不会出现两边抢队列。
 *    - **RemoteStop（通知栏/锁屏那颗「停止」）= 退出应用，不是停单集**：`service.ts:51-54` 把它接到
 *      `handleExitApp('Remote Stop')`（本体在 `service.ts:21`，收掉整个应用）。单集播着时按它，
 *      应用直接被收走——**它不会只把这一集停下来**，电台那条队列连同「关层时落剩余」那一步都跟着没了
 *      （落盘只挂在单集屏卸载那条路径上，被 `handleExitApp` 收掉时不保证走到）。
 *    - **RemoteNext / RemotePrevious（通知栏「上一首 / 下一首」）打到歌曲那套 `playNext / playPrev`**
 *      （`service.ts:41-44` / `:46-49`）：单集在队列里只有一条，这两下推进的是**歌曲**那侧的播放列表
 *      （`src/core/player/player.ts`），最坏结果是歌曲取流并接管队列、单集让位；**不是**「上一集 / 下一集」。
 *    - （顺带记一句，不在用户点名的三条里，但同在 `service.ts` 的远控表）通知栏进度条拖动
 *      **RemoteSeek**（`service.ts:75-77`）会被喂给歌曲那侧的 `app_event.setProgress`，
 *      也就是拿单集的位置去写歌曲进度——与下面那条指针污染同族，一并待真机看。
 *    - **指针污染那一小于一条的窗口**：起播序列里 `add([单集])` 与我们的 `neutralizeSongPointer()` 之间
 *      只让一拍（`ONE_TICK_MS = 0`），若 `service.ts` 的 `PlaybackTrackChanged` 恰好在这段间隙续跑，
 *      `global.lx.playerTrackId` 会被写成我们那条 `podcast#…` id；随后每秒取样里的 `reclaimOwnership()`
 *      会再按回 `''` 兜住。窗口宽度 = 一条 track 的在飞时间（亚秒级），真机是否真被踩到属本轮不可证的一档。
 * 6. **定时停止播放生效中，电台不起播**（用户 2026-10-19 拍板「加一道闸，armed 时不起播」）：
 *    起播原语 `startPodEpisode` / `resumePodEpisode` 在最前面读一次 `global.lx.isPlayedStop`
 *    （歌曲那侧「定时停止播放」的账本，`src/core/player/timeoutExit.ts` 写），为 true 就不进队列、不出声，
 *    只给人话提示。闸落在**原语**这一层而非只落在屏上那颗钮，所以任何调用点（单集屏那颗、以后新增的哪颗）
 *    都必然过；详情屏那颗「继续播放 / 播最新单集」只做导航、本身不发音，终点还是单集屏这一下。
 *    为什么这一条要紧：`service.ts:108 / :117` 有 `if (global.lx.isPlayedStop) return handleExitApp('Timeout Exit')`
 *    ——armed 时真把单集推起来，播放器状态一变就可能把整个应用退出。本闸不去改那两处既有行为，只是不去踩它。
 *    `isPlayedStop` 电台这侧**只读不写**（写它等于替用户取消定时关闭）。
 *
 * ## 三、队列时序（每一步都对着既有实现挑过）
 * `setPause()`（停歌）→ `reset()` → `add([单集])` → 让一拍 → 写回 `playerTrackId = ''`
 * → `setCurrentTime(起点)` → `setPlaybackRate(倍速)` → `setPlay()` → `updateNowPlayingMetadata()`。
 * `reset()` 在原生侧（`ExoPlayback.reset()`）会**先把 `lastKnownWindow` 置为 `INDEX_UNSET`**，
 * 所以紧接着的那次 `onMediaItemTransition` 里 `prevIndex == null`，`MusicManager.onTrackUpdate`
 * 便不会往事件里放 `track`；`service.ts` 的 `if (info.track == null) return` 因此早退，
 * 不会对单集做它专门的「临时暂停」。加完 track 后再让一拍才写指针，是为了压过
 * `service.ts` 那句 `global.lx.playerTrackId = await getCurrentTrackId()` 的异步续跑；
 * 之后每秒的轮询里再按回一次，兜住任何晚到的重写。
 */
import type { EmitterSubscription } from 'react-native'

import TrackPlayer, { Event, State } from 'react-native-track-player'

import { NEW_UI_POD_EP_TOAST } from '@/newui/const/radioDetail'
import { showNewUiToast } from '@/newui/utils/newUiToast'

import {
  getDuration,
  getPosition,
  initial as playerInitial,
  isInitialized,
  setPause,
  setPlay,
  setPlaybackRate,
  setCurrentTime,
} from '@/plugins/player'
import settingState from '@/store/setting/state'

/**
 * 播放阶段。`loading` = 想出声但还在连/缓冲；`ended` = 自然播到尽头（原型 `epTick` 到点钳住那一支）；
 * `failed` = 播放器报错（直链失效这类），屏上不为此加新视觉，玩家钮回到「播放」让用户自己重试。
 */
export type PodPlayerPhase = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'failed'

/** 起播一集所需的全部输入（全部来自 ③ 的视图模型，屏上不现编） */
export interface PodEpisodeSource {
  /** 单集 id（③ 的 `trackId` 转串）：队列归属凭据 */
  episodeId: string
  /** 节目 id：本机进度的登记键（口径本轮不动） */
  showId: string
  /** 集名 → 通知栏标题 */
  title: string
  /** 节目名 → 通知栏副标题（Apple 的播放器位不写类别词） */
  showName: string
  /** 封面（是否进通知栏照歌曲那侧同一既有设置 `player.isShowNotificationImage`） */
  artworkUrl: string
  /** ③ 给的那条音频直链；空串 = 接口没给，这一集放不出来 */
  url: string
  /** ③ 的 `trackTimeMillis` 换算秒数；播放器还没给出时长前，屏上「总时长」用它 */
  durationHintSec: number
}

/** 屏上真正要看的那几个数（模块级快照，与 `localState.ts` 同一套「快照 + 订阅集合 + notify」姿势） */
export interface PodPlayerSnapshot {
  /** 当前占着播放器的那一集；没有则空串 */
  episodeId: string
  showId: string
  phase: PodPlayerPhase
  /** 已播到第几秒（真音频位置，取整） */
  position: number
  /** 播放器实测总时长（取整）；未就绪为 0，界面回落 `durationHintSec` */
  duration: number
  /** 生效中的倍速 */
  rate: number
  /** 这一集有没有直链（false 时屏上那颗播放钮按下去不出声，本轮不加新视觉态） */
  hasUrl: boolean
}

const IDLE_SNAPSHOT: PodPlayerSnapshot = {
  episodeId: '',
  showId: '',
  phase: 'idle',
  position: 0,
  duration: 0,
  rate: 1,
  hasUrl: false,
}

/** 每秒取样一次（原型 `setInterval(epTick, 1000)` 的同构位置）；只在数值真的变了才 notify */
const POLL_INTERVAL_MS = 1000
/**
 * 加完 track 后让一拍，好把 `service.ts` 那句 `await getCurrentTrackId()` 的异步续跑压在过去。
 * 一拍（macrotask）就够，不是等待时长——原生事件本身已经在 `add` 之前落定了。
 */
const ONE_TICK_MS = 0
/** 连续取不到播放器数值到这个次数，就认这一集放不出来（直链 404 时 Exo 会停在 None/Ready） */
const POLL_FAIL_LIMIT = 3

type Listener = () => void

let snapshot: PodPlayerSnapshot = IDLE_SNAPSHOT
const listeners = new Set<Listener>()

const notify = (): void => {
  for (const listener of [...listeners]) listener()
}

/** 只在真有变化时换快照对象并 notify（每秒轮询不该让屏白重渲染一次） */
const commit = (patch: Partial<PodPlayerSnapshot>): void => {
  const next = { ...snapshot, ...patch }
  if (
    next.episodeId === snapshot.episodeId &&
    next.showId === snapshot.showId &&
    next.phase === snapshot.phase &&
    next.position === snapshot.position &&
    next.duration === snapshot.duration &&
    next.rate === snapshot.rate &&
    next.hasUrl === snapshot.hasUrl
  ) return
  snapshot = next
  notify()
}

/* ================= 队列归属（模块级，不进 React） ================= */

/** 每次启动/让位都自增：在途的异步启动序列凭它作废自己，避免慢网络回来把新的一集顶掉 */
let startToken = 0
/** 我们塞进队列的那条 track 的 id；不是它 = 队列已被歌曲那侧拿走 */
let activeTrackId: string | null = null
/** 用户的意图：true = 该出声（用来区分「缓冲中」与「用户暂停」） */
let desiredPlaying = false
/** 已自然播到尽头 */
let reachedEnd = false
/** 上一集用过的倍速（原型 `epState.rate` 跨集留存，只有 `t/playing/idx` 每次重置） */
let lastRate = 1
let pollTimer: ReturnType<typeof setInterval> | null = null
let pollFailures = 0
let trackSeq = 0
const subscriptions: EmitterSubscription[] = []

const stopPoll = (): void => {
  if (pollTimer == null) return
  clearInterval(pollTimer)
  pollTimer = null
}

const startPoll = (): void => {
  if (pollTimer != null) return
  pollFailures = 0
  pollTimer = setInterval(() => { void tick() }, POLL_INTERVAL_MS)
  void tick()
}

const sleep = (ms: number): Promise<void> => new Promise(resolve => { setTimeout(resolve, ms) })

/** 单集 track 的 id：带 `__//` 是照歌曲那侧的分段写法，但结尾绝不是 `default`，歌曲的判空规则碰不到它 */
const nextTrackId = (episodeId: string): string => `podcast#${episodeId}__//${String(++trackSeq)}`

/** 交还队列时的中立姿势：把指针按回它自己的初值（理由见文件头第二节第 3 条） */
const neutralizeSongPointer = (): void => {
  global.lx.playerTrackId = ''
}

/**
 * 认域：当前轨还是我们那条吗？
 * 是 → 顺手把 `playerTrackId` 按回初值（可能刚被 `service.ts` 读成陈旧歌曲 id）；
 * 不是（或被清空）→ 单集让位，本机不再主张队列。
 */
const reclaimOwnership = async(): Promise<void> => {
  if (activeTrackId == null) return
  try {
    const index = await TrackPlayer.getCurrentTrack()
    const track = index == null ? null : await TrackPlayer.getTrack(index)
    if (track?.id === activeTrackId) {
      neutralizeSongPointer()
      return
    }
  } catch {
    // 取不到就当没被拿走，交给下一次轮询判断
    return
  }
  if (activeTrackId != null) {
    stopPoll()
    activeTrackId = null
    desiredPlaying = false
    reachedEnd = false
    commit({ ...IDLE_SNAPSHOT, rate: lastRate })
  }
}

/* ================= 播放器取样 ================= */

const phaseFromState = (state: State): PodPlayerPhase => {
  if (reachedEnd) return 'ended'
  switch (state) {
    case State.Playing:
      return 'playing'
    case State.Buffering:
    case State.Connecting:
      return desiredPlaying ? 'loading' : 'paused'
    case State.Paused:
    case State.Ready:
    case State.Stopped:
    case State.None:
    default:
      return desiredPlaying ? 'loading' : 'paused'
  }
}

const tick = async(): Promise<void> => {
  if (activeTrackId == null) return
  // 先确认队列还归这一集（是 → 顺手把指针按回初值；不是 → 让位并停在这）
  await reclaimOwnership()
  if (activeTrackId == null) return
  try {
    const [state, position, duration] = await Promise.all([
      TrackPlayer.getState(),
      getPosition(),
      getDuration(),
    ])
    if (activeTrackId == null) return
    pollFailures = 0
    const realDuration = Math.round(duration)
    const realPosition = Math.round(position)
    // 到点钳住：既有事件里 Exo 会把 STATE_ENDED 报成 Stopped，但没有独立的「播完」事件保证到达，
    // 这里用「位置已到尽头且不再出声」自己认一次（原型 epTick 的那一支钳位）
    if (!reachedEnd && realDuration > 0 && realPosition >= realDuration - 1 && state !== State.Playing) {
      reachedEnd = true
      desiredPlaying = false
    }
    commit({
      position: reachedEnd ? (realDuration > 0 ? realDuration : snapshot.duration) : realPosition,
      duration: realDuration > 0 ? realDuration : snapshot.duration,
      phase: phaseFromState(state),
    })
  } catch {
    if (activeTrackId == null) return
    if (++pollFailures >= POLL_FAIL_LIMIT) {
      desiredPlaying = false
      stopPoll()
      activeTrackId = null
      commit({ phase: 'failed' })
    }
  }
}

/* ================= 事件监听（只在本模块主张队列时才有意义，常驻即可） ================= */

const ensureEventListeners = (): void => {
  if (subscriptions.length > 0) return
  subscriptions.push(TrackPlayer.addEventListener(Event.PlaybackTrackChanged, () => { void reclaimOwnership() }))
  subscriptions.push(TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async() => {
    if (activeTrackId == null) return
    reachedEnd = true
    desiredPlaying = false
    const duration = await getDuration().catch(() => 0)
    commit({ phase: 'ended', position: Math.round(duration) || snapshot.duration })
  }))
  subscriptions.push(TrackPlayer.addEventListener(Event.PlaybackError, () => {
    if (activeTrackId == null) return
    desiredPlaying = false
    stopPoll()
    commit({ phase: 'failed' })
  }))
}

/* ================= 定时停止播放闸门（文件头第二节第 6 条） ================= */

/**
 * 「定时停止播放」是不是正生效中（歌曲那侧的账本 `global.lx.isPlayedStop`，电台这侧**只读不写**：
 * 写它等于替用户取消定时）。为 true 时不起播单集：不进队列、不出声、一个快照字段都不动，只给人话提示。
 *
 * 为什么闸落在**起播原语**而不只落在屏上那颗钮：单集屏那颗、详情屏那颗钮的下游、以后任何调用起播/续播的点，
 * 都只有经过这里才可能出声——闸在原语这一层才谈得上「所有起播路径都过」。
 * 为什么提示也在这里发：闸把出声这条路堵死之后若没人吭声，用户按下去只当这颗钮坏了（无声失败）。
 * 提示走既有共通总线 `@/newui/utils/newUiToast`（由所在屏根层的 `NewUiToastHost` 承接），不新造浮层、不新增视觉态。
 * 为什么不新增一档相位：`failed` 专指「直链放不出来」，那颗钮在那一档的含义是「可以再按一次试试」；
 * 定时开着时再按一百次也不会好，把两件事塞进同一档等于把「可重试」的假象交给用户。
 * 本函数只在 `commit()` 之前返回，快照留在它原本那一档（`idle` / `paused` 都显「播放」），不是失败态。
 *
 * @returns true = 已被拦下（提示已就地发出），调用方必须原样返回、不要再往下走起播序列
 */
const blockedBySleepTimer = (): boolean => {
  if (!global.lx.isPlayedStop) return false
  showNewUiToast(NEW_UI_POD_EP_TOAST.sleepBlocked, 'long')
  return true
}

/* ================= 对外动作 ================= */

/** 快照（引用稳定，屏外/离场等非渲染处读它） */
export const getPodPlayerSnapshot = (): PodPlayerSnapshot => snapshot

/** 订阅播放态变化；返回退订（与 `localState.ts` 同一套「快照 + 订阅集合 + notify」姿势，本模块不读盘） */
export const subscribePodPlayer = (listener: Listener): (() => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * 起播一集：占队列 → 出声。
 * `startSec` 是「本机记的还差多少」换算出来的起点（原型 `openEpisode` 的那一句），0 = 从头。
 * **第一行就是定时停止播放那道闸**（见上面 `blockedBySleepTimer`）：被拦下时连 `++startToken` 都不做，
 * 免得把在途的上一趟起播无谓作废，快照也一个字段不动。
 */
export const startPodEpisode = async(
  source: PodEpisodeSource,
  options: { startSec?: number, rate?: number } = {},
): Promise<void> => {
  if (blockedBySleepTimer()) return
  const token = ++startToken
  const rate = options.rate ?? lastRate
  const startSec = Math.max(0, Math.round(options.startSec ?? 0))

  lastRate = rate
  stopPoll()
  reachedEnd = false
  desiredPlaying = true
  commit({
    episodeId: source.episodeId,
    showId: source.showId,
    phase: 'loading',
    position: startSec,
    duration: Math.max(0, Math.round(source.durationHintSec)),
    rate,
    hasUrl: source.url.length > 0,
  })

  if (source.url.length === 0) {
    // 接口没给直链：不放队列、不猜地址（本轮不接订阅源通道），只把播放钮留在原地
    desiredPlaying = false
    commit({ phase: 'failed' })
    return
  }

  ensureEventListeners()
  const trackId = nextTrackId(source.episodeId)
  try {
    if (!isInitialized()) {
      await playerInitial({
        volume: settingState.setting['player.volume'],
        playRate: settingState.setting['player.playbackRate'],
        cacheSize: settingState.setting['player.cacheSize'] ? parseInt(settingState.setting['player.cacheSize']) : 0,
        isHandleAudioFocus: settingState.setting['player.isHandleAudioFocus'],
        isEnableAudioOffload: settingState.setting['player.isEnableAudioOffload'],
      })
    }
    if (token !== startToken) return

    // 停歌（既有能力，理由见文件头第二节第 2 条）
    await setPause()
    if (token !== startToken) return

    // 队列整段清空，再只挂这一集：reset→add 的原生事件里 `track` 缺席，
    // 所以既有 service 的 track-changed 处理会早退，不会对单集做「临时暂停」
    await TrackPlayer.reset()
    if (token !== startToken) return
    await TrackPlayer.add([{
      id: trackId,
      url: source.url,
      title: source.title,
      artist: source.showName,
      artwork: settingState.setting['player.isShowNotificationImage'] && source.artworkUrl.length > 0 ? source.artworkUrl : undefined,
      duration: source.durationHintSec > 0 ? Math.round(source.durationHintSec) : undefined,
    }])
    if (token !== startToken) {
      // 途中有人接手了（多半是离场把播放器交还了）。只有队列已经不再归任何一集时，才由我们补一次清理，
      // 免得把接手那一位刚挂上的 track 一起摘掉。
      if (snapshot.episodeId.length === 0) void TrackPlayer.reset().catch(() => {})
      return
    }
    activeTrackId = trackId

    // 让一拍压过 service 那句异步读指针，再把指针按回初值（第二节第 3 条）
    await sleep(ONE_TICK_MS)
    if (token !== startToken) return
    neutralizeSongPointer()

    if (startSec > 0) await setCurrentTime(startSec)
    if (token !== startToken) return
    await setPlaybackRate(rate)
    if (token !== startToken) return
    // 起播途中用户按过暂停：track 已经挂上，就停在「暂停」这一档，别越过他的意图出声
    if (!desiredPlaying) {
      commit({ phase: 'paused' })
      startPoll()
      return
    }
    await setPlay()
    if (token !== startToken) return

    // 本项目 setupPlayer 关着 autoUpdateMetadata，通知栏得自己喂一次
    await TrackPlayer.updateNowPlayingMetadata({
      title: source.title,
      artist: source.showName,
      artwork: settingState.setting['player.isShowNotificationImage'] && source.artworkUrl.length > 0 ? source.artworkUrl : undefined,
      duration: source.durationHintSec > 0 ? Math.round(source.durationHintSec) : undefined,
    }, true).catch(() => {})
    if (token !== startToken) return

    startPoll()
  } catch {
    if (token !== startToken) return
    // 播放器侧起不来（无网络、解码器拒绝这条直链……）：认作放不出来，屏上那颗钮留在「播放」
    desiredPlaying = false
    activeTrackId = null
    stopPoll()
    commit({ phase: 'failed' })
  }
}

/** 暂停（真暂停：音频立刻不出声，位置留在原地） */
export const pausePodEpisode = async(): Promise<void> => {
  // 先记下意图：起播序列还在途中（track 尚未挂上）时，它会在出声前自己停住
  desiredPlaying = false
  if (activeTrackId == null) {
    if (snapshot.phase !== 'idle') commit({ phase: 'paused' })
    return
  }
  await setPause().catch(() => {})
  commit({ phase: reachedEnd ? 'ended' : 'paused' })
}

/**
 * 续播。`ended` 之后按它就从零起（原型 `epToggle`：`if (epState.t >= epSec()) epState.t = 0`）；
 * `failed` 之后按它就是拿原直链重试。
 * 续播同样要出声，所以同一道闸放在第一行（`pausePodEpisode` / `seekPodEpisode` / `setPodEpisodeRate`
 * 都不会让音频开始走，不过闸）。
 */
export const resumePodEpisode = async(): Promise<void> => {
  if (blockedBySleepTimer()) return
  if (activeTrackId == null) return
  desiredPlaying = true
  commit({ phase: 'loading' })
  try {
    if (reachedEnd) {
      reachedEnd = false
      await setCurrentTime(0)
      commit({ position: 0 })
    }
    await setPlay()
    await sleep(ONE_TICK_MS)
    neutralizeSongPointer()
    startPoll()
  } catch {
    desiredPlaying = false
    commit({ phase: 'failed' })
  }
}

/** 跳到第几秒（屏上的「后退十五秒 / 前进三十秒」与拖动进度都由这里落进真音频） */
export const seekPodEpisode = async(sec: number): Promise<void> => {
  if (activeTrackId == null) return
  const target = Math.max(0, Math.round(sec))
  if (reachedEnd && target < snapshot.duration) reachedEnd = false
  commit({ position: target, phase: reachedEnd ? 'ended' : snapshot.phase })
  await setCurrentTime(target).catch(() => {})
}

/** 倍速：既有 `setPlaybackRate`（= `TrackPlayer.setRate`），未起播时先记着，起播时一并生效 */
export const setPodEpisodeRate = async(rate: number): Promise<void> => {
  lastRate = rate
  commit({ rate })
  if (activeTrackId == null) return
  await setPlaybackRate(rate).catch(() => {})
}

/**
 * 交还播放器（离场、让位）：只有还归这一集时才动手。
 * `reset()` 清空队列 + 把倍速按回既有歌曲设置，指针按回初值，快照回 idle。
 */
export const releasePodEpisode = async(episodeId: string): Promise<void> => {
  if (snapshot.episodeId !== episodeId || snapshot.phase === 'idle') return
  ++startToken
  stopPoll()
  const wasOurs = activeTrackId != null
  activeTrackId = null
  desiredPlaying = false
  reachedEnd = false
  commit({ ...IDLE_SNAPSHOT, rate: lastRate })
  if (!wasOurs) return
  try {
    await TrackPlayer.reset()
  } catch {
    // 队列已经不在我们手里，不必再补刀
  }
  await sleep(ONE_TICK_MS)
  // 倍速是播放器级参数，交还时把歌曲那侧的值放回去
  await setPlaybackRate(settingState.setting['player.playbackRate']).catch(() => {})
  neutralizeSongPointer()
}

/** 电台这侧此刻是不是正占着播放器（供调用点自查，不参与渲染） */
export const isPodEpisodeActive = (): boolean => activeTrackId != null && snapshot.phase !== 'idle'
