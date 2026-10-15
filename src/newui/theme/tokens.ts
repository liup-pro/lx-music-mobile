/**
 * 新 UI 设计 token（唯一数据源）
 * 深色取值精确提取自 new_design/styles.css（:root 与规则内散落值）；
 * 浅色取值自 .phone.light 规则（原型改版后已给双套 token），早期自造部分仍为同一设计语言下的浅底深字。
 * 组件内禁止硬编码色值 / 尺寸，一律从这里取。
 */
import type { GlassLayerSpec, GradientSpec, ShadowSpec, ThemeColors, ThemeScheme } from './types'

/* ================= 色板 ================= */

// 深色即原型本体；浅色保持 brand 渐变与语义色不变，重排 bg/surface/text 层级（浅底深字）
export const PALETTES: Record<ThemeScheme, ThemeColors> = {
  dark: {
    bg: '#08080C',
    bgSoft: '#0E0F15',
    surface: '#15171F',
    surface2: '#1C1F29',
    surface3: '#242836',
    line: 'rgba(255, 255, 255, 0.075)',
    lineStrong: 'rgba(255, 255, 255, 0.14)',
    text: '#F3F4F8',
    text2: '#A2A8B8',
    text3: '#6B7182',
    brand: '#FF5C8A',
    brand2: '#7A3BFF',
    brand3: '#FFD36E',
    ok: '#31C27C',
    err: '#FF8B7E',
    glass: 'rgba(255, 255, 255, 0.07)',
    glassStrong: 'rgba(255, 255, 255, 0.085)',
    chip: 'rgba(255, 255, 255, 0.055)',
    overlay: 'rgba(255, 255, 255, 0.10)',
    overlayStrong: 'rgba(255, 255, 255, 0.18)',
    glassBorder: 'rgba(255, 255, 255, 0.06)',
    tagBorder: 'rgba(255, 255, 255, 0.08)',
    press: 'rgba(255, 255, 255, 0.06)',
    playingBorder: 'rgba(255, 255, 255, 0.07)',
    onBrand: '#0A0A0F',
    onGradient: '#FFFFFF',
    brandWash: 'rgba(255, 92, 138, 0.16)',
    pressStrong: 'rgba(255, 255, 255, 0.10)',
    switchOff: 'rgba(255, 255, 255, 0.16)',
    switchKnob: '#FFFFFF',
    glowA: 'rgba(122, 59, 255, 0.28)',
    glowB: 'rgba(255, 92, 138, 0.22)',
    artScrim: 'rgba(0, 0, 0, 0.34)',
    seekTrack: 'rgba(255, 255, 255, 0.14)',
    /* 语义化填充 / 描边 / 贴片（styles.css :root L18-28，照抄不改透明度）；
       旧 key（glass/glassStrong/glassBorder/press/overlay…）下一轮由组件侧换到这里 */
    fill1: 'rgba(255, 255, 255, 0.06)',
    fill2: 'rgba(255, 255, 255, 0.07)',
    fill3: 'rgba(255, 255, 255, 0.12)',
    fill4: 'rgba(255, 255, 255, 0.17)',
    hairline: 'rgba(255, 255, 255, 0.06)',
    hairlineStrong: 'rgba(255, 255, 255, 0.26)',
    card: 'rgba(255, 255, 255, 0.045)',
    glassPatch: 'rgba(10, 10, 16, 0.74)',
    glassPatchInk: '#FFFFFF',
    dangerInk: '#FF8B7E',
    /* .ln.on text-shadow 0 5px 22px rgba(0,0,0,.55)（styles.css L612）；
       浅色 .phone.light .ln.on 单独覆盖为 rgba(21,22,28,.22)（L1166）——
       原型注释明言这是「同一语义浅底要换值、无法反相表达」的真差异，故两套各留一档。
       2026-10-15「正在演播的歌词行背景丑」一条：原型那层 22px 大半径在浏览器里是
       几乎看不见的柔光（只用于把字从封面氛围底上抬一点），RN 照抄数值后 Android 的
       文字阴影按半径逐像素涂抹，实际糊成当前行身后一块肉眼可见的暗脏斑，还吃掉字形
       边缘（字发灰）。为还原原型「当前行没有任何背景块」的观感，此处把浓度一并降档，
       半径/偏移见 PLAYER.lyricGlow* */
    lyricGlow: 'rgba(0, 0, 0, 0.30)',
  },
  light: {
    bg: '#F6F6FA',
    bgSoft: '#EFEFF6',
    surface: '#FFFFFF',
    surface2: '#F3F3F8',
    surface3: '#E9E9F1',
    line: 'rgba(21, 22, 28, 0.08)',
    lineStrong: 'rgba(21, 22, 28, 0.16)',
    text: '#15161C',
    text2: '#5A5F6E',
    text3: '#8B90A0',
    brand: '#FF5C8A',
    brand2: '#7A3BFF',
    brand3: '#FFD36E',
    ok: '#31C27C',
    err: '#E5484D',
    glass: 'rgba(21, 22, 28, 0.06)',
    glassStrong: 'rgba(21, 22, 28, 0.09)',
    chip: 'rgba(21, 22, 28, 0.05)',
    overlay: 'rgba(21, 22, 28, 0.07)',
    overlayStrong: 'rgba(21, 22, 28, 0.14)',
    glassBorder: 'rgba(21, 22, 28, 0.08)',
    tagBorder: 'rgba(21, 22, 28, 0.08)',
    press: 'rgba(21, 22, 28, 0.06)',
    playingBorder: 'rgba(255, 92, 138, 0.34)',
    onBrand: '#0A0A0F',
    onGradient: '#FFFFFF',
    brandWash: 'rgba(255, 92, 138, 0.16)',
    pressStrong: 'rgba(21, 22, 28, 0.10)',
    switchOff: 'rgba(21, 22, 28, 0.16)',
    switchKnob: '#FFFFFF',
    glowA: 'rgba(122, 59, 255, 0.14)',
    glowB: 'rgba(255, 92, 138, 0.12)',
    artScrim: 'rgba(0, 0, 0, 0.30)',
    seekTrack: 'rgba(21, 22, 28, 0.14)',
    /* 语义化填充 / 描边 / 贴片（styles.css .phone.light L1137-1146，照抄不改透明度）；
       card 浅色为实心白 #FFFFFF（页面灰底 + 白卡，iOS 分组列表式），dangerInk 浅底反相为深红 */
    fill1: 'rgba(21, 22, 28, 0.06)',
    fill2: 'rgba(21, 22, 28, 0.07)',
    fill3: 'rgba(21, 22, 28, 0.12)',
    fill4: 'rgba(21, 22, 28, 0.17)',
    hairline: 'rgba(21, 22, 28, 0.06)',
    hairlineStrong: 'rgba(21, 22, 28, 0.26)',
    card: '#FFFFFF',
    glassPatch: 'rgba(255, 255, 255, 0.82)',
    glassPatchInk: '#15161C',
    dangerInk: '#C43C2E',
    lyricGlow: 'rgba(21, 22, 28, 0.10)',
  },
}

/* ================= 渐变 ================= */

// CSS 角度 → RN start/end 近似：120deg 用 (0,.25)→(1,.75)，135deg 用对角
export const GRADIENTS = {
  /** 主色渐变 --grad：120deg #FF5C8A → #C04CE8(48%) → #7A3BFF */
  brand: {
    colors: ['#FF5C8A', '#C04CE8', '#7A3BFF'],
    start: { x: 0, y: 0.25 },
    end: { x: 1, y: 0.75 },
  },
  /** 主色软渐变 --grad-soft（正在播放行 / 选中项底色） */
  brandSoft: {
    colors: ['rgba(255, 92, 138, 0.22)', 'rgba(122, 59, 255, 0.22)'],
    start: { x: 0, y: 0.25 },
    end: { x: 1, y: 0.75 },
  },
  /** 封面 / 头像对角渐变（135deg，实际渲染时用具体 c1 / c2 替换首尾色） */
  art: {
    colors: ['#FF5C8A', '#7A3BFF'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  /** 「我的」页头像底 .mh-art：150deg brand → brand-2（近竖向，略斜），RN 用 (0.25,0)→(0.75,1) 近似 */
  headArt: {
    colors: ['#FF5C8A', '#7A3BFF'],
    start: { x: 0.25, y: 0 },
    end: { x: 0.75, y: 1 },
  },
  /** 「我喜欢」卡底 .fav-card：120deg rgba(255,92,138,.26) → rgba(122,59,255,.24)（120deg 端点同 brand） */
  favWash: {
    colors: ['rgba(255, 92, 138, 0.26)', 'rgba(122, 59, 255, 0.24)'],
    start: { x: 0, y: 0.25 },
    end: { x: 1, y: 0.75 },
  },
} as const satisfies Record<string, GradientSpec>

/* ================= 平台色（提取自 data.js） ================= */

/** 五平台品牌 tint，用于来源角标 / 榜单卡（.sr-src / .rk-card） */
export const PLATFORM_TINTS = {
  tx: '#31C27C',
  wy: '#E4413F',
  kw: '#12B7F5',
  kg: '#3FBCB4',
  mg: '#FF6FA5',
} as const

export type PlatformTintKey = keyof typeof PLATFORM_TINTS

/** 封面占位渐变组（data.js ART_PALETTES 原样收敛） */
export const ART_PALETTES: ReadonlyArray<readonly [string, string, string]> = [
  ['#FF5C8A', '#7A3BFF', '#FFD36E'],
  ['#22D3EE', '#2563EB', '#A5F3FC'],
  ['#FBBF24', '#EF4444', '#FDE68A'],
  ['#34D399', '#0EA5E9', '#D1FAE5'],
  ['#F472B6', '#8B5CF6', '#FBCFE8'],
  ['#60A5FA', '#1E1B4B', '#C7D2FE'],
  ['#FB923C', '#DB2777', '#FED7AA'],
  ['#2DD4BF', '#4338CA', '#99F6E4'],
]

/* ================= 封面上的中性叠加色 ================= */

/**
 * 「压在封面图 / 渐变底上」的中性色，浅深两套共用。
 * 封面本身永远是深底（渐变或照片），这层色不随主题反转，所以不进色板，
 * 但也不许散在组件里 —— 对应原型 .art .ic-center、.play-badge、.banner .veil、.b-tag、.wip-tag 里的字面量。
 */
export const ART_INK = {
  /** 前景白：占位图标、角标图标、图上文字 */
  fg: '#FFFFFF',
  /** 遮罩基色黑：.veil / .art-scrim / .play-badge 底 */
  veil: '#000000',
  /** .wip-tag 底基色 rgba(8,8,12,.55) */
  wip: '#08080C',
  /** .play-badge 底色浓度 */
  badgeAlpha: 0.45,
  /** .b-tag 底 / .play-badge 描边浓度（rgba(255,255,255,.18)） */
  chipAlpha: 0.18,
  /** .art-scrim 中间档浓度（rgba(0,0,0,.04) 46% 处） */
  scrimMidAlpha: 0.04,
  /** .wip-tag 底色浓度 */
  wipAlpha: 0.55,
} as const

/* ================= 圆角 ================= */

// --r-s/m/l/xl = 12/18/24/30；其余为规则内实际用量
export const RADIUS = {
  /** .tab.is-active::before 指示条等 2px 小圆角 */
  dot: 2,
  /** .sr-src 来源角标 */
  tagXs: 5,
  /** .q-tag 音质标签 */
  tagSm: 7,
  /** .b-tag / 日期胶囊 */
  tag: 8,
  /** .song-row .art 封面 */
  artXs: 10,
  /** --r-s 基础卡面 */
  s: 12,
  /** .chip / .song-row / .ghost-btn */
  control: 14,
  /** .pl-open-btn / .mh-edit */
  pill: 16,
  /** --r-m .set-list */
  m: 18,
  /** .searchbar */
  search: 19,
  /** .quick .qa / .pl-hero .art */
  art: 20,
  /** .fav-card */
  card: 22,
  /** --r-l .banner */
  l: 24,
  /** --r-xl */
  xl: 30,
  /** 全圆 */
  full: 999,
} as const

/* ================= 间距 ================= */

// 提取自规则内的实际节奏值，组件按语义取用
export const SPACING = {
  xxs: 2,
  xs: 4,
  s: 6,
  sm: 8,
  ms: 10,
  md: 12,
  ml: 14,
  lg: 16,
  xl: 20,
  xxl: 22,
  xxxl: 26,
  huge: 30,
  giant: 44,
} as const

/* ================= 布局骨架 ================= */

// 与 styles.css 的 .topbar / .viewport 对齐，页面滚动容器的基准
// 顶栏高度与内容上留白不写死：原型 padding-top 54 / viewport padding-top 110 含 52px 模拟状态栏，
// 真机状态栏需实测，统一用文件末尾的 topbarHeight(topInset) 计算
export const LAYOUT = {
  /** 页面左右内边距（.page padding:0 16px） */
  screenPaddingX: 16,
  /** 区块垂直间距（.section margin-top:26px） */
  sectionGap: 26,
  /** 滚动内容末尾与 Tab 栏之间的留白：.viewport padding-bottom 168 减去 --safe-b 22 与 Tab 栏 60 */
  contentGapAboveTabBar: 86,
} as const

/* ================= 层叠台阶 ================= */

/**
 * 少数「必须压在滚动内容之下 / 之上」的层用的层叠数（RN `zIndex`）。
 * RN 在 Android 侧由 ReactViewGroup 自己按 zIndex 重排子视图的绘制与命中顺序
 * （父节点没有 zIndex 时按声明顺序稳定排序），走的是 RN 自己的层级实现，
 * 不是系统 `elevation`，所以不会额外画出一圈阴影。
 * 数值照抄原型 styles.css 的 z-index 事实：
 * `.pl-bg` / `.player-bg` 0（L403 / L513）、`.pl-layer>*` / `.player-layer>*` 1（L404 / L514）、
 * `.topbar` 40（L87）、`.sheet` 80（L653）。
 * 口径：**只有真出过问题的少数层用**——封面氛围底纹、吸顶顶栏、常驻悬浮迷你播放条、
 * 全屏底部浮层；其余兄弟节点仍按声明顺序，不给无关组件加 zIndex（Tab 栏不在这里：
 * 它在页面布局流里与内容几何互不重叠，加层叠数只会掩盖真实层级）。
 * 背景：真机走查（2026-10-12）报的「详情上半部像有一层顶层蒙板且心钮点不动」
 * 「首页切到榜单 tab 后歌名压住信号栏」都是靠声明顺序赌平台绘制顺序翻车造成的；
 * 「首页 Minibar 背景透明和背后内容重叠」同属一族——Minibar 是绝对定位浮在滚动内容
 * 之上的悬浮件，没有显式层叠数时 Android 侧可能被列表内容盖住自身不透明底。
 */
export const Z_LAYER = {
  /** 封面氛围底纹（原型 .pl-bg / .player-bg z-index:0） */
  wash: 0,
  /** 层内内容（原型 .pl-layer > * / .player-layer > * z-index:1） */
  layerContent: 1,
  /** 迷你播放条（原型 .minibar z-index:45，styles.css L455）：恒浮在滚动内容之上 */
  minibar: 45,
  /** 吸顶顶栏（原型 .topbar z-index:40）：恒在滚动内容之上，与滚动状态无关 */
  topbar: 40,
  /** 底部浮层（原型 .sheet z-index:80）：盖过顶栏、Tab 栏与列表内容 */
  sheet: 80,
  /** 提示胶囊（原型 .toast z-index:90，styles.css L797）：全站最高一层（硬件状态栏除外），压过浮层 */
  toast: 90,
} as const

/* ================= 封面氛围底纹（共通件度量） ================= */

/**
 * `CoverWash` 的度量（原型 `.pl-bg` L403 / `.player-bg` L513：blur+saturate 不可用，
 * 降级为封面种子渐变铺底）。局部铺底时下沿必须渐隐到 0：
 * 原型的底纹被 blur(64px) 抹平了边界，降级后是一个「高度整齐的色块」，
 * 不渐隐就会被看成盖在内容上的一层蒙板（2026-10-12 真机走查现象 1）。
 */
export const COVER_WASH = {
  /** 整层铺底（原型 .player-bg 140deg 降级）的缺省渐变方向：封面 135deg 对角 */
  artStart: { x: 0, y: 0 },
  artEnd: { x: 1, y: 1 },
  /** 局部铺底（heightRatio < 1，原型 .pl-bg height:56%）时的纵向渐隐起止 */
  fadeStart: { x: 0.5, y: 0 },
  fadeEnd: { x: 0.5, y: 1 },
  /** 三段衰减的位置与相对峰值透明度的系数（1 → 中段 → 0，收尾无硬边） */
  fadeLocations: [0, 0.62, 1],
  fadeAlphaRatios: [1, 0.5, 0],
} as const

/* ================= 控件度量 ================= */

// .chip / .q-tag / .section-more 等迷你控件的固定尺寸（颜色一律走色板）
export const CONTROL = {
  /** .chip 高度 28px */
  chipHeight: 28,
  /** .chip 水平内边距 0 11px */
  chipPaddingX: 11,
  /** .q-tag 内边距 2.5px 7px */
  tagPaddingX: 7,
  tagPaddingY: 2.5,
  /** .src-badge 内边距 2px 5px */
  badgePaddingX: 5,
  badgePaddingY: 2,
  /** .section-more 尾部箭头 13px（opacity .7） */
  moreIconSize: 13,
  moreIconOpacity: 0.7,
  /** .section-more 的 gap:1px */
  moreGap: 1,
  /** 小尺寸文字链的点击热区外扩（原型无，RN 侧补可点区域，≥ 44 不合适时取最小可行值） */
  moreHitSlop: 8,
} as const

/* ================= 歌曲行（.song-row） ================= */

// 规格提取自 styles.css L247-274，含 .song-list.compact 变体与 .eq 均衡条
// 标题 / 副标题字号、排名字号走 FONT_SIZE；播放底渐变走 GRADIENTS.brandSoft
export const SONG_ROW = {
  /** 行内横向节奏 11px */
  gap: 11,
  /** .song-list gap:2px（styles.css L246） */
  listGap: 2,
  /** 常规行内边距 7px 8px 7px 4px */
  paddingY: 7,
  paddingRight: 8,
  paddingLeft: 4,
  /** 紧凑行内边距 5px 6px 5px 3px */
  compactPaddingY: 5,
  compactPaddingRight: 6,
  compactPaddingLeft: 3,
  /** 紧凑变体标题字号 13.5 */
  titleSizeCompact: 13.5,
  /** 副标题行上边距 3px */
  subMarginTop: 3,
  /** 副行段落间距（.sr-sub gap:6px，即 SPACING.s，此处显式留档） */
  subGap: 6,
  /** .sr-sub .sep 分隔条 1×9（styles.css L293，色走 colors.lineStrong） */
  sepWidth: 1,
  sepHeight: 9,
  /** 收缩优先级（styles.css L296-298）：角标 flex:none，歌手 0 1 auto，专辑 0 100 auto */
  artistFlexShrink: 1,
  albumFlexShrink: 100,
  /** 排名槽最小宽 28px（等宽 14px 的 3 位编号约 25dp，原型 22px 在超 99 首时折行，放宽为下限） */
  rankWidth: 28,
  /** 封面 46px / 紧凑 40px（圆角走 RADIUS.artXs） */
  artSize: 46,
  artSizeCompact: 40,
  /** 右侧更多按钮 4px 内边距 + 16px 图标 */
  morePadding: 4,
  moreIconSize: 16,
  /** .eq 均衡条：2px 宽、3px↔11px 高、1.5px 间距（周期走 MOTION.eq） */
  eqWidth: 2,
  eqMinHeight: 3,
  eqHeight: 11,
  eqGap: 1.5,
} as const

/* ================= 按钮族 ================= */

// 提取自 styles.css L111-117（.icon-btn）、L276-282（.ghost-btn）、L312-316（.pl-open-btn）与 L362-366（.mh-edit）
export const BUTTON = {
  /** .icon-btn 34×34 全圆，图标 18 */
  iconSize: 34,
  iconIcon: 18,
  /** .pl-actions .icon-btn 42×42，图标 19（圆角改 RADIUS.control） */
  iconSizeLg: 42,
  iconIconLg: 19,
  /** .pulse-dot 状态圆点 7px，偏移 4px */
  dotSize: 7,
  dotOffset: 4,
  /**
   * .pulse-dot 呼吸扩散（styles.css L139-146 @keyframes pulse，周期 MOTION.pulse）：
   * CSS 用 box-shadow spread 0→7px、alpha .5→0（0%→70%，后 30% 隐没）。
   * RN 以同色圆环覆盖件等价：外圈终径 = dotSize + 2×dotRingSpread，
   * dotRingPhase 为扩散段占总周期的比例，dotRingAlpha 为 0% 帧透明度。
   */
  dotRingSpread: 7,
  dotRingPhase: 0.7,
  dotRingAlpha: 0.5,
  /** .ghost-btn 高 42 / 图标 15 / 图文间距 7 */
  ghostHeight: 42,
  ghostIcon: 15,
  ghostGap: 7,
  /** .pl-open-btn / .mh-edit 高 32 / paddingX 13 / 图文间距 6 / 图标 15（mh-edit 为 14） */
  pillHeight: 32,
  pillPaddingX: 13,
  pillGap: 6,
  pillIcon: 15,
} as const

/* ================= 开关（.toggle） ================= */

// 提取自 styles.css L613-618：轨道 46×27，旋钮 21px（内边 3px），行程 19px
export const SWITCH = {
  width: 46,
  height: 27,
  radius: 14,
  knob: 21,
  inset: 3,
  travel: 19,
} as const

/* ================= 顶栏（.topbar） ================= */

// 规格提取自 styles.css L86-110（.topbar / .topbar-row / .avatar-btn / .searchbar）
export const TOP_BAR = {
  /** 原型 padding-top 54 含状态框；真机用实测 statusbarHeight + 此行位 */
  statusBarReserve: 2,
  paddingBottom: 10,
  /** .topbar-row 高 46 / 子项 gap 10 */
  rowHeight: 46,
  gap: 10,
  /** .avatar-btn 34×34 全圆 */
  avatarSize: 34,
  /** .avatar 文字 13px / 800 */
  avatarTextSize: 13,
  /** .searchbar 高 38 / paddingX 14 / gap 8 / 图标 17 */
  searchHeight: 38,
  searchPaddingX: 14,
  searchGap: 8,
  searchIcon: 17,
  /**
   * 顶栏底色（原 rgba(8,8,12,.92)+毛玻璃）：主路径为共通件 BlurredContainer
   * （玻璃参数见 GLASS.topBar），染色渐变 .92→.66→0 止于盒底（原型 .topbar background
   * 的 0%/62%/100% 三停点），与 CSS backdrop-filter 同规——盒外不再有任何铺底/收边带。
   * 2026-10-21 QA：原挂于盒外下方的 16px「下沿渐隐收边条」（fade* 五键）已删——
   * 原型不存在这条带，它令顶栏模糊观感向下多出 16px，盖住了「我的」页头像顶部；
   * 原型渐变在盒内本就收 Transparent，无需盒外补边。
   */
  /** 滚动超过此高度顶栏加投影（app.js：vp.scrollTop > 8） */
  pinnedThreshold: 8,
} as const

/* ================= 底部 Tab 栏（.tabbar） ================= */

// 规格提取自 styles.css L479-499（.tabbar / .tab / .tab.is-active）
export const TAB_BAR = {
  /** height: calc(var(--safe-b) + 60px)，padding-top 8 */
  height: 60,
  paddingTop: 8,
  /** .tab 内图标与文字 gap 3 */
  gap: 3,
  /** .tab .ic 23px */
  iconSize: 23,
  /** .tab.is-active::before 指示条 22×3，top -8px */
  indicatorWidth: 22,
  indicatorHeight: 3,
  indicatorTop: -8,
  /**
   * 底栏底色（原型 .tabbar 盒内 linear-gradient(to top, bg 96%, bg 62%) + blur(26) saturate(180%)，
   * styles.css L551-557）：2026-10-13 起主路径为共通件 BlurredContainer（玻璃参数见 GLASS.tabBar）；
   * 真模糊不可用时退回不透明 theme.colors.bg 铺底（2026-10-12「内容穿透」修复的形态）。
   * 2026-10-15 撤掉原「盒外上沿 16px 渐隐收边条」（fade* 五键）：原型不存在这条带——
   * 渐变与模糊都止于盒内，盒顶只有 1px hairline 高光；这条自造带让栏上方内容被额外压暗，
   * 且带底 .85 与盒顶 .62 之间出现可见亮度跳变（与顶栏撤下沿收边条同一口径，见 TOP_BAR 注释）。
   */
} as const

/* ================= 玻璃层（backdrop-filter 毛玻璃） ================= */

/**
 * 首页三处「与原型不一致（原型有毛玻璃）」位点的统一参数
 * （2026-10-13 bug-fix「首页」第 1 条；共通件见 components/Glass/BlurredContainer）。
 * 逐段提取自 new_design/styles.css：
 *  - .topbar  L86-93：blur(22px) saturate(180%)；background linear-gradient(to bottom,
 *                     rgba(8,8,12,.92) 0%, rgba(8,8,12,.66) 62%, rgba(8,8,12,0) 100%)
 *    —— 顶栏铺满含系统状态栏背后那一段，所以「状态栏背后区域」的玻璃位就是顶栏玻璃层。
 *  - .tabbar  L479-486：blur(26px) saturate(180%)；background linear-gradient(to top,
 *                     rgba(8,8,12,.96), rgba(8,8,12,.62)）—— to top 即底浓顶淡，
 *                     RN 方向按顶→底写，alpha 顺序相应倒置为 [.62, .96]。
 *  - .minibar L515-523（background:var(--glass) 在 L518）：blur(28px) saturate(180%)；
 *                     底色即 glassPatch 贴片 token 本身（深 rgba(10,10,16,.74) /
 *                     浅 rgba(255,255,255,.82)）——两套主题 alpha 档位不同，
 *                     「色板键 × 单一 alpha」表达不了，tintAlphas 省略即直取 token 原值。
 * 口径说明：
 *  - tint 基色不抄 CSS 字面 rgba，而是「色板键 × alpha」：深色下与原型逐值相等，
 *    浅色主题自动换成同语义浅底（如 light bg #F6F6FA × .96），不写死颜色。
 *  - saturate(180%) BlurView(4.4.1) 无法直接表达（iOS 走 blurType 材质、Android 纯半径），
 *    由 tint 渐变层承担「染色 + 提对比」的职责，属已知近似，设备验收时如显灰再调 alpha 档。
 *  - fallbackBase 是真模糊不可用时的保险：回到 2026-10-12 已验收的「不透明表面底」，
 *    保证分层不回退（尤其 Minibar「背景透明和背后内容重叠」的旧修复不得复活）。
 */
export const GLASS = {
  /** 顶栏（含系统状态栏背后区域） */
  topBar: {
    intensity: 22,
    tintBase: 'bg',
    tintAlphas: [0.92, 0.66, 0],
    tintLocations: [0, 0.62, 1],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
    fallbackBase: 'bg',
  },
  /** 底部 Tab 栏（含系统导航条安全区那一段） */
  tabBar: {
    intensity: 26,
    tintBase: 'bg',
    tintAlphas: [0.62, 0.96],
    tintLocations: [0, 1],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
    fallbackBase: 'bg',
  },
  /** 迷你播放条（原型 .minibar：background var(--glass) + blur(28px)） */
  minibar: {
    intensity: 28,
    /** 贴片底色直取 glassPatch token（tintAlphas 省略 = 染色即该键原值，深浅两套各按自身 alpha） */
    tintBase: 'glassPatch',
    /** 单色染色不需要方向，起终点同值仅为满足 LinearGradient 必填 props */
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
    /** surface2 不透明底 = 2026-10-12 分层修复的原值：降级态垫在 glassPatch 染色层之下保底不透明 */
    fallbackBase: 'surface2',
  },
  /** 提示胶囊（原型 .toast：background var(--glass) + backdrop-filter blur(18px)，styles.css L796-799）
   *  ——与 .minibar 同一贴片家族（glassPatch 直取），只是模糊半径按本选择器的 18px */
  toast: {
    intensity: 18,
    tintBase: 'glassPatch',
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
    /** 降级底同样用 glassPatch 原值：贴片本身已是 .74/.82 半透明，双层叠出约 .93 近实底，
     *  保证无模糊路径下胶囊在亮封面前仍可读（原型 toast 无实底档，此处是 RN 侧保险） */
    fallbackBase: 'glassPatch',
  },
} as const satisfies Record<string, GlassLayerSpec>

/**
 * Android 侧真模糊的采样策略（性能档，非视觉档）——2026-10-15「滑动/切页卡顿」性能轮新增。
 *
 * 背景：`@react-native-community/blur` 在 Android 上是 eightbitlab/blurview 的壳，RN 的
 * `autoUpdate` 属性逐字透传给 `BlurView.setBlurAutoUpdate()`（见该库
 * android/.../BlurViewManagerImpl.java:44）。autoUpdate=true 时库会挂一个
 * `ViewTreeObserver.OnPreDrawListener`，**每一帧**都把「本视图身后那块窗口区域」重新截图 +
 * 降采样 + RenderScript 模糊一遍。本 App 常驻就有三个这样的玻璃层（顶栏含状态栏段、底 Tab 栏
 * 含导航安全区段、Minibar），全在滚动的 ScrollView 之上 —— 滚动时每帧付三次全屏级重采样，
 * 这是 Android 上最典型的掉帧来源（库自己的 README 也写明：滚动期间持续更新是贵操作，
 * 非必要请关掉）。iOS 走 UIVisualEffectView，由系统合成，不受本开关影响。
 *
 * 关掉后的代价：模糊像是「最后一次失效时的那一帧快照」，滚动时不跟随刷新（静止后与新内容
 * 差一层静态雾）。三处玻璃位之上的染色渐变 alpha 分别是 .92→0（顶栏）、.62→.96（Tab 栏）、
 * .74（Minibar），即绝大部分面积本就由染色层承担，模糊只贡献一点点颗粒化质感，观感差极小。
 * 若上机对比认为「静态雾」不可接受，把本值改回 true 即一处复原。
 */
export const GLASS_PERF = {
  /** Android BlurView 是否逐帧重采样身后内容（iOS 忽略本值） */
  androidAutoUpdate: false,
} as const

/* ================= 页头 / 页脚（.page-head / .foot-note） ================= */

export const PAGE_HEAD = {
  /** .page-head margin-top 6 / gap 12 */
  marginTop: 6,
  gap: 12,
} as const

// styles.css L305-306：页尾一句话说明（首页 / 歌单 / 榜单 / 我的 / 歌单详情均复用）
export const FOOT_NOTE = {
  marginTop: 32,
  gap: 8,
  /** .foot-mark 渐变小圆点 14px */
  markSize: 14,
  markOpacity: 0.6,
} as const

/* ================= 空列表提示（.empty-tip） ================= */

// styles.css L319（页面内）与 L416（.pl-layer 内内边距不同）
export const EMPTY_TIP = {
  /** 页面内：padding 22px 0 6px */
  paddingTop: 22,
  paddingBottom: 6,
  /** .pl-layer .empty-tip：padding 34px 0 */
  layerPaddingY: 34,
  /** line-height 1.7（12.5px 字号折算 21px） */
  lineHeight: 21,
} as const

/* ================= 卡片网格与歌单卡（.pl-grid / .pl-card） ================= */

// styles.css L232-239。网格列数与间隙同时供「计算单卡宽度」使用（见 hooks/useGridItemWidth）
export const CARD_GRID = {
  /** grid-template-columns:1fr 1fr */
  columns: 2,
  /** gap:14px 12px（行 / 列） */
  rowGap: 14,
  columnGap: 12,
} as const

export const PL_CARD = {
  /** .pt 上边距 8 / 行高 1.35 / 最多两行 */
  titleMarginTop: 8,
  titleLineHeightRatio: 1.35,
  titleLines: 2,
  /** .ps 上边距 3 / 与圆点间距 5 */
  metaMarginTop: 3,
  metaGap: 5,
  /** .src-dot 5px 圆点（颜色取平台 tint） */
  dotSize: 5,
} as const

/* ================= 榜单卡（.rank-grid / .rk-card，styles.css L376-397） ================= */

// 第 7a 轮封面改版后榜单卡只剩摆位/描边/按压三项；渐变与纹理 token 已随旧实现退役
// （底色/符号色走 theme/chart.ts，文字度量走下方 CHART_ART）
export const RANK_CARD = {
  /** .rank-grid margin-top:18px */
  gridMarginTop: 18,
  /** .rk-card inset 0 0 0 1px rgba(255,255,255,.16)：1px 高光描边 */
  ringAlpha: 0.16,
  /** .rk-card:active scale(.96) */
  pressScale: 0.96,
} as const

/* ================= 排行榜分段头与分批续取（.rank-group / RANK_PAGE_SIZE，styles.css L379-384 + app.js L469/L534） ================= */

// 整平台全列（第 7b 轮）：一屏放不下四十五张卡，按平台插分段头 + 滚到底续取下一批
export const RANK_GROUP = {
  /** .rank-group gap:8px（b 与 span 之间，align-items:baseline） */
  gap: 8,
  /** .rank-group margin:12px 0 -4px；:first-child 的 margin-top:0 由组件 first 属性落 */
  marginTop: 12,
  marginBottom: -4,
  /** b{font-size:13.5px;font-weight:800} */
  titleSize: 13.5,
  /** span{font-size:10.5px} */
  countSize: 10.5,
} as const

// 分批续取的分页数值（app.js：RANK_PAGE_SIZE=8；rankScroll 触发线 scrollHeight-160）
export const RANK_PAGING = {
  /** 每批上卡的张数 */
  pageSize: 8,
  /** 距底多少 px 触发续取（原型 160px 原值，RN 侧按 px 距离判定而非视口倍数） */
  endReachedDistance: 160,
} as const

/* ================= 分页状态行（.pl-status，styles.css L272-275） ================= */

// 排行榜页与歌单详情页共用同一语义（原型 PLD_STATUS），故 token 独立于 rank 区块
export const PAGING_STATUS = {
  /** padding:14px 6px */
  paddingVertical: 14,
  paddingHorizontal: 6,
  /** font-size:12px；可点（非 disabled）时 color:var(--brand) + font-weight:700 */
  fontSize: 12,
  /** 动画标识与文字之间 gap:7px（原型 L274；2026-10-15 起转圈换成 RunningDots，键名去 spin 语义） */
  contentGap: 7,
} as const

/* ============ 分页「正在获取」动画标识（RunningDots，2026-10-15 同事清单） ============ */

// 静态转圈在长列表尾巴上存在感太弱（真机反馈）。换成三颗圆点按接力顺序「起跳-落地」——
// 跑动感的简笔等价物：每颗占周期的 1/3 窗口完成一次起跳落地，三窗恰好铺满一周、循环处无缝。
// 颜色取品牌渐变三端点（GRADIENTS.brand.colors，#FF5C8A / #C04CE8 / #7A3BFF），与原型主色同源；
// 纯核心 Animated + useNativeDriver，不引入任何新依赖。
export const RUNNING_DOTS = {
  /** 圆点直径（与旧 13px 转圈同量级，略小显轻快） */
  dotSize: 6,
  /** 三颗点之间的间距 */
  dotGap: 5,
  /** 起跳峰值（translateY 向上，px） */
  hopHeight: 7,
  /** 没轮到的点的静息透明度（1 = 正在跳的那颗，形成「接力棒」亮序） */
  idleAlpha: 0.4,
  /** 完整一轮（三颗点各跳一次）周期 ms，与旧 spin .9s 同拍 */
  cycleMs: 900,
} as const

/* ================= 列表终点行（.pl-end，styles.css L281-285） ================= */

// 「没有更多了」：滚到底能确认「就这些」，两侧细线把它收成一条句号横线（榜单页/歌单池/详情层共用）
export const PAGING_END = {
  /** margin:20px 2px 6px（网格内 .pl-grid>.pl-end 收 margin-top:10px，走 marginTopInGrid） */
  marginTop: 20,
  marginTopInGrid: 10,
  marginBottom: 6,
  marginX: 2,
  /** gap:10px（文字与两侧细线） */
  gap: 10,
  /** 细线 height:1px / opacity:.22（background:currentColor 即 text-3 本色压透明度） */
  lineHeight: 1,
  lineAlpha: 0.22,
  /** font-size:11.5px / letter-spacing:.4px */
  fontSize: 11.5,
  letterSpacing: 0.4,
} as const

// 歌单页「推荐歌单池」分批续取（app.js L660 PL_POOL_SIZE=10）。
// 独立数值另立键：与排行榜的 RANK_PAGING.pageSize=8 只是同期引入，语义与取值都不同；
// 距底触发线复用 RANK_PAGING.endReachedDistance（触底链路 MainScreen/PageViewport 本就共用）
export const PL_POOL_PAGING = {
  /** 每屏落的歌单份数（首屏 10 份，滚到底再落下一批） */
  pageSize: 10,
} as const

/* ================= 榜单封面（chartArt / .rk-card 文字层，app.js L596-638 + styles.css L376-397） ================= */

// 封面 = 平色深底（theme/chart.ts 的 chartCoverBg）+ 单色线条符号 + 两行真数据文字。
// 图上文字锁白、不参与主题反相（色走 ART_INK）；字号 17 与 FONT_SIZE.statValue 同值但语义不同，就近定义（L611 先例）
export const CHART_ART = {
  /** .rk-name：left/right 13 / bottom 30 */
  nameInsetX: 13,
  nameBottom: 30,
  /** .rk-name：17px / line-height 1.25（17×1.25）/ 字距走 LETTER_SPACING.normal */
  nameSize: 17,
  nameLineHeight: 21.25,
  /** .rk-name text-shadow 0 2px 14px rgba(0,0,0,.5) */
  nameShadowAlpha: 0.5,
  nameShadowOffsetY: 2,
  nameShadowRadius: 14,
  /** .rk-sub：left/right 13 / bottom 12，色 rgba(255,255,255,.76)，字号走 FONT_SIZE.tiny */
  subInsetX: 13,
  subBottom: 12,
  subAlpha: 0.76,
} as const

/* ================= 我的歌单卡（.my-pl，歌单页横滑排） ================= */

// styles.css L332-338：卡宽 120，封面 120×120 圆角 16；名字 12.5/700、副行 11/text-3
// 行间隙 12 与 .hscroll 相同，直接复用 H_SCROLL.gap
export const MY_PL = {
  width: 120,
  /** .my-pl .art 120×120 */
  artSize: 120,
  /** .my-pl .art border-radius:16px（数值与 RADIUS.pill 相同但语义不同，就近定义） */
  artRadius: 16,
  /** .mp-n margin-top:8px */
  nameMarginTop: 8,
  /** .mp-s margin-top:2px */
  subMarginTop: 2,
} as const

/* ================= 我的页（.mine-head / .stat-row / .fav-card，styles.css L353-391） ================= */

// 头像 / 我喜欢卡都压在渐变底上，描边与圆点色走 ART_INK（不随主题反转）；
// 头像字色原型为 #12060c，与色板 onBrand(#0A0A0F) 差一档，归到 onBrand（已知近似）
export const MINE = {
  /** .mine-head margin-top:8 / gap:13 */
  headMarginTop: 8,
  headGap: 13,
  /** .mh-art 58×58 全圆，字 26 走 FONT_SIZE.mineInitial */
  headArtSize: 58,
  /** .mh-art inset 0 0 0 1.5px rgba(255,255,255,.22)：渐变底上的亮描边 */
  headRingWidth: 1.5,
  headRingAlpha: 0.22,
  /** .mh-sub margin-top:3 */
  headSubMarginTop: 3,
  /** .mh-edit .ic 14px（PillButton 缺省 15 是 .pl-open-btn 档） */
  headEditIcon: 14,
  /** .stat-row margin-top:18 / gap:8 */
  statMarginTop: 18,
  statGap: 8,
  /**
   * 统计条限宽（原型 styles.css L934 `.pad .stat-row{max-width:620px}`，notes L578）：
   * Pad/宽屏下不被拉到整页宽显得空洞；手机竖屏视口本就窄于该值，这条天然不生效，
   * 落进 theme 只为宽屏形态留口径，组件内不写死。
   */
  statMaxWidth: 620,
  /** .stat padding 11px 4px / radius:16；底色 .05 归到色板 chip(.055)，描边归到 line */
  statPaddingY: 11,
  statPaddingX: 4,
  statRadius: 16,
  /** .stat span margin-top:3 */
  statLabelMarginTop: 3,
  /** .fav-card margin-top:20 / padding:14 / gap:13 */
  favMarginTop: 20,
  favPadding: 14,
  favGap: 13,
  /** .fav-card inset 0 0 0 1px rgba(255,255,255,.13)（压在渐变洗底上，走 ART_INK 白） */
  favRingAlpha: 0.13,
  /** .fc-art 62×62 圆角 17，图标 heartFill 25（渐变底 --grad + SHADOW.glow） */
  favArtSize: 62,
  favArtRadius: 17,
  favArtIcon: 25,
  /** .fav-card p margin-top:4 */
  favSubMarginTop: 4,
  /** .fc-go 32×32 圆底 rgba(0,0,0,.3)，play 图标 15 */
  favGoSize: 32,
  favGoAlpha: 0.3,
  favGoIcon: 15,
  /** .fav-card:active scale(.99) */
  favPressScale: 0.99,
} as const

/* ================= 封面播放角标（.play-badge） ================= */

// styles.css L208-213，压在封面右下（recent-card / pl-card 共用）
export const PLAY_BADGE = {
  size: 24,
  /** right / bottom 偏移 */
  offset: 8,
  /** 图标 11px，margin-left 1px（视觉居中补偿） */
  icon: 11,
  iconOffset: 1,
} as const

/* ================= 横向胶囊选择条（.rank-tabs / .cat-row） ================= */

// styles.css L242-243：gap 7，margin:-2px 0 12px（rank-tabs）
// styles.css L322-329：cat-row 吸顶形态 —— 贴屏边横滑，gap 7，上 14 / 下 14，内上 3 内下 8
export const CHIP_ROW = {
  gap: 7,
  marginTop: -2,
  marginBottom: 12,
  /** .cat-row margin:14px -16px 0 */
  catMarginTop: 14,
  /**
   * .cat-row margin-bottom:14 —— 原型里它与后继 .section 的 margin-top:26 发生 CSS 外边距折叠，
   * 有效间隙取大者 26；RN 无折叠，这里置 0，由 Section 的 26 提供唯一间距（阶段 5 修掉的偏松问题）。
   */
  catMarginBottom: 0,
  /** .cat-row padding:3px 16px 8px */
  catPaddingTop: 3,
  catPaddingBottom: 8,
} as const

/* ================= 首页轮播（.banner-wrap / .banner-track / .banner / .banner-dots） ================= */

// styles.css L174-190。轮播单卡宽度 = 屏宽 - 两侧 .page 内边距（.banner width:100%）
export const BANNER = {
  /** .banner-wrap margin-top:14px */
  marginTop: 14,
  /** .banner-track 卡片间 gap:12px（同时用于计算 snapToInterval） */
  trackGap: 12,
  /** .banner 高 150 / padding 16 */
  height: 150,
  padding: 16,
  /** .veil to top rgba(0,0,0,.62) → rgba(0,0,0,.05) 62% 处 → 透明；RN 用 stops 表达 */
  veilAlphas: [0.62, 0.05, 0],
  veilStops: [0, 0.6, 1],
  /** .b-tag padding 4px 9px */
  tagPaddingY: 4,
  tagPaddingX: 9,
  /** .banner p margin-top:3px；色 rgba(255,255,255,.78)——图上文字不随主题反转 */
  subMarginTop: 3,
  subAlpha: 0.78,
  /** .banner-dots gap 5 / margin-top 10；i 5×5，.on 宽 16 */
  dotsGap: 5,
  dotsMarginTop: 10,
  dotSize: 5,
  dotActiveWidth: 16,
  /** .banner-dots i border-radius:3px */
  dotRadius: 3,
  /** .banner-dots i 底色 rgba(255,255,255,.22)：浅深两套都按「主文字色 × 该浓度」推导 */
  dotIdleAlpha: 0.22,
  /** 自动换播间隔（app.js renderBanners 的 setInterval 4200） */
  autoSwap: 4200,
} as const

/* ================= 快捷入口（.quick-row / .quick / .qa） ================= */

// styles.css L193-197：四等分 grid，gap 8；封面块 60×60、圆角 20（即 RADIUS.art）
export const QUICK_ROW = {
  marginTop: 22,
  /** grid-template-columns:repeat(4,1fr) */
  columns: 4,
  gap: 8,
  /** .quick .qa 60×60 */
  artSize: 60,
  /** .qa 内图标 20px（app.js artIcon(q.seed, q.icon, '20px')） */
  iconSize: 20,
  /** .quick 内图文 gap 8 */
  labelGap: 8,
} as const

/* ================= 横向滑动容器（.hscroll） ================= */

// styles.css L200：margin:0 -16px + padding-left/right 16px（贴屏边滑），gap 12
export const H_SCROLL = {
  gap: 12,
  /** padding-bottom:2px */
  paddingBottom: 2,
} as const

/* ================= 继续收听卡（.recent-card） ================= */

// styles.css L203-207：固定宽 112，封面 112×112
export const RECENT_CARD = {
  width: 112,
  /** .rt margin-top:8px */
  titleMarginTop: 8,
  /** .rs margin-top:2px */
  subMarginTop: 2,
} as const

/* ================= 每日推荐卡（.daily-card） ================= */

// styles.css L216-229：高 98 的横向卡，左封面 98×98 仅右侧圆角
export const DAILY_CARD = {
  height: 98,
  /** 封面与正文 gap 14 / 卡片右内边距 16 */
  gap: 14,
  padding: 16,
  /** .dc-art 98×98，圆角取 RADIUS.l（左上/左下为 0） */
  artSize: 98,
  /** h3 / p 上边距 */
  titleMarginTop: 4,
  subMarginTop: 3,
  /** .date 胶囊：top/right 16，padding 4px 8px，圆角取 RADIUS.tag */
  dateTop: 16,
  dateRight: 16,
  datePaddingY: 4,
  datePaddingX: 8,
} as const

/* ================= 随手听卡（.radio-grid / .radio-card） ================= */

// styles.css L291-302：两列 gap 12，卡高 108，纹在底、字在下，右上角「建设中」胶囊
export const RADIO_CARD = {
  /** .radio-grid gap:12px（与 .pl-grid 的 14/12 不同，故 CardGrid 需可覆盖间隙） */
  gridGap: 12,
  height: 108,
  padding: 16,
  /** .bgart 透明度 .5 */
  artOpacity: 0.5,
  /** .ic-top top/left 16，20px，opacity .85 */
  iconOffset: 16,
  iconSize: 20,
  iconOpacity: 0.85,
  /** h4 margin:30px 0 0（卡高定死 + 内容贴底，该上边距被布局吸收，不进 RN 样式）；p margin:5px 0 0 */
  subMarginTop: 5,
  /** .wip-tag top/right 12，padding 3px 7px */
  wipTop: 12,
  wipRight: 12,
  wipPaddingY: 3,
  wipPaddingX: 7,
} as const

/* ================= 歌手卡（.artist-card） ================= */

// styles.css L285-288：横滑排里的圆形头像 + 单行名字
export const ARTIST_CARD = {
  /** .artist-card width:76px */
  width: 76,
  /** .artist-card .art 68×68，圆形 */
  artSize: 68,
  /** .artist-card gap:8px */
  gap: 8,
} as const

/* ================= 播放页（.player-layer，styles.css L504-588） ================= */

// 顶栏 / 舞台 / 曲信息 / 进度 / 控制 / 工具行逐段提取；
// 播放浮层是「全屏页」而非右推层，接入形态见 screens/Player 与 navigation/entry
export const PLAYER = {
  /** .player-layer padding:56px 22px 32px（56 含 52 模拟状态栏，真机 = 实测状态栏 + 4） */
  paddingTopReserve: 4,
  paddingX: 22,
  paddingBottom: 32,
  /** 浮层上滑入场时长（transition transform .46s） */
  enterDuration: 460,
  /** .player-top / .pl-top grid 34/1fr/34（返回钮复用 BUTTON.iconSize 档） */
  topRightSlot: 34,
  /** .player-crumb gap 8 */
  crumbGap: 8,
  /** .player-stage padding:16px 0 */
  stagePaddingY: 16,
  /** 舞台横滑（唱片 ↔ 歌词）接管阈值：水平位移 ≥ 24px 且 ≥ 垂直位移 × 1.5 才算一次横滑；
   *  判定纯函数见 screens/Player/PlayerStageSwipe.ts 的 resolveStageSwipe */
  stageSwipeMinDx: 24,
  stageSwipeSlope: 1.5,
  /** .player-bg：blur(70px) 不可用，降级为封面渐变底 × .45 透明度 */
  bgOpacity: 0.45,
  /** .player-bg 140deg 的 start/end 近似（近竖向略右斜） */
  bgStart: { x: 0.2, y: 0 },
  bgEnd: { x: 0.8, y: 1 },
  /** .disc 206×206 全圆 */
  discSize: 206,
  /** .disc inset 0 0 0 8px rgba(0,0,0,.35)：内圈刻纹环 */
  discInnerRing: 8,
  discInnerRingAlpha: 0.35,
  /** .disc 外 1px rgba(255,255,255,.1) 高光 */
  discRingAlpha: 0.1,
  /** .disc::after inset 38%：中心孔直径 = 盘径 × 0.24 */
  discHoleRatio: 0.24,
  discHoleAlpha: 0.55,
  discHoleRingAlpha: 0.12,
  /** .lyric-wrap::before/::after 渐隐带：height 48px、压盖深度 rgba(8,8,12,.8)（styles.css L534-536）。
   *  2026-10-13 起 RN 侧不再用压盖渐变层（真机成黑框），这两个值改作「行透明度插值」的
   *  带宽与最大衰减深度，见 components/LyricList 的 fadeRamp */
  lyricFadeHeight: 48,
  lyricFadeAlpha: 0.8,
  /** .lyric-scroll padding:0 6px */
  lyricPaddingX: 6,
  /** .ln 13.5px / line-height 26 / opacity .75（字号走 FONT_SIZE.bodyLg） */
  lyricLineHeight: 26,
  lyricOpacity: 0.75,
  /** .ln.on 17px / 800 */
  lyricActiveSize: 17,
  /** .ln.on text-shadow 0 5px 22px <color>（styles.css L612 / L1166）：颜色走 colors.lyricGlow（两套主题各一档），此处只收偏移与半径。
   *  2026-10-15 半径/偏移由原值 22/5 收到 6/1：CSS 的大半径是几乎不可见的柔光，RN（Android）同数值会糊成可见暗斑脏了当前行，
   *  这里对齐的是「原型当前行无背景块、只靠字号字重颜色分层」的真实观感，而非字面数字 */
  lyricGlowOffsetY: 1,
  lyricGlowRadius: 6,
  /** .ln-note margin-top 14 / opacity .8（字号走 FONT_SIZE.tiny） */
  lyricNoteMarginTop: 14,
  lyricNoteAlpha: 0.8,
  /** .player-meta gap 12 */
  metaGap: 12,
  /** .player-artist margin-top 5（字号 FONT_SIZE.body） */
  artistMarginTop: 5,
  /** .pc.fav 40×40 / 图标 24 */
  favSize: 40,
  favIcon: 24,
  /** .player-source gap 7 / margin-top 10（字号 FONT_SIZE.caption） */
  sourceGap: 7,
  sourceMarginTop: 10,
  /** .seek 高 5 圆角 3，margin 24px 0 8px；::before inset -14px -3px 为触区外扩 */
  seekHeight: 5,
  seekRadius: 3,
  seekMarginTop: 24,
  seekMarginBottom: 8,
  /** 触区纵向外扩 14（横向的 -3 有意不采纳：拖拽层必须与视觉条严格等宽，
   *  宽度多算 3px 就会让 locationX/宽度 的映射偏差，落位差之毫厘；同旧 UI pressBar 口径）。
   *  2026-10-15 撤掉上一版 seekSettleMs 冻结保护窗口：改回旧 UI 机制后不需要它（见 SeekControl 注释） */
  seekHitPadY: 14,
  /** .seek em 旋钮 11px 白，主色光晕 */
  seekThumb: 11,
  /** 舞台下方指示点 .stage-dots（styles.css L634-638）：gap 6 / margin -4 0 2 /
   *  点 5×5 全圆 currentColor（= text 色）透明度 .28，当前态加宽成 16 胶囊、透明度 1。
   *  原型横屏/Pad 隐藏是「同屏无翻页」所致，RN 固定竖屏 → 常显，不做隐藏逻辑 */
  stageDotsGap: 6,
  stageDotsMarginTop: -4,
  stageDotsMarginBottom: 2,
  stageDotSize: 5,
  stageDotActiveWidth: 16,
  stageDotIdleOpacity: 0.28,
  /** .player-controls：居中 gap 38 / margin-top 18（styles.css L641，三颗制） */
  controlsGap: 38,
  controlsMarginTop: 18,
  /** .pc 46×46 全圆；.pc.ghost 图标 27；.pc.tool 图标 21 + 标签 9.5（FONT_SIZE.micro）。
   *  2026-10-13 控件行改版后主行只剩 ghost/main 两类，tool 度量仅供 PcButton 保留变体引用 */
  pcSize: 46,
  pcGhostIcon: 27,
  pcToolIcon: 21,
  pcToolLabelSize: 9.5,
  pcToolGap: 2,
  /** .pc.main 64×64 渐变底 / 图标 27 */
  mainSize: 64,
  mainIcon: 27,
  /** .player-tools：两端对齐 gap 2 / margin-top 14（styles.css L649） */
  toolsGap: 2,
  toolsMarginTop: 14,
  /** .pt-btn padding 9px 2px / 图标 21（styles.css L650-652，纯图标版：无圆角底、无文字） */
  ptPaddingY: 9,
  ptPaddingX: 2,
  ptIcon: 21,
  /** .pc:active scale(.93) / .pt-btn:active scale(.94) */
  pcPressScale: 0.93,
  ptPressScale: 0.94,
  /** .pc.fav:active 同为 .pc 规则的 scale(.93) */
  favPressScale: 0.93,
} as const

/* ================= 迷你播放条（.minibar，styles.css L453-477） ================= */

export const MINIBAR = {
  /** 高 58 / 圆角 20 */
  height: 58,
  radius: 20,
  /** left/right 12 */
  marginX: 12,
  /** bottom: safe-b + 66（Tab 栏 60 之上再抬 6） */
  gapAboveTabBar: 6,
  /** .mini-progress 高 2（底 rgba(255,255,255,.09) 归到 glassStrong .085） */
  progressHeight: 2,
  /** .mini-main padding 0 12 / gap 11 */
  paddingX: 12,
  gap: 11,
  /** .mini-art 42×42 圆角 11 */
  artSize: 42,
  artRadius: 11,
  /** .mini-sub gap 6 / margin-top 2 / .sep 1×9 */
  subGap: 6,
  subMarginTop: 2,
  sepWidth: 1,
  sepHeight: 9,
  /** .mini-act 34 全圆 / 图标 19（primary 内 17） */
  actSize: 34,
  actIcon: 19,
  primaryIcon: 17,
  /** .mini-act:active scale(.9) */
  pressScale: 0.9,
} as const

/* ================= 底部浮层（.sheet，styles.css L706-723，阶段 9b） ================= */

// 原型 .sheet 是所在层的绝对定位覆盖（遮罩 + 上滑体），RN 侧同构实现为
// 「所在屏幕根 View 内的 absolute-fill 覆盖层」（见 components/Sheet）。
export const SHEET = {
  /** .sheet-mask 底 rgba(0,0,0,.55)（styles.css L710） */
  maskAlpha: 0.55,
  /** .sheet-mask backdrop-filter:blur(3px)（styles.css L710）
   *  2026-10-14 第 14 轮：遮罩接共通毛玻璃依赖 @react-native-community/blur 的 BlurView
   *  真模糊（原「无模糊依赖降级为纯半透明黑」注释作废）；不可用时仍退回纯 .55 黑。 */
  maskBlur: 3,
  /** .sheet-body border-radius:28px 28px 40px 40px（styles.css L712）。
   *  底部 40px 的口径澄清：原型 .screen 是 border-radius:44px + overflow:hidden 的假机框
   *  （styles.css L77），40 是为了让贴底面板外缘嵌合机框圆角；RN 真机面板直接贴物理屏底边，
   *  机框圆角由硬件承担，底部照此口径应为直角 —— 2026-10-14 第 14 轮真机反馈缺陷 1 改 0。 */
  radiusTop: 28,
  radiusBottom: 0,
  /** padding:8px 20px 30px */
  paddingTop: 8,
  paddingX: 20,
  paddingBottom: 30,
  /** max-height:78%（按窗口高折算的滚动上限） */
  maxHeightRatio: 0.78,
  /** 顶边 1px 高光 inset rgba(255,255,255,.1)：取色板 lineStrong（dark .14）近似 */
  /** .sheet-handle 36×4 胶囊（底色 .18 = 色板 overlayStrong），margin 6 auto 14 */
  handleWidth: 36,
  handleHeight: 4,
  handleRadius: 2,
  handleMarginTop: 6,
  handleMarginBottom: 14,
  /** .sheet-sub margin-top:5 / line-height 1.6（12.5px × 1.6 = 20） */
  subMarginTop: 5,
  subLineHeight: 20,
  /** 浮层内「开关/设置行」面板（原型 .eq-switch padding:12px 14px / radius:14 / gap:12）。
   *  2026-10-13 均衡浮层随假能力移除后，此度量归为浮层通用行面板，仍供 TimerSheet 的
   *  「等当前这首放完再停」开关行复用（底 chip / 描边 line 走色板）。 */
  rowPaddingY: 12,
  rowPaddingX: 14,
  rowRadius: 14,
  rowGap: 12,
  /** 动效：遮罩淡入 .3s（= MOTION.slow）、体贴 .4s、整体退场 visibility 延迟 .42s。
   *  token 文件内不能前向引用 MOTION，写死并注明 */
  bodyDuration: 400,
  exitDuration: 420,
  /** 触底判定距离（px）：滚动到距内容底不足此值即视为「到底」，浮层分页用
   *  （RN ScrollView 无 FlatList 式 onEndReachedThreshold 比例语义，取固定像素近似） */
  endReachThreshold: 300,
} as const

/* ================= 二次确认浮层（QA D-09，#confirmSheet，index.html L498-509；
   .cf-actions / .cf-btn，styles.css L501-505） ================= */

export const CONFIRM_SHEET = {
  /** .cf-actions display:flex gap:10 margin-top:20 */
  actionsGap: 10,
  actionsMarginTop: 20,
  /** .cf-btn flex:1 / height:44 / border-radius:15 / font-size:14 / font-weight:800 */
  btnHeight: 44,
  btnRadius: 15,
  btnFontSize: 14,
  /** .cf-btn:active transform:scale(.98) */
  pressScale: 0.98,
} as const

/* ================= 提示胶囊（.toast，styles.css L795-803 + app.js L101-107，QA D-09 观感） ================= */

// 原型 .toast 是深色贴片胶囊（--glass 底 + --glass-ink 字 + 1px --line-strong 描边），
// RN 此前走系统 ToastAndroid 白框——颜色/圆角/时长全收敛到这里，色板键不进本块（glassPatch 家族）
export const TOAST = {
  /** padding:10px 16px（L798） */
  paddingY: 10,
  paddingHorizontal: 16,
  /** border-radius:14px（数值与 RADIUS.control 同但语义不同，就近定义，L611 先例） */
  radius: 14,
  /** font-weight:600（字号 = FONT_SIZE.smallLg，组件侧引用该键；字符串形态直入 RN fontWeight 联合类型） */
  fontWeight: '600',
  /** max-width:78%（按窗口宽折算） */
  maxWidthRatio: 0.78,
  /** bottom:190px（原型 .screen 844 高含 --safe-b 22 → 净 168，RN 侧再加实测底部安全区） */
  bottomGap: 168,
  /** 未示出时下沉位移：transform:translate(-50%,14px) → .show 归零（L797/L803） */
  riseOffset: 14,
  /** 进出场过渡时长 .32s var(--ease)（L801） */
  animDuration: 320,
  /** 停留时长（app.js L107 setTimeout 2000，覆盖重展时重新计时 L106） */
  visibleMs: 2000,
  /** 长文案档：原调用位以 'long' 标记的长句（原型只有 2000 一档，此值是 RN 侧自定参数，
   *  对齐 ToastAndroid.LONG 的 3.5s 量级，避免长句读不完） */
  visibleMsLong: 3500,
  /** box-shadow:0 16px 40px -12px rgba(0,0,0,.8)（L800）：负 spread 无法表达，降 opacity 近似 */
  shadowColor: '#000000',
  shadowOffsetY: 16,
  shadowRadius: 40,
  shadowOpacity: 0.5,
  elevation: 10,
} as const

/* ================= 评论行（.cmt-*，styles.css L632-646，阶段 9b） ================= */

export const COMMENT = {
  /** .cmt-total b 19px（FONT_SIZE.headingLg）/ gap:8 / margin-bottom:2 */
  totalGap: 8,
  totalMarginBottom: 2,
  /** .cmt-item gap:11 / padding:13px 0 / border-top 1px line */
  itemGap: 11,
  itemPaddingY: 13,
  /** .cmt-item .art 34×34 全圆 */
  avatarSize: 34,
  /** .cmt-line gap:8；.cmt-like gap:4、图标 13 */
  lineGap: 8,
  likeGap: 4,
  likeIcon: 13,
  /** .cmt-text margin-top:4 / line-height 1.55（13 × 1.55 ≈ 20） */
  textMarginTop: 4,
  textLineHeight: 20,
  /** .cmt-reply margin-top:7 / padding:8px 10px / radius:10（底 .05 归 chip） */
  replyMarginTop: 7,
  replyPaddingY: 8,
  replyPaddingX: 10,
  replyRadius: 10,
  /* ---- 回复层级（bug-fix「评论浮窗」第 2 条，2026-10-13）----
   * 原型只画了单层 .cmt-reply 样例，以下三项为新 UI 在同一设计语言下的自造度量。 */
  /** 回复线程每级缩进：取 12，贴近 .cmt-item gap 11 / chip padding 10 的量级，不散写魔数 */
  replyIndent: 12,
  /** 回复线程左侧竖线宽（层级线索）：1px 在深底 surface 上几乎看不见，2px 才可读 */
  threadRuleWidth: 2,
  /** 回复线程与上级评论之间的间距 */
  threadMarginTop: 6,
  /**
   * 回复呈现深度上限：实测五平台（kw/wy/tx/mg/kg）comment filterComment 给到的结构化
   * 数据最深只有 2 级（根评论 + 一层回复数组，回复项自身不再带 reply），3 是防御性余量——
   * 万一未来出现更深层级，超过上限的回复平铺在限额一级显示，
   * 避免长串回复把正文挤成窄条（参照主流音乐 App 对深层回复停止缩进的做法）。
   */
  maxReplyDepth: 3,
  /** 分页状态行：padding 照抄旧 List.tsx Footer 样式（createStyle footer padding:10） */
  morePadding: 10,
} as const

/* ================= 搜索层（.search-layer，styles.css L707-739，阶段 9b） ================= */

// 原型 .pl-layer 右推转场 transform translateX 100% → 0 / .44s（L394-402），
// 新 UI 用 RNN push + elementTransitions translationX 复刻（见 navigation/entry）。
export const SEARCH = {
  /** 转场时长（.pl-layer transition .44s） */
  enterDuration: 440,
  /** .sc-top padding:54px 14px 12px（54 含 52px 模拟状态栏，真机 = 实测状态栏 + 2） */
  statusBarReserve: 2,
  paddingX: 14,
  paddingBottom: 12,
  gap: 10,
  /** .sc-box 高 40 / 圆角 13 / paddingX 11 / gap 9 / 图标 16；输入 14.5（FONT_SIZE.title） */
  boxHeight: 40,
  boxRadius: 13,
  boxPaddingX: 11,
  boxGap: 9,
  boxIcon: 16,
  /** .sc-box:focus-within 描边 rgba(255,92,138,.5) 1.5px */
  focusRingWidth: 1.5,
  focusRingAlpha: 0.5,
  /** .sc-x 18×18 全圆（底 .18 = overlayStrong）/ 图标 10 */
  clearSize: 18,
  clearIcon: 10,
  /** .sc-cancel 13.5（FONT_SIZE.bodyLg）/ padding:6px 2px */
  cancelPaddingY: 6,
  /** .sc-body padding:0 16px 40px */
  bodyPaddingX: 16,
  bodyPaddingBottom: 40,
  /** .sc-tabs gap:22 / padding:6px 16px 9px；指示条 17×3（bottom -5 → 绝对定位近似） */
  tabsGap: 22,
  tabsPaddingTop: 6,
  tabsPaddingX: 16,
  tabsPaddingBottom: 9,
  tabIndicatorWidth: 17,
  tabIndicatorHeight: 3,
  /** .sc-tabs button.on::after border-radius:2px */
  tabIndicatorRadius: 2,
  /** ::after bottom:-5px：RN 的 bottom 语义与 CSS 相同，横条底边压到文字盒下方 5px */
  tabIndicatorPad: 5,
  /** .sc-tabs em 11px，左距 5，opacity .65 */
  tabCountMarginLeft: 5,
  tabCountOpacity: 0.65,
  /** .sc-label margin:18px 0 10px */
  labelMarginTop: 18,
  labelMarginBottom: 10,
  /** .sc-clear 11.5 / 图标 13 */
  clearWordIcon: 13,
  /** .hot-words gap:8（与 .q-chips 相同，另见 CHIP_FLOW） */
  wordsGap: 8,
  /** .sc-empty padding:46px 0 / 12.5 line-height 1.9 ≈ 24；b 14（FONT_SIZE.rank 档） */
  emptyPaddingY: 46,
  emptyLineHeight: 24,
  /** .sc-hint margin-top:16 */
  hintMarginTop: 16,
} as const

/* ================= 歌单详情层（.pl-layer，styles.css L394-431，阶段 9c） ================= */

// 原型 .pl-layer 是「右推整页 + 层内整体滚动」：顶排 / hero / 操作排都在滚动内容里，
// RN 侧用 FlatList 的 ListHeaderComponent 承载（见 screens/SonglistDetail）。
// 转场与搜索层同源（同一条 .pl-layer 规则），此处独立成块供 entry 与页面取度量。
export const PL_LAYER = {
  /** 右推转场时长（.pl-layer transition transform .44s，与 SEARCH.enterDuration 同源同值） */
  enterDuration: 440,
  /** .pl-layer padding:58px 16px 34px（58 含 52px 模拟状态栏，真机 = 实测状态栏 + 6） */
  paddingTopReserve: 6,
  paddingX: 16,
  paddingBottom: 34,
  /**
   * .pl-bg inset:0 height:56% opacity:.42（blur(64) 不可用：降级为封面种子渐变直接铺底）。
   * 降级后必须走 `CoverWash`：显式压在内容之下 + 整层不吃触摸 + 下沿渐隐（原型的模糊自带收边）。
   */
  bgHeightRatio: 0.56,
  bgAlpha: 0.42,
  /** .pl-hero margin:22px 0 2px / gap 14 / min-height 124 */
  heroMarginTop: 22,
  heroMarginBottom: 2,
  heroMinHeight: 124,
  heroGap: 14,
  /** .pl-hero .art 124×124（圆角走 RADIUS.art=20；外投影负 spread 无法表达，取 SHADOW.card 近似） */
  heroArtSize: 124,
  /** .ph-body gap:6；h3 18(=FONT_SIZE.heading)/900 lh1.35；.ph-sub 11.5(FONT_SIZE.captionLg) lh1.5 */
  heroBodyGap: 6,
  heroTitleLineHeightRatio: 1.35,
  heroSubLineHeightRatio: 1.5,
  /** .ph-meta gap:6 / 10.5px(FONT_SIZE.tiny)；.sep 竖线 1×9 */
  metaGap: 6,
  metaSepWidth: 1,
  metaSepHeight: 9,
  /** .pl-actions margin:18px 0 16px / gap:8（ghost 占 flex:1；icon-btn 走 BUTTON.iconSizeLg 档） */
  actionsMarginTop: 18,
  actionsMarginBottom: 16,
  actionsGap: 8,
} as const

/* ================= 选项行（.group-label / .opt-row / .radio，styles.css L670-687，阶段 9d） ================= */

// 音源设置浮层（#sourceSheet）的「已安装音源 / 音乐平台」两组列表行；
// 后续任何「单选列表浮层」都复用它。底色 rgba(255,255,255,.045) 归到色板 chip(.055)、
// 描边 inset line 归到色板 line（已知近似）；选中态渐变走 GRADIENTS.brandSoft（原型 --grad-soft L677）。
export const OPTION_ROW = {
  /** .group-label：10.5 / 800 / letter-spacing 1.3 / text-3 / margin 20 0 9 */
  labelSize: 10.5,
  labelLetterSpacing: 1.3,
  labelMarginTop: 20,
  labelMarginBottom: 9,
  /** .opt-list gap:7 */
  listGap: 7,
  /** .opt-row：gap 11 / padding 11 12 / radius 15 */
  gap: 11,
  paddingY: 11,
  paddingX: 12,
  radius: 15,
  /** .opt-row.on 描边 inset rgba(255,92,138,.34)（RN 无 inset，转 1px 实描边） */
  onBorderColor: 'rgba(255, 92, 138, 0.34)',
  /** .opt-row.off opacity */
  offAlpha: 0.42,
  /** .radio：18×18 全圆，未选 1.6px 内环（原型改版后走 var(--hairline-strong)，随主题反相，
   *  原 radioRingAlpha / radioCenterRingAlpha 两个白环浓度键因此失去用途，2b 轮清理） */
  radioSize: 18,
  radioRingWidth: 1.6,
  /** 选中：inset 6px 主色 → 中心留 18-6×2=6 亮环（同为 --hairline-strong） */
  radioFill: 6,
  radioCenterRingWidth: 1.6,
  /** .or-body gap:3；b 14/700；small 10.5/600；em 11 */
  bodyGap: 3,
  versionGap: 6,
  /** .or-state：10.5 / 800，前 6px 圆点，gap:5 */
  stateGap: 5,
  stateDotSize: 6,
  /** .opt-ic（styles.css L688-690，单曲操作面板动作行图标底）：30×30 圆角 10，
   * 底 rgba(255,255,255,.07) 归色板 glass、描边归 line、图标 16 取 text-2 */
  iconBoxSize: 30,
  iconBoxRadius: 10,
  iconBoxIcon: 16,
  /** .opt-row:active scale(.99) */
  pressScale: 0.99,
} as const

/* ================= 设定页分组行（.set-hero / .set-group / .set-list / .set-row，styles.css L436-456，2026-10-13） ================= */

// 原型 styles.css 只给深色一套：列表底 rgba(255,255,255,.045) 归色板 chip（同 StatRow 口径）、
// 1px 内描边与 .set-row border-top 归 line、按压态 rgba(255,255,255,.07) 归 press（近似，原型 .07 vs 色板 .06）、
// .set-ic 底 rgba(255,255,255,.07) 归 glass、.set-row.on 底走 GRADIENTS.brandSoft（--grad-soft L17）。
// .sg-label 与 .group-label 字号/字重/字距/下距完全一致，共通组件 GroupLabel 直接复用。
export const SETTINGS = {
  /** .set-hero margin:8px 2px 2px */
  heroMarginTop: 8,
  heroMarginX: 2,
  heroMarginBottom: 2,
  /** .sh-sub 12px / line-height 1.65（12 × 1.65 ≈ 20） */
  heroSubSize: 12,
  heroSubLineHeight: 20,
  /** .set-group margin-top:26px（Pad 侧 .pad 规则为 22，手机端取主规则 26） */
  groupMarginTop: 26,
  /** .sg-label margin:0 0 9px 3px（下距 9 由 GroupLabel 自带，这里补左距并抹掉其上距） */
  groupLabelMarginLeft: 3,
  /** .set-list border-radius:18px → 组件直接用 RADIUS.m（该键注释即 .set-list，语义相同） */
  /** .set-row gap:11 / padding:13px 14px */
  rowGap: 11,
  rowPaddingY: 13,
  rowPaddingX: 14,
  /** .set-ic 28×28、圆角 9；内部 .ic 15 */
  iconBoxSize: 28,
  iconBoxRadius: 9,
  iconGlyphSize: 15,
  /** .st-l gap:2 */
  bodyGap: 2,
  /** .st-l b 14 / 700 / letter-spacing .1（数值与 FONT_SIZE.rank 同但语义不同，就近定义，同 L611 先例） */
  titleSize: 14,
  titleLetterSpacing: 0.1,
  /** .st-l em 11 / line-height 1.45（≈16） */
  hintSize: 11,
  hintLineHeight: 16,
  /** .st-r gap:4 / 12 / 600；.ic 14 / opacity .5 */
  valueGap: 4,
  valueSize: 12,
  valueIconSize: 14,
  valueIconAlpha: 0.5,
} as const

/* ================= 单曲操作面板头部（.more-song，styles.css L446-451，阶段 9e） ================= */

// #moreSheet 顶部的「封面 + 歌名 + 平台徽标 + 歌手 · 专辑」信息排；
// 歌名 14.5 走 FONT_SIZE.title（.ms-t L450）、副行 11.5 走 captionLg（.ms-s L451）、
// 分隔线描边归色板 line（L447 border-bottom 1px solid var(--line)）。
export const MORE_SONG = {
  /** display:flex gap:11（L447） */
  gap: 11,
  /** padding-bottom:13 / margin-bottom:13（L447） */
  paddingB: 13,
  marginB: 13,
  /** .more-song .art 44×44 / radius 11（L448） */
  artSize: 44,
  artRadius: 11,
  /** .ms-s margin-top:3；行内 badge 与文字 gap:6（app.js L732 内联样式） */
  subMarginTop: 3,
  subGap: 6,
} as const

/* ================= 输入行（.op-box / .op-input / .op-go，styles.css L694-704，阶段 9d） ================= */

// 原型「打开歌单」贴链接输入行；音源浮层的「导入音源」同款复用。
// 输入底 rgba(255,255,255,.07) 归到色板 glass、描边归 line（同 .sc-box L711-712 口径）。
export const OP_BOX = {
  gap: 9,
  marginTop: 16,
  /** .op-input / .op-go 高 42 */
  height: 42,
  inputRadius: 13,
  inputPaddingX: 14,
  /** .op-input:focus 描边 1.5px rgba(255,92,138,.5)（同 SEARCH.focusRing*） */
  focusRingWidth: 1.5,
  focusRingAlpha: 0.5,
  goRadius: 13,
  goPaddingX: 18,
  /** .op-go:active scale(.955) */
  goPressScale: 0.955,
  /** .op-err：margin-top 10 / 11.5 / 行高 1.65 / #FF8B7E（= 色板 err） */
  errMarginTop: 10,
  errLineHeight: 19,
} as const

/* ================= 换行胶囊组（.q-chips / .hot-words，styles.css L691 / L735） ================= */

export const CHIP_FLOW = {
  /** 两条规则同为 flex-wrap gap:8px，合并一个度量 */
  gap: 8,
} as const

/* ================= 字体 ================= */

export const FONT_SIZE = {
  /** .sr-src 来源角标 */
  micro: 9.5,
  /** .q-tag / .b-tag */
  tiny: 10.5,
  /** .recent-card .rs / .pl-card .ps */
  caption: 11,
  /** .quick span / .sr-sub */
  captionLg: 11.5,
  /** .daily-card p */
  small: 12,
  /** .chip / .section-more */
  smallLg: 12.5,
  /** .searchbar .ph / .pl-card .pt */
  body: 13,
  /** .ghost-btn */
  bodyLg: 13.5,
  /** .song-row .rank */
  rank: 14,
  /** .sr-title / .sc-input */
  title: 14.5,
  /** .sb-time 状态栏时间 */
  status: 15,
  /** .more-song .ms-t */
  titleLg: 15.5,
  /** .section-sub 区段小标题 */
  headingSm: 16,
  /** .stat b 统计数字 */
  statValue: 17,
  /** .daily-card h3 */
  heading: 18,
  /** .section-title */
  headingLg: 19,
  /** .sheet-title 浮层大标题（styles.css L668） */
  sheetTitle: 20,
  /** .player-info h3 播放页曲名 */
  playerTitle: 21,
  /** .mh-name 昵称 */
  mineName: 20,
  /** .banner h3 / .page-title */
  display: 22,
  /** .page-title（歌单 / 排行 / 设定页大标题） */
  displayLg: 24,
  /** .mh-art b 头像首字 */
  mineInitial: 26,
} as const

export const FONT_WEIGHT = {
  medium: '500',
  semibold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
} as const

/** 字距（对应原型 letter-spacing） */
export const LETTER_SPACING = {
  tight: 0.2,
  normal: 0.3,
  wide: 0.4,
  wider: 0.5,
  kicker: 1,
  kickerWide: 1.6,
} as const

/* ================= 动效 ================= */

// --ease: cubic-bezier(.22,.61,.36,1)；时长提取自各 transition / animation
export const MOTION = {
  /** 交互反馈（.icon-btn:active 等） */
  fast: 200,
  /** 常规过渡（.chip 等） */
  base: 220,
  /** 页面 / 状态切换（.topbar pinned、浮层） */
  slow: 300,
  /** 开关轨道与旋钮（.toggle transition .28s） */
  toggle: 280,
  /** 呼吸灯周期（.pulse-dot） */
  pulse: 2200,
  /** 正在播放均衡条周期（.eq） */
  eq: 1000,
  /** 唱片自转一圈（.disc animation:spin 22s） */
  discSpin: 22000,
  /** 标准缓动曲线（Easing.bezier 参数） */
  easing: [0.22, 0.61, 0.36, 1],
  /** ScrollView.onScroll 事件节流（ms），分页触底检测用 */
  scrollThrottle: 16,
} as const

/* ================= 阴影 ================= */

// CSS box-shadow 含负 spread，RN 无法完全表达，取视觉近似；
// 原型主张以「表面色 + 1px 描边 + 模糊」分层，阴影仅少量场景使用
export const SHADOW: Record<
  'card' | 'float' | 'knob' | 'chrome' | 'glow' | 'playerMain' | 'miniPrimary',
  ShadowSpec
> = {
  /** --shadow 0 18px 44px -18px rgba(0,0,0,.75) */
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 36,
    elevation: 10,
  },
  /** .minibar 0 -2px 40px -10px rgba(0,0,0,.7) */
  float: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.35,
    shadowRadius: 32,
    elevation: 14,
  },
  /** .toggle i 旋钮 0 2px 6px rgba(0,0,0,.4)（blur 6 折算为 radius 3） */
  knob: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  /** .topbar.pinned 0 12px 26px -18px rgba(0,0,0,.9)（负 spread 无法表达，降 opacity 近似） */
  chrome: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 13,
    elevation: 6,
  },
  /** .tab.is-active::before 0 0 12px rgba(255,92,138,.8) 主色光晕 */
  glow: {
    shadowColor: '#FF5C8A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  /** .pc.main 0 14px 34px -12px rgba(255,92,138,.85)（负 spread 无法表达，降 opacity 近似） */
  playerMain: {
    shadowColor: '#FF5C8A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.5,
    shadowRadius: 22,
    elevation: 10,
  },
  /** .mini-act.primary 0 6px 16px -6px rgba(255,92,138,.8) */
  miniPrimary: {
    shadowColor: '#FF5C8A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 6,
  },
}

/* ================= 派生度量（需实际状态栏 / 安全区高度） ================= */

/**
 * 顶栏总高（原型 .topbar padding 54/16/10 + 行高 46）。
 * 原型 54 中已含 52px 模拟状态栏，真机改为「实测状态栏 + statusBarReserve 微调」。
 * 顶栏高度与滚动内容上留白共用此值（.viewport padding-top:110px 即顶栏高）。
 */
export const topbarHeight = (statusBarHeight: number): number =>
  statusBarHeight + TOP_BAR.statusBarReserve + TOP_BAR.rowHeight + TOP_BAR.paddingBottom

/**
 * 网格单卡宽度：(屏宽 - 两侧 .page 内边距 - 列间隙 × (列数 - 1)) / 列数。
 * RN 无 CSS 的 1fr，凡是用 CardGrid 摆卡片的场合都靠它算出封面边长（.pl-card .art 为 1:1）。
 */
export const gridItemWidth = (windowWidth: number, columns: number, columnGap: number): number =>
  (windowWidth - LAYOUT.screenPaddingX * 2 - columnGap * (columns - 1)) / columns

/**
 * 快捷入口单格宽度（.quick-row 的 repeat(4,1fr)：屏宽减两侧内边距与三个间隙后四等分）。
 */
export const quickItemWidth = (windowWidth: number): number =>
  (windowWidth - LAYOUT.screenPaddingX * 2 - QUICK_ROW.gap * (QUICK_ROW.columns - 1)) /
  QUICK_ROW.columns

/**
 * 轮播单卡宽度（.banner width:100%，相对 .page 内容盒）。
 * 横滑的 snapToInterval = 卡宽 + 轨道间隙，故一并给出步长。
 */
export const bannerItemWidth = (windowWidth: number): number =>
  windowWidth - LAYOUT.screenPaddingX * 2

/* ================= 品牌首字头像（.avatar-btn .avatar / .mh-art 共通化） ================= */

/**
 * 顶栏左上角（.avatar-btn 34px）与「我的」页头部（.mh-art 58px）两处头像是同一视觉家族：
 * 品牌粉→紫对角渐变圆底 + 居中文本首字（原型 app.js renderProfile 保证两处同一个字）。
 * 2026-10-12 真机走查反馈两处「样式不一致」：原型里首字色（.avatar #fff vs .mh-art #12060c）、
 * 描边与角度本就写了两份，落地后并排看尤其突兀。现收敛为共通组件 BrandAvatar，
 * 唯一差异是直径与字号（引用既有 token，不再各自硬写）；
 * 渐变统一取 GRADIENTS.art，字色统一取主题 onGradient（原型品牌渐变上白字的主惯例）。
 * 放在文件末尾：需引用 FONT_SIZE（定义在后段）。
 */
export const BRAND_AVATAR = {
  /** 1px 描边（两处统一；浅色主题自动反转为深字色描边） */
  ringWidth: 1,
  /** 两处预设：直径与字号引用既有 token */
  top: {
    size: TOP_BAR.avatarSize,
    textSize: TOP_BAR.avatarTextSize,
  },
  mine: {
    size: MINE.headArtSize,
    textSize: FONT_SIZE.mineInitial,
  },
} as const
