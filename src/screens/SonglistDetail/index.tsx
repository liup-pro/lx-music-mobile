import { useEffect, useMemo, useRef } from 'react'

import ListDetail, { type ListDetailAdapter, type ListDetailPageResult, type ListDetailType } from '@/components/common/ListDetail'
import { setComponentId } from '@/core/common'
import { COMPONENT_IDS } from '@/config/constant'
import { type ListInfoItem } from '@/store/songlist/state'
import songlistState from '@/store/songlist/state'
import { clearListDetail, getListDetail, setListDetail, setListDetailInfo } from '@/core/songlist'
import { handleCollect, handlePlay } from './listAction'


export default ({ componentId, info }: { componentId: string, info: ListInfoItem }) => {
  const detailRef = useRef<ListDetailType>(null)

  const adapter = useMemo<ListDetailAdapter>(() => ({
    async loadPage(id, source, page, isRefresh): Promise<ListDetailPageResult> {
      if (page == 1 && !isRefresh) {
        clearListDetail()
        setListDetailInfo(source, id)
      }
      try {
        const detail = await getListDetail(id, source, page, isRefresh)
        const result = setListDetail(detail, id, page)
        return {
          list: result.list,
          ended: songlistState.listDetailInfo.maxPage <= page,
          meta: {
            desc: result.info.desc,
            playCount: result.info.play_count,
            img: result.info.img,
          },
        }
      } catch (e) {
        if (songlistState.listDetailInfo.list.length && page == 1) clearListDetail()
        throw e
      }
    },
    playList: (id, source, list, index) => {
      void handlePlay(id, source, list, index)
    },
    collect: (id, source, name) => {
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      void handleCollect(id, source, songlistState.listDetailInfo.info.name || name)
    },
  }), [])

  useEffect(() => {
    setComponentId(COMPONENT_IDS.songlistDetail, componentId)
    detailRef.current?.loadList(info.source, info.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ListDetail
      ref={detailRef}
      componentId={componentId}
      sourceListId={info.id}
      info={{
        id: info.id,
        name: info.name,
        source: info.source,
        desc: info.desc,
        author: info.author,
        playCount: info.play_count,
        img: info.img,
      }}
      adapter={adapter}
    />
  )
}
