import { useCallback, useEffect, useRef, useState } from 'react'
import { View } from 'react-native'

import HeaderBar, { type HeaderBarProps, type HeaderBarType } from './HeaderBar'
import TagSelector from './TagSelector'
import songlistState, { type InitState, type SortInfo } from '@/store/songlist/state'
import List, { type ListType } from './List'
import Text from '@/components/common/Text'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import { useI18n } from '@/lang'
import { getSongListSetting, saveSongListSetting } from '@/utils/data'
import { getActiveSource, initOnlineSource } from '@/core/onlineSource'

type Source = InitState['sources'][number]

interface SonglistInfo {
  source: Source
  sortId: SortInfo['id']
  tagId: string
}

export default () => {
  const theme = useTheme()
  const t = useI18n()
  const headerBarRef = useRef<HeaderBarType>(null)
  const listRef = useRef<ListType>(null)
  const songlistInfo = useRef<SonglistInfo>({ source: 'kw', sortId: 'new', tagId: '' })
  const [source, setSource] = useState<Source>('kw')
  const [tagInfo, setTagInfo] = useState<{ id: string, name: string }>({ id: '', name: '' })

  const applySource = useCallback((newSource: Source, sortId: string, tagId: string, tagName: string) => {
    songlistInfo.current = { source: newSource, sortId, tagId }
    setSource(newSource)
    setTagInfo({ id: tagId, name: tagName })
    headerBarRef.current?.setSource(newSource, sortId)
    listRef.current?.loadList(newSource, sortId, tagId)
  }, [])

  useEffect(() => {
    initOnlineSource()
    void getSongListSetting().then(info => {
      const newSource = getActiveSource() as Source
      const sameSource = info.source == newSource
      const sorts = songlistState.sortList[newSource]
      const sortId = sameSource && sorts?.some(s => s.id == info.sortId) ? info.sortId : sorts?.[0]?.id ?? 'new'
      applySource(newSource, sortId, sameSource ? info.tagId : '', sameSource ? info.tagName : '')
    })

    const handleOnlineSourceUpdated = (newSource: LX.OnlineSource) => {
      if (newSource == songlistInfo.current.source) return
      const sortId = songlistState.sortList[newSource]?.[0]?.id ?? 'new'
      void saveSongListSetting({ source: newSource, sortId, tagId: '', tagName: '' })
      applySource(newSource as Source, sortId, '', '')
    }
    global.state_event.on('onlineSourceUpdated', handleOnlineSourceUpdated)

    return () => {
      global.state_event.off('onlineSourceUpdated', handleOnlineSourceUpdated)
    }
  }, [applySource])

  const handleSortChange: HeaderBarProps['onSortChange'] = (id) => {
    songlistInfo.current.sortId = id
    void saveSongListSetting({ sortId: id })
    listRef.current?.loadList(songlistInfo.current.source, id, songlistInfo.current.tagId)
  }

  const handleTagChange = (name: string, id: string) => {
    songlistInfo.current.tagId = id
    setTagInfo({ id, name })
    void saveSongListSetting({ tagName: name, tagId: id })
    listRef.current?.loadList(songlistInfo.current.source, songlistInfo.current.sortId, id)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.desc} size={13} color={theme['c-font-label']}>{t('songlist_desc')}</Text>
      <HeaderBar
        ref={headerBarRef}
        onSortChange={handleSortChange}
      />
      <TagSelector
        source={source}
        tagId={tagInfo.id}
        tagName={tagInfo.name}
        onTagChange={handleTagChange}
      />
      <List ref={listRef} />
    </View>
  )
}

const styles = createStyle({
  container: {
    position: 'relative',
    flex: 1,
  },
  desc: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
})
