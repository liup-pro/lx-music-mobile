import { memo, type ReactNode } from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'

import { CARD_GRID } from '@/newui/theme'

export interface CardGridProps {
  /** 卡片（PlCard 等）；单卡宽度由容器用 gridItemWidth 算出后传入 */
  children: ReactNode
  /** 行间隙，默认 CARD_GRID.rowGap（.pl-grid 的 14px） */
  rowGap?: number
  /** 列间隙，默认 CARD_GRID.columnGap */
  columnGap?: number
  style?: StyleProp<ViewStyle>
}

/**
 * 两列卡片网格（对应原型 .pl-grid / .radio-grid / .rank-grid 的 1fr 1fr + gap）。
 * RN 没有 CSS grid，这里用 flexWrap + gap 表达；列数与间隙默认取自 token，可按区块覆盖。
 */
export const CardGrid = memo(
  ({ children, rowGap = CARD_GRID.rowGap, columnGap = CARD_GRID.columnGap, style }: CardGridProps) => (
    <View style={[styles.root, { rowGap, columnGap }, style]}>{children}</View>
  ),
)

CardGrid.displayName = 'NewUICardGrid'

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
})
