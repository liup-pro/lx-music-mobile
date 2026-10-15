import { useLrcPlay } from '@/plugins/lyric'
import { usePlayMusicInfo } from '@/store/player/hook'

import { LrcFloat } from '@/newui/components'
import { useLrcFloatToggle, useNowPlaying } from '@/newui/hooks'
import { PLATFORM_TINTS, useTheme, type PlatformTintKey } from '@/newui/theme'

// 直连 entry 而非 '@/newui/navigation' 桶口：避免 navigation/index → register → screens → 本文件的循环引用
import { pushNewUiPlayer } from '@/newui/navigation/entry'

export interface LrcFloatDockProps {
  /** MainScreen 的 RNN 组件 ID（点按气泡打开的播放页挂载点） */
  componentId: string
}

/**
 * 主屏上的 LRC 浮窗挂点（原型 .lrc-float：常驻 .screen 内、可拖动的歌词气泡；U61 轮）。
 * 单独成容器组件（同 MinibarDock 口径）：逐行歌词订阅只让它重渲染，
 * MainScreen 与各 Tab 页面完全不感知歌词行变化。
 *
 * 显隐对回原型 syncFloat（app.js L1886：floatOn && 有歌 && 播放页未打开）：
 * 前两项在这里直算；第三项由架构天然满足——播放页是 push 进来的独立整屏、盖在主屏之上，
 * 气泡随主屏一起被压住（进入播放页即「自动隐藏」，返回后自动找回）。
 * 已知缺口（与原型不同）：原型里气泡 z-index 75 恒高于搜索层 / 歌单详情层（同为 .pl-layer
 * z-index 66），那两层打开时气泡仍浮着；RN 这两屏是 push 的独立屏，会盖住主屏上的气泡。
 * 数据只读订阅既有 plugins/lyric 与 store/player；开关态走 hooks/useLrcFloat 共享模块，
 * 与播放页浮窗钮是同一个开关。
 */
export const LrcFloatDock = ({ componentId }: LrcFloatDockProps) => {
  const theme = useTheme()
  const nowPlaying = useNowPlaying()
  const playMusicInfo = usePlayMusicInfo()
  const { enabled, toggle } = useLrcFloatToggle()
  // 当前高亮歌词行（原型 $('#lyricScroll .ln.on') 的文字）；无歌词时回落曲名（syncFloat L1890）
  const { text } = useLrcPlay()

  // 'source' in 收窄：下载项（ListItem）无 source（口径同 MinibarDock / 播放页）
  const currentMusic = playMusicInfo.musicInfo
  const sourceKey = currentMusic && 'source' in currentMusic ? currentMusic.source : undefined
  // 平台 tint（原型 SOURCES[source].tint）；无平台来源（本地曲等）回落品牌色，
  // 即 CSS 里 var(--tint, var(--brand)) 的兜底（原型气泡与浮窗钮都不因缺平台色消失）
  const tint =
    sourceKey != null
      ? PLATFORM_TINTS[sourceKey as PlatformTintKey] ?? theme.colors.brand
      : theme.colors.brand

  return (
    <LrcFloat
      // 原型 syncFloat L1886：开关开 + 有曲目才示出（无歌时开关仍可开，但不出现）
      visible={enabled && nowPlaying.hasSong}
      text={text.length > 0 ? text : nowPlaying.title}
      tint={tint}
      // 点按打开全屏播放页（原型 openLayer(player())，app.js L1930）
      onOpenPlayer={() => pushNewUiPlayer(componentId)}
      // 关闭钮 = 翻转开关（含 toast 与浮窗钮图标同步，原型 #lfClose → toggleFloat，L2622）
      onClose={toggle}
    />
  )
}

LrcFloatDock.displayName = 'NewUILrcFloatDock'
