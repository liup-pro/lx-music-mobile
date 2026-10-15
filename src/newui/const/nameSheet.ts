/**
 * 改昵称浮层（原型 #nameSheet，index.html L459-472；逻辑 nickInitial / renderProfile /
 * openNameSheet / saveNick，app.js L1164-1204）的界面文案。每条标注原型行号。
 */

/**
 * 「换个快的」chips（原型 NICK_PICKS，app.js L1165）。
 * 纯 UI 文案而非内容数据，按「不造假数据」规则可保留；
 * 首枚取原型 BRAND 变量（data.js L8 `const BRAND = 'EchoIsle'`），与我们 const/app.ts
 * 的 NEW_UI_APP_NAME 同名同值，无需再改写。
 */
export const NEW_UI_NICK_PICKS = ['EchoIsle', '深夜电台', '阿野', 'Loop', '听什么都能'] as const

export const NEW_UI_SHEET_NAME = {
  /** .sheet-title（index.html L463） */
  title: '修改昵称',
  /** .sheet-sub（index.html L464） */
  sub: '头像用昵称的第一个字，顶左上角的那颗圆也一起换。',
  /** .op-input placeholder（index.html L466） */
  placeholder: '想叫什么',
  /** .op-go（index.html L467） */
  go: '保存',
  /** 空昵称报错（原型 saveNick 内 app.js L1192 逐字，QA D59） */
  errEmpty: '请先填写名称 · 单个汉字也可以',
  /** .group-label（index.html L470） */
  groupPicks: '换个快的',
  /**
   * 底部说明（原型 index.html L472 .sc-hint 逐字，QA D61）。
   * 那句「更换设备后回到「EchoIsle」」在真实侧同样成立：昵称只落本机 AsyncStorage，
   * 换设备读不到时回落缺省字（const/app.ts NEW_UI_DEFAULT_AVATAR_TEXT）。
   */
  hint: '昵称只保存在这台设备的存储里，不上传任何服务器 · 更换设备后回到「EchoIsle」。',
  /** 保存成功 toast（原型 app.js L1203 逐字，QA D60） */
  saved: (name: string, initial: string): string =>
    `昵称已更新为「${name}」· 头像取首字「${initial}」`,
} as const
