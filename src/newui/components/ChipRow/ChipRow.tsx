import { memo } from 'react'
import { ScrollView, StyleSheet } from 'react-native'

import { CHIP_ROW, LAYOUT } from '@/newui/theme'

import { Chip } from '../Chip'

export interface ChipRowItem {
  key: string
  label: string
}

/** 行尾入口胶囊（如「全部分类」）：不属于选项集，点击走自己的 onPress（开浮层），不参与 activeKey 判定 */
export interface ChipRowTrailing {
  label: string
  onPress: () => void
}

export interface ChipRowProps {
  /** 选项（原型 .rank-tabs 里的 4 个榜单 / .cat-row 里的分类） */
  items: ChipRowItem[]
  /** 当前选中项 key */
  activeKey: string
  onSelect: (key: string) => void
  /**
   * 形态：`tabs` = 首页榜单条 .rank-tabs（缺省）；`cat` = 歌单页分类条 .cat-row。
   * 两者的间距节奏不同（cat 贴屏边横滑、上下留白更大），颜色与 Chip 本身共用。
   */
  variant?: 'tabs' | 'cat'
  /** 行尾固定入口（可选）：渲染在全部选项之后，如歌单页「全部分类」 */
  trailing?: ChipRowTrailing
  /**
   * 吸顶紧凑形态（仅 `cat` 变体生效）：原型 .cat-row 的 sticky 盒只含自身 padding（3px 上 / 8px 下）
   * 与胶囊（28px），流内 margin（上 14）属于滚动内容占位、不进吸顶盒 —— 吸顶层置 true 剥掉，
   * 吸顶后条体高即 39px（原型实测「胶囊离顶栏下沿只有 3px」）。原位流内用法保持缺省 false。
   */
  sticky?: boolean
}

/**
 * 横向胶囊选择条（对应原型 .rank-tabs，styles.css L242-243；.cat-row，L322-329）。
 * 纯展示组件：数据与切换副作用由容器接线；超出宽度可横滑。
 * 已知近似：原型 .cat-row 是 sticky 吸顶 + 毛玻璃，本轮随页面普通滚动（README 已记录）。
 */
export const ChipRow = memo(({ items, activeKey, onSelect, variant = 'tabs', trailing, sticky = false }: ChipRowProps) => {
  const isCat = variant === 'cat'
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.root, isCat && styles.rootCat, isCat && sticky && styles.rootCatSticky]}
      contentContainerStyle={[styles.content, isCat && styles.contentCat]}
    >
      {items.map((item) => (
        <Chip
          key={item.key}
          label={item.label}
          active={item.key === activeKey}
          onPress={() => onSelect(item.key)}
        />
      ))}
      {trailing && (
        <Chip label={trailing.label} onPress={trailing.onPress} />
      )}
    </ScrollView>
  )
})

ChipRow.displayName = 'NewUIChipRow'

const styles = StyleSheet.create({
  /** .rank-tabs margin:-2px 0 12px（上边负值抵消 .section-head 的 12px 下边距，让胶囊贴题） */
  root: {
    marginTop: CHIP_ROW.marginTop,
    marginBottom: CHIP_ROW.marginBottom,
  },
  /** .cat-row margin:14px -16px 0 + margin-bottom 归 0（与后继 Section 的 26 折叠后有效间隙仍是 26，见 CHIP_ROW.catMarginBottom 注释） */
  rootCat: {
    marginTop: CHIP_ROW.catMarginTop,
    marginBottom: CHIP_ROW.catMarginBottom,
    marginHorizontal: -LAYOUT.screenPaddingX,
  },
  /** 吸顶紧凑形态：剥掉流内 margin（原型 sticky 盒不含 margin），只留 padding 3/8 + 胶囊 28 */
  rootCatSticky: {
    marginTop: 0,
  },
  content: {
    gap: CHIP_ROW.gap,
  },
  /** .cat-row padding:3px 16px 8px */
  contentCat: {
    gap: CHIP_ROW.gap,
    paddingTop: CHIP_ROW.catPaddingTop,
    paddingBottom: CHIP_ROW.catPaddingBottom,
    paddingHorizontal: LAYOUT.screenPaddingX,
  },
})
