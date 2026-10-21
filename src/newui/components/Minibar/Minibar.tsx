import { memo, useCallback, useMemo, useState } from 'react'
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {
  FONT_SIZE,
  FONT_WEIGHT,
  GLASS,
  GRADIENTS,
  MINIBAR,
  SHADOW,
  useTheme,
} from '@/newui/theme'

// 直连具体 hook（不走 @/newui/hooks 桶口），与 PageViewport / TabBar 同一做法
import { usePressFx } from '@/newui/hooks/usePressFx'
import { useSmoothProgress } from '@/newui/hooks/useSmoothProgress'
import { useWideLayout } from '@/newui/hooks/useWideLayout'

import { Art } from '../Art'
import { Icon } from '../Icon'
import { BlurredContainer } from '../Glass'
import { QTag } from '../QTag'
import { SrcBadge } from '../SongRow'

/** 按压反馈要动 `Pressable` 本体：套一层 `Animated.View` 会改掉 flex 布局，见 usePressFx 头注 */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export interface MinibarProps {
  /** 封面种子（'album:' + 专辑名，同播放页口径） */
  artSeed: string
  /** 封面图地址（无图时 Art 画程序化底） */
  artUri?: string
  /** 曲名（.mini-title） */
  title: string
  /** 歌手（.mini-sub 尾段，可截尾） */
  artist: string
  /** 平台简称（.src-badge label；本地曲目无平台色，缺省用三级文字色） */
  sourceLabel: string
  /** 平台 tint（.src-badge --tint） */
  sourceTint?: string
  /** 音质标签（.q-tag，副行第二段）；空串（本地曲目）则角标与其后置分隔条整段不渲染 */
  qualityLabel: string
  /** 是否在播（决定 play/pause 图标） */
  playing: boolean
  /** 已收藏（心钮亮主色） */
  loved: boolean
  /** 播放进度 0..1（顶部 2px 细进度） */
  ratio: number
  /** 点整条 = 展开播放页（原型 minibar click → player） */
  onPress: () => void
  onTogglePlay: () => void
  onToggleFav: () => void
  /** 下一曲（2026-10-13 bug-fix「首页」第 2 条：原型 minibar 本无此钮，按用户口径新增于播停右侧） */
  onPlayNext: () => void
  style?: StyleProp<ViewStyle>
}

/**
 * 迷你播放条（对应原型 .minibar，styles.css L453-477）：
 * 顶部 2px 渐变进度 + 封面 / 曲名 / 「平台·音质·歌手」+ 收藏、播停圆钮与下一曲钮
 * （副行四段顺序对齐原型 .mini-sub：平台角标 → 音质角标 QTag → 分隔条 → 歌手，
 * 音质为空串的本地曲目时角标与分隔条整段省略；下一曲为 2026-10-13 bug-fix「首页」第 2 条按用户口径新增，原型无此钮）。
 * 底色（2026-10-13 bug-fix「首页」第 1 条，对齐原型毛玻璃；原型 .minibar 底为
 * var(--glass)（= colors.glassPatch，深 rgba(10,10,16,.74) / 浅 rgba(255,255,255,.82)）
 * + backdrop-filter blur(28px) saturate(180%)）——底色层走共通件 `BlurredContainer`
 * （玻璃规格 theme.GLASS.minibar：真模糊 + glassPatch 染色；2c 轮 tint 基色已切到 glassPatch，
 * 两条渲染路径共用同一染色层，天然同源），两条历史口径同时满足：
 * 1. **与内容分层不糊成一片**（2026-10-12 修复）：模糊像 + 半透明染色天然与锐利滚过的内容分层；
 *    真模糊不可用（原生模块缺失/位点 enabled=false）时玻璃层自动退回**不透明 surface2 底层**
 *    （垫在 glassPatch 染色层之下保底不透明）；
 * 2. 底层 pointerEvents="none"，点击仍归整条 Pressable 与其上的圆钮；
 * 3. 浮在滚动内容之上的层叠数由容器（MinibarDock）经 Z_LAYER.minibar 显式声明，
 *    组件本体保持纯展示、不关心自己排在第几层。
 * 纯展示组件：进度每秒由容器（MinibarDock）传入，此处不订阅 store；
 * 只把「一拍一步」抹成 300ms 线性补间（原型 `.mini-progress i` 的 transition，判据见 hooks/useSmoothProgress）。
 */
export const Minibar = memo(
  ({
    artSeed,
    artUri,
    title,
    artist,
    sourceLabel,
    sourceTint,
    qualityLabel,
    playing,
    loved,
    ratio,
    onPress,
    onTogglePlay,
    onToggleFav,
    onPlayNext,
    style,
  }: MinibarProps) => {
    const theme = useTheme()
    /**
     * `.mini-act:active{transform:scale(.9)}`（styles.css L682）。原型这条规则所在的 `.mini-act`
     * 没有写 transition（`.mini-bar` 那族也没给 transform 时长），与 `.pc` / `.pt-btn` 同族；
     * 这里沿用家族缺省 200ms 补间，三颗圆钮各持一条 Value（互不串）。
     */
    const favFx = usePressFx({ scale: MINIBAR.pressScale })
    const playFx = usePressFx({ scale: MINIBAR.pressScale })
    const nextFx = usePressFx({ scale: MINIBAR.pressScale })
    // 高按档覆盖：宽屏档 52（原型 `.wide .minibar{height:52px}`，styles.css:1326），
    // compact 回 MINIBAR.height 的 58 基线（判据只在 useWideLayout 一处）
    const { wide } = useWideLayout()
    // 进度仍是容器每秒传进来的真值，补间只抹平「一拍一步」：判据（回退/跳变立即落位）在 hook 里
    const { value: progressValue } = useSmoothProgress(ratio)
    // 渐变要按整条像素宽铺（等价原型 background-size），所以先量一次细进度条的宽度
    const [trackWidth, setTrackWidth] = useState(0)
    const handleTrackLayout = useCallback((e: LayoutChangeEvent) => {
      setTrackWidth(e.nativeEvent.layout.width)
    }, [])
    const fillWidth = useMemo(
      () => progressValue.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
      [progressValue],
    )
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={[styles.root, { height: wide?.minibarHeight ?? MINIBAR.height, borderColor: theme.colors.line }, SHADOW.float, style]}
      >
        {/* 玻璃底：真模糊（blur 28）+ glassPatch 贴片染色（原型 .minibar background:var(--glass)，
            GLASS.minibar tintBase='glassPatch'，深浅两套各按 token 自身 alpha）；
            不可用时退回不透明 surface2 底层，染色层两路径同源 */}
        <BlurredContainer spec={GLASS.minibar} />
        {/* .mini-progress：底为控件叠色 fill-2（原型 L529 background:var(--fill-2)，
            结构件叠色 fill-4 是 .seek 那条规则，与此不是同一档），填充为品牌渐变。
            `.mini-progress i{transition:width .3s linear}`（styles.css L671）→ 外层百分比裁切宽度做补间，
            内层渐变固定为整条像素宽，配色不随进度伸缩（同 SeekControl 同一套写法） */}
        <View
          pointerEvents="none"
          onLayout={handleTrackLayout}
          style={[styles.progressTrack, { backgroundColor: theme.colors.fill2 }]}
        >
          {trackWidth > 0 && (
            <Animated.View style={[styles.progressFill, { width: fillWidth }]}>
              <LinearGradient
                colors={[...GRADIENTS.brand.colors]}
                start={GRADIENTS.brand.start}
                end={GRADIENTS.brand.end}
                style={{ width: trackWidth, height: '100%' }}
              />
            </Animated.View>
          )}
        </View>

        <View style={styles.main}>
          <View style={styles.artWrap}>
            <Art
              width={MINIBAR.artSize}
              height={MINIBAR.artSize}
              radius={MINIBAR.artRadius}
              seed={artSeed}
              imageUri={artUri}
            />
          </View>
          <View style={styles.meta}>
            <Text numberOfLines={1} style={[styles.title, { color: theme.colors.text }]}>
              {title}
            </Text>
            <View style={styles.subRow}>
              {/* 副行顺序对齐原型（app.js L1700 / styles.css L533 .mini-sub）：
                  平台角标 → 音质角标（真 QTag 组件，非纯文本）→ 分隔条 → 歌手；
                  本地曲目 qualityLabel 为空串时 QTag 与其后置分隔条整段不渲染，
                  避免孤零零一根 sep（同 SongRow 轮 4 四段口径） */}
              <SrcBadge label={sourceLabel} tint={sourceTint ?? theme.colors.text3} />
              {qualityLabel ? <QTag label={qualityLabel} /> : null}
              {artist.length > 0 && (
                <>
                  {qualityLabel ? (
                    <View style={[styles.sep, { backgroundColor: theme.colors.lineStrong }]} />
                  ) : null}
                  <Text numberOfLines={1} style={[styles.subText, { color: theme.colors.text3 }]}>
                    {artist}
                  </Text>
                </>
              )}
            </View>
          </View>

          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel="喜欢"
            onPress={onToggleFav}
            onPressIn={favFx.onPressIn}
            onPressOut={favFx.onPressOut}
            style={[styles.act, favFx.animatedStyle]}
          >
            <Icon
              name={loved ? 'heartFill' : 'heart'}
              size={MINIBAR.actIcon}
              color={loved ? theme.colors.brand : theme.colors.text2}
            />
          </AnimatedPressable>
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel="播放/暂停"
            onPress={onTogglePlay}
            onPressIn={playFx.onPressIn}
            onPressOut={playFx.onPressOut}
            style={[styles.act, styles.actPrimary, SHADOW.miniPrimary, playFx.animatedStyle]}
          >
            <LinearGradient
              colors={[...GRADIENTS.brand.colors]}
              start={GRADIENTS.brand.start}
              end={GRADIENTS.brand.end}
              style={StyleSheet.absoluteFill}
            />
            <Icon
              name={playing ? 'pause' : 'play'}
              size={MINIBAR.primaryIcon}
              color={theme.colors.onBrand}
            />
          </AnimatedPressable>
          {/* 下一曲（2026-10-13 bug-fix「首页」第 2 条）：原型 .minibar 只有收藏 + 播停两枚，
              按用户口径在播停右侧新增一枚；视觉节奏与收藏钮同款（.mini-act 34 圆底 / 19 图标 / text-2），
              不缩封面不截曲名。无队列/单曲时行为由 core/player.playNext 自身兜底，不做假 disabled */}
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel="下一曲"
            onPress={onPlayNext}
            onPressIn={nextFx.onPressIn}
            onPressOut={nextFx.onPressOut}
            style={[styles.act, nextFx.animatedStyle]}
          >
            <Icon name="next" size={MINIBAR.actIcon} color={theme.colors.text2} />
          </AnimatedPressable>
        </View>
      </Pressable>
    )
  },
)

Minibar.displayName = 'NewUIMinibar'

const styles = StyleSheet.create({
  /** 高按档在渲染期给（宽屏 52 / 竖屏 MINIBAR.height 58，原型 styles.css:1326），其余度量两档同值 */
  root: {
    borderRadius: MINIBAR.radius,
    overflow: 'hidden',
    borderWidth: 1,
  },
  progressTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: MINIBAR.progressHeight,
  },
  /** .mini-progress i：从条左端起、宽度百分比裁切；渐变铺在它里面（固定像素宽） */
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    overflow: 'hidden',
  },
  /** .mini-main padding 0 12 / gap 11 */
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: MINIBAR.gap,
    paddingHorizontal: MINIBAR.paddingX,
  },
  artWrap: {
    width: MINIBAR.artSize,
    height: MINIBAR.artSize,
    borderRadius: MINIBAR.artRadius,
    overflow: 'hidden',
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  /** .mini-title 13.5 / 700 */
  title: {
    fontSize: FONT_SIZE.bodyLg,
    fontWeight: FONT_WEIGHT.bold,
  },
  /** .mini-sub 11 / text-3 / gap 6 / margin-top 2 */
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MINIBAR.subGap,
    marginTop: MINIBAR.subMarginTop,
  },
  subText: {
    flexShrink: 1,
    fontSize: FONT_SIZE.caption,
  },
  /** .sep 1×9 */
  sep: {
    width: MINIBAR.sepWidth,
    height: MINIBAR.sepHeight,
    flexShrink: 0,
  },
  /** .mini-act 34 全圆 */
  act: {
    width: MINIBAR.actSize,
    height: MINIBAR.actSize,
    borderRadius: MINIBAR.actSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  actPrimary: {
    // 渐变底由内层 LinearGradient 承担
    backgroundColor: 'transparent',
  },
})
