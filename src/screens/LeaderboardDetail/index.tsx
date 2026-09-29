import { useEffect, useMemo, useRef } from 'react'

import ListDetail, { type ListDetailAdapter, type ListDetailPageResult, type ListDetailType } from '@/components/common/ListDetail'
import { setComponentId } from '@/core/common'
import { COMPONENT_IDS } from '@/config/constant'
import { useI18n } from '@/lang'
import { clearListDetail, getListDetail, setListDetail, setListDetailInfo } from '@/core/leaderboard'
import boardState from '@/store/leaderboard/state'
import { handleCollect, handlePlay } from '@/screens/Home/Views/Leaderboard/listAction'

export interface LeaderboardDetailProps {
  componentId: string
  info: { source: LX.OnlineSource, id: string, name: string }
}

export default ({ componentId, info }: LeaderboardDetailProps) => {
  const t = useI18n()
  const detailRef = useRef<ListDetailType>(null)

  const adapter = useMemo<ListDetailAdapter>(() => ({
    async loadPage(id, _source, page, isRefresh): Promise<ListDetailPageResult> {
      if (page == 1 && !isRefresh) setListDetailInfo(id)
      try {
        const detail = await getListDetail(id, page, isRefresh)
        const result = setListDetail(detail, id, page)
        return {
          list: result.list,
          ended: boardState.listDetailInfo.maxPage <= page,
        }
      } catch (e) {
        if (boardState.listDetailInfo.list.length && page == 1) clearListDetail()
        throw e
      }
    },
    playList: (id, _source, list, index) => {
      void handlePlay(id, list, index)
    },
    collect: (id, source, name) => {
      void handleCollect(id, name, source)
    },
  }), [])

  useEffect(() => {
    setComponentId(COMPONENT_IDS.leaderboardDetail, componentId)
    detailRef.current?.loadList(info.source, info.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 与歌单详情共用同一 ListDetail 组件，仅注入不同数据来源适配器
  return (
    <ListDetail
      ref={detailRef}
      componentId={componentId}
      sourceListId={`board__${info.id}`}
      info={{ id: info.id, name: info.name, source: info.source, desc: t('toplist_desc') }}
      adapter={adapter}
      playerBarIsHome
      checkHomePagerIdle
    />
  )
}
