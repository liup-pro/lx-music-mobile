import { StyleSheet, View } from 'react-native'

import { getPlayQuality } from '@/core/music/utils'
import { playNext, togglePlay } from '@/core/player/player'
import { usePlayMusicInfo, useProgress } from '@/store/player/hook'
import { useSettingValue } from '@/store/setting/hook'

import { Minibar } from '@/newui/components'
import { QUALITY_LABEL, getPlatformMeta } from '@/newui/const'
import { useFavoriteToggle, useNowPlaying } from '@/newui/hooks'
import { MINIBAR, PLATFORM_TINTS, TAB_BAR, Z_LAYER, type PlatformTintKey } from '@/newui/theme'
import { isOnlineMusic } from '@/newui/utils'

// 直连 entry 而非 '@/newui/navigation' 桶口：避免 navigation/index → register → screens → 本文件的循环引用
import { pushNewUiPlayer } from '@/newui/navigation/entry'

export interface MinibarDockProps {
  /** MainScreen 的 RNN 组件 ID（push 播放页的挂载点） */
  componentId: string
  /** 底部安全区（同 TabBar 口径） */
  bottomInset: number
}

/**
 * 主屏上的迷你播放条挂点（对应原型 .minibar 常驻 .screen 的形态）。
 * 单独成容器组件：每秒的进度订阅只让它重渲染，
 * MainScreen 与各 Tab 页面完全不感知播放进度（性能口径）。
 * 数据全部只读取自 store/player；动作走 core/player 现成函数。
 */
export const MinibarDock = ({ componentId, bottomInset }: MinibarDockProps) => {
  const nowPlaying = useNowPlaying()
  const playMusicInfo = usePlayMusicInfo()
  const { nowPlayTime, maxPlayTime } = useProgress()
  const playQuality = useSettingValue('player.playQuality')
  const { loved, toggle: toggleFav } = useFavoriteToggle()

  // 没有在播曲目、或取不到曲目来源（理论不会发生）时不出现（原型只在 state.song 存在时 show）
  // PlayMusic 联合里下载项（ListItem）无 source：用 'source' in 收窄，
  // 与旧口径一致（core/init/player/playProgress.ts、newui/hooks/useMyPlaylists.ts）
  const currentMusic = playMusicInfo.musicInfo
  const sourceKey = currentMusic && 'source' in currentMusic ? currentMusic.source : undefined
  if (!nowPlaying.hasSong || sourceKey == null) return null

  const sourceMeta = getPlatformMeta(sourceKey)
  const ratio = maxPlayTime > 0 ? Math.min(nowPlayTime / maxPlayTime, 1) : 0
  // 音质标签回显「实际生效档」而不是设置里存的那档（2026-10-13 兜底条）：
  // 直接调用播放核心取地址用的同一个 getPlayQuality（core/music/utils.ts L218-230，只读复用），
  // 它按曲目音质 × 音源档位表自动降档；本地/下载曲目无此降档语境，仍按所选档显示。
  const qualityLabel = QUALITY_LABEL[
    currentMusic != null && isOnlineMusic(currentMusic)
      ? getPlayQuality(playQuality, currentMusic)
      : playQuality
  ]

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: bottomInset + TAB_BAR.height + MINIBAR.gapAboveTabBar }]}
    >
      <Minibar
        artSeed={`album:${nowPlaying.album || nowPlaying.title}`}
        artUri={nowPlaying.picUrl ?? undefined}
        title={nowPlaying.title}
        artist={nowPlaying.singer}
        sourceLabel={sourceMeta.short}
        sourceTint={PLATFORM_TINTS[sourceKey as PlatformTintKey]}
        qualityLabel={qualityLabel}
        playing={nowPlaying.playing}
        loved={loved}
        ratio={ratio}
        onPress={() => pushNewUiPlayer(componentId)}
        onTogglePlay={togglePlay}
        onToggleFav={toggleFav}
        // playNext 首参是 isAutoToggle（布尔），不能直接接 onPress（会收到事件对象），
        // 必须无参转接——同播放页口径（screens/Player/index.tsx L258）
        onPlayNext={() => { void playNext() }}
      />
    </View>
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
