import { memo, type ReactNode } from 'react'
import {
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native'

import { LAYOUT, TAB_BAR, topbarHeight } from '@/newui/theme'

import { useViewportScroll } from './useViewportScroll'

export interface PageViewportProps {
  children: ReactNode
  /** 状态栏高度（TopBar 覆盖其上，内容上留白需等于顶栏总高） */
  topInset?: number
  /** 底部安全区（原型 --safe-b，与 Tab 栏一同叠加在内容留白之下） */
  bottomInset?: number
  /**
   * 吸顶状态变化（原型 app.js：viewport.scrollTop > 8 → topbar.pinned）。
   * 只在跨越阈值时回调一次，避免每帧刷新父组件。
   */
  onPinnedChange?: (pinned: boolean) => void
  /**
   * 触底回调（第 7b 轮排行榜分批续取）。不传 = 不启用，其它页面零影响。
   * 像素距底语义见 useViewportScroll（与原型 rankScroll 的 160px 判定逐字等价）。
   */
  onEndReached?: () => void
  /** 距底触发线（px），仅在传了 onEndReached 时生效；0 = 触到最底才发 */
  endReachedDistance?: number
  /**
   * 逐帧滚动偏移透传（QA 2026-10-14 D-06 分类条吸顶）：主屏用它算「分类条是否越过
   * 顶栏下沿」的越线态；只在跨越时 setState，同值不重渲染。不传 = 零开销。
   */
  onScrollOffset?: (y: number) => void
  contentContainerStyle?: StyleProp<ViewStyle>
}

/**
 * 页面滚动容器（对应原型 .viewport + .page）。
 * 左右 16px 内边距、上留白等于顶栏总高、下留白为 Tab 栏之上的 86px 净空（原型推算值）+ 安全区。
 * 切换 Tab 时父组件用 key 重挂载本组件，即可复现原型 switchTab 的 scrollTop = 0 复位。
 *
 * 三项滚动计量（顶栏吸顶 / 距底触底 / 偏移透传）收敛在共通 hook useViewportScroll，
 * 与虚拟化形态的兄弟件 PageListView 同源同口径（2026-10-16 歌单页推荐池 OOM 轮抽出，
 * 行为与本组件此前内联实现逐字一致）。
 */
export const PageViewport = memo(
  ({ children, topInset = 0, bottomInset = 0, onPinnedChange, onEndReached, endReachedDistance = 0, onScrollOffset, contentContainerStyle }: PageViewportProps) => {
    const scrollHandlers = useViewportScroll({ onPinnedChange, onEndReached, endReachedDistance, onScrollOffset })

    return (
      <ScrollView
        style={styles.root}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: topbarHeight(topInset),
            paddingBottom: LAYOUT.contentGapAboveTabBar + TAB_BAR.height + bottomInset,
          },
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        {...scrollHandlers}
      >
        {children}
      </ScrollView>
    )
  },
)

PageViewport.displayName = 'NewUIPageViewport'

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  /** .page padding:0 16px */
  content: {
    paddingHorizontal: LAYOUT.screenPaddingX,
  },
})
