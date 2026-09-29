import { useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, ScrollView, TouchableOpacity, View } from 'react-native'

import BoardCard from '@/components/common/BoardCard'
import Text from '@/components/common/Text'
import { useTheme } from '@/store/theme/hook'
import { useI18n } from '@/lang'
import { createStyle, isHorizontalMode } from '@/utils/tools'
import { useWindowSize } from '@/utils/hooks'
import { useSettingValue } from '@/store/setting/hook'
import { getBoardsList } from '@/core/leaderboard'
import { ONLINE_SOURCES, getActiveSource, initOnlineSource, setActiveSource } from '@/core/onlineSource'
import { type BoardItem } from '@/store/leaderboard/state'
import commonState from '@/store/common/state'
import { navigations } from '@/navigation'

const PADDING = 16
const GAP = 12

const SourceChips = ({ active }: { active: LX.OnlineSource }) => {
  const theme = useTheme()
  const t = useI18n()
  const sourceNameType = useSettingValue('common.sourceNameType')
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
      {
        ONLINE_SOURCES.map(s => {
          const isActive = s == active
          return (
            <TouchableOpacity
              key={s}
              activeOpacity={.8}
              onPress={() => { setActiveSource(s) }}
              style={{ ...styles.chip, backgroundColor: isActive ? theme['c-primary-alpha-900'] : theme['c-button-background'] }}
            >
              <Text size={13} color={isActive ? theme['c-primary-font-active'] : theme['c-font']} style={{ fontWeight: isActive ? '700' : '400' }}>
                {t(`source_${sourceNameType}_${s}`)}
              </Text>
            </TouchableOpacity>
          )
        })
      }
    </ScrollView>
  )
}

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
    <>
      <Text size={13} color={theme['c-font-label']} style={styles.desc}>{t('toplist_tip')}</Text>
      <SourceChips active={source} />
      <Text size={17} color={theme['c-font']} style={styles.groupTitle}>{t('toplist_boards')}</Text>
    </>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [theme, source, t])

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
  chipRow: {
    paddingBottom: 16,
    gap: 8,
  },
  chip: {
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupTitle: {
    fontWeight: '800',
    paddingBottom: 12,
  },
})
