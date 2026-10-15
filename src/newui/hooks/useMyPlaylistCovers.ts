import { useEffect, useState } from 'react'

import { getListDetail } from '@/core/songlist'
import { NEW_UI_BOARD_LIST_ID_PREFIX } from '@/newui/const'

import type { MyPlaylistItem } from './useMyPlaylists'

/*
 * 模块级封面缓存（key = source__sourceListId，值为封面地址或 null=取不到）：
 * 页面重挂载不重复请求；core/songlist 内部自带数据缓存，这里只是省一次 await 与重渲染。
 */
const coverCache = new Map<string, string | null>()

/**
 * 「我的歌单」卡片的平台封面（2026-10-12 走查现象 4）。
 * 核实过：@/store/list 的本地歌单条目（LX.List.UserListInfo）只有 id/name/source/sourceListId，
 * 没有任何封面字段——纯自建的歌单平台侧本来就没图；「存整榜」进来的 board__ 条目
 * 是榜单坐标，走歌单详情接口取不到东西。因此这里只给「平台导入的歌单」按 source+sourceListId
 * 走既有 core/songlist 的只读接口取 info.img（首页推荐歌单同一来源），取不到就留空由 PlCard
 * 退回种子渐变底，不造假。
 */
export const useMyPlaylistCovers = (lists: MyPlaylistItem[]): Record<string, string> => {
  const [covers, setCovers] = useState<Record<string, string>>({})

  useEffect(() => {
    let alive = true
    // 只认「从平台导入、且不是存榜坐标」的条目
    const targets = lists.filter(
      list =>
        list.source != null &&
        list.sourceListId != null &&
        !list.sourceListId.startsWith(NEW_UI_BOARD_LIST_ID_PREFIX),
    )
    if (targets.length === 0) return

    const fromCache: Record<string, string> = {}
    const pending: Array<{ list: MyPlaylistItem; key: string }> = []
    for (const list of targets) {
      const key = `${list.source}__${list.sourceListId}`
      const cached = coverCache.get(key)
      if (cached !== undefined) {
        if (cached != null) fromCache[list.id] = cached
        continue
      }
      pending.push({ list, key })
    }
    setCovers(fromCache)

    for (const { list, key } of pending) {
      const source = list.source as LX.OnlineSource
      const sourceListId = list.sourceListId as string
      void getListDetail(sourceListId, source, 1)
        .then(detail => {
          const img = detail.info.img
          coverCache.set(key, img != null && img.length > 0 ? img : null)
          if (!alive || img == null || img.length === 0) return
          setCovers(prev => ({ ...prev, [list.id]: img }))
        })
        .catch(() => {
          // 取不到（歌单已删 / 平台不给 / 当前音源不支持）：记 null，保持种子底，不重试轰炸
          coverCache.set(key, null)
        })
    }
    return () => {
      alive = false
    }
  }, [lists])

  return covers
}
