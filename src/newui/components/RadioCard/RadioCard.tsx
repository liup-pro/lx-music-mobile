import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import {
  FONT_SIZE,
  FONT_WEIGHT,
  LETTER_SPACING,
  RADIO_CARD,
  RADIUS,
  useTheme,
} from '@/newui/theme'
import { withAlpha } from '@/newui/utils'

import { Art } from '../Art'
import { Icon, type IconName } from '../Icon'

export interface RadioCardProps {
  /** 单卡宽度（两列网格由容器用 gridItemWidth 算出） */
  width: number
  /** 电台名（h4） */
  title: string
  /** 一句话说明（p） */
  sub: string
  /** 封面种子（.bgart，原型压到 .5 透明度） */
  artSeed: string
  /** 左上角图标（原型按 kind 取波形 / 爱心） */
  icon: IconName
  /** 右上角状态胶囊文案（.wip-tag），如「建设中」 */
  tag?: string
  onPress?: () => void
}

/**
 * 随手听卡（对应原型 .radio-card，styles.css L292-302）：渐变纹打底、左上图标、左下标题、右上状态胶囊。
 * 纯展示组件；电台目前是原型标注的「建设中」，动作由容器决定。
 */
export const RadioCard = memo(
  ({ width, title, sub, artSeed, icon, tag, onPress }: RadioCardProps) => {
    const theme = useTheme()
    return (
      <Pressable
        style={({ pressed }) => [
          styles.root,
          { width, borderColor: theme.colors.line },
          pressed && styles.pressed,
        ]}
        onPress={onPress}
      >
        <Art
          width={width}
          height={RADIO_CARD.height}
          radius={0}
          seed={artSeed}
          style={styles.art}
        />
        <Icon
          name={icon}
          size={RADIO_CARD.iconSize}
          color={withAlpha(theme.colors.text, RADIO_CARD.iconOpacity)}
          style={styles.icon}
        />
        <View style={styles.bottom}>
          <Text numberOfLines={1} style={[styles.title, { color: theme.colors.text }]}>
            {title}
          </Text>
          <Text numberOfLines={1} style={[styles.sub, { color: theme.colors.text2 }]}>
            {sub}
          </Text>
        </View>
        {tag ? (
          <View
            style={[styles.tag, { backgroundColor: theme.colors.glassPatch, borderColor: theme.colors.line }]}
          >
            <Text style={[styles.tagText, { color: theme.colors.glassPatchInk }]}>{tag}</Text>
          </View>
        ) : null}
      </Pressable>
    )
  },
)

RadioCard.displayName = 'NewUIRadioCard'

const styles = StyleSheet.create({
  root: {
    height: RADIO_CARD.height,
    borderRadius: RADIUS.m,
    borderWidth: 1,
    overflow: 'hidden',
    flexShrink: 0,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  /** .bgart：铺满并压暗到 .5（原型 opacity:.5） */
  art: {
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: RADIO_CARD.artOpacity,
  },
  /** .ic-top：左上角图标（原型 top/left 16；改版后 .ic-top 是 color:var(--text)——
   * 卡片是半透明封面压在页面底色上，底色跟主题走，图标也随主题反相，不锁白） */
  icon: {
    position: 'absolute',
    top: RADIO_CARD.iconOffset,
    left: RADIO_CARD.iconOffset,
  },
  /** h4 + p：贴左下（原型 justify-content:flex-end + padding 16） */
  bottom: {
    position: 'absolute',
    right: RADIO_CARD.padding,
    bottom: RADIO_CARD.padding,
    left: RADIO_CARD.padding,
  },
  /** h4 15px / 800（15 这个档位与 FONT_SIZE.status 同值，沿用字阶不另开键；原型无字距） */
  title: {
    fontSize: FONT_SIZE.status,
    fontWeight: FONT_WEIGHT.extraBold,
  },
  sub: {
    marginTop: RADIO_CARD.subMarginTop,
    fontSize: FONT_SIZE.caption,
  },
  /** .wip-tag：右上「建设中」玻璃贴片（原型 L335-337：底 var(--glass)=colors.glassPatch、
   *  描边 inset 1px var(--line)、字色 var(--glass-ink)=colors.glassPatchInk，blur(10) 走贴片实心 token 近似） */
  tag: {
    position: 'absolute',
    top: RADIO_CARD.wipTop,
    right: RADIO_CARD.wipRight,
    paddingVertical: RADIO_CARD.wipPaddingY,
    paddingHorizontal: RADIO_CARD.wipPaddingX,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  tagText: {
    fontSize: FONT_SIZE.micro,
    fontWeight: FONT_WEIGHT.extraBold,
    letterSpacing: LETTER_SPACING.wide,
  },
})
