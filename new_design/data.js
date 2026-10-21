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

/* 每个平台的真实榜单目录直接抄内置 SDK（src/utils/musicSdk/{平台}/leaderboard.js 的
 * boardList / topList），一张不编——原来这里每人只写 9 个假榜名，界面上「这个平台到底有哪些榜」
 * 全是被编出来的。共 179 张：QQ音乐 25 / 网易云 42 / 酷我音乐 43 / 酷狗音乐 51 / 咪咕音乐 18。
 * 重跑：`node scripts/gen-rank-boards.mjs`（改动只应在 SDK 目录变化时发生） */
const BOARDS = {
  tx: [
    '流行指数榜', '热歌榜', '新歌榜', '飙升榜',
    '说唱榜', '喜力电音榜', '网络歌曲榜', '内地榜',
    '欧美榜', '香港地区榜', '韩国榜', '抖快榜',
    '影视金曲榜', '日本榜', '腾讯音乐人原创榜', 'K歌金曲榜',
    '台湾地区榜', 'DJ舞曲榜', '综艺新歌榜', '国风热歌榜',
    '听歌识曲榜', '动漫音乐榜', '游戏音乐榜', '有声榜',
    '校园音乐人排行榜',
  ], // QQ音乐 25 张
  wy: [
    '飙升榜', '新歌榜', '原创榜', '热歌榜',
    '说唱榜', '古典榜', '电音榜', '黑胶VIP爱听榜',
    'ACG榜', '韩语榜', '国电榜', 'UK排行榜周榜',
    '美国Billboard榜', 'Beatport全球电子舞曲榜', 'KTV唛榜', '日本Oricon榜',
    '欧美热歌榜', '欧美新歌榜', '法国 NRJ Vos Hits 周榜', 'ACG动画榜',
    'ACG游戏榜', 'ACG VOCALOID榜', '中国新乡村音乐排行榜', '日语榜',
    '摇滚榜', '国风榜', '潜力爆款榜', '民谣榜',
    '听歌识曲榜', '网络热歌榜', '俄语榜', '越南语榜',
    '中文DJ榜', '俄罗斯top hit流行音乐榜', '泰语榜', 'BEAT排行榜',
    '编辑推荐榜VOL.44 天才女子摇滚乐队boygenius剖白卑微心迹', 'LOOK直播歌曲榜', '赏音榜', '黑胶VIP新歌榜',
    '黑胶VIP热歌榜', '黑胶VIP爱搜榜',
  ], // 网易云 42 张
  kw: [
    '飙升榜', '新歌榜', '热歌榜', '抖音热歌榜',
    '铃声榜', '热评榜', 'ACG新歌榜', '台湾KKBOX榜',
    '冬日暖心榜', '巴士随身听榜', 'KTV点唱榜', '家务进行曲榜',
    '熬夜修仙榜', '枕边轻音乐榜', '古风音乐榜', 'Vlog音乐榜',
    '电音榜', '流行趋势榜', '现场音乐榜', 'ACG神曲榜',
    '最强翻唱榜', '经典怀旧榜', '华语榜', '粤语榜',
    '欧美榜', '韩语榜', '日语榜', '会员畅听榜',
    '网红新歌榜', '影视金曲榜', 'DJ嗨歌榜', '真声音',
    'Billboard榜', 'iTunes音乐榜', 'beatport电音榜', '英国UK榜',
    '百大DJ榜', 'YouTube音乐排行榜', '韩国Genie榜', '韩国M-net榜',
    '香港电台榜', '日本公信榜', '腾讯音乐人原创榜',
  ], // 酷我音乐 43 张
  kg: [
    'TOP500', '飙升榜', '蜂鸟流行音乐榜', '抖音热歌榜',
    '快手热歌榜', 'DJ热歌榜', '网络红歌榜', '说唱先锋榜',
    '内地榜', '电音榜', '香港地区榜', '民谣榜',
    '台湾地区榜', '欧美榜', 'ACG新歌榜', '韩国榜',
    '日本榜', '80后热歌榜', '90后热歌榜', '00后热歌榜',
    '粤语金曲榜', '欧美金曲榜', '影视金曲榜', '伤感榜',
    '会员专享榜', '雷达榜', '分享榜', '综艺新歌榜',
    '酷狗音乐人原创榜', '闽南语榜', '儿歌榜', '美国BillBoard榜',
    'Beatport电子舞曲榜', '英国单曲榜', '韩国Melon音乐榜', 'joox本地热歌榜',
    '小语种热歌榜', '日本公信榜', '日本SPACE SHOWER榜', 'KKBOX风云榜',
    '越南语榜', '泰语榜', 'R&B榜', '摇滚榜',
    '爵士榜', '乡村音乐榜', '纯音乐榜', '古典榜',
    '5sing音乐榜', '繁星音乐榜', '古风新歌榜',
  ], // 酷狗音乐 51 张
  mg: [
    '咪咕尖叫新歌榜', '咪咕尖叫热歌榜', '咪咕尖叫原创榜', '咪咕港台榜',
    '咪咕内地榜', '咪咕欧美榜', '咪咕日韩榜', '咪咕彩铃榜',
    '咪咕KTV榜', '咪咕网络榜', 'MV榜', '新专辑榜',
    'iTunes榜', 'billboard榜', '台湾Hito中文榜', '中国TOP排行榜',
    '韩国Melon榜', '英国UK榜',
  ], // 咪咕音乐 18 张
};

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

/* ============ 榜单封面插画包 ============
 * 99 张插画在 <code>new_design/rank-covers/</code>（扩展包 92 张 + 基础包补的 7 张：
 * 热歌 / 新歌 / 飙升 / 原创 / 经典 / 女声 / 男声——这七类扩展包没画）。
 * 入库由 <code>scripts/ingest-rank-covers.mjs</code> 做，只动三处：满幅底板的圆角（圆角归卡片容器）、
 * 图上自带的「榜名 + 英文副标 + 下划线」标题块（卡上那两行字归 DOM 画，留着会把名字写两遍，
 * 而图上印的是死名「欧美榜」，卡上是真名「咪咕欧美榜」）、基础包那圈 1px 内描边。图案本体一字未动。
 * 判据是「榜名里含哪个词」而不是全等：同一类榜各家叫法不一（电音榜 / 喜力电音榜 / DJ舞曲榜 /
 * Beatport电子舞曲榜 是一类）。表按先后命中，最长词根优先，同长度时外部授权榜 > 语种 > 地区 >
 * 曲风 > 场景 > 权益 > 排名机制 > 主打，所以「欧美热歌榜」落 west 不落 hot、「国风热歌榜」落
 * chinese_style 不落 hot、「日本公信榜」落 oricon 不落 japan。
 * 表由 <code>scripts/gen-rank-cover-words.mjs</code> 生成并自带体检：179 张真实榜 146 个名字
 * 全部命中，一张不落（`--check` 会重跑这个断言）。 */
const RANK_COVER_WORDS = [
  ['space_shower', ['日本SPACE SHOWER']],
  ['us_billboard', ['美国Billboard']],
  ['youtube_music', ['YouTube音乐排行']],
  ['billboard', ['Billboard', 'BILLBOARD']],
  ['hito', ['台湾Hito中文']],
  ['itunes', ['iTunes音乐', 'ITUNES']],
  ['oricon', ['日本Oricon', '公信']],
  ['electronic', ['电音', '电子', 'DJ', '舞曲', 'BEATPORT']],
  ['look_live', ['LOOK直播歌曲']],
  ['genie', ['韩国Genie']],
  ['kkbox', ['KKBOX风云']],
  ['melon', ['韩国Melon']],
  ['mnet', ['韩国M-net']],
  ['taiwan_kkbox', ['台湾KKBOX']],
  ['new_country', ['中国新乡村音乐']],
  ['vip_vinyl_faves', ['黑胶VIP爱听']],
  ['vip_vinyl_search', ['黑胶VIP爱搜']],
  ['5sing', ['5sing音乐']],
  ['china_top', ['中国TOP排行']],
  ['uk_weekly', ['UK排行榜周']],
  ['vlog', ['Vlog音乐']],
  ['beat', ['BEAT排行']],
  ['top500', ['TOP500']],
  ['nrj_france', ['法国NRJ', 'NRJ', '法国']],
  ['bus_music', ['巴士随身听']],
  ['campus_artist', ['校园音乐人']],
  ['housework', ['家务进行曲']],
  ['ktv_songs', ['KTV点唱']],
  ['migu_ktv', ['咪咕KTV']],
  ['rthk', ['香港电台']],
  ['uk_chart', ['英国UK']],
  ['uk_singles', ['英国单曲']],
  ['european_language', ['欧美语种', '小语种']],
  ['mandopop', ['华语流行']],
  ['hongkong', ['香港地区']],
  ['migu_hk_tw', ['咪咕港台']],
  ['migu_jp_kr', ['咪咕日韩']],
  ['taiwan', ['台湾地区']],
  ['ancient_style', ['古风音乐', '古风']],
  ['country', ['乡村音乐']],
  ['rap', ['说唱', '嘻哈', 'TRAP']],
  ['soundtrack', ['影视金曲', '原声', 'OST', '主题曲', '综艺']],
  ['cover_hits', ['最强翻唱']],
  ['identify_song', ['听歌识曲']],
  ['karaoke_hits', ['K歌金曲']],
  ['ktv_mic', ['KTV唛']],
  ['late_night', ['熬夜修仙']],
  ['live_music', ['现场音乐', '演唱会']],
  ['migu_ringtone', ['咪咕彩铃']],
  ['winter_warm', ['冬日暖心']],
  ['member_exclusive', ['会员专享']],
  ['member_listen', ['会员畅听']],
  ['fanxing', ['繁星音乐']],
  ['migu_network', ['咪咕网络']],
  ['online_classics', ['网络红歌']],
  ['online_songs', ['网络歌曲']],
  ['original', ['原创', '独立音乐', '音乐人']],
  ['potential_hit', ['潜力爆款']],
  ['trend', ['流行趋势', '流行指数']],
  ['russian', ['俄语', '俄罗斯']],
  ['vietnamese', ['越南语']],
  ['minnan', ['闽南语']],
  ['acg', ['ACG', '动漫', '二次元', '动画', '游戏', '番剧']],
  ['instrumental', ['纯音乐']],
  ['rnb', ['R&B']],
  ['healing', ['治愈', '疗愈', '助眠', '轻音乐', '睡前', '枕边']],
  ['short_video', ['抖快', '抖音', '快手', '短视频']],
  ['true_voice', ['真声音']],
  ['new_albums', ['新专辑']],
  ['cantonese_language', ['粤语', '广东']],
  ['japanese_language', ['日语']],
  ['korean_language', ['韩语']],
  ['thai_language', ['泰语']],
  ['chinese', ['华语', '国语']],
  ['japan', ['日本']],
  ['korea', ['韩国']],
  ['mainland', ['内地']],
  ['west', ['欧美']],
  ['children', ['儿歌']],
  ['chinese_electronic', ['国电']],
  ['chinese_style', ['国风']],
  ['classic', ['经典', '老歌', '怀旧']],
  ['classical', ['古典']],
  ['female', ['女声']],
  ['folk', ['民谣']],
  ['jazz', ['爵士']],
  ['male', ['男声']],
  ['rock', ['摇滚', '乐队', '朋克']],
  ['audiobook', ['有声']],
  ['ringtone', ['铃声', '彩铃']],
  ['sad_songs', ['伤感']],
  ['appreciation', ['赏音']],
  ['hot', ['热歌', '热门', '流行', '红歌', '爆款']],
  ['hot_comments', ['热评']],
  ['mv', ['MV']],
  ['new', ['新歌', '新碟', '首发']],
  ['radar', ['雷达']],
  ['rising', ['飙升', '上升', '热涨']],
  ['share', ['分享']],
];
/* 返回封面文件名（不含扩展），命不中给 null */
const rankCoverKey = (name) => {
  const n = String(name).toUpperCase();
  const hit = RANK_COVER_WORDS.find(([, words]) => words.some((w) => n.includes(w.toUpperCase())));
  return hit ? hit[0] : null;
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
 *   条目没有 home / pid，也就是没有平台坐标 → 平台侧本就无图，卡面拿单子里第一首歌的专辑封面
 *   （app.js listCover）；一首都没有的空单才走内置版式。
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

/* 首页的电台入口只剩快捷入口（QUICK）那一格：分类区下面那两张电台卡、轮播里的电台条都已收走，
 * 所以这里不再有一份 RADIO 卡表 */

/* ============ 已缓存（离线收听） ============
 * 真实侧的两关（src/core/music/utils.ts:163/:262、src/utils/data.ts:351、src/plugins/player/utils.ts:184）：
 * 每首播成功一次，本机就写下「歌id_音质 → 取流地址」这条映射，以后取流先查本机、命中就不叫音源脚本；
 * 再拿那条地址去问 track-player 的磁盘缓存（isCached），字节也在这台机器上，才算「不联网也能播」。
 * 两边都没有可枚举的缓存清单 API —— 清单是拿"本机已知道的歌"逐首过这两关筛出来的。
 * 这里直接写过关的键，键格式照真实映射表原样（id_音质）；同一首存过几档就列几条，上屏只报最高那档。 */
const LOCAL_CACHE_KEYS = ['s11_flac24bit', 's07_flac', 's07_128k', 's01_320k', 's01_128k', 's13_320k', 's14_320k', 's02_128k', 's05_128k', 's12_128k', 's16_128k'];
/* 屏上「占用总量 MB」：真实侧是 getAppCacheSize() + getCacheSize() 的本机缓存总量（含封面与歌词，不止音频）。
 * 这里写一个本机报出来的总数——故意不是把上面逐条加出来：逐首占用真实侧给不出，行内也就不装这个尺寸 */
const LOCAL_CACHE_MB = 106;

/* ============ 电台（播客） ============
 * 数据源就是这三条公共接口，屏上每个字段都能回溯到其中一条（实测口径，勿再臆造）：
 *   ① 排行榜  https://rss.marketingtools.apple.com/api/v2/{country}/podcasts/top/50/podcasts.json
 *      一条节目只有 id / name / artistName / genres[].name / artworkUrl100 / url 这五项，
 *      固定 50 条；<em>没有简介、没有集数、没有发布日期、没有音频直链</em>。
 *      字段对照：本 mock 的 by ← artistName，tags ← genres[].name。
 *   ② 搜索    https://itunes.apple.com/search?term={关键词}&media=podcast
 *      比①多给 artworkUrl600、trackCount（总集数）、primaryGenreName，以及一条订阅源地址
 *      （feedUrl，RSS 入口；解析 RSS 不在这三条接口的能力里，本轮不上屏）。
 *   ③ 详情    https://itunes.apple.com/lookup?id={id}&entity=podcastEpisode
 *      results[0] 是节目本体：trackCount / genres / 封面 600 / 最近一集日期都有，<em>但没有节目简介</em>
 *      （接口不给，所以详情屏不画简介位）；其后每条 podcast-episode 给
 *      trackName / releaseDate / trackTimeMillis / shortDescription（一集简介，可能缺席）/ 音频直链。
 *      entity 不支持翻页偏移：<em>一次请求给回的那一批就是这一屏的全部</em>，所以详情屏不分页、
 *      也没有「加载更多」——给回多少集就上多少集，不做人为截断。
 * 地区：①那个地址里的 {country} 就是地区抽屉里挑的这一个。抽屉给完整可选清单（见 POD_REGION_GROUPS），
 * 默认档是中文区（cn）——每次进电台首页都从这一区开始，不改「记住上次看的区」那套。
 * 实测口径：cn / us / gb 稳定可用，jp 偶发 502（重试即通）；其余区尚未逐一手测，取不到就走重试状态行。
 * 下面这份名单是从①的真实返回里抄的（属示意 mock，同 BOARDS 的判例），本轮只抄了四区样本，
 * 其余区运行时按接口取；一集标题与一集简介是原型占位文案（真实侧就是③的 trackName / shortDescription）。 */

/* 地区抽屉的分组清单：key 就是①地址里那一格国家码，label 是屏上给人看的名字。
 * 分组只为好找（屏上分组小标题就是这一份），不是接口给的概念 */
const POD_REGION_GROUPS = [
  { label: '中文地区', items: [
    { key: 'cn', label: '国内' },
    { key: 'tw', label: '中国台湾' },
    { key: 'hk', label: '中国香港' },
    { key: 'sg', label: '新加坡' },
    { key: 'my', label: '马来西亚' },
  ] },
  { label: '亚太', items: [
    { key: 'jp', label: '日本' },
    { key: 'kr', label: '韩国' },
    { key: 'in', label: '印度' },
    { key: 'id', label: '印度尼西亚' },
    { key: 'th', label: '泰国' },
    { key: 'vn', label: '越南' },
    { key: 'ph', label: '菲律宾' },
    { key: 'au', label: '澳大利亚' },
    { key: 'nz', label: '新西兰' },
  ] },
  { label: '欧洲', items: [
    { key: 'gb', label: '英国' },
    { key: 'ie', label: '爱尔兰' },
    { key: 'de', label: '德国' },
    { key: 'fr', label: '法国' },
    { key: 'es', label: '西班牙' },
    { key: 'it', label: '意大利' },
    { key: 'pt', label: '葡萄牙' },
    { key: 'nl', label: '荷兰' },
    { key: 'se', label: '瑞典' },
    { key: 'no', label: '挪威' },
    { key: 'dk', label: '丹麦' },
    { key: 'fi', label: '芬兰' },
    { key: 'pl', label: '波兰' },
    { key: 'ch', label: '瑞士' },
    { key: 'at', label: '奥地利' },
    { key: 'be', label: '比利时' },
  ] },
  { label: '美洲', items: [
    { key: 'us', label: '美国' },
    { key: 'ca', label: '加拿大' },
    { key: 'br', label: '巴西' },
    { key: 'mx', label: '墨西哥' },
    { key: 'ar', label: '阿根廷' },
    { key: 'co', label: '哥伦比亚' },
  ] },
  { label: '中东与非洲', items: [
    { key: 'tr', label: '土耳其' },
    { key: 'il', label: '以色列' },
    { key: 'sa', label: '沙特阿拉伯' },
    { key: 'ae', label: '阿联酋' },
    { key: 'eg', label: '埃及' },
    { key: 'za', label: '南非' },
  ] },
];

/* 展平一份用于查表（按 key 取 label / 校验 key 是否可选）；屏上分组渲染走 POD_REGION_GROUPS */
const POD_REGIONS = POD_REGION_GROUPS.flatMap((g) => g.items);

const POD_CHART = {
  cn: [
    { id: '1573189055', name: '声动早咖啡', by: '声动活泼', tags: ['商务'] },
    { id: '1582119137', name: '岩中花述', by: 'GIADA', tags: ['艺术'] },
    { id: '1668626930', name: '霓达播客', by: '霓达播台NidaMedia', tags: ['犯罪纪实', '休闲'] },
    { id: '1455784513', name: '凹凸电波', by: '凹凸电波', tags: ['喜剧', '健康与健身'] },
    { id: '1498170617', name: '自我进化论', by: '颜晓静Athena', tags: ['休闲', '教育'] },
    { id: '751574016', name: 'All Ears English Podcast', by: 'Lindsay McMahon and Michelle Kaplan', tags: ['教育', '商务'] },
    { id: '1676099257', name: '搞钱女孩', by: '搞钱女孩小辉', tags: ['社会与文化', '商务'] },
    { id: '1731784296', name: '天真不天真', by: '杨天真本真', tags: ['休闲'] },
    { id: '1559695855', name: '知行小酒馆', by: '有知有行', tags: ['商务'] },
    { id: '262026947', name: '6 Minute English', by: 'BBC Radio', tags: ['教育'] },
    { id: '1771401634', name: '谭立人', by: '谭立人', tags: ['休闲'] },
    { id: '1696511339', name: '三个火呛手', by: '思宇_XgEd', tags: ['喜剧', '休闲'] },
    { id: '1603580035', name: '肥话连篇', by: '肥杰', tags: ['喜剧', '休闲'] },
    { id: '1615939013', name: '半拿铁 | 商业沉浮录', by: '潇磊&刘飞', tags: ['商务', '新闻'] },
    { id: '1671490972', name: '纵横四海', by: '携隐Melody', tags: ['教育', '社会与文化'] },
    { id: '1770731694', name: '重重电波', by: '小烘、王王', tags: ['犯罪纪实'] },
    { id: '1796650777', name: 'English Learning Podcast', by: 'EnglishPod', tags: ['教育'] },
    { id: '1581271335', name: '无人知晓', by: '孟岩', tags: ['商务', '宗教与心灵'] },
    { id: '1770713549', name: '西西弗高速', by: '西西弗高速', tags: ['社会与文化'] },
    { id: '1794422481', name: '资讯早7点', by: '王子Wz', tags: ['新闻', '社会与文化'] },
    { id: '1581376691', name: '给女孩的商业第一课', by: '闪光少女斯斯', tags: ['社会与文化', '教育'] },
    { id: '1553429497', name: '高效磨耳朵 | 最好的英语听力资源', by: '英语磨耳朵', tags: ['教育'] },
    { id: '520986449', name: '潘吉Jenny告诉你|学英语聊美国|开言英语 · Podcast', by: 'OpenLanguage 英语', tags: ['教育'] },
    { id: '1712894972', name: '美西螈与东方巨龙', by: '美西螈与东方巨龙', tags: ['艺术', '社会与文化'] }
  ],
  us: [
    { id: '1200361736', name: 'The Daily', by: 'The New York Times', tags: ['News'] },
    { id: '360084272', name: 'The Joe Rogan Experience', by: 'Joe Rogan', tags: ['Comedy'] },
    { id: '1322200189', name: 'Crime Junkie', by: 'Audiochuck', tags: ['True Crime'] },
    { id: '1192761536', name: 'Pod Save America', by: 'Pod Save America', tags: ['News'] },
    { id: '1012570406', name: 'REAL AF with Andy Frisella', by: 'Andy Frisella', tags: ['Business'] },
    { id: '1148175292', name: 'In The Dark', by: 'The New Yorker', tags: ['True Crime', 'Society & Culture'] },
    { id: '1464919521', name: 'Dateline NBC', by: 'NBC News', tags: ['True Crime', 'News'] },
    { id: '1795483480', name: 'Good Hang with Amy Poehler', by: 'The Ringer', tags: ['Comedy'] },
    { id: '1089022756', name: 'Pardon My Take', by: 'Barstool Sports', tags: ['Sports'] },
    { id: '1379959217', name: 'Morbid', by: 'Ash Kelley & Alaina Urquhart', tags: ['True Crime', 'Comedy'] },
    { id: '1615637724', name: 'Betrayal Season 6', by: 'iHeartPodcasts | Glass Podcasts', tags: ['True Crime', 'Society & Culture'] },
    { id: '1222114325', name: 'Up First from NPR', by: 'NPR', tags: ['News'] }
  ],
  gb: [
    { id: '1718287198', name: 'The Rest Is Entertainment', by: 'Goalhanger', tags: ['TV & Film', 'News'] },
    { id: '1611374685', name: 'The Rest Is Politics', by: 'Goalhanger', tags: ['News', 'Government'] },
    { id: '1640878689', name: 'The News Agents', by: 'Global', tags: ['News'] },
    { id: '1537788786', name: 'The Rest Is History', by: 'Goalhanger', tags: ['History'] },
    { id: '1743030473', name: 'The Rest Is Politics: US', by: 'Goalhanger', tags: ['News', 'Government'] },
    { id: '1838594107', name: 'The Romesh Ranganathan Show', by: 'Ranga Bee', tags: ['Comedy', 'Society & Culture'] },
    { id: '1510251497', name: 'Parenting Hell with Rob Beckett and Josh Widdicombe', by: 'Keep It Light Media / Spotify Studios', tags: ['Comedy', 'Kids & Family'] },
    { id: '6806979595', name: 'Bear Hunt', by: 'Goalhanger', tags: ['Fiction', 'Arts'] },
    { id: '1853007888', name: 'The Rest Is Science', by: 'Goalhanger', tags: ['Science'] },
    { id: '1560176558', name: 'My Therapist Ghosted Me', by: 'Global', tags: ['Comedy', 'Society & Culture'] },
    { id: '1630722986', name: 'The Trial of Russell Brand', by: 'The Times', tags: ['News', 'True Crime'] },
    { id: '1465739231', name: 'Russell Brand: On Trial', by: 'Sky News', tags: ['News', 'Society & Culture'] }
  ],
  jp: [
    { id: '1575465539', name: 'マユリカのうなげろりん！！', by: 'ラジオ関西', tags: ['コメディ'] },
    { id: '1647482386', name: '安住紳一郎の日曜天国', by: 'TBS RADIO', tags: ['レジャー', '社会／文化'] },
    { id: '1450522865', name: '歴史を面白く学ぶコテンラジオ （COTEN RADIO）', by: 'COTEN inc.', tags: ['歴史'] },
    { id: '1874531482', name: '朝井リョウ・加藤千恵 信頼できない語り手', by: 'ニッポン放送', tags: ['アート'] },
    { id: '1572229955', name: '大久保佳代子とらぶぶらLOVE', by: 'TBS RADIO', tags: ['コメディ', '社会／文化'] },
    { id: '1533649648', name: 'TBSラジオ『ジェーン・スーと堀井美香の「OVER THE SUN」』', by: 'TBS RADIO', tags: ['レジャー', '社会／文化'] },
    { id: '400203229', name: 'NHKラジオニュース', by: 'NHK (Japan Broadcasting Corporation)', tags: ['ニュース'] },
    { id: '1681528378', name: '紅しょうがは好きズキ！', by: 'ラジオ関西', tags: ['コメディ'] },
    { id: '6820836192', name: '山添寛・渡辺銀次 惑 -まどい- 【オールナイトニッポンPODCAST】', by: 'ニッポン放送', tags: ['社会／文化'] },
    { id: '1366187377', name: '飯田浩司のOK! Cozy up！ Podcast【最新回のみ】', by: 'ニッポン放送', tags: ['ニュース'] },
    { id: '1601910075', name: 'ダイアンのTOKYO STYLE', by: 'TBS RADIO', tags: ['コメディ'] },
    { id: '1651795950', name: '空気階段の踊り場', by: 'TBS RADIO', tags: ['コメディ'] }
  ],
};

/* 节目本体在①里只有名单那几项，集数与「上次更新」要等③取回来。
 * 这四档是详情屏的主推样本，手写；其余节目进详情屏时不写集数——接口没给的就是没给，不编数 */
const POD_SHOW_META = {
  '1573189055': { count: 1058, updated: '2026-10-15' },
  '1582119137': { count: 118, updated: '2026-10-13' },
  '1559695855': { count: 210, updated: '2026-10-12' },
  '1200361736': { count: 2380, updated: '2026-10-15' },
};

/* 手写的那几行 = ③给回的那一批里排在最前面的几行（其余按这一档的更新间隔续满一批）：
 * title / date / sec / intro 四项，intro 就是③里那一集简介的位置，短Description 缺席时整条不写 */
const POD_EPISODES = {
  /* 声动早咖啡 */
  '1573189055': [
    { title: '咖啡豆涨价这一年，咖啡店怎么把价格撑住', date: '2026-10-15', sec: 1086,
      intro: '从期货价谈到门店定价，中间隔着多少层成本；这一期把账算了一遍。' },
    { title: '环球影城为何押注「惊吓体验」', date: '2026-10-14', sec: 972,
      intro: '限定项目做成常年项目，背后是客流结构的变化，不是一次节日营销。' },
    { title: '一家做内容的公司，为什么要自己发手机', date: '2026-10-13', sec: 1140 },
    { title: '把「会员」当成产品而不是促销', date: '2026-10-10', sec: 1015,
      intro: '续费率这件事，运营说不上话，产品得自己回答。' },
    { title: '出海的第一课：先把当地同事的时间表看懂', date: '2026-10-09', sec: 890 },
    { title: '这期聊聊招人：简历之外的东西从哪看出来', date: '2026-10-08', sec: 1205,
      intro: '面试聊得开心不等于合适，这一期请了两位招人踩过坑的朋友。' },
  ],
  /* 岩中花述 */
  '1582119137': [
    { title: '和一位舞者聊「练习」这件事', date: '2026-10-13', sec: 2510,
      intro: '她说.repeat 的不是动作，是当天的心情。' },
    { title: '花园里的第三种声音', date: '2026-10-06', sec: 2380 },
    { title: '把一件旧家具留下来，需要几个理由', date: '2026-09-29', sec: 2605,
      intro: '修复师、收藏者和一位嫌占地方的家属，三种立场放在一起聊。' },
    { title: '关于「得体」的一次争论', date: '2026-09-22', sec: 2295 },
    { title: '秋天适合重读的那两本书', date: '2026-09-15', sec: 2710,
      intro: '一本书读了三遍，另一本读了三十页就放下了，都算读完。' },
  ],
  /* 知行小酒馆 */
  '1559695855': [
    { title: '把家庭账本重做一遍，只留三张表', date: '2026-10-12', sec: 3120,
      intro: '不是记账，是把钱的去向看清楚；表格模板在节目说明里。' },
    { title: '市场安静的那几周，人最容易做错决定', date: '2026-10-05', sec: 2860 },
    { title: '一期关于「留多少现金」的讨论', date: '2026-09-28', sec: 3010,
      intro: '答案不在收益率里，在你多久会用到这笔钱。' },
    { title: '第一次买房时最容易忽略的四件事', date: '2026-09-21', sec: 3355 },
    { title: '为什么我们总把「长期」说成一件轻松事', date: '2026-09-14', sec: 2680 },
  ],
  /* The Daily */
  '1200361736': [
    { title: 'The one big idea that could change your day', date: '2026-10-15', sec: 2630 },
    { title: 'A story reported from the ground, twice', date: '2026-10-14', sec: 2510,
      intro: 'Two reporters, two weeks, one disagreement about what mattered.' },
    { title: 'What the numbers leave out', date: '2026-10-13', sec: 2415 },
    { title: 'The interview that ran long', date: '2026-10-12', sec: 2890 },
    { title: 'A Monday briefing', date: '2026-10-12', sec: 2380,
      intro: 'Three stories to start the week, each under eight minutes.' },
  ],
};

/* 没手写的节目也点得进详情：这里按①给得出的字段合成单集（集数与更新日期不给，就不显示）。
 * 判例同 lyricFor()：形状是真的（按档期一集一集往前排、时长 20–90 分钟、标题长短不一），文字是占位 */
const POD_EP_TITLES = [
  '本期先把这件事说清楚',
  '请来一位不太愿意自我介绍的嘉宾',
  '上半段聊现象，下半段给方法',
  '听众来信：你们问的那三件事',
  '聊一个我们内部争了两天的话题',
  '把上次没说完的那半句补上',
  '从一个小问题聊开',
  '这一期有点长，但每段都有用处',
];

/* ③一次请求给回的那一批，就是详情屏这一列的全部内容：给多少上多少，不人为截断、不分页、没有「加载更多」。
 * 50 就是 entity=podcastEpisode 一次响应给得出的条数上限；总集数不到这个数的档，按它自己的集数取满 */
const POD_EPISODE_BATCH = 50;

/* 'YYYY-MM-DD' → 本地日期（不用 Date.parse，避免时区把日子挪前一天） */
const podDay = (d) => new Date(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10));
const podIso = (t) => `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;

const podEpisodesOf = (show) => {
  const n = Math.min(POD_EPISODE_BATCH, show.count || POD_EPISODE_BATCH);
  const out = (POD_EPISODES[show.id] || []).slice();
  const hand = out.length;
  /* 手写的那几行就是「这一批给回的最前面几行」，剩下的按这一档自己的更新间隔续排到位 */
  const gap = hand > 1
    ? Math.max(1, Math.min(14, Math.round((podDay(out[hand - 2].date) - podDay(out[hand - 1].date)) / 86400000)))
    : 7;
  const anchor = hand ? podDay(out[hand - 1].date) : new Date(2026, 9, 15);
  for (let i = hand; i < n; i++) {
    const h = hash(show.id + '-' + i);
    out.push({
      title: POD_EP_TITLES[(h >>> 3) % POD_EP_TITLES.length],
      date: podIso(new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - (i - hand + 1) * gap)),
      sec: 1200 + (h % 4200),
      /* 一集简介在③里就可能是空的：这里也留空，行少一行，不硬凑 */
      intro: h % 3 === 0 ? `${show.name} 第 ${(h % 90) + 10} 期 · 这一期聊的是${(show.tags || ['这个话题'])[0]}。` : '',
    });
  }
  return out;
};

/* 按号找节目：榜单与搜索都只给条目本身，详情要拿这个号再去打一次③。
 * 订阅名单与收听进度存的是号（本机状态），所以这一份索引得跨地区查 */
const podShowById = (id) => Object.keys(POD_CHART).reduce((hit, k) => hit
  || POD_CHART[k].find((s) => s.id === String(id)), null);

/* 详情屏要的东西一次凑齐：名单项 + ③才给得出的集数与更新日期 + 这一批给回的单集
 * （集数要先并进去，podEpisodesOf 才知道这一档该排到几集） */
const podDetailOf = (show) => {
  const merged = { ...show, ...(POD_SHOW_META[show.id] || {}) };
  return { ...merged, episodes: podEpisodesOf(merged) };
};

/* 订阅与收听进度：这三条接口<em>一条都给不出</em>（Apple 的订阅在账号侧、进度在播放器侧）。
 * 所以它们是<em>本机状态</em>：下面两份种子只是「这台设备上已经有了的两条」，
 * 运行时只在电台首页那一区取消收听（写本机 LS.podSub），不写回任何平台；
 * 详情屏的操作行只有「继续播放」那一颗，本轮没有加进本机的入口（见 index.html 说明节） */
const POD_SUB_SEED = ['1573189055', '1200361736'];
const POD_PROGRESS_SEED = [
  { id: '1573189055', idx: 2, left: 412 },
  { id: '1200361736', idx: 4, left: 1830 },
];

/* 电台首页一次铺 10 张（①固定 50 条，落地时按 50 条分页取完） */
const POD_CHART_PAGE = 10;


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

