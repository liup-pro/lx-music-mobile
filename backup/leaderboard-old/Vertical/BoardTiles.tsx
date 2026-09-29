import { ScrollView, TouchableOpacity } from 'react-native'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import BoardTile from '@/components/common/BoardTile'

export interface BoardTilesProps {
  items: { id: string, name: string }[]
  activeId: string
  onSelect: (id: string) => void
}

const SIZE = 86

export default ({ items, activeId, onSelect }: BoardTilesProps) => {
  const theme = useTheme()
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
      {
        items.map(item => (
          <TouchableOpacity key={item.id} activeOpacity={.8} onPress={() => { onSelect(item.id) }} style={styles.item}>
            <BoardTile id={item.id} name={item.name} size={SIZE} radius={18} active={item.id == activeId} activeColor={theme['c-primary']} />
          </TouchableOpacity>
        ))
      }
    </ScrollView>
  )
}

const styles = createStyle({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  item: {
    marginRight: 10,
  },
})
