import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCallback, useEffect, useState } from 'react'

import { NEW_UI_DEFAULT_AVATAR_TEXT } from '@/newui/const'

/** 持久化 key：与 newui.themeMode 同命名空间，旧设置（@/plugins/storage）互不影响 */
const STORAGE_KEY = 'newui.nickName'

/** 昵称长度上限（原型 saveNick 的 slice(0, 12)） */
const NICK_MAX_LENGTH = 12

/** 清洗规则同原型 saveNick：去首尾空格、内部连续空白压成一个、截到 12 字 */
export const sanitizeNick = (raw: string): string =>
  raw.trim().replace(/\s+/g, ' ').slice(0, NICK_MAX_LENGTH)

/**
 * 头像首字（原型 nickInitial）：昵称 trim 后第一个字（Array.from 保证代理对不切碎），
 * 空昵称回落缺省字「E」（NEW_UI_DEFAULT_AVATAR_TEXT，拉丁品牌 EchoIsle 取首字母）再转大写。
 * 导出给浮层做「保存后 toast 里预告新首字」用（原型 toast 文案 L573）。
 */
export const nickNameInitial = (nick: string): string =>
  (Array.from(nick.trim())[0] ?? NEW_UI_DEFAULT_AVATAR_TEXT).toUpperCase()

/*
 * 模块级共享值 + 订阅（阶段 9e 加）：昵称有多个消费点（顶栏头像、我的页头部、
 * 改昵称浮层），且分属不同屏幕/组件树。useNickName 各实例若只持有本地 useState，
 * 浮层保存后其他实例要到重挂载才刷新。这里在 newui 自己的模块作用域内做一份
 * 内存缓存与监听集合——不进驻 store、不碰旧设置，仍是「新 UI 自存一份」的原口径。
 */
let cachedNick: string | null = null
let loadingPromise: Promise<void> | null = null
const listeners = new Set<(nick: string) => void>()

const loadOnce = (): Promise<void> => {
  if (cachedNick != null) return Promise.resolve()
  if (loadingPromise == null) {
    loadingPromise = AsyncStorage.getItem(STORAGE_KEY)
      .then(value => {
        const saved = sanitizeNick(value ?? '')
        // 没读到 / 读脏了就停留在缺省名（模块缓存记为缺省，避免每次挂载重读）
        if (cachedNick == null) cachedNick = saved.length > 0 ? saved : NEW_UI_DEFAULT_AVATAR_TEXT
      })
      .catch(() => {
        if (cachedNick == null) cachedNick = NEW_UI_DEFAULT_AVATAR_TEXT
      })
      .finally(() => {
        loadingPromise = null
      })
  }
  return loadingPromise
}

export interface NewUiNickName {
  /** 当前昵称（未设置过为缺省「EchoIsle」的头像字「E」来源，见 NEW_UI_DEFAULT_AVATAR_TEXT） */
  nickName: string
  /** 头像首字（我的页 .mh-art 与顶栏头像共用） */
  initial: string
  /** 清洗并持久化昵称；空串忽略。所有 useNickName 实例同步更新（阶段 9e 改昵称浮层接线） */
  setNickName: (raw: string) => void
}

/**
 * 「我的」页昵称（原型 state.name）。
 * 核实过旧 AppSetting（src/types/app_setting.d.ts）没有任何用户昵称/头像键，
 * 故新 UI 自存一份（AsyncStorage，同 ThemeProvider 的模式）；不读不改旧设置。
 * 改昵称浮层已在阶段 9e 落地（screens/Main/sheets/NameSheet），写入走这里的 setNickName。
 */
export const useNickName = (): NewUiNickName => {
  const [nickName, setNickState] = useState(cachedNick ?? NEW_UI_DEFAULT_AVATAR_TEXT)

  useEffect(() => {
    // 任一实例保存 → 本实例即时刷新（顶栏与我的页头像因此同源，对齐原型 renderProfile 同步 #topAvatar）
    const handleNickChanged = (next: string) => setNickState(next)
    listeners.add(handleNickChanged)
    if (cachedNick == null) {
      void loadOnce().then(() => setNickState(cachedNick ?? NEW_UI_DEFAULT_AVATAR_TEXT))
    }
    return () => {
      listeners.delete(handleNickChanged)
    }
  }, [])

  const setNickName = useCallback((raw: string) => {
    const next = sanitizeNick(raw)
    if (!next) return
    cachedNick = next
    setNickState(next)
    for (const listener of listeners) listener(next)
    void AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      // 持久化失败仅影响下次启动，本次会话内生效
    })
  }, [])

  return { nickName, initial: nickNameInitial(nickName), setNickName }
}
