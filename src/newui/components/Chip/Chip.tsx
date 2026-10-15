import { memo } from 'react'
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {
  CONTROL,
  FONT_SIZE,
  FONT_WEIGHT,
  GRADIENTS,
  LETTER_SPACING,
  RADIUS,
  SPACING,
  useTheme,
} from '@/newui/theme'

import { Icon, type IconName } from '../Icon'

/** 前置图标尺寸（28px 胶囊内留白后取 14） */
const ICON_SIZE = 14

export interface ChipProps {
  /** 文字标签 */
  label: string
  /** .chip.on 选中态：品牌渐变底 + onBrand 深色字 */
  active?: boolean
  /**
   * 不可选态（2026-10-13 音质兜底条）：降显但仍可点击 ——
   * 点击回调由容器负责给出说明（如 toast），视觉上禁用 ≠ 死按钮。
   */
  disabled?: boolean
  /** 可选的前置图标（.chip 自带 gap:6px，文字为主时可不传） */
  icon?: IconName
  onPress?: () => void
  style?: StyleProp<ViewStyle>
}

/**
 * 胶囊筛选件（对应原型 .chip）：榜单 tabs / 音质选择 / 分类 / 热搜等复用。
 * 选中态为品牌渐变底 + 深色字；未选中为 chips 覆盖色 + 1px 描边，按压缩至 .94。
 */
export const Chip = memo(({ label, active = false, disabled = false, icon, onPress, style }: ChipProps) => {
  const theme = useTheme()
  const contentColor = active && !disabled ? theme.colors.onBrand : disabled ? theme.colors.text3 : theme.colors.text2
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        active && !disabled
          ? null
          : {
              backgroundColor: theme.colors.fill2,
              borderWidth: 1,
              borderColor: theme.colors.hairline,
            },
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {active && !disabled && (
        <LinearGradient
          colors={[...GRADIENTS.brand.colors]}
          start={GRADIENTS.brand.start}
          end={GRADIENTS.brand.end}
          style={StyleSheet.absoluteFill}
        />
      )}
      {icon != null && <Icon name={icon} size={ICON_SIZE} color={contentColor} />}
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          {
            color: contentColor,
            fontWeight: active && !disabled ? FONT_WEIGHT.bold : FONT_WEIGHT.semibold,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  )
})

Chip.displayName = 'NewUIChip'

const styles = StyleSheet.create({
  root: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.s,
    height: CONTROL.chipHeight,
    paddingHorizontal: CONTROL.chipPaddingX,
    borderRadius: RADIUS.control,
    overflow: 'hidden',
  },
  label: {
    fontSize: FONT_SIZE.smallLg,
    letterSpacing: LETTER_SPACING.tight,
  },
  /** .chip:active 缩放反馈 */
  pressed: {
    transform: [{ scale: 0.94 }],
  },
  /** 不可选态降显（语义见 ChipProps.disabled 注释：可点、点击必给说法） */
  disabled: {
    opacity: 0.55,
  },
})
