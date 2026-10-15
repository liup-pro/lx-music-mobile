import { memo, type ReactNode } from 'react'
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native'
import Svg, { Circle, Path, Rect } from 'react-native-svg'

import { rankChartTint } from '@/newui/const'
import {
  ART_INK,
  CHART_ART,
  FONT_SIZE,
  FONT_WEIGHT,
  LETTER_SPACING,
  RADIUS,
  chartCoverBg,
  type ChartArtKind,
} from '@/newui/theme'
import { withAlpha } from '@/newui/utils'

export type { ChartArtKind, RankCardKind } from '@/newui/theme'

export interface ChartArtProps {
  /** 宽（卡片用法传正方边长） */
  width: number
  /** 高，缺省 = width（正方卡）；轮 8 的详情头图传横长值即可复用 */
  height?: number
  /** 榜名：既上色（rankChartTint 按榜名查 CHART_TINT）也做 .rk-name 文字层 */
  name: string
  /** 榜型 → 符号形状（原型 CHART_EMBLEM 六枚，缺省回落 hot 由容器查表保证） */
  kind: ChartArtKind
  /** .rk-sub 副行（平台全称等真实字段）；不传则不渲染第二行 */
  sub?: string
  /** 是否渲染图上文字层（默认 true；轮 8 头图若要独立排版可关掉） */
  showText?: boolean
  /** 圆角，默认 --r-m（同 .rk-card） */
  radius?: number
  style?: StyleProp<ViewStyle>
}

/**
 * 六枚单色线条符号（原型 app.js CHART_EMBLEM L596-628 逐坐标移植，512×512 viewBox）。
 * currentColor → 该榜强调色 accent；黑胶中心孔取该榜深底 bg（原型 fill:var(--rk-bg)），
 * 用同一个底色值实心填该圆，不用透明糊过去。符号自带留白，svg 以 meet 等比居中。
 */
const emblemShape = (kind: ChartArtKind, accent: string, bg: string): ReactNode => {
  switch (kind) {
    // 音符：符杆 + 右上旗 + 实心符头
    case 'new':
      return (
        <>
          <Path d="M256 140 V340" fill="none" stroke={accent} strokeLinecap="round" strokeWidth={10} />
          <Path
            d="M256 140 Q316 160 316 220"
            fill="none"
            stroke={accent}
            strokeLinecap="round"
            strokeWidth={10}
          />
          <Circle cx={216} cy={348} fill={accent} r={34} />
        </>
      )
    // 麦克风：胶囊 + 拾音环 + 站杆 + 底座
    case 'original':
      return (
        <>
          <Rect fill="none" height={140} rx={40} stroke={accent} strokeWidth={8} width={80} x={216} y={130} />
          <Path
            d="M180 240 V250 A76 76 0 0 0 332 250 V240"
            fill="none"
            stroke={accent}
            strokeLinecap="round"
            strokeWidth={8}
          />
          <Path d="M256 326 V382" fill="none" stroke={accent} strokeLinecap="round" strokeWidth={8} />
          <Path d="M212 382 H300" fill="none" stroke={accent} strokeLinecap="round" strokeWidth={8} />
        </>
      )
    // 上升箭头：折线上扬 + 右上等臂拐角箭头
    case 'rise':
      return (
        <>
          <Path
            d="M140 360 L240 260 L300 320 L380 200"
            fill="none"
            stroke={accent}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={10}
          />
          <Path
            d="M340 200 H380 V240"
            fill="none"
            stroke={accent}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={10}
          />
        </>
      )
    // 留声机：喇叭臂 + 立柱 + 底座
    case 'classic':
      return (
        <>
          <Path
            d="M200 340 V232 L330 168 V300"
            fill="none"
            stroke={accent}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={8}
          />
          <Rect fill={accent} height={14} rx={7} width={200} x={170} y={340} />
          <Rect fill={accent} height={108} rx={6} width={16} x={184} y={232} />
        </>
      )
    // 方波：两段高低电平
    case 'electronic':
      return (
        <Path
          d="M140 320 V192 H236 V320 H332 V192 H372"
          fill="none"
          stroke={accent}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={10}
        />
      )
    // hot（含未知 kind 回落，同原型 CHART_EMBLEM[c.kind] ?? CHART_EMBLEM.hot）：
    // 黑胶：同心圆 + 中心实心 + 中心孔透该榜深底
    case 'hot':
    default:
      return (
        <>
          <Circle cx={256} cy={256} fill="none" r={120} stroke={accent} strokeWidth={6} />
          <Circle cx={256} cy={256} fill="none" opacity={0.55} r={82} stroke={accent} strokeWidth={3} />
          <Circle cx={256} cy={256} fill={accent} r={44} />
          <Circle cx={256} cy={256} fill={bg} r={10} />
        </>
      )
  }
}

/**
 * 榜单封面（原型 app.js chartArt L630-638 / .art.chart-art，styles.css L376-397）：
 * 「该榜」的共用视觉资产 = 平色深底（强调色 ×0.24）+ 单色线条符号 + 可选两行真数据文字。
 * 卡片（RankCard）与轮 8 的详情头图都吃它；同名榜跨平台同色由 const/rank.ts 查表保证。
 * 图上文字锁白（ART_INK），不参与浅/深主题反相——封面恒为深底。
 * 纯展示组件：不读 store、不发请求、不接点击（交互由外层 RankCard/容器负责）。
 */
export const ChartArt = memo(
  ({ width, height = width, name, kind, sub, showText = true, radius = RADIUS.m, style }: ChartArtProps) => {
    const accent = rankChartTint(name, kind)
    const bg = chartCoverBg(accent)
    return (
      <View
        style={[
          styles.root,
          { width, height, backgroundColor: bg, borderRadius: radius },
          style,
        ]}
      >
        {/* .rk-emblem：inset 0 满幅，512 viewBox 等比居中（meet，同 CSS svg 默认） */}
        <Svg
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          style={StyleSheet.absoluteFill}
          viewBox="0 0 512 512"
          width="100%"
        >
          {emblemShape(kind, accent, bg)}
        </Svg>
        {showText ? (
          <>
            {/* .rk-name：榜名（平台给的真名），白 900 + 黑投影 */}
            <Text
              numberOfLines={2}
              style={[
                styles.name,
                {
                  color: ART_INK.fg,
                  textShadowColor: withAlpha(ART_INK.veil, CHART_ART.nameShadowAlpha),
                  textShadowOffset: { width: 0, height: CHART_ART.nameShadowOffsetY },
                  textShadowRadius: CHART_ART.nameShadowRadius,
                },
              ]}
            >
              {name}
            </Text>
            {/* .rk-sub：平台全称。卡上只留这两行真数据，「N 首」「每小时更新」原型已撤，不加 */}
            {sub != null && (
              <Text numberOfLines={1} style={styles.sub}>
                {sub}
              </Text>
            )}
          </>
        ) : null}
      </View>
    )
  },
)

ChartArt.displayName = 'NewUIChartArt'

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
  },
  /** .rk-name：left/right 13 / bottom 30 / 17 / 900 / 行高 1.25 / 字距 .3 */
  name: {
    position: 'absolute',
    left: CHART_ART.nameInsetX,
    right: CHART_ART.nameInsetX,
    bottom: CHART_ART.nameBottom,
    fontSize: CHART_ART.nameSize,
    fontWeight: FONT_WEIGHT.black,
    lineHeight: CHART_ART.nameLineHeight,
    letterSpacing: LETTER_SPACING.normal,
  },
  /** .rk-sub：left/right 13 / bottom 12 / 10.5 / 700 / 字距 .2 / 白 .76 */
  sub: {
    position: 'absolute',
    left: CHART_ART.subInsetX,
    right: CHART_ART.subInsetX,
    bottom: CHART_ART.subBottom,
    fontSize: FONT_SIZE.tiny,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: LETTER_SPACING.tight,
    color: withAlpha(ART_INK.fg, CHART_ART.subAlpha),
  },
})
