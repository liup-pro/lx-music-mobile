/**
 * 「我的」页文案常量（对应原型 #page-mine 的屏内文字）。
 * 统计数、预览行等随数据变化的字符串在页面里拼接，这里只放固定文案。
 */
import { NEW_UI_RECENT_CLEARED_TOAST } from './app'

/** 各区块 / 卡片标题（.fav-card h3 / .section-sub） */
export const NEW_UI_MINE_TITLES = {
  love: '我喜欢',
  recent: '最近播放',
  lists: '我的歌单',
} as const

/** 区块右侧动作（.section-more） */
export const NEW_UI_MINE_MORES = {
  recent: '清空记录',
  // 2026-10-13（bug-fix「我的」7a）：入口由「去歌单页」换成「新建歌单」。
  // 视觉口径不变——原型这一角本就是 .section-more 文字 + chevron（index.html L232），
  // 原型没有建单流程（其笔记 L526 自述「没有真实的建单流程」），只按 bug-fix 换动作与文案。
  lists: '新建歌单',
} as const

/**
 * 新建歌单浮层（CreateListSheet，2026-10-13 bug-fix「我的」7a）。
 * 原型没有这一层（MY_PLAYLISTS 是 mock）；校验规则逐条抄旧屏
 * ListNameEdit.handleRename（src/screens/Home/Views/Mylist/MyList/ListNameEdit.tsx L95-111）：
 * 空名不创建（旧屏静默 return，这里按新 UI 浮层惯例给一句 .op-err 人话报错，语义同）、
 * 超 100 字截断（L98）、同名先问「继续吗」（L102-105，zh-cn list_duplicate_tip 的说人话版）、
 * 都过才落 createUserList（经 core/list 的 createList）。
 */
export const NEW_UI_SHEET_CREATE_LIST = {
  /** .sheet-title */
  title: '新建歌单',
  /** .sheet-sub */
  sub: '起个名字就能建，建好就出现在「我的歌单」这一排里。',
  /** .op-input placeholder（旧屏 list_create_input_placeholder「你想起啥名...」同款口吻） */
  placeholder: '你想起啥名...',
  /** .op-go */
  go: '创建',
  /** 落库进行中的按钮态（原型无此态，真实异步补，同 OpInputRow busy 口径） */
  busy: '创建中',
  /** 空名报错（.op-err） */
  errEmpty: '歌单得有个名字 · 一个汉字也行',
  /** 同名确认浮层标题（原型 app.js L1243 askConfirm title「同名歌单」，QA D-09 载体换回 Sheet 家族） */
  dupTitle: '同名歌单',
  /** 同名确认浮层正文（旧屏 list_duplicate_tip 的说人话版，措辞沿用第 9 轮 D-08 定稿） */
  dupConfirm: '已经有一份同名歌单了，还要继续建吗？',
  /** 同名确认浮层右键（原型 app.js L1243 okLabel「继续建」） */
  dupOk: '继续建',
  /** .sc-hint 底部灰字 */
  hint: '新歌单只存在这台设备上，点进去就能往里头加歌。',
  /** 建好 toast */
  created: (name: string): string => `歌单「${name}」建好了`,
} as const

/** 歌单名长度上限：旧屏 ListNameEdit L98 对超 100 字的名字截断 */
export const NEW_UI_CREATE_LIST_NAME_MAX = 100

/** 统计三格标签（原型 renderMinePage 的 .stat span：喜欢 / 歌单 / 最近播放） */
export const NEW_UI_MINE_STAT_LABELS = {
  love: '喜欢',
  lists: '歌单',
  recent: '最近播放',
} as const

/** 「改昵称」胶囊（.mh-edit） */
export const NEW_UI_MINE_EDIT = '改昵称'

/** 空态文案（原型 .empty-tip / .fav-card p 原句优先照抄） */
export const NEW_UI_MINE_EMPTY = {
  recent: '暂无播放记录',
  love: '还没有收藏，点歌右边的爱心',
} as const

/**
 * 头像副行（.mh-sub）。原型是 mock 的「听众 ID 8842 0613」，
 * 本项目没有用户 ID 概念（数据全在本机），换成一句如实说明。
 */
export const NEW_UI_MINE_HEAD_SUB = '没有账号 · 收听都记在这台设备上'

/** 页尾说明（原型 .foot-note 原句） */
export const NEW_UI_MINE_FOOT_NOTE = '收藏 · 播放记录 · 自建歌单都只存在这台设备上'

/** 还没接上的动作用一句话提示（说人话，别漏开发术语） */
export const NEW_UI_MINE_TOAST = {
  // 「改昵称」的浮层已在阶段 9e 落地（NameSheet），原过渡 toast 删除
  /** 原型 fav-card 点击无可播收藏时的原句 */
  loveUnplayable: '收藏里的歌当前音源都放不出来',
  /** 原型 #recentClear 点击后的原句 */
  // 与首页「继续收听」清空共用全局共通键（原型两处入口共用一条实现，app.js L283-289）
  recentCleared: NEW_UI_RECENT_CLEARED_TOAST,
  // 纯自建歌单已换活（2026-10-12，详情层 kind='local' 形态，见 pushNewUiLocalListDetail），原「随后就来」占位文案删除
} as const

/** 「我喜欢」预览行拼接前几首歌名（原型 liked.slice(0, 3)） */
export const NEW_UI_MINE_LOVE_PREVIEW_COUNT = 3
