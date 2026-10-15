import { memo } from 'react'
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import { BRAND_AVATAR, FONT_WEIGHT, GRADIENTS, RADIUS, useTheme } from '@/newui/theme'

export interface BrandAvatarProps {
  /** 直径（px）；传 BRAND_AVATAR.top.size / BRAND_AVATAR.mine.size */
  size: number
  /** 首字字号；传对应 preset 的 textSize */
  textSize: number
  /** 首字文本（昵称首字，原型 renderProfile 让两处头像恒为同一个字） */
  text: string
  style?: StyleProp<ViewStyle>
}

/**
 * 品牌首字头像共通件（原型 .avatar-btn .avatar 与 .mh-art 的合一实现，styles.css L96-101 / L355-358）：
 * 品牌粉→紫对角渐变圆底 + 1px 高光描边 + 居中白色粗体首字。
 * 顶栏（TopBar）与「我的」页头部（MineHeader）共用，两处只按 preset 传直径与字号，
 * 渐变、字色、描边一套 token 说了算——修 2026-10-12 走查现象 1「两处头像样式不一致」。
 * 纯展示组件，点击包裹（Pressable）由使用方负责。
 */
export const BrandAvatar = memo(({ size, textSize, text, style }: BrandAvatarProps) => {
  const theme = useTheme()
  return (
    <View
      style={[
        styles.root,
        {
          width: size,
          height: size,
          borderRadius: RADIUS.full,
          borderWidth: BRAND_AVATAR.ringWidth,
          borderColor: theme.colors.lineStrong,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={[theme.colors.brand, theme.colors.brand2]}
        start={GRADIENTS.art.start}
        end={GRADIENTS.art.end}
        style={StyleSheet.absoluteFill}
      />
      <Text
        numberOfLines={1}
        style={[
          styles.text,
          { color: theme.colors.onGradient, fontSize: textSize, lineHeight: textSize * 1.2 },
        ]}
      >
        {text.slice(0, 1)}
      </Text>
    </View>
  )
})

BrandAvatar.displayName = 'NewUIBrandAvatar'

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  /** 原型 .avatar / .mh-art b 均为特粗体（800/900 归一到 extraBold） */
  text: {
    fontWeight: FONT_WEIGHT.extraBold,
  },
})
