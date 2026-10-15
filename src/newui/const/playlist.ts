/**
 * 歌单页文案常量（对应原型 #page-playlist 的屏内文字）。
 * 「全部 / N 个」等跟着数据变的字符串在页面里拼接，这里只放固定文案。
 */

/** 各区块标题（.section-sub / #plPoolTitle 缺省态） */
export const NEW_UI_PLAYLIST_TITLES = {
  page: '歌单',
  mine: '我的歌单',
  pool: '推荐歌单',
  /** chip 行末尾入口胶囊（新浮层 PlTagsSheet 的入口） */
  allTags: '全部分类',
} as const

/**
 * 「全部分类」浮层文案（原型没有这一层：示意数据只有 11 个硬编码 chip，真实侧全量目录按平台分组展示）。
 * 2026-07-30 审计轮：D84 补 .sheet-sub 尾「。」（index.html L454）、D19/D20 按 app.js L772/L785
 * 实际渲染句逐字（D20 注：原型 index.html L616 说明段写「没找到」、app.js 渲染「取不到」，以渲染句为准）。
 */
export const NEW_UI_PLAYLIST_TAG_SHEET = {
  sub: '当前平台的全部分类 · 选一个，下面的推荐歌单就换成这一类。',
  /** 浮层顶部第一枚：回到不筛选状态 */
  all: '全部',
  loading: '正在从平台获取分类…',
  empty: '这个平台暂时取不到分类 · 稍后再试',
} as const

/** 「我的歌单」右侧动作（原型 #plManage） */
export const NEW_UI_PLAYLIST_MANAGE = '管理'

/** 空态 / 加载态文案（原型 .empty-tip 原句优先照抄） */
export const NEW_UI_PLAYLIST_EMPTY = {
  /** 原型 #plPoolEmpty 原句（index.html L191） */
  pool: '这个分类下暂时没有推荐 · 换一个分类试试',
  /**
   * 「我的歌单」空态。原型两处同一句原话（index.html L182 #myPlEmpty / L247 #minePlEmpty）：
   * 「还没有自建歌单 · 听到喜欢的先收藏进来」——歌单页与我的页共用这一份措辞。
   */
  mine: '还没有自建歌单 · 听到喜欢的先收藏进来',
  loading: '正在从平台取歌单 · 稍等',
  /** 首批（第一页）没取到时的整页空态；追加批失败不走这里，走网格末尾 PagingStatus 重试行 */
  poolFailed: '这一类歌单暂时没取到 · 换个分类或稍后再试',
} as const

/**
 * 网格末尾分页状态行文案（原型 PLD_STATUS，app.js L682，与排行榜页 NEW_UI_RANK_STATUS 同一语义
 * 同一组件 PagingStatus）：追加批「正在取 / 上一批真实失败」才出现，只在列表尾巴如实报进度。
 */
export const NEW_UI_PLAYLIST_STATUS = {
  loading: '正在载入下一批…',
  retry: '这一批没有载入 · 点击重试',
} as const

/**
 * 池子标题右侧计数文案（原型 paintPlPool L757：「计数在没取完时说清『已列出多少 / 平台一共给了多少』」）。
 * total 传 null = 平台没给出可信总数（SDK 占位值已在 hook 剔除 / 取完前未知），如实降级只报已列出条数，
 * 不摆假 M；取完后 hook 把 total 换成实收条数，自然落「N 个」全量态。
 */
export const plPoolCountLabel = (shown: number, total: number | null): string =>
  total == null
    ? `已列出 ${shown} 个`
    : shown < total
      ? `已列出 ${shown} / ${total} 个`
      : `${total} 个`

/**
 * SDK 写死的占位总数（不是平台的真实总数，读码核实）：
 * mg 每页硬塞 99999（utils/musicSdk/mg/songList.js L225）、kw 分类分支一次整批取回塞 1000
 * （utils/musicSdk/kw/songList.js L117-119）。命中即按「平台没给总数」处理——计数降级只报已列出，
 * 「取完」判定也不依赖它（靠空页/零新增兜底）。副作用：别的平台目录恰好 1000 份时也只报已列出，
 * 宁可少报一个 M，不摆一个假 M。
 */
export const NEW_UI_POOL_PLACEHOLDER_TOTALS: ReadonlySet<number> = new Set([99999, 1000])

/** 封面种子前缀（Art 的 seed 命名空间，与首页同款做法） */
export const NEW_UI_PLAYLIST_ART_SEED = {
  mine: 'mypl',
  pool: 'playlist',
} as const

/** 页尾说明（原型 .foot-note 原句） */
export const NEW_UI_PLAYLIST_FOOT_NOTE = '歌单目录来自平台曲库 · 每首歌要到播放时才取回可用地址'
