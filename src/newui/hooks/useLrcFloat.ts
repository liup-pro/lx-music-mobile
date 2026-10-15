import { useSyncExternalStore } from 'react'

import { NEW_UI_PLAYER_LRC_FLOAT_TOAST } from '@/newui/const'
import { showNewUiToast } from '@/newui/utils'

/**
 * 「LRC 浮窗」开关（原型 app.js state.floatOn，L1582 初始 false；U61 轮）。
 * 主屏气泡（screens/Main/LrcFloatDock）与播放页工具行浮窗钮（screens/Player）分属两棵
 * 挂载树，却要读写同一个开关，按「跨页面共享状态封装为独立模块」准则收敛到此处
 * （与 playlistTagSelection 同款模块级 store + useSyncExternalStore）。
 * 只活在内存、不做持久化：原型每次启动都是 false，这里照办。
 * 注意与系统桌面歌词的开关不是一条链路——那条走设置键 desktopLyric.enable
 * （hooks/useDesktopLyricToggle），互不影响。
 */
let floatOn = false
const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = (): boolean => floatOn

/**
 * 翻转浮窗开关（唯一写入口：浮窗钮与气泡关闭钮共用，原型 app.js L2620 / L2622 都挂 toggleFloat）。
 * 反馈文案逐字取自原型 L1904（NEW_UI_PLAYER_LRC_FLOAT_TOAST）；
 * 不做「有没有在播歌」的前置拦截——原型开关与显隐本就是两回事，无歌时开了也不出现，
 * 显示条件由 Dock 侧按 syncFloat 口径（floatOn && 有歌）直算。
 */
export const toggleLrcFloat = () => {
  floatOn = !floatOn
  listeners.forEach(listener => listener())
  showNewUiToast(floatOn ? NEW_UI_PLAYER_LRC_FLOAT_TOAST.on : NEW_UI_PLAYER_LRC_FLOAT_TOAST.off)
}

/**
 * 播放页浮窗钮（#btnFloat）与主屏气泡的开关回显：
 * enabled 供钮换图标（float ↔ floatOn）与 aria、供 Dock 判显隐；toggle 即上面那条唯一写入口。
 */
export const useLrcFloatToggle = (): { enabled: boolean, toggle: () => void } => {
  const enabled = useSyncExternalStore(subscribe, getSnapshot)
  return { enabled, toggle: toggleLrcFloat }
}
