/**
 * 榜单封面体系色表与底色换算（原型 app.js L563-594 CHART_ACCENT / CHART_TINT / shadeHex）。
 * 色值表属 theme；「榜名→型、榜名→色」查表函数在 const/rank.ts；符号图形在 components/ChartArt。
 * 组件内不得写死封面色值字面量。
 */
import { shade } from '@/newui/utils'

/**
 * 榜型（对应原型 CHART_ACCENT / CHART_EMBLEM 的六个 key）。
 * 原 RankCardKind 只有 hot/new/rise 三型，本轮按原型扩到六型。
 */
export type ChartArtKind = 'hot' | 'new' | 'original' | 'rise' | 'classic' | 'electronic'

/** 历史名：三型时代叫 RankCardKind，const / hooks / 页面沿用此名，保留别名不再改调用方 */
export type RankCardKind = ChartArtKind

/**
 * 六榜型强调色（原型 CHART_ACCENT L563-576 逐字抄录，禁止调色）。
 * 只在榜名命不中 CHART_TINT 时作为兜底色。
 */
export const CHART_ACCENT: Record<ChartArtKind, string> = {
  hot: '#F97316',
  new: '#5EEAD4',
  original: '#A78BFA',
  rise: '#A3E635',
  classic: '#F59E0B',
  electronic: '#818CF8',
}

/**
 * 榜名 → 强调色（原型 CHART_TINT L583-590 逐字抄录）。
 * 原型理由：45 张榜里 29 张会回落成同一个橙黑胶，按榜名上色后每张榜有自己的脸，
 * **同名榜跨平台保持同色**（五个平台的欧美榜是一张脸）。
 * 民谣榜按原型注释取草绿 #4ADE80（不用木色，避免与同段古典/热歌撞成一排金）。
 */
export const CHART_TINT: Record<string, string> = {
  热歌榜: '#F97316',
  新歌榜: '#5EEAD4',
  飙升榜: '#A3E635',
  原创榜: '#A78BFA',
  古典榜: '#F59E0B',
  电音榜: '#818CF8',
  说唱榜: '#94A3B8',
  民谣榜: '#4ADE80',
  欧美榜: '#60A5FA',
  短视频榜: '#E879F9',
  铃声榜: '#FDE047',
  体育榜: '#D946EF',
  车载榜: '#38BDF8',
  K歌榜: '#F472B6',
  影视榜: '#A8A29E',
  影视原声榜: '#A8A29E',
  古风榜: '#DC2626',
  国风榜: '#DC2626',
  内地榜: '#22C55E',
  港台榜: '#FCD34D',
  日韩榜: '#FB7185',
  华语榜: '#EF4444',
  DJ榜: '#86EFAC',
}

/** 原型 shadeHex(hex, 0.24) 的 k：平色深底 = 强调色各通道乘 0.24（同色相深色版） */
export const CHART_BG_SHADE = 0.24

/**
 * 封面深底（原型 app.js chartArt L620 的 `--rk-bg = shadeHex(tint, 0.24)`）。
 * 换算复用 utils/shade（与原型 shadeHex 同为各通道乘 k + round + padStart，结果等价）。
 */
export const chartCoverBg = (accent: string): string => shade(accent, CHART_BG_SHADE)
