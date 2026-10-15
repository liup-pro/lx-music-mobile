/**
 * 设定页全部文案（2026-10-13 起本轮落地「外观 / 数据与缓存 / 关于」三组）。
 * 屏内只出现人话：不露存储机制、模块名、函数名等技术词。
 * 今后加新组/新行先在这里补键，页面只做接线。
 */
export const NEW_UI_SETTING_LABELS = {
  /** .page-head 大标题 */
  pageTitle: '设定',
  /** .sh-sub 页头说明（原型 setSub 口径：只改本机、不动曲库、不上传） */
  heroSub: '这些开关只改这台设备上的使用方式，不动曲库，也不上传。',

  /* —— 外观（原型纯深色没有这一组，沿用同一家族的组/行视觉） —— */
  groupAppearance: '外观',
  appearanceLight: '明亮',
  appearanceLightHint: '浅底深字，亮处看着舒服',
  appearanceDark: '黑暗',
  appearanceDarkHint: '深底亮字，夜里更护眼',
  appearanceSystem: '跟随系统',
  appearanceSystemHint: '手机切深浅色时，这边自动跟上',
  /** 选中档的右侧回显（.st-r.hi 主色） */
  appearanceActive: '在用',

  /* —— 数据与缓存（真实范围：播放产生的音频缓存与歌曲地址记录；收藏/歌单/播放记录都不在其中） —— */
  groupData: '数据与缓存',
  clearCache: '清除缓存',
  clearCacheHint: '清掉听歌攒下的缓存，收藏、歌单和播放记录不受影响',
  /** 首次统计中 / 统计失败 / 清除进行中的右侧值 */
  cacheCounting: '正在统计…',
  cacheFailed: '暂时统计不出来',
  cacheClearing: '正在清除…',
  /**
   * 「清除缓存」二次确认浮层（QA 2026-10-14 第 13 轮：系统 confirmDialog 换回共通件 ConfirmSheet）。
   * 正文逐字照原型 askClearCache 的 body（app.js L1385）；标题不另造——原型 askConfirm 没给
   * title 时走默认句（NEW_UI_SHEET_CONFIRM.defaultTitle「要执行这一步吗」），此处同规格留空。
   */
  clearConfirm: '将清除这台设备上的播放缓存 · 之后收听会重新产生，不影响收藏、歌单与播放记录。',
  /** #cfOk 位文案（原型 okLabel L1386） */
  clearConfirmButton: '清除',
  /** 清除成功的 toast（原型 onOk L1392 原句，第 13 轮起经 newui 自绘提示胶囊展示） */
  clearDoneToast: '缓存已清除 · 收藏、歌单与播放记录保持不变',
  clearFailToast: '这阵子没清动，稍后再试试',
  /**
   * 「清空播放记录」行（QA 2026-10-14 D-13，原型 app.js L1329-1332 「数据与缓存」组第二行）。
   * 点击语义如实照抄原型 clearRecent：直接清空 + toast，无二次确认
   * （详情页 QA 已核实原型 askConfirm 只用于删单/同名建单/清缓存三处，不含本行）。
   * toast 与首页/「我的」页两处入口共用全局共通键 NEW_UI_RECENT_CLEARED_TOAST（const/app.ts）。
   */
  clearRecent: '清空播放记录',
  /** .st-l em：原型 `${N} 条在本机的收听历史` */
  clearRecentHint: (count: number): string => `${count} 条在本机的收听历史`,
  /** .st-r：有记录显条数，清完显「已清空」（原型三元式的两分支） */
  clearRecentCount: (count: number): string => `${count} 条`,
  clearRecentEmpty: '已清空',

  /* —— 关于（原型 app.js L1335-1339 只有一行 setInfo：品牌名 + 出处副行 + 右侧版本号；
        出处写在明面上——取数、音源与播放内核全部来自 lx-music-mobile，版本号沿用其 package.json） —— */
  groupAbout: '关于',
  /** 副名 SoundIsle：全 App 只在品牌名旁露出这一处，别处不堆 */
  aboutBrandSub: 'SoundIsle',
  /** .st-l em 副行：原型原句，如实标注上游出处 */
  aboutOrigin: '内核由 lx-music-mobile 原作者与社区维护',
} as const
