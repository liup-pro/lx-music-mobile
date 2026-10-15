import { useWindowDimensions } from 'react-native'

import { CARD_GRID, gridItemWidth } from '@/newui/theme'

/**
 * 卡片网格里单卡的宽度（RN 无 CSS 的 1fr，封面是 1:1 必须先算出边长）。
 * 跟着 useWindowDimensions 走，横竖屏切换会自动重算。
 * @param columns 列数，默认取 CARD_GRID.columns（.pl-grid 的 2 列）
 * @param columnGap 列间隙，默认取 CARD_GRID.columnGap
 */
export const useGridItemWidth = (
  columns: number = CARD_GRID.columns,
  columnGap: number = CARD_GRID.columnGap,
): number => {
  const { width } = useWindowDimensions()
  return gridItemWidth(width, columns, columnGap)
}
