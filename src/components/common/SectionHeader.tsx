import { View, TouchableOpacity } from 'react-native'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import { useI18n } from '@/lang'
import Text from './Text'
import { Icon } from './Icon'

export interface SectionHeaderProps {
  title: string
  onPressMore?: () => void
  onPressPlayAll?: () => void
  style?: object
}

export default ({ title, onPressMore, onPressPlayAll, style }: SectionHeaderProps) => {
  const theme = useTheme()
  const t = useI18n()
  return (
    <View style={{ ...styles.container, ...style }}>
      <View style={styles.left}>
        <Text size={16} color={theme['c-font']} style={styles.title}>{title}</Text>
        <View style={{ ...styles.dot, backgroundColor: theme['c-primary'] }} />
      </View>
      {
        onPressPlayAll ? (
          <TouchableOpacity style={styles.action} activeOpacity={.6} onPress={onPressPlayAll}>
            <Icon name="play-outline" size={13} color={theme['c-primary-font']} />
            <Text size={12} color={theme['c-primary-font']} style={styles.actionText}>{t('play_all')}</Text>
          </TouchableOpacity>
        ) : onPressMore ? (
          <TouchableOpacity style={styles.action} activeOpacity={.6} onPress={onPressMore}>
            <Text size={13} color={theme['c-font-label']}>{t('home_more')}</Text>
            <Icon name="chevron-right-2" size={13} color={theme['c-font-label']} />
          </TouchableOpacity>
        ) : null
      }
    </View>
  )
}

const styles = createStyle({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontWeight: '800',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 6,
    marginBottom: 3,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 3,
    fontWeight: '600',
  },
})
