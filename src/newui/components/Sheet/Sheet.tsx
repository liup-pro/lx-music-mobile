import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Animated,
  BackHandler,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { BlurView } from '@react-native-community/blur'

import {
  ART_INK,
  FONT_SIZE,
  FONT_WEIGHT,
  GLASS_PERF,
  MOTION,
  SHEET,
  Z_LAYER,
  useTheme,
} from '@/newui/theme'
import { withAlpha } from '@/newui/utils'

import { blurNativeRegistered } from '../Glass'

/** 原型 --ease: cubic-bezier(.22,.61,.36,1) */
const EASE = Easing.bezier(MOTION.easing[0], MOTION.easing[1], MOTION.easing[2], MOTION.easing[3])

export interface SheetProps {
  /** 显隐（false 时播完退场动画后自动卸载） */
  visible: boolean
  /** .sheet-title（20px / 900）；不传则不渲染（原型 #moreSheet 就没有标题行，只有 handle + 内容） */
  title?: string
  /** .sheet-sub（12.5px / text-3 / 行高 1.6）；不传则不渲染 */
  subtitle?: string
  /** 关闭（点遮罩 / Android 返回键都走它） */
  onClose: () => void
  /** .sheet-body 滚动内容（挂在标题/副题之下，原型 #psBody） */
  children: ReactNode
  /** 底部安全区（叠加在 30px 内边距之下） */
  bottomInset?: number
  /**
   * 滚动接近底部时回调（骨架自带 ScrollView 的 onScroll 距底判定，阈值 SHEET.endReachThreshold）
   * ——浮层内含分页列表时用（评论浮层加载更多），不传则不挂 onScroll、与旧行为完全一致。
   * 刻意复用骨架自带的这**唯一**一个 ScrollView 触发分页，不再往 children 里嵌第二层滚动容器
   * （嵌套 ScrollView/FlatList 会抢手势、造成滚不动的死区）。RN 0.73 ScrollViewProps 无
   * onEndReached（那是 VirtualizedList 专属），故用 onScroll 等价实现，连发由调用方挡重入。
   */
  onEndReached?: () => void
}

/**
 * 通用底部浮层（对应原型 .sheet，styles.css L706-723）：
 * 遮罩淡入 .3s + 体贴退场（原型 translateY 100%→0 / .4s，styles.css L715-720；RN 落地为窗口高像素位移，见 translateY 注释），
 * 圆角顶部 28 / 底部直角（原型 L712 底部 40px 是嵌合假机框 .screen L77 的 44px 圆角，真机贴屏底应为直角，第 14 轮口径），
 * surface2→surface 竖向渐变 + 顶边高光，max-height 78% 内滚动；点遮罩或 Android 返回键关闭。
 * 实现形态：所在屏幕根 View 内的 absolute-fill 覆盖层（原型 .sheet 就是所在层的 inset:0 子层，
 * 浮层不跨屏幕复用，因此不用 RNN Modal/新路由，改动最小、退场动画也最顺）。
 * 遮罩毛玻璃（原型 .sheet-mask L710 background rgba(0,0,0,.55) + backdrop-filter blur(3px)）：
 * 直挂共通依赖 @react-native-community/blur 的 BlurView（探测位与玻璃层共用 blurNativeRegistered），
 * 分层顺序照 CSS 语义 = 模糊像在下、.55 黑染色在上；原生模块未注册时退回纯半透明黑（与旧形态逐像素一致）。
 * 刻意不走 BlurredContainer 本体：它的降级语义是「不透明表面底」，遮罩要的降级是「透底的半透明黑」，
 * 两者不同族，强行套 spec 反而逼出 fallback 分支的特例，故此处只用 BlurView 原生件 + 共用探测位。
 */
export const Sheet = ({
  visible,
  title,
  subtitle,
  onClose,
  children,
  bottomInset = 0,
  onEndReached,
}: SheetProps) => {
  const theme = useTheme()
  const { height: windowHeight } = useWindowDimensions()
  // 退场动画播完前保持挂载（对齐原型 visibility 延迟 .42s）
  const [mounted, setMounted] = useState(visible)
  const progress = useMemo(() => new Animated.Value(visible ? 1 : 0), []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (visible) setMounted(true)
    const animation = Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: visible ? SHEET.bodyDuration : SHEET.exitDuration,
      easing: EASE,
      useNativeDriver: false, // 与遮罩 opacity、体贴 maxHeight 共用一条 JS 驱动 progress，不混用 native driver
    })
    animation.start(({ finished }) => {
      if (!visible && finished) setMounted(false)
    })
    return () => animation.stop()
  }, [visible, progress])

  // Android 物理返回键：浮层开着时先收浮层（原型 data-close 的等价路径）
  useEffect(() => {
    if (!visible) return
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose()
      return true
    })
    return () => subscription.remove()
  }, [visible, onClose])

  if (!mounted) return null

  // 原型 .sheet-body transform:translateY(100%)（styles.css L661 / L666）——「自身高度」的百分比；
  // RN 的 transform translateY 只接受 number（百分比字符串直接 invariant 崩溃，真机实测），
  // 且体贴高度随内容变化并被 max-height 78%（L662）截断，这里用窗口高像素值近似退场位移：
  // 体贴贴屏底，向下位移一整屏必然把它完全推出屏幕，视觉等价。
  // windowHeight 变化（转屏/折叠）时本行随重渲染重新 interpolate，位移自动跟新值，无需重建 progress。
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [windowHeight, 0],
  })

  return (
    <View style={styles.root} accessibilityViewIsModal>
      {/* .sheet-mask（styles.css L710）：rgba(0,0,0,.55) + backdrop-filter blur(3px)，点击关闭。
          CSS 的 backdrop-filter 模糊的是「元素身后内容」，background 画在模糊像之上 —— RN 对应分层：
          容器自身必须透底（Android BlurView 采样的是其窗口身后的原生绘制，容器若自带 .55 黑底会被
          一并糊进模糊像、等效加深两层），故 BlurView 在前（下）、染色层在后（上）；
          原生模块未注册时只渲染染色层 = 与改造前「纯半透明黑」逐像素一致，天然降级。 */}
      <Animated.View style={[styles.mask, { opacity: progress }]}>
        {blurNativeRegistered && (
          <BlurView
            style={StyleSheet.absoluteFill}
            blurAmount={SHEET.maskBlur}
            blurType={theme.scheme}
            // Android：染色由下方 maskTint 层承担，关掉库自带 overlay；
            // 是否逐帧重采样与三块常驻玻璃位同一开关（theme.GLASS_PERF，理由见 tokens.ts）。
            // 本遮罩是**整屏面积**的模糊：autoUpdate 打开时层内每滚一行都要把整屏重截图 + 重模糊，
            // 而浮层开着时身后那层页面并不动（只有层内列表在滚，且层内列表被体贴挡住），
            // 冻结快照在这里没有可观感代价，纯省开销。
            // iOS：系统「降低透明度」时原生落到的纯色兜底
            {...(Platform.OS === 'android'
              ? { overlayColor: 'transparent', autoUpdate: GLASS_PERF.androidAutoUpdate }
              : { reducedTransparencyFallbackColor: withAlpha(ART_INK.veil, SHEET.maskAlpha) })}
          />
        )}
        <View pointerEvents="none" style={styles.maskTint} />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="关闭面板"
        />
      </Animated.View>

      {/* .sheet-body：surface2→surface 渐变 + 顶边 1px 高光；78% 窗口高内滚动 */}
      <Animated.View
        style={[
          styles.bodyWrap,
          {
            transform: [{ translateY }],
            maxHeight: windowHeight * SHEET.maxHeightRatio,
          },
        ]}
      >
        <LinearGradient
          colors={[theme.colors.surface2, theme.colors.surface]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[
            styles.body,
            {
              borderTopColor: theme.colors.lineStrong,
              // 第 14 轮：底部改直角后删掉原 borderBottomColor 垫底 hack——当年是给 40px 底角
              // 与屏底 bg 的缝隙收口用的，直角后不存在缝隙，留着只误导分层
            },
          ]}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: SHEET.paddingBottom + bottomInset },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScroll={
              onEndReached
                ? (e) => {
                    // RN 0.73 的 ScrollViewProps 没有 onEndReached（那是 VirtualizedList 系专属），
                    // 这里用 onScroll 距底判定等价复刻：距底 < SHEET.endReachThreshold 即触发一次；
                    // 事件会连发，靠调用方（CommentSheet）的 isLoading/isEnd 挡重入，与旧 FlatList 同构。
                    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent
                    if (
                      contentOffset.y + layoutMeasurement.height >=
                      contentSize.height - SHEET.endReachThreshold
                    ) {
                      onEndReached()
                    }
                  }
                : undefined
            }
            scrollEventThrottle={MOTION.scrollThrottle}
          >
            {/* .sheet-handle：36×4 胶囊（原型 L721 background:var(--fill-4)） */}
            <View style={[styles.handle, { backgroundColor: theme.colors.fill4 }]} />
            {title != null && title.length > 0 && (
              <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
            )}
            {subtitle != null && subtitle.length > 0 && (
              <Text style={[styles.sub, { color: theme.colors.text3 }]}>{subtitle}</Text>
            )}
            {children}
          </ScrollView>
        </LinearGradient>
      </Animated.View>
    </View>
  )
}

Sheet.displayName = 'NewUISheet'

const styles = StyleSheet.create({
  /**
   * .sheet position:absolute inset:0 z-index:80
   * （RN：所在屏幕根 View 的最后一层 + 显式 `Z_LAYER.sheet`——详情层的列表本体也标了层叠数，
   * 浮层若只靠「排在最后」压住，会被带 zIndex 的内容盖在下面）
   */
  root: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: Z_LAYER.sheet,
  },
  mask: {
    ...StyleSheet.absoluteFillObject,
  },
  /** .sheet-mask 的 background 档（styles.css L710 rgba(0,0,0,.55)）：染色独立成层压在模糊像之上，
   *  不画在 mask 容器上——容器必须透底，Android BlurView 才糊得到「身后页面」而不是自身底色 */
  maskTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: withAlpha(ART_INK.veil, SHEET.maskAlpha),
  },
  bodyWrap: {
    width: '100%',
  },
  /** .sheet-body（styles.css L712）border-radius:28px 28px 40px 40px 的 RN 口径：
   *  顶部 28 原样，底部 40 是嵌合假机框圆角的补偿（见 SHEET.radiusBottom 注释），真机贴屏底改 0；
   *  inset 0 1px 0（顶边高光）转 1px 实描边 */
  body: {
    flexGrow: 0,
    borderTopLeftRadius: SHEET.radiusTop,
    borderTopRightRadius: SHEET.radiusTop,
    borderBottomLeftRadius: SHEET.radiusBottom,
    borderBottomRightRadius: SHEET.radiusBottom,
    borderTopWidth: 1,
    overflow: 'hidden',
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: SHEET.paddingX,
    paddingTop: SHEET.paddingTop,
  },
  /** .sheet-handle：margin 6 auto 14 */
  handle: {
    alignSelf: 'center',
    width: SHEET.handleWidth,
    height: SHEET.handleHeight,
    borderRadius: SHEET.handleRadius,
    marginTop: SHEET.handleMarginTop,
    marginBottom: SHEET.handleMarginBottom,
  },
  /** .sheet-title：20 / 900 */
  title: {
    fontSize: FONT_SIZE.sheetTitle,
    fontWeight: FONT_WEIGHT.black,
  },
  /** .sheet-sub：12.5 / text-3 / margin-top 5 / line-height 1.6 */
  sub: {
    marginTop: SHEET.subMarginTop,
    marginBottom: 0,
    fontSize: FONT_SIZE.smallLg,
    lineHeight: SHEET.subLineHeight,
  },
})
