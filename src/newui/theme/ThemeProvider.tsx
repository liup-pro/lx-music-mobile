import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react'
import { useColorScheme } from 'react-native'

import { cacheNewUiScheme, isThemeMode, NEW_UI_THEME_STORAGE_KEY } from './launchScheme'
import { ThemeContext } from './context'
import { PALETTES } from './tokens'
import type { Theme, ThemeContextValue, ThemeMode, ThemeScheme } from './types'

/**
 * 新 UI 主题提供者（方案 A，独立于旧主题系统）：
 * - 三档模式：light / dark / system（system 跟随 RN Appearance 实时变化）
 * - 缺省 light：原型已给双套 token（:root 深色 + .phone.light 浅色），且出厂默认外观为明亮
 * - 模式持久化到 AsyncStorage，切换立即生效；用户已存过选择时以存的为准
 * 用法：包裹新 UI 的根组件，如 <ThemeProvider><NewHomeScreen /></ThemeProvider>
 */
export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const systemScheme = useColorScheme()
  const [mode, setModeState] = useState<ThemeMode>('light')
  // 若用户在异步读取完成前手动切换过，以用户操作为准，避免被旧值覆盖
  const userChangedRef = useRef(false)

  useEffect(() => {
    let alive = true
    void AsyncStorage.getItem(NEW_UI_THEME_STORAGE_KEY)
      .then(saved => {
        if (!alive || userChangedRef.current) return
        if (isThemeMode(saved)) setModeState(saved)
      })
      .catch(() => {
        // 读取失败保持当前缺省模式（light），不影响启动
      })
    return () => {
      alive = false
    }
  }, [])

  const setMode = useCallback((next: ThemeMode) => {
    userChangedRef.current = true
    setModeState(next)
    void AsyncStorage.setItem(NEW_UI_THEME_STORAGE_KEY, next).catch(() => {
      // 持久化失败不影响本次切换（下次启动回到上一次成功的值）
    })
  }, [])

  // 系统深浅未知（useColorScheme 返回 null）时按 dark 解析（保持既有回退逻辑不变）
  const scheme: ThemeScheme = mode === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : mode

  const theme = useMemo<Theme>(() => ({ scheme, colors: PALETTES[scheme] }), [scheme])

  // 把解析结果回写导航侧快照（QA D-10）：push 转场的 options 同步读它，
  // 不再吃「深色打底 → 挂载后校正」的两帧闪动
  useEffect(() => {
    cacheNewUiScheme(scheme)
  }, [scheme])

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, scheme, theme, setMode }),
    [mode, scheme, theme, setMode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
