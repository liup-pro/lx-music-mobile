import { memo, useCallback, useRef, type ReactNode } from 'react'
import {
  ScrollView,
  StyleSheet,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native'

import { LAYOUT, TAB_BAR, TOP_BAR, topbarHeight } from '@/newui/theme'

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
   * RN 自带的 onEndReachedThreshold 是「视口高度的倍数」，跨机型换算不出原型
   * 「距底 160px」的固定像素语义，所以这里基于 handleScroll 已记录的三个滚动量
   * （offset / 内容高 / 视口高）自算剩余距离，语义与 app.js rankScroll L534
   * `scrollTop + clientHeight > scrollHeight - 160` 逐字等价；出窗口再回来才重新触发（边沿触发）。
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
 */
export const PageViewport = memo(
  ({ children, topInset = 0, bottomInset = 0, onPinnedChange, onEndReached, endReachedDistance = 0, onScrollOffset, contentContainerStyle }: PageViewportProps) => {
    const pinnedRef = useRef(false)
    const callbackRef = useRef(onPinnedChange)
    callbackRef.current = onPinnedChange
    // 滚动偏移透传：与 onPinnedChange 同款 ref 转发，回调换引用不引起 ScrollView 属性抖动
    const scrollOffsetRef = useRef(onScrollOffset)
    scrollOffsetRef.current = onScrollOffset
    // 触底透传：与 onPinnedChange 同款 ref 转发，回调换引用不引起 ScrollView 属性抖动
    const endReachedRef = useRef(onEndReached)
    endReachedRef.current = onEndReached
    const endReachedDistanceRef = useRef(endReachedDistance)
    endReachedDistanceRef.current = endReachedDistance
    // 边沿触发：一次进入触发线只发一次，离开后再进来才重新发（数据追加后距底被拉开，自然复位）。
    // 2026-10-15 修复「滑到底不自动触发、要下滑再上滑」：这个标志旧逻辑**只在滚动事件里复位**——
    // 请求在途/失败期间用户停手，或补回来的内容没把用户推出触发线时，标志一直挂着 true，
    // 直到用户先滚出触发线再滚回来才重新发信号。现补两条复位/重估通道：
    // ① 内容尺寸或视口布局一变（下一页渲染完、状态行/终点行出现、补齐渲染）就重新评估；
    // ② 评估时把偏移按新内容高度钳位（内容变短时平台的钳位不回抛 onScroll，同 evaluate 的教训）。
    const endReachedFiredRef = useRef(false)
    // 吸顶状态的三个输入：最近一次滚动偏移 / 内容高 / 视口高。
    // 三者任一变化都要重算 —— 首页就地换榜单（点 .rank-tabs 里的另一个榜）时，
    // 新内容更短，平台会把偏移钳到新的最大值，而**钳位不一定回抛 onScroll**，
    // 只听 onScroll 的话状态会停在旧值上（2026-10-12 走查现象 3 的成因之一）。
    const offsetRef = useRef(0)
    const contentHeightRef = useRef(0)
    const viewportHeightRef = useRef(0)

    const evaluate = useCallback(() => {
      const maxOffset = Math.max(0, contentHeightRef.current - viewportHeightRef.current)
      const next = Math.min(offsetRef.current, maxOffset) > TOP_BAR.pinnedThreshold
      if (next === pinnedRef.current) return
      pinnedRef.current = next
      callbackRef.current?.(next)
    }, [])

    /** 触底判定（滚动 / 内容尺寸变化 / 视口布局变化三处共用）：
     * 剩余距离 = 内容高 - 视口高 - 当前偏移（按新内容高钳位），与原型
     * `vp.scrollTop + vp.clientHeight > vp.scrollHeight - 160` 同式；
     * 进线发信号（边沿一次），出线复位标志——下一页到位后用户若仍贴底，
     * 不必先滚开再滚回来才能续取（2026-10-15 修复的核心就在这一句重估）。 */
    const checkEndReached = useCallback(() => {
      if (!endReachedRef.current) return
      const viewport = viewportHeightRef.current
      const content = contentHeightRef.current
      // 首帧还没测得布局（0×0）时不判定，免得把「未测量」当成「已触底」空发信号
      if (viewport <= 0 || content <= 0) return
      const maxOffset = Math.max(0, content - viewport)
      const remaining = content - viewport - Math.min(offsetRef.current, maxOffset)
      if (remaining <= endReachedDistanceRef.current) {
        if (!endReachedFiredRef.current) {
          endReachedFiredRef.current = true
          endReachedRef.current()
        }
      } else {
        endReachedFiredRef.current = false
      }
    }, [])

    const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
      offsetRef.current = e.nativeEvent.contentOffset.y
      evaluate()
      scrollOffsetRef.current?.(offsetRef.current)
      checkEndReached()
    }, [checkEndReached, evaluate])

    const handleContentSizeChange = useCallback((_width: number, height: number) => {
      contentHeightRef.current = height
      evaluate()
      // 内容一变先解除边沿锁（新数据到位 = 上一轮触发已有结果，允许再判一次），再就地重估：
      // 甩动到底后补齐渲染、失败/空页只加一行状态尾巴等场景都靠这里补发，不再要求用户来回滚
      endReachedFiredRef.current = false
      checkEndReached()
    }, [checkEndReached, evaluate])

    const handleLayout = useCallback((e: LayoutChangeEvent) => {
      viewportHeightRef.current = e.nativeEvent.layout.height
      evaluate()
      checkEndReached()
    }, [checkEndReached, evaluate])

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
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleLayout}
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
