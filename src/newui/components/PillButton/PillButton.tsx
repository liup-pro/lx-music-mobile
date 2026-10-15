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
  /**
   * 原型形态档（QA D85）：这两件规格几乎一致但差在两处细节——
   * - 'open'（缺省，= .pl-open-btn）：左右内衬同 13，按压缩放 .95；
   * - 'edit'（= .mh-edit）：左内衬 11 / 右 13，按压缩放 .96。
   */
  variant?: 'open' | 'edit'
  style?: StyleProp<ViewStyle>
}

/**
 * 小胶囊按钮（对应原型 .pl-open-btn / .mh-edit，两者规格几乎一致故合并为一件，
 * 差异走 variant 档位：左内衬与按压缩放各一档，见 PillButtonProps.variant）。
 * 用于卡内 / 区段头的轻操作入口，不占满整行。
 */
export const PillButton = memo(
  ({ label, icon, onPress, iconSize = BUTTON.pillIcon, variant = 'open', style }: PillButtonProps) => {
    const theme = useTheme()
    const isEdit = variant === 'edit'
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
          isEdit && { paddingLeft: BUTTON.pillPaddingLeftEdit },
          pressed && { transform: [{ scale: isEdit ? BUTTON.pillPressScaleEdit : BUTTON.pillPressScale }] },
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
})
