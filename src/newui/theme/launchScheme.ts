import AsyncStorage from '@react-native-async-storage/async-storage'
import { Appearance } from 'react-native'

import type { ThemeMode, ThemeScheme } from './types'

/**
 * 新 UI 主题的「导航侧」共通件（QA 2026-10-14 D-10：冷启动闪黑底）。
 * 转场 options 的 componentBackgroundColor / navigationBar 色在原生层先行渲染，
 * JS 挂载后的 mergeOptions 校正必然晚一帧——此前五处入口都硬编 'dark' 打底，
 * 浅色用户冷启动就看到一帧黑底。本轮改为：
 * - setRoot 前 await 读一次持久化模式（AsyncStorage 毫秒级，root 未设时原生屏还在，
 *   首帧即落在用户真实模式）；
 * - push 类转场发生在运行中，直接用内存快照（ThemeProvider 每次解析后回写）。
 */

/** 持久化 key 单一定义（原在 ThemeProvider，本轮收口到共通件） */
export const NEW_UI_THEME_STORAGE_KEY = 'newui.themeMode'

export const isThemeMode = (value: unknown): value is ThemeMode =>
  value === 'light' || value === 'dark' || value === 'system'

/** mode → 渲染 scheme：system 时跟随 Appearance，深浅未知回退 dark（与 ThemeProvider 同口径） */
export const resolveScheme = (mode: ThemeMode): ThemeScheme =>
  mode === 'system' ? (Appearance.getColorScheme() === 'light' ? 'light' : 'dark') : mode

/** 出厂缺省档 = ThemeProvider 的 useState('light')，快照初值与之对齐 */
const DEFAULT_SCHEME: ThemeScheme = 'light'

let cachedScheme: ThemeScheme = DEFAULT_SCHEME

/** ThemeProvider 解析出 scheme 后回写快照；push 转场同步读它 */
export const cacheNewUiScheme = (scheme: ThemeScheme) => {
  cachedScheme = scheme
}

export const getCachedNewUiScheme = (): ThemeScheme => cachedScheme

/** 冷启动读持久化模式并解析成 scheme；读失败/无存值回出厂缺省档（与 ThemeProvider 兜底一致） */
export const readPersistedNewUiScheme = async (): Promise<ThemeScheme> => {
  try {
    const saved = await AsyncStorage.getItem(NEW_UI_THEME_STORAGE_KEY)
    return isThemeMode(saved) ? resolveScheme(saved) : DEFAULT_SCHEME
  } catch {
    return DEFAULT_SCHEME
  }
}
