/* ============ utils ============ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
/* 工具行没有文字也没有选中底色，状态全靠换图标，所以「现在是什么」写进 aria-label */
const setIcon = (node, id) => {
  const u = $('use', node);
  if (u) u.setAttribute('href', '#' + id);
  return node;
};
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};
const fmt = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
/* 浮层统一用 .show 驱动，配合 CSS 的 visibility 延迟切换，避免依赖 rAF */
const openLayer = (n) => n.classList.add('show');
const closeLayer = (n) => n.classList.remove('show');

/* ============ 封面 / 头像 ============
 * 图片走 picsum（可离线时自动回落到本地 SVG 版式），头像用生成的剪影占位 */
const COVER = (seed, w = 420, h = w) => `https://picsum.photos/seed/yw${hash(seed)}/${w}/${h}`;
const coverSeedOf = (song) => 'album:' + song.album;

let gid = 0;
function svgArt(seed, c1, c2, c3) {
  const id = 'ag' + ++gid;
  const v = hash(seed) % 4;
  let body;
  if (v === 0) {
    body = `<circle cx="70" cy="30" r="26" fill="${c3}" opacity=".9"/>
      <circle cx="28" cy="74" r="33" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.4"/>
      <circle cx="28" cy="74" r="49" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="1.2"/>`;
  } else if (v === 1) {
    body = [0, 1, 2, 3, 4].map((i) => {
      const y = 26 + i * 14;
      return `<path d="M-5 ${y} Q25 ${y - 16} 50 ${y} T105 ${y}" fill="none" stroke="${i % 2 ? c3 : '#fff'}" stroke-opacity="${(0.22 + i * 0.13).toFixed(2)}" stroke-width="${(1.4 + i * 0.5).toFixed(1)}"/>`;
    }).join('');
  } else if (v === 2) {
    let dots = '';
    for (let x = 10; x <= 90; x += 16) for (let y = 10; y <= 90; y += 16) dots += `<circle cx="${x}" cy="${y}" r="1.7" fill="#fff" fill-opacity=".34"/>`;
    body = dots + `<rect x="16" y="44" width="54" height="54" rx="12" fill="${c3}" opacity=".92" transform="rotate(-12 43 71)"/>`;
  } else {
    body = `<polygon points="0,100 46,18 100,100" fill="${c3}" opacity=".78"/>
      <polygon points="0,100 30,44 64,100" fill="#fff" opacity=".16"/>
      <polygon points="52,100 76,58 100,100" fill="${c1}" opacity=".5"/>`;
  }
  return `<svg class="art-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
    <rect width="100" height="100" fill="url(#${id})"/>${body}</svg>`;
}

function svgAvatar(seed, c1, c2) {
  const id = 'ag' + ++gid;
  const hair = [
    `<path d="M28 42a22 22 0 0 1 44 0v4H28z" fill="#171821" fill-opacity=".6"/>`,
    `<path d="M27 45c0-16 9-25 23-25s23 9 23 25c0 4-3 4-4 0-2-10-7-14-19-14s-17 4-19 14c-1 4-4 4-4 0z" fill="#171821" fill-opacity=".62"/>`,
    `<path d="M26 46a24 24 0 0 1 48 0v10a6 6 0 0 0-6-6H32a6 6 0 0 0-6 6z" fill="#171821" fill-opacity=".58"/>`,
  ][hash(seed) % 3];
  return `<svg class="art-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
    <rect width="100" height="100" fill="url(#${id})"/>
    <circle cx="50" cy="104" r="30" fill="#fff" fill-opacity=".22"/>
    <path d="M50 63c-15 0-27 11-29 25h58C77 74 65 63 50 63Z" fill="#fff" fill-opacity=".88"/>
    <circle cx="50" cy="43" r="16" fill="#fff" fill-opacity=".88"/>
    ${hair}
  </svg>`;
}

function art(seed, opt = {}) {
  const [c1, c2, c3] = palette(seed);
  const a = el('div', 'art');
  a.style.setProperty('--c1', c1);
  a.style.setProperty('--c2', c2);
  a.style.setProperty('--c3', c3);
  if (opt.radius) a.style.borderRadius = opt.radius;
  a.innerHTML = opt.face ? svgAvatar(seed, c1, c2) : svgArt(seed, c1, c2, c3);
  if (opt.photo) {
    const img = el('img', 'art-img');
    img.src = opt.photo;
    img.alt = '';
    img.loading = 'lazy';
    img.onerror = () => img.remove();
    a.appendChild(img);
    a.appendChild(el('i', 'art-scrim'));
  }
  return a;
}

const coverArt = (seed, radius, w, h) => art(seed, { radius, photo: COVER(seed, w, h) });
const faceArt = (seed, radius) => art(seed, { radius, face: true });

/* 快捷入口用图标而非封面，保持工具入口的辨识度 */
function artIcon(seed, iconId, radius) {
  const a = art(seed, { radius });
  a.appendChild(el('span', 'ic-center', `<svg class="ic"><use href="#${iconId}"/></svg>`));
  return a;
}

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
}

/* ============ 生效配置：音源脚本 / 平台 / 音质 ============ */
let activeScript = 'yehua';
/* 内容平台是单选、有默认值，没有「全部平台」这一档（newui/utils/contentPlatform.ts：
 * 宿主侧 getSongListSetting()/getLeaderboardSetting() 的默认 source 就是 'kw'）。
 * 它只决定「在看哪个平台的曲库」，与音源脚本接了哪几个平台是两回事 */
let activeSource = 'kw';
let activeQuality = '128k';

const script = () => SCRIPTS.find((s) => s.key === activeScript);
const supports = (platform) => script().platforms.includes(platform);
/* 所选档位当前音源没有时，核心会沿 TRY_QUALITYS 往下探，探不到落 128k。
 * 屏内一律显示降到之后的那一档，不是用户点的那一档 —— 眼睛听到的才是真的 */
const qualityFallback = (q) => {
  const i = TRY_QUALITYS.indexOf(q);
  if (i >= 0) {
    for (let k = i + 1; k < TRY_QUALITYS.length; k++) if (script().qualities.includes(TRY_QUALITYS[k])) return TRY_QUALITYS[k];
  }
  return script().qualities.includes('128k') ? '128k' : script().qualities[0];
};
const playQuality = () => (script().qualities.includes(activeQuality) ? activeQuality : qualityFallback(activeQuality));
const qLabel = () => {
  const q = playQuality();
  return `${QUALITY[q].label} ${q}`;
};
/* 当前音源覆盖的平台简称，用于把「播不了」讲成人话 */
const covered = () => script().platforms.map((k) => SOURCES[k].short).join('、');

/* ============ 本机存储 ============
 * 真实侧这几项各有自己的 setting 键（主题 / 播放模式 / 内容平台 / 音质 / 昵称），
 * 刷新一次就回到默认等于骗人，所以原型也写 localStorage（换台设备回到默认，和昵称那句说明一致）。
 * 队列 / 播放记录 / 收藏不写：那是听歌过程数据，每次打开重排一遍才看得清各个形态 */
const LS_KEY = 'echoisle.proto.v1';
const lsLoad = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch (e) { return {}; } };
/* 无痕模式下写不进去，静默失败就行，不影响看原型 */
const lsSave = (patch) => { try { localStorage.setItem(LS_KEY, JSON.stringify(Object.assign(lsLoad(), patch))); } catch (e) {} };
const LS = lsLoad();
if (LS.script) activeScript = LS.script;
if (LS.source) activeSource = LS.source;
if (LS.quality) activeQuality = LS.quality;

/* ============ banner ============
 * 轮播不写死三段营销文案：RN 侧（hooks/useHomeBanners.ts）每一条都是当前真实状态——
 * 音源公告（现在生效的脚本 + 它能取到地址的平台）、正在播放（有歌才出现，报曲名歌手）、
 * 电台（原型本来就标着建设中）。所以切音源、切歌之后这一排要跟着重画 */
function bannerItems() {
  const sc = script();
  const items = [{
    key: 'api-source', tag: '音源公告',
    title: `当前音源 ${sc.name}`,
    sub: sc.platforms.length
      ? `${sc.platforms.map((k) => SOURCES[k].label).join('、')} 的音乐内容可获取`
      : '当前音源还没有报出可播的平台',
    seed: 'banner-api',
  }];
  if (state.song) {
    items.push({
      key: 'now-playing', tag: state.playing ? '正在播放' : '暂停中',
      title: state.song.title,
      sub: `${state.song.artist} · ${state.song.album}`,
      seed: coverSeedOf(state.song),
    });
  }
  items.push({
    key: 'radio', tag: '随手听', title: '电台',
    sub: '按口味随机播放 · 建设中', seed: 'banner-radio',
  });
  return items;
}

const BANNER_ACTION = {
  'api-source': () => { renderSheet(); openLayer($('#sourceSheet')); },
  'now-playing': () => { openLayer($('#playerLayer')); syncFloat(); },
  radio: () => toast('电台 · 建设中'),
};

function renderBanners() {
  const track = $('#bannerTrack');
  const dots = $('#bannerDots');
  const items = bannerItems();
  track.innerHTML = '';
  dots.innerHTML = '';
  items.forEach((b) => {
    const item = el('div', 'banner');
    const bg = art(b.seed, { photo: COVER(b.seed, 760, 420) });
    bg.classList.add('bgart');
    item.appendChild(bg);
    item.appendChild(el('i', 'veil'));
    item.appendChild(el('span', 'b-tag', b.tag));
    item.appendChild(el('h3', '', b.title));
    item.appendChild(el('p', '', b.sub));
    item.onclick = () => BANNER_ACTION[b.key]();
    track.appendChild(item);
    dots.appendChild(el('i'));
  });
  bannerPaint();
}

/* 轮播的滚动位置与自动翻页只起一次定时器，重画条目不打断它 */
let bannerIdx = 0;
const bannerPaint = () => {
  const dots = $('#bannerDots');
  $$('i', dots).forEach((d, i) => d.classList.toggle('on', i === bannerIdx));
};

function startBannerCarousel() {
  const track = $('#bannerTrack');
  track.addEventListener('scroll', () => {
    bannerIdx = Math.round(track.scrollLeft / (track.clientWidth + 12));
    bannerPaint();
  }, { passive: true });
  setInterval(() => {
    const n = $$('.banner', track).length;
    if (bannerIdx >= n - 1 && track.scrollLeft > 4) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      track.scrollTo({ left: track.scrollLeft + track.clientWidth + 12, behavior: 'smooth' });
    }
  }, 4200);
}

/* ============ 快捷入口 ============ */
function renderQuick() {
  const box = $('#quickRow');
  box.innerHTML = '';
  QUICK.forEach((q) => {
    const b = el('button', 'quick');
    const a = artIcon(q.seed, q.icon, '20px');
    a.classList.add('qa');
    b.appendChild(a);
    b.appendChild(el('span', '', q.label));
    b.onclick = () => {
      if (q.key === 'chart') return switchTab('rank');
      if (q.key === 'liked') return switchTab('mine');
      if (q.key === 'daily') {
        const picked = dailyPool();
        if (!picked.length) { toast('还没有播放记录 · 先从排行榜里点一首'); return; }
        play(songById(picked[0]), picked.map(songById));
        return toast('今日推荐已开始播放');
      }
      toast('电台 · 建设中');
    };
    box.appendChild(b);
  });
}

/* ============ 继续收听 ============
 * 只记这台设备上的收听历史，最多上屏 12 张（RECENT_LIMIT）；一条没有时区块不空着，
 * 给一句「先去听」的引导，右侧「清空记录」也只在有历史时出现 */
const RECENT_LIMIT = 12;
const recentIds = () => state.history.slice(0, RECENT_LIMIT);

function renderRecent() {
  const box = $('#recentRow');
  box.innerHTML = '';
  const ids = recentIds();
  $('#recentMore').hidden = ids.length === 0;
  if (!ids.length) {
    box.appendChild(el('div', 'empty-tip', '还没有播放记录 · 先从排行榜里点一首'));
    return;
  }
  ids.forEach((id) => {
    const s = songById(id);
    const c = el('button', 'recent-card');
    const a = coverArt(coverSeedOf(s), null, 240);
    a.appendChild(el('span', 'play-badge', '<svg class="ic"><use href="#i-play"/></svg>'));
    c.appendChild(a);
    c.appendChild(el('div', 'rt', s.title));
    c.appendChild(el('div', 'rs', s.artist));
    c.onclick = () => play(s, ids.map(songById));
    box.appendChild(c);
  });
}

/* 清空记录：首页与「我的」两处入口共用一条实现，清的是这台设备上的收听历史 */
function clearRecent() {
  if (!state.history.length) return;
  state.history = [];
  renderRecent();
  if (!$('#page-mine').hidden) renderMinePage();
  toast('已清空这台设备上的播放记录');
}

/* ============ 每日推荐 ============
 * 池子 = 听过 ∪ 我喜欢 去重后取前 10；首数按这次真正挑到的算，池子空就明说（不写死 10 首） */
const dailyPool = () => {
  const ids = [...new Set([...state.history, ...state.fav])].filter((id) => songById(id));
  return ids.slice(0, 10);
};

function renderDaily() {
  const c = $('#dailyCard');
  c.innerHTML = '';
  const a = coverArt('daily-' + todayLabel(), null, 240);
  const wrap = el('div', 'dc-art');
  wrap.appendChild(a);
  c.appendChild(wrap);
  const picked = dailyPool();
  const body = el('div', 'dc-body');
  body.innerHTML = `<div class="dc-kicker">FOR YOU</div><h3>每日推荐</h3><p>${
    picked.length ? `${picked.length} 首 · 按你的收听推算` : '先听几首，这里会自动排好'}</p>`;
  c.appendChild(body);
  c.appendChild(el('span', 'date', todayLabel()));
  c.appendChild(el('div', 'dc-glow'));
  c.onclick = () => {
    if (!picked.length) { toast('还没有播放记录 · 先从排行榜里点一首'); return; }
    play(songById(picked[0]), picked.map(songById));
    toast('今日推荐已开始播放');
  };
}

/* 日期角标：本机当天 MM/DD（RN utils/format.ts 的 todayLabel 同口径） */
const todayLabel = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getMonth() + 1)}/${p(d.getDate())}`;
};

/* ============ 推荐歌单（首页） ============ */
function renderPlaylists() {
  const box = $('#playlistGrid');
  box.innerHTML = '';
  PLAYLISTS.slice(0, 4).forEach((p) => box.appendChild(plCard(p)));
}

function plCard(p) {
  const card = el('button', 'pl-card');
  const a = coverArt(p.seed, null, 340);
  a.appendChild(el('span', 'play-badge', '<svg class="ic"><use href="#i-play"/></svg>'));
  card.appendChild(a);
  card.appendChild(el('div', 'pt', p.name));
  const meta = el('div', 'ps');
  meta.style.setProperty('--tint', palette(p.seed)[0]);
  const playable = p.tracks.filter((id) => supports(songById(id).source)).length;
  meta.innerHTML = `<i class="src-dot"></i>${p.plays} · ${playable}/${p.tracks.length} 首可播`;
  card.appendChild(meta);
  card.onclick = () => openPlaylist(p);
  return card;
}

/* ============ 榜单 tabs + 单曲列表（首页「热门单曲」） ============
 * RN 侧（hooks/useHomeRanks.ts）：tab = 当前内容平台真实榜单目录的前 4 个，标签就是榜名本身，
 * 默认落在目录第一个；列表只上屏该榜的前 10 首。首页不再自养一份「热歌/新歌/飙升」假表，
 * 切平台（音源浮层里的「音乐平台」）时这份 tab 跟着换 */
let activeRank = null;

/* 首页「继续收听」以外，这两条上限与 RN 同名参数对齐 */
const HOME_RANK_TAB_LIMIT = 4;
const HOME_SONG_LIMIT = 10;

const homeBoards = () => RANK_CHARTS.filter((c) => c.source === activeSource).slice(0, HOME_RANK_TAB_LIMIT);

/* 选中的榜：认不出上一次的 id（切了平台 / 第一次进来）就回落到目录第一个 */
const currentBoard = () => {
  const tabs = homeBoards();
  return tabs.find((t) => t.id === activeRank) ?? tabs[0] ?? null;
};

function renderRankTabs() {
  const box = $('#rankTabs');
  box.innerHTML = '';
  const tabs = homeBoards();
  const cur = currentBoard();
  activeRank = cur ? cur.id : null;
  tabs.forEach((t) => {
    const c = el('button', 'chip' + (t.id === activeRank ? ' on' : ''), t.name);
    c.onclick = () => {
      activeRank = t.id;
      state.queue = null;
      renderRankTabs();
      renderSongs();
    };
    box.appendChild(c);
  });
}

function currentSongs() {
  const b = currentBoard();
  if (!b) return [];
  /* 整份榜挂在一个平台下，榜里的歌就按那个平台取址，所以这里不再按歌曲记录的 source 过滤 */
  return b.tracks
    .slice(0, HOME_SONG_LIMIT)
    .map((id) => Object.assign({}, songById(id), { source: b.source }));
}

function renderSongs() {
  const box = $('#songList');
  box.innerHTML = '';
  const list = currentSongs();

  if (!list.length) {
    const empty = el('div', 'sr-sub');
    empty.style.cssText = 'padding:18px 4px;font-size:12.5px;justify-content:center;width:100%';
    empty.textContent = homeBoards().length
      ? '这张榜暂时打不开 · 换一张试试'
      : '这个平台暂时没有可列出的榜单';
    box.appendChild(empty);
  }

  list.forEach((s, i) => box.appendChild(songRow(s, i + 1, list, true)));

  const playable = list.filter((s) => supports(s.source));
  const btn = $('#playAllBtn');
  /* 按钮上不带平台名：在看哪个平台只在音源浮层里切、只在那里回显（页面不重复标注） */
  btn.innerHTML = `<svg class="ic"><use href="#i-play"/></svg>播放全部 ${playable.length} 首`;
  btn.onclick = () => {
    if (playable[0]) play(playable[0], playable);
    else toast('这几首在当前音源下不可播 · 换个音源或换几首');
  };
}

function songRow(s, rank, queue, noMenu) {
  const ok = supports(s.source);
  const row = el('button', 'song-row' + (state.song?.id === s.id ? ' playing' : '') + (ok ? '' : ' off'));
  row.appendChild(el('span', 'rank' + (rank <= 3 && ok ? ' top' : ''), String(rank)));
  row.appendChild(coverArt(coverSeedOf(s), '10px', 120));

  const body = el('div', 'sr-body');
  const title = el('div', 'sr-title');
  if (state.song?.id === s.id && state.playing) {
    title.innerHTML = `<span class="eq"><i></i><i></i><i></i></span>`;
  }
  title.appendChild(el('span', '', s.title));
  body.appendChild(title);

  const sub = el('div', 'sr-sub');
  const src = el('span', 'src-badge', SOURCES[s.source].short);
  src.style.setProperty('--tint', SOURCES[s.source].tint);
  /* 第二行四段固定顺序：平台 → 音质 → 歌手 → 专辑。
   * 放不下的时候先舍专辑（sr-album 的 flex-shrink 最大），歌手名再截尾，前两段是角标不缩 */
  sub.innerHTML = `<span class="q-tag">${ok ? QUALITY[playQuality()].label : '暂不能播'}</span>`
    + `<i class="sep"></i><span class="sr-artist">${s.artist}</span>`
    + `<i class="sep"></i><span class="sr-album">${s.album}</span>`;
  sub.prepend(src);
  body.appendChild(sub);
  row.appendChild(body);

  const right = el('div', 'sr-right');
  right.appendChild(el('span', 'sr-dur', fmt(s.dur)));
  if (!noMenu) {
    const more = el('button', '', '<svg class="ic"><use href="#i-more"/></svg>');
    more.onclick = (e) => {
      e.stopPropagation();
      openMore(s, queue);
    };
    right.appendChild(more);
  }
  row.appendChild(right);

  row.onclick = () => (ok ? play(s, queue || null) : toast('这首歌的来源平台未接入当前音源 · 换个音源试试'));
  return row;
}

/* ============ 排行榜页 ============
 * 目录是宿主侧的平台数据，与音源脚本接了哪几个平台无关：五个平台的榜全列，
 * 当前在看那个平台的整体排最前（useRankBoards 的 rankCardsWithPlatformFirst）。
 * 榜里的歌按该平台取址，所以进来就是一整份排名，不必逐首标能不能播。
 *
 * 旧版每平台截 6 张，剩下的榜等于被藏起来了（用户问「其他榜呢」就是这条）：
 * 现在一个平台手上有多少就列多少，页面按平台分段，一页一屏往下取 */
const RANK_PAGE_SIZE = 8;
let rnkShown = RANK_PAGE_SIZE;
let rnkPage = 2;
let rnkLoading = false;
let rnkFailed = false;
let rnkFailedOnce = false;

function rankView() {
  const order = Object.keys(SOURCES);
  const rest = order.filter((p) => p !== activeSource);
  return [activeSource, ...rest].flatMap((p) => {
    const list = RANK_CHARTS.filter((c) => c.source === p);
    /* 主打榜（热/新/飙）排前，其余按平台目录原序 */
    return [...list.filter((c) => c.featured), ...list.filter((c) => !c.featured)];
  });
}

/* 重新进这一页 / 换平台回到第一屏，滚到底再取下一屏 */
function resetRankPage() {
  rnkShown = RANK_PAGE_SIZE;
  rnkPage = 2;
  rnkLoading = false;
  rnkFailed = false;
}

function rankGroupHead(source) {
  const total = RANK_CHARTS.filter((c) => c.source === source).length;
  const g = el('div', 'rank-group');
  g.appendChild(el('b', '', SOURCES[source].label));
  g.appendChild(el('span', '', `${total} 个榜 · 热歌 / 新歌 / 飙升在前`));
  return g;
}

function rnkStatusRow() {
  const r = el('button', 'pl-status', rnkFailed ? PLD_STATUS.retry : '');
  r.disabled = rnkLoading;
  if (!rnkFailed) { r.appendChild(el('i', 'spin')); r.appendChild(el('span', '', PLD_STATUS.loading)); }
  r.onclick = () => loadRankPage();
  return r;
}

function loadRankPage() {
  if (rnkLoading) return;
  const charts = rankView();
  if (rnkShown >= charts.length) return;
  rnkLoading = true;
  rnkFailed = false;
  paintRankGrid();
  setTimeout(() => {
    rnkLoading = false;
    /* 第 3 屏第一次故意失败一次，把「这一批没有载入 · 点击重试」这条真实路径摆出来 */
    if (rnkPage === 3 && !rnkFailedOnce) {
      rnkFailedOnce = true;
      rnkFailed = true;
    } else {
      rnkShown = Math.min(charts.length, rnkShown + RANK_PAGE_SIZE);
    }
    rnkPage += 1;
    paintRankGrid();
  }, 520);
}

function rankScroll() {
  if ($('#page-rank').hidden || rnkLoading) return;
  const vp = $('#viewport');
  if (rnkShown >= rankView().length) return;
  if (vp.scrollTop + vp.clientHeight > vp.scrollHeight - 160) loadRankPage();
}

function renderRankPage() {
  if (activeSource !== renderRankPage.lastSource) {
    renderRankPage.lastSource = activeSource;
    resetRankPage();
  }
  paintRankGrid();
}

/* 分段标题跟着平台切换插入：中途接着往下滚时，也要知道现在在哪家曲库里 */
function paintRankGrid() {
  const box = $('#rankGrid');
  const charts = rankView();
  const shown = Math.min(rnkShown, charts.length);
  box.innerHTML = '';
  if (!charts.length) {
    box.appendChild(el('div', 'empty-tip', '当前音源下没有可列榜单的平台 · 到设定页换一个音源'));
    return;
  }
  let lastSource = null;
  charts.slice(0, shown).forEach((c) => {
    if (c.source !== lastSource) {
      lastSource = c.source;
      box.appendChild(rankGroupHead(c.source));
    }
    box.appendChild(rankCard(c));
  });
  if (shown < charts.length && (rnkLoading || rnkFailed)) box.appendChild(rnkStatusRow());
  else if (shown >= charts.length) box.appendChild(plEndRow());
}

/* 榜单封面：一枚单色线条符号（按榜型，六枚）+ 平色深底，符号按 512×512 画、居中留白。
 * 颜色按「榜名」给而不是按「榜型」：45 张榜里 29 张会回落成同一个「橙黑胶」，
 * 同一平台段里几张榜只有名字不同——按榜名上色后每张榜有自己的脸，
 * 同名榜跨平台保持同色（五个平台的欧美榜是一张脸，同榜就该同脸）。
 * 底色 = 强调色压暗得来的同色相深底（shadeHex），深色底语言不变，只是各榜色温不同 */
const CHART_ACCENT = {
  hot: '#F97316',
  new: '#5EEAD4',
  original: '#A78BFA',
  rise: '#A3E635',
  classic: '#F59E0B',
  electronic: '#818CF8',
};

/* 榜名 → 强调色。六枚原型色原样保留，其余榜名按语义就近配；
 * 同一平台段内出现的榜，色相都拉开（民谣表里给的是木色 #D97706，
 * 与同段的古典/热歌会撞成一排金，改草绿） */
const CHART_TINT = {
  '热歌榜': '#F97316', '新歌榜': '#5EEAD4', '飙升榜': '#A3E635', '原创榜': '#A78BFA',
  '古典榜': '#F59E0B', '电音榜': '#818CF8', '说唱榜': '#94A3B8', '民谣榜': '#4ADE80',
  '欧美榜': '#60A5FA', '短视频榜': '#E879F9', '铃声榜': '#FDE047', '体育榜': '#D946EF',
  '车载榜': '#38BDF8', 'K歌榜': '#F472B6', '影视榜': '#A8A29E', '影视原声榜': '#A8A29E',
  '古风榜': '#DC2626', '国风榜': '#DC2626', '内地榜': '#22C55E', '港台榜': '#FCD34D',
  '日韩榜': '#FB7185', '华语榜': '#EF4444', 'DJ榜': '#86EFAC',
};
const chartTint = (c) => CHART_TINT[c.name] ?? CHART_ACCENT[c.kind] ?? CHART_ACCENT.hot;
/* 深底 = 强调色各通道压暗到 24%：同一个色相的深色版 */
const shadeHex = (hex, k) => '#' + [1, 3, 5].map((i) =>
  Math.round(parseInt(hex.slice(i, i + 2), 16) * k).toString(16).padStart(2, '0')).join('');

const CHART_EMBLEM = {
  /* 黑胶：同心圆 + 中心孔（孔取封面底色 --rk-bg，正好透出该榜的深底） */
  hot: `<circle cx="256" cy="256" r="120" stroke="currentColor" stroke-width="6" fill="none"/>
    <circle cx="256" cy="256" r="82" stroke="currentColor" stroke-width="3" fill="none" opacity="0.55"/>
    <circle cx="256" cy="256" r="44" fill="currentColor"/>
    <circle cx="256" cy="256" r="10" style="fill:var(--rk-bg,#0B1220)"/>`,
  /* 音符：符杆 + 右上旗 + 实心符头 */
  new: `<path d="M256 140 V340" stroke="currentColor" stroke-width="10" stroke-linecap="round"/>
    <path d="M256 140 Q316 160 316 220" stroke="currentColor" stroke-width="10" stroke-linecap="round" fill="none"/>
    <circle cx="216" cy="348" r="34" fill="currentColor"/>`,
  /* 麦克风：胶囊 + 拾音环 + 站杆 + 底座 */
  original: `<rect x="216" y="130" width="80" height="140" rx="40" stroke="currentColor" stroke-width="8" fill="none"/>
    <path d="M180 240 V250 A76 76 0 0 0 332 250 V240" stroke="currentColor" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M256 326 V382" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>
    <path d="M212 382 H300" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>`,
  /* 上升箭头：折线上扬 + 右上等臂拐角箭头 */
  rise: `<path d="M140 360 L240 260 L300 320 L380 200" stroke="currentColor" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M340 200 H380 V240" stroke="currentColor" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  /* 留声机：喇叭臂 + 立柱 + 底座 */
  classic: `<path d="M200 340 V232 L330 168 V300" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <rect x="170" y="340" width="200" height="14" rx="7" fill="currentColor"/>
    <rect x="184" y="232" width="16" height="108" rx="6" fill="currentColor"/>`,
  /* 方波：两段高低电平 */
  electronic: `<path d="M140 320 V192 H236 V320 H332 V192 H372" stroke="currentColor" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
};

/* 榜单封面是「该榜」的视觉资产：色与形都在卡片和详情头图共用，
 * 这样从榜单页点进去，认的还是同一张脸 */
function chartArt(c) {
  const tint = chartTint(c);
  const a = el('div', 'art chart-art');
  a.style.setProperty('--accent', tint);
  a.style.setProperty('--rk-bg', shadeHex(tint, 0.24));
  a.innerHTML = `<svg class="rk-emblem" viewBox="0 0 512 512" aria-hidden="true">${CHART_EMBLEM[c.kind] ?? CHART_EMBLEM.hot}</svg>`;
  return a;
}

function rankCard(c) {
  const tint = chartTint(c);
  const card = el('button', 'rk-card');
  card.style.setProperty('--accent', tint);
  card.style.setProperty('--rk-bg', shadeHex(tint, 0.24));
  /* 卡上两行：榜名（平台给的真名）+ 平台全称。
   * 原来角标位写的「每小时更新」这类更新频率、以及「N 首」都是编的——
   * 真实目录只给榜名和平台，拿不到的数就不摆（RN 同口径，RankPage.tsx:63-65） */
  card.innerHTML = `<svg class="rk-emblem" viewBox="0 0 512 512" aria-hidden="true">${CHART_EMBLEM[c.kind] ?? CHART_EMBLEM.hot}</svg>
    <span class="rk-name">${c.name}</span>
    <span class="rk-sub">${SOURCES[c.source].label}</span>`;
  card.onclick = () => openPlaylist(c, 'rank');
  return card;
}

/* ============ 歌单页 ============ */
/* chip 行 = 「全部」+ 当前平台热门 + 行尾「全部分类」入口；全量目录按平台分组收在 #plTagsSheet。
 * （原型旧版是一排 11 个硬编码分类、五个平台共用，真实侧目录逐平台不同且远比 11 个多） */
const PL_TAG_ALL = '全部';
let plCat = PL_TAG_ALL;

const plHotCats = () => [PL_TAG_ALL, ...PL_HOT_TAGS[activeSource]];
const plGroups = () => PL_TAG_GROUPS[activeSource];

/* 推荐目录和歌单详情一样是分页取的：真实侧「发现」页一页一页往下翻，翻到平台给完为止。
 * 每屏落 10 份，滚到底自动取下一批；第 3 批第一次故意失败一次，让末尾那行「点击重试」看得见
 * （真实侧这一行是网络被拒驱动的，原型只是把那条路径摆出来） */
const PL_POOL_SIZE = 10;
let plPoolShown = PL_POOL_SIZE;
let plPoolPage = 2;
let plPoolLoading = false;
let plPoolFailed = false;
let plPoolFailedOnce = false;

function plPool() {
  const list = plCat === PL_TAG_ALL ? PLAYLISTS : PLAYLISTS.filter((p) => p.cats.includes(plCat));
  /* 当前在看的平台排最前：分类条给的就是这个平台的热门词，先让它自己的结果露在首屏 */
  return [...list.filter((p) => p.home === activeSource), ...list.filter((p) => p.home !== activeSource)];
}

/* 换分类、换平台、重新进这一页都回到第一批 */
function resetPlPool() {
  plPoolShown = PL_POOL_SIZE;
  plPoolPage = 2;
  plPoolLoading = false;
  plPoolFailed = false;
}

function plPoolStatusRow() {
  const r = el('button', 'pl-status', plPoolFailed ? PLD_STATUS.retry : '');
  r.disabled = plPoolLoading;
  if (!plPoolFailed) { r.appendChild(el('i', 'spin')); r.appendChild(el('span', '', PLD_STATUS.loading)); }
  r.onclick = () => loadPlPoolPage();
  return r;
}

function loadPlPoolPage() {
  if (plPoolLoading) return;
  const pool = plPool();
  if (plPoolShown >= pool.length) return;
  plPoolLoading = true;
  plPoolFailed = false;
  paintPlPool();
  setTimeout(() => {
    plPoolLoading = false;
    if (plPoolPage === 3 && !plPoolFailedOnce) {
      plPoolFailedOnce = true;
      plPoolFailed = true;   // 停在原地，末尾换成「点击重试」
    } else {
      plPoolShown = Math.min(pool.length, plPoolShown + PL_POOL_SIZE);
    }
    plPoolPage += 1;
    paintPlPool();
  }, 520);
}

/* 只有正站在歌单页时才认这个滚动，别的 Tab 滚到底不去取歌单 */
function plPoolScroll() {
  if ($('#page-playlist').hidden || plPoolLoading) return;
  const vp = $('#viewport');
  if (plPoolShown >= plPool().length) return;
  if (vp.scrollTop + vp.clientHeight > vp.scrollHeight - 160) loadPlPoolPage();
}

function renderPlaylistPage() {
  /* 换分类、换平台、重新进这一页 —— 真实侧这三种都是重新发第一页请求，原型跟着回到第一批 */
  if (plCat !== renderPlaylistPage.lastCat || activeSource !== renderPlaylistPage.lastSource) {
    renderPlaylistPage.lastCat = plCat;
    renderPlaylistPage.lastSource = activeSource;
    resetPlPool();
  }
  const cats = $('#catRow');
  cats.innerHTML = '';
  plHotCats().forEach((c) => {
    const b = el('button', 'chip' + (plCat === c ? ' on' : ''), c);
    b.onclick = () => { plCat = c; renderPlaylistPage(); $('#viewport').scrollTop = 0; };
    cats.appendChild(b);
  });
  const more = el('button', 'chip' + (plHotCats().includes(plCat) ? '' : ' on'), '全部分类');
  more.onclick = openTagSheet;
  cats.appendChild(more);

  const mine = $('#myPlRow');
  mine.innerHTML = '';
  /* 自建单子现在真能删（详情层右上角那颗删除钮），删空了这一排得有话说 */
  $('#myPlEmpty').hidden = mine.hidden = MY_PLAYLISTS.length > 0;
  MY_PLAYLISTS.forEach((p) => {
    const c = el('button', 'my-pl');
    c.appendChild(listCover(p, '16px', 240));
    c.appendChild(el('div', 'mp-n', p.name));
    c.appendChild(el('div', 'mp-s', `${p.tracks.length} 首 · ${p.desc}`));
    /* 纯自建的单子没有平台坐标，走详情层的「本地歌单」形态（能删），不是「自建歌单」壳 */
    c.onclick = () => openPlaylist(p, 'local');
    mine.appendChild(c);
  });

  const pool = plPool();
  paintPlPool();
}

/* 首屏只落第一批，剩下的交给滚动；计数在没取完时说清「已列出多少 / 平台一共给了多少」 */
function paintPlPool() {
  const pool = plPool();
  const shown = Math.min(plPoolShown, pool.length);
  $('#plPoolTitle').textContent = plCat === PL_TAG_ALL ? '推荐歌单' : `${plCat} · 歌单`;
  $('#plPoolCount').textContent = shown < pool.length ? `已列出 ${shown} / ${pool.length} 个` : `${pool.length} 个`;
  $('#plPoolEmpty').hidden = shown > 0;
  const grid = $('#plPoolGrid');
  grid.innerHTML = '';
  pool.slice(0, shown).forEach((p) => grid.appendChild(plCard(p)));
  if (shown < pool.length && (plPoolLoading || plPoolFailed)) grid.appendChild(plPoolStatusRow());
  else if (pool.length > 0 && shown >= pool.length) grid.appendChild(plEndRow());
}

/* 「全部分类」浮层：先亮一下正在取，再落分组目录（真实侧是 getTags(source) 异步） */
function openTagSheet() {
  const body = $('#plTagsBody');
  body.innerHTML = '<div class="empty-tip">正在从平台获取分类…</div>';
  openLayer($('#plTagsSheet'));
  clearTimeout(openTagSheet.t);
  openTagSheet.t = setTimeout(() => {
    if (!$('#plTagsSheet').classList.contains('show')) return;
    renderTagGroups(body);
  }, 420);
}

function renderTagGroups(body) {
  body.innerHTML = '';
  const flat = plGroups();
  if (!flat.length) {
    body.innerHTML = '<div class="empty-tip">这个平台暂时取不到分类 · 稍后再试</div>';
    return;
  }
  const top = el('div', 'hot-words');
  top.appendChild(tagChip(PL_TAG_ALL));
  body.appendChild(top);
  flat.forEach(([label, items]) => {
    body.appendChild(el('div', 'group-label', label));
    const row = el('div', 'hot-words');
    items.forEach((c) => row.appendChild(tagChip(c)));
    body.appendChild(row);
  });
}

function tagChip(c) {
  const b = el('button', 'chip' + (plCat === c ? ' on' : ''), c);
  b.onclick = () => {
    plCat = c;
    closeLayer($('#plTagsSheet'));
    renderPlaylistPage();
    $('#viewport').scrollTop = 0;
  };
  return b;
}

/* ============ 详情层（歌单 / 榜单 / 自建 / 本地 / 我喜欢 五种形态共用） ============
 * 对应 newui/screens/SonglistDetail + const/songlistDetail.ts。
 * 真实侧曲目是按页取回来的（getListMusics(id, source, page)），所以列表底部要有如实的状态行，
 * 不是一次把整单铺完 —— 原来这里一次列完，看不见「载入中」和「这一批没载入」长什么样 */
let plNow = null;
let plShown = 0;
let plLoading = false;
/* 列表尾部按需出现三种行：取下一批的转圈行、取失败的重试行、列完的「没有更多了」——
 * 中间批次静默衔接（不逐批收尾），滚到底自然去取下一页 */
let plLoadFailed = false;
/* 第 3 页故意先失败一次，让「点击重试」这一行在原型里看得见（重试即成功）；
 * 真实侧这一行由取数 reject 驱动，形态一致 */
const plFailedPages = new Set();

const PL_PAGE_SIZE = 5;

const PLD_CRUMB = { rank: '排行榜', mine: '自建歌单', pl: '歌单', local: '我的歌单', fav: '内置歌单' };
const PLD_FOOT = {
  rank: '整份榜单按该平台的排名排列 · 每首可直接播',
  mine: '这份歌单只存在这台设备上',
  pl: '整份歌单先列出曲目 · 能否播放以点开那一刻为准',
  local: '这份歌单只存在这台设备上 · 队列即歌单本身，点开即听 · 想撤哪首就在它的「⋯」里移出',
  fav: '这份收藏只存在这台设备上 · 取消收藏在歌曲行的「⋯」里',
};
const PLD_EMPTY = {
  error: '这份歌单暂时取不到内容 · 网络或音源不稳定，稍后再试',
  localError: '这份歌单暂时打不开 · 稍后再试',
  end: '这份歌单还是空的 · 换一份听听',
  /* 自建歌单被移空时不该说「换一份听听」——这张单子是用户自己的，下一句得告诉他怎么往里加 */
  local: '这份歌单还是空的 · 在歌曲右侧的「⋯」里加入',
  fav: '还没有收藏 · 点歌曲右侧的爱心，收进来的都会留在这里',
};
/* 列表尾部只按需出现三行：取下一批的「转圈 + 文字」、取失败的可点重试、列完的终点行——
 * 滚动加载两端都要有形：中途有过程感，到底有终点感，不让人对着列表尾猜还在不在加载 */
const PLD_STATUS = { loading: '正在载入下一批…', retry: '这一批没有载入 · 点击重试', end: '没有更多了' };

/* 列到头那一行：滚到底得能确认「就这些了」（榜单页 / 歌单池 / 详情层共用同一形态） */
function plEndRow() {
  return el('div', 'pl-end', PLD_STATUS.end);
}
const PLD_LABELS = {
  /* 心钮语义是「存进我的歌单」，不是点赞：榜单收的是整榜曲目，所以换了说法 */
  fav: '将这份歌单存进我的歌单',
  unfav: '已存进我的歌单 · 再点移出',
  favBoard: '将整张榜的歌曲存进我的歌单',
  unfavBoard: '整张榜已存好 · 再点移出',
  deleteList: '删除本歌单',
  back: '返回',
  shuffle: '随机播放',
};
const PLD_TOAST = {
  playAllEmpty: '这里暂时没有可播的歌曲 · 换个音源或稍后再试',
  favSaving: '正在存进我的歌单…',
  boardSaving: '正在收录整张榜的歌曲 · 榜单较长，请稍候',
  favRemoved: '已移出我的歌单',
  deleted: (name) => `已删除「${name}」· 我的歌单已更新`,
};

/* 榜单把整份内容绑在一个平台上，榜里的歌就按那个平台取址 */
const plTracksOf = (pl) =>
  pl.tracks.map((id) => {
    const s = songById(id);
    return pl.src ? Object.assign({}, s, { source: pl.src }) : s;
  });

const plAllTracks = () => (plNow ? plTracksOf(plNow) : []);

/* 「我喜欢」是一份内置歌单：不能改名、不能删，但详情层形态与其它歌单完全一致 ——
 * 点位卡打开的就是它，曲目按收藏先后排列；id 固定，重开才保得住已滚动到的页数 */
const favPlaylist = () => ({ id: 'fav__builtin', name: '我喜欢', seed: 'fav-builtin', desc: '', tracks: [...state.fav] });

/* 「我的歌单」里其实是两种单子，长得像但能力不一样：
 * 自建（MY_PLAYLISTS）—— 能加歌，也能把歌移出去；平台侧没有这张单，也就没有它的封面图
 * 收藏自平台（state.favPl 在 PLAYLISTS 目录里命中的那些）—— 只读，封面就是平台那张真图，
 *   整份单子能移出收藏，但里面的歌不能挪进挪出（本地写不回平台） */
const collectedPlaylists = () => PLAYLISTS.filter((p) => state.favPl.has(p.id));

/* 「⋯」里能被加入的只有自建歌单：收藏来的那份是平台只读的，往里塞歌平台不认，
 * 所以这份候选名单根本不碰 collectedPlaylists() */
const addablePlaylists = () => MY_PLAYLISTS;

/* 卡面与详情头图走哪一路，看这份单子有没有平台坐标（.home）：
 * 有 → 上平台给的真封面图（和【歌单】页推荐卡同一套写法，取不到图 art() 自己回落）；
 * 没有 → 内置版式占位，不画一张随机图冒充平台封面 */
const listCover = (p, radius, w, h) => (p.home ? coverArt(p.seed, radius, w, h) : art(p.seed, { radius }));

/* 收藏被改的那一刻（歌曲行的「⋯」或播放页爱心）：层开着就就地重铺，
 * 页数与滚动位置都不跳；层没开则什么都不做 */
function refreshFavLayer() {
  if (!plNow || plNow.kind !== 'fav' || !$('#plLayer').classList.contains('show')) return;
  const top = $('#plLayer').scrollTop;
  openPlaylist(favPlaylist(), 'fav');
  $('#plLayer').scrollTop = top;
}

function openPlaylist(p, kind) {
  const k = kind || 'pl';
  /* 同一份单子重开（比如刚存进我的歌单）保住已经取到的页数，换一份就从第一页重新取 */
  const keep = plNow && plNow.id === p.id ? plShown : 0;
  plNow = Object.assign({}, p, { kind: k, src: k === 'rank' ? p.source : null });
  plShown = Math.min(keep || PL_PAGE_SIZE, plAllTracks().length);
  plLoading = false;
  plLoadFailed = false;
  const tracks = plAllTracks();
  const playable = tracks.filter((s) => supports(s.source));

  $('#plCrumb').textContent = PLD_CRUMB[k];
  $('#plBack').setAttribute('aria-label', PLD_LABELS.back);

  /* 右上角这颗：本地歌单没有「把它存进我的歌单」这回事（它本来就在里面），换成删除；
   * 内置的「我喜欢」两头都不沾（存自己没意义、也删不掉），整位留空但占位，标题仍居中 */
  const favBtn = $('#plFavBtn');
  favBtn.hidden = false;
  if (k === 'fav') {
    favBtn.classList.remove('on', 'err');
    favBtn.style.visibility = 'hidden';
    favBtn.removeAttribute('aria-label');
    favBtn.onclick = null;
  } else {
    const liked = state.favPl.has(plNow.id);
    favBtn.style.visibility = '';
    favBtn.classList.toggle('on', liked && k !== 'local');
    favBtn.classList.toggle('err', k === 'local');
    favBtn.innerHTML = `<svg class="ic"><use href="#${k === 'local' ? 'i-trash' : liked ? 'i-heart-fill' : 'i-heart'}"/></svg>`;
    favBtn.setAttribute('aria-label',
      k === 'local' ? PLD_LABELS.deleteList
        : k === 'rank' ? (liked ? PLD_LABELS.unfavBoard : PLD_LABELS.favBoard)
          : (liked ? PLD_LABELS.unfav : PLD_LABELS.fav));
    favBtn.onclick = () => (k === 'local' ? askDeleteList() : togglePlFav(liked, p));
  }

  const hero = $('#plHero');
  hero.innerHTML = '';
  /* 「我喜欢」沿用点位卡那张心形渐变块（入口用图标不用照片），一进详情就认得出 */
  hero.appendChild(k === 'rank' ? chartArt(plNow)
    : k === 'fav' ? artIcon(plNow.seed, 'i-heart-fill', '20px')
      : listCover(plNow, '20px', 340));
  const body = el('div', 'ph-body');
  body.appendChild(el('h3', '', plNow.name));
  body.appendChild(el('div', 'ph-sub', plNow.desc || plNow.author || ''));
  const meta = el('div', 'ph-meta');
  const tag = el('span', 'q-tag');
  if (k === 'rank') {
    tag.textContent = SOURCES[plNow.src].label;
    tag.style.setProperty('--tint', SOURCES[plNow.src].tint);
    meta.appendChild(tag);
  } else if (!tracks.length && plNow.home) {
    /* 一首都没定位到时，「0/0 首可播」是废话，只回显这份单子来自哪个平台 */
    tag.textContent = SOURCES[plNow.home].label;
    tag.style.setProperty('--tint', SOURCES[plNow.home].tint);
    meta.appendChild(tag);
  } else if (k === 'fav' && !tracks.length) {
    /* 空收藏报「0/0 首可播」同样没意义，直接说明现在是空的 */
    tag.textContent = '还没有收藏';
    meta.appendChild(tag);
  } else {
    tag.textContent = `${playable.length}/${tracks.length} 首可播`;
    meta.appendChild(tag);
    if (plNow.plays) meta.appendChild(el('span', '', plNow.plays + '播放'));
    if (plNow.cats) plNow.cats.forEach((c) => meta.appendChild(el('span', '', '#' + c)));
  }
  body.appendChild(meta);
  hero.appendChild(body);

  const [c1, c2] = palette(plNow.seed);
  $('#plBg').style.background = `linear-gradient(140deg,${c1},${c2})`;

  const acts = $('#plActions');
  acts.innerHTML = '';
  const all = el('button', 'ghost-btn solid', `<svg class="ic"><use href="#i-play"/></svg>播放全部 ${playable.length} 首`);
  all.onclick = () => (playable[0] ? play(playable[0], playable) : toast(PLD_TOAST.playAllEmpty));
  acts.appendChild(all);
  const shuf = el('button', 'icon-btn', '<svg class="ic"><use href="#i-shuffle"/></svg>');
  shuf.setAttribute('aria-label', PLD_LABELS.shuffle);
  shuf.onclick = () => {
    if (!playable.length) { toast(PLD_TOAST.playAllEmpty); return; }
    const r = playable[Math.floor(Math.random() * playable.length)];
    play(r, playable);
    openLayer(player());
  };
  acts.appendChild(shuf);

  $('#plFoot').innerHTML = '';
  $('#plFoot').appendChild(el('span', 'foot-mark'));
  $('#plFoot').appendChild(el('span', '', PLD_FOOT[k]));

  renderPlTracks();
  openLayer($('#plLayer'));
  $('#plLayer').scrollTop = 0;
}

/* 列表本体：只铺到 plShown，底部按需挂一条状态行 */
function renderPlTracks() {
  const box = $('#plTracks');
  box.innerHTML = '';
  const tracks = plAllTracks();
  const playable = tracks.filter((s) => supports(s.source));
  if (!tracks.length) {
    /* missing = 没定位到这份单子（真实侧是取数/读库失败），与「单子真的是空的」分开说；
     * 「我喜欢」空态再单独一档：怎么往里收，就写在原地 */
    box.appendChild(el('div', 'empty-tip',
      plNow.missing ? PLD_EMPTY.error
        : plNow.kind === 'fav' ? PLD_EMPTY.fav
          : plNow.kind === 'local' && !plNow.home ? PLD_EMPTY.local : PLD_EMPTY.end));
    return;
  }
  tracks.slice(0, plShown).forEach((s, i) => box.appendChild(songRow(s, i + 1, playable)));
  if (plShown < tracks.length && (plLoading || plLoadFailed)) box.appendChild(plStatusRow());
  else if (plShown >= tracks.length) box.appendChild(plEndRow());
}

/* 底部状态行：载入中 = 灰字不可点；这一批没载入 = 可点重试 */
function plStatusRow() {
  const r = el('button', 'pl-status', plLoadFailed ? PLD_STATUS.retry : '');
  r.disabled = plLoading;
  if (!plLoadFailed) { r.appendChild(el('i', 'spin')); r.appendChild(el('span', '', PLD_STATUS.loading)); }
  r.onclick = () => loadPlPage();
  return r;
}

function loadPlPage() {
  if (plLoading || !plNow) return;
  if (plShown >= plAllTracks().length) return;
  const page = Math.floor(plShown / PL_PAGE_SIZE) + 1;
  plLoading = true;
  plLoadFailed = false;
  renderPlTracks();
  setTimeout(() => {
    plLoading = false;
    if (!plNow) return;
    if (page === 3 && !plFailedPages.has(plNow.id)) {
      plFailedPages.add(plNow.id);
      plLoadFailed = true;  // 停在原地，底部换成「点击重试」
      renderPlTracks();
      return;
    }
    plShown = Math.min(plAllTracks().length, plShown + PL_PAGE_SIZE);
    renderPlTracks();
  }, 500);
}

/* 滚到底附近就自动取下一页 */
function plLayerScroll() {
  if (!plNow) return;
  const layer = $('#plLayer');
  if (plShown >= plAllTracks().length) return;
  if (layer.scrollTop + layer.clientHeight > layer.scrollHeight - 140) loadPlPage();
}

function togglePlFav(liked, origin) {
  const board = plNow.kind === 'rank';
  if (liked) {
    state.favPl.delete(plNow.id);
    toast(PLD_TOAST.favRemoved);
  } else {
    state.favPl.add(plNow.id);
    toast(board ? PLD_TOAST.boardSaving : PLD_TOAST.favSaving);
  }
  /* 重开同一份单子刷新右上角那颗的状态（openPlaylist 里已按 id 保住已取到的页数） */
  openPlaylist(origin ?? plNow, plNow.kind);
  if (!$('#page-mine').hidden) renderMinePage();
}

/* 删本地歌单：必过二次确认，正文如实说清连带删掉的是歌目记录 */
function askDeleteList() {
  const name = plNow.name;
  askConfirm({
    title: `要删掉「${name}」吗`,
    body: '删除后，这份歌单与它列出的歌目记录会一并从这台设备移除 · 歌曲文件本身不受影响，其它端的收藏也不受影响。',
    okLabel: '删除歌单',
    onOk: () => {
      const i = MY_PLAYLISTS.findIndex((x) => x.id === plNow.id);
      if (i >= 0) MY_PLAYLISTS.splice(i, 1);
      closePlLayer();
      renderPlaylistPage();
      renderMinePage();
      toast(PLD_TOAST.deleted(name));
    },
  });
}

function closePlLayer() {
  closeLayer($('#plLayer'));
  plNow = null;
}

/* ============ 用歌单 ID 打开 ============ */
/* 分享链接里那串数字就是用户认识的「歌单 ID」，所以两种输入都收：整条链接 / 只有号 */
const pidOf = (raw) => {
  const m = String(raw).match(/\d{5,}/g);
  return m ? m.sort((a, b) => b.length - a.length)[0] : '';
};

/* 真实侧取歌单必须有平台坐标（getListDetail(id, source, page)）：链接能按域名认出来，
 * 光一串号认不出来 —— 所以裸 ID 必须先点平台，不允许默认猜一个（对应 NEW_UI_SHEET_PL_ID.err.needPlatform） */
const PL_ID_DOMAINS = [['kw', /kuwo\./i], ['kg', /kugou\./i], ['tx', /y\.qq\.|qq\.com/i], ['wy', /163\.com/i], ['mg', /migu/i]];
const PLID = {
  groupPlatform: '只填 ID 时需先选择这份歌单来自哪个平台',
  err: {
    empty: '粘贴一条分享链接，或填写歌单 ID',
    needPlatform: '请先选择这份歌单来自哪个平台 · 仅凭一串 ID 判断不了来源',
    unknownDomain: '这条链接不属于酷我 / 酷狗 / QQ音乐 / 网易云 / 咪咕 · 当前只识别这五家',
    badId: '这串 ID 格式不正确 · 应为数字或字母数字组合，中间不含空格',
  },
  opened: (short) => `已在${short}打开这份歌单 · 曲目稍后从平台逐首取回`,
};
/* 各平台 ID 有纯数字也有字母数字（见 SOURCES.idExample），所以只拦「带空格 / 带符号 / 短得不像话」 */
const bareIdOf = (raw) => (/^[\w-]{5,}$/.test(raw) ? raw : '');

let plIdPlat = null;   /* 每次开浮层都清空，不带上一次的记忆 */

function plIdError(msg) {
  const box = $('#plIdErr');
  box.textContent = msg;
  box.hidden = false;
}

function renderPlIdPlats() {
  const box = $('#plIdPlats');
  box.innerHTML = '';
  Object.keys(SOURCES).forEach((p) => {
    const c = el('button', 'chip' + (plIdPlat === p ? ' on' : ''), SOURCES[p].label);
    c.setAttribute('aria-pressed', plIdPlat === p ? 'true' : 'false');
    c.onclick = () => { plIdPlat = plIdPlat === p ? null : p; renderPlIdPlats(); };
    box.appendChild(c);
  });
}

function renderPlIdSamples() {
  const box = $('#plIdSamples');
  box.innerHTML = '';
  PLAYLISTS.slice(0, 4).forEach((p) => {
    const c = el('button', 'chip', `${SOURCES[p.home].short} <b>${p.pid}</b>`);
    c.onclick = () => { $('#plIdInput').value = p.pid; plIdPlat = p.home; tryOpenByPid(); };
    box.appendChild(c);
  });
}

function openPlIdSheet() {
  $('#plIdInput').value = '';
  $('#plIdErr').hidden = true;
  plIdPlat = null;
  renderPlIdPlats();
  renderPlIdSamples();
  openLayer($('#plIdSheet'));
  setTimeout(() => $('#plIdInput').focus(), 260);
}

function tryOpenByPid() {
  const raw = $('#plIdInput').value.trim();
  if (!raw) return plIdError(PLID.err.empty);
  let plat = plIdPlat, pid;
  if (/https?:|\/\/|www\./i.test(raw)) {
    const hit = PL_ID_DOMAINS.find(([, re]) => re.test(raw));
    if (!hit) return plIdError(PLID.err.unknownDomain);
    plat = hit[0];
    /* 域名认得出、链接里却没截到号：这一支不在这里报错，取不到由详情层的空态如实承担 */
    pid = pidOf(raw);
  } else {
    if (!plat) return plIdError(PLID.err.needPlatform);
    pid = bareIdOf(raw);
    if (!pid) return plIdError(PLID.err.badId);
  }
  const p = PLAYLISTS.find((x) => x.pid === pid && x.home === plat)
    ?? { id: `${plat}-pid-${pid || 'unknown'}`, home: plat, pid, name: pid ? `歌单 ${pid}` : '刚打开的歌单',
      seed: `pid-${pid || 'unknown'}`, tracks: [], missing: true };
  closeLayer($('#plIdSheet'));
  openPlaylist(p, 'pl');
  /* 此刻一首歌都还没取回来，所以 toast 不报数量（原型旧句「N/M 首现在能播」是 mock 逐首比出来的，真实侧拿不到） */
  toast(PLID.opened(SOURCES[plat].short));
}

/* ============ 我的页 ============ */
const NICK_DEFAULT = BRAND;
const NICK_PICKS = [BRAND, '深夜电台', '阿野', 'Loop', '听什么都能'];
const nickInitial = () => (Array.from(state.name.trim())[0] || NICK_DEFAULT).toUpperCase();

function renderProfile() {
  $('#mineName').textContent = state.name;
  $('#mineArt').innerHTML = `<b>${nickInitial()}</b>`;
  $('#topAvatar').textContent = nickInitial();
}

function openNameSheet() {
  $('#nameInput').value = state.name;
  $('#nameErr').hidden = true;
  const box = $('#namePicks');
  box.innerHTML = '';
  NICK_PICKS.forEach((n) => {
    const c = el('button', 'chip', n);
    c.onclick = () => saveNick(n);
    box.appendChild(c);
  });
  openLayer($('#nameSheet'));
  $('#nameInput').focus();
}

function saveNick(raw) {
  const v = String(raw == null ? $('#nameInput').value : raw).trim().replace(/\s+/g, ' ').slice(0, 12);
  const err = $('#nameErr');
  if (!v) {
    err.textContent = '请先填写名称 · 单个汉字也可以';
    err.hidden = false;
    $('#nameInput').focus();
    return;
  }
  if (v === state.name) { closeLayer($('#nameSheet')); return; }
  state.name = v;
  lsSave({ name: v });
  err.hidden = true;
  closeLayer($('#nameSheet'));
  renderProfile();
  toast(`昵称已更新为「${v}」· 头像取首字「${nickInitial()}」`);
}

function renderMinePage() {
  renderProfile();

  const stats = $('#statRow');
  stats.innerHTML = '';
  [
    { n: state.fav.size, l: '喜欢' },
    { n: MY_PLAYLISTS.length + state.favPl.size, l: '歌单' },
    { n: state.history.length, l: '最近播放' },
  ].forEach((s) => stats.appendChild(el('div', 'stat', `<b>${s.n}</b><span>${s.l}</span>`)));

  const fav = $('#favCard');
  fav.innerHTML = '';
  fav.appendChild(el('span', 'fc-art', '<svg class="ic"><use href="#i-heart-fill"/></svg>'));
  const liked = [...state.fav].map(songById);
  const fb = el('div', 'fc-body');
  fb.appendChild(el('h3', '', '我喜欢'));
  fb.appendChild(el('p', '', liked.length ? `${liked.length} 首 · ${liked.slice(0, 3).map((s) => s.title).join(' · ')}` : '还没有收藏 · 点歌曲右侧的爱心'));
  fav.appendChild(fb);
  /* 整卡进详情（「我喜欢」是一份内置歌单，点开就是收藏列表）；小圆钮单独管「直接开播」，
   * 点圆钮不跳页 —— 两者意图不同，各自一个落点 */
  const favGo = el('button', 'fc-go', '<svg class="ic"><use href="#i-play"/></svg>');
  favGo.setAttribute('aria-label', '播放收藏');
  favGo.onclick = (e) => {
    e.stopPropagation();
    const can = liked.filter((s) => supports(s.source));
    if (!can.length) { toast(liked.length ? '收藏里的歌曲在当前音源下均不可播 · 换个音源试试' : '还没有收藏 · 点歌曲右侧的爱心'); return; }
    play(can[0], can);
    openLayer(player());
  };
  fav.appendChild(favGo);
  fav.setAttribute('role', 'button');
  fav.setAttribute('aria-label', '打开「我喜欢」');
  fav.onclick = () => openPlaylist(favPlaylist(), 'fav');

  const rec = $('#mineRecent');
  rec.innerHTML = '';
  $('#recentClear').hidden = !state.history.length;
  if (!state.history.length) rec.appendChild(el('div', 'empty-tip', '暂无播放记录'));
  state.history.map(songById).forEach((s, i) => rec.appendChild(songRow(s, i + 1, state.history.map(songById))));
  $('#recentClear').onclick = clearRecent;

  const grid = $('#minePlGrid');
  grid.innerHTML = '';
  const collected = collectedPlaylists();
  MY_PLAYLISTS.forEach((p) => grid.appendChild(plCardMine(p)));
  collected.forEach((p) => grid.appendChild(plCardCollected(p)));
  $('#minePlEmpty').hidden = grid.hidden = MY_PLAYLISTS.length + collected.length > 0;
}

/* 自建歌单卡：没有平台坐标，封面位就是内置版式（不画一张随机图冒充平台封面） */
function plCardMine(p) {
  const card = el('button', 'pl-card');
  card.appendChild(listCover(p, null, 340));
  card.appendChild(el('div', 'pt', p.name));
  const tracks = p.tracks.map(songById);
  const can = tracks.filter((s) => supports(s.source)).length;
  const meta = el('div', 'ps');
  meta.style.setProperty('--tint', palette(p.seed)[0]);
  meta.innerHTML = `<i class="src-dot"></i>${p.tracks.length} 首 · ${can} 首可播`;
  card.appendChild(meta);
  card.onclick = () => openPlaylist(p, 'local');
  return card;
}

/* 收藏来的平台歌单卡：封面用平台那张真图（与【歌单】页 plCard 同一套写法），
 * 副行说清它是从哪家收藏来的 —— 它是只读的，卡面不与自建的去比曲目数谁多 */
function plCardCollected(p) {
  const card = el('button', 'pl-card');
  const a = listCover(p, null, 340);
  a.appendChild(el('span', 'play-badge', '<svg class="ic"><use href="#i-play"/></svg>'));
  card.appendChild(a);
  card.appendChild(el('div', 'pt', p.name));
  const meta = el('div', 'ps');
  meta.style.setProperty('--tint', SOURCES[p.home].tint);
  meta.innerHTML = `<i class="src-dot"></i>收藏自 ${SOURCES[p.home].short} · ${p.tracks.length} 首`;
  card.appendChild(meta);
  card.onclick = () => openPlaylist(p, 'pl');
  return card;
}

/* ============ 新建歌单（#createSheet） ============
 * 原型旧版没有建单流程（MY_PLAYLISTS 是写死的 4 张）；校验规则与旧屏 ListNameEdit 一致：
 * 空名不建、超 100 字截断、同名先问一句再建 */
const CREATE_NAME_MAX = 100;
const CREATE_TXT = {
  errEmpty: '请先填写歌单名称 · 单个汉字也可以',
  dupConfirm: '已存在同名歌单 · 确认继续创建？',
  busy: '创建中',
  created: (name) => `歌单「${name}」已创建`,
};

function createListError(msg) {
  const box = $('#createErr');
  box.textContent = msg;
  box.hidden = false;
}

function openCreateSheet() {
  $('#createName').value = '';
  $('#createErr').hidden = true;
  openLayer($('#createSheet'));
  setTimeout(() => $('#createName').focus(), 260);
}

function submitCreateList() {
  const name = $('#createName').value.trim().slice(0, CREATE_NAME_MAX);
  if (!name) return createListError(CREATE_TXT.errEmpty);
  $('#createErr').hidden = true;
  if (MY_PLAYLISTS.some((p) => p.name === name)) {
    return askConfirm({ title: '同名歌单', body: CREATE_TXT.dupConfirm, okLabel: '继续建', onOk: () => doCreate(name) });
  }
  doCreate(name);
}

/* 落库在真实侧是异步的（core/list 的 createList），按钮先亮「创建中」再回主线程 */
function doCreate(name) {
  const go = $('#createGo');
  go.disabled = true;
  go.textContent = CREATE_TXT.busy;
  setTimeout(() => {
    go.disabled = false;
    go.textContent = '创建';
    MY_PLAYLISTS.push({
      id: 'u' + Date.now().toString(36), name, seed: 'u-' + name,
      desc: '还没有歌曲 · 点歌曲右侧的 ⋯ 添加', cats: [], tracks: [],
    });
    closeLayer($('#createSheet'));
    renderMinePage();
    renderPlaylistPage();
    toast(CREATE_TXT.created(name));
  }, 320);
}

/* ============ 设定页（第 5 个 Tab） ============
 * 所有「在本机生效」的开关集中在这里，我的页只留内容本身 */
const refreshSettings = () => renderSettings();

function cycleLoop() {
  state.loop = LOOP_ORDER[(LOOP_ORDER.indexOf(state.loop) + 1) % LOOP_ORDER.length];
  lsSave({ loop: state.loop });
  paintLoop();
  toast('循环模式 · ' + LOOP_NAME[state.loop]);
}

function setGroup(label, rows) {
  const g = el('div', 'set-group');
  g.appendChild(el('div', 'sg-label', label));
  const list = el('div', 'set-list');
  rows.forEach((r) => list.appendChild(r));
  g.appendChild(list);
  return g;
}

function setRow(icon, label, hint, value, onclick) {
  const r = el('button', 'set-row');
  r.innerHTML = `<span class="set-ic"><svg class="ic"><use href="#${icon}"/></svg></span>
    <span class="st-l"><b>${label}</b>${hint ? `<em>${hint}</em>` : ''}</span>
    <span class="st-r">${value || ''}<svg class="ic"><use href="#i-chevron"/></svg></span>`;
  r.onclick = onclick;
  return r;
}

function setToggle(icon, label, hint, isOn, onclick) {
  const r = el('button', 'set-row' + (isOn ? ' on' : ''));
  r.innerHTML = `<span class="set-ic"><svg class="ic"><use href="#${icon}"/></svg></span>
    <span class="st-l"><b>${label}</b>${hint ? `<em>${hint}</em>` : ''}</span>
    <span class="toggle${isOn ? ' on' : ''}"><i></i></span>`;
  r.onclick = onclick;
  return r;
}

function renderSettings() {
  const box = $('#setBody');
  box.innerHTML = '';
  $('#setSub').innerHTML = `这里的开关只作用于这台设备 · 不影响曲库内容，也不上传任何数据`;

  /* 播放 / 歌词 / 音源三组不在这里重复：音质与循环和浮窗的开关各自就在它的现场
   * （音源浮层、播放页），设定页再列一遍就会出「两处显示不一致」 */
  const themeRow = (key, label, hint) => {
    const on = state.theme === key;
    const r = el('button', 'set-row' + (on ? ' on' : ''));
    r.innerHTML = `<span class="set-ic"><svg class="ic"><use href="#${THEME_ICON[key]}"/></svg></span>
      <span class="st-l"><b>${label}</b><em>${hint}</em></span>
      <span class="st-r${on ? ' hi' : ''}">${on ? '在用' : ''}<svg class="ic"><use href="#i-chevron"/></svg></span>`;
    r.onclick = () => { setTheme(key); };
    return r;
  };
  box.appendChild(setGroup('外观', [
    themeRow('light', '明亮', '浅底深字，亮处更清晰'),
    themeRow('dark', '黑暗', '深底亮字，暗处不刺眼'),
    themeRow('system', '跟随系统', '随手机的深浅色自动切换'),
  ]));

  box.appendChild(setGroup('数据与缓存', [
    setRow('i-list', '清除缓存', cacheHint(), cacheValue(), askClearCache),
    setRow('i-user', '清空播放记录', `${state.history.length} 条在本机的收听历史`, state.history.length ? `${state.history.length} 条` : '已清空', () => {
      clearRecent();
      renderSettings();
    }),
  ]));

  box.appendChild(setGroup('关于', [
    /* 出处写在明面上：这一版的播放、音源、曲库取数全部来自 lx-music-mobile，
       版本号也沿用它（package.json 的 version），界面上的改动不冒充新项目 */
    setInfo('i-heart', `${BRAND} · ${BRAND_SUB}`, '内核由 lx-music-mobile 原作者与社区维护', APP_VERSION),
  ]));
}

/* —— 外观：明亮 / 黑暗 / 跟随系统 ——
 * 原型基线是深色一套；light 覆盖层取自本项目 newui/theme 的 light token（同一份色值，不另造）。
 * 「跟随系统」在浏览器里就是跟随系统的 prefers-color-scheme，与手机上的行为同构 */
const THEME_ICON = { light: 'i-sun', dark: 'i-moon', system: 'i-phone' };
const systemDark = () => matchMedia('(prefers-color-scheme: dark)').matches;
const isDark = () => state.theme === 'dark' || (state.theme === 'system' && systemDark());

function setTheme(mode) {
  state.theme = mode;
  applyTheme();
  toast('外观 · ' + { light: '明亮', dark: '黑暗', system: '跟随系统' }[mode]);
}

function applyTheme() {
  $('#phone').classList.toggle('light', !isDark());
  refreshSettings();
}

matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (state.theme === 'system') applyTheme(); });

/* —— 缓存：数字来自真实统计，统计中/失败都如实回显，清除前先问一句 —— */
let cacheState = 'counting';   // counting | ready | failed
let cacheBytes = 0;

const fmtSize = (n) => n >= 1024 * 1024 ? (n / 1024 / 1024).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
const cacheValue = () => cacheState === 'counting' ? '正在统计…' : cacheState === 'failed' ? '暂时无法统计' : fmtSize(cacheBytes);
const cacheHint = () => '清除收听过程中产生的缓存 · 收藏、歌单与播放记录不受影响';

/* 原型不落地存储，用「听过的歌 × 每首约 4 MB」演算一份会变动的数，
 * 至少这个数字是跟着本机行为走的，不是写死在界面上的假数 */
const recountCache = () => {
  cacheState = 'counting';
  renderSettings();
  setTimeout(() => {
    cacheState = 'ready';
    cacheBytes = state.history.length * 4 * 1024 * 1024;
    renderSettings();
  }, 500);
};

function askClearCache() {
  if (cacheState === 'clearing') return;
  askConfirm({
    body: '将清除这台设备上的播放缓存 · 之后收听会重新产生，不影响收藏、歌单与播放记录。',
    okLabel: '清除',
    onOk: () => {
      cacheState = 'clearing';
      renderSettings();
      setTimeout(() => {
        cacheBytes = 0;
        toast('缓存已清除 · 收藏、歌单与播放记录保持不变');
        recountCache();
      }, 600);
    },
  });
}

/* 二次确认：本机数据删得回来吗？删之前问一句（清除缓存 / 删除歌单 / 收藏整榜共用） */
function askConfirm({ title = '要执行这一步吗', body, okLabel = '确定', onOk }) {
  const layer = $('#confirmSheet');
  $('#cfTitle').textContent = title;
  $('#cfBody').textContent = body;
  $('#cfOk').textContent = okLabel;
  $('#cfOk').onclick = () => { closeLayer(layer); onOk(); };
  openLayer(layer);
}

function setInfo(icon, label, hint, value) {
  const r = el('div', 'set-row info');
  r.innerHTML = `<span class="set-ic"><svg class="ic"><use href="#${icon}"/></svg></span>
    <span class="st-l"><b>${label}</b>${hint ? `<em>${hint}</em>` : ''}</span>
    ${value ? `<span class="st-r">${value}</span>` : ''}`;
  return r;
}

/* ============ 歌曲「⋯」操作面板 ============ */
let moreSong = null;

const MORE_TXT = {
  /* 加入候选的范围说明：收藏来的平台单子是只读的，写不进去，所以名单只有自建 */
  addGroup: '加入自建歌单',
  addEmpty: '还没有自建歌单 · 先去「我的」新建一份',
  remove: (name) => `从「${name}」移出`,
  removed: (list, title) => `已把「${title}」从「${list}」移出 · 歌还在这台设备的曲库里`,
};

function openMore(s, queue) {
  moreSong = s;
  const head = $('#moreSong');
  head.innerHTML = '';
  head.appendChild(coverArt(coverSeedOf(s), '11px', 120));
  const body = el('div', 'ms-body');
  body.appendChild(el('div', 'ms-t', s.title));
  const sub = el('div', 'ms-s');
  sub.style.display = 'flex';
  sub.style.alignItems = 'center';
  sub.style.gap = '6px';
  const badge = el('span', 'src-badge', SOURCES[s.source].short);
  badge.style.setProperty('--tint', SOURCES[s.source].tint);
  sub.appendChild(badge);
  sub.appendChild(el('span', '', `${s.artist} · ${s.album}`));
  body.appendChild(sub);
  head.appendChild(body);

  const list = $('#moreActions');
  list.innerHTML = '';
  const liked = state.fav.has(s.id);
  list.appendChild(actRow(liked ? 'i-heart-fill' : 'i-heart', liked ? '取消收藏' : '收藏到「我喜欢」', () => {
    liked ? state.fav.delete(s.id) : state.fav.add(s.id);
    paintFav();
    closeLayer($('#moreSheet'));
    renderMinePage();
    refreshFavLayer();
    toast(liked ? '已取消收藏' : '已收藏到「我喜欢」');
  }));
  const q = queue || queueOf();
  const i = q.findIndex((x) => x.id === state.song?.id);
  list.appendChild(actRow('i-next', '下一曲播放', () => {
    const nq = q.slice();
    nq.splice(i + 1, 0, s);
    state.queue = nq;
    closeLayer($('#moreSheet'));
    toast(`已把「${s.title}」排在当前这首之后`);
  }));
  /* 自建歌单详情层里的这首歌，除了「再加入」还得能「从这里移出去」：
   * 移掉的只是这张单子在本地列出的那条歌目记录，歌本身、别的单子、平台端的收藏都不动 */
  const host = (plNow && plNow.kind === 'local') ? MY_PLAYLISTS.find((p) => p.id === plNow.id) : null;
  if (host && host.tracks.includes(s.id)) {
    const row = actRow('i-close', MORE_TXT.remove(host.name), () => {
      host.tracks.splice(host.tracks.indexOf(s.id), 1);
      closeLayer($('#moreSheet'));
      /* 原地重铺这一层并保住滚动位置：刚移完就被弹回顶部，等于没让人接着往下挑 */
      const top = $('#plLayer').scrollTop;
      openPlaylist(host, 'local');
      $('#plLayer').scrollTop = top;
      if (!$('#page-mine').hidden) renderMinePage();
      if (!$('#page-playlist').hidden) renderPlaylistPage();
      toast(MORE_TXT.removed(host.name, s.title));
    });
    row.classList.add('warn');
    list.appendChild(row);
  }

  /* 加入候选只有自建歌单（addablePlaylists）：收藏来的那份挂在平台侧，往里塞歌平台不认，
   * 所以它根本不出现在这份名单里，范围就写在名单上方一句 */
  const addable = addablePlaylists();
  if (addable.length) {
    list.appendChild(el('div', 'group-label', MORE_TXT.addGroup));
    addable.forEach((p) => list.appendChild(actRow('i-plus', `加入「${p.name}」`, () => {
      if (p.tracks.includes(s.id)) { toast('已经在这份歌单里了'); return; }
      p.tracks.push(s.id);
      closeLayer($('#moreSheet'));
      if (!$('#page-mine').hidden) renderMinePage();
      if (!$('#page-playlist').hidden) renderPlaylistPage();
      toast(`已加入「${p.name}」`);   /* 两句反馈都不带计数：真实侧计数在异步写库之后才更新，按下瞬间报出的数不可信 */
    })));
  } else {
    list.appendChild(el('div', 'q-note', MORE_TXT.addEmpty));
  }
  openLayer($('#moreSheet'));
}

function actRow(icon, label, onclick) {
  const r = el('button', 'opt-row');
  r.innerHTML = `<span class="opt-ic"><svg class="ic"><use href="#${icon}"/></svg></span>
    <span class="or-body"><b>${label}</b></span>`;
  r.onclick = () => onclick();
  return r;
}

/* ============ 歌手 ============
 * 没有歌手主页可去：点一张头像 = 把当前这张榜里他/她的歌排成队列播起来，
 * 榜里一首都对不上就明说（原型一排 8 个，与 RN ARTIST_LIMIT 同量） */
const ARTIST_LIMIT = 8;

function renderArtists() {
  const box = $('#artistRow');
  box.innerHTML = '';
  ARTISTS.slice(0, ARTIST_LIMIT).forEach((a) => {
    const c = el('button', 'artist-card');
    c.appendChild(faceArt(a.seed, '50%'));
    c.appendChild(el('span', '', a.name));
    c.onclick = () => {
      const list = currentSongs().filter((s) => s.artist.includes(a.name) || a.name.includes(s.artist));
      if (!list.length) { toast('歌手主页建设中 · 先播放这张榜里 TA 的歌曲'); return; }
      const ok = list.filter((s) => supports(s.source));
      if (!ok.length) { toast('这几首在当前音源下不可播 · 换个音源或换几首'); return; }
      play(ok[0], ok);
    };
    box.appendChild(c);
  });
}

/* ============ 电台 ============ */
function renderRadio() {
  const box = $('#radioGrid');
  box.innerHTML = '';
  RADIO.forEach((r) => {
    const c = el('button', 'radio-card');
    const bg = coverArt(r.seed, null, 340, 220);
    bg.classList.add('bgart');
    c.appendChild(bg);
    c.appendChild(el('span', '', `<svg class="ic-top"><use href="#${r.kind === 'fm' ? 'i-wave' : 'i-heart'}"/></svg>`));
    c.appendChild(el('h4', '', r.title));
    c.appendChild(el('p', '', r.sub));
    c.appendChild(el('span', 'wip-tag', '建设中'));
    c.onclick = () => toast('电台 · 建设中');
    box.appendChild(c);
  });
}

/* ============ 播放器 ============ */
const state = {
  song: null, playing: false, t: 0, timer: null,
  queue: null,
  history: RECENT.slice(),
  loop: 'listLoop',
  name: NICK_DEFAULT,
  fav: new Set(['s07', 's13']),
  favPl: new Set(['p3']),
  lyric: false,
  floatOn: false,
  sleepLeft: 0,
  sleepPlayed: false,
  sleepPending: false,
  /* 默认外观 = 明亮：主流音乐 App 的出厂默认几乎都是浅色，深色是要用户自己选的夜间模式 */
  theme: 'light',
};

/* 切歌模式五态与循环序照抄项目既有设置 player.togglePlayMethod（config/constant 的
 * MUSIC_TOGGLE_MODE_LIST）：列表循环 → 随机 → 顺序 → 单曲循环 → 播完即停 → 回到列表循环。
 * 工具行只剩图标，五态必须有五个互不相同的轮廓，不能再让三档共用 i-repeat */
const LOOP_ORDER = ['listLoop', 'random', 'list', 'singleLoop', 'none'];
const LOOP_ICON = { listLoop: 'i-repeat', random: 'i-shuffle', list: 'i-repeat-off', singleLoop: 'i-repeat1', none: 'i-stop-after' };
const LOOP_NAME = { listLoop: '列表循环', random: '随机播放', list: '顺序播放', singleLoop: '单曲循环', none: '播完即停' };

if (LS.theme) state.theme = LS.theme;
if (LS.loop && LOOP_ORDER.includes(LS.loop)) state.loop = LS.loop;
if (LS.name) state.name = LS.name;

const player = () => $('#playerLayer');
/* 队列 = 最近一次进入的列表；没有显式队列时回落到首页当前榜单 */
const queueOf = () => (state.queue && state.queue.length ? state.queue : currentSongs());
/* 评论数在真实实现里来自平台接口，原型按曲目 ID 稳定生成 */
const commentTotal = (s) => 1284 + (s ? hash(s.id) % 9000 : 0);

function play(s, queue) {
  if (!supports(s.source)) {
    toast(`当前音源不支持${SOURCES[s.source].label} · 换一首或换个音源`);
    return;
  }
  const isNew = state.song?.id !== s.id;
  if (queue !== undefined) state.queue = queue && queue.length ? queue : null;
  state.song = s;
  state.playing = true;
  if (isNew) {
    state.t = 0;
    renderLyric();
    state.history = [s.id, ...state.history.filter((id) => id !== s.id)].slice(0, 30);
  }
  paintPlayer();
  startTimer();
  syncLists();
  $('#minibar').classList.add('show');
}

/* 播放状态变化后只重绘受影响的列表，避免整页重排导致滚动跳动 */
function syncLists() {
  renderSongs();
  renderRecent();
  if (!$('#page-rank').hidden) renderRankPage();
  if (!$('#page-mine').hidden) renderMinePage();
  syncPlLayer();
  /* 搜索结果里的行也在播同一批歌，重画但要保住滚动位置 */
  if ($('#searchLayer').classList.contains('show')) {
    const y = $('#searchBody').scrollTop;
    renderSearch();
    $('#searchBody').scrollTop = y;
  }
}

function syncPlLayer() {
  if (!plNow || !$('#plLayer').classList.contains('show')) return;
  const tracks = plAllTracks();
  const playable = tracks.filter((s) => supports(s.source));
  renderPlTracks();
  if (plNow.kind !== 'rank') {
    const tag = $('#plHero .q-tag');
    /* 与 openPlaylist 的口径一致：空收藏说「0/0 首可播」没意义 */
    if (tag) tag.textContent = plNow.kind === 'fav' && !tracks.length ? '还没有收藏' : `${playable.length}/${tracks.length} 首可播`;
  }
  const all = $('#plActions .ghost-btn');
  if (all) {
    all.innerHTML = `<svg class="ic"><use href="#i-play"/></svg>播放全部 ${playable.length} 首`;
    all.onclick = () => (playable[0] ? play(playable[0], playable) : toast(PLD_TOAST.playAllEmpty));
  }
}

function toggle() {
  if (!state.song) return;
  state.playing = !state.playing;
  state.playing ? startTimer() : stopTimer();
  paintPlayer();
  renderSongs();
}

const startTimer = () => { if (!state.timer) state.timer = setInterval(tick, 1000); };
const stopTimer = () => { clearInterval(state.timer); state.timer = null; };

function tick() {
  state.t += 1;
  if (state.sleepLeft > 0) {
    state.sleepLeft -= 1;
    if (state.sleepLeft === 0) {
      if (state.sleepPlayed) {
        /* 等当前这首放完再停：到点不切歌，走到曲目末尾时由下面那段收尾 */
        state.sleepPending = true;
        toast('定时已到点 · 等这首放完就停');
      } else {
        state.playing = false;
        stopTimer();
        paintPlayer();
        toast('定时停止播放已到点 · 已暂停');
        return;
      }
    }
    paintTimerTag();
  }
  if (state.t >= state.song.dur) {
    if (state.sleepPending) {
      state.sleepPending = false;
      state.playing = false;
      stopTimer();
      paintPlayer();
      toast('定时停止播放已到点 · 这首放完已停下');
      return;
    }
    if (state.loop === 'singleLoop') { state.t = 0; }
    else if (state.loop === 'none') { stopAtEdge(); return; }
    else { step(1, true); return; }
  }
  paintProgress();
}

/* 顺序播放走到列表末尾、播完即停放完当前这首：就地停下，不回第一首 */
function stopAtEdge() {
  state.playing = false;
  stopTimer();
  paintPlayer();
  toast(state.loop === 'none' ? '播完即停 · 当前这首放完即停止' : '顺序播放 · 列表播完不再循环');
}

/* 上一曲 / 下一曲：在当前队列内跳转，自动跳过当前音源播不了的曲目 */
function step(dir, auto) {
  const list = queueOf();
  if (!list.length) { toast('当前没有播放中的歌曲'); return; }
  const n = list.length;
  const i = list.findIndex((s) => s.id === state.song?.id);
  let j;
  if (state.loop === 'random') {
    j = Math.floor(Math.random() * n);
  } else {
    j = i < 0 ? 0 : i + dir;
    if (j >= n) {
      if (state.loop !== 'listLoop') { stopAtEdge(); return; }
      j = 0;
    }
    if (j < 0) j = 0;
  }
  for (let k = 0; k < n && !supports(list[j].source); k++) j = (j + dir + n) % n;
  const nextSong = list[j];
  if (!nextSong || !supports(nextSong.source)) {
    if (auto) { state.playing = false; stopTimer(); paintPlayer(); }
    toast(`队列里没有可播的歌曲 · 当前音源覆盖 ${covered()}`);
    return;
  }
  play(nextSong);
}

function seekTo(sec) {
  const s = state.song;
  if (!s) return;
  state.t = Math.max(0, Math.min(s.dur - 1, Math.round(sec)));
  paintProgress();
  syncLyric(true);
}

function paintPlayer() {
  const s = state.song;
  if (!s) return;
  const src = SOURCES[s.source];
  const mi = $('#miniArt');
  mi.innerHTML = '';
  mi.appendChild(coverArt(coverSeedOf(s), '0', 120));
  $('#miniTitle').textContent = s.title;
  $('#miniSub').innerHTML = `<span class="src-badge" style="--tint:${src.tint}">${src.short}</span><span class="q-tag">${QUALITY[playQuality()].label}</span><span class="sep"></span><span>${s.artist}</span>`;
  const icon = state.playing ? 'i-pause' : 'i-play';
  $('#miniPlay').innerHTML = `<svg class="ic"><use href="#${icon}"/></svg>`;
  $('#playerPlay').innerHTML = `<svg class="ic"><use href="#${icon}"/></svg>`;
  $('#playerDisc').innerHTML = '';
  $('#playerDisc').appendChild(coverArt(coverSeedOf(s), '50%', 420));
  $('#playerDisc').classList.toggle('spin-paused', !state.playing);
  $('#playerTitle').textContent = s.title;
  $('#playerArtist').textContent = `${s.artist} — ${s.album}`;
  const [c1, c2] = palette(coverSeedOf(s));
  $('#playerBg').style.background = `linear-gradient(140deg,${c1},${c2})`;
  $('#playerQuality').textContent = qLabel();
  $('#seekDur').textContent = fmt(s.dur);
  const ps = $('#playerSource');
  ps.innerHTML = '';
  const badge = el('span', 'src-badge', src.label);
  badge.style.setProperty('--tint', src.tint);
  ps.appendChild(badge);
  ps.appendChild(el('span', 'q-tag', qLabel()));
  ps.appendChild(el('span', 'ps-from', `来自 ${script().name} 音源`));
  paintFav();
  paintTimerTag();
  paintProgress();
  renderBanners();
}

function paintProgress() {
  const s = state.song;
  if (!s) return;
  const p = Math.min(100, (state.t / s.dur) * 100);
  $('#miniProgressFill').style.width = p + '%';
  $('#seekFill').style.width = p + '%';
  $('#seekKnob').style.left = p + '%';
  $('#seekCur').textContent = fmt(state.t);
  syncLyric();
  syncFloat();
}

/* ============ 收藏 / 循环 / 定时 / 浮窗：全靠图标表达 ============ */
function paintFav() {
  const on = state.song && state.fav.has(state.song.id);
  const b = $('#playerHeart');
  b.classList.toggle('on', !!on);
  b.innerHTML = `<svg class="ic"><use href="#${on ? 'i-heart-fill' : 'i-heart'}"/></svg>`;
  const m = $('#miniHeart');
  m.classList.toggle('on', !!on);
  m.innerHTML = `<svg class="ic"><use href="#${on ? 'i-heart-fill' : 'i-heart'}"/></svg>`;
}

function toggleFav() {
  if (!state.song) return;
  const id = state.song.id;
  state.fav.has(id) ? state.fav.delete(id) : state.fav.add(id);
  paintFav();
  refreshFavLayer();
  toast(state.fav.has(id) ? `已收藏到「我喜欢」（本地 ${state.fav.size} 首）` : '已取消收藏');
}

function paintLoop() {
  const b = $('#btnLoop');
  setIcon(b, LOOP_ICON[state.loop]);
  b.setAttribute('aria-label', `循环模式 · ${LOOP_NAME[state.loop]}`);
}

/* 定时不再有文字角标：开没开看图标，剩多少留给无障碍文案与定时面板本身 */
function sleepSub() {
  return state.sleepLeft > 0
    ? `还剩 ${fmt(state.sleepLeft)}。到点只会停下播放，不清空进度。`
    : '到点只暂停播放 · 进度保留，可随时继续';
}
function paintTimerTag() {
  const on = state.sleepLeft > 0;
  const b = setIcon($('#btnTimer'), on ? 'i-timer-on' : 'i-timer');
  b.setAttribute('aria-label', on ? `定时停止播放 · 还剩 ${fmt(state.sleepLeft)}` : '定时停止播放 · 未开启');
  /* 面板开着的时候倒计时要有地方长出来，否则一秒一秒地走却看不见 */
  if ($('#psTitle').textContent === '定时停止播放') $('#psSub').innerHTML = sleepSub();
}

/* ============ 歌词 ============ */
/* 歌词来自各平台，真实数据里会有「这首歌没有歌词」和「还在取」两种空态，
 * 原型给一首器乐曲演示这个态（data.js 里 lrc:false 的那首） */
const hasLyric = (s) => !!s && s.lrc !== false;

function renderLyric() {
  const box = $('#lyricScroll');
  box.innerHTML = '';
  if (!hasLyric(state.song)) {
    box.appendChild(el('p', 'ln-empty', '这首歌暂时没有歌词 · 或歌词仍在载入'));
    return;
  }
  lyricFor(state.song).forEach((l) => {
    box.appendChild(el('span', 'ln', l.text)).dataset.t = l.t;
  });
  box.appendChild(el('p', 'ln-note', '歌词由各平台提供'));
  syncLyric(true);
}

function syncLyric(force) {
  const box = $('#lyricScroll');
  if (!box.childElementCount || !state.song) return;
  if (state.lyric) {
    /* 上下各留半屏，首尾行才能落到视觉中线；容器尺寸变化后需要重算 */
    const p = Math.round(box.parentElement.clientHeight / 2) + 'px';
    if (box.style.paddingTop !== p) { box.style.paddingTop = p; box.style.paddingBottom = p; }
  }
  const lines = $$('.ln', box);
  let idx = -1;
  lines.forEach((n, i) => { if (state.t >= +n.dataset.t) idx = i; });
  lines.forEach((n, i) => n.classList.toggle('on', i === idx));
  if (state.lyric && idx >= 0) {
    const a = lines[idx];
    const target = a.offsetTop + a.offsetHeight / 2 - box.clientHeight / 2;
    if (force) box.scrollTop = target;
    else box.scrollTo({ top: target, behavior: 'smooth' });
  }
}

/* 歌词与唱片互斥占同一个舞台，切换只由舞台横滑触发（原型原来的【歌词】工具钮已去掉） */
function setLyric(on) {
  state.lyric = on;
  player().classList.toggle('lyric-on', on);
  $('#lyricWrap').hidden = !on;
  $('#discWrap').hidden = on;
  if (on) syncLyric(true);
}

/* ============ LRC 浮窗 ============
 * 浮窗是「应用外/跨页面」的歌词载体，所以全屏播放页打开时自动让位 */
function syncFloat() {
  const f = $('#lrcFloat');
  const show = state.floatOn && !!state.song && !player().classList.contains('show');
  f.hidden = !show;
  if (!show) return;
  const line = $('#lyricScroll .ln.on');
  $('#lfLine').textContent = line ? line.textContent : state.song.title;
  f.style.setProperty('--tint', SOURCES[state.song.source].tint);
}

/* 浮窗开关同样只换图标：开了就把气泡内充上颜色 */
function paintFloatBtn() {
  const b = setIcon($('#btnFloat'), state.floatOn ? 'i-float-on' : 'i-float');
  b.setAttribute('aria-label', state.floatOn ? 'LRC 浮窗 · 已开启' : 'LRC 浮窗 · 未开启');
}

function toggleFloat() {
  state.floatOn = !state.floatOn;
  paintFloatBtn();
  syncFloat();
  toast(state.floatOn ? 'LRC 浮窗已开启 · 可拖动，进入播放页时自动隐藏' : 'LRC 浮窗已关闭');
}

function bindFloatDrag(node) {
  let grab = null, moved = 0;
  node.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.lf-close')) return;
    const z = frameZoom(), r = node.getBoundingClientRect();
    /* 外框被缩放着看时，屏幕像素要换算回逻辑像素 */
    grab = { dx: (e.clientX - r.left) / z, dy: (e.clientY - r.top) / z, sx: e.clientX, sy: e.clientY };
    moved = 0;
    node.setPointerCapture(e.pointerId);
    node.classList.add('drag');
  });
  node.addEventListener('pointermove', (e) => {
    if (!grab) return;
    const z = frameZoom(), h = $('.screen').getBoundingClientRect(), r = node.getBoundingClientRect();
    moved = Math.max(moved, Math.abs(e.clientX - grab.sx) + Math.abs(e.clientY - grab.sy));
    node.style.left = Math.min(Math.max(8, (e.clientX - h.left) / z - grab.dx), h.width / z - r.width / z - 8) + 'px';
    node.style.top = Math.min(Math.max(56, (e.clientY - h.top) / z - grab.dy), h.height / z - r.height / z - 96) + 'px';
  });
  const stop = () => {
    if (!grab) return;
    node.classList.remove('drag');
    const tap = moved < 4;
    grab = null;
    if (tap) { openLayer(player()); syncFloat(); }
  };
  node.addEventListener('pointerup', stop);
  node.addEventListener('pointercancel', stop);
}

/* ============ 拖拽（进度条） ============ */
function bindDragX(node, onRatio) {
  const ratio = (e) => {
    const r = node.getBoundingClientRect();
    return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  };
  node.addEventListener('pointerdown', (e) => {
    node.setPointerCapture(e.pointerId);
    node.classList.add('drag');
    onRatio(ratio(e));
  });
  node.addEventListener('pointermove', (e) => { if (node.classList.contains('drag')) onRatio(ratio(e)); });
  const stop = () => node.classList.remove('drag');
  node.addEventListener('pointerup', stop);
  node.addEventListener('pointercancel', stop);
}

/* 舞台横滑：右滑进歌词 / 左滑回唱片。判据与 newui 的 PlayerStageSwipe 一致 ——
 * 横向位移 ≥ 24pt 且不小于纵向的 1.5 倍才算一次滑动，纵向一律让给歌词自己的滚动 */
const SWIPE_MIN_DX = 24;
const SWIPE_SLOPE = 1.5;
const swipeDir = (dx, dy) =>
  (Math.abs(dx) < SWIPE_MIN_DX || Math.abs(dx) < Math.abs(dy) * SWIPE_SLOPE) ? null : dx > 0 ? 'right' : 'left';

function bindStageSwipe(node) {
  const shown = () => (state.lyric ? $('#lyricWrap') : $('#discWrap'));
  let grab = null;
  node.addEventListener('pointerdown', (e) => {
    grab = { x: e.clientX, y: e.clientY, dx: 0 };
  });
  node.addEventListener('pointermove', (e) => {
    if (!grab) return;
    grab.dx = e.clientX - grab.x;
    const d = swipeDir(grab.dx, e.clientY - grab.y);
    shown().style.transition = 'none';
    shown().style.transform = d ? `translateX(${grab.dx}px)` : '';
  });
  const stop = (e) => {
    if (!grab) return;
    const d = swipeDir(grab.dx, e.clientY - grab.y);
    grab = null;
    const out = shown();
    const w = node.clientWidth;
    const go = d && (d === 'right') !== state.lyric;
    out.style.transition = 'transform .2s var(--ease)';
    out.style.transform = go ? `translateX(${d === 'right' ? -w : w}px)` : '';
    if (!go) return;
    setTimeout(() => {
      setLyric(d === 'right');
      const inn = shown();
      inn.style.transition = 'none';
      inn.style.transform = `translateX(${d === 'right' ? w : -w}px)`;
      requestAnimationFrame(() => {
        inn.style.transition = 'transform .2s var(--ease)';
        inn.style.transform = '';
        out.style.transform = '';
      });
    }, 200);
  };
  node.addEventListener('pointerup', stop);
  node.addEventListener('pointercancel', stop);
}

/* ============ 播放页子面板：定时 / 评论 ============ */
function openSheet(kind) {
  const map = { timer: renderTimerSheet, comment: renderCommentSheet };
  $('#psTitle').textContent = '';
  $('#psSub').innerHTML = '';
  $('#psMeta').innerHTML = '';
  $('#psBody').innerHTML = '';
  map[kind]();
  openLayer($('#playerSheet'));
}

function renderTimerSheet() {
  $('#psTitle').textContent = '定时停止播放';
  $('#psSub').innerHTML = sleepSub();
  const box = $('#psBody');
  const row = el('div', 'q-chips');
  SLEEP_OPTIONS.forEach((m) => {
    const on = (m === 0 && state.sleepLeft === 0) || (m > 0 && Math.ceil(state.sleepLeft / 60) === m);
    const c = el('button', 'chip' + (on ? ' on' : ''), m === 0 ? '不开启' : `${m} 分钟`);
    c.onclick = () => {
      state.sleepLeft = m * 60;
      /* 重新定时要把「等这首放完」的待停标记清掉，否则上一轮的到点意图会在这一轮末尾误触发 */
      state.sleepPending = false;
      paintTimerTag();
      closeLayer($('#playerSheet'));
      toast(m === 0 ? '已取消定时停止' : `将在 ${m} 分钟后停止播放`);
    };
    row.appendChild(c);
  });
  box.appendChild(row);

  /* 到点这一秒歌还在放：可以立刻停，也可以等当前这首放完再停（项目里的真实开关） */
  const sw = el('div', 'sw-row');
  sw.innerHTML = '<span><b>等当前这首放完再停</b></span>';
  const tg = el('button', 'toggle' + (state.sleepPlayed ? ' on' : ''), '<i></i>');
  tg.onclick = () => { state.sleepPlayed = !state.sleepPlayed; renderTimerSheet(); };
  sw.appendChild(tg);
  box.appendChild(sw);

  box.appendChild(el('p', 'q-note', '若想听完当前这首再停，可将循环模式切到「单曲循环」。'));
}

/* 评论分页：真实侧一页一页翻（getComment），所以浮层里的列表也是逐页追加；
 * 第 3 页首次故意失败一次，让「后面的评论没翻到」这一行看得见（重试即成功），
 * 与详情层同一做法。失败按曲目记，换一首歌还能再演示一次 */
const CMT_PAGE_SIZE = 4;
const CMT_TXT = {
  title: '评论',
  sub: '评论与热度来自各平台 · 与歌曲能否播放无关',
  sortTag: '热度排序',
  loading: '正在载入评论…',
  error: '评论载入失败 · 稍后再试',
  empty: '这首歌暂时没有热门评论',
  moreLoading: '正在载入更多评论…',
  moreEnd: '热门评论到此为止',
  moreError: '后续评论载入失败 · 点击重试',
  noSong: '当前没有播放中的歌曲',
  replyTo: (parentName) => `回复 @${parentName} `,
};
let cmtShown = 0;
let cmtLoading = false;
let cmtFailed = false;
const cmtFailedSongs = new Set();

function renderCommentSheet() {
  const box = $('#psBody');
  $('#psTitle').textContent = CMT_TXT.title;
  $('#psSub').innerHTML = CMT_TXT.sub;
  if (!state.song) {
    box.appendChild(el('div', 'empty-tip', CMT_TXT.noSong));
    return;
  }
  /* 首屏也是取回来的（真实侧第 1 页就是一次 getComment），所以先亮一句正在取 */
  cmtShown = 0;
  cmtLoading = true;
  cmtFailed = false;
  /* 总数与排序口径跟着标题一起钉住，不跟着评论列表滚 */
  $('#psMeta').appendChild(el('div', 'cmt-total', `<b>${commentTotal(state.song).toLocaleString()}</b><span class="q-tag">${CMT_TXT.sortTag}</span>`));
  box.appendChild(el('div', 'empty-tip', CMT_TXT.loading));
  setTimeout(() => {
    if ($('#psTitle').textContent !== CMT_TXT.title) return;
    const tip = $('.empty-tip', box);
    if (tip) tip.remove();
    /* .cmt-total 只报总数与排序口径：原型旧版还算了一句「其中 N 条乐评人长评」，
     * 真实接口没有这个字段，那个数是我拿总数除出来的，撤掉 */
    cmtShown = CMT_PAGE_SIZE;
    cmtLoading = false;
    paintComments();
  }, 450);
}

function paintComments() {
  const box = $('#psBody');
  box.querySelectorAll('.cmt-item, .cmt-status').forEach((n) => n.remove());
  if (!COMMENTS.length) {
    box.appendChild(el('div', 'empty-tip', CMT_TXT.empty));
    return;
  }
  const note = $('.q-note', box);   // 尾巴那句元说明，新铺的行都插在它前面
  const add = (node) => (note ? box.insertBefore(node, note) : box.appendChild(node));
  COMMENTS.slice(0, cmtShown).forEach((c) => add(cmtItem(c)));
  if (cmtShown >= COMMENTS.length) return add(el('p', 'q-note cmt-status', CMT_TXT.moreEnd));
  /* 还没到底：只有「正在翻」和「上一页没翻到」两种时候显示一行，平时滚到底自己去取 */
  if (!cmtLoading && !cmtFailed) return;
  const row = el('button', 'pl-status cmt-status', cmtFailed ? CMT_TXT.moreError : CMT_TXT.moreLoading);
  row.disabled = cmtLoading;
  row.onclick = loadCmtPage;
  add(row);
}

function loadCmtPage() {
  if (cmtLoading || !state.song || cmtShown >= COMMENTS.length) return;
  const id = state.song.id;
  const page = Math.floor(cmtShown / CMT_PAGE_SIZE) + 1;
  cmtLoading = true;
  cmtFailed = false;
  paintComments();
  setTimeout(() => {
    cmtLoading = false;
    if (page === 3 && !cmtFailedSongs.has(id)) {
      cmtFailedSongs.add(id);
      cmtFailed = true;
      paintComments();
      return;
    }
    cmtShown = Math.min(COMMENTS.length, cmtShown + CMT_PAGE_SIZE);
    paintComments();
  }, 450);
}

/* 一条评论 + 它的整棵回复树（回复里还能有回复，逐层缩进并带线程竖线）。
 * 第 1 级沿用原型「@名字：内容」的写法，第 2 级起才加「回复 @某人」浅色前缀 */
function cmtItem(c, depth, parentName) {
  if (depth) {
    const line = el('div', 'cmt-reply', depth > 1
      ? `<i class="cmt-to">${CMT_TXT.replyTo(parentName)}</i><b>@${c.name}：</b>${c.text}`
      : `<b>@${c.name}：</b>${c.text}`);
    (c.replies || []).forEach((r) => line.appendChild(cmtItem(r, depth + 1, c.name)));
    return line;
  }
  const item = el('div', 'cmt-item');
  item.appendChild(faceArt(c.seed, '50%'));
  const body = el('div', 'cmt-body');
  body.appendChild(el('div', 'cmt-line',
    `<span class="cmt-name">${c.name}${c.level ? ' · ' + c.level : ''}</span>` +
    `<span class="cmt-like"><svg class="ic"><use href="#i-heart"/></svg>${c.likes}</span>`));
  body.appendChild(el('div', 'cmt-text', c.text));
  (c.replies || []).forEach((r) => body.appendChild(cmtItem(r, 1, c.name)));
  item.appendChild(body);
  const like = $('.cmt-like', item);
  like.onclick = () => {
    const on = like.classList.toggle('on');
    like.innerHTML = `<svg class="ic"><use href="#${on ? 'i-heart-fill' : 'i-heart'}"/></svg>${c.likes}`;
  };
  return item;
}


/* ============ sheets ============ */
/* ============ 音源设置面板：切音源 / 切平台 / 切音质 ============ */
/* 音源变更后，界面上所有跟「能不能播 / 什么档」相关的显示都要跟着变 */
function repaintAll() {
  renderSheet();
  renderRankTabs();
  renderSongs();
  renderPlaylists();
  if (!$('#page-rank').hidden) renderRankPage();
  if (!$('#page-playlist').hidden) renderPlaylistPage();
  if (!$('#page-mine').hidden) renderMinePage();
  if (plNow) syncPlLayer();
  paintPlayer();
}

function renderSheet() {
  const sc = script();
  renderNav();
  $('#sheetSub').innerHTML = `音源只负责一件事：把歌曲变成能播的声音。<br>
    搜索、歌单、榜单、歌词这些内容，都来自各个平台。`;

  const sl = $('#scriptList');
  sl.innerHTML = '';
  SCRIPTS.forEach((s) => {
    const st = SCRIPT_STATE[s.state];
    const q = s.qualities.map((k) => QUALITY[k].label + ' ' + k).join(' / ');
    const r = el('button', 'opt-row' + (s.key === activeScript ? ' on' : ''));
    r.innerHTML = `<i class="radio"></i>
      <span class="or-body"><b>${s.name}<small>v${s.version}</small></b>
      <em>能播 ${s.platforms.length} 个平台 · ${q}</em></span>
      <span class="or-state" style="--tone:${st.tone}">${st.label}</span>`;
    r.onclick = () => {
      if (s.key === activeScript) return;
      activeScript = s.key;
      lsSave({ script: s.key });
      /* 切源不把音质、内容平台重置：音质由核心按新档表自动降，平台目录与音源无关，
       * 这里替用户改值反而会让「我选的档」和屏幕上写的档不一致 */
      let msg = `已切到「${s.name}」${/^\d/.test(s.version) ? 'v' + s.version : s.version}`;
      if (state.song && !supports(state.song.source)) {
        state.playing = false;
        stopTimer();
        msg += ' · 当前这首不可播，已暂停';
      }
      repaintAll();
      toast(msg);
    };
    sl.appendChild(r);
  });

  const pl = $('#platformList');
  pl.innerHTML = '';
  /* 这五行是「内容平台」选择器，不是音源开关：歌单/榜单目录由内置 SDK 直连平台公开页，
   * 与音源脚本无关，所以每一家都能选来看；音源只决定这家的歌取不取得到播放地址 */
  Object.entries(SOURCES).forEach(([key, v]) => {
    const ok = sc.platforms.includes(key);
    const isCurrent = activeSource === key;
    const r = el('button', 'opt-row' + (isCurrent ? ' on' : '') + (ok || isCurrent ? '' : ' off'));
    r.style.setProperty('--tint', v.tint);
    r.innerHTML = `<i class="radio"></i>
      <span class="or-body"><b>${v.label}</b><em>${ok ? '这里的歌曲可直接播放' : `「${sc.name}」未接入${v.label}`}</em></span>
      ${isCurrent ? '<span class="or-state" style="--tone:var(--ok)">当前在看</span>'
        : ok ? '' : '<span class="or-state" style="--tone:var(--text-3)">不可播</span>'}`;
    r.onclick = () => {
      if (isCurrent) return;
      activeSource = key;
      lsSave({ source: key });
      /* 分类目录逐平台不同，上一家选中的分类在目录里可能根本不存在，切平台就回到「全部」 */
      plCat = PL_TAG_ALL;
      repaintAll();
      toast(`首页、歌单与排行榜内容已切换为${v.label}${ok ? '' : '（可浏览，暂不可播）'}`);
    };
    pl.appendChild(r);
  });

  const qr = $('#qualityRow');
  qr.innerHTML = '';
  /* 列的是播放核心认可的四档整表（高→低），不是「当前音源有的档」：
   * 用户要看得见自己差哪一档，以及选了会实际按哪一档播 */
  PLAY_QUALITY_CHOICES.forEach((q) => {
    const ok = sc.qualities.includes(q);
    const to = ok ? q : qualityFallback(q);
    const c = el('button', 'chip' + (ok && q === activeQuality ? ' on' : '') + (ok ? '' : ' dim'),
      ok ? `${QUALITY[q].label} ${q}` : `${QUALITY[q].label}→按${QUALITY[to].label}播`);
    c.onclick = () => {
      if (!ok) { toast(`「${sc.name}」没有${QUALITY[q].label}这一档 · 强行选择也会自动降到${QUALITY[to].label}`); return; }
      activeQuality = q;
      lsSave({ quality: q });
      renderSheet(); renderSongs(); paintPlayer();
    };
    qr.appendChild(c);
  });
  if (PLAY_QUALITY_CHOICES.some((q) => !sc.qualities.includes(q))) {
    qr.appendChild(el('span', 'q-note', '置灰的档位是当前音源没有的 · 点击不会选中，播放时自动降到该档标注的音质。'));
  }
  if (!sc.qualities.includes(activeQuality)) {
    qr.appendChild(el('span', 'q-note', `你之前选的${QUALITY[activeQuality].label}这档现在的音源没有，听歌时会自动按${QUALITY[qualityFallback(activeQuality)].label}播，不用重选`));
  }
  if (sc.qualities.length === 1) {
    qr.appendChild(el('span', 'q-note', `${sc.name} 在各平台只有 ${QUALITY[sc.qualities[0]].label} ${sc.qualities[0]}，没有更高档位可选`));
  }

  renderImportRow();
}

/* 导入音源：本项目内置音源表为空，贴脚本链接导入是唯一起点 */
function renderImportRow() {
  const go = $('#importGo');
  go.textContent = importing ? '导入中…' : '导入';
  $('#importErr').hidden = !importErr;
  $('#importErr').textContent = importErr;
}

let importing = false;
let importErr = '';

function handleImport() {
  if (importing) return;
  const url = $('#importInput').value.trim();
  if (!/^https?:\/\//.test(url)) { importErr = '请填写 http:// 或 https:// 开头的脚本地址'; renderImportRow(); return; }
  importErr = '';
  importing = true;
  renderImportRow();
  /* 原型不真的抓脚本：给一条导入成功的样子，脚本名从链接里那段读出来 */
  setTimeout(() => {
    importing = false;
    const name = (url.match(/\/([A-Za-z0-9_-]+)\.js/i) || [, '自定义音源'])[1];
    SCRIPTS.push({ key: 'u' + SCRIPTS.length, name, version: '—', platforms: ['kw', 'tx'], qualities: ['128k', '320k'], state: 'ready' });
    $('#importInput').value = '';
    renderSheet();
    toast(`已导入「${name}」· 点击该行即可切换`);
  }, 700);
}

/* ============ 搜索 ============
 * 音源没有 search 事件，所以这一页搜的是「各平台曲库里的歌和歌单」。
 * 结果分成两类各列各的：单曲行带来源角标和可播状态，歌单卡进同一个详情层。 */
let searchQ = '';      /* 已经提交出去的词（回车 / 点词才算提交） */
let searchTab = 'song';
let searchLastQ = null;
let searchLoading = false;
const SEARCH_HOT_LIMIT = 10;
const searchHistory = [];

const norm = (s) => String(s).toLowerCase().replace(/\s+/g, '');
/* 一个搜索词常常是「风格 + 场景」两个词，整串去比会谁都不命中，所以按词拆开逐个试 */
const qTokens = () => String(searchQ).toLowerCase().split(/[\s·、,，]+/).map(norm).filter(Boolean);
const hits = (fields) => {
  const ts = qTokens();
  return ts.length > 0 && ts.some((q) => fields.some((f) => norm(f).includes(q)));
};

const songHits = () => SONGS.filter((s) => hits([s.title, s.artist, s.album, SOURCES[s.source].label, SOURCES[s.source].short]));

const plHits = () => PLAYLISTS.filter((p) => hits([p.name, p.desc, p.author, ...p.cats]));

function rememberQuery() {
  const w = searchQ.trim();
  if (!w) return;
  searchHistory.unshift(w);
  const i = searchHistory.indexOf(w);
  if (i > 0) searchHistory.splice(i, 1);
  searchHistory.length = Math.min(searchHistory.length, 8);
}

function scWordRow(words, onPick) {
  const row = el('div', 'hot-words');
  words.forEach((w) => {
    const c = el('button', 'chip', w);
    c.onclick = () => onPick(w);
    row.appendChild(c);
  });
  return row;
}

function renderSearchIdle(box) {
  if (searchHistory.length) {
    const head = el('div', 'sc-label');
    head.innerHTML = `<b>搜索历史</b>`;
    const clr = el('button', 'sc-clear', '<svg class="ic"><use href="#i-close"/></svg>清空');
    clr.onclick = () => { searchHistory.length = 0; renderSearch(); };
    head.appendChild(clr);
    box.appendChild(head);
    box.appendChild(scWordRow(searchHistory.slice(), pickQuery));
  }
  box.appendChild(el('div', 'sc-label', '<b>大家都在搜</b>'));
  const hot = HOT_WORDS.slice(0, SEARCH_HOT_LIMIT);
  /* 热搜是真异步数据，取不到时不能留一片空白让人以为坏了 */
  box.appendChild(hot.length
    ? scWordRow(hot, pickQuery)
    : el('div', 'empty-tip', '热搜暂时载入失败 · 直接输入关键词搜索'));
  box.appendChild(el('p', 'sc-hint', '搜索各平台曲库的歌曲与歌单 · 能否播放在点播放时确认'));
}

function pickQuery(w) {
  $('#searchInput').value = w;
  submitSearch(w);
}

/* 回车 / 点词才真去搜：输入过程中不逐字发请求（真实侧一次搜索打两个平台接口） */
function submitSearch(raw) {
  const word = String(raw).trim();
  if (!word) return;
  searchQ = word;
  searchTab = 'song';
  searchLastQ = null;
  rememberQuery();
  searchLoading = true;
  renderSearch();
  $('#searchBody').scrollTop = 0;
  setTimeout(() => {
    /* 词中途被换掉：这一次请求的结果就不该再盖上去（真实侧靠序号丢弃过期响应） */
    if (searchQ !== word) return;
    searchLoading = false;
    renderSearch();
  }, 450);
}

function scTabs(songs, pls) {
  const bar = el('div', 'sc-tabs');
  [['song', '单曲', songs.length], ['pl', '歌单', pls.length]].forEach(([key, label, n]) => {
    const b = el('button', searchTab === key ? 'on' : '');
    b.innerHTML = `${label}<em>${n}</em>`;
    b.onclick = () => { searchTab = key; renderSearch(); };
    bar.appendChild(b);
  });
  return bar;
}

function scEmpty() {
  const box = el('div', 'sc-empty');
  box.innerHTML = `<b>没找到和「${searchQ}」对得上的歌或歌单</b>换个词试试，比如歌手名、歌名里的两个字`;
  if (/音源|平台/.test(searchQ)) {
    const go = el('button', 'chip', '到设定页查看音源');
    go.style.marginTop = '14px';
    go.onclick = () => { closeSearch(); switchTab('setting'); };
    box.appendChild(go);
  }
  return box;
}

function renderSearch() {
  const box = $('#searchBody');
  box.innerHTML = '';
  $('#searchClear').hidden = !searchQ;
  if (!searchQ) { searchLastQ = null; return renderSearchIdle(box); }
  if (searchLoading) return box.appendChild(el('div', 'empty-tip', '正在搜索…'));
  const songs = songHits();
  const pls = plHits();
  /* 换词时落到有结果的那一类；手动点过的标签不被抢走 */
  if (searchLastQ !== searchQ) {
    searchLastQ = searchQ;
    if (searchTab === 'song' && !songs.length && pls.length) searchTab = 'pl';
    else if (searchTab === 'pl' && !pls.length && songs.length) searchTab = 'song';
  }
  box.appendChild(scTabs(songs, pls));
  if (!songs.length && !pls.length) return box.appendChild(scEmpty());

  const cur = searchTab === 'song' ? songs : pls;
  if (!cur.length) {
    const other = searchTab === 'song' ? pls : songs;
    const toPl = searchTab === 'song';
    const none = el('div', 'sc-empty');
    none.innerHTML = `<b>这一类里没有「${searchQ}」的结果</b>${toPl ? '歌单' : '单曲'}那边有 ${other.length} 条`;
    const jump = el('button', 'chip', `看 ${other.length} ${toPl ? '份歌单' : '首单曲'}`);
    jump.style.marginTop = '14px';
    jump.onclick = () => { searchTab = toPl ? 'pl' : 'song'; renderSearch(); };
    none.appendChild(jump);
    return box.appendChild(none);
  }

  if (searchTab === 'song') {
    const list = el('div', 'song-list');
    list.style.marginTop = '4px';
    songs.forEach((s, i) => list.appendChild(songRow(s, i + 1, songs)));
    box.appendChild(list);
    const can = songs.filter((s) => supports(s.source)).length;
    box.appendChild(el('p', 'sc-hint', `${songs.length} 首单曲 · 其中 ${can} 首现在这个音源能播`));
  } else {
    const grid = el('div', 'pl-grid');
    grid.style.marginTop = '4px';
    pls.forEach((p) => grid.appendChild(plCard(p)));
    box.appendChild(grid);
    box.appendChild(el('p', 'sc-hint', `${pls.length} 份歌单 · 点进去看每首先能不能播`));
  }
}

function openSearch() {
  renderSearch();
  openLayer($('#searchLayer'));
  $('#searchBody').scrollTop = 0;
  setTimeout(() => $('#searchInput').focus(), 300);
}

const closeSearch = () => { $('#searchInput').blur(); closeLayer($('#searchLayer')); };

/* ============ tabs ============ */
const PAGES = { home: '#page-home', playlist: '#page-playlist', rank: '#page-rank', mine: '#page-mine', setting: '#page-setting' };
let currentTab = 'home';

function switchTab(key) {
  currentTab = key;
  $$('.tab').forEach((t) => t.classList.toggle('is-active', t.dataset.tab === key));
  Object.entries(PAGES).forEach(([k, sel]) => { $(sel).hidden = k !== key; });
  if (key === 'playlist') renderPlaylistPage();
  if (key === 'rank') renderRankPage();
  if (key === 'mine') renderMinePage();
  if (key === 'setting') renderSettings();
  $('#viewport').scrollTop = 0;
}

/* ============ 设备外形（原型查看器控件，不属于 App 界面） ============ */
const FRAME = { phone: [390, 844], land: [844, 390], pad: [1180, 820] };
const FRAME_NOTE = {
  phone: '390 × 844 pt · 底部 Tab',
  land: '844 × 390 pt · 底部 Tab · 播放页双栏',
  pad: '1180 × 820 pt · 侧栏导航',
};
let device = 'phone';

/* 预览窗口装不下外框时整体缩着看，逻辑尺寸不变 */
function fitFrame() {
  const p = $('#phone');
  if (device === 'phone') { p.style.zoom = ''; return; }
  const [w, h] = FRAME[device];
  const byW = ($('.stage').clientWidth - 4) / w;
  /* 还要给顶部的方向切换条和页面上下留白让位，否则窄窗口里下沿会被裁掉 */
  const byH = (innerHeight - 132) / h;
  p.style.zoom = Math.min(1, byW, byH).toFixed(3);
}
const frameZoom = () => parseFloat($('#phone').style.zoom) || 1;

function setDevice(next) {
  if (next === device) return;
  device = next;
  const p = $('#phone');
  /* .phone 是外框基类，永远在；这里只叠 .land / .pad 两个覆盖层 */
  p.classList.toggle('land', next === 'land');
  p.classList.toggle('pad', next === 'pad');
  document.body.classList.toggle('land', next === 'land');
  document.body.classList.toggle('pad', next === 'pad');
  /* 换外形时把浮层与推入页收起，回到当前 Tab 的整页视图 */
  [$('#plLayer'), $('#searchLayer'), player()].forEach(closeLayer);
  $$('.sheet').forEach(closeLayer);
  plNow = null;
  /* 浮窗的手拖位置是内联坐标，换外形后要清掉，让它回到该模式的默认落点 */
  const f = $('#lrcFloat');
  f.style.left = f.style.top = '';
  syncFloat();
  $('#vbNote').textContent = FRAME_NOTE[next];
  $$('#devSwitch .vb-btn').forEach((b) => b.classList.toggle('is-on', b.dataset.dev === next));
  fitFrame();
}

/* 侧栏底部那颗音源状态：手机上的等价物是顶栏的波纹按钮 */
function renderNav() {
  const s = script();
  $('#navSrc').textContent = `${s.name} ${s.version} · ${s.platforms.length} 个平台`;
  $('#navQ').textContent = '音质 ' + qLabel();
  $('#navFoot').querySelector('.nf-dot').className = 'nf-dot' + (s.state === 'ready' ? '' : ' warn');
  /* 顶栏那颗点只表示「有事没办完」：音源配好了就整颗撤掉。
   * 长亮着的绿点不是状态，是装饰，看三天就没人再看了 */
  $('#castDot').hidden = s.state === 'ready';
}

/* ============ notes swatches ============ */
function renderSwatches() {
  const box = $('#swatches');
  const sw = [
    ['#FF5C8A', 'brand'], ['#7A3BFF', 'brand-2'], ['#FFD36E', 'accent'],
    ['#08080C', 'bg · dark'], ['#15171F', 'surface · dark'],
    ['#F6F6FA', 'bg · light'], ['#FFFFFF', 'surface · light'], ['#15161C', 'text · light'],
  ];
  box.innerHTML = sw.map(([c, n]) => `<span class="sw"><i style="background:${c}"></i>${n}</span>`).join('');
}

/* ============ init ============ */
function init() {
  /* 主题要在首屏绘制前落地：applyTheme 只挂在点选与系统切换上时，
     刷新后带着已选的「明亮」进来，界面会一直是深色（设定里却显示在用明亮） */
  applyTheme();
  renderBanners();
  startBannerCarousel();
  renderQuick();
  renderRecent();
  renderDaily();
  renderPlaylists();
  renderRankTabs();
  renderSongs();
  renderArtists();
  renderRadio();
  renderSheet();
  renderProfile();
  renderSwatches();

  $$('.tab[data-tab]').forEach((t) => (t.onclick = () => switchTab(t.dataset.tab)));
  $$('.section-more[data-tab]').forEach((b) => (b.onclick = () => switchTab(b.dataset.tab)));
  $('#navFoot').onclick = () => { renderSheet(); openLayer($('#sourceSheet')); };
  $$('#devSwitch .vb-btn').forEach((b) => (b.onclick = () => setDevice(b.dataset.dev)));
  addEventListener('resize', fitFrame);
  fitFrame();

  $('#searchBtn').onclick = openSearch;
  $('#searchCancel').onclick = closeSearch;
  $('#searchClear').onclick = () => {
    searchQ = ''; searchTab = 'song'; searchLoading = false;
    $('#searchInput').value = '';
    renderSearch();
    $('#searchInput').focus();
  };
  /* 输入过程中只更新「清空」钮：搜索要回车或点词才发（见 submitSearch） */
  $('#searchInput').oninput = (e) => {
    $('#searchClear').hidden = !e.target.value.trim();
    if (!e.target.value.trim() && searchQ) { searchQ = ''; searchLoading = false; renderSearch(); }
  };
  $('#searchInput').onkeydown = (e) => { if (e.key === 'Enter') submitSearch(e.target.value); };
  $('#castBtn').onclick = () => { renderSheet(); openLayer($('#sourceSheet')); };
  $('#avatarBtn').onclick = () => switchTab('mine');

  $$('[data-close]').forEach((n) => (n.onclick = () => closeLayer(n.closest('.sheet'))));

  $('#plBack').onclick = closePlLayer;
  $('#plLayer').addEventListener('scroll', plLayerScroll, { passive: true });
  /* 评论浮层滚到底自动翻下一页（真实侧就是触底取数）；这一层还被定时面板共用，只在评论开着时才翻页 */
  $('#psBody').addEventListener('scroll', (e) => {
    const n = e.target;
    if ($('#psTitle').textContent !== CMT_TXT.title) return;
    if (n.scrollTop + n.clientHeight > n.scrollHeight - 120) loadCmtPage();
  }, { passive: true });
  $('#mineEdit').onclick = openNameSheet;
  $('#nameGo').onclick = () => saveNick();
  $('#nameInput').onkeydown = (e) => {
    if (e.key === 'Enter') saveNick();
    else if (!$('#nameErr').hidden) $('#nameErr').hidden = true;
  };
  $('#plOpenBtn').onclick = openPlIdSheet;
  $('#plIdGo').onclick = tryOpenByPid;
  $('#plIdInput').onkeydown = (e) => {
    if (e.key === 'Enter') tryOpenByPid();
    else if (!$('#plIdErr').hidden) $('#plIdErr').hidden = true;
  };
  $('#plManage').onclick = () => switchTab('mine');
  $('#recentMore').onclick = clearRecent;
  $('#createListBtn').onclick = openCreateSheet;
  $('#createGo').onclick = submitCreateList;
  $('#createName').onkeydown = (e) => {
    if (e.key === 'Enter') submitCreateList();
    else if (!$('#createErr').hidden) $('#createErr').hidden = true;
  };

  $('#miniPlay').onclick = (e) => { e.stopPropagation(); toggle(); };
  $('#miniHeart').onclick = (e) => { e.stopPropagation(); toggleFav(); };
  $('#miniNext').onclick = (e) => { e.stopPropagation(); step(1); };
  $('#minibar').onclick = () => { openLayer($('#playerLayer')); syncFloat(); };
  $('#playerClose').onclick = () => { closeLayer($('#playerLayer')); syncFloat(); };
  $('#playerPlay').onclick = toggle;
  $('#playerHeart').onclick = toggleFav;

  /* 主流 App 惯例：播放超过 3 秒时「上一曲」先回到开头，再按才是前一首 */
  $('#btnPrev').onclick = () => (state.t > 3 ? seekTo(0) : step(-1));
  $('#btnNext').onclick = () => step(1);
  $('#btnLoop').onclick = cycleLoop;
  $('#btnTimer').onclick = () => openSheet('timer');
  $('#btnComment').onclick = () => openSheet('comment');
  $('#btnFloat').onclick = toggleFloat;
  bindStageSwipe($('.player-stage'));
  $('#lfClose').onclick = toggleFloat;
  bindFloatDrag($('#lrcFloat'));

  bindDragX($('#seekBar'), (r) => { if (state.song) seekTo(r * state.song.dur); });

  const vp = $('#viewport'), tb = $('#topbar');
  vp.addEventListener('scroll', () => {
    tb.classList.toggle('pinned', vp.scrollTop > 8);
    plPoolScroll();
    rankScroll();
  }, { passive: true });

  play(songById('s02'));
  state.playing = false;
  stopTimer();
  paintPlayer();
  paintLoop();
  paintFloatBtn();
  renderSongs();
}

init();
