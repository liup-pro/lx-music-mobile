# PROTOTYPE_INVENTORY —— 原型语义单元 ↔ RN 组件双向对撞清单

- 基线：RN 侧 HEAD `56953a7` + 工作区未提交的「拆件转正轮」（11 内联件转正 + U61 LrcFloat 落地）；原型侧 `164dfa4` 不变；`new_design/parts/` 为原型侧**件粒度真相**（由 `scripts/gen-newui-parts.mjs` 生成，件头带单元号、index.html 行号与元素数，运行时断言零丢失零重复）。
- 方法：第一步按 `parts/` 件头穷举原型语义单元（U01–U79 + 查看器 chrome + sprite）；第二步穷举 `src/newui/components/`（68 目录）与 `src/newui/screens/`（20 个非页面 .tsx）；第三步五档对撞（1:1 / 偏粗 / 偏细 / 多件 / 缺件）；第四步反向清单。
- `parts/` 件头里的「RN 缺件·内联，转正候选」字样是生成时（`56953a7`）快照，「拆件转正轮」落地后已过期——下次重跑 `scripts/gen-newui-parts.mjs` 即自动同步；本轮 `new_design/` 全程只读，不手改。
- 本轮为 12 件转正后的**对撞复检**，不做第三遍视觉审计（D01–D90 已修完）。

约定：行号来自本轮真实读码（原型 index.html 696 行 / styles.css 1172 行 / app.js 2643 行 / data.js 350 行；styles.css 行号随 `parts/**.css` 逐条转述，件内注明源行号；RN 侧为当前工作区行号）。
判定五档：**1:1**=粒度对上；**偏粗**=一个 RN 件吃下多个原型单元；**偏细**=一个原型单元被 RN 拆成多件；**多件**=RN 有而原型无对应单元的额外件；**缺件**=无 RN 承接。

---

## 一、原型语义单元穷举清单（以 `parts/` 件头为准）

### A. 共通控件层（跨页复用的选择器组）

| # | 单元 | parts 件（index.html 行） | app.js 渲染/逻辑（parts 件头） | 单元内固定文案 |
|---|------|--------------------------|-------------------------------|----------------|
| U01 | `.topbar`（头像/搜索/波纹钮） | common-control/topbar.html（L84-98，12 元素） | 事件接线在 init() 尾部（#searchBtn/#castBtn/#avatarBtn）；renderNav L2511 | — |
| U02 | `.icon-btn` | common-control/icon-btn.html（内容/定义件） | 无独立渲染函数（静态壳件） | — |
| U03 | `.pulse-dot`（castDot） | common-control/pulse-dot.html（静态落 topbar L94） | renderNav L2511（#castDot） | — |
| U04 | `.tabbar` `.tab` | common-control/tabbar.html（L289-307，21 元素） | switchTab L2456 / renderNav L2511 / PAGES L2453 | 首页/歌单/排行/我的/设定 |
| U05 | `.minibar`（mini-* 含 .mini-progress） | common-control/minibar.html（L273-286，17 元素） | syncLists L1628 / paintProgress L1782 | — |
| U06 | `.toast` | common-control/toast.html（L512） | toast L102 | — |
| U07 | `.art`（程序化封面体系） | common-control/art.html（内容/定义件；运行时生成） | svgArt L27 / svgAvatar L54 / art L71 / coverArt L91 / faceArt L92 / artIcon L95 | — |
| U08 | `.chip` | common-control/chip.html（内容/定义件；运行时生成） | 无独立渲染函数 | — |
| U09 | `.section` `.section-head` | common-control/section.html（10 处静态根散布各宿主件） | 各 renderXxx 内联 | 区块标题（继续收听/推荐歌单/热门单曲…） |
| U10 | `.foot-note` | common-control/foot-note.html（5 处根：L159-162 / L194-197 / L210-213 / L250-253 / L385） | PLD_FOOT L827 | 首页「曲库内容来自各平台 · 能否播放取决于当前音源」；歌单「歌单目录来自平台曲库 · 每首歌要到播放时才取回可用地址」；排行「榜单由各平台整理 · 点进去看完整排名」；我的「收藏 · 播放记录 · 自建歌单都只存在这台设备上」；详情层按对象三句 |
| U11 | `.empty-tip` | common-control/empty-tip.html（3 处根：L182 / L191 / L247） | PLD_EMPTY L834 | 「还没有自建歌单 · 听到喜欢的先收藏进来」「这个分类下暂时没有推荐 · 换一个分类试试」 |
| U12 | `.ghost-btn` | common-control/ghost-btn.html（静态落 home/song-list L140） | renderSongs L394 / PLD_LABELS L848 | 「播放全部 N 首」 |
| U13 | `.play-badge` | common-control/play-badge.html（内容/定义件） | 运行时生成 | — |
| U14 | `.q-tag` | common-control/q-tag.html（静态落 player-top L314） | 运行时生成；songRow L420 区段 | 音质/时长标签 |
| U15 | `.src-badge` | common-control/src-badge.html（内容/定义件） | 运行时生成；songRow L420 | 平台名 |
| U16 | `.hscroll` + `.recent-card` | common-control/hscroll-recent.html（L113-119，7 元素，含「继续收听」区块壳） | renderRecent L261 / recentIds L259 / clearRecent L284 / RECENT_LIMIT L258 | 「继续收听」；空态「还没有播放记录 · 先从排行榜里点一首」 |
| U17 | `.sheet` 浮层 chrome（mask/body/handle/title/sub + 钉住规则） | common-control/sheet-chrome.html（定义件；八实例 L389-510） | openSheet L2000 / openLayer L18 / closeLayer L19 | — |
| U18 | `.group-label` | common-control/group-label.html（7 处静态落 source/plid/name 三浮层件） | renderSheet L2172 / renderTagGroups L781 | 已安装音源/音乐平台/音质/导入音源 |
| U19 | `.opt-list` `.opt-row`（radio/or-body/or-state/opt-ic） | common-control/opt-list.html（3 处静态落：#scriptList L396 / #platformList L398 / #moreActions L482） | renderSheet L2172 / actRow L1523 / openMore L1474 | — |
| U20 | `.op-box` `.op-input` `.op-go` `.op-err` | common-control/op-box.html（4 处静态落：L402 / L417 / L438 / L465） | handleImport L2272 / submitCreateList L1292 / saveNick L1188 / tryOpenByPid L1139 | 打开/创建/保存 |
| U21 | `.q-chips`（+q-note） | common-control/q-chips.html（静态落 source-sheet L400） | renderSheet L2172 / renderTimerSheet L2010 | 「不开启」「N 分钟」 |
| U22 | `.toggle` `.sw-row` | common-control/toggle.html（静态落 player-sheet 件内） | renderTimerSheet L2010 / setToggle L1350 | 「等当前这首放完再停」 |
| U23 | sprite（36 枚 symbol / 100 元素） | common-control/sprite.html（L12-54） | setIcon L5 | — |

### B. 首页（page-home L104-164）

| # | 单元 | parts 件（index.html 行） | app.js 渲染/逻辑 | 固定文案 |
|---|------|--------------------------|------------------|----------|
| U24 | `.banner-wrap` `.banner`（b-tag/veil） | home/banner.html（L106-109，3 元素） | bannerItems L154 / renderBanners L185 / bannerPaint L209 / startBannerCarousel L214 | 电台条「按口味随机播放 · 建设中」 |
| U25 | `.quick-row` | home/quick-row.html（L111） | renderQuick L231 | 每日推荐/排行榜/电台/我喜欢；「电台 · 建设中」toast |
| U26 | `.daily-card` | home/daily-card.html（L121-123，2 元素） | renderDaily L299 / dailyPool L294 / todayLabel L321 | 今日推荐 |
| U27 | `.pl-grid` `.pl-card` | home/pl-card.html（L125-131，7 元素，含区块壳） | PLD 卡系：plCard L327 区段 | 「N 播放」 |
| U28 | `.rank-tabs` | common-control/chip-row.html（L138，与 U35 合一件） | renderRankTabs L367 / homeBoards L359 | 榜名 |
| U29 | `.song-list` `.song-row`（sr-*/src-badge/q-tag/play-badge） | home/song-list.html（L133-141，8 元素，含区块壳；rank-tabs 归 U28） | renderSongs L394 / songRow L420 / currentSongs L385 / currentBoard L362 | — |
| U30 | `.sr .eq`（播放中三柱） | common-control/eq-bars.html（运行时生成） | songRow L420 | — |
| U31 | `.artist-card` | home/artist-card.html（L143-150，4 元素，含区块壳；section-note 归 U32） | renderArtists L1536 / ARTIST_LIMIT L1534 | — |
| U32 | `.section-note` | home/section-note.html（L148） | renderArtists L1536 | 「头像是示意插画 · 平台未提供歌手照片」 |
| U33 | `.radio-grid` `.radio-card` `.wip-tag` | home/radio-card.html（L152-157，4 元素） | renderRadio L1555 | 私人 FM/赫兹电台 + 「建设中」 |

### C. 歌单页（page-playlist L167-199）

| # | 单元 | parts 件（index.html 行） | app.js 渲染/逻辑 | 固定文案 |
|---|------|--------------------------|------------------|----------|
| U34 | `.page-head` + `.pl-open-btn` | common-control/page-head.html（3 处根：L169-172 / L204-206 / L260-262） | renderPlaylistPage L719 | 打开歌单链接/ID |
| U35 | `.cat-row`（position:sticky） | common-control/chip-row.html（L174，与 U28 合一件） | renderPlaylistPage L719 / tagChip L799 / plHotCats L656 | 分类词 |
| U36 | `.my-pl-row` `.my-pl` | playlist/my-pl.html（L176-183，7 元素，含区块壳；空态归 U11） | renderPlaylistPage L719 | 「我的歌单」+ myPlEmpty 文案（U11） |
| U37 | `.pl-count` | playlist/pl-count.html（L188） | paintPlPool L756 | 「已列出 N / M 个」 |
| U38 | 推荐池 `.pl-grid`（复用 U27） | playlist/pl-pool.html（L185-192，4 元素；计数归 U37、空态归 U11） | paintPlPool L756 / plPool L669 / loadPlPoolPage L691 / PL_POOL_SIZE L662 | plPoolEmpty 文案（U11） |

### D. 排行榜页（page-rank L202-215）

| # | 单元 | parts 件（index.html 行） | app.js 渲染/逻辑 | 固定文案 |
|---|------|--------------------------|------------------|----------|
| U39 | `.rank-grid` `.rk-card`（rk-emblem/rk-name/rk-sub） | rank/rank-grid.html（L208） | renderRankPage L538 / rankCard L635 / paintRankGrid L547 / RANK_PAGE_SIZE L469 | 榜名 + 副题 |
| U40 | `.rank-group` 组头 | rank/rank-group.html（运行时生成） | rankGroupHead L494 | 「N 个榜 · 热歌 / 新歌 / 飙升在前」 |
| U41 | chartArt 符号体系（CHART_ACCENT/TINT/EMBLEM/shadeHex） | rank/chart-art.html（运行时生成） | chartArt L626 / CHART_ACCENT L573 / CHART_TINT L585 / CHART_EMBLEM L598 / chartTint L593 / shadeHex L595 | — |

### E. 我的页（page-mine L218-255）

| # | 单元 | parts 件（index.html 行） | app.js 渲染/逻辑 | 固定文案 |
|---|------|--------------------------|------------------|----------|
| U42 | `.mine-head`（mh-*/头像大字） | mine/mine-head.html（L220-227，8 元素） | renderMinePage L1206 / renderProfile L1168 / nickInitial L1166 | mh-sub「没有账号 · 收听都记在这台设备上」 |
| U43 | `.stat-row` `.stat` | mine/stat-row.html（L229） | renderMinePage L1206 | 喜欢/歌单/最近播放 |
| U44 | `.fav-card` | mine/fav-card.html（L230） | renderMinePage L1206 / refreshFavLayer L881 | 我喜欢 |
| U45 | `.song-list.compact`（最近播放复用 U29） | mine/song-list-compact.html（L232-238，7 元素，含区块壳） | renderMinePage L1206 | — |
| U46 | 我的歌单区（pl-card 复用 + plCardMine） | mine/my-pl-mine.html（L240-248，7 元素，含区块壳；空态归 U11） | plCardMine L1254 | — |
| U47 | nameSheet（改昵称浮层） | sheets/name-sheet.html（L459-474，13 元素） | openNameSheet L1174 / saveNick L1188 / NICK_PICKS L1165 | 「头像用昵称的第一个字，顶左上角的那颗圆也一起换。」「想叫什么」「保存」「换个快的」「昵称只保存在这台设备的存储里，不上传任何服务器 · 更换设备后回到「EchoIsle」。」 |

### F. 设定页（page-setting L258-268）

| # | 单元 | parts 件（index.html 行） | app.js 渲染/逻辑 | 固定文案 |
|---|------|--------------------------|------------------|----------|
| U48 | `.set-hero` `.sh-sub` | setting/set-hero.html（L263-265，2 元素） | renderSettings L1359 | setSub「这里的开关只作用于这台设备 · 不影响曲库内容，也不上传任何数据」 |
| U49 | `.set-group` `.set-list` `.set-row` `.set-ic` `st-l/st-r` | setting/settings-group.html（L266 #setBody；组内行运行时生成） | renderSettings L1359 / setGroup L1332 / setRow L1341 / setToggle L1350 / setInfo L1463 | 明/暗/系统三档、关于行 |

### G. 播放页（player-layer L310-352）

| # | 单元 | parts 件（index.html 行） | app.js 渲染/逻辑 | 固定文案 |
|---|------|--------------------------|------------------|----------|
| U50 | `.player-bg` | player/player-bg.html（L311） | paintPlayer L1748 区段 | — |
| U51 | `.player-top` + `.player-crumb` | player/player-top.html（L312-315，7 元素） | paintPlayer | 面包屑「正在播放」 |
| U52 | `.player-stage` `.disc` | player/stage.html（L317-322，3 元素；lyric-wrap 归 U53） | bindStageSwipe L1960 / swipeDir L1957 / SWIPE_MIN_DX L1955 | — |
| U53 | `.lyric-wrap/.lyric-scroll/.ln/.ln-note/.ln-empty` | player/lyric.html（L319-321，2 元素） | renderLyric L1839 / syncLyric L1853 / setLyric L1874 / hasLyric L1837 | 「这首歌暂时没有歌词 · 或歌词仍在载入」「歌词由各平台提供」 |
| U54 | `.stage-dots` | player/stage-dots.html（L323，3 元素） | bindStageSwipe L1960 / setLyric L1874 | — |
| U55 | `.player-meta`（player-info/pc.fav） | player/player-meta.html（L325-331，7 元素） | paintFav/toggleFav L1795 区段 | — |
| U56 | `.player-source` | player/player-source.html（L332） | paintPlayer | 平台+音质文本 |
| U57 | `.seek` | player/seek.html（L334-336，3 元素） | seekTo L1740 / tick L1670 / bindDragX L1937 | — |
| U58 | `.seek-time` | player/seek-time.html（L337，3 元素） | paintProgress L1782 区段 | — |
| U59 | `.player-controls` `.pc` | player/player-controls.html（L339-343，10 元素） | step L1714 / toggle L1659 / LOOP_ORDER L1593 / LOOP_ICON L1594 / LOOP_NAME L1595 / paintLoop L1814 | — |
| U60 | `.player-tools` `.pt-btn` | player/player-tools.html（L346-351，13 元素；浮窗钮与 U61 对读） | paintTimerTag L1826 / cycleLoop L1325 / toggleFloat L1900 | 定时/循环/浮窗/评论（仅 aria-label） |
| U61 | `.lrc-float`（歌词悬浮窗） | player/lrc-float.html（L355-359，6 元素） | syncFloat L1884 / paintFloatBtn L1895 / toggleFloat L1900 / bindFloatDrag L1907 | — |

### H. 搜索层（search-layer L362-372）

| # | 单元 | parts 件（index.html 行） | app.js 渲染/逻辑 | 固定文案 |
|---|------|--------------------------|------------------|----------|
| U62 | `.sc-top` `.sc-box` `.sc-cancel` | search/sc-top.html（L363-370，9 元素） | openSearch L2443 | placeholder「搜歌名、歌手、歌单」「取消」 |
| U63 | `.sc-tabs` | search/sc-tabs.html（运行时生成） | scTabs L2374 | 单曲/歌单 + 计数 |
| U64 | `.sc-label` `.sc-clear` | search/sc-body.html（L371） | renderSearchIdle L2331 / rememberQuery L2312 / searchHistory L2298 | 「搜索历史」「大家都在搜」 |
| U65 | `.sc-empty` `.sc-hint` | search/sc-result.html（运行时生成） | scEmpty L2385 / renderSearch L2397 | 「正在搜索…」「没找到和「X」对得上的歌或歌单」「到设定页查看音源」 |

### I. 歌单详情层（plLayer L375-386）

| # | 单元 | parts 件（index.html 行） | app.js 渲染/逻辑 | 固定文案 |
|---|------|--------------------------|------------------|----------|
| U66 | `.pl-bg`（blur64+saturate150 氛围层） | songlist-detail/pl-bg.html（L376） | openPlaylist L888 | — |
| U67 | `.pl-top` `.pl-crumb` `.pl-fav-btn` | songlist-detail/pl-top.html（L377-381，8 元素） | PLD_CRUMB L826 / togglePlFav L1040 | 分类面包屑 |
| U68 | `.pl-hero`（ph-body/ph-sub/ph-meta/sep） | songlist-detail/pl-hero.html（L382） | openPlaylist L888（chartArt 头图） | 「n/m 首可播」「N 首」「N播放」 |
| U69 | `.pl-actions`（ghost+随机钮） | songlist-detail/pl-actions.html（L383） | PLD_LABELS L848 | 「播放全部 N 首」「随机播放」 |
| U70 | 详情曲目表（song-list 复用 + `.pl-status` `.pl-end`） | songlist-detail/pl-tracks.html（L384） | renderPlTracks L985 / plStatusRow L1003 / loadPlPage L1011 / plEndRow L845 / PLD_STATUS L842 / PLD_EMPTY L834 / PL_PAGE_SIZE L824 | PLD_STATUS「正在载入下一批…」「这一批没有载入 · 点击重试」「没有更多了」 |
| U71 | `#plFoot`（foot-note 复用 U10） | common-control/foot-note.html（第 5 处根 L385） | PLD_FOOT L827 | 分对象三句 |

### J. 浮层族（复用 U17 chrome 的实例）

| # | 单元 | parts 件（index.html 行） | app.js 渲染/逻辑 | 固定文案 |
|---|------|--------------------------|------------------|----------|
| U72 | sourceSheet | sheets/source-sheet.html（L389-408，17 元素） | renderSheet L2172 / renderImportRow L2262 / handleImport L2272 | sheetSub「音源只负责一件事…」；「导入」；「X→按Y播」；q-note 三句 |
| U73 | plIdSheet | sheets/plid-sheet.html（L411-429，15 元素） | openPlIdSheet L1129 / PLID L1087 / tryOpenByPid L1139 | 「把平台上分享出来的歌单链接贴进来，或者只填那串歌单 ID。」「歌单链接 / ID」「打开」「可以试试这几个」「歌单包含哪些平台的歌曲取决于歌单本身 · 能否播放在点播放时确认。」 |
| U74 | createSheet | sheets/create-sheet.html（L432-445，11 元素） | openCreateSheet L1285 / submitCreateList L1292 / doCreate L1303 / CREATE_TXT L1272 | 「起个名字就能建，建好就出现在「我的歌单」这一排里。」「你想起啥名...」「创建」「新歌单只存在这台设备上，进入后即可添加歌曲。」 |
| U75 | plTagsSheet | sheets/tags-sheet.html（L448-456，7 元素） | openTagSheet L770 / renderTagGroups L781 / PL_TAG_ALL L653 | 「当前平台的全部分类 · 选一个，下面的推荐歌单就换成这一类。」「正在从平台获取分类…」「这个平台暂时取不到分类 · 稍后再试」 |
| U76 | moreSheet（`.more-song` + more-actions） | sheets/more-sheet.html（L477-484，6 元素） | openMore L1474 / actRow L1523 | 「收藏到「我喜欢」」「下一曲播放」「加入「X」」 |
| U77 | confirmSheet（`.cf-actions` `.cf-btn`） | sheets/confirm-sheet.html（L499-510，9 元素） | askConfirm L1454 | 「取消」「确定」「要执行这一步吗」 |
| U78 | timer 浮层（`#playerSheet` 实例一） | sheets/timer-sheet.html + player-sheet.html（L487-496，8 元素） | renderTimerSheet L2010 / sleepSub L1821 | 「不开启」「N 分钟」「等当前这首放完再停」 |
| U79 | comment 浮层（`#playerSheet` 实例二；**164dfa4：cmt-total 钉在 #psMeta，仅 #psBody 滚**） | sheets/comment-sheet.html + player-sheet.html（L487-496） | renderCommentSheet L2063 / paintComments L2090 / cmtItem L2131 / CMT_TXT L2045 / commentTotal L1605 | 「评论」标题族、总数行、回复层级、「收起/展开」族 |

### K. 查看器 chrome（非 App UI，不参与对撞，RN 有意不承接）

| # | 单元 | parts 件 | 备注 |
|---|------|----------|------|
| V1 | `.viewer-bar` 设备切换条 | _chrome.html/.css | 原型演示壳（L59-67） |
| V2 | `.phone`/`.screen`/`.island`/`.statusbar` | _shell，chrome | 手机外框与假状态栏（L70-81） |
| V3 | `.notes` 文档面板 + `.swatches` | _chrome | 原型设计说明（L518-689） |
| V4 | Pad/land 覆盖层 + 侧栏专属件 | _chrome | 手机竖屏 display:none（L290-306） |

**无归属元素清单：空**（生成脚本运行时断言：824 元素 = 各件之和 824；654 条 CSS 规则逐条唯一归属）。

---

## 二、RN 组件清单（第二侧；当前工作区，含本轮转正）

### 共通件 `src/newui/components/`（68 目录，桶文件 index.ts 统一导出：68 条 `export *` 与目录逐一对应，grep 复核）

Art、ArtistCard、Banner、BrandAvatar、CardGrid、ChartArt、Chip、ChipFlow、ChipRow、ConfirmSheet、CoverWash、DailyCard、DiscArt、EmptyTip、FavCard、FootNote、GhostButton、Glass(BlurredContainer)、GroupLabel、HScroll、Icon(icons.ts 生成物)、IconButton、**LrcFloat（本轮新增）**、LyricList、MineHeader、Minibar、MyPlCard、OpInputRow、OptionRow、PageHeader、PageViewport、PagingEnd、PagingStatus、PcButton、PillButton、**PlActions（本轮新增）**、PlayBadge、PlCard、**PlCount（本轮新增）**、**PlayerBg（本轮新增）**、**PlayerMeta（本轮新增）**、**PlayerSource（本轮新增）**、PlayerToolButton、**PlayerTop（本轮新增）**、**PlTop（本轮新增）**、QTag、QuickRow、RadioCard、RankCard、RankGroupHead、RecentCard、RunningDots、**SearchTop（本轮新增）**、Section、**SectionNote（本轮新增）**、SeekControl、**SeekTime（本轮新增）**、**SetHero（本轮新增）**、SettingsGroup、SettingsRow、Sheet、SongRow(内含 EqBars)、StageDots、StatRow、Switch、TabBar、Toast(NewUiToastHost)、TopBar

引用图要点（grep 实证）：
- Main/index → TopBar/TabBar/PageViewport/CatStickerBar/MinibarDock/**LrcFloatDock**/ConfirmSheet/NewUiToastHost + 六个 sheet
- HomePage → Banner/QuickRow/Section/HScroll/RecentCard/DailyCard/PlCard/ChipRow/SongRow/GhostButton/ArtistCard/CardGrid/RadioCard/FootNote/PageListView/EmptyTip/**SectionNote**
- PlaylistPage → PageHeader/ChipRow/Section/HScroll/MyPlCard/PlCard/EmptyTip/PagingStatus/PagingEnd/FootNote/PillButton/PageListView/**PlCount**
- RankPage → PageHeader/CardGrid/RankGroupHead/RankCard/EmptyTip/FootNote/PagingStatus/PagingEnd
- MinePage → MineHeader(→BrandAvatar+PillButton)/StatRow/FavCard/Section/SongRow/CardGrid/PlCard/EmptyTip/FootNote
- SettingPage → PageHeader/**SetHero**/SettingsGroup/SettingsRow/ConfirmSheet
- Player/index → **PlayerBg/PlayerTop/PlayerMeta/PlayerSource/SeekTime**/PlayerStageSwipe/DiscArt/LyricList/StageDots/PcButton/SeekControl/PlayerToolButton/QTag/IconButton + sheets(Comment/Timer) + **useDesktopLyricToggle（浮窗钮 = 系统悬浮窗开关，阶段 3）** + ConfirmSheet(悬浮窗授权引导)
- SonglistDetailScreen → CoverWash/**PlTop**/IconButton/GhostButton/**PlActions**/SongRow/PagingStatus/PagingEnd/EmptyTip/FootNote/ConfirmSheet/NewUiToastHost/MoreSheet + PlaylistHero
- Search 屏 → **SearchTop**/Icon/Chip/GhostButton/PlCard/SongRow/ChipFlow
- 浮层族 → Sheet(→Glass)/GroupLabel/OptionRow/ChipFlow/OpInputRow/Switch/QTag/Art/SrcBadge
- PagingStatus → RunningDots；Toast(NewUiToastHost) → BlurredContainer + utils/newUiToast 总线；LrcFloat → BlurredContainer(GLASS.lrcFloat) + hooks/useLrcFloat

### 屏级件 `src/newui/screens/`（20 个非页面 .tsx = 4 屏根 + 16 辅件）

辅件 16：`Main/CatStickerBar.tsx`（歌单页 cat-row 吸顶复制层）、`Main/LrcFloatDock.tsx`（**本轮新增**，U61 气泡挂点）、`Main/MinibarDock.tsx`（minibar 挂载容器）、`Main/sheets/{SourceSheet,PlIdSheet,CreateListSheet,PlTagsSheet,NameSheet,MoreSheet}.tsx`（六浮层）、`Player/PlayerStageSwipe.tsx`（舞台右滑手势件）、`Player/sheets/{CommentSheet,TimerSheet}.tsx` + `Player/sheets/CommentNode.tsx`（评论递归展示件）、`Search/{SearchIdlePanel,SearchResultPanel(内含 SearchTabs)}.tsx`、`SonglistDetail/PlaylistHero.tsx`。
屏根 4：`Main/index.tsx`、`Player/index.tsx`、`Search/SearchScreen.tsx`、`SonglistDetail/SonglistDetailScreen.tsx`。

---

## 三、双向对撞主表（79 行 = U01-U79 逐一成行）

结论口径：**1:1**=粒度对上；**偏粗**=一个 RN 件吃下多个原型单元；**偏细**=一个原型单元被 RN 拆成多件；**多件**=RN 有而原型无对应单元的额外件；**缺件**=无 RN 承接（本轮为 0）。「本轮转正」= 上版这里还写着「RN 缺件（内联）」。

| 原型单元 | parts 件（原型侧真相） | RN 承接（当前工作区） | 判定 |
|---|---|---|---|
| U01 .topbar | common-control/topbar.html | TopBar | 1:1 |
| U02 .icon-btn | common-control/icon-btn.html | IconButton | 1:1 |
| U03 .pulse-dot | common-control/pulse-dot.html | IconButton `dot` prop（TopBar.tsx L148） | 1:1 |
| U04 .tabbar | common-control/tabbar.html | TabBar | 1:1（Pad 专属 nav-* 归 V4 不承接） |
| U05 .minibar | common-control/minibar.html | Minibar + Main/MinibarDock | 1:1 |
| U06 .toast | common-control/toast.html | Toast(NewUiToastHost) + utils/newUiToast | 1:1（D-09 轮落地） |
| U07 .art | common-control/art.html | Art + utils/pickArtPalette | 1:1 |
| U08 .chip | common-control/chip.html | Chip | 1:1 |
| U09 .section | common-control/section.html | Section | 1:1 |
| U10 .foot-note | common-control/foot-note.html（5 处根） | FootNote（文案由容器/const 传入） | 1:1 |
| U11 .empty-tip | common-control/empty-tip.html（3 处根） | EmptyTip | 1:1 |
| U12 .ghost-btn | common-control/ghost-btn.html | GhostButton | 1:1 |
| U13 .play-badge | common-control/play-badge.html | PlayBadge（SongRow/Banner 复用） | 1:1 |
| U14 .q-tag | common-control/q-tag.html | QTag | 1:1 |
| U15 .src-badge | common-control/src-badge.html | SrcBadge | 1:1 |
| U16 .hscroll+.recent-card | common-control/hscroll-recent.html | HScroll + RecentCard | 1:1 |
| U17 .sheet chrome | common-control/sheet-chrome.html（八实例；164dfa4 钉住归 chrome） | Sheet（options + list 双模式；**pinnedComponent L56 / 钉住区 L256-262 / 样式 L371**） | 偏粗（一个 Sheet 吃下 chrome+八实例骨架；实例本体各见 U72-U79）。**164dfa4 钉住已落地**：CommentSheet.tsx L158-170 总数行转钉住区、L223 传入 |
| U18 .group-label | common-control/group-label.html | GroupLabel | 1:1 |
| U19 .opt-list | common-control/opt-list.html | OptionRow | 1:1 |
| U20 .op-box 族 | common-control/op-box.html | OpInputRow | 1:1 |
| U21 .q-chips | common-control/q-chips.html | ChipFlow（+Chip） | 1:1 |
| U22 .toggle | common-control/toggle.html | Switch | 1:1 |
| U23 sprite | common-control/sprite.html | Icon/icons.ts（scripts/gen-newui-icons.mjs 生成，36 枚） | 1:1 |
| U24 .banner | home/banner.html | Banner + useHomeBanners | 1:1 |
| U25 .quick-row | home/quick-row.html | QuickRow | 1:1 |
| U26 .daily-card | home/daily-card.html | DailyCard | 1:1 |
| U27 .pl-grid/.pl-card | home/pl-card.html | PlCard（排布壳 CardGrid/HScroll/池行） | 1:1 |
| U28 .rank-tabs | common-control/chip-row.html（L138 根） | ChipRow | 偏粗（与 U35 并吃一组件；parts 侧同为一件双根，口径对等） |
| U29 .song-list 族 | home/song-list.html | SongRow | 1:1 |
| U30 .sr .eq | common-control/eq-bars.html | SongRow/EqBars.tsx | 1:1 |
| U31 .artist-card | home/artist-card.html | ArtistCard | 1:1 |
| U32 .section-note | home/section-note.html | **SectionNote**（HomePage.tsx L475） | 1:1（本轮转正） |
| U33 .radio-card/.wip-tag | home/radio-card.html | **无承接**（`components/RadioCard/` 已于 2026-10-19 整目录撤下） | 随 U33 退役改判：`.radio-grid/.radio-card` 原型已无对应屏；`.wip-tag` 样式本体挪 U84 登记但**屏上无实例**（index.html L684 / L768），RN 不实现，闸门侧登记为「无实例豁免」（见 7.8） |
| U34 .page-head/.pl-open-btn | common-control/page-head.html（3 处根） | PageHeader(after=PillButton) | 1:1 |
| U35 .cat-row(sticky) | common-control/chip-row.html（L174 根） | ChipRow variant="cat" + **CatStickerBar**（Main/index.tsx L268） | 多件（吸顶复制层为 RN 特有实现，见反向 R2；chip 本体与 U28 合吃记在 U28 行） |
| U36 .my-pl-row | playlist/my-pl.html | MyPlCard | 1:1 |
| U37 .pl-count | playlist/pl-count.html | **PlCount**（PlaylistPage.tsx L273） | 1:1（本轮转正） |
| U38 推荐池 .pl-grid | playlist/pl-pool.html | Section 头 + PageListView 池行（PlCard 两列）+ EmptyTip | 1:1（复用 U27 卡系，同原型口径） |
| U39 .rank-grid/.rk-card | rank/rank-grid.html | RankCard + CardGrid | 1:1 |
| U40 .rank-group 组头 | rank/rank-group.html | RankGroupHead | 1:1 |
| U41 chartArt 符号体系 | rank/chart-art.html | ChartArt（components/ChartArt/ + theme/chart.ts） | 1:1 |
| U42 .mine-head | mine/mine-head.html | MineHeader（内拆 BrandAvatar+PillButton） | 偏细（1 单元 → 3 件；BrandAvatar 同时供 TopBar 复用，拆分有复用理由） |
| U43 .stat-row | mine/stat-row.html | StatRow | 1:1 |
| U44 .fav-card | mine/fav-card.html | FavCard | 1:1 |
| U45 .song-list.compact | mine/song-list-compact.html | SongRow `compact` prop | 1:1（变体 prop 未另立件，合理） |
| U46 我的歌单区 | mine/my-pl-mine.html | Section(+more→新建歌单) + CardGrid + PlCard + EmptyTip | 1:1 |
| U47 nameSheet | sheets/name-sheet.html | Main/sheets/NameSheet.tsx | 1:1 |
| U48 .set-hero | setting/set-hero.html | **SetHero**（SettingPage.tsx L107） | 1:1（本轮转正） |
| U49 .set-group/.set-row | setting/settings-group.html | SettingsGroup + SettingsRow | 1:1 |
| U50 .player-bg | player/player-bg.html | **PlayerBg**（Player/index.tsx L198） | 1:1（本轮转正） |
| U51 .player-top/.player-crumb | player/player-top.html | **PlayerTop**（L201；钮=IconButton、q-tag=QTag、spacer 补 grid 第三列） | 1:1（本轮转正） |
| U52 .player-stage/.disc | player/stage.html | PlayerStageSwipe + DiscArt（+LyricList 内容件） | 偏细（1 单元 → 手势壳+两内容件；pager-view 落地方式，见第六节） |
| U53 .lyric-* | player/lyric.html | LyricList | 1:1 |
| U54 .stage-dots | player/stage-dots.html | StageDots | 1:1 |
| U55 .player-meta/.pc.fav | player/player-meta.html | **PlayerMeta**（L237；钮=PcButton kind="fav"） | 1:1（本轮转正） |
| U56 .player-source | player/player-source.html | **PlayerSource**（L245；徽标=SrcBadge+QTag） | 1:1（本轮转正） |
| U57 .seek | player/seek.html | SeekControl | 1:1 |
| U58 .seek-time | player/seek-time.html | **SeekTime**（L254） | 1:1（本轮转正） |
| U59 .player-controls/.pc | player/player-controls.html | PcButton | 1:1 |
| U60 .player-tools/.pt-btn | player/player-tools.html | PlayerToolButton | 1:1 |
| U61 .lrc-float | player/lrc-float.html | **LrcFloat**（视觉件，暂无宿主）；浮窗入口 = **useDesktopLyricToggle**（系统悬浮窗，见 R10） | 功能语义 1:1（宿主为系统级悬浮窗，窗口观感由 `desktopLyric.style.*` 在原生侧绘制，与本件玻璃气泡不同形——阶段 3 取「先保证是系统浮窗」） |
| U62 .sc-top/.sc-box/.sc-cancel | search/sc-top.html | **SearchTop**（SearchScreen.tsx L252，forwardRef TextInput） | 1:1（本轮转正） |
| U63 .sc-tabs | search/sc-tabs.html | SearchTabs（SearchResultPanel.tsx 屏内件） | 1:1（未入 components/ 桶，单屏单用合理） |
| U64 .sc-label/.sc-clear | search/sc-body.html | SearchIdlePanel.tsx（屏级件整体承接 renderSearchIdle） | 1:1（屏级件=原型渲染函数粒度） |
| U65 .sc-empty/.sc-hint | search/sc-result.html | SearchResultPanel.tsx + SearchIdlePanel.tsx | 1:1 |
| U66 .pl-bg | songlist-detail/pl-bg.html | CoverWash（blur 降级为纵向渐隐共通件，R3） | 1:1 |
| U67 .pl-top/.pl-crumb/.pl-fav-btn | songlist-detail/pl-top.html | **PlTop**（SonglistDetailScreen.tsx L611；钮=IconButton） | 1:1（本轮转正） |
| U68 .pl-hero/ph-* | songlist-detail/pl-hero.html | PlaylistHero.tsx | 1:1 |
| U69 .pl-actions | songlist-detail/pl-actions.html | **PlActions**（SonglistDetailScreen.tsx L646；钮=GhostButton+IconButton） | 1:1（本轮转正） |
| U70 详情曲目表 | songlist-detail/pl-tracks.html | PagingStatus(+RunningDots)/PagingEnd + EmptyTip(PLD_EMPTY 三句 const) + SongRow | 1:1 |
| U71 #plFoot | common-control/foot-note.html（第 5 处根） | FootNote（NEW_UI_PLD_FOOT_NOTE[kind]） | 1:1 |
| U72 sourceSheet | sheets/source-sheet.html | Main/sheets/SourceSheet.tsx | 1:1 |
| U73 plIdSheet | sheets/plid-sheet.html | Main/sheets/PlIdSheet.tsx | 1:1 |
| U74 createSheet | sheets/create-sheet.html | Main/sheets/CreateListSheet.tsx（+ConfirmSheet 复用） | 1:1 |
| U75 plTagsSheet | sheets/tags-sheet.html | Main/sheets/PlTagsSheet.tsx | 1:1 |
| U76 moreSheet(.more-song) | sheets/more-sheet.html | Main/sheets/MoreSheet.tsx（.more-song=件内头部） | 1:1 |
| U77 confirmSheet | sheets/confirm-sheet.html | ConfirmSheet | 1:1 |
| U78 timer 浮层 | sheets/timer-sheet.html + player-sheet.html | Player/sheets/TimerSheet.tsx（sw-row 行面板=件内联 View，仅一处使用者） | 1:1 |
| U79 comment 浮层 | sheets/comment-sheet.html + player-sheet.html | Player/sheets/CommentSheet.tsx + CommentNode.tsx | 1:1（164dfa4 钉住已以 pinnedComponent 落地，见 U17 行） |

### 无原型对应的 RN 件（→ 反向清单第四第四节）

PageViewport/PageListView/usePageEndReached/useViewportScroll（R1）、CatStickerBar（R2）、CoverWash（R3）、Glass/BlurredContainer（R4）、RunningDots（R5）、CardGrid/ChipRow/ChipFlow/HScroll（R6）、MinibarDock（R7）、NewUiToastHost 订阅总线（R8）、PageListView PoolRow 两列成行（R9）、useLrcFloat 共享开关 + Main/LrcFloatDock 挂点（R10）。

---

## 四、反向清单：RN 多件判定

| # | RN 件 | 性质判定 | 依据 |
|---|---|---|---|
| R1 | PageViewport + usePageEndReached + useViewportScroll + PageListView | **共通基础件 · 保留** | 原型 `.viewport` 单层滚动 + pageSize 8/10 触底续取是 JS 行为；RN 必须把「距底 160px 总线 + 整页虚拟化」做成基建，非自造需求 |
| R2 | Main/CatStickerBar.tsx | **自造抽象 · 保留（最高维护成本件）** | 原型仅靠 `position:sticky`（css L369-376）；RN 0.73 ScrollView 无 sticky，只能在主屏根层复制一条 chip 行 + onLayout 越线判定。数据同源（usePlaylistCategories + playlistTagSelection 模块级 store），功能等价，属「为平台缺失能力手造第二实例」 |
| R3 | CoverWash | 共通基础件 · 保留 | 原型 `.pl-bg`/`.player-bg` 的 `blur(64)+saturate(150)` RN 不可表达，降级纵向渐隐；两处复用（SonglistDetail、Player 直排），zIndex 配对注释齐全 |
| R4 | Glass/BlurredContainer | 共通基础件 · 保留 | `backdrop-filter` 原生等价物；Sheet/Minibar/Toast + LrcFloat 使用者 |
| R5 | RunningDots | 共通基础件 · 保留 | 原型 `.pl-status .spin` 是静态 CSS 转圈；RN 换三点接力动画（2026-10-15 轮），子件挂在 PagingStatus 内，未外溢 |
| R6 | CardGrid / ChipRow / ChipFlow / HScroll | 共通基础件 · 保留 | 原型的 grid/flex/hscroll 是每处一条 CSS；RN 收敛成布局壳，被 ≥3 处复用 |
| R7 | Main/MinibarDock.tsx | 共通基础件 · 保留 | 挂载容器（谁在播、点去哪），原型由全局事件承担，RN 需壳件接 store 订阅；展示本体仍是 Minibar |
| R8 | utils/newUiToast 投递总线 + 各屏根层 NewUiToastHost | 共通基础件 · 保留 | 原型 `#toast` 全站单例；RN 四屏导航独立，必须每台宿主 + 总线，原型 `.toast z-index:90` 层序语义靠「根层最后一子」维持 |
| R9 | PageListView PoolRow（两列成行） | 自造抽象 · **保留但挂账** | numColumns FlatList 虚拟化必须成行喂数据（numColumns 1↔2 原地变更崩 RN 0.73 FlatList 的前车之鉴）；属虚拟化税，拆件时别把它当 UI 单元 |
| R10 | ~~hooks/useLrcFloat（模块级 store） + screens/Main/LrcFloatDock.tsx~~ **阶段 3 下线** | **共通基础件 · 已拆除** | U61 气泡曾分属两棵挂载树：展示件在 components/LrcFloat，开关态跨屏共享收敛为独立模块（同 playlistTagSelection 款），Dock 是主屏挂点。**feature.md【newui】「歌词浮窗要是系统浮窗，不是应用内浮窗」→ 浮窗宿主改为 core/desktopLyric 的原生悬浮窗**，这条应用内链路（useLrcFloat + LrcFloatDock）整体拆除，components/LrcFloat 视觉件与 theme/LRC_FLOAT token 按原型留存未挂载（宿主等原型口径回来）。原记「RN 两屏 push 会盖住主屏气泡」的已知缺口随宿主下线一并消失 |

**疑似过度设计：无一件判死。** 最接近线的是 R2 CatStickerBar（同一 UI 两处存在），有平台硬约束背书，判「保留 + 维护时按单例对待」。

**观察项（非 RN 多件，不在 R 表）**：`hooks/useDesktopLyricToggle` 自阶段 3 起是新 UI 唯一的「LRC 浮窗」入口接线（播放页 #btnFloat），它不承载视觉、只把开关转给 `core/desktopLyric` 的系统悬浮窗 + 设置键 `desktopLyric.enable`，因此不属拆件对撞的 UI 单元；窗口内容体的观感由设置项 `desktopLyric.style.*` 在原生侧绘制，与原型 U61 的玻璃气泡不同形，属「功能语义（系统浮窗）优先」的既定取舍（feature.md【newui】）。设定页（SettingPage）尚未铺桌面歌词样式项，属后续轮次。

---

## 五、汇总数字（可复核）

- 原型 App UI 语义单元：**79**（U01-U79，另查看器 chrome V1-V4 不参与对撞）。
- RN 组件：**84**（共通件 68 + 屏级辅件 16；不含 4 个屏根与 5 个主屏页面本体）。
- 对撞结论分布（按主表 79 行逐条求和）：
  - 1:1 **74**
  - 偏粗 **2**（U17 Sheet 吃 chrome+八实例骨架；U28/U35 行中的 chip 本体侧记 1 行）
  - 偏细 **2**（U42 MineHeader 拆 3、U52 player-stage 拆 3）
  - 多件 **1**（U35 → CatStickerBar；纯 RN 侧件全部收录反向清单 R1-R10）
  - 缺件 **0**（上版 12 条「RN 缺件（内联/未建）」经本轮转正清零）
  - 求和复核：74 + 2 + 2 + 1 + 0 = **79** ✓
- 与上版（62/12/1/2/2）对照的两处校正：①上版主表实为 77 行（U38/U46 漏列），本版 79 行显式齐全；②12 条缺件中 11 件内联转正为独立组件、1 件（U61）功能落地。

---

## 六、拆件对撞收口（本轮完成态）

1. 上版第六节列的两批「将来补件」清单（9 条页面顶排/行/尾注小结构 + `.lrc-float`）**已全部落地**：11 件转正 + U61 落地，明细见第三节各「本轮转正」行。`parts/` 件头里的「RN 缺件·内联，转正候选」是生成时快照，重跑 `scripts/gen-newui-parts.mjs` 即同步。
2. 保留的既定口径不变：
   - Sheet（U17）偏粗不改：chrome 定义件 + 八实例骨架由一组件吃下是设计选择；164dfa4 钉住规则已以 `pinnedComponent`（Sheet.tsx L56/L256-262）落地，评论（U79）为唯一使用者。
   - chip-row（U28+U35）合并成立：parts 侧同款「一件双根」，RN ChipRow 一吃二 + CatStickerBar 实现税（不进 parts）。
   - 播放器舞台按原型单元写 part（U52-U54）；RN 侧 PlayerStageSwipe+DiscArt+LyricList 的拆分是 pager-view 落地方式，不构成原型结构事实。
3. `.lrc-float`（U61）落地口径与残余事实：
   - 拖拽/边界/点按判定逐值对回原型：token `LRC_FLOAT`（initialLeft 16 / initialTop 520 / bounds 8/8/56/96 / dragScale 1.05 / scaleDuration 280 / tapSlop 4，tokens.ts L1101-1142）；隐藏态 `[hidden]{display:none}` = 组件 `visible=false` 返回 null（拖位跨显隐保留）。
   - 残余事实（非缺件）：z 层差（见 R10）；其余（无系统级动画差异）不再新增。
4. 固定文案对照继续走 `src/newui/const/`（NEW_UI_* 前缀），靠 parts 件头 app.js 符号行回溯，不复制。

---

*本报告为本轮唯一改写的文档（`new_design/` 只读）。生成后 `git status --short` 核验：工作区改动 = 本文件 + 本轮已列明的 12 件转正产物与相关接线（Sheet pinnedComponent、const/hooks 桶、各屏接线），无其他越界改动。*

---

## 七、电台（播客）U81–U85 · 原型 ↔ RN 对撞与落地契约（2026-10-17 追加轮）

> **追加说明**：上面一~六节与那句页脚是上一轮（`56953a7` 之后的拆件转正轮）的原文，**一字未改**（唯一例外：2026-10-20 电台播放接线轮按现状把 U33 `.radio-card/.wip-tag` 那一行的判定从「1:1 / RadioCard」改成了「无承接」，理由见 7.8，其余原文未动）。本文件曾在 `27304cc`「派生物不入库」那轮随 `PROTOTYPE_PARTS.md` 一起从版本库撤下、磁盘副本也没了；本轮按「先对撞再拆件」的指令恢复原文，并在末尾追加本节。是否重新入库由用户定（`PROTOTYPE_PARTS.md` 第 4 行「边界依据」指的就是本文件）。
> **基线**：原型侧 `new_design/` 四源 + `new_design/parts/`（U81–U85 六件切片，连带读 `parts/_base.css` / `parts/_chrome.css`）；RN 侧 HEAD `27304cc` + 当前工作区。
> **本轮性质**：只做对撞与契约，**不写任何 RN 组件/屏代码**。所有「待建」是清单不是事实。数据层（`src/newui/podcast/`）与播放列表面板由并行 agent 负责，本节不列它们的文件。
> **验收状态**：未经设备验收；文中量测数字来自原型一次性无头量测页（index.html L766），不是真机数据。

### 7.0 五件登记（补第一节；U33 退役，编号不回收）

| 件 | 单元 | parts 件 | 结构行（index.html） | app.js 主符号 | 归本件样式 |
|---|---|---|---|---|---|
| 电台首页 | **U81** | `radio/home.{html,css}` | L386-L400（9 元素） | openRadio L1799 / renderPodSub L1812 / podRow L1896 / renderPodChart L1927 / loadPodRegion L1953 / loadPodChartPage L1964 / podChartScroll L1985 | 31 条（home.css，源 styles.css L363-L410） |
| 播客详情 | **U82** | `radio/detail.{html,css}` | L416-L428（7 元素） | openPodcast L1998 / epRow L2050 / closePodcastLayer L2068 / podSaveProgress L1790 | 13 条（detail.css，源 L364-L425） |
| 搜节目 | **U83** | `radio/search.html` | L403-L413（2 元素） | openPodSearch L2153 / renderPodSearch L2100 / submitPodSearch L2137 / podHitsOf L2078 / rememberPodQuery L2092 | **0 条**（样式在 `_base.css` 与宿主件） |
| 单集屏 | **U84** | `radio/episode.{html,css}` | L431-L454（10 元素） | openEpisode L2167 / paintEpisode L2199 / epTick L2210 / epToggle L2224 / epJump L2232 / closeEpisodeLayer L2234 / bindEpisodeSeek L2242 | 9 条（episode.css，含 `.wip-tag` 本体**但屏上无实例**） |
| 地区抽屉 | **U85** | `sheets/region-sheet.html` | L534-L541（6 元素） | openPodRegionSheet L1860 / podRegionRow L1872 / podRegionSheet L1749 | **0 条**（chrome 归 U17，行族归 U18/U19） |

**登记要点（逐字回溯原型）**
- **U33 已退役**：首页「随手听」电台卡区块撤掉（index.html L684「电台在首页<em>只有一个入口</em>：快捷入口那一格」，并明写「这一屏播的是<em>点播的播客单集</em>，不是电台直播流」）。
- **没有新增 sprite symbol**（index.html L768）→ `scripts/gen-newui-icons.mjs` 本轮不重跑。RN 现成字形已够：`search` / `chevron` / `close` / `play` / `pause` / `prev` / `next`（`components/Icon/icons.ts:7`）。「后退十五秒 / 前进三十秒」先借 `prev`/`next`，**带数字的环形图标是后续独立一轮**。
- 电台四层全走 `.pl-layer` 右推，与歌单详情、搜歌同一套路由（index.html L748「一次只收最上面那一层，Esc 与四颗返回钮同口径」）。
- 横屏 / Pad 档的订阅卡 84/150、`.pl-head` 内衬、hero 84 等覆盖**归 `_chrome`**（实测 `_chrome.css:274-276 / 458-478`），本文件不承接；RN 固定竖屏（判例 `theme/tokens.ts:1066`、`components/StageDots/StageDots.tsx:15`）。

### 7.1 五件 ↔ RN 映射结论（逐个给复用 / 新建与理由）

**U81 电台首页 → 新建屏（RN 侧 0 对应件）**

| 屏内单元 | RN 承接 | 判定 | 依据 |
|---|---|---|---|
| 顶排（返回 + crumb「电台」+ 右上「搜节目」） | `PlTop`（`components/PlTop/PlTop.tsx:26-40`） | **复用 + 增一支 kind** | 原型 `.pl-top`/`.player-crumb` 就是 U67 那一原子（home.html:11 引 `songlist-detail/pl-top.html`）。`PlTopRight` 现只有 `fav`/`delete`/`none`（PlTop.tsx:14-22），**缺「右上通用 icon 钮」**：新增 `{ kind: 'icon'; name; label; onPress }` 一支即可，三形态分支零改动、SonglistDetail 调用方零影响。 |
| 订阅区标题行 `.subs-head`（「我听的」+「N 个节目」） | 屏内内联 | **新建（单点）** | `.subs-head b` 是 15/900（home.css:22），**不是** `.section-title` 的 19px（`_base.css:118`），故不能套 `Section`（Section.tsx:16-38 的语义是 26px 区块间距 + 19 标题）。 |
| 订阅横滚卡 `.subs-card`（132×132 / r16 + `.sub-n` 两行 + `.sub-l`「还剩 X」） | `Art`（Art.tsx:16-36）+ `HScroll`（HScroll.tsx:6-26）+ 屏内内联卡体 | **复用壳，卡新建** | 件头明写「横滚壳复用 U16 的 `.hscroll`」；卡宽 132 / 圆角 16 走 home.css:26-35，**不是** `RecentCard`/`PlCard` 的任何一档，不许硬套。 |
| 卡右上角 `.subs-x`（取消收听） | `Icon` close + 玻璃贴片底（home.css:37-41：`--glass` + `--glass-ink` + `inset 1px --line` + blur10） | **新建（内联）** | 语义是 `.glassPatch` 一档（`theme` 已有语义 token），不是 `IconButton` 的控件底；按下不冒泡（app.js L1839 `stopPropagation`）。 |
| 订阅空态 `.subs-empty` | 屏内内联 | **新建，不复用 `EmptyTip`** | home.css:45-46 是 `--card` 底 + `--hairline` 描边 + 11.5/行高1.6 的**色块**；`EmptyTip`（EmptyTip.tsx:6-12）是居中小字，两族不同形。 |
| 当前地区行 `.pod-region`（左区名 15/900 + 右「更多地区」） | 屏内内联（`Text` + `.section-more` 那颗） | **新建（单点）+ 抽件候选** | home.css:49-51；右那颗样式就是跨件原子 `.section-more`（`_base.css:120-126`），RN 目前只在 `Section` 内部内联渲染它（Section.tsx:22-23 `more`）。**两处出现即达标**：建议起一轮把它抽成共通件（候选，不在电台本轮开工单）。 |
| 排行榜列 `.pod-list` / `.pod-row`（名次 + 56 封面 + 名 + 作者·分类词 + chevron） | **新建共通件 `PodcastRow`** | **新建（跨屏第 2 次）** | home.css:54-79。**不能复用 `SongRow`**：SONG_ROW.artSize=46（tokens.ts:370）而榜行封面 56（home.css:65）；`SongRowProps` 必带 `sourceLabel` 平台角标（SongRow.tsx:102-132），播客没有平台概念；副行结构也不同（`.pod-by` = 作者 + 竖线 + 一枚 `q-tag`，home.css:71-75）。U83 命中行同件（app.js L2132 `podRow(s, 0)`）→ 两屏复用，升共通件。 |
| 名次前 3 渐变字 `.pod-rank.top` | `PodcastRow` 内部（渐变走 `GRADIENTS.brand`） | 随件新建 | home.css:61-63。 |
| 状态行 `.pl-status` 两条 + 收行 `.pl-end` | `PagingStatus`（PagingStatus.tsx:8-28，含 RunningDots 替 `.spin` 的既有口径 L23-25）+ `PagingEnd`（PagingEnd.tsx:6-20）+ `NEW_UI_PAGING_END_TEXT`（const/app.ts:24「没有更多了」） | **复用** | 件头明写样式在 `_base`（`_base.css:164-182`）；换区与取不到那一区走同一条状态行（home.html 件头 / app.js L1946-1952）。 |
| 分页参数 | **新建 `POD_CHART_PAGING`** | 新建常量 | 一次 10 个 = `POD_CHART_PAGE`（data.js:573），**不许复用 `RANK_PAGING.pageSize`（8，榜单卡档）**；距底 160 复用 `RANK_PAGING.endReachedDistance`（tokens.ts:676-681）。 |

**U82 播客详情 → 新建屏**

| 屏内单元 | RN 承接 | 判定 | 依据 |
|---|---|---|---|
| 顶排（返回 + crumb = 节目名，右侧空槽） | `PlTop`（`right={{ kind: 'none' }}` 已实现空槽 PlTop.tsx:81；crumb `numberOfLines={1}` 已满足「长名字只截断」PlTop.tsx:58） | **直接复用** | 件头：「那颗 crumb 回显<em>节目名</em>…长名字只截断，规则随 U67 登记」；index.html L766。 |
| `.pl-bg` 氛围层 | `CoverWash`（CoverWash.tsx:23-36，尺寸走 `PL_LAYER.bgHeightRatio/bgAlpha`） | **复用** | 与 SonglistDetailScreen L711-716 同一判例。 |
| `.pl-hero`（封面 + 名 / 作者 / 2 枚分类词 / 共 N 集 / 最新单集 / 还剩 X） | **新建屏级 `PodcastHero`** | **新建，不复用 `PlaylistHero`** | `PlaylistHeroProps` 是单枚 `metaTag` + 榜单专属 `chartKind` 分支（PlaylistHero.tsx:17-33），播客 hero 要**两枚** `q-tag` + 集数 + 最新单集日期 + 本机剩余（app.js L2008-2019），且**没有简介位**（detail.html 件头「接口不给」）。改 `PlaylistHero` 会牵动 SonglistDetail 既有调用面，新建更省。 |
| `.pl-actions`（只有一颗「继续播放 / 播最新单集」） | `GhostButton`（solid 档，GhostButton.tsx:24-41）在屏内排布 | **复用原子，不新建件** | 件头明写「顶排右侧那颗收听（#podSubBtn）也撤了…这一屏只留 hero 那一颗」。**不复用 `PlActions`**：那是「播放全部 + 随机」两颗（PlActions.tsx:9-16）。单颗钮不构成重复单元，不抽件。 |
| 「单集」小标题 `.ep-head` | 屏内内联，**钉在固定段**（detail.html:15 `#podEpHead`） | 新建（单点） | detail.css:20-22；件头「小标题<em>移出滚动轴</em>…轴里只有 `.ep-row`」。 |
| 单集行 `.ep-row`（集名两行 + 日期·时长·本机进度 tag + 摘要两行，整行可点、行内无按钮） | **新建屏级 `EpisodeRow`** | **新建** | detail.css:24-39 + 件头「`.ep-play` 本轮撤掉…接口给多少集就列多少集，不分页也不写解释行」。只此一处 → 屏级辅件（与 PlaylistHero 同一分法）。 |

**U83 搜节目 → 新建屏**

| 屏内单元 | RN 承接 | 判定 | 依据 |
|---|---|---|---|
| 头排 `.sc-top` | `SearchTop`（SearchTop.tsx:9-29 全 props 可配：placeholder / cancelLabel / clearLabel） | **复用** | 件头「复用 `.search-layer` 与 U62 的 `.sc-top`，写法与 U64/U65 那一屏同口径」。文案传「搜节目名或作者」/「取消」/「清空」。 |
| 屏壳与滚动结构 | 照 `SearchScreen`（`screens/Search/SearchScreen.tsx`）：头固定 + `ScrollView` 主体 | **复用判例，新建屏** | 件头：「头部固定（输入框要常驻）+ `.sc-body` 自己滚」；命中 ≤20 行（app.js L2089 `.slice(0, 20)`），不需要虚拟化。 |
| 无输入态：`搜过的词` + 清空 + 词胶囊 | `ChipFlow`（ChipFlow.tsx:28-32 就是 `.q-chips`/`.hot-words` 换行族）+ `.sc-label`/`.sc-clear` 屏内内联 | **复用件 + 内联** | app.js L2105-2118。**热搜不做**：件头「播客没有「热搜」这件事（三条接口都不给）」，index.html L761。`SearchIdlePanel` 不复用（它吃真实热搜与搜歌文案）。 |
| 「正在搜索…」 | `EmptyTip`（app.js L2122 用的就是 `.empty-tip`） | **复用** | — |
| 命中行 | `PodcastRow`（无名次档） | **复用（同上新建的件）** | app.js L2132。 |
| 空结果 `.sc-empty` / 计数 `.sc-hint` | 屏内内联 | **新建（单点）** | app.js L2125-2126 / L2134；样式归 U65（`search/sc-result`）。与 `SearchIdlePanel` 的内联样式构成第 2 处 → **抽件候选**，同 `.section-more` 那条一起处理。 |

**U84 单集屏 → 新建屏**

| 屏内单元 | RN 承接 | 判定 | 依据 |
|---|---|---|---|
| 顶排（crumb = 节目名，整层滚、不吸顶） | `PlTop` | **复用** | 件头「顶排同样随整层滚、不吸顶，<em>那颗 crumb 回显节目名</em>」；index.html L433-L436 顶排**不在** `.pl-head` 内。 |
| `.pl-bg` | `CoverWash` | **复用** | episode.html:10。 |
| `.epl-head`（96 封面 + 集名 + 「节目名 · M 月 D 日」）+ `.epl-intro`（`:empty` 不占位） | 屏内内联 + `Art`（episode.css:15-29） | **新建（单点）** | 摘要可缺席（app.js L2176 `intro \|\| ''`）→ RN 用「空则整块不渲染」，不摆空位。 |
| 进度条 + 起止时间 | `SeekControl`（SeekControl.tsx:19-25：`ratio` + `onCommit`，容器换算秒）+ `SeekTime`（SeekTime.tsx:13-27） | **复用** | 原型 `bindDragX` 的 0..1 映射与 `onCommit(ratio)` 同构（app.js L2242）。 |
| 三颗传输钮（后退十五秒 / 播停 / 前进三十秒） | `PcButton`（kind ghost / main / ghost，PcButton.tsx:38-52） | **复用** | episode.html:22 引 `player/player-controls.html`（U59）。 |
| 「倍速」+ 五档胶囊 | `GroupLabel`（GroupLabel.tsx:6-16）+ `ChipFlow`/`Chip` | **复用** | 件头「`.group-label`/`.q-chips` 倍速档（复用 U18/U21）」；档位 `[0.75,1,1.25,1.5,2]`（app.js L2165），1 显示「原速」。 |
| `.wip-tag` | **不实现** | 原型无实例 | 件头：样式本体留着备用，**屏上已无实例**；index.html L684 逐字「`<code>.wip-tag</code>` 那枚角标本体留着（样式还在，**屏上已经一枚实例都没有**——单集屏面包屑上那枚「界面示意」本轮也撤了）」、L768「`.wip-tag` 的样式本体从退役的 U33 挪到 U84，但屏上已无任何实例」。闸门侧已登记为「无实例豁免」（`newui-parity-whitelist.json` `noInstance`，见 7.8）。 |

**U85 地区抽屉 → 新建屏级 sheet（屏内层状态，不占路由）**

| 屏内单元 | RN 承接 | 判定 | 依据 |
|---|---|---|---|
| 浮层 chrome（handle + 标题「收听地区」+ **无副题**） | `Sheet`（`title` 必填式可省 subtitle：Sheet.tsx:64-67「不传则不渲染」） | **复用** | region-sheet.html:12-13 只有 `.sheet-title`；件头「原先那句「选一个地区，名单跟着换。」本轮撤掉，槽位宁可空着」。写法判例 `screens/Main/sheets/PlTagsSheet.tsx:30-40`。 |
| 5 组小标题 + 42 选项行（行首实心圆 = 选中态） | `GroupLabel` + `OptionRow`（radio 档，OptionRow.tsx:41 / 63-84） | **复用** | 件头「分组小标题归 U18、选项行族归 U19，选中态就是行首那颗实心圆」；分组清单 data.js:320-374。 |
| 主体滚动 | `Sheet` **默认 ScrollView 路径**，**不接 `list` 虚拟化** | 复用 | `list` 是给「分页累加、无上限」的大列表（Sheet.tsx:84-89）；42 行定长，走默认主体。 |
| 点行动作 | 收层 → 换区 → **把 U81 那根榜列轴归零** → 重取这一区 | 契约 | 件头 + app.js L1872-L1885（`podRegionRow`）。 |

**反向清单增补（RN 有、原型无）**
- `R11`：`components/RadioCard/`（含 `components/index.ts:55` 导出、`theme/tokens.ts:955` `RADIO_CARD`、`const/home.ts:106-119` `NEW_UI_HOME_RADIO_ITEMS`）→ 对应原型单元 **U33 已退役**，屏上无对应结构 → **判定：孤儿件，建议废弃**（处置见 7.3）。

### 7.2 待建 RN 文件清单（只列，不建）

**屏（对照 `src/newui/screens/` 现有分法：一层一屏，与 `Search/`、`SonglistDetail/` 同族）**

| 待建路径 | 件 | 说明 |
|---|---|---|
| `src/newui/screens/Radio/index.ts` | — | 桶：导出 4 屏（同 `screens/Search/index.ts` 形态） |
| `src/newui/screens/Radio/RadioHomeScreen.tsx` | U81 | 根 View `nativeID="newui.radio.content"`（转场要吃，见 7.3） |
| `src/newui/screens/Radio/PodcastDetailScreen.tsx` | U82 | `nativeID="newui.podcast.content"` |
| `src/newui/screens/Radio/PodcastSearchScreen.tsx` | U83 | `nativeID="newui.podSearch.content"` |
| `src/newui/screens/Radio/EpisodeScreen.tsx` | U84 | `nativeID="newui.episode.content"` |
| `src/newui/screens/Radio/PodcastHero.tsx` | U82 屏级辅件 | `.pl-hero` 播客形态（与 `SonglistDetail/PlaylistHero.tsx` 平级同族） |
| `src/newui/screens/Radio/EpisodeRow.tsx` | U82 屏级辅件 | `.ep-row` |
| `src/newui/screens/Radio/sheets/index.ts` | — | 屏级 sheet 桶（对照 `Main/sheets/index.ts`、`Player/sheets/index.ts`） |
| `src/newui/screens/Radio/sheets/PodRegionSheet.tsx` | U85 | `Sheet` + `GroupLabel` + `OptionRow`，挂在 RadioHomeScreen 内 |

**共通件（跨屏第 2 次出现才立项，本批只 1 个）**

| 待建路径 | 依据 |
|---|---|
| `src/newui/components/PodcastRow/PodcastRow.tsx` + `index.ts` | U81 榜列 + U83 命中行（app.js L2132 复用 `podRow`）；`src/newui/components/index.ts` 加一条 `export * from './PodcastRow'` |

**常量 / token / 导航（改动面清单）**

| 待建/待加 | 内容 |
|---|---|
| `src/newui/const/radio.ts` | `NEW_UI_POD_TXT`（我听的 / N 个节目 / 还没有收听的节目 / 还剩 X / 单集 / 播最新单集 · X / 继续播放 · 还剩 X / 已从这台设备移除 / 正在载入这一区… / 这一区没有取到名单 · 点击重试）、`NEW_UI_POD_PAGING_TEXT`、地区抽屉标题与「更多地区」、搜节目占位与「取消」「清空」「搜过的词」「N 个节目」与空结果两句、`NEW_UI_POD_EP_RATES = [0.75,1,1.25,1.5,2]` 与「原速 / N 倍」、`NEW_UI_POD_REGION_DEFAULT = 'cn'`、封面种子前缀 `pod:`、`NEW_UI_POD_TOAST`；`src/newui/const/index.ts` 加导出 |
| `src/newui/theme/tokens.ts` | `POD = { rowArt: 56, rowHeight: 74, rankWidth: 22, subsCard: 132, subsArtRadius: 16, subsX: 22, epRowHeight: 89, eplCover: 96, … }`（值全部取自 home.css:26-46 / detail.css:24-39 / episode.css:15-29 与 index.html L766 的量测行高 74 / 89）；`POD_CHART_PAGING = { pageSize: 10, endReachedDistance: RANK_PAGING.endReachedDistance }`（与 `RANK_PAGING` L676 / `PL_POOL_PAGING` L737 并排同区）；`theme/index.ts` 加导出 |
| `src/newui/navigation/screenNames.ts` | `NEW_UI_RADIO_HOME_SCREEN` / `NEW_UI_PODCAST_DETAIL_SCREEN` / `NEW_UI_PODCAST_SEARCH_SCREEN` / `NEW_UI_EPISODE_SCREEN`（沿用 `lxm.NewUiXxxScreen` 命名） |
| `src/newui/navigation/register.tsx` | 四条 `Navigation.registerComponent`（同一 `withNewUiProviders` 包装，L29-35 现成形态） |
| `src/newui/navigation/entry.ts` | 四个 push helper（照 `pushSonglistDetailLayer` L144-179 的 `elementTransitions` + `PL_LAYER.enterDuration`），passProps 只传可序列化 plain object |

**明确不在本清单里**：`src/newui/podcast/`（数据层，并行 agent）、播放列表面板（并行 agent）、`scripts/gen-newui-icons.mjs` 重跑（无新增 symbol）。

### 7.3 接线点

**① 首页入口（原型唯一入口）**
- 原型：`QUICK` 四项仍在（data.js:100-105，`{ key: 'radio', label: '电台' }`），点击 `openRadio()`（app.js L258 / L1799）。
- RN：`const/home.ts:91-96` `NEW_UI_HOME_QUICK_ITEMS` 的 radio 那格**保留**，`QuickRow` 件不动；`screens/Main/pages/HomePage.tsx:228-242` `handleQuickPress` 的 `default: showNewUiToast(NEW_UI_HOME_TODO_TOAST.radio)` 换成 `case NEW_UI_HOME_QUICK_KEYS.radio: pushNewUiRadioHome(componentId)`（HomePage 已持 `componentId`，L208 同判例）。

**② 上一轮遗留占位的处置建议（原型已反向否掉）**

| RN 现状 | 原型结论 | 处置建议 |
|---|---|---|
| `components/RadioCard/` + `const/home.ts:106-119` `NEW_UI_HOME_RADIO_ITEMS` + `NEW_UI_HOME_TITLES.radio`（「随手听」）+ `HomePage.tsx:490-505` 那个 `<Section>` + `HomePage.tsx:339-341` `handleRadioPress` + `tokens.ts:955` `RADIO_CARD` | U33 退役，「这两张卡在原型里已经没有任何对应屏」（index.html L769） | **建议废弃（撤下）**。「改造成别的入口」= 自创布局，违背「原型即真相」；`.wip-tag` 样式本体虽留在 U84，但屏上无实例，救不回这两张卡。撤下会动 HomePage 的 `headerComponent`（少一个区块），是这一处唯一面。 |
| `hooks/useHomeBanners.ts:59-65` 电台条 + `const/home.ts:78-82` `NEW_UI_HOME_BANNER_KEYS.radio` + `HomePage.tsx:210-212` 分支 | 「轮播两条不是营销位…电台不再占一条（首页只留快捷入口那一格）」（index.html L677） | **建议撤掉这一条 banner**（连带 key 与分派分支）。轮播留「音源公告 / 正在播放」两条，与原型同数。 |
| `const/home.ts:72-75` `NEW_UI_HOME_TODO_TOAST.radio`「电台 · 建设中」 | 电台已有真屏 | **作废撤下**（快捷格不再是假动作）。 |

> 以上三条**本轮不动代码**，只给建议；index.html L769 明写「RN 侧是删件还是改造成别的入口，等用户定」——按对撞结论我给的答复是**删**，等用户点头再执行。

**③ 导航：哪些走 RNN 路由，哪些走屏内层状态**

| 原型层 | RN 形态 | 依据 |
|---|---|---|
| `#radioLayer`（U81） | **RNN push**（主屏 stack 上右推新屏） | 原型 `.pl-layer` 右推（index.html L748）；RN 判例 `entry.ts:103-137 pushNewUiSearch` / `:144-179 pushSonglistDetailLayer`，时长 `PL_LAYER.enterDuration`=440（tokens.ts:1391） |
| `#podcastLayer`（U82） | **RNN push**（从 U81 push） | 同上 |
| `#podcastSearchLayer`（U83） | **RNN push**（从 U81 push，与搜歌同一族壳） | 件头「写法与 U64/U65 那一屏同口径」 |
| `#episodeLayer`（U84） | **RNN push**（从 U82 或 U81 的 hero 那颗钮 push） | 原型四层同一路由口径 |
| `#podRegionSheet`（U85） | **屏内层状态**（RadioHomeScreen 内的 `Sheet` 绝对铺层，不开路由） | `Sheet.tsx:92-104` 头注：「实现形态：所在屏幕根 View 内的 absolute-fill 覆盖层…不用 RNN Modal/新路由」；判例 SourceSheet / PlTagsSheet |
| 返回与 Android 系统键 | 全部 `Navigation.pop(componentId)`（原型「一次只收最上面那一层，Esc 与四颗返回钮同口径」index.html L748）；**U84 的 pop 必须同样触发进度落盘**（原型 `closeEpisodeLayer` L2234-L2238 是关层唯一出口，RN 若只在屏内返回钮落盘、系统返回就丢进度，是这条口径的漏点） | — |

**④ passProps 口径**（RNN 走原生桥，必须可序列化，`entry.ts:142-143` 已明写）
- U81 → U82：传**榜行那五项**（id / name / by / tags / 封面 URI）的 plain object（判例 `pushNewUiSonglistDetail` 传 `info: ListInfoItem`）。U82 拿到后自行查详情接口。
- U82 → U84：传 `showId` + `episodeIndex`（或整条单集视图模型）。
- U81 → U83：不传参（U83 自持输入与本机搜词）。

**⑤ 数据与播放的接法边界（纯 UI 层铁律）**
- 五屏的取数、订阅与进度读写、搜词历史**全部由 `src/newui/podcast/`（并行 agent 的数据层）提供 hook/模块**，屏只做展示与回调；本机存储通道判例：`hooks/useNickName.ts:7`（`newui.nickName`）、`utils/recentPlay.ts:19`（`newui.recentPlays`）——即新 UI 自持 AsyncStorage 键，不读不改旧 store。
- U84 **不接歌曲那套取流**（`src/core/player` / `wy.getMusicUrl` 链路）：件头与 index.html L758/L763 的口径是「那条音频直链和歌曲的取流不是一回事」，「不占迷你条，也不进播放列表面板」。**该边界已由用户拍板放行一次（「接上，能真听」）**：单集 ③ 的 `episodeUrl` 现经 `src/newui/podcast/podPlayer.ts` 接**既有播放能力**（`@/plugins/player` 的 `initial/isInitialized/setPlay/setPause/setCurrentTime/getPosition/getDuration/setPlaybackRate` + `TrackPlayer` 的 `reset/add/getState/getCurrentTrack/getTrack/updateNowPlayingMetadata`）真出声。放行只到这一层：不改播放核心/取流/原生桥的内部逻辑，不给单集造歌曲字段、不进播放列表面板、不进播放历史，也不新增依赖。「界面 + 本机进度」的契约照旧，只是进度那条现在是真音频位置。

### 7.4 结构契约：固定头 + 列表独立滚 + 虚拟化

原型本轮定死的结构（`_base.css:211` `.pl-head{flex:none;padding:58px 16px 0}`，外层 `padding:0;overflow:hidden`，滚动段**就是列表本体**）对撞到 RN：

| 屏 | 钉住区放什么 | 滚动容器（本屏唯一的轴） | 轴归零时机 | 触底判据 |
|---|---|---|---|---|
| U81 RadioHome | 顶排 + 订阅那一区 + 当前地区那一行（index.html L766 逐字：「电台首页＝顶排 + 订阅那一区 + 当前地区那一行」） | 榜列 `FlatList` 自己（`home.css:13` `#radioLayer>.pod-list{flex:1;overflow-y:auto;padding:10px 16px 34px}`） | 进层（`openRadio` L1806）与换区（`loadPodRegion` L1955）都归零 | **距底 160px**：`RANK_PAGING.endReachedDistance`（tokens.ts:680）经 `useViewportScroll` 的 px 距离判定（`useViewportScroll.ts:12-19` 明写与 `podChartScroll` L1990 逐字等价），每批 `POD_CHART_PAGE=10`（data.js:573） |
| U82 PodcastDetail | 顶排 + `.pl-hero` + `.pl-actions` +「单集」小标题 `#podEpHead` | 单集列 `FlatList` 自己（`detail.css:13` `padding:6px 16px 34px`） | 进层（`openPodcast` L2045 `list.scrollTop = 0`） | **不分页、不触底、不放「加载更多」**，列表尾不写解释行（index.html L763） |
| U83 PodcastSearch | `.sc-top`（输入框常驻） | `ScrollView`（`.sc-body`） | 提交换词后归零（`submitPodSearch` L2144） | 不触底（命中固定 20 条，app.js L2089） |
| U84 Episode | **无钉住区**——顶排在轴里，整层一根轴（index.html L766 末「单集屏仍是整层滚」） | `ScrollView`（照 SonglistDetail 的整层形态，但**不虚拟化**：本屏是定长块） | 进层（`openEpisode` L2184） | 无 |
| U85 PodRegionSheet | `Sheet` 的 handle + 标题（默认路径下随主体滚，与本抽屉无关） | `Sheet` 默认 `ScrollView` | 开层即顶 | 无（42 行定长） |

**RN 版面账（逐字对回件里，不许自创数值）**
- 屏根：`View{flex:1, backgroundColor: colors.bg}` → 钉住 `View{flex:none, paddingTop: top + PL_LAYER.paddingTopReserve, paddingHorizontal: PL_LAYER.paddingX}`（判例 `SonglistDetailScreen.tsx:608-612`）→ 列表 `flex:1`，`contentContainerStyle` 自带 `paddingHorizontal: 16` + `paddingTop: 10`（榜列）/`6`（单集列）+ `paddingBottom: 34 + bottom`。
- 间距三处 18 档（index.html L766 逐字：订阅区与顶排之间 18、地区行与榜列之间「6 + 2 + 轴自身 padding-top 10」、小标题与首行之间「4 + 8 + 轴自身 padding-top 6」）——**全部取现成档位**，`.subs-block{margin:18px 0 6px}`（home.css:18）、`.pod-region{margin:16px 0 6px}`（home.css:49）、`.ep-head{margin:22px 0 4px}`（detail.css:20）、`.pod-list{margin-top:2px}`（home.css:54）、`.ep-list{margin-top:8px}`（detail.css:18）。
- **不给顶栏做 sticky**（index.html L766 逐字「这一屏只有这一根轴、<em>不给顶栏做 sticky</em>」）。
- 状态行/终点行是**列表自己的 footer cell**（跟着一起滚、留在列表尾，index.html L766），不是钉住区：`ListFooterComponent` 承载 `PagingStatus`/`PagingEnd`。
- 固定段变高会吃掉列表：原型量测手机档「电台固定段 382、轴可视 438（榜行 74，一屏 5 行以上）」「播客详情固定段 348、轴可视 466（单集行 89）」（index.html L766）；真机要重量，但**行高一律不动**（同句口径）。

### 7.5 虚拟列表选型（拍板，不两可）

**结论：电台这两根列（U81 榜列、U82 单集列）都用 `FlatList`，本轮不引入 `@shopify/flash-list`。**

理由：
1. **数据量不在 FlashList 的收益区间**：榜列一次 10 条累加、上限就是接口那固定 50 条（data.js:301「固定 50 条」）；单集列按原型口径**一批封顶 50 且不分页**（index.html L763「取 min(接口一批的上限 50, 这个节目的 trackCount)」；`entity` 不支持翻页偏移，data.js:310）。这量级下 FlashList 省不出可见收益，却要付「首次在本项目真机使用」的风险。
2. **虚拟化在本项目的既有路径是 FlatList**，两处判例现成可抄：`Sheet` 的 `list` 路径（`Sheet.tsx:247-289`）与 `SonglistDetailScreen.tsx:717-740`（`initialNumToRender={10} maxToRenderPerBatch={14} windowSize={9}`）。**FlashList 在 `src/` 全库 0 处使用**（本轮 grep 实证），从零起一轮不该和电台首屏绑在一起做。
3. **触底判据必须锁死在原型的 160px**：`useViewportScroll` 已用 px 距离实现 `scrollTop + clientHeight > scrollHeight - 160` 的逐字等价（`useViewportScroll.ts:12-19 / :95`，`RANK_PAGING.endReachedDistance=160`）。FlashList 的 `onEndReached` 是「视口倍数」语义（`Sheet.tsx:79` 已记录这条折算只能"近似对齐"），换它等于为不需要的性能改动判据口径。**榜列因此用裸 `FlatList` + `useViewportScroll`，不用 `PageListView`**（PageListView 的 `contentContainerStyle` 自带 TabBar 语义：`PageListView.tsx:80-85` 的 `LAYOUT.contentGapAboveTabBar + TAB_BAR.height`，右推层没有 TabBar）。
4. **回收与 SVG 封面的既有判例（核实过原文）**：`PageListView.tsx:46-47`「刻意**不加** `removeClippedSubviews`：回收单元格里的 SVG 封面（Art 内圈层）在 Android 上有整格变白的老毛病（SearchResultPanel 2026-10-12 同轮结论）」；`Sheet.tsx:250-252` 同一口径重述。榜行与单集行都带 `Art`（react-native-svg 14.x 纹理底）→ 新列表必须沿用这条（不开 `removeClippedSubviews`），而 FlashList 的复用池正是同一族风险面，叠加 `react-native-svg` 锁 14.x 的既有约束，风险不对等。
5. **将来放开时的改口条件**（写给以后，不写给本轮）：若单集列真突破 50 条（例如去解析 RSS 或调大 `limit`），再**单独起一轮**只换这一根列，并且第一轮验收必须专门测「滚出去再回来，封面是否整格变白」。

**不虚拟化的两处（同样拍板）**：U83 结果体（≤20 行，`ScrollView`，照 SearchScreen）；U84 整层（定长块，`ScrollView`）；U85 抽屉（42 行定长，`Sheet` 默认主体）。

### 7.6 数据契约（屏上每字段回溯到接口；**待与数据层对齐**）

> **这一条是契约不是实现**：并行 agent 正在按同一份原型口径建 `src/newui/podcast/`。下表字段名沿用原型件里的视图字段（`name` / `by` / `tags` / `count` / `updated` / `episodes[]`），**不自创**；真实类型与最终字段以数据层回报为准。

**接口口径（逐字来自 data.js:296-321 与 index.html L753）**

| 接口 | 给得出 | 给不出 |
|---|---|---|
| ① 排行 `rss.marketingtools.apple.com/api/v2/{country}/podcasts/top/50/podcasts.json` | 一条节目只有 `id` / `name` / `artistName` / `genres[].name` / `artworkUrl100` / `url`，**固定 50 条** | 简介、集数、发布日期、音频直链；封面**只有 100×100 这一档** |
| ② 搜索 `itunes.apple.com/search?term=&media=podcast` | 比①多 `artworkUrl600`、`trackCount`（总集数）、`primaryGenreName`、`feedUrl` | `feedUrl` 本轮不上屏（解析 RSS 不在这三条接口的能力里） |
| ③ 详情/单集 `itunes.apple.com/lookup?id=&entity=podcastEpisode` | `results[0]` 节目本体给 `trackCount` / `genres` / 600 封面 / 最近一集日期；其后每条 `podcast-episode` 给 `trackName` / `releaseDate` / `trackTimeMillis` / `shortDescription`（**可缺席**）/ 音频直链 | **没有节目简介**；`entity` **不支持翻页偏移**——一批给回的就是这一屏的全部 |

**屏上字段 → 来源（逐件）**

| 屏 / 位置 | 屏上呈现 | 来源 |
|---|---|---|
| U81 榜行 | 名次（前 3 渐变字） | **数组序 +1**，不是接口字段（app.js L1900） |
| U81 榜行 | 节目名 / 作者 | ① `name` / `artistName`（mock `by ← artistName`，data.js:302） |
| U81 榜行 | 一枚分类词（`q-tag`） | ① `genres[0].name`（mock `tags ← genres[].name`，data.js:302；行尾只挂**一枚**，podRow L1908-1912） |
| U81 榜行 | 封面 | ① `artworkUrl100`（行 56、订阅卡 132 都用这一档，**不许承诺 600**） |
| U81 订阅区 | 「我听的」+「N 个节目」 | N = 本机名单长度（`LS.podSub`，app.js L1786/1817-1818）；**接口读不到也写不回**（index.html L758） |
| U81 订阅卡 | 「还剩 X 分钟」 | 本机 `LS.podProgress`（app.js L1832「没听过就不写这一行，不编「未听」这种话」） |
| U81 地区行 / U85 抽屉 | 「国内」+ 5 组 42 区 | **不是接口概念**：`POD_REGION_GROUPS`（data.js:320-374），`key` 就是①地址里那一格国家码；默认 `cn`（app.js L1754），**每次进层固定在 cn，不再记上次区**（index.html L760） |
| U81 状态行 | 「正在载入这一区…」「这一区没有取到名单 · 点击重试」「正在载入下一批…」「这一批没有载入 · 点击重试」「没有更多了」 | 换区/分页状态（POD_TXT L1774-1776 + PLD_STATUS L859）；取不到的那一区**走状态行，不假装榜是空的**（index.html L760） |
| U82 hero | 节目名 / 作者 | ③ 或列表带过来的 `name` / `artistName` |
| U82 hero | 分类词（**两枚**） | ③ `genres`，`slice(0, 2)`（app.js L2008-2012） |
| U82 hero | 「共 N 集」「最新单集 M 月 D 日」 | 只有 ②/③ 给得出：`trackCount` / 最近一集 `releaseDate`（app.js L2014-2015，件头「原型里没写进那四个节目的，这两项就不出现」） |
| U82 hero | 「还剩 X 分钟」 | 本机进度（app.js L2016-2018） |
| U82 操作行 | 一颗钮：「继续播放 · 还剩 X」/「播最新单集 · X 分钟」 | 本机进度 + ③ 首集 `trackTimeMillis`（app.js L2027-2030；`p.left > 30` 才走"继续"） |
| U82 单集行 | 集名 / 日期 / 时长 / 进度 tag / 摘要 | ③ `trackName` / `releaseDate` / `trackTimeMillis` / 本机 / ③ `shortDescription`（缺则整段不渲染，epRow L2050-2062）；**无简介位**（detail.html 件头） |
| U83 | 命中行 / 「N 个节目」 | ②；命中固定截 20（app.js L2089）；**没有热搜** |
| U83 idle | 「搜过的词」+ 清空 | 本机 `LS.podSearchHistory`（上限 8，app.js L2075 / L2092-2099） |
| U84 | 集名 / 「节目名 · M 月 D 日」 / 摘要 | ③ `trackName` / `releaseDate` / `shortDescription` |
| U84 | 进度条 / 起止时间 / 三颗钮 / 倍速 | **③ `trackTimeMillis` 起底 + 播放器实测**（本机状态仍走 `LS.podProgress` 那条口径）；倍速五档（app.js L2165）现真传给既有 `setPlaybackRate`，屏上高亮那档 = 播放器当前速率 |
| U84 | 关层落「还剩多少」 | 本机 `LS.podProgress`（`left > 20` 才写，app.js L2238；名单留存 8 条，L1793） |

**这三样干脆不是这三条接口给的（index.html L758 逐字）**：分类目录（无总目录 → **没有分类页**，分类词只作行尾标签）、订阅（在用户账号侧 → 本机）、播放进度（在播放器侧 → 本机）。
**格式化口径**：秒 → 「18 分钟」/「1 小时 06 分」（`podMin` L1780），日期 → 「10 月 15 日」（`podDate` L1782）；屏上只留名词与数字，接口边界一律不上屏（index.html L748/L761）。
**用词（Apple 官方简体中文，件头逐字）**：一个 show = 「节目」，一期内容 = 「单集」，量词「N 个节目 / N 集」；「档」已换掉，「播客」只留作整个频道的名字。

### 7.7 汇总增补

- 原型语义单元：79 → **84**（新增 U81-U85；U33 退役不回收，故 79 + 5 = 84 且 U33 不再计入对撞）。
- 电台对撞判定：**新建 5 屏/抽屉 + 1 共通件（PodcastRow）+ 2 屏级辅件（PodcastHero / EpisodeRow）**；**复用既有件 14 个**（PlTop、CoverWash、Art、HScroll、Icon、QTag、GhostButton、SearchTop、ChipFlow/Chip、GroupLabel、OptionRow、Sheet、PagingStatus、PagingEnd、EmptyTip、SeekControl、SeekTime、PcButton、useViewportScroll）；**缺件 5**（U81-U85 RN 侧原本 0 承接）；**多件 1**（R11 `RadioCard`，随 U33 退役成孤儿件）。
- 一处共通件小改（纯新增分支）：`PlTop` 右上加 `kind: 'icon'`。
- 抽件候选（两处出现即达标，另起轮）：`.section-more`（Section 内 + U81 地区行）、`.sc-label`/`.sc-clear`/`.sc-hint`/`.sc-empty`（SearchIdlePanel 内 + U83）。
- 本节的三条「建议废弃」中，**RadioCard 区块与「建设中」toast 已于 2026-10-19 执行撤下**（用户裁定「接线新 UI」）：`components/RadioCard/` 整目录删除、`RADIO_CARD` token 与 `NEW_UI_HOME_RADIO_ITEMS`/`NEW_UI_HOME_TITLES.radio`/`NEW_UI_HOME_TODO_TOAST.radio` 一并清掉，首页电台入口收敛为快捷那一格 → `RadioHomeScreen`。电台 banner 一条随原型侧收走，RN 侧本无残留。

### 7.8 电台四项决策落地（2026-10-20 轮，挂账处置）

四项决策的结论与落点，逐条对到本节上面的契约条目：

| 决策 | 结论 | 落点 | 挂账处置 |
|---|---|---|---|
| ① 单集要不要真出声 | **要（「接上，能真听」）** | `src/newui/podcast/podPlayer.ts`（新，模块级队列主张 + 每秒取样）+ `usePodPlayer.ts`；`EpisodeScreen.tsx` 的假计时器已清零（`grep setInterval src/newui/screens/Radio/` 现已 0 命中，唯一的取样定时器在 `podcast/podPlayer.ts` 里）。引擎与设置全部取自既有 `@/plugins/player` 与项目已在用的 `react-native-track-player`，**未新增依赖**；`git status --short -- src/core src/plugins src/store package.json` 为空——红线只破在「新增调用面」这一层 | 7.3⑤ 那句「本轮不接播放器」**已处置**（同条内已写明放行边界）；本文档 7.6 表 U84 行「③ `trackTimeMillis` 起底 + 播放器实测」即为处置后的口径 |
| ② 要不要接 RSS | **不接** | `feedUrl` 仍不上屏、不落地，RN 侧没有任何 RSS 解析通道（`mappers.ts` 透传但不显示） | 原型 index.html L766「要不要再开一条 RSS 通道由用户定」= 仍由用户定，本轮不擅自开 |
| ③ 屏上泛化词怎么办（`primaryGenreName` 那类平台给的大类词） | **只剔整词 `Podcasts`**（trim + 大小写不敏感），不做同义词表、不猜类目 | `mappers.ts` L75-87 定义规则，L142 `primaryGenreName` 回落走同一条规则，两处口径一致 | 处置完毕；剩余类目词按接口原样上行 |
| ④ `.wip-tag` 那枚角标要不要落地 | **不落地**，改由闸门登记「无实例豁免」 | `scripts/newui-parity.mjs` 消费 `noInstance` 段（粒度 = 单条选择器，A/B 两条判定都查；每次运行回查 index.html 的 class/id 属性值与 app.js/data.js 正文，原型一旦冒出实例即作废豁免并退出码 2）；`scripts/newui-parity-whitelist.json` 新增 `noInstance.radio/episode.selectors = [".wip-tag"]` + 逐字理由（引 index.html L684 / L768 与件头）；`scripts/newui-parity-map.json` manual 段 `radio/episode` **只钉屏本体** `screens/Radio/EpisodeScreen.tsx` | 7.1 表 `.wip-tag` 行那句「不实现 / 原型无实例」现在有机械作证，不再靠人肉记住。**不许走的回头路**：把 `SeekControl/SeekTime/PcButton/Art/CoverWash` 五个共通件一起钉进 `radio/episode`，flags 也会变 0，但那是拿共通件的数值池替 `.wip-tag` 凑出 `0.4` 和 `999`＝自己放宽检查 |

**闸门侧本轮唯一改动**：`instOk` 这张表此前建了没消费点（A/B 两条判定都不看它，`instSkipped`/`instSkippedList` 是死变量），本轮接进两条判定并让被免条数在结论行可见。数值严格性一项未动：`NUMERIC_PROPS`、`FAM`、新鲜度探针、数值池口径、`flags` 段那 4 条既有抑制项全部原样。

**两处 RN 侧真缺口**（不是豁免，是补齐）：`components/OptionRow/OptionRow.tsx:270` 改用新文件 `src/newui/theme/fontFamily.ts` 的 `MONO_FONT_FAMILY`（补 `letterSpacing`/`fontFamily` 属性族）；`components/SectionNote/SectionNote.tsx:37` 补 `lineHeight: Math.round(FONT_SIZE.caption * LINE_HEIGHT_RATIO)`。

### 7.9 电台与歌曲共用一台原生播放器：已知限制（2026-10-19 挂账，**不改代码**）

> **处置状态：用户 2026-10-19 拍板「先记为已知限制，真机验」**。下面三条不是待办、不是待决策，
> 本轮一律**不动 `src/plugins/player/service.ts`**（既有函数行为，红线内「只新增、不修改」），
> 也不动 `src/core/` / `src/store/`。同一条口径另记在 `src/newui/podcast/podPlayer.ts` 文件头
> 第二节第 5 条（那份是就地注释，本节是对账台账）。
> 本轮只在电台这一侧加了一道闸（本节末行），因为它在我们自己的文件里，且闸不改变任何既有行为。

| # | 现象 | 既有实现出处（行号以现状为准） | 对电台的后果 | 处置 |
|---|---|---|---|---|
| 1 | 通知栏/锁屏那颗**「停止」= 退出应用**，不是停单集 | `service.ts:51-54`：`RemoteStop → handleExitApp('Remote Stop')`（本体 `service.ts:21`） | 单集播着时按它，整个应用被收走；电台那条队列连同「关层时落剩余」那一步都跟着没了（落盘只挂在单集屏卸载那一条路径上）。**用户动作的预期与真实后果完全不一致** | **记为已知限制**，真机验按下去到底是退应用还是只停声 |
| 2 | 通知栏**「上一首 / 下一首」打到歌曲那套 `playNext / playPrev`** | `service.ts:41-44` / `:46-49`（两者导入自 `src/core/player/player.ts`） | 单集在电台队列里只有一条，这两下推进的是**歌曲**的播放列表；最坏结果 = 歌曲重新取流并接管队列、单集由 `reclaimOwnership()` 认出后让位。**不是**「上一集 / 下一集」 | **记为已知限制**，真机验让位是否干净（电台侧不许还显示在播） |
| 3 | `global.lx.playerTrackId` 指针污染的**一小于一条的窗口** | 起播序列 `add([单集])` ↔ `neutralizeSongPointer()` 之间只让一拍（`podPlayer.ts` 的 `ONE_TICK_MS = 0`）；对照 `service.ts:115` 那句 `global.lx.playerTrackId = await getCurrentTrackId()` 的异步续跑 | 若那次续跑恰落在间隙里，指针会被写成 `podcast#…`；此后每秒取样里的 `reclaimOwnership()` 再按回 `''` 兜住。窗口宽度 = 一条 track 的在飞时间（亚秒级），本轮无法在设备上证实 | **记为已知限制**，真机验「播完单集回歌曲页，上次进度有没有被改写」 |

顺带同族的一条（不在用户点名的三条里，但同在 `service.ts` 的远控表，一并记档）：**RemoteSeek**
（`service.ts:75-77`）把通知栏进度条拖动喂给歌曲那侧的 `app_event.setProgress`，
也就是拿单集的位置写歌曲进度——真机验时与第 3 条同测。

**本轮唯一改动（电台这一侧，纯新增）**：加了一道闸——`src/newui/podcast/podPlayer.ts` 的
`blockedBySleepTimer()` 落在 `startPodEpisode` / `resumePodEpisode` 第一行，读
`global.lx.isPlayedStop`（歌曲侧「定时停止播放」的账本，**只读不写**），armed 时不进队列、不出声、
**快照一个字段都不动**（所以那颗钮不会显成可重试的失败态：`failed` 仍专指「直链放不出来」，
两件事的用户动作不一样），只经既有 `showNewUiToast()` 投一句人话提示，文案在
`src/newui/const/radioDetail.ts` 的 `NEW_UI_POD_EP_TOAST.sleepBlocked`（原型无此句，**待用户定**）。
闸落在**起播原语**而不只落在屏上那颗钮：单集屏那颗、详情屏「继续播放 / 播最新单集」的下游、
以后任何调用点都必然经过它。附带工程理由：`service.ts:108 / :117` 那两处
`if (global.lx.isPlayedStop) return handleExitApp('Timeout Exit')`——armed 时真把单集推起来，
播放器状态一变就可能把整个应用退出；闸不改那两处既有行为，只是不去踩它。
`EpisodeScreen.tsx` 因此补挂一台 `NewUiToastHost`（本屏是 push 出的独立根层，不挂则提示落在被盖住的
主屏上＝无声失败）。`PodcastDetailScreen.tsx` 未动：那颗钮只做 `pushNewUiEpisode` 导航、本身不发音，
拦它会变成「定时开着连看都不让看」，超出「不起播」这条拍板的边界。

---

*本节为 2026-10-17 追加，改写范围 = 本文件（新增第七节）；`new_design/` 四源与 `new_design/parts/` 全程只读，未写任何 RN 组件/屏代码，未加依赖，未起服务。**代码完成度为零、未经设备验收**（本轮只出契约）。*
