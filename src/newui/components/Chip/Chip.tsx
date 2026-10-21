import { memo } from 'react'
import { Animated, Platform, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import { usePressFx } from '@/newui/hooks/usePressFx'
import {
  CONTROL,
  FONT_SIZE,
  FONT_WEIGHT,
  GRADIENTS,
  LETTER_SPACING,
  MOTION,
  RADIUS,
  SPACING,
  useTheme,
} from '@/newui/theme'

import { Icon, type IconName } from '../Icon'

/** 前置图标尺寸（28px 胶囊内留白后取 14） */
const ICON_SIZE = 14
/** .chip b / .song-row .rank 同款等宽族（原型 ui-monospace 的平台近似） */
const MONO_FONT = Platform.select({ ios: 'Menlo', default: 'monospace' })
/** `.chip:active{transform:scale(.94)}`；`.chip` 那条 transition 写的是 `.22s`，比其他件慢一拍 */
const CHIP_PRESS_SCALE = 0.94
/** 同上：`.22s` 就是 `MOTION.base`，不用 `MOTION.fast` */
const CHIP_PRESS_MS = MOTION.base

/** 按压反馈要动 `Pressable` 本体：套一层 `Animated.View` 会改掉 flex 布局，见 usePressFx 头注 */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export interface ChipProps {
  /** 文字标签 */
  label: string
  /**
   * 第二段等宽文字（原型 `#plIdSamples .chip b`，styles.css L775：ui-monospace / 700 / 11.5px）。
   * 用于「平台短名 + 歌单 ID」这类「前段正常字、后段是标识符」的样本胶囊（QA D87）；不传即单段。
   */
  monoLabel?: string
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
 * 选中态为品牌渐变底 + 深色字；未选中为 chips 覆盖色 + 1px 描边，按压缩至 .94（200ms 缓动，见 usePressFx）。
 */
export const Chip = memo(({ label, monoLabel, active = false, disabled = false, icon, onPress, style }: ChipProps) => {
  const theme = useTheme()
  // .chip:active 缩到 .94，`.22s` 缓动（原型那条 transition 是这一族里唯一的 .22 档）
  const pressFx = usePressFx({ scale: CHIP_PRESS_SCALE, duration: CHIP_PRESS_MS })
  const contentColor = active && !disabled ? theme.colors.onBrand : disabled ? theme.colors.text3 : theme.colors.text2
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={pressFx.onPressIn}
      onPressOut={pressFx.onPressOut}
      style={[
        styles.root,
        active && !disabled
          ? null
          : {
              // .chip 底 fill-2、.chip.dim 底 fill-1（原型 styles.css L149 / L157，QA D81）
              backgroundColor: disabled ? theme.colors.fill1 : theme.colors.fill2,
              borderWidth: 1,
              borderColor: theme.colors.hairline,
            },
        pressFx.animatedStyle,
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
            // .chip.dim 是 500（原型 L157），常规档 600、选中档 700（L148 / L155）——QA D81
            fontWeight: active && !disabled
              ? FONT_WEIGHT.bold
              : disabled
                ? FONT_WEIGHT.medium
                : FONT_WEIGHT.semibold,
          },
        ]}
      >
        {label}
      </Text>
      {monoLabel != null && (
        <Text numberOfLines={1} style={[styles.mono, { color: contentColor }]}>
          {monoLabel}
        </Text>
      )}
    </AnimatedPressable>
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
  /**
   * `.chip` 自身字号 12.5（FONT_SIZE.smallLg）。
   * **原型 `.chip{line-height:1}`（styles.css L147-157 / 件 parts/_base.css「.chip」原子）在 RN 侧不能直译**：
   * Android 上给一档与字号**等值**的 `lineHeight`，行盒比 CJK 粗体字形实际需要的还矮，字形会被行盒削掉，
   * 再叠加 `root` 的固定高（CONTROL.chipHeight=28）+ `overflow:'hidden'`，就是 2026-10-21 实机截图那条
   * 「分类标签胶囊里的中文只显示上半截」——那行 `lineHeight` 多余且有害，已撤。
   * 垂直居中没有别的机关，全靠盒模型交叉轴对齐：`root` 的 `alignItems/justifyContent:'center'`，
   * 以及 `ChipRow.contentCat` 的 `alignItems:'center'`（对应原型 `.cat-row{align-items:center}`）。
   * 不用 translate / 负 margin / paddingVertical 位移凑数（原型设计说明口径同样如此）。
   */
  label: {
    fontSize: FONT_SIZE.smallLg,
    letterSpacing: LETTER_SPACING.tight,
  },
  /** .chip b：等宽 11.5 / 700（styles.css L775） */
  mono: {
    fontFamily: MONO_FONT,
    fontSize: FONT_SIZE.captionLg,
    fontWeight: FONT_WEIGHT.bold,
  },
})
