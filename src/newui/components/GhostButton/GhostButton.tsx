import { memo } from 'react'
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native'

import { BUTTON, FONT_SIZE, FONT_WEIGHT, RADIUS, useTheme } from '@/newui/theme'

import { Icon, type IconName } from '../Icon'

export interface GhostButtonProps {
  /** 文案（.ghost-btn 内文字） */
  label: string
  /** 前置图标，如「播放全部」「随机播放」 */
  icon?: IconName
  onPress?: () => void
  disabled?: boolean
  /** 是否占满交叉轴，默认 true（.ghost-btn width:100%）；.pl-actions 里传 false 并配 style={{ flex: 1 }} */
  fill?: boolean
  style?: StyleProp<ViewStyle>
}

/**
 * 幽灵按钮（对应原型 .ghost-btn）：首页「播放全部」、歌单详情操作排等次级主操作。
 * 纯展示组件，外边距（原型 margin-top:12px）交由容器布局控制。
 */
export const GhostButton = memo(
  ({ label, icon, onPress, disabled, fill = true, style }: GhostButtonProps) => {
    const theme = useTheme()
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled ?? false }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.root,
          fill ? styles.fill : null,
          {
            backgroundColor: pressed && !disabled ? theme.colors.fill3 : theme.colors.fill2,
            borderColor: theme.colors.line,
          },
          pressed && !disabled && styles.pressed,
          disabled && styles.disabled,
          style,
        ]}
      >
        {icon != null && <Icon name={icon} size={BUTTON.ghostIcon} color={theme.colors.text2} />}
        <Text numberOfLines={1} style={[styles.label, { color: theme.colors.text2 }]}>
          {label}
        </Text>
      </Pressable>
    )
  },
)

GhostButton.displayName = 'NewUIGhostButton'

const styles = StyleSheet.create({
  root: {
    height: BUTTON.ghostHeight,
    borderRadius: RADIUS.control,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: BUTTON.ghostGap,
  },
  fill: {
    width: '100%',
  },
  label: {
    fontSize: FONT_SIZE.bodyLg,
    fontWeight: FONT_WEIGHT.bold,
  },
  /** .ghost-btn:active 缩放反馈 */
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.45,
  },
})
