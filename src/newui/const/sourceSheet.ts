import { QUALITY_LABEL } from './quality'

/**
 * 音源设置浮层（原型 #sourceSheet，index.html L389-407；交互 renderSheet，app.js L2172-2259）
 * 的界面文案。toast / 状态标签逐条对应原型出处；音质整理由本项目的真实档位键（LX.Quality）。
 */

/** 档位从低到高的整理序（LX.Quality 全集，common.d.ts L6）；chip 与「音质列表」都按此排 */
export const QUALITY_ORDER = [
  '128k',
  '192k',
  '320k',
  'ape',
  'flac',
  'wav',
  'flac24bit',
] as const satisfies readonly LX.Quality[]

/**
 * 浮层里可选的音质档位表（从高到低）。
 * 口径与播放核心一致：核心取播放地址时只在 TRY_QUALITYS_LIST（flac24bit/flac/320k）里
 * 逐档降档，够不着就落 128k（core/music/utils.ts getPlayQuality L218-230）；
 * 旧设置页给的可选档也正是这四档（screens/.../Player/PlayHighQuality.tsx L29-31）。
 * 表外的名义档（192k/ape/wav）选了核心也不认，故浮层不列，避免「能选但无效」。
 */
export const PLAY_QUALITY_CHOICES = [
  'flac24bit',
  'flac',
  '320k',
  '128k',
] as const satisfies readonly LX.Quality[]

/** 版本号小字（照抄旧 UserApiEditModal/List.tsx L17-19：数字开头才补 v，避免「vbeta」） */
export const formatApiVersion = (version: string): string =>
  /^\d/.test(version) ? `v${version}` : version

/**
 * 切源后等新音源「能力表」落定的等待上限（QA D49）。
 * 原型（app.js L2194-2198）在切源那一刻就能同步判出「当前这首新音源够不够得着」，因为它的
 * 音源能力表是本地 mock；真实侧这份表要等脚本初始化完才写进 global.lx.qualityList
 * （core/init/userApi/index.ts L177），所以那句反馈要等 core 自己维护的 apiInitPromise settle。
 * 到限还没 settle（脚本挂死 / 初始化失败）就按「判不到」处理：只报主句、不补半句也不暂停。
 */
export const NEW_UI_SOURCE_INIT_TIMEOUT_MS = 8000

/** 「标准 128k / HQ 320k」式档位列表（原型 app.js L2182 map+join 同款） */
export const formatQualityList = (qualities: readonly LX.Quality[]): string =>
  [...qualities].sort((a, b) => QUALITY_ORDER.indexOf(a) - QUALITY_ORDER.indexOf(b))
    .map(q => `${QUALITY_LABEL[q]} ${q}`)
    .join(' / ')

export const NEW_UI_SHEET_SOURCE = {
  title: '音源设置',
  /** #sheetSub（app.js L2175-2176，原型 <br> 转真换行） */
  sub: '音源只负责一件事：把歌曲变成能播的声音。\n搜索、歌单、榜单、歌词这些内容，都来自各个平台。',
  groupScripts: '已安装音源',
  groupPlatforms: '音乐平台',
  groupQuality: '音质',
  groupImport: '导入音源',
  /** 生效中的音源一行说明：「能播 N 个平台 · 音质列表」（原型 app.js L2183-2186） */
  platformCount: (n: number): string => `能播 ${n} 个平台`,
  /** 本项目存储的脚本不含能力清单（utils/data.ts addUserApi L554-572 只解析脚本头注释），
   * 未生效的脚本只能等切过去加载后才知道覆盖 —— 如实说法 */
  metaFallback: '切过去后会加载它支持的平台',
  /** 平台行 em（原型 app.js L2216 逐字，QA D46） */
  platformCovered: '这里的歌曲可直接播放',
  /** 未接入行 em（原型 app.js L2216 同位，「未接入」逐字，QA D47）。
   * QA 2026-10-14 D-02：真实环境里当前音源名可为空串（没导入过音源），原型 mock 恒有值——
   * 空名不再套模板渲染成「「」未接入QQ音乐」破句，改说没有音源的人话引导 */
  platformUncovered: (name: string, label: string): string =>
    name.length > 0 ? `「${name}」未接入${label}` : `还没有音源接${label} · 贴脚本链接就能听`,
  /** 切内容平台成功 toast（原型 app.js L2226 逐字：受告知范围含排行榜，QA D48；
   * 未覆盖平台由容器拼上 platformSwitchedUncovered 补充半句） */
  platformSwitched: (label: string): string => `首页、歌单与排行榜内容已切换为${label}`,
  /** 选中的平台当前音源没接上时的补充半句（原型 app.js L2226 尾括号原句） */
  platformSwitchedUncovered: '（可浏览，暂不可播）',
  /** 当前内容平台行的状态标签（原型无对应物：新 UI 的平台选中标识） */
  platformActiveTag: '当前在看',
  unplayableTag: '不可播',
  /** .or-state 三档（原型 SCRIPT_STATE，data.js L26-29：已就绪绿 / 未初始化黄） */
  stateReady: '已就绪',
  stateIniting: '初始化中',
  stateFailed: '没就绪',
  stateIdle: '未启用',
  /** 切源成功 toast（原型 app.js L2194） */
  switched: (name: string, version: string): string =>
    `已切到「${name}」${version ? formatApiVersion(version) : ''}`.trim(),
  /**
   * 切源后「当前这首在新音源下取不到地址」时追加的半句（原型 app.js L2198
   * `msg += ' · 当前这首不可播，已暂停'`，QA D49；连同暂停一并补上）
   */
  switchedUnplayable: ' · 当前这首不可播，已暂停',
  /** 单档提示（原型 app.js L2255） */
  qualitySingleNote: (name: string, q: LX.Quality): string =>
    `${name} 在各平台只有 ${QUALITY_LABEL[q]} ${q}，没有更高档位可选`,
  /** 档位 chip 标签一律是纯音质标识（原型 app.js L2239「标准 128k」同款）。
   * 音源没有的档只降显（Chip.disabled），标签不追加「按 X 播」这类字样
   * ——用户 2026-10-15：保持原来的音质标识就行 */
  qualityChip: (q: LX.Quality): string => `${QUALITY_LABEL[q]} ${q}`,
  /** 点不支持档位时的说明（不可选态必须给反馈，不留死按钮；措辞按原型 app.js L2241 逐字，QA D50） */
  qualityPickUnsupported: (name: string, q: LX.Quality, fallback: LX.Quality): string =>
    `「${name}」没有${QUALITY_LABEL[q]}这一档 · 强行选择也会自动降到${QUALITY_LABEL[fallback]}`,
  /**
   * 有置灰档位时常驻的一行解释（原型 app.js L2248-2249 q-note 逐字，QA D51 恢复；
   * 条件同原型：整档表里只要有一档不在当前音源表内就挂出这一句）
   */
  qualityDimNote: '置灰的档位是当前音源没有的 · 点击不会选中，播放时自动降到该档标注的音质。',
  /** 已存的选择落在不支持档位时的说明（切音源后旧选择很常见，如实回显降到哪档） */
  qualitySavedDowngradeNote: (q: LX.Quality, fallback: LX.Quality): string =>
    `你之前选的${QUALITY_LABEL[q]}这档现在的音源没有，听歌时会自动按${QUALITY_LABEL[fallback]}播，不用重选`,
  /** 没选出任何档位（未接源 / 脚本没声明）时的说明 */
  qualityEmptyHint: '选好或导入音源后，这里会列出它真正支持的档位。',
  /** 一条都没装时的引导（本项目内置音源表为空，导入是唯一起点） */
  scriptsEmptyHint: '还没有安装音源 · 贴一个脚本链接导入，就能开始听。',
  /* ---- 导入行（.op-box 同款控件，index.html L396-399；语义按旧 ScriptImportOnline） ---- */
  importPlaceholder: '音源脚本链接',
  importGo: '导入',
  importGoBusy: '导入中…',
  importErrNotUrl: '要贴 http:// 或 https:// 开头的脚本链接',
  importErrTooLarge: '这个脚本太大了，导不进来',
  importErrFetch: (message: string): string => `没抓到脚本：${message}`,
} as const
