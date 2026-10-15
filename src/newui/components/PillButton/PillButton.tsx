import { memo } from 'react'
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native'

import { BUTTON, FONT_SIZE, FONT_WEIGHT, RADIUS, useTheme } from '@/newui/theme'

import { Icon, type IconName } from '../Icon'

export interface PillButtonProps {
  /** 文案（.pl-open-btn / .mh-edit 内文字）；纯图标入口（如「打开歌单」）可不传 */
  label?: string
  /** 前置图标，如「打开歌单 ID」「改昵称」「管理」 */
  icon?: IconName
  onPress?: () => void
  /** 图标尺寸，默认 15（.pl-open-btn）；.mh-edit 传 14 */
  iconSize?: number
  style?: StyleProp<ViewStyle>
}

/**
 * 小胶囊按钮（对应原型 .pl-open-btn / .mh-edit，两者规格几乎一致故合并为一件）。
 * 用于卡内 / 区段头的轻操作入口，不占满整行。
 */
export const PillButton = memo(
  ({ label, icon, onPress, iconSize = BUTTON.pillIcon, style }: PillButtonProps) => {
    const theme = useTheme()
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.root,
          {
            backgroundColor: pressed ? theme.colors.fill3 : theme.colors.fill2,
            borderColor: theme.colors.line,
          },
          pressed && styles.pressed,
          style,
        ]}
      >
        {icon != null && <Icon name={icon} size={iconSize} color={theme.colors.text2} />}
        {label != null && label.length > 0 && (
          <Text numberOfLines={1} style={[styles.label, { color: theme.colors.text2 }]}>
            {label}
          </Text>
        )}
      </Pressable>
    )
  },
)

PillButton.displayName = 'NewUIPillButton'

const styles = StyleSheet.create({
  root: {
    height: BUTTON.pillHeight,
    paddingHorizontal: BUTTON.pillPaddingX,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: BUTTON.pillGap,
  },
  label: {
    fontSize: FONT_SIZE.smallLg,
    fontWeight: FONT_WEIGHT.bold,
  },
  /** .pl-open-btn:active 缩放反馈（原型 .95 / .mh-edit .96 取 .95） */
  pressed: {
    transform: [{ scale: 0.95 }],
  },
})
