/**
 * 野花音源能力元数据 —— 直接来自脚本解码结果（非臆造）
 * 脚本仅注册 musicUrl 事件：getId 分支 = tx|wy|kw|kg|mg，init 返回 s = "xx|128k&..."
 */

/* 品牌：App 名 EchoIsle；副名 SoundIsle 全 App 只在「关于」旁露这一处。
 * 版本号与安装包（package.json）一致，界面上不另编一个 0.1.0 */
const BRAND = 'EchoIsle';
const BRAND_SUB = 'SoundIsle';
const APP_VERSION = '1.9.1';

const SOURCES = {
  tx: { label: 'QQ音乐', short: 'QQ', tint: '#31C27C', idKey: 'songmid', idExample: '004ZQKPh21108D' },
  wy: { label: '网易云', short: '网易', tint: '#E4413F', idKey: 'songmid', idExample: '186016' },
  kw: { label: '酷我音乐', short: '酷我', tint: '#12B7F5', idKey: 'songmid', idExample: '256712245' },
  kg: { label: '酷狗音乐', short: '酷狗', tint: '#3FBCB4', idKey: 'hash', idExample: 'A1B2C3D4E5F6A7B8' },
  mg: { label: '咪咕音乐', short: '咪咕', tint: '#FF6FA5', idKey: 'songmid + "d"', idExample: 'C001D6M2S0S6G9d' },
};

/* 播放音质四档可选表（高→低），与 src/newui/const/sourceSheet.ts 的 PLAY_QUALITY_CHOICES 同口径。
 * label 沿用 src/newui/const/quality.ts 的 QUALITY_LABEL：128k 标准 / 320k HQ / flac SQ / flac24bit 24bit。
 * 核心类型里还有 192k/ape/wav，但播放音质选择器不暴露，原型也就不摆 */
const QUALITY = {
  '128k': { label: '标准' },
  '320k': { label: 'HQ' },
  flac: { label: 'SQ' },
  flac24bit: { label: '24bit' },
};
const PLAY_QUALITY_CHOICES = ['flac24bit', 'flac', '320k', '128k'];
/* 所选档音源没有时，核心沿这条链往下探（core/music/utils.ts 的 TRY_QUALITYS_LIST），探不到落 128k */
const TRY_QUALITYS = ['flac24bit', 'flac', '320k'];

/* 已安装音源（LX Music 允许多脚本并存、单选生效，真实侧最多同时留 20 份）。野花为解码得到的真实能力，其余为原型占位。
 * 这一份名单是「导入到这台设备上的先后顺序」，状态故意打乱：面板会把它重排成「已就绪的在顶部」，
 * 名单一长又能看出第二件事 —— 多余的整块折起来。所以这里既要够长（越过折叠阈值），也得留着不 ready 的那几份 */
const SCRIPTS = [
  { key: 'yehua', name: '野花', version: '1.0.0', platforms: ['tx', 'wy', 'kw', 'kg', 'mg'], qualities: ['128k'], state: 'ready' },
  { key: 'selfbuild', name: '自建脚本', version: '0.9.0', platforms: ['wy'], qualities: ['128k'], state: 'uninit' },
  { key: 'luoge', name: '落歌', version: '2.3.1', platforms: ['tx', 'wy', 'kw'], qualities: ['128k', '320k', 'flac'], state: 'ready' },
  { key: 'oldpack', name: '旧合集脚本', version: '0.7.2', platforms: ['tx', 'kw'], qualities: ['128k'], state: 'failed' },
  { key: 'full', name: '全家桶脚本', version: '1.4.0', platforms: ['tx', 'wy', 'kw', 'kg'], qualities: ['128k', '320k', 'flac', 'flac24bit'], state: 'ready' },
  { key: 'quick', name: '轻快脚本', version: '1.1.0', platforms: ['wy', 'mg'], qualities: ['128k'], state: 'initing' },
  { key: 'beta', name: '测试脚本', version: '0.3.0-beta', platforms: ['tx'], qualities: ['128k', '320k'], state: 'uninit' },
];

/* .or-state 四档：生效中的读真实加载状态，没生效的中性显示「未启用」。
 * rank 是列表排序用的「离能用还有多远」：就绪 → 初始化中 → 没就绪 → 未启用（同档保持导入先后） */
const SCRIPT_STATE = {
  ready: { label: '已就绪', tone: 'var(--ok)', rank: 0 },
  initing: { label: '初始化中', tone: 'var(--brand-3)', rank: 1 },
  failed: { label: '没就绪', tone: '#FF8B7E', rank: 2 },
  uninit: { label: '未启用', tone: 'var(--text-3)', rank: 3 },
};

const PALETTES = [
  ['#FF5C8A', '#7A3BFF', '#FFD36E'],
  ['#22D3EE', '#2563EB', '#A5F3FC'],
  ['#FBBF24', '#EF4444', '#FDE68A'],
  ['#34D399', '#0EA5E9', '#D1FAE5'],
  ['#F472B6', '#8B5CF6', '#FBCFE8'],
  ['#60A5FA', '#1E1B4B', '#C7D2FE'],
  ['#FB923C', '#DB2777', '#FED7AA'],
  ['#2DD4BF', '#4338CA', '#99F6E4'],
];

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function palette(seed) {
  return PALETTES[hash(seed) % PALETTES.length];
}

/* 内容目录：音源不提供 search / playlist / rank，这部分是宿主侧数据（原型中为 mock） */
const SONGS = [
  { id: 's01', title: '晴天', artist: '周杰伦', album: '叶惠美', source: 'wy', ext: '186016', dur: 269, plays: '3842.6万' },
  { id: 's02', title: '七里香', artist: '周杰伦', album: '七里香', source: 'tx', ext: '004ZQKPh21108D', dur: 299, plays: '2710.1万' },
  { id: 's03', title: '浮年未晚', artist: '陈亦迅', album: 'The Key', source: 'kg', ext: 'A1B2C3D4E5F6A7B8', dur: 254, plays: '1290.4万' },
  { id: 's04', title: '山丘', artist: '李宗盛', album: '山丘', source: 'kw', ext: '256712245', dur: 320, plays: '876.2万' },
  { id: 's05', title: '错位时空', artist: '任然', album: '云与海', source: 'mg', ext: 'C001D6M2S0S6G9', dur: 244, plays: '4408.9万' },
  { id: 's06', title: '孤勇者', artist: '陈奕迅', album: '孤勇者', source: 'tx', ext: '003MPQsa1pBVwE', dur: 262, plays: '6120.3万' },
  { id: 's07', title: '起风了', artist: '买辣椒也用券', album: '起风了', source: 'wy', ext: '1330348068', dur: 325, plays: '2980.7万' },
  { id: 's08', title: '漠河舞厅', artist: '柳爽', album: '去，2020', source: 'kw', ext: '301562288', dur: 302, plays: '1875.5万' },
  { id: 's09', title: '半生雪', artist: '是七叔呢', album: '半生雪', source: 'kg', ext: 'B7C2E9A4F1D6E3A9', dur: 216, plays: '3312.8万' },
  { id: 's10', title: '万疆', artist: '李玉刚', album: '万疆', source: 'mg', ext: '6031816C1D100C2C', dur: 232, plays: '5040.1万' },
  { id: 's11', title: '夜曲', artist: '周杰伦', album: '十一月的萧邦', source: 'wy', ext: '194035', dur: 226, plays: '2140.6万' },
  { id: 's12', title: '演员', artist: '薛之谦', album: '绅士', source: 'tx', ext: '002Na8nx1L0ZRH', dur: 261, plays: '3560.2万' },
  { id: 's13', title: '光年之外', artist: '邓紫棋', album: '新的心跳', source: 'kw', ext: '192837465', dur: 235, plays: '4120.9万' },
  { id: 's14', title: '错位钢琴', artist: 'RANY.', album: 'Instrumental', source: 'kg', ext: 'C4D5E6F7A8B9C0D1', dur: 189, plays: '902.4万', lrc: false },
  { id: 's15', title: '踏山河', artist: '是七叔呢', album: '踏山河', source: 'mg', ext: '6037E2B7F2B80F5A', dur: 205, plays: '2760.3万' },
  { id: 's16', title: '错位恋人', artist: 'Uu', album: '那女孩对我说', source: 'wy', ext: '1957342186', dur: 248, plays: '1620.7万' },
];

const songById = (id) => SONGS.find((s) => s.id === id);

/* 首页轮播不再放写死的营销条目：内容由 app.js 的 bannerItems() 按当前音源 / 在播曲目算出来 */

const QUICK = [
  { key: 'daily', label: '每日推荐', seed: 'q-daily', icon: 'i-play' },
  { key: 'chart', label: '排行榜', seed: 'q-chart', icon: 'i-chart' },
  { key: 'radio', label: '电台', seed: 'q-radio', icon: 'i-wave' },
  { key: 'liked', label: '我喜欢', seed: 'q-liked', icon: 'i-heart' },
];

/* 首页「热门单曲」的榜单 tab 不再单列一份假表：RN 侧就是拿当前内容平台的真实榜单目录
 * 取前 4 个（useHomeRanks(tabLimit=4)），标签 = 榜名本身。见 app.js 的 homeBoards() */

/* ============ 排行榜目录 ============
 * 榜型判定：名字含「飙/升」→ 上升箭头，含「原创」→ 麦克风，含「新」→ 音符，
 * 「电音/电子」→ 方波，「古典/经典/老歌/怀旧」→ 留声机，其余（热/DJ/影视…）→ 黑胶。
 * 判定只看榜名，不看平台。RN 侧（const/rank.ts）目前仍是热/新/飙三类，落地六符号时同步 */
const rankBoardKind = (name) => {
  if (/飙|升/.test(name)) return 'rise';
  if (/原创/.test(name)) return 'original';
  if (name.includes('新')) return 'new';
  if (/电音|电子/.test(name)) return 'electronic';
  if (/古典|经典|老歌|怀旧/.test(name)) return 'classic';
  return 'hot';
};
/* 原型给出的三类主打榜（热歌 / 新歌 / 飙升）：每平台截断时排前 */
const isRankBoardFeatured = (name) => /热|新|飙|升/.test(name);

/* 各平台的榜单目录（榜名照这些平台真实存在的榜写，属示意 mock）。
 * 真实目录有三十几个，这里每平台列 9 个，够把「主打榜排前 + 每平台截 6」这条规则跑出来 */
const BOARDS = {
  tx: ['热歌榜', '新歌榜', '飙升榜', '原创榜', '短视频榜', '内地榜', '港台榜', '欧美榜', '日韩榜'],
  wy: ['热歌榜', '新歌榜', '飙升榜', '原创榜', '说唱榜', '电音榜', '民谣榜', '古典榜', '欧美榜'],
  kw: ['热歌榜', '新歌榜', '飙升榜', '原创榜', 'K歌榜', '短视频榜', '华语榜', '铃声榜', '欧美榜'],
  kg: ['热歌榜', '新歌榜', '飙升榜', '原创榜', 'DJ榜', '短视频榜', '影视榜', '古风榜', '车载榜'],
  mg: ['热歌榜', '新歌榜', '飙升榜', '内地榜', '港台榜', '国风榜', '影视原声榜', '体育榜', '欧美榜'],
};

/* 一个平台一套榜单，榜里的歌按该平台取址（见 app.js 的 plTracksOf） */
const chartIds = (platform, board, n = 10) =>
  SONGS.slice()
    .sort((a, b) => hash(b.id + platform + board) - hash(a.id + platform + board))
    .slice(0, n)
    .map((s) => s.id);

const RANK_CHARTS = Object.keys(SOURCES).flatMap((p) =>
  BOARDS[p].map((board, i) => ({
    id: p + '-' + i,
    source: p,
    name: board,
    kind: rankBoardKind(board),
    featured: isRankBoardFeatured(board),
    seed: 'chart-' + p + '-' + board,
    tracks: chartIds(p, board),
  }))
);


/* 歌单分类目录。真实侧来自 getTags(source).tags —— 各平台的分组名和条目都不一样，
 * 所以这里按平台各写一份（组名与标签取自各家 App 的实际分组，内容为示意）。
 * chip 行只放「推荐 + 该平台热门」，全量收进「全部分类」浮层（#plTagsSheet）——
 * 首位那颗「推荐」不在这份目录里：它不是平台给的一个分类词，而是「不挑分类、看整池」的那个默认入口 */
const PL_TAG_GROUPS = {
  kw: [['语种', ['华语', '欧美', '日语', '韩语', '粤语']],
    ['风格', ['流行', '摇滚', '电子', '民谣', '说唱', '古风']],
    ['场景', ['驾驶', '学习', '助眠', '健身', '工作']]],
  kg: [['语种', ['华语', '欧美', '韩语', '日语', '闽南语']],
    ['风格', ['流行', 'DJ', '电子', '说唱', '古风', '摇滚']],
    ['场景', ['驾驶', '助眠', '学习', '运动', '直播']]],
  tx: [['语种', ['华语', '欧美', '日语', '韩语', '粤语']],
    ['风格', ['流行', '说唱', '电子', '国风', '摇滚', '民谣']],
    ['场景', ['通勤', '学习', '助眠', '运动', '工作']]],
  wy: [['语种', ['华语', '欧美', '日语', '韩语', '小语种']],
    ['风格', ['流行', '摇滚', '电子', '民谣', '说唱', '古风']],
    ['场景', ['驾驶', '学习', '助眠', '健身', '游戏']]],
  mg: [['语种', ['华语', '欧美', '日韩', '粤语', '闽南语']],
    ['风格', ['流行', 'DJ', '国风', '说唱', '影视']],
    ['场景', ['运动', '体育', '助眠', '车载', '综艺']]],
};
/* 平台热门（真实侧是 tagInfo.hotTag，各家给各家的一小撮） */
const PL_HOT_TAGS = {
  kw: ['华语', '欧美', '流行', '民谣', '说唱', '驾驶'],
  kg: ['华语', '欧美', '流行', 'DJ', '古风', '助眠'],
  tx: ['华语', '欧美', '说唱', '国风', '通勤', '学习'],
  wy: ['华语', '欧美', '民谣', '电子', '助眠', '游戏'],
  mg: ['华语', '欧美', '国风', '影视', '运动', '车载'],
};

/* home/pid：这份歌单挂在哪个平台、以及该平台给它的歌单号（分享链接里那串数字）。
 * 音源没有歌单事件，所以 ID 只是「去哪找这份歌单」的坐标，取歌仍然一首一首来。
 *
 * cats 只允许出现「自己那个平台」的目录用词（见上面 PL_TAG_GROUPS）：
 * 分类是平台各自定义的，酷狗的「DJ」挂到 QQ 音乐的分类条上会点出一个空集。
 * 五个平台各 6 份、共 30 份 —— 真实侧一页就是 30 份，目录远不止 30，
 * 这一屏要演示的是「滚到底继续取下一页」，名单太短就永远碰不到分页那条线 */
const PLAYLISTS = [
  { id: 'p1', home: 'tx', pid: '3857241552', name: '华语 · 通勤能量站', desc: '陪你挤过早高峰', plays: '128.4万', seed: 'p1', author: '潮汐编辑部', cats: ['华语', '通勤'],
    /* 这份故意给满 16 首：详情层是分页取的，列表太短就演示不出「正在取下一批 / 下一页没取到」 */
    tracks: ['s02', 's06', 's12', 's01', 's13', 's07', 's03', 's04', 's05', 's08', 's09', 's10', 's11', 's14', 's15', 's16'] },
  { id: 'p2', home: 'wy', pid: '8873004452', name: '冷门宝藏 · 独立民谣', desc: '小众但不难听', plays: '86.2万', seed: 'p2', author: '青苔', cats: ['民谣', '华语'],
    tracks: ['s04', 's08', 's11', 's03', 's16', 's14'] },
  { id: 'p3', home: 'wy', pid: '7223311094', name: '钢琴与雨声', desc: '工作白噪音', plays: '240.1万', seed: 'p3', author: 'Weather Report', cats: ['欧美', '学习', '助眠'],
    tracks: ['s14', 's16', 's07', 's03', 's11', 's05'] },
  { id: 'p4', home: 'tx', pid: '2461908377', name: '千年华语 KTV 必点', desc: '回忆杀合集', plays: '312.7万', seed: 'p4', author: '潮汐编辑部', cats: ['华语', '说唱', '国风'],
    tracks: ['s01', 's02', 's11', 's12', 's06', 's09'] },
  { id: 'p5', home: 'kg', pid: '3665041902', name: '深夜 emo 修理厂', desc: '适合一个人听', plays: '98.6万', seed: 'p5', author: '失眠样本', cats: ['欧美', '助眠', '学习'],
    tracks: ['s07', 's16', 's05', 's14', 's08', 's03'] },
  { id: 'p6', home: 'kw', pid: '5528013774', name: '健身循环 BPM 128', desc: '训练伴侣', plays: '54.3万', seed: 'p6', author: 'Iron Room', cats: ['电子', '健身', '驾驶'],
    tracks: ['s10', 's15', 's06', 's09', 's13', 's12'] },

  /* —— 酷我：语种 / 风格 / 场景三组都取样例齐全 —— */
  { id: 'p7', home: 'kw', pid: '2730518844', name: '粤语 · 卡拉OK常青树', desc: '前奏一响就有人抢麦', plays: '187.5万', seed: 'p7', author: '旺角唱片铺', cats: ['粤语', '流行'],
    tracks: ['s01', 's04', 's12', 's06', 's11'] },
  { id: 'p8', home: 'kw', pid: '6640193275', name: '欧美 · 电台金曲回环', desc: '老牌调频的样子', plays: '73.2万', seed: 'p8', author: 'FM 98.1', cats: ['欧美', '流行'],
    tracks: ['s03', 's05', 's07', 's14', 's16'] },
  { id: 'p9', home: 'kw', pid: '3187204466', name: '民谣 · 木吉他与旧信', desc: '一把琴唱到底', plays: '41.8万', seed: 'p9', author: '青苔', cats: ['民谣', '华语'],
    tracks: ['s04', 's08', 's11', 's02'] },
  { id: 'p10', home: 'kw', pid: '7752038814', name: '说唱 · 街头不解释', desc: 'beat 一压就闭嘴', plays: '156.9万', seed: 'p10', author: '低音炮车间', cats: ['说唱', '华语'],
    tracks: ['s06', 's09', 's13', 's15', 's12'] },
  { id: 'p11', home: 'kw', pid: '2046697351', name: '驾驶 · 高速夜行', desc: '凌晨两点的路况', plays: '64.1万', seed: 'p11', author: '夜间驾驶', cats: ['驾驶', '电子'],
    tracks: ['s10', 's13', 's15', 's07'] },

  /* —— 酷狗：DJ / 古风 是它的招牌分类 —— */
  { id: 'p12', home: 'kg', pid: '5819273640', name: 'DJ · 慢摇车载版', desc: '鼓点别太凶，留着听人声', plays: '221.3万', seed: 'p12', author: '阿雷的混音台', cats: ['DJ', '运动'],
    tracks: ['s06', 's10', 's13', 's15', 's09'] },
  { id: 'p13', home: 'kg', pid: '6902837415', name: '华语 · 伤感情歌大赏', desc: '深夜自动播放的那一批', plays: '388.6万', seed: 'p13', author: '心事投递箱', cats: ['华语', '流行'],
    tracks: ['s01', 's02', 's11', 's16', 's04'] },
  { id: 'p14', home: 'kg', pid: '4260518973', name: '欧美 · 乡村公路', desc: '副歌一起就把窗摇下来', plays: '57.4万', seed: 'p14', author: 'Route 66', cats: ['欧美', '驾驶'],
    tracks: ['s03', 's05', 's08', 's14'] },
  { id: 'p15', home: 'kg', pid: '3094812267', name: '古风 · 江湖夜雨', desc: '戏腔与琵琶混着下酒', plays: '143.2万', seed: 'p15', author: '瓦棚听雨', cats: ['古风', '华语'],
    tracks: ['s12', 's04', 's11', 's02'] },
  { id: 'p16', home: 'kg', pid: '7741360285', name: '助眠 · 白噪音与钢琴', desc: '三十分钟内一定困', plays: '260.5万', seed: 'p16', author: 'Weather Report', cats: ['助眠', '学习'],
    tracks: ['s14', 's16', 's07', 's03'] },

  /* —— QQ 音乐：国风 / 通勤 —— */
  { id: 'p17', home: 'tx', pid: '8420517736', name: '欧美 · 健身房低音', desc: '一组动作一首歌', plays: '91.7万', seed: 'p17', author: 'Iron Room', cats: ['欧美', '运动'],
    tracks: ['s05', 's03', 's10', 's13'] },
  { id: 'p18', home: 'tx', pid: '5536290148', name: '国风 · 琴谱里的朝代', desc: '从唐宋一路弹到流行', plays: '178.4万', seed: 'p18', author: '瓦棚听雨', cats: ['国风', '华语'],
    tracks: ['s12', 's01', 's11', 's04', 's02'] },
  { id: 'p19', home: 'tx', pid: '6078134295', name: '学习 · 图书馆白噪音', desc: '没有人声，谢谢', plays: '305.2万', seed: 'p19', author: '深夜自习室', cats: ['学习', '助眠'],
    tracks: ['s14', 's07', 's16', 's03'] },
  { id: 'p20', home: 'tx', pid: '7130946628', name: '说唱 · 新势力周一榜', desc: '这周刚冒头的那些', plays: '68.9万', seed: 'p20', author: '低音炮车间', cats: ['说唱', '华语'],
    tracks: ['s09', 's13', 's06', 's15'] },

  /* —— 网易云：电子 / 游戏 —— */
  { id: 'p21', home: 'wy', pid: '9283746150', name: '电子 · 凌晨四点的合成器', desc: '天亮前别停', plays: '112.6万', seed: 'p21', author: 'Modular', cats: ['电子', '游戏'],
    tracks: ['s10', 's13', 's15', 's05'] },
  { id: 'p22', home: 'wy', pid: '4470926135', name: '欧美 · 独立流行小样', desc: '混音没那么干净，但好听', plays: '39.5万', seed: 'p22', author: 'Demo 收藏家', cats: ['欧美', '流行'],
    tracks: ['s08', 's03', 's16', 's05'] },
  { id: 'p23', home: 'wy', pid: '6612083740', name: '民谣 · 城市漫游者', desc: '地铁终点站往后的歌', plays: '84.3万', seed: 'p23', author: '青苔', cats: ['民谣', '华语'],
    tracks: ['s04', 's11', 's08', 's02'] },
  { id: 'p24', home: 'wy', pid: '5029371664', name: '游戏 · Boss 战预备', desc: '进战斗前点一下', plays: '197.1万', seed: 'p24', author: '残血也别慌', cats: ['游戏', '电子'],
    tracks: ['s13', 's10', 's06', 's15'] },

  /* —— 咪咕：影视 / 车载 是它手上最多的两类 —— */
  { id: 'p25', home: 'mg', pid: '7315048296', name: '影视 · 片头片尾那些年', desc: '前奏一起就想起剧情', plays: '268.4万', seed: 'p25', author: '潮汐编辑部', cats: ['影视', '华语'],
    tracks: ['s01', 's02', 's11', 's12', 's16'] },
  { id: 'p26', home: 'mg', pid: '6408271935', name: '国风 · 戏腔与琵琶', desc: '老调子新唱法', plays: '96.2万', seed: 'p26', author: '瓦棚听雨', cats: ['国风', '华语'],
    tracks: ['s12', 's04', 's15'] },
  { id: 'p27', home: 'mg', pid: '5173920846', name: '车载 · 长途不困', desc: '服务区之前这段路', plays: '143.8万', seed: 'p27', author: '夜间驾驶', cats: ['车载', '驾驶'],
    tracks: ['s06', 's09', 's10', 's13'] },
  { id: 'p28', home: 'mg', pid: '8260934715', name: '运动 · 配速器', desc: '按 5 分配速挑的', plays: '52.7万', seed: 'p28', author: 'Iron Room', cats: ['运动', '电子'],
    tracks: ['s15', 's10', 's13', 's09'] },
  { id: 'p29', home: 'mg', pid: '3947162085', name: '欧美 · 老歌修复室', desc: '把磁带那层底噪留住了', plays: '37.9万', seed: 'p29', author: 'Route 66', cats: ['欧美', '流行'],
    tracks: ['s03', 's05', 's08'] },
  { id: 'p30', home: 'mg', pid: '2680139754', name: '华语 · 球场加油曲', desc: '进球那一刻放的', plays: '71.5万', seed: 'p30', author: '看台第十排', cats: ['华语', '运动'],
    tracks: ['s02', 's06', 's12', 's09'] },
];

/* 「我的歌单」两种单子的数据口径（RN 侧对撞用，别只盯界面）：
 * MY_PLAYLISTS —— 用户自建（含新建 / 试听这类本地单子）。<em>可写</em>：
 *   「⋯」里的加入候选只从这一份来（app.js addablePlaylists），里面的歌也能移出。
 *   条目没有 home / pid，也就是没有平台坐标 → 平台侧本就无图，卡面走内置版式（app.js listCover）。
 * PLAYLISTS × state.favPl —— 从平台收藏来的单子（详情层右上角那颗心收的）。<em>只读</em>：
 *   不进加入候选，里面的歌也不能挪进挪出（本地写不回平台），能动的只有「整份移出收藏」；
 *   它们带 home / pid，卡面用平台那张真封面图，与 plCard 的写法同一套。
 * 「我喜欢」是内置的歌曲收藏（state.fav），与这两类都不是一回事。 */
const MY_PLAYLISTS = [
  { id: 'mp1', name: '通勤 · 半梦半醒', seed: 'mp1', desc: '早上七点的地铁', tracks: ['s01', 's07', 's11', 's02', 's16'] },
  { id: 'mp2', name: '深夜写代码', seed: 'mp2', desc: '不要人声，谢谢', tracks: ['s14', 's16', 's03', 's05', 's08'] },
  { id: 'mp3', name: 'KTV 自救现场', seed: 'mp3', desc: '提前练两周', tracks: ['s06', 's12', 's02', 's09', 's01'] },
  { id: 'mp4', name: '爸妈车里循环', seed: 'mp4', desc: '他们点播我买单', tracks: ['s04', 's10', 's15', 's01', 's11'] },
];

const ARTISTS = [
  { name: '周杰伦', seed: 'a1' },
  { name: '邓紫棋', seed: 'a2' },
  { name: '薛之谦', seed: 'a3' },
  { name: '李宗盛', seed: 'a4' },
  { name: '陈粒', seed: 'a5' },
  { name: '告五人', seed: 'a6' },
  { name: 'HUSH', seed: 'a7' },
  { name: '柳爽', seed: 'a8' },
];

const RECENT = ['s01', 's12', 's07', 's13', 's05'];

const RADIO = [
  { title: '私人 FM', sub: '按你的口味随机', seed: 'r1', kind: 'fm' },
  { title: '赫兹电台', sub: '夜间 · 人声爵士', seed: 'r2', kind: 'live' },
];

/* 大家都在搜：真实侧是各平台合并的热搜榜，屏上截前 10 条（见 app.js 的 SEARCH_HOT_LIMIT） */
const HOT_WORDS = ['晴天', '晚安钢琴曲', '孤勇者', '咪咕音乐', 'lofi 学习', '错位时空', '漠河舞厅', '反方向的钟', '起风了', '山丘', '晚风心里吹', '若月亮没来'];

/* ============ 播放页 mock ============
 * 音源脚本只注册了 musicUrl，没有 lyric / comments 事件 —— 歌词与评论一律标注为宿主侧数据。
 * 下面的歌词是原型占位文案（非任何真实歌曲的歌词），仅用于校验滚动/高亮的交互形态。 */
const LYRIC_LINES = [
  '灯一盏一盏亮起来',
  '窗外的风停在半拍',
  '我把没说完的那句话',
  '留在这一帧的留白',
  '—— 间奏 · 8 小节 ——',
  '第二段主歌反复',
  '时间被拉得很长',
  '每一句都不必回答',
  '只有旋律替我讲',
  '和声从远处靠拢',
  '—— 尾奏 · 渐弱 ——',
];

/* 无时间戳来源时按曲目时长均分；有 LRC 时替换为真实偏移 */
const lyricFor = (song) => {
  const lead = 12;
  const span = Math.max(20, song.dur - lead - 14);
  const step = span / LYRIC_LINES.length;
  return LYRIC_LINES.map((text, i) => ({ t: Math.round(lead + i * step), text }));
};

const SLEEP_OPTIONS = [0, 10, 20, 30, 45, 60, 90];

/* 评论池：真实侧是按页取的（getComment 一页一页翻），所以浮层每次只铺一页，
 * 这里给一整池好让分页看得见。replies 是嵌套树（实测五平台最深 2 级，防御上限 3 级），
 * 第 2 级起在正文前加「回复 @某人」浅色前缀 —— 与 RN CommentNode 的递归口径一致 */
const COMMENTS = [
  { name: '林深时见鹿', level: 'Lv.8', seed: 'c1', likes: '4.2万', time: '10-06',
    text: '128k 也能听得这么认真，大概是歌本身足够好。',
    replies: [
      { name: '小满', text: '同意，音源只是把地址取回来，剩下的耳朵负责。',
        replies: [{ name: '林深时见鹿', text: '这话我记下了，下次换源还来你评论底下报到。' }] },
      { name: '耳机分我一只', text: '第二句比第一句扎人。' },
    ] },
  { name: '耳科护士', level: '乐评人', seed: 'c2', likes: '1.8万', time: '10-05',
    text: '副歌进得早，第二遍才开始铺底鼓，编曲上是懂克制的。整首只有一条人声线撑到结尾，很冒险但成立。' },
  { name: '夜间驾驶', level: 'Lv.4', seed: 'c3', likes: '3246', time: '10-04',
    text: '单曲循环到凌晨三点，第二天依然记得那段口琴。',
    replies: [{ name: '三点半的便利店', text: '口琴那段我也栽了，循环了二十几遍没舍得切。' }] },
  { name: '阿匹', level: 'Lv.2', seed: 'c4', likes: '987', time: '10-02',
    text: '换平台源之后前奏有一处底噪，不是曲子的问题，是来源的问题。' },
  { name: '把耳朵借你', level: '乐评人', seed: 'c5', likes: '612', time: '09-30',
    text: '词写得偏口语，好处是不装。主歌信息密度低，靠旋律把空白补上了。' },
  { name: '早高峰第七节车厢', seed: 'c6', likes: '1.1万', time: '09-28',
    text: '戴耳机挤地铁的人都在听同一件事：别说话，让我把这遍放完。' },
  { name: '半糖去冰', seed: 'c7', likes: '754', time: '09-26',
    text: '前奏一响就把我按回去年那间屋子，歌没问题，是我有问题。',
    replies: [{ name: '路过的和声', text: '这句写得比词作者好。' }] },
  { name: '低音炮烧坏了', seed: 'c8', likes: '433', time: '09-25',
    text: '建议别用车载听，低频那段在小车里会糊成一团。' },
  { name: '把窗打开', seed: 'c9', likes: '298', time: '09-22',
    text: '第二次听才注意到和声是两个人，第一遍全被主旋律抢走了。' },
  { name: '十一点半的台灯', seed: 'c10', likes: '156', time: '09-20',
    text: '副歌最后一句拖了半拍才收，就是这半拍让我每晚都想再来一遍。' },
  { name: '谁把麦关了', seed: 'c11', likes: '88', time: '09-18',
    text: '现场版比录音室狠，人声一出来前面全白搭。' },
  { name: '再放最后一遍', seed: 'c12', likes: '41', time: '09-15',
    text: '「最后一遍」这四个字，是这首歌最诚实的听众备注。' },
];

