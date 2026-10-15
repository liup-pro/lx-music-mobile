/**
 * 单曲操作面板（原型 #moreSheet，index.html L477-484；逻辑 openMore / actRow，
 * app.js L1474-1523）的界面文案。每条标注原型行号。
 */

export const NEW_UI_SHEET_MORE = {
  /** 收藏行文案（app.js L1495：未收藏「收藏到「我喜欢」」/ 已收藏「取消收藏」） */
  fav: '收藏到「我喜欢」',
  unfav: '取消收藏',
  /** 下一曲播放行（app.js L1505；仅在线曲目，真实 handlePlayLater 只吃 MusicInfoOnline） */
  playLater: '下一曲播放',
  /** 加入自建歌单行（app.js L1512，逐歌单一行） */
  addToList: (name: string): string => `加入「${name}」`,
  /* ---- toast（原型原句优先；带「本地共 N 首 / 共 N 首」计数的两句如实去数，
     真实侧计数在异步写库后才更新，按下瞬间报出的数不可信，宁缺毋假） ---- */
  /** 收藏成功 / 取消收藏（原型 app.js L1501 同一行的两个分支） */
  favAdded: '已收藏到「我喜欢」',
  /** 取消收藏（原型 app.js L1501） */
  favRemoved: '已取消收藏',
  /** 下一曲播放成功（原型 app.js L1510 逐字，QA D62） */
  playLaterAdded: (title: string): string => `已把「${title}」排在当前这首之后`,
  /** 已在歌单里（原型 app.js L1513 逐字，QA D83；语义同旧 MusicAddModal/ListItem.tsx L19-22 去重 toast） */
  alreadyInList: '已经在这份歌单里了',
  /** 加入成功（原型 app.js L1518） */
  listAdded: (name: string): string => `已加入「${name}」`,
  /** 写库失败（真实 addListMusics 会 reject，原型本地数组无此态，补一句如实兜底） */
  listAddFailed: '没加进去，稍后再试一次',
} as const
