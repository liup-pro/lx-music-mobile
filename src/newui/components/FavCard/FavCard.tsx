import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import { NEW_UI_PLD_LABELS } from '@/newui/const'
import {
  ART_INK,
  FONT_SIZE,
  FONT_WEIGHT,
  GRADIENTS,
  MINE,
  RADIUS,
  SHADOW,
  useTheme,
} from '@/newui/theme'
import { withAlpha } from '@/newui/utils'

import { Icon } from '../Icon'

/** .fc-go 圆钮的热区补足（视觉 32px → ≥44px 最小触达尺寸） */
const FAV_GO_HIT_SLOP = 8

export interface FavCardProps {
  /** 主标题（.fav-card h3，原型为「我喜欢」） */
  title: string
  /** 说明行（.fav-card p，如「12 首 · 晴天 · 稻香 · 七里香」）；空态文案由容器传入 */
  sub: string
  onPress?: () => void
  /** 圆钮「播放全部」；不传时圆钮为纯展示（不出现死按钮） */
  onPlayPress?: () => void
}

/**
 * 「我喜欢」入口卡（对应原型 .fav-card，styles.css L373-386）：
 * 品牌渐变洗底 + 爱心渐变方块 + 标题 / 首三曲预览 + 圆形播放按钮。
 * 纯展示组件；收藏数量与预览文案由容器接线。
 * 双动作口径（2026-10-14 用户条目）：圆钮 = 播放全部（onPlayPress）；
 * 卡片其余区域 = 打开「我喜欢」内置歌单详情（onPress）。RN 内层 Pressable
 * 会自己吃掉点击、不冒泡到外层卡片，无需额外处理。
 */
export const FavCard = memo(({ title, sub, onPress, onPlayPress }: FavCardProps) => {
  const theme = useTheme()
  // .fc-go 圆钮本体：32 圆底 rgba(0,0,0,.3) + 白 play 15；传了 onPlayPress 时由外层 Pressable 承接
  const favGo = (
    <View style={[styles.favGo, { backgroundColor: withAlpha(ART_INK.veil, MINE.favGoAlpha) }]}>
      <Icon name="play" size={MINE.favGoIcon} color={ART_INK.fg} />
    </View>
  )
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        // .fav-card 描边：原型 `inset 0 0 0 1px var(--line-strong)`（styles.css L433），
        // 直接取色板 lineStrong（深 rgba(255,255,255,.14) / 浅 rgba(21,22,28,.16)），随主题反相
        // ——此前固定压白 .13 的自造档在浅底上颜色族不对（QA D79）
        { borderColor: theme.colors.lineStrong },
        pressed && styles.pressed,
      ]}
    >
      {/* .fav-card 底色：120deg 粉紫渐变洗底（GRADIENTS.favWash） */}
      <LinearGradient
        colors={[...GRADIENTS.favWash.colors]}
        start={GRADIENTS.favWash.start}
        end={GRADIENTS.favWash.end}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />
      {/* .fc-art：62×62、圆角 17、--grad 主渐变底、爱心 25 */}
      <LinearGradient
        colors={[...GRADIENTS.brand.colors]}
        start={GRADIENTS.brand.start}
        end={GRADIENTS.brand.end}
        style={[styles.favArt, SHADOW.glow]}
      >
        <Icon name="heartFill" size={MINE.favArtIcon} color={theme.colors.onBrand} />
      </LinearGradient>
      <View style={styles.body}>
        <Text numberOfLines={1} style={[styles.title, { color: theme.colors.text }]}>
          {title}
        </Text>
        <Text numberOfLines={1} style={[styles.sub, { color: theme.colors.text2 }]}>
          {sub}
        </Text>
      </View>
      {/* .fc-go：圆钮 = 播放全部（onPlayPress 缺省时保持纯展示） */}
      {onPlayPress == null
        ? favGo
        : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={NEW_UI_PLD_LABELS.playAll}
            hitSlop={FAV_GO_HIT_SLOP}
            onPress={onPlayPress}
          >
            {favGo}
          </Pressable>
        )}
    </Pressable>
  )
})

FavCard.displayName = 'NewUIFavCard'

const styles = StyleSheet.create({
  /** .fav-card：row / align center / gap 13 / padding 14 / radius 22 / margin-top 20 */
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MINE.favGap,
    marginTop: MINE.favMarginTop,
    padding: MINE.favPadding,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  /** .fav-card:active scale(.99) */
  pressed: {
    transform: [{ scale: MINE.favPressScale }],
  },
  favArt: {
    width: MINE.favArtSize,
    height: MINE.favArtSize,
    borderRadius: MINE.favArtRadius,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  /** .fc-body：flex 1 / min-width 0 */
  body: {
    flex: 1,
    minWidth: 0,
  },
  /** h3 16px / 900 */
  title: {
    fontSize: FONT_SIZE.headingSm,
    fontWeight: FONT_WEIGHT.black,
  },
  /** p 11.5px / text-2 / margin-top 4 / 单行省略 */
  sub: {
    marginTop: MINE.favSubMarginTop,
    fontSize: FONT_SIZE.captionLg,
  },
  /** .fc-go：32×32 全圆居中 */
  favGo: {
    width: MINE.favGoSize,
    height: MINE.favGoSize,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
})
