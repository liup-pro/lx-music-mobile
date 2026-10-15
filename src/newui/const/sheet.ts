/**
 * 播放页子浮层（原型 #playerSheet 里的定时 / 评论两块）的界面文案与控件定义。
 * SLEEP_OPTIONS 提取自 new_design/data.js —— 属「控件档位定义」（如同音质档位表 const/quality），
 * 不是内容数据；评论与倒计时的真实数据都来自既有模块。
 * 2026-10-13（bug-fix 清单第 4 条）：均衡器块已随假能力整体移除（播放内核无频段增益通道）。
 */

/* ============ 定时停止（renderTimerSheet，app.js L1169-1187） ============ */

/** 定时档位（分钟，0 = 不开启），原型 SLEEP_OPTIONS */
export const SLEEP_OPTIONS = [0, 10, 20, 30, 45, 60, 90] as const

export const NEW_UI_SHEET_TIMER = {
  title: '定时停止播放',
  /** 未开启时的副标题（原型 sleepOff 句「到点只暂停播放…」按本项目既有 core/player/timeoutExit
   *  的真实行为改写：「只暂停」→「停下」，实际到点行为由「等播完」开关决定） */
  sub: '到点只会停下播放，不清空进度，随时能接着听。',
  /** 开启态副标题：逐秒回写剩余时间（原型 sleepSub，app.js L1765-1767：`还剩 ${fmt(sleepLeft)}。…`），
   *  2026-10-13 轮 11 同步——倒计时不再挂在按钮上，可见去处就是这一行 */
  subOn: (mmss: string): string => `还剩 ${mmss}。到点只会停下播放，不清空进度。`,
  playedLabel: '等当前这首放完再停',
  note: '想听完当前这首再停，可以把循环模式切到「单曲循环」。',
  optionLabel: (minute: number): string => (minute === 0 ? '不开启' : `${minute} 分钟`),
  toastOn: (minute: number): string => `将在 ${minute} 分钟后停止播放`,
  toastOff: '已取消定时停止',
} as const

/* ============ 评论（renderCommentSheet，app.js L1239-1263） ============ */

export const NEW_UI_SHEET_COMMENT = {
  title: '评论',
  sub: '评论和热度来自各个平台，跟这首歌能不能播没有关系。',
  sortTag: '热度排序',
  loading: '评论在取了，稍等…',
  error: '评论没取到，过会儿再试试',
  empty: '这首歌暂时没有热门评论',
  /** 分页状态行（bug-fix 清单「评论浮窗」第 1 条）：上滑触底取下一页时如实标注 */
  moreLoading: '更多评论在翻了，稍等…',
  moreEnd: '热门评论就这些了，到底了',
  moreError: '后面的评论没翻到，点这里再试一次',
  noSong: '现在没有要播的歌，没什么评论可看',
  localSong: '本地歌曲没有平台评论可看',
  /** 第 2 级及更深的回复加「回复 @某人」浅色前缀（bug-fix「评论浮窗」第 2 条），作层级线索；
   *  第 1 级回复沿用原型 .cmt-reply 的「@名字：内容」写法（app.js L1253），前缀由 CommentNode 内联拼装 */
  replyToText: (parentName: string): string => `回复 @${parentName} `,
} as const
