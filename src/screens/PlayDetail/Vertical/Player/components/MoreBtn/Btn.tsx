import { Pressable } from 'react-native'
import { Icon } from '@/components/common/Icon'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import { scaleSizeW } from '@/utils/pixelRatio'
import { useMemo } from 'react'

export const BTN_WIDTH = scaleSizeW(36)
export const BTN_ICON_SIZE = 24

export default ({ icon, color, onPress, onLongPress, accessibilityLabel }: {
  icon: string
  color?: string
  onPress: () => void
  onLongPress?: () => void
  accessibilityLabel?: string
}) => {
  const theme = useTheme()
  // 图标按钮采用 borderless 水波纹，无需背景即可在热区内扩散
  const ripple = useMemo(() => ({ color: theme['c-primary-light-200-alpha-700'], borderless: true }), [theme])
  return (
    <Pressable style={{ ...styles.cotrolBtn, width: BTN_WIDTH, height: BTN_WIDTH }} android_ripple={ripple} accessibilityRole='button' accessibilityLabel={accessibilityLabel} onPress={onPress} onLongPress={onLongPress}>
      {({ pressed }) => <Icon name={icon} style={{ opacity: pressed ? 0.6 : 1 }} color={color ?? theme['c-font-label']} size={BTN_ICON_SIZE} />}
    </Pressable>
  )
}

const styles = createStyle({
  cotrolBtn: {
    marginLeft: 5,
    justifyContent: 'center',
    alignItems: 'center',

    // backgroundColor: '#ccc',
    shadowOpacity: 1,
    textShadowRadius: 1,
  },
})
