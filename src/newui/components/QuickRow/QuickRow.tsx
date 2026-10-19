import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { FONT_SIZE, FONT_WEIGHT, QUICK_ROW, RADIUS, useTheme } from '@/newui/theme'

import { Art } from '../Art'
import { type IconName } from '../Icon'

export interface QuickEntry {
  /** 业务 key，容器据此分派动作（原型 QUICK[].key） */
  key: string
  /** 下方文案（.quick span） */
  label: string
  /** 封面块里的图标 */
  icon: IconName
  /** 封面种子，决定这一格的渐变底 */
  artSeed: string
}

export interface QuickRowProps {
  /** 入口列表（首页四格：每日推荐 / 排行榜 / 电台 / 我喜欢） */
  items: QuickEntry[]
  onPress: (key: string) => void
}

/**
 * 快捷入口四宫格（对应原型 .quick-row / .quick / .qa，styles.css L193-197）。
 * 纯展示组件：每格做什么（播放 / 切 Tab / 进电台首页）由容器分派。
 */
export const QuickRow = memo(({ items, onPress }: QuickRowProps) => {
  const theme = useTheme()
  return (
    <View style={styles.root}>
      {items.map((item) => (
        <Pressable
          key={item.key}
          style={({ pressed }) => [styles.cell, pressed && styles.pressed]}
          onPress={() => onPress(item.key)}
        >
          <Art
            width={QUICK_ROW.artSize}
            height={QUICK_ROW.artSize}
            radius={RADIUS.art}
            seed={item.artSeed}
            icon={item.icon}
            iconSize={QUICK_ROW.iconSize}
          />
          <Text numberOfLines={1} style={[styles.label, { color: theme.colors.text2 }]}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  )
})

QuickRow.displayName = 'NewUIQuickRow'

const styles = StyleSheet.create({
  /** grid-template-columns:repeat(4,1fr)，gap 8，margin-top 22 */
  root: {
    flexDirection: 'row',
    gap: QUICK_ROW.gap,
    marginTop: QUICK_ROW.marginTop,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: QUICK_ROW.labelGap,
  },
  /** .quick:active 缩放反馈 */
  pressed: {
    transform: [{ scale: 0.92 }],
  },
  /** .quick span 11.5px / 600（原型无字距） */
  label: {
    fontSize: FONT_SIZE.captionLg,
    fontWeight: FONT_WEIGHT.semibold,
  },
})
