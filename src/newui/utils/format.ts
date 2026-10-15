/**
 * 原型 fmt(sec)：秒 → m:ss。
 * 与原型一致，不换算小时（超 60 分钟的曲目会显示如 61:20）。
 */
export const formatDuration = (sec: number): string =>
  `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`

/** 两位补零 */
const pad2 = (n: number): string => String(n).padStart(2, '0')

/**
 * 今天的「日期键」与「展示文本」：
 * 每日推荐按日期做稳定推算（同一天刷新还是那批歌），卡片右上角只显示月/日。
 */
export const getToday = (): { key: string; label: string } => {
  const now = new Date()
  const month = pad2(now.getMonth() + 1)
  const date = pad2(now.getDate())
  return { key: `${now.getFullYear()}-${month}-${date}`, label: `${month}/${date}` }
}

/**
 * 计数展示（原型「4.2万」风格）：1 万以上一位小数带「万」，否则原样数字。
 * 评论点赞数等场景共用。
 */
export const formatCount = (count: number): string =>
  count >= 10000 ? `${(count / 10000).toFixed(1)}万` : String(count)
