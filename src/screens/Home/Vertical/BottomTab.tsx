import { memo } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useI18n } from '@/lang'
import { useNavActiveId } from '@/store/common/hook'
import { useTheme } from '@/store/theme/hook'
import { Icon } from '@/components/common/Icon'
import { NAV_MENUS, BOTTOM_TAB_IDS } from '@/config/constant'
import { setNavActiveId } from '@/core/common'
import { scaleSizeH } from '@/utils/pixelRatio'

const TAB_HEIGHT = scaleSizeH(56)

const TabItem = memo(({ id, icon }: { id: typeof NAV_MENUS[number]['id'], icon: string }) => {
  const t = useI18n()
  const activeId = useNavActiveId()
  const theme = useTheme()
  const active = activeId == id

  return (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={.8}
      accessibilityLabel={t(id)}
      onPress={() => setNavActiveId(id)}
    >
      <View style={{ ...styles.activePill, backgroundColor: active ? theme['c-primary-alpha-900'] : 'transparent' }}>
        <Icon name={icon} size={23} color={active ? theme['c-primary-font-active'] : theme['c-font-label']} />
      </View>
    </TouchableOpacity>
  )
})

export default memo(() => {
  const theme = useTheme()
  return (
    <View style={{ ...styles.container, backgroundColor: theme['c-content-background'] }}>
      {NAV_MENUS.filter(m => (BOTTOM_TAB_IDS as readonly string[]).includes(m.id)).map(menu => <TabItem key={menu.id} id={menu.id} icon={menu.icon} />)}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: TAB_HEIGHT,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, .08)',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    borderRadius: 18,
    paddingHorizontal: scaleSizeH(16),
    paddingVertical: scaleSizeH(7),
  },
})
