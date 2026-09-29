import { memo } from 'react'
import { StyleSheet, Pressable, View } from 'react-native'
import { useI18n } from '@/lang'
import { useNavActiveId } from '@/store/common/hook'
import { useTheme } from '@/store/theme/hook'
import { Icon } from '@/components/common/Icon'
import Text from '@/components/common/Text'
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
    <Pressable
      style={styles.item}
      android_ripple={{ color: theme['c-primary-light-200-alpha-700'], borderless: true }}
      accessibilityRole='tab'
      accessibilityLabel={t(id)}
      accessibilityState={{ selected: active }}
      onPress={() => { setNavActiveId(id) }}
    >
      {({ pressed }) => (
        <>
          <View style={{ ...styles.activePill, opacity: pressed ? 0.7 : 1, backgroundColor: active ? theme['c-primary-alpha-900'] : 'transparent' }}>
            <Icon name={icon} size={22} color={active ? theme['c-primary-font-active'] : theme['c-font-label']} />
          </View>
          <Text size={10} color={active ? theme['c-primary-font-active'] : theme['c-font-label']} style={styles.label}>{t(id)}</Text>
        </>
      )}
    </Pressable>
  )
})

export default memo(() => {
  const theme = useTheme()
  return (
    <View style={{ ...styles.container, backgroundColor: theme['c-content-background'], borderTopColor: theme['c-border-background'] }}>
      {NAV_MENUS.filter(m => (BOTTOM_TAB_IDS as readonly string[]).includes(m.id)).map(menu => <TabItem key={menu.id} id={menu.id} icon={menu.icon} />)}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: TAB_HEIGHT,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    borderRadius: 18,
    paddingHorizontal: scaleSizeH(16),
    paddingVertical: scaleSizeH(4),
  },
  label: {
    marginTop: 2,
    fontWeight: '600',
  },
})
