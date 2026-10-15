import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PanResponder, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

// 直接复用旧 UI 进度条用的同一个拖拽计算 hook（纯 UI 工具，无状态副作用）：
// grant 时按 locationX 定一次位，之后只用 gestureState.dx 做相对位移，
// 不依赖 Android move 事件里不可靠的 locationX —— 这是旧 UI 100% 落位的关键之一
import { useDrag } from '@/utils/hooks/useDrag'

import { GRADIENTS, PLAYER, SHADOW, useTheme } from '@/newui/theme'

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value))
/** 旋钮是全圆：边长的一半（度量本身在 PLAYER.seekThumb） */
const THUMB_RADIUS = PLAYER.seekThumb / 2
/** 触区总高 = 条高 + 上下外扩（原型 .seek::before inset -14px -3px 的纵向部分；
 *  横向不外扩：拖拽层宽度必须与视觉条严格等宽，否则 locationX/宽度 的映射会偏，落位不准） */
const HIT_HEIGHT = PLAYER.seekHitPadY * 2 + PLAYER.seekHeight

export interface SeekControlProps {
  /** 播放进度 0..1（外部真相：store 的 nowPlayTime / maxPlayTime） */
  ratio: number
  /** 松手时提交一次跳转（0..1），由容器换算成秒接 app_event.setProgress */
  onCommit: (ratio: number) => void
  style?: StyleProp<ViewStyle>
}

interface PressLayerProps {
  onDragState: (dragging: boolean) => void
  setDragProgress: (progress: number) => void
  onSetProgress: (progress: number) => void
  onWidthChange: (width: number) => void
}

/**
 * 拖拽/点按层（对应旧 UI ProgressBar.tsx 的 PreassBar 与 Progress.tsx 的同名结构）：
 * 绝对铺满整条进度条 + 上下触区，手势在 capture 阶段就抢下 responder，
 * 保证 grant/move/release 一定回到这一层，不会被父层横滑手势半路截走（漏提交 = 「有时不成功」）。
 */
const PressLayer = memo(({ onDragState, setDragProgress, onSetProgress, onWidthChange }: PressLayerProps) => {
  const { onLayout, onDragStart, onDragEnd, onDrag } = useDrag(onSetProgress, onDragState, setDragProgress)

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    onLayout(e)
    onWidthChange(e.nativeEvent.layout.width)
  }, [onLayout, onWidthChange])

  // useState 惰性初始化：只创建一次，不像 useRef(PanResponder.create(...)) 那样每次渲染都白造一个
  const [panResponder] = useState(() =>
    PanResponder.create({
      // 与旧 UI 一致：走 Capture 通道，按下/移动都优先由本层接管手势
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      // 拒绝把 responder 让给其它视图（旧 UI 的进度条同样不预期被别的手势打断）
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt, gestureState) => {
        onDragStart(gestureState.dx, evt.nativeEvent.locationX)
      },
      onPanResponderMove: (_evt, gestureState) => {
        onDrag(gestureState.dx)
      },
      onPanResponderRelease: () => {
        onDragEnd()
      },
    }),
  )

  return <View onLayout={handleLayout} style={styles.press} {...panResponder.panHandlers} />
})
PressLayer.displayName = 'NewUISeekPressLayer'

/**
 * 播放进度条（对应原型 .seek，styles.css L558-566）：
 * 渐变填充 + 白色旋钮（主色光晕）；视觉条只有 5px，靠触区层撑出 33px 的点击高度。
 *
 * 落位机制（2026-10-15 按同事要求改回旧 UI 那一套，见 src/components/player/ProgressBar.tsx）：
 * 1. 拖拽期间显示的是**本地 dragProgress**，外部 ratio 每秒的轮询值不参与显示，
 *    因此不存在「回跳」，也不需要上一轮那套 2s 冻结保护窗口（已撤）。
 * 2. 点按定点与连续拖拽是同一条路径：grant 定一次位 → release 提交 dragProgress，
 *    没有第二套逻辑，两者落位精度一致。
 * 3. 提交即 app_event.setProgress，核心层会同步把 store 进度写成目标值再 seek 原生，
 *    所以松手瞬间交还给外部真相时，两者本来就是同一个数，视觉无缝接续。
 * 4. 显示用百分比 width 直写（旧 UI 手法），不用 Animated 追赶：
 *    动画插值会把「store 已等于目标」这一事实盖住，正是上一版随机回跳的来源。
 */
export const SeekControl = memo(({ ratio, onCommit, style }: SeekControlProps) => {
  const theme = useTheme()
  const [dragging, setDragging] = useState(false)
  const [dragProgress, setDragProgress] = useState(0)
  // 只有布局尺寸真的变了才重渲染（渐变需要确定像素宽度，不能按百分比铺）
  const [trackWidth, setTrackWidth] = useState(0)

  // onCommit 每换一首歌（maxPlayTime 变化）就是新引用，而手势层只创建一次：
  // 用 ref 取最新值，避免松手时调到上一首的 duration（旧 UI 的 durationRef 同一用意）
  const commitRef = useRef(onCommit)
  useEffect(() => {
    commitRef.current = onCommit
  }, [onCommit])

  const handleCommit = useCallback((progress: number) => {
    commitRef.current(progress)
  }, [])

  // 拖拽中显示手指位置，松手后显示真相
  const shown = dragging ? dragProgress : clamp01(ratio)
  const shownPct: `${number}%` = `${shown * 100}%`

  const fillStyle = useMemo(() => ({ width: shownPct }), [shownPct])

  return (
    <View style={[styles.hit, style]}>
      <View style={[styles.track, { backgroundColor: theme.colors.fill4 }]}>
        {/* 填充层：外层百分比裁切宽度，内层渐变固定为整条像素宽，
            这样渐变配色不随进度伸缩（等价原型 background-size 铺满轨道） */}
        {trackWidth > 0 && (
          <View style={[styles.fill, fillStyle]}>
            <LinearGradient
              colors={[...GRADIENTS.brand.colors]}
              start={GRADIENTS.brand.start}
              end={GRADIENTS.brand.end}
              style={{ width: trackWidth, height: '100%' }}
            />
          </View>
        )}
        {/* 旋钮圆心对齐进度点：left 走百分比，再静态左移半个旋钮 */}
        <View
          style={[
            styles.thumb,
            SHADOW.glow,
            // 旋钮恒为白：与开关旋钮同一色键（switchKnob 浅深两套都白）
            { backgroundColor: theme.colors.switchKnob, left: shownPct },
          ]}
        />
      </View>
      <PressLayer
        onDragState={setDragging}
        setDragProgress={setDragProgress}
        onSetProgress={handleCommit}
        onWidthChange={setTrackWidth}
      />
    </View>
  )
})

SeekControl.displayName = 'NewUISeekControl'

const styles = StyleSheet.create({
  /** 触区容器：撑出 .seek::before 那 33px 的可点高度 */
  hit: {
    height: HIT_HEIGHT,
  },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: PLAYER.seekHitPadY,
    height: PLAYER.seekHeight,
    borderRadius: PLAYER.seekRadius,
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: PLAYER.seekRadius,
    overflow: 'hidden',
  },
  thumb: {
    position: 'absolute',
    width: PLAYER.seekThumb,
    height: PLAYER.seekThumb,
    borderRadius: THUMB_RADIUS,
    top: (PLAYER.seekHeight - PLAYER.seekThumb) / 2,
    marginLeft: -THUMB_RADIUS,
  },
  /** 与旧 UI pressBar 同构：等宽于视觉条、纵向铺满触区、层级最高 */
  press: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: HIT_HEIGHT,
    zIndex: 6,
  },
})
