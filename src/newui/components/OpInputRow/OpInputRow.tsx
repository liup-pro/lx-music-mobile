import { forwardRef, useState } from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {
  FONT_SIZE,
  FONT_WEIGHT,
  GRADIENTS,
  OP_BOX,
  SHADOW,
  useTheme,
} from '@/newui/theme'

export interface OpInputRowProps {
  value: string
  onChangeText: (text: string) => void
  /** .op-input placeholder（原型各 sheet 的输入提示语，容器从 const 传入） */
  placeholder: string
  /** .op-go 按钮文案 */
  goLabel: string
  onGo: () => void
  /** 进行中：按钮换 busyLabel、输入与按钮都不可再触发（原型无此态，真实异步补的） */
  busy?: boolean
  busyLabel?: string
  maxLength?: number
  keyboardType?: TextInputProps['keyboardType']
  autoCapitalize?: TextInputProps['autoCapitalize']
  autoCorrect?: boolean
  /** 挂载即聚焦（原型 openNameSheet 打开就 focus，app.js L555；Sheet 只在可见时挂载子件，autoFocus 时机正合适） */
  autoFocus?: boolean
  onSubmitEditing?: () => void
  style?: StyleProp<ViewStyle>
}

/**
 * 浮层「输入 + 主色按钮」行（对应原型 .op-box / .op-input / .op-go，styles.css L694-704）。
 * 抽自阶段 9d 的 SourceSheet 导入行，改昵称浮层（阶段 9e NameSheet）同款复用——
 * 一处定义、两处引用，token 全走 OP_BOX / GRADIENTS.brand。
 * ref 转发到 TextInput：原型 openNameSheet 打开即聚焦（app.js L555），由容器掌握时机。
 */
export const OpInputRow = forwardRef<TextInput, OpInputRowProps>(({
  value,
  onChangeText,
  placeholder,
  goLabel,
  onGo,
  busy = false,
  busyLabel,
  maxLength,
  keyboardType,
  autoCapitalize = 'none',
  autoCorrect = false,
  autoFocus,
  onSubmitEditing,
  style,
}, ref) => {
  const theme = useTheme()
  // .op-input:focus 主色描边（styles.css L698）
  const [focused, setFocused] = useState(false)
  return (
    <View style={[styles.root, style]}>
      <TextInput
        ref={ref}
        style={[
          styles.input,
          {
            backgroundColor: focused ? theme.colors.fill3 : theme.colors.fill2,
            borderColor: focused ? theme.colors.brand : theme.colors.line,
            color: theme.colors.text,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text3}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        keyboardType={keyboardType}
        maxLength={maxLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        editable={!busy}
        autoFocus={autoFocus}
        onSubmitEditing={onSubmitEditing}
      />
      <Pressable
        accessibilityRole="button"
        onPress={busy ? undefined : onGo}
        style={({ pressed }) => [
          styles.go,
          SHADOW.playerMain,
          pressed && !busy && styles.goPressed,
          busy && styles.goBusy,
        ]}
      >
        <LinearGradient
          colors={[...GRADIENTS.brand.colors]}
          start={GRADIENTS.brand.start}
          end={GRADIENTS.brand.end}
          style={StyleSheet.absoluteFill}
        />
        <Text style={[styles.goText, { color: theme.colors.onGradient }]}>
          {busy && busyLabel != null ? busyLabel : goLabel}
        </Text>
      </Pressable>
    </View>
  )
})

OpInputRow.displayName = 'NewUIOpInputRow'

const styles = StyleSheet.create({
  /** .op-box：row gap 9（组标题自带 margin-bottom 9，不再叠 16 上边距） */
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: OP_BOX.gap,
  },
  /** .op-input：42 高 / 13 圆角 / paddingX 14 / 13.5 字 */
  input: {
    flex: 1,
    minWidth: 0,
    height: OP_BOX.height,
    borderRadius: OP_BOX.inputRadius,
    paddingHorizontal: OP_BOX.inputPaddingX,
    // 原型常态 1px / focus 1.5px（styles.css L695-698）；RN 改宽会抖，恒取 focus 档
    borderWidth: OP_BOX.focusRingWidth,
    fontSize: FONT_SIZE.bodyLg,
  },
  /** .op-go：42 高 / paddingX 18 / 13 圆角 / 13.5 / 800 */
  go: {
    flexShrink: 0,
    height: OP_BOX.height,
    paddingHorizontal: OP_BOX.goPaddingX,
    borderRadius: OP_BOX.goRadius,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  /** .op-go:active scale(.955) */
  goPressed: {
    transform: [{ scale: OP_BOX.goPressScale }],
  },
  goBusy: {
    opacity: 0.6,
  },
  goText: {
    fontSize: FONT_SIZE.bodyLg,
    fontWeight: FONT_WEIGHT.extraBold,
  },
})
