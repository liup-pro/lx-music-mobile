import { memo } from 'react'
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {
  BUTTON,
  FONT_SIZE,
  FONT_WEIGHT,
  GRADIENTS,
  RADIUS,
  SHADOW,
  useTheme,
} from '@/newui/theme'
import { shade } from '@/newui/utils'

import { Icon, type IconName } from '../Icon'

/** .ghost-btn.solid:active 的 filter:brightness(.9)（_base L204）——RN 无滤镜，直接压渐变本身 */
const SOLID_PRESS_BRIGHTNESS = 0.9
/** 实心档常态 / 按压态的品牌渐变三端点（GRADIENTS.brand 的 shade 派生，不另立色） */
const SOLID_COLORS = [...GRADIENTS.brand.colors] as string[]
const SOLID_COLORS_PRESSED = SOLID_COLORS.map(color => shade(color, SOLID_PRESS_BRIGHTNESS))

export interface GhostButtonProps {
  /** 文案（.ghost-btn 内文字） */
  label: string
  /** 前置图标，如「播放全部」「随机播放」 */
  icon?: IconName
  onPress?: () => void
  disabled?: boolean
  /** 是否占满交叉轴，默认 true（.ghost-btn width:100%）；.pl-actions 里传 false 并配 style={{ flex: 1 }} */
  fill?: boolean
  /**
   * .ghost-btn.solid（原型 _base.css L202 / L204，源 styles.css L330-L331）：
   * 这一页唯一的主动作铺实心品牌渐变 + onBrand 墨色字 + 主色光晕，按下压暗一档；
   * 缺省 false，原子档（--fill-2 灰底 + 描边）不变。
   */
  solid?: boolean
  style?: StyleProp<ViewStyle>
}

/**
 * 幽灵按钮（对应原型 .ghost-btn）：首页「播放全部」、歌单详情操作排等次级主操作。
 * 纯展示组件，外边距（原型 margin-top:12px）交由容器布局控制。
 * 实心档（solid，歌单详情「播放全部」）见上面 props 注释：与「我喜欢」卡的实心块
 * 同一套写法（GRADIENTS.brand + theme.colors.onBrand，色板 token，无硬编码十六进制）。
 */
export const GhostButton = memo(
  ({ label, icon, onPress, disabled, fill = true, solid = false, style }: GhostButtonProps) => {
    const theme = useTheme()

    // .ghost-btn.solid：品牌渐变铺底、深色墨、主色光晕；按压 = scale(.98) + brightness(.9)
    if (solid) {
      const ink = theme.colors.onBrand
      return (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: disabled ?? false }}
          disabled={disabled}
          onPress={onPress}
          style={({ pressed }) => [
            styles.root,
            styles.solid,
            fill ? styles.fill : null,
            SHADOW.ghostSolid,
            pressed && !disabled && styles.pressed,
            disabled && styles.disabled,
            style,
          ]}
        >
          {({ pressed }) => (
            <>
              {/* .ghost-btn.solid:active 的 brightness(.9) —— 渐变三端点整体压暗一档（shade 派生） */}
              <LinearGradient
                colors={pressed && !disabled ? SOLID_COLORS_PRESSED : SOLID_COLORS}
                start={GRADIENTS.brand.start}
                end={GRADIENTS.brand.end}
                pointerEvents="none"
                style={StyleSheet.absoluteFill}
              />
              {icon != null && <Icon name={icon} size={BUTTON.ghostIcon} color={ink} />}
              <Text numberOfLines={1} style={[styles.label, { color: ink }]}>
                {label}
              </Text>
            </>
          )}
        </Pressable>
      )
    }

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
  /**
   * .ghost-btn.solid：box-shadow 被主色光晕整条替换（原型 L330 覆盖 L322 的 inset 描边），
   * 所以实心档去掉 1px 描边；overflow 让渐变裁到 14 圆角上。
   */
  solid: {
    borderWidth: 0,
    overflow: 'hidden',
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
