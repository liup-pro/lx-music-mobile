import { memo, useRef, type ReactNode } from 'react'
import { ScrollView, TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native'
import Text from '@/components/common/Text'
import { useTheme } from '@/store/theme/hook'
import { createStyle } from '@/utils/tools'

export interface ChipItem {
  id: string
  name: string
}

export interface Position {
  x: number
  y: number
  w: number
  h: number
}

export interface ChipBarProps {
  items: ChipItem[]
  activeId?: string
  onSelect: (id: string, index: number) => void
  onLongPress?: (item: ChipItem, index: number, position: Position) => void
  trailing?: ReactNode
  style?: StyleProp<ViewStyle>
}

interface ChipProps {
  item: ChipItem
  index: number
  active: boolean
  onSelect: (id: string, index: number) => void
  onLongPress?: (item: ChipItem, index: number, position: Position) => void
}

const Chip = memo(({ item, index, active, onSelect, onLongPress }: ChipProps) => {
  const theme = useTheme()
  const btnRef = useRef<TouchableOpacity>(null)

  const handleLongPress = () => {
    if (!onLongPress || !btnRef.current?.measure) return
    btnRef.current.measure((fx, fy, width, height, px, py) => {
      onLongPress(item, index, { x: Math.ceil(px), y: Math.ceil(py), w: Math.ceil(width), h: Math.ceil(height) })
    })
  }

  return (
    <TouchableOpacity
      ref={btnRef}
      activeOpacity={.7}
      onPress={() => { onSelect(item.id, index) }}
      onLongPress={handleLongPress}
      style={{ ...styles.chip, backgroundColor: active ? theme['c-primary-alpha-900'] : theme['c-button-background'] }}
    >
      <Text size={13} numberOfLines={1} color={active ? theme['c-primary-font-active'] : theme['c-font']} style={styles.chipText}>
        {item.name}
      </Text>
    </TouchableOpacity>
  )
}, (prev, next) => {
  return prev.item.id === next.item.id && prev.active === next.active
})

export default ({ items, activeId, onSelect, onLongPress, trailing, style }: ChipBarProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={[styles.content, style]}
    >
      {
        items.map((item, index) => (
          <Chip
            key={item.id}
            item={item}
            index={index}
            active={item.id == activeId}
            onSelect={onSelect}
            onLongPress={onLongPress}
          />
        ))
      }
      {trailing}
    </ScrollView>
  )
}

const styles = createStyle({
  scroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
    alignItems: 'center',
  },
  chip: {
    borderRadius: 16,
    marginRight: 8,
    paddingHorizontal: 14,
    height: 32,
    justifyContent: 'center',
  },
  chipText: {
    fontWeight: '500',
  },
})
