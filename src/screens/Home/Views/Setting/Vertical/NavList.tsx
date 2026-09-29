import { memo, useCallback, useState } from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'

import { useTheme } from '@/store/theme/hook'
import { createStyle } from '@/utils/tools'
import Text from '@/components/common/Text'
import { SETTING_SCREENS, type SettingScreenIds } from '../Main'
import { useI18n } from '@/lang'


const Pill = memo(({ id, active, onPress }: {
  id: SettingScreenIds
  active: boolean
  onPress: (id: SettingScreenIds) => void
}) => {
  const theme = useTheme()
  const t = useI18n()

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => { onPress(id) }}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={{ ...styles.pill, backgroundColor: active ? theme['c-primary-alpha-900'] : theme['c-button-background'] }}
    >
      <Text size={13} numberOfLines={1} color={active ? theme['c-primary-font-active'] : theme['c-font']} style={styles.pillText}>
        {t(`setting_${id}`)}
      </Text>
    </TouchableOpacity>
  )
}, (prev, next) => prev.id === next.id && prev.active === next.active)


export default ({ onChangeId }: {
  onChangeId: (id: SettingScreenIds) => void
}) => {
  const [activeId, setActiveId] = useState(global.lx.settingActiveId)

  const handleChangeId = useCallback((id: SettingScreenIds) => {
    onChangeId(id)
    setActiveId(id)
    global.lx.settingActiveId = id
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="always"
    >
      {
        SETTING_SCREENS.map(id => <Pill key={id} id={id} active={id == activeId} onPress={handleChangeId} />)
      }
    </ScrollView>
  )
}


const styles = createStyle({
  container: {
    flexGrow: 0,
    flexShrink: 0,
  },
  content: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
  },
  pill: {
    height: 34,
    borderRadius: 17,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillText: {
    fontWeight: '500',
  },
})
