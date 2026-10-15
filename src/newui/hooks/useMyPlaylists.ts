import { useEffect, useState } from 'react'

import { LIST_IDS } from '@/config/constant'
import { getListMusics } from '@/core/list'
import listState from '@/store/list/state'
import { assertApiSupport } from '@/utils/tools'

export interface MyPlaylistItem {
  id: string
  name: string
  /** 曲目数；null = 还没数出来（首次读取时） */
  count: number | null
  /** 当前音源下可播的曲目数（QA D17：原型 plCardMine 的 `${n} 首 · ${can} 首可播` 口径）；
   *  null = 还没数出来，与 count 同步落值 */
  playable: number | null
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

/** 一份歌单的两项计数（QA D17：原型 plCardMine 副行同时报「几首 / 几首可播」） */
interface ListTally {
  count: number
  playable: number
}

const tallyOf = (musics: LX.Music.MusicInfo[]): ListTally => ({
  count: musics.length,
  // 可播判定复用既有 utils/tools 的 assertApiSupport（读 global.lx.qualityList），不另造口径
  playable: musics.filter(music => assertApiSupport(music.source)).length,
})

const toItems = (lists: AllLists, tallies: Record<string, ListTally>): MyPlaylistItem[] =>
  lists.filter(isMine).map(list => ({
    id: list.id,
    name: list.name,
    count: tallies[list.id]?.count ?? null,
    playable: tallies[list.id]?.playable ?? null,
    source: 'source' in list ? list.source : undefined,
    sourceListId: 'source' in list ? list.sourceListId : undefined,
  }))

/**
 * 歌单页「我的歌单」横排（原型 #myPlRow / MY_PLAYLISTS）= 仅用户自建（含平台导入），
 * 系统列表已在 toItems 源头剔除（D-03）。
 * 读既有 `@/store/list` 的 allList（启动时已填充），
 * 数量走 `@/core/list` 的 getListMusics（内部自带缓存）；
 * 订阅 state_event.mylistUpdated（歌单增删改名）与 app_event.myListMusicUpdate（曲目变化），零逻辑改动。
 * QA D17 追加：同一份曲目顺带算「当前音源下可播几首」，并订阅 apiSourceUpdated 脉冲——
 * 换音源后可播数跟着重算（计数仍是既有 getListMusics 的只读结果，不落任何新状态）。
 */
export const useMyPlaylists = (): MyPlaylistItem[] => {
  const [items, setItems] = useState(() => toItems(listState.allList, {}))

  useEffect(() => {
    let alive = true
    const tallies: Record<string, ListTally> = {}

    const refresh = () => {
      if (alive) setItems(toItems(listState.allList, tallies))
    }
    const fillCounts = (lists: AllLists) => {
      for (const list of lists) {
        void getListMusics(list.id).then(musics => {
          if (!alive) return
          tallies[list.id] = tallyOf(musics)
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
    // 换音源（含启动加载完成）→ 可播数重算：只重跑既有只读取数，不新增任何写操作
    const handleApiSourceUpdated = () => {
      fillCounts(listState.allList)
    }

    fillCounts(listState.allList)
    global.state_event.on('mylistUpdated', handleListUpdated)
    global.state_event.on('apiSourceUpdated', handleApiSourceUpdated)
    global.app_event.on('myListMusicUpdate', handleMusicUpdated)
    return () => {
      alive = false
      global.state_event.off('mylistUpdated', handleListUpdated)
      global.state_event.off('apiSourceUpdated', handleApiSourceUpdated)
      global.app_event.off('myListMusicUpdate', handleMusicUpdated)
    }
  }, [])

  return items
}
