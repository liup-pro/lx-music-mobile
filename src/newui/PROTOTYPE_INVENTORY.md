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
| U33 .radio-card/.wip-tag | home/radio-card.html | RadioCard（wip-tag 为同件角标） | 1:1 |
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
