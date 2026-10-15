/**
 * 改昵称浮层（原型 #nameSheet，index.html L407-423；逻辑 openNameSheet / saveNick / nickInitial，
 * app.js L534-574）的界面文案。每条标注原型行号。
 */

/**
 * 「换个快的」chips（原型 NICK_PICKS，app.js L535）。
 * 纯 UI 文案而非内容数据，按「不造假数据」规则可保留；
 * 品牌字「野花」一律换成「EchoIsle」（const/app.ts NEW_UI_APP_NAME，2026-10 定名）。
 */
export const NEW_UI_NICK_PICKS = ['EchoIsle', '深夜电台', '阿野', 'Loop', '听什么都能'] as const

export const NEW_UI_SHEET_NAME = {
  /** .sheet-title（index.html L412） */
  title: '修改昵称',
  /** .sheet-sub（index.html L413） */
  sub: '头像用昵称的第一个字，顶左上角的那颗圆也一起换。',
  /** .op-input placeholder（index.html L415） */
  placeholder: '想叫什么',
  /** .op-go（index.html L416） */
  go: '保存',
  /** 空昵称报错（app.js L562） */
  errEmpty: '总得先有个名字 · 一个汉字也行',
  /** .group-label（index.html L419） */
  groupPicks: '换个快的',
  /**
   * 底部说明（原型 .sc-hint，index.html L421）。
   * 原型原句「刷新页面就回到野花，原型不存服务器也不存本地」是演示稿免责声明，
   * 真实侧昵称持久化在本机 AsyncStorage（useNickName），换成如实说法。
   */
  hint: '昵称只存在这台设备的存储里，不上传任何服务器 · 换台设备就回到「EchoIsle」。',
  /** 保存成功 toast（app.js L573） */
  saved: (name: string, initial: string): string =>
    `昵称已改成「${name}」· 头像换成第一个字「${initial}」`,
} as const
