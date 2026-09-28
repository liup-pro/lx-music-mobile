import { View } from 'react-native'

import Button from '@/components/common/Button'
import { type TagInfoItem } from '@/store/songlist/state'
import { useTheme } from '@/store/theme/hook'
import { createStyle } from '@/utils/tools'
import Text from '@/components/common/Text'

export interface TagGroupProps {
  name: string
  list: TagInfoItem[]
  onTagChange: (name: string, id: string) => void
  activeId: string
}

export default ({ name, list, onTagChange, activeId }: TagGroupProps) => {
  const theme = useTheme()
  if (!list.length) return null
  return (
    <View style={styles.group}>
      {
        name
          ? <Text style={styles.groupTitle} size={12} color={theme['c-font-label']}>{name}</Text>
          : null
      }
      <View style={styles.tagList}>
        {list.map(item => (
          activeId == item.id
            ? (
                <View style={{ ...styles.tagButton, backgroundColor: theme['c-primary-alpha-900'] }} key={item.id}>
                  <Text style={styles.tagButtonText} color={theme['c-primary-font-active']}>{item.name}</Text>
                </View>
              )
            : (
                <Button
                  style={{ ...styles.tagButton, backgroundColor: theme['c-button-background'] }}
                  key={item.id}
                  onPress={() => { onTagChange(item.name, item.id) }}
                >
                  <Text style={styles.tagButtonText} color={theme['c-font']}>{item.name}</Text>
                </Button>
              )
        ))}
      </View>
    </View>
  )
}

const styles = createStyle({
  group: {
    paddingHorizontal: 16,
  },
  groupTitle: {
    marginTop: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagButton: {
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  tagButtonText: {
    fontSize: 13,
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 7,
    paddingBottom: 7,
  },
})
