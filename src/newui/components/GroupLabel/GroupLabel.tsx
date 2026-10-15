import { memo } from 'react'
import { StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native'

import { FONT_WEIGHT, OPTION_ROW, useTheme } from '@/newui/theme'

export interface GroupLabelProps {
  /** 标签文字（原型「已安装音源」「音乐平台」「音质」） */
  label: string
  style?: StyleProp<ViewStyle>
}

/**
 * 浮层分组小标（对应原型 .group-label，styles.css L670）：
 * 10.5 / 800 / 字距 1.3 / text-3，上 20 下 9。
 * sheet 内分组标题 ≥2 处出现（音源浮层三组 + 后续任何单选浮层），抽为共通组件。
 */
export const GroupLabel = memo(({ label, style }: GroupLabelProps) => {
  const theme = useTheme()
  return (
    <Text style={[styles.root, { color: theme.colors.text3 }, style]}>{label}</Text>
  )
})

GroupLabel.displayName = 'NewUIGroupLabel'

const styles = StyleSheet.create({
  root: {
    marginTop: OPTION_ROW.labelMarginTop,
    marginBottom: OPTION_ROW.labelMarginBottom,
    fontSize: OPTION_ROW.labelSize,
    fontWeight: FONT_WEIGHT.extraBold,
    letterSpacing: OPTION_ROW.labelLetterSpacing,
  },
})
