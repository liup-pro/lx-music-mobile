# PROTOTYPE_INVENTORY —— 原型语义单元 ↔ RN 组件双向对撞清单

- 基线：RN 侧 HEAD `714474e`；原型侧 `164dfa4`（评论浮层「标题与总数钉住、只有列表滚」已生效）。
- 方法：第一步按 `new_design/index.html`（结构根）+ `styles.css`（前缀选择器组）+ `app.js`（渲染函数）三处同时有归属者为**语义单元**；第二步穷举 `src/newui/components/`（56 个共通件目录）与 `src/newui/screens/`（屏级件）；第三步五档对撞（一致 / RN 缺件 / RN 多件 / 粒度偏粗 / 粒度偏细）；第四步反向清单。
- 本轮只做粒度对撞，不做第三遍视觉审计（D01–D90 已修完）。`new_design/` 全程只读。

约定：行号均来自本轮真实读码（原型 index.html 696 行 / styles.css 1172 行 / app.js 2643 行 / data.js 350 行）。
「RN 缺件（内联）」= 原型单元在 RN 没有专属组件、由页面内联 View/Text 承担，注明内联落点——这是下一步 `parts/` 拆件的头号候选。

---

## 一、原型语义单元穷举清单

### A. 共通控件层（跨页复用的选择器组）

| # | 单元 | index.html | styles.css | app.js 渲染/逻辑 | 单元内固定文案 |
|---|------|-----------|------------|------------------|----------------|
| U01 | `.topbar`（头像/搜索/波纹钮） | L84-98 | L105-144 | 事件接线 L2558/L2572-2573 | — |
| U02 | `.icon-btn` | 多处复用（L86-96 等） | L105-144 | — | — |
| U03 | `.pulse-dot`（castDot） | L94 | L105-144 区段 | renderNav L2510-2519（`#castDot` L2518） | — |
| U04 | `.tabbar` `.tab` | L289-307 | L551-573 | PAGES/switchTab L2452-2465 | 首页/歌单/排行/我的/设定 |
| U05 | `.minibar`（mini-* 含 .mini-progress） | L273-286 | L525-548 | syncLists L1624 区段 | — |
| U06 | `.toast` | L512 | L811-818 | toast L101-108 | — |
| U07 | `.art`（程序化封面体系） | 全项目处复用 | L176-187 | svgArt/art/coverArt/faceArt L21-99 | — |
| U08 | `.chip` | L154 等 | L147-157 | — | — |
| U09 | `.section` `.section-head` | 各页多处 | L160-173 | 各 renderXxx 内联 | 区块标题（继续收听/推荐歌单/热门单曲…） |
| U10 | `.foot-note` | L159-162、L194-197、L212-214、L252-254 | L350-351 | — | 首页「曲库内容来自各平台 · 能否播放取决于当前音源」；歌单「歌单目录来自平台曲库 · 每首歌要到播放时才取回可用地址」；排行「榜单由各平台整理 · 点进去看完整排名」；我的「收藏 · 播放记录 · 自建歌单都只存在这台设备上」 |
| U11 | `.empty-tip` | L181、L190 等 | L354-366 | 各 render 内联 | 「还没有自建歌单 · 听到喜欢的先收藏进来」「这个分类下暂时没有推荐 · 换一个分类试试」 |
| U12 | `.ghost-btn` | L140、L383 等 | L321-326 | renderSongs/openPlaylist | 「播放全部 N 首」 |
| U13 | `.play-badge` | 封面钮内 | L224-237 | renderRecent 等 | — |
| U14 | `.q-tag` | 行内复用 | L190-194 | songRow L438 区段 | 音质/时长标签 |
| U15 | `.src-badge` | 行内复用 | L270-318 区段 | songRow | 平台名 |
| U16 | `.hscroll` + `.recent-card` | L113-119 | L224-237 | renderRecent/clearRecent L255-290 | 「继续收听」；空态「还没有播放记录 · 先从排行榜里点一首」(L245) |
| U17 | `.sheet` 浮层 chrome（mask/body/handle/title/sub + 钉住规则） | L389/L411/L432/L448/L459/L477/L487/L499 | L716-738，**L734-738（164dfa4 钉住：sheet-body flex 列 overflow hidden，#psBody flex:1 独滚）** | openSheet L1999-2008 | — |
| U18 | `.group-label` | 浮层内复用 | L739-761 区段 | renderSheet/renderTagGroups | 已安装音源/音乐平台/音质/导入音源 |
| U19 | `.opt-list` `.opt-row`（radio/or-body/or-state/opt-ic） | L399-405 | L739-761 | renderSheet L2172-2259 | — |
| U20 | `.op-box` `.op-input` `.op-go` `.op-err` | L420-424、L438-441、L467 | L763-775 | plId/create/name 三浮层 | 打开/创建/保存 |
| U21 | `.q-chips`（+q-note） | L401、L406 | L739-761 区段 | renderSheet（音质 chip「X→按Y播」、q-note 三句）| 「不开启」「N 分钟」（renderTimerSheet） |
| U22 | `.toggle` `.sw-row` | L493 区（timer 浮层） | L684-713 | renderTimerSheet L1999-2039 | 「等当前这首放完再停」「若想听完当前这首再停，可将循环模式切到「单曲循环」。」 |
| U23 | sprite（36 枚 symbol） | L12-54 | — | svgArt 等按名取用 | — |

### B. 首页（page-home L104-164）

| # | 单元 | index.html | styles.css | app.js | 固定文案 |
|---|------|-----------|------------|--------|----------|
| U24 | `.banner-wrap` `.banner`（b-tag/veil） | L106-109 | L197-214 | bannerItems/renderBanners/bannerPaint/startBannerCarousel L150-228 | 电台条「按口味随机播放 · 建设中」 |
| U25 | `.quick-row` | L111 | L217-221 | renderQuick L230-253 | 每日推荐/排行榜/电台/我喜欢（QUICK）；「电台 · 建设中」toast |
| U26 | `.daily-card` | L121-123 | L240-253 | renderDaily/todayLabel L292-325 | 今日推荐 |
| U27 | `.pl-grid` `.pl-card` | L125-131 | L256-263 | renderPlaylists/plCard L327-347 | 「N 播放」 |
| U28 | `.rank-tabs` | L135 | L266-267 | renderRankTabs L349-460 区段 | 榜名 |
| U29 | `.song-list` `.song-row`（sr-*/src-badge/q-tag/play-badge） | L138-141 | L270-318 | renderSongs/songRow L349-460 | — |
| U30 | `.sr .eq`（播放中三柱） | 行内 | L298-301 | songRow | — |
| U31 | `.artist-card` | L146-149 | L329-332 | renderArtists L1531-1552 | — |
| U32 | `.section-note` | L148 | L354-366 | renderArtists | 「歌手主页建设中 · 先播放这张榜里 TA 的歌曲」 |
| U33 | `.radio-grid` `.radio-card` `.wip-tag` | L152-157 | L335-347 | renderRadio L1554-1570 | 私人 FM/赫兹电台 + 「建设中」 |

### C. 歌单页（page-playlist L167-199）

| # | 单元 | index.html | styles.css | app.js | 固定文案 |
|---|------|-----------|------------|--------|----------|
| U34 | `.page-head` + `.pl-open-btn` | L169-172 | L354-366 | renderPlaylistPage L719-753 | 打开歌单链接/ID |
| U35 | `.cat-row`（position:sticky L369-376） | L174 | L369-376 | renderPlaylistPage | 分类词 |
| U36 | `.my-pl-row` `.my-pl` | L176-183 | L379-385 | renderPlaylistPage | 「我的歌单」+ myPlEmpty 文案（U11） |
| U37 | `.pl-count` | L187 | L354-366 | paintPlPool L756-767 | 「已列出 N / M 个」 |
| U38 | 推荐池 `.pl-grid`（复用 U27） | L185-192 | L256-263 | paintPlPool | plPoolEmpty 文案（U11） |

### D. 排行榜页（page-rank L202-215）

| # | 单元 | index.html | styles.css | app.js | 固定文案 |
|---|------|-----------|------------|--------|----------|
| U39 | `.rank-grid` `.rk-card`（rk-emblem/rk-name/rk-sub） | L202-215 | L387-408 | rankCard L635-648 | 榜名 + 副题 |
| U40 | `.rank-group` 组头 | 同上 | L387-408 | rankGroupHead L494-500 | 「N 个榜 · 热歌 / 新歌 / 飙升在前」 |
| U41 | chartArt 符号体系（CHART_ACCENT/TINT/EMBLEM/shadeHex） | — | — | L573-633（六枚符号 L598-622） | — |

### E. 我的页（page-mine L218-255）

| # | 单元 | index.html | styles.css | app.js | 固定文案 |
|---|------|-----------|------------|--------|----------|
| U42 | `.mine-head`（mh-*/头像大字） | L220-227 | L411-428 | renderMinePage L1206-1252 | mh-sub「没有账号 · 收听都记在这台设备上」 |
| U43 | `.stat-row` `.stat` | L229 | L411-428 | renderMinePage | 喜欢/歌单/最近播放 |
| U44 | `.fav-card` | L230 | L430-443 | renderMinePage | 我喜欢 |
| U45 | `.song-list.compact`（最近播放复用 U29） | L232-238 | L445-447 | renderMinePage | — |
| U46 | 我的歌单区（pl-card 复用 + plCardMine） | L240-248 | L256-263 | plCardMine L1254-1266 | — |
| U47 | nameSheet（改昵称浮层） | L459-474 | L716-775 复用 | NICK_PICKS L1165 区段 | 「头像用昵称的第一个字，顶左上角的那颗圆也一起换。」「想叫什么」「保存」「换个快的」「昵称只保存在这台设备的存储里，不上传任何服务器 · 更换设备后回到「EchoIsle」。」 |

### F. 设定页（page-setting L258-268）

| # | 单元 | index.html | styles.css | app.js | 固定文案 |
|---|------|-----------|------------|--------|----------|
| U48 | `.set-hero` `.sh-sub` | L259-261 | L485-508 | renderSettings L1359-1394 | setSub「这里的开关只作用于这台设备 · 不影响曲库内容，也不上传任何数据」 |
| U49 | `.set-group` `.set-list` `.set-row` `.set-ic` `st-l/st-r` | L263-267 | L485-508 | setGroup/setRow/setToggle L1332-1357 | 明/暗/系统三档（themeRow L1375-1379）、关于行 |

### G. 播放页（player-layer L310-352）

| # | 单元 | index.html | styles.css | app.js | 固定文案 |
|---|------|-----------|------------|--------|----------|
| U50 | `.player-bg` | L311 | L576-589 | paintPlayer L1748-1780 | — |
| U51 | `.player-top` + `.player-crumb` | L313-317 | L576-589 | paintPlayer | 面包屑 |
| U52 | `.player-stage` `.disc` | L319-322 | L592-616 | paintPlayer + bindStageSwipe L1953-1997 | — |
| U53 | `.lyric-wrap/.lyric-scroll/.ln/.ln-note/.ln-empty` | L323-326 | L592-616 | renderLyric/syncLyric/setLyric L1834-1880 | 「这首歌暂时没有歌词 · 或歌词仍在载入」「歌词由各平台提供」 |
| U54 | `.stage-dots` | L327 | L644-648 | bindStageSwipe | — |
| U55 | `.player-meta`（player-info/pc.fav） | L330-333 | L619-629 | paintFav/toggleFav L1795-1832 | — |
| U56 | `.player-source` | L334-336 | L619-629 | paintPlayer | 平台+音质文本 |
| U57 | `.seek` | L337 | L632-640 | tick/step/seekTo L1670-1746 | — |
| U58 | `.seek-time` | L338 | L632-640 | paintProgress L1782-1792 | — |
| U59 | `.player-controls` `.pc` | L339-343 | L651-656 | LOOP_ORDER/LOOP_ICON/LOOP_NAME L1590-1595、step | — |
| U60 | `.player-tools` `.pt-btn` | L346-351 | L659-663 | paintTimerTag/toggleFloat | 定时/循环/浮窗/评论 |
| U61 | `.lrc-float`（歌词悬浮窗） | L355-359 | L666-681 | syncFloat/paintFloatBtn/toggleFloat/bindFloatDrag L1882-1934 | — |

### H. 搜索层（search-layer L362-372）

| # | 单元 | index.html | styles.css | app.js | 固定文案 |
|---|------|-----------|------------|--------|----------|
| U62 | `.sc-top` `.sc-box` `.sc-cancel` | L363-367 | L777-808 | openSearch 接线 | placeholder「搜歌名、歌手、歌单」「取消」 |
| U63 | `.sc-tabs` | L368-371 | L777-808 区段 | scTabs L2374-2383 | 单曲/歌单 + 计数 |
| U64 | `.sc-label` `.sc-clear` | sc-body 内 | L777-808 | renderSearchIdle L2331-2348 | 「搜索历史」「大家都在搜」 |
| U65 | `.sc-empty` `.sc-hint` | sc-body 内 | L777-808 | renderSearch 区段 | 「正在搜索…」「没找到和「X」对得上的歌或歌单」「到设定页查看音源」 |

### I. 歌单详情层（plLayer L375-386）

| # | 单元 | index.html | styles.css | app.js | 固定文案 |
|---|------|-----------|------------|--------|----------|
| U66 | `.pl-bg`（blur64+saturate150 氛围层） | L376 | L451-482 | openPlaylist L888-982 | — |
| U67 | `.pl-top` `.pl-crumb` `.pl-fav-btn` | L377-380 | L451-482 | PLD_CRUMB L826-842 | 分类面包屑 |
| U68 | `.pl-hero`（ph-body/ph-sub/ph-meta/sep） | L382 | L451-482 | openPlaylist（chartArt 头图 L891） | 「n/m 首可播」「N 首」「N播放」 |
| U69 | `.pl-actions`（ghost+随机钮） | L383 | L451-482 | PLD_LABELS L848-864 | 「播放全部 N 首」「随机播放」 |
| U70 | 详情曲目表（song-list 复用 + `.pl-status` `.pl-end`） | L384 | L270-318 + 状态行 | renderPlTracks L985-1000 | PLD_STATUS L826-842「正在载入下一批…」「这一批没有载入 · 点击重试」「没有更多了」；PLD_EMPTY fav/localEmpty/end |
| U71 | `#plFoot`（foot-note 复用 U10） | L385 | L350-351 | PLD_FOOT L826-842 | 分对象三句 |

### J. 浮层族（复用 U17 chrome 的实例）

| # | 单元 | index.html | styles.css | app.js | 固定文案 |
|---|------|-----------|------------|--------|----------|
| U72 | sourceSheet | L389-408 | L716-775 复用 | renderSheet L2172-2259 + renderImportRow/handleImport L2261-2288 | sheetSub「音源只负责一件事…」；「导入」；「X→按Y播」；q-note 三句 |
| U73 | plIdSheet | L411-429 | 同上 | L1077-1161（PLID 表 L1087-1096） | 「把平台上分享出来的歌单链接贴进来，或者只填那串歌单 ID。」「歌单链接 / ID」「打开」「只填 ID 的话，先点这份歌单来自哪个平台」「可以试试这几个」「歌单包含哪些平台的歌曲取决于歌单本身 · 能否播放在点播放时确认。」 |
| U74 | createSheet | L432-445 | 同上 | L1268-1319（CREATE_TXT L1272-1277） | 「起个名字就能建，建好就出现在「我的歌单」这一排里。」「你想起啥名...」「创建」「新歌单只存在这台设备上，进入后即可添加歌曲。」 |
| U75 | plTagsSheet | L448-456 | 同上 | openTagSheet L770-779、renderTagGroups L781-797 | 「当前平台的全部分类 · 选一个，下面的推荐歌单就换成这一类。」「正在从平台获取分类…」「这个平台暂时取不到分类 · 稍后再试」 |
| U76 | moreSheet（`.more-song` + more-actions） | L477-484 | L518-522 + opt-list | openMore/actRow L1471-1529 | 「收藏到「我喜欢」」「下一曲播放」「加入「X」」 |
| U77 | confirmSheet（`.cf-actions` `.cf-btn`） | L499-510 | L511-515 | askConfirm L1453-1461 | 「取消」「确定」「要执行这一步吗」 |
| U78 | timer 浮层（`#playerSheet` 实例一） | L487-496 | L684-713 | renderTimerSheet L1999-2039 | 「不开启」「N 分钟」「等当前这首放完再停」 |
| U79 | comment 浮层（`#playerSheet` 实例二，cmt-total/cmt-item/cmt-reply/cmt-to；**164dfa4：cmt-total 钉在 #psMeta，仅 #psBody 滚**） | 同上 | L684-713 + L734-738 | 评论 L2041-2154（CMT_TXT L2045-2057、renderCommentSheet L2063-2088、cmtItem 嵌套树 L2131-2154） | 「评论」标题族、总数行、回复层级、「收起/展开」族 |

### K. 查看器 chrome（非 App UI，不参与对撞，RN 有意不承接）

| # | 单元 | index.html | styles.css | app.js | 备注 |
|---|------|-----------|------------|--------|------|
| V1 | `.viewer-bar` 设备切换条 | L59-67 | L854-865 | 设备外形 L2467-2508 | 原型演示壳 |
| V2 | `.phone`/`.screen`/`.island`/`.statusbar` | L70-81 | L70-102 | fitFrame | 手机外框与假状态栏 |
| V3 | `.notes` 文档面板 + `.swatches` | L518-689 | L821-836 | renderSwatches L2521-2530 | 原型设计说明 |
| V4 | Pad/land 覆盖层 + 侧栏专属件（`.nav-brand` `.nav-sep` `.nav-label` `.nav-foot`） | L290-306 | L870-1118 | renderNav L2510-2519 | 「本地曲库 · 五平台」；手机竖屏 display:none |

**无归属元素清单：空。** index.html L1-696 的全部元素均落位：U01-U79（App 功能）、U23（sprite）、V1-V4（查看器壳/文档）、head/meta/script 标签（harness）。

---

## 二、RN 组件清单（第二侧）

### 共通件 `src/newui/components/`（56 目录，桶文件 index.ts 统一导出）

Art、ArtistCard、Banner、BrandAvatar、CardGrid、ChartArt、Chip、ChipFlow、ChipRow、ConfirmSheet、CoverWash、DailyCard、DiscArt、EmptyTip、FavCard、FootNote、GhostButton、Glass(BlurredContainer)、GroupLabel、HScroll、Icon(icons.ts 生成物)、IconButton、LyricList、Minibar、MineHeader、MyPlCard、OpInputRow、OptionRow、PageHeader、PageViewport、PagingEnd、PagingStatus、PcButton、PillButton、PlCard、PlayBadge、PlayerToolButton、QTag、QuickRow、RadioCard、RankCard、RankGroupHead、RecentCard、RunningDots、Section、SeekControl、SettingsGroup、SettingsRow、Sheet、SongRow(内含 EqBars)、StageDots、StatRow、Switch、TabBar、Toast(NewUiToastHost)、TopBar

引用图要点（grep 实证）：
- Main/index → TopBar/TabBar/PageViewport/CatStickerBar/MinibarDock/ConfirmSheet/NewUiToastHost + 六个 sheet
- HomePage → Banner/QuickRow/Section/HScroll/RecentCard/DailyCard/PlCard/ChipRow/SongRow/GhostButton/ArtistCard/CardGrid/RadioCard/FootNote/PageListView/EmptyTip
- PlaylistPage → PageHeader/ChipRow/Section/HScroll/MyPlCard/PlCard/EmptyTip/PagingStatus/PagingEnd/FootNote/PillButton/PageListView
- RankPage → PageHeader/CardGrid/RankGroupHead/RankCard/EmptyTip/FootNote/PagingStatus/PagingEnd
- MinePage → MineHeader(→BrandAvatar+PillButton)/StatRow/FavCard/Section/SongRow/CardGrid/PlCard/EmptyTip/FootNote
- SettingPage → PageHeader/SettingsGroup/SettingsRow/ConfirmSheet
- Player/index → DiscArt/IconButton/LyricList/PcButton/PlayerToolButton/QTag/SeekControl/StageDots/SrcBadge + sheets(Comment/Timer) + PlayerStageSwipe
- SonglistDetailScreen → CoverWash/IconButton/GhostButton/SongRow/PagingStatus/PagingEnd/EmptyTip/FootNote/ConfirmSheet/NewUiToastHost/MoreSheet + PlaylistHero
- Search 屏 → Icon/Chip/GhostButton/PlCard/SongRow/ChipFlow
- 浮层族 → Sheet(→Glass)/GroupLabel/OptionRow/ChipFlow/OpInputRow/Switch/QTag/Art/SrcBadge
- PagingStatus → RunningDots；Toast(NewUiToastHost) → BlurredContainer + utils/newUiToast 总线

### 屏级件 `src/newui/screens/`（16 个非页面文件）

`Main/CatStickerBar.tsx`（歌单页 cat-row 吸顶复制层）、`Main/MinibarDock.tsx`（minibar 挂载容器）、`Main/sheets/{SourceSheet,PlIdSheet,CreateListSheet,PlTagsSheet,NameSheet,MoreSheet}.tsx`（六浮层）、`Player/PlayerStageSwipe.tsx`（舞台右滑手势件）、`Player/sheets/{CommentSheet,TimerSheet}.tsx` + `Player/sheets/CommentNode.tsx`（评论递归展示件）、`Search/{SearchScreen,SearchIdlePanel,SearchResultPanel(内含 SearchTabs)}.tsx`、`SonglistDetail/{SonglistDetailScreen,PlaylistHero}.tsx`。

---

## 三、双向对撞主表

结论口径：**一致**=粒度对上；**RN 缺件**=无专属件、内联在页面（注明落点）；**RN 多件**=RN 有而原型无对应单元；**粒度偏粗**=一个 RN 件吃下多个原型单元；**粒度偏细**=一个原型单元被 RN 拆成多个件。

| 原型单元 | 原型出处（html / css / js 行号见上表） | 对应 RN 件 | 结论 |
|---|---|---|---|
| U01 .topbar | L84-98 / L105-144 / — | TopBar | 一致 |
| U02 .icon-btn | 复用 / L105-144 / — | IconButton | 一致 |
| U03 .pulse-dot | L94 / L105-144 / L2518 | IconButton `dot` prop（TopBar.tsx L148） | 一致（prop 化，未另立件） |
| U04 .tabbar | L289-307 / L551-573 / L2452-2465 | TabBar | 一致（Pad 专属 nav-* 归 V4 不承接） |
| U05 .minibar | L273-286 / L525-548 / L1624 | Minibar + MinibarDock | 一致 |
| U06 .toast | L512 / L811-818 / L101-108 | Toast(NewUiToastHost)+utils/newUiToast | 一致（D-09 轮落地） |
| U07 .art | 复用 / L176-187 / L21-99 | Art + utils/pickArtPalette | 一致 |
| U08 .chip | L154 / L147-157 / — | Chip | 一致 |
| U09 .section/.section-head | 各页 / L160-173 / 各 render | Section | 一致 |
| U10 .foot-note | 四页四处 / L350-351 / — | FootNote（文案由容器/const 传入） | 一致 |
| U11 .empty-tip | L181、L190 / L354-366 / — | EmptyTip | 一致 |
| U12 .ghost-btn | L140、L383 / L321-326 / — | GhostButton | 一致 |
| U13 .play-badge | 封面内 / L224-237 / — | PlayBadge（SongRow/Banner 复用） | 一致 |
| U14 .q-tag | 行内 / L190-194 / L438 | QTag | 一致 |
| U15 .src-badge | 行内 / L270-318 / — | SrcBadge | 一致 |
| U16 .hscroll+.recent-card | L113-119 / L224-237 / L255-290 | HScroll + RecentCard | 一致 |
| U17 .sheet chrome（含 164dfa4 钉住） | 八实例 / L716-738 / L1999-2008 | Sheet（list 模式+onEndReached） | 粒度偏粗（一个 Sheet 吃下 chrome+八实例骨架；实例本体各见 U72-U79）｜**备注**：原型 164dfa4 的 cmt-total 钉在 #psMeta，RN 把总数行放进 listHeader 随列表滚（CommentSheet.tsx L150-177），钉住语义有出入——属行为审计范畴，粒度不扣档 |
| U18 .group-label | 浮层内 / L739-761 / — | GroupLabel | 一致 |
| U19 .opt-row | L399-405 / L739-761 / L2172-2259 | OptionRow | 一致 |
| U20 .op-box 族 | L420/L438/L467 / L763-775 / 三浮层 | OpInputRow | 一致 |
| U21 .q-chips | L401、L406 / L739-761 / L1999-2039 | ChipFlow（+Chip） | 一致 |
| U22 .toggle | timer 浮层 / L684-713 / L1999-2039 | Switch | 一致 |
| U23 sprite | L12-54 / — / — | Icon/icons.ts（scripts/gen-newui-icons.mjs 生成，36 枚） | 一致 |
| U24 .banner | L106-109 / L197-214 / L150-228 | Banner + useHomeBanners | 一致 |
| U25 .quick-row | L111 / L217-221 / L230-253 | QuickRow | 一致 |
| U26 .daily-card | L121-123 / L240-253 / L292-325 | DailyCard | 一致 |
| U27 .pl-grid/.pl-card | L125-131 / L256-263 / L327-347 | PlCard（排布壳 CardGrid/HScroll） | 一致 |
| U28 .rank-tabs | L135 / L266-267 / L349-460 | ChipRow | 粒度偏粗（与 U35 并吃一组件） |
| U29 .song-row 族 | L138-141 / L270-318 / L349-460 | SongRow | 一致 |
| U30 .sr .eq | — / L298-301 / songRow | SongRow/EqBars.tsx | 一致 |
| U31 .artist-card | L146-149 / L329-332 / L1531-1552 | ArtistCard | 一致 |
| U32 .section-note | L148 / L354-366 / renderArtists | 无专属件——内联 Text 于 `screens/Main/pages/HomePage.tsx`（文案 const/home.ts L74） | **RN 缺件（内联）** |
| U33 .radio-card/.wip-tag | L152-157 / L335-347 / L1554-1570 | RadioCard（wip-tag 为同件角标，tokens L950-954） | 一致 |
| U34 .page-head/.pl-open-btn | L169-172 / L354-366 / L719-753 | PageHeader(after=PillButton) | 一致 |
| U35 .cat-row(sticky) | L174 / L369-376 / L719-753 | ChipRow variant="cat" + **CatStickerBar**（主屏根层复制件，Main/index.tsx） | RN 多件（吸顶复制层为 RN 特有实现，见反向 R3；chip 本体与 U28 合吃偏粗） |
| U36 .my-pl-row | L176-183 / L379-385 / L719-753 | MyPlCard | 一致 |
| U37 .pl-count | L187 / L354-366 / L756-767 | 无专属件——内联 Text 于 `screens/Main/pages/PlaylistPage.tsx`（池子标题行） | **RN 缺件（内联）** |
| U39 .rk-card | L202-215 / L387-408 / L635-648 | RankCard + CardGrid | 一致 |
| U40 .rank-group 组头 | 同上 / L387-408 / L494-500 | RankGroupHead | 一致 |
| U41 chartArt 符号体系 | — / — / L573-633 | ChartArt（components/ChartArt/ + chart.ts） | 一致 |
| U42 .mine-head | L220-227 / L411-428 / L1206-1252 | MineHeader（内拆 BrandAvatar+PillButton） | 粒度偏细（1 单元 → 3 件；BrandAvatar 同时供 TopBar 复用，拆分有Reuse理由） |
| U43 .stat-row | L229 / L411-428 / L1206-1252 | StatRow | 一致 |
| U44 .fav-card | L230 / L430-443 / L1206-1252 | FavCard | 一致 |
| U45 .song-list.compact | L232-238 / L445-447 / — | SongRow `compact` prop | 一致（变体 prop 未另立件，合理） |
| U47 nameSheet | L459-474 / L716-775 / L1165 区段 | screens/Main/sheets/NameSheet.tsx | 一致 |
| U48 .set-hero | L259-261 / L485-508 / L1359-1394 | 无专属件——内联 View+Text 于 `screens/Main/pages/SettingPage.tsx` L107-110 | **RN 缺件（内联）** |
| U49 .set-group/.set-row | L263-267 / L485-508 / L1332-1357 | SettingsGroup + SettingsRow | 一致 |
| U50 .player-bg | L311 / L576-589 / L1748-1780 | 内联 LinearGradient 于 `screens/Player/index.tsx` | **RN 缺件（内联）** |
| U51 .player-top/.player-crumb | L313-317 / L576-589 / paintPlayer | 内联 View+Text 于 Player/index.tsx（钮=IconButton） | **RN 缺件（内联）** |
| U52 .player-stage/.disc | L319-322 / L592-616 / L1953-1997 | PlayerStageSwipe + DiscArt（+LyricList 内容件） | 粒度偏细（1 单元 → 手势壳+两内容件；手势是 reanimated 落地必需） |
| U53 .lyric-* | L323-326 / L592-616 / L1834-1880 | LyricList | 一致 |
| U54 .stage-dots | L327 / L644-648 / L1953-1997 | StageDots | 一致 |
| U55 .player-meta/.pc.fav | L330-333 / L619-629 / L1795-1832 | 内联 title/artist Text 于 Player/index.tsx（钮=PcButton） | **RN 缺件（内联）** |
| U56 .player-source | L334-336 / L619-629 / paintPlayer | 内联 View 于 Player/index.tsx（徽标=SrcBadge+QTag） | **RN 缺件（内联）** |
| U57 .seek | L337 / L632-640 / L1670-1746 | SeekControl | 一致 |
| U58 .seek-time | L338 / L632-640 / L1782-1792 | 内联 Text 于 Player/index.tsx | **RN 缺件（内联）** |
| U59 .player-controls/.pc | L339-343 / L651-656 / L1590-1595 | PcButton | 一致 |
| U60 .player-tools/.pt-btn | L346-351 / L659-663 / paintTimerTag | PlayerToolButton | 一致 |
| U61 .lrc-float | L355-359 / L666-681 / L1882-1934 | **RN 无此功能**（README.md L555 实锤「未新建」；工具钮 float 接的是系统桌面歌词） | **RN 缺件（功能未建）** |
| U62 .sc-top/.sc-box/.sc-cancel | L363-367 / L777-808 / openSearch 接线 | 无专属件——内联 View 于 `screens/Search/SearchScreen.tsx`（L200-320 段 styles.top/box） | **RN 缺件（内联）** |
| U63 .sc-tabs | L368-371 / L777-808 / L2374-2383 | SearchTabs（SearchResultPanel.tsx L267-323 屏内件） | 一致（未入 components/ 桶，单屏单用合理） |
| U64 .sc-label/.sc-clear | sc-body / L777-808 / L2331-2348 | SearchIdlePanel.tsx（屏级件整体承接 renderSearchIdle；label/clear 为其内联子结构） | 一致（屏级件=原型渲染函数粒度） |
| U65 .sc-empty/.sc-hint | sc-body / L777-808 / L2329-2333 | SearchResultPanel.tsx + SearchIdlePanel.tsx | 一致 |
| U66 .pl-bg | L376 / L451-482 / L888-982 | CoverWash（blur 降级为纵向渐隐共通件） | 一致 |
| U67 .pl-top/.pl-crumb/.pl-fav-btn | L377-380 / L451-482 / PLD_CRUMB | 无专属件——内联 View 于 `SonglistDetailScreen.tsx` L614-657（styles.top/crumb；钮=IconButton） | **RN 缺件（内联）** |
| U68 .pl-hero/ph-* | L382 / L451-482 / L888-982 | PlaylistHero.tsx | 一致 |
| U69 .pl-actions | L383 / L451-482 / L985-1000 | 无专属件——内联 View 于 SonglistDetailScreen.tsx L670-687（钮=GhostButton+IconButton） | **RN 缺件（内联）** |
| U70 .pl-status/.pl-end | L384 / L270-318 区 / L826-842 | PagingStatus(+RunningDots)/PagingEnd + EmptyTip(PLD_EMPTY 三句 const) | 一致 |
| U71 #plFoot | L385 / L350-351 / PLD_FOOT | FootNote（NEW_UI_PLD_FOOT_NOTE[kind]） | 一致 |
| U72 sourceSheet | L389-408 / chrome / L2172-2288 | Main/sheets/SourceSheet.tsx | 一致 |
| U73 plIdSheet | L411-429 / chrome / L1077-1161 | Main/sheets/PlIdSheet.tsx | 一致 |
| U74 createSheet | L432-445 / chrome / L1268-1319 | Main/sheets/CreateListSheet.tsx（+ConfirmSheet 复用） | 一致 |
| U75 plTagsSheet | L448-456 / chrome / L770-797 | Main/sheets/PlTagsSheet.tsx | 一致 |
| U76 moreSheet(.more-song) | L477-484 / L518-522 / L1471-1529 | Main/sheets/MoreSheet.tsx（.more-song=件内头部 L152-176） | 一致 |
| U77 confirmSheet | L499-510 / L511-515 / L1453-1461 | ConfirmSheet | 一致 |
| U78 timer 浮层 | L487-496 实例 / L684-713 / L1999-2039 | Player/sheets/TimerSheet.tsx（**sw-row 行面板=件内联 View L88-95**） | 一致（sw-row 壳未另立件，仅一处使用者，暂不记缺件） |
| U79 comment 浮层 | L487-496 实例 / L684-713+L734-738 / L2041-2154 | Player/sheets/CommentSheet.tsx + CommentNode.tsx | 一致（粒度：cmt-total 为件内 listHeader 子结构；164dfa4 钉住语义差异见 U17 备注） |

### 无原型对应的 RN 件（→ 反向清单第四第四节）

PageViewport/PageListView/usePageEndReached/useViewportScroll（R1）、CatStickerBar（R2）、CoverWash（R3）、Glass/BlurredContainer（R4）、RunningDots（R5）、CardGrid/ChipRow/ChipFlow/HScroll（R6）、MinibarDock（R7）、NewUiToastHost 订阅总线（R8）、PageListView PoolRow 两列成行（R9）。

---

## 四、反向清单：RN 多件判定

| # | RN 件 | 性质判定 | 依据 |
|---|---|---|---|
| R1 | PageViewport + usePageEndReached + useViewportScroll + PageListView | **共通基础件 · 保留** | 原型 `.viewport` 单层滚动 + pageSize 8/10 触底续取是 JS 行为；RN 必须把「距底 160px 总线 + 整页虚拟化」做成基建，非自造需求 |
| R2 | Main/CatStickerBar.tsx | **自造抽象 · 保留（最高维护成本件）** | 原型仅靠 `position:sticky`（css L369-376）；RN 0.73 ScrollView 无 sticky，只能在主屏根层复制一条 chip 行 + onLayout 越线判定。功能等价、口径唯一（数据同源 PlaylistPage），但属「为平台缺失能力手造第二实例」，拆件时要定成通用 Sticker 抽象或明确单例 |
| R3 | CoverWash | 共通基础件 · 保留 | 原型 `.pl-bg`/`.player-bg` 的 `blur(64)+saturate(150)` RN 不可表达，降级纵向渐隐；两处复用（SonglistDetail L740、Player 走 LinearGradient 直排）， zIndex 配对注释齐全 |
| R4 | Glass/BlurredContainer | 共通基础件 · 保留 | `backdrop-filter` 原生等价物；Sheet/Minibar/Toast 三使用者（README L555 核对过 --glass 全站仅 4 使用者） |
| R5 | RunningDots | 共通基础件 · 保留 | 原型 `.pl-status .spin` 是静态 CSS 转圈；RN 换三点接力动画（2026-10-15 轮），子件挂在 PagingStatus 内，未外溢 |
| R6 | CardGrid / ChipRow / ChipFlow / HScroll | 共通基础件 · 保留 | 原型的 grid/flex/hscroll 是每处一条 CSS；RN 收敛成布局壳，被 ≥3 处复用（CardGrid：首页电台/榜单/我的；ChipRow：rank-tabs+cat-row；ChipFlow：音源/定时/标签/搜索四族） |
| R7 | Main/MinibarDock.tsx | 共通基础件 · 保留 | 挂载容器（谁在播、点去哪），原型由全局事件承担，RN 需壳件接 store 订阅；展示本体仍是 Minibar |
| R8 | utils/newUiToast 投递总线 + 各屏根层各挂 NewUiToastHost | 共通基础件 · 保留 | 原型 `#toast` 全站单例；RN 四屏（Main/Player/Search/SonglistDetail）导航独立，必须每台宿主 + 总线，原型 `.toast z-index:90` 层序语义靠「根层最后一子」维持 |
| R9 | PageListView PoolRow（两列成行） | 自造抽象 · **保留但挂账** | numColumns FlatList 虚拟化必须成行喂数据（SearchResultPanel L160-170 注释里 numColumns 1↔2 原地变更崩 RN 0.73 FlatList 的 invariant，前车之鉴）；属虚拟化税，非设计税，但拆件时别把它当 UI 单元 |

**疑似过度设计：无一件判死。** 最接近线的是 R2 CatStickerBar（同一 UI 两处存在），有平台硬约束背书，判「保留 + 拆件时单独立 part」。

---

## 五、汇总数字

- 原型 App UI 语义单元：**79**（U01-U79，另查看器 chrome V1-V4 + 无归属元素 0）
- RN 组件：**72**（共通件 56 + 屏级件 16；不含 4 个主屏页面本体与 screens 装配壳）
- 对撞结论分布（按主表 79 行逐条）：
  - 一致 **62**
  - RN 缺件（内联） **12**（U32、U37、U48、U50、U51、U55、U56、U58、U62、U67、U69 为页面内联；U61 为功能级缺失）
  - RN 多件 **1**（U35→CatStickerBar；纯 RN 侧件全部收录反向清单 R1-R9）
  - 粒度偏粗 **2**（U17 Sheet 吃 chrome+八实例骨架；U28/U35 ChipRow 吃两单元记 1 → 本档计 2 行）
  - 粒度偏细 **2**（U42 MineHeader 拆 3、U52 player-stage 拆 3）

---

## 六、对下一步拆件（new_design/parts/*.html + *.css）的建议

1. **parts 边界就按 U01-U79 切，但「一 part = 一原型单元」不必「一 part = 一 RN 件」**。一致 62 行的单元可直接搬进 parts 文件；Sheet（U17）这类偏粗件对应的 part 应是「chrome 定义」一个文件，被八个实例 part 引用继承（164dfa4 的钉住规则 L734-738 属于 chrome，不属于评论——拆件时把它放 chrome，别放评论 part）。
2. **优先合并成 part 的内联族**（13 条缺件里有 9 条同属「页面顶排/行/尾注」小结构）：`.player-top+.player-crumb`、`.player-meta`、`.player-source`、`.seek-time`、`.pl-top+.pl-crumb`、`.pl-actions`、`.sc-top+.sc-box+.sc-cancel`、`.set-hero`、`.section-note/.pl-count` —— 建议拆成 `player-bar.html`、`detail-top.html`、`search-top.html`、`page-hero.html` 四个小 part，RN 侧对应新建 4-5 个组件即可全部转正，这也是本轮唯一建议**将来补件**的清单（本轮一字未改 RN 代码）。
3. **`.lrc-float`（U61）单独定 part 并挂「RN 未落地」旗标**：它是唯一功能级缺口（README L555 实锤），拆件时把它与 `.player-tools` 的 float 钮绑成对（钮的定义在 tools part、浮窗本体在 lrc-float part），避免再出现「钮有着落、本体没立项」的悬空态。
4. **`.cat-row`/`.rank-tabs` 别再拆细**：RN 的 ChipRow 一吃二被证明成立，parts 里给「chip 行」一个 part、两个宿主（home/rank-tabs 与 playlist/cat-row 吸顶）各写用法即可；CatStickerBar 这类 RN 实现税不进 parts（parts 只描述原型语义，不描述 RN 手势复制方案）。
5. **播放器舞台（U52-U54）按原型单元写 part，不按 RN 三件写**：`stage.html` 内含 disc/lyric/dots 三子块即可；RN 侧 PlayerStageSwipe+DiscArt+LyricList 的偏细拆分是 pager-view 落地方式，不构成原型结构事实，写进 parts 会让原型自签其变。
6. 固定文案在 part 文件里**原文保留**（本报告 U 表已汇总全部文案与出处行号），RN 侧文案一律在 `src/newui/const/`（NEW_UI_* 前缀），parts → RN 的对照靠 const 模块名注释，不靠复制。

---

*本报告为只读盘点产物；生成后 `git status --short` 核验除本文件外工作区零改动。*
