import { useEffect, useState } from 'react'

import { LIST_IDS } from '@/config/constant'
import { getListMusics } from '@/core/list'
import listState from '@/store/list/state'

export interface MyPlaylistItem {
  id: string
  name: string
  /** 曲目数；null = 还没数出来（首次读取时） */
  count: number | null
  /** 从平台导入的来源（纯自建为 undefined） */
  source?: LX.OnlineSource
  /** 该平台里这份歌单的 ID */
  sourceListId?: string
}

type AllLists = typeof listState.allList

/** QA 2026-10-14 D-03：原型 MY_PLAYLISTS 只含用户自建（app.js L738-746），
 * 而 store/list 的 allList 恒含「试听列表」与「我的收藏」两张系统列表（store/list/state.ts L45）——
 * 不过滤就会上卡、进「歌单」统计、并让空态永不出现。在源头剔掉，
 * 四处消费方（歌单页横排 / 我的页网格与统计 / MoreSheet / 详情层收藏匹配）一并收敛。
 * 详情层按 source + sourceListId 匹配，系统列表本就命不中，不误伤。 */
const isMine = (list: AllLists[number]): boolean =>
  list.id !== LIST_IDS.DEFAULT && list.id !== LIST_IDS.LOVE

const toItems = (lists: AllLists, counts: Record<string, number>): MyPlaylistItem[] =>
  lists.filter(isMine).map(list => ({
    id: list.id,
    name: list.name,
    count: counts[list.id] ?? null,
    source: 'source' in list ? list.source : undefined,
    sourceListId: 'source' in list ? list.sourceListId : undefined,
  }))

/**
 * 歌单页「我的歌单」横排（原型 #myPlRow / MY_PLAYLISTS）= 仅用户自建（含平台导入），
 * 系统列表已在 toItems 源头剔除（D-03）。
 * 读既有 `@/store/list` 的 allList（启动时已填充），
 * 数量走 `@/core/list` 的 getListMusics（内部自带缓存）；
 * 订阅 state_event.mylistUpdated（歌单增删改名）与 app_event.myListMusicUpdate（曲目变化），零逻辑改动。
 */
export const useMyPlaylists = (): MyPlaylistItem[] => {
  const [items, setItems] = useState(() => toItems(listState.allList, {}))

  useEffect(() => {
    let alive = true
    const counts: Record<string, number> = {}

    const refresh = () => {
      if (alive) setItems(toItems(listState.allList, counts))
    }
    const fillCounts = (lists: AllLists) => {
      for (const list of lists) {
        void getListMusics(list.id).then(musics => {
          if (!alive) return
          counts[list.id] = musics.length
          refresh()
        })
      }
    }
    const handleListUpdated = (lists: AllLists) => {
      fillCounts(lists)
      refresh()
    }
    const handleMusicUpdated = (ids: string[]) => {
      fillCounts(listState.allList.filter(list => ids.includes(list.id)))
    }

    fillCounts(listState.allList)
    global.state_event.on('mylistUpdated', handleListUpdated)
    global.app_event.on('myListMusicUpdate', handleMusicUpdated)
    return () => {
      alive = false
      global.state_event.off('mylistUpdated', handleListUpdated)
      global.app_event.off('myListMusicUpdate', handleMusicUpdated)
    }
  }, [])

  return items
}
