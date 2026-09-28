import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { View } from 'react-native'

import { createStyle } from '@/utils/tools'
import SortTab, { type SortTabProps, type SortTabType } from './SortTab'
import songlistState, { type Source } from '@/store/songlist/state'

export interface HeaderBarProps {
  onSortChange: SortTabProps['onSortChange']
}

export interface HeaderBarType {
  setSource: (source: Source, sortId: string) => void
}


export default forwardRef<HeaderBarType, HeaderBarProps>(({ onSortChange }, ref) => {
  const sortTabRef = useRef<SortTabType>(null)
  const [showSortTab, setShowSortTab] = useState(true)

  useImperativeHandle(ref, () => ({
    setSource(source, sortId) {
      sortTabRef.current?.setSource(source, sortId)
      setShowSortTab((songlistState.sortList[source]?.length ?? 0) > 1)
    },
  }), [])

  // 只有一个排序项时不显示排序栏
  return (
    <View style={showSortTab ? styles.bar : styles.hidden}>
      <SortTab ref={sortTabRef} onSortChange={onSortChange} />
    </View>
  )
})

const styles = createStyle({
  bar: {
    flexDirection: 'row',
    height: 38,
    zIndex: 2,
  },
  hidden: {
    flexDirection: 'row',
    height: 0,
    zIndex: 2,
    overflow: 'hidden',
  },
})
