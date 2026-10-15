/**
 * 「打开歌单」浮层（原型 #plIdSheet，index.html L390-405；逻辑 pidOf / plIdError /
 * renderPlIdSamples / openPlIdSheet / tryOpenByPid，app.js L487-531）的界面文案。
 * 每条标注原型行号；原型没有、真实侧语义必须补的条目单独注明。
 */

export const NEW_UI_SHEET_PL_ID = {
  /** .sheet-title（index.html L394） */
  title: '打开歌单',
  /** .sheet-sub（index.html L395，原句照抄） */
  sub: '把平台上分享出来的歌单链接贴进来，或者只填那串歌单 ID。',
  /** .op-input placeholder（index.html L397） */
  placeholder: '歌单链接 / ID',
  /** .op-go（index.html L398） */
  go: '打开',

  /**
   * 裸 ID 先选平台组（原型没有这一组：原型 mock 拿 pid 全表遍历就无所谓平台，
   * 真实侧 getListDetail(id, source, page) 必须有 source 坐标，且新 UI 没有
   * 全局「当前平台」状态可猜（搜索页自带来源 tab）——如实显式让用户选）。
   */
  groupPlatform: '只填 ID 的话，先点这份歌单来自哪个平台',

  /** .group-label「可以试试这几个」（index.html L401，原句照抄） */
  groupSamples: '可以试试这几个',

  /** .sc-hint（index.html L403，原句照抄：真实侧同样成立） */
  hint: '歌单里有哪个平台的歌，取决于那份歌单本身 · 能不能播，按下播放那一刻才知道。',

  /**
   * 报错文案（.op-err，index.html L400 / plIdError，app.js L494-498）。
   * 空输入句与链接没找到 ID 句照抄原型 L520 / L522；其余为真实侧新增分支
   * （原型 mock 里 pid 全表遍历没有「平台」「域名」概念，报错分支照抄会骗人）。
   */
  err: {
    /** 原型 L520 原句 */
    empty: '先贴一条分享链接，或者填一串歌单 ID',
    /** 真实新增：裸 ID 没选平台（禁止默认猜一个平台，任务口径） */
    needPlatform: '先选一下这份歌单来自哪个平台 · 光看一串号猜不出',
    /** 真实新增：输入里认不出五个平台域名的链接（域名映射表见 utils/plId.ts）。
     * 「域名认得出但链接里没有 ID」这一支不在这里报错：ID 抽取交对应 SDK，
     * 取不到由详情屏空态如实承担。 */
    unknownDomain: '这条链接不是酷我 / 酷狗 / QQ音乐 / 网易云 / 咪咕的 · 目前只认这五家',
    /** 真实新增：裸 ID 形态不对（含空格 / 太短 / 带符号） */
    badId: '这串号看着不对 · 一般是数字或字母数字组合，中间别带空格',
  },

  /**
   * 打开成功 toast（原型 L529-530）。原型句「已打开…N/M 首现在能播」依赖 mock
   * 曲目表逐首比 supports()，真实侧此刻还没有取任何曲目，数量与可播数都拿不到，
   * **不伪造计数**——换成不含数量的如实文案；曲目本身要等详情屏分页取回，
   * 取不到由详情屏 NEW_UI_PLD_EMPTY.error 空态承担。
   */
  opened: (short: string): string =>
    `已去${short}打开这份歌单 · 里面的歌要现从平台取`,
} as const
