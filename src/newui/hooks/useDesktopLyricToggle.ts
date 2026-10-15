import { useCallback, useRef } from 'react'

import {
  checkDesktopLyricOverlayPermission,
  hideDesktopLyric,
  showDesktopLyric,
} from '@/core/desktopLyric'
import { updateSetting } from '@/core/common'
import { usePlayerMusicInfo } from '@/store/player/hook'
import { useSettingValue } from '@/store/setting/hook'
import { NEW_UI_PLAYER_LRC_TOAST } from '@/newui/const'
import { showNewUiToast } from '@/newui/utils'

/**
 * 「LRC 浮窗」开关（播放页工具行 .pt-btn #btnFloat）。
 * 本项目的歌词浮窗是**系统级悬浮窗**（原生模块 lyricDesktop），不是 RN 层浮层，
 * 因此接线复用既有 core/desktopLyric 全套：开 = 校验悬浮窗权限 → showDesktopLyric，
 * 关 = hideDesktopLyric；状态真相仍是设置键 `desktopLyric.enable`（与旧 UI 同一开关）。
 * 近似点：旧 UI（components/DesktopLyricEnable）在无权限时弹旧主题 ConfirmAlert 征求后
 * 跳系统设置；新 UI 不引旧组件，降级为一句 toast 指引（完整授权引导属阶段 8 设定页）。
 * QA 2026-10-14 D-01（P0）修复：
 * ① 未在播任何曲目时窗口没有可见内容，不开开关不报成功（原生侧 checkOverlayPermission
 *    先 reject 再 resolve，但 RN 只认第一次 settle，无权限确实走 catch 分支——此前
 *    「报成功却无窗」的另一分支就是在播空曲），文案改为如实的「先在放一首歌」；
 * ② 删除「进入播放页自动隐藏」假承诺（全项目零实现，那是原型 App 内胶囊的语义），
 *    开启文案改「回到桌面查看」——系统悬浮窗的真实可见处。
 */
export const useDesktopLyricToggle = (): { enabled: boolean, toggle: () => void } => {
  const enabled = useSettingValue('desktopLyric.enable')
  const musicInfo = usePlayerMusicInfo()
  const busyRef = useRef(false)

  const toggle = useCallback(() => {
    if (busyRef.current) return
    if (!enabled && musicInfo.id == null) {
      // 没有在播曲目：浮窗无内容可显，不得声称「已开启」（D-01 最低标准）
      showNewUiToast(NEW_UI_PLAYER_LRC_TOAST.noSong)
      return
    }
    busyRef.current = true
    const next = !enabled
    if (next) {
      void (async () => {
        try {
          await checkDesktopLyricOverlayPermission()
          await showDesktopLyric()
          updateSetting({ 'desktopLyric.enable': true })
          showNewUiToast(NEW_UI_PLAYER_LRC_TOAST.on)
        } catch {
          updateSetting({ 'desktopLyric.enable': false })
          showNewUiToast(NEW_UI_PLAYER_LRC_TOAST.needPermission)
        }
      })().finally(() => {
        busyRef.current = false
      })
    } else {
      void (async () => {
        try {
          await hideDesktopLyric()
        } finally {
          updateSetting({ 'desktopLyric.enable': false })
          showNewUiToast(NEW_UI_PLAYER_LRC_TOAST.off)
          busyRef.current = false
        }
      })()
    }
  }, [enabled, musicInfo.id])

  return { enabled, toggle }
}
