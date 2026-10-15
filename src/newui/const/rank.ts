/**
 * 排行榜页常量（对应原型 #page-rank）。
 * 屏内文案优先照抄原型原句；分页数值（每批 8 张、距底 160px）第 7b 轮起走 theme 的 RANK_PAGING。
 * 第 7a 轮起还负责「榜名→型、榜名→色」两个查表函数（色表本体在 theme/chart.ts）。
 */
import { CHART_ACCENT, CHART_TINT, type RankCardKind } from '@/newui/theme'

/** 榜型（类型定义在 theme/chart.ts：ChartArtKind 的六型联合；此转发保持 const / hooks 旧引用不变） */
export type { RankCardKind } from '@/newui/theme'

/** 各区块文案（.page-title / .foot-note / .empty-tip） */
export const NEW_UI_RANK_TITLES = {
  page: '排行榜',
} as const

/** 页尾说明（原型 .foot-note 原句） */
export const NEW_UI_RANK_FOOT_NOTE = '榜单由各平台整理 · 点进去看完整排名'

/** 空态 / 加载态文案（原型 .empty-tip 口径：说人话，不带开发术语） */
export const NEW_UI_RANK_EMPTY = {
  loading: '正在把各平台的榜单目录取回来 · 稍等',
  /** 原型原句（app.js renderRankPage L552）：与搜索/音源一族同口径「到设定页…换音源」 */
  noBoards: '当前音源下没有可列榜单的平台 · 到设定页换一个音源',
  failed: '榜单目录没取到 · 网络或音源不稳',
} as const

/**
 * 分段组头的数量文案模板（原型 rankGroupHead L494-499：`{total} 个榜 · 热歌 / 新歌 / 飙升在前`）。
 * N 必须是该平台目录里的**全部榜数**（整平台全列后 = 该平台上卡总数），不是已显示的那几排；
 * 原型已撤「首数 / 更新频率」两个假字段，这里也不造。
 */
export const rankGroupCountLabel = (total: number): string =>
  `${total} 个榜 · 热歌 / 新歌 / 飙升在前`

/**
 * 网格末尾分页状态行文案（原型 PLD_STATUS，app.js L834，与歌单页共用同一语义）。
 * RN 侧目录一次性取回、续批是本地推进，「正在载入下一批…」只在**真实的重取请求**
 * （上一批目录失败后点重试）期间出现；无请求在途且还有未显示的榜时这一行不出现，
 * 原型「第 3 屏故意失败一次」的演示路径不搬。
 */
export const NEW_UI_RANK_STATUS = {
  loading: '正在载入下一批…',
  retry: '这一批没有载入 · 点击重试',
} as const

/**
 * 榜型判定（原型六枚符号按 kind 取）：原创→original、古典→classic、电音/DJ→electronic、
 * 飙/升→rise、含「新」→new、其余→hot。
 * 顺序即优先级：特指词在前、泛化词「新」在后——「新歌榜」不含前三类词落 new，
 * 「飙升榜」不含「新」（rise 在 new 前只是求稳），「热歌榜」不含任何关键词、天然落 hot，
 * 不会被误判成 new。
 * 真实目录里命不中的名字一律回落 hot——不为不存在的榜造形。
 */
export const rankBoardKind = (name: string): RankCardKind => {
  if (name.includes('原创')) return 'original'
  if (name.includes('古典')) return 'classic'
  if (/电音|DJ/i.test(name)) return 'electronic'
  if (/飙|升/.test(name)) return 'rise'
  if (name.includes('新')) return 'new'
  return 'hot'
}

/**
 * 榜名 → 强调色（原型 chartTint L591：CHART_TINT[name] ?? CHART_ACCENT[kind] ?? CHART_ACCENT.hot）。
 * 按「榜名」上色而不是按平台/榜型：同名榜跨平台同色；末档 ?? 是脏 kind 的运行时兜底（与原型同式）。
 */
export const rankChartTint = (name: string, kind: RankCardKind): string =>
  CHART_TINT[name] ?? CHART_ACCENT[kind] ?? CHART_ACCENT.hot

/**
 * 该榜名是否命中原型给出的三类主打榜（热歌 / 新歌 / 飙升），用于组内排序排前（第 7b 轮起截断已退役）。
 * QA 2026-10-14 D-15 收窄：原型 data.js L117 自身就是 `/热|新|飙|升/` 的宽正则——它的 mock 榜名
 * 全是干净名字没暴露问题，真实目录里「热评榜」「MV新势力」这类名字含单字就插队，
 * 而组头写的明明是「热歌 / 新歌 / 飙升在前」（rankGroupHead L498），名实不符。
 * 收窄口径：热/新按「热歌/新歌」开头认（各平台热歌榜/新歌榜都是这前缀），飙/升保留关键词
 * （飙升榜/上升榜同一语义家族，与 rankBoardKind 的 rise 判定同式）。
 */
export const isRankBoardFeatured = (name: string): boolean =>
  name.startsWith('热歌') || name.startsWith('新歌') || /飙|升/.test(name)
