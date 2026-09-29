import { useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, View } from 'react-native'

import BoardCard from '@/components/common/BoardCard'
import Text from '@/components/common/Text'
import { useTheme } from '@/store/theme/hook'
import { useI18n } from '@/lang'
import { createStyle, isHorizontalMode } from '@/utils/tools'
import { useWindowSize } from '@/utils/hooks'
import { getBoardsList } from '@/core/leaderboard'
import { getActiveSource, initOnlineSource } from '@/core/onlineSource'
import { type BoardItem } from '@/store/leaderboard/state'
import commonState from '@/store/common/state'
import { navigations } from '@/navigation'

const PADDING = 16
const GAP = 12

export default () => {
  const theme = useTheme()
  const t = useI18n()
  const { width, height } = useWindowSize()
  const isHorizontal = isHorizontalMode(width, height)
  const [source, setSource] = useState<LX.OnlineSource>(getActiveSource())
  const [boards, setBoards] = useState<BoardItem[]>([])
  const [bodyWidth, setBodyWidth] = useState(0)
  const isUnmountedRef = useRef(false)

  const columns = isHorizontal ? 4 : 2
  const itemWidth = ((bodyWidth || width || 360) - PADDING * 2 - GAP * (columns - 1)) / columns
  const itemHeight = Math.min(Math.round(itemWidth * .82), isHorizontal ? 128 : 168)

  const loadBoards = (newSource: LX.OnlineSource) => {
    void getBoardsList(newSource).then(list => {
      if (isUnmountedRef.current) return
      setBoards(list)
    }).catch(() => {})
  }

  useEffect(() => {
    isUnmountedRef.current = false
    initOnlineSource()
    loadBoards(getActiveSource())

    const handleSourceUpdated = (newSource: LX.OnlineSource) => {
      setSource(newSource)
      loadBoards(newSource)
    }
    global.state_event.on('onlineSourceUpdated', handleSourceUpdated)
    return () => {
      global.state_event.off('onlineSourceUpdated', handleSourceUpdated)
      isUnmountedRef.current = true
    }
  }, [])

  const openBoard = (board: BoardItem) => {
    navigations.pushLeaderboardDetailScreen(commonState.componentIds.home!, { source, id: board.id, name: board.name })
  }

  const renderItem = ({ item, index }: { item: BoardItem, index: number }) => (
    <BoardCard id={item.id} name={item.name} index={index} width={itemWidth} height={itemHeight} onPress={() => { openBoard(item) }} />
  )

  const header = useMemo(() => (
    <Text size={13} color={theme['c-font-label']} style={styles.desc}>{t('toplist_tip')}</Text>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [theme, t])

  return (
    <View style={styles.container} onLayout={e => { setBodyWidth(e.nativeEvent.layout.width) }}>
      <FlatList
        style={styles.list}
        data={boards}
        keyExtractor={item => item.id}
        numColumns={columns}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={styles.content}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListEmptyComponent={<Text size={13} color={theme['c-font-label']} style={styles.desc}>{t('home_empty_tip')}</Text>}
      />
    </View>
  )
}

const styles = createStyle({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  content: {
    paddingHorizontal: PADDING,
    paddingTop: 10,
    paddingBottom: 20,
    gap: GAP,
  },
  desc: {
    paddingBottom: 12,
  },
})
