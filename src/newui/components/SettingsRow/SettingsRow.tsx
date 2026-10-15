import { memo } from 'react'
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import { FONT_WEIGHT, GRADIENTS, SETTINGS, useTheme } from '@/newui/theme'
import { withAlpha } from '@/newui/utils'

import { Icon, type IconName } from '../Icon'

export interface SettingsRowProps {
  /** .set-ic 左侧图标底（28×28 圆角 9） */
  icon: IconName
  /** .st-l b 主标题 */
  title: string
  /** .st-l em 一句话说明（原型单行、溢出省略） */
  hint?: string
  /** .st-r 右侧值文案（当前档位、缓存大小、版本号等）；不传则不渲染 */
  value?: string
  /** .st-r.hi：值用主色（「在用」这类选中回显） */
  valueHighlight?: boolean
  /** .set-row.on：图标底换 --grad-soft 渐变 + 主色图标（分组行家族自带的选中态） */
  selected?: boolean
  /**
   * 传入即成为可点行：右侧自动补 .st-r 尾部 chevron（原型 setRow 恒定带箭头）。
   * 不传则是纯展示行（不可点、无箭头），避免做出「点了没反应」的假行。
   */
  onPress?: () => void
  style?: StyleProp<ViewStyle>
}

/** 图标底 .set-ic：常规 glass 底 text-2 图标；.on 态 grad-soft 渐变底主色图标 */
const SettingsIconBox = memo(({ icon, selected }: { icon: IconName; selected: boolean }) => {
  const theme = useTheme()
  const glyph = (
    <Icon
      name={icon}
      size={SETTINGS.iconGlyphSize}
      color={selected ? theme.colors.brand : theme.colors.text2}
    />
  )
  if (selected) {
    return (
      <LinearGradient
        colors={[...GRADIENTS.brandSoft.colors]}
        start={GRADIENTS.brandSoft.start}
        end={GRADIENTS.brandSoft.end}
        style={styles.iconBox}
      >
        {glyph}
      </LinearGradient>
    )
  }
  return (
    <View style={[styles.iconBox, { backgroundColor: theme.colors.fill2 }]}>{glyph}</View>
  )
})
SettingsIconBox.displayName = 'NewUISettingsIconBox'

/**
 * 设定页通用行（对应原型 .set-row，styles.css L442-456）：
 * 图标底 + 标题/说明 + 可选右侧值与箭头；设定家族里所有行（外观三档、清缓存、关于）共用。
 * 纯展示组件：选中态（selected）、值文案、点击行为全部由容器接线。
 * 行间分隔线归组容器 SettingsGroup（原型 .set-row border-top 由 .set-list 上下文决定首行无线）。
 */
export const SettingsRow = memo(
  ({
    icon,
    title,
    hint,
    value,
    valueHighlight = false,
    selected = false,
    onPress,
    style,
  }: SettingsRowProps) => {
    const theme = useTheme()
    const showValue = value != null || onPress != null
    const body = (
      <View style={styles.inner} pointerEvents="none">
        <SettingsIconBox icon={icon} selected={selected} />
        <View style={styles.body}>
          <Text
            numberOfLines={1}
            style={[styles.title, { color: theme.colors.text }]}
          >
            {title}
          </Text>
          {hint != null && (
            <Text
              numberOfLines={1}
              style={[styles.hint, { color: theme.colors.text3 }]}
            >
              {hint}
            </Text>
          )}
        </View>
        {showValue && (
          <View style={styles.value}>
            {value != null && (
              <Text
                numberOfLines={1}
                style={[
                  styles.valueText,
                  { color: valueHighlight ? theme.colors.brand : theme.colors.text3 },
                ]}
              >
                {value}
              </Text>
            )}
            {onPress != null && (
              <Icon
                name="chevron"
                size={SETTINGS.valueIconSize}
                color={withAlpha(theme.colors.text3, SETTINGS.valueIconAlpha)}
              />
            )}
          </View>
        )}
      </View>
    )
    if (onPress == null) {
      return <View style={[styles.row, style]}>{body}</View>
    }
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.row,
          pressed && { backgroundColor: theme.colors.fill1 },
          style,
        ]}
      >
        {body}
      </Pressable>
    )
  },
)

SettingsRow.displayName = 'NewUISettingsRow'

const styles = StyleSheet.create({
  /** .set-row：gap 11 / padding 13 14（按压底色走 Pressable style 回调） */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SETTINGS.rowGap,
    paddingVertical: SETTINGS.rowPaddingY,
    paddingHorizontal: SETTINGS.rowPaddingX,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SETTINGS.rowGap,
  },
  /** .set-ic：28×28 圆角 9 居中 */
  iconBox: {
    width: SETTINGS.iconBoxSize,
    height: SETTINGS.iconBoxSize,
    borderRadius: SETTINGS.iconBoxRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** .st-l：flex:1 竖排 gap 2 */
  body: {
    flex: 1,
    flexDirection: 'column',
    gap: SETTINGS.bodyGap,
  },
  title: {
    fontSize: SETTINGS.titleSize,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: SETTINGS.titleLetterSpacing,
  },
  hint: {
    fontSize: SETTINGS.hintSize,
    lineHeight: SETTINGS.hintLineHeight,
  },
  /** .st-r：gap 4 */
  value: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SETTINGS.valueGap,
  },
  valueText: {
    fontSize: SETTINGS.valueSize,
    fontWeight: FONT_WEIGHT.semibold,
  },
})
