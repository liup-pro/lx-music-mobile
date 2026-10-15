# new_design/parts —— 原型语义单元小件（派生物）

> **派生物 · 请勿手改：重跑 node scripts/gen-newui-parts.mjs 同步原型（Node v22）**

- 权威源是 `new_design/index.html`（结构）与 `new_design/styles.css`（样式），交互/渲染在 `new_design/app.js`，数据模型示例在 `new_design/data.js`。**本目录只是它们的无损切分，任何人不许手改**；原型改了重跑：
  ```bash
  # Node ≥ 18（本项目 v22：/home/joe/.nvm/versions/node/v22.23.2/bin/node）
  node scripts/gen-newui-parts.mjs
  ```
- 拆件边界依据：`src/newui/PROTOTYPE_INVENTORY.md`（U01–U79 双向对撞报告）。派单粒度 = 一个小件，读到件即读到原型原文。
- 无损性由脚本运行时断言（不过即报错退出，无兜底桶）：
  - index.html 每个元素恰好归属一个件：本次 824 个元素 = 各件之和 824，零丢失零重复；
  - styles.css 每条规则恰好归属一个件（含 _base）：本次 654 条规则 / 675 个选择器，逐条唯一归属。
- 目录构成：
  - `_base.css`：:root token、reset、跨单元复用原子的唯一样本处（.art/.chip/.icon-btn/分页状态行等）。
  - `_shell.html/.css`：文档壳 + #viewport + 五只 .page 页壳（页面壳单列）。
  - `_chrome.html/.css`：查看器 chrome（V1–V4）——不是 App UI，RN 不承接，仅作归属收容。
  - `common-control/ home/ playlist/ rank/ mine/ setting/ player/ search/ songlist-detail/ sheets/`：按页面分组的单元件，一件一单元（合并/继承规则见对撞报告第六节）。
- 件里的 `<!-- ▸ … -->` 是「子树已划给别件」的占位指针，指回 parts 内文件；`内容/定义件`（如 U02/U07/sheet-chrome/timer-sheet/comment-sheet）无独立静态壳，头注列出全部出现处。
- 固定文案留在件里（本来就在 HTML/符号行里）；对照 RN 侧时文案仍走 `src/newui/const/`，靠件头注的 app.js 符号行回溯，不靠复制。
- 约定（对撞报告边界）：sheet = U17 chrome 定义件 + 八实例件继承，164dfa4 钉住规则归 chrome；.rank-tabs 与 .cat-row 合并为 chip-row 一件；播放器舞台按原型单元写件；CatStickerBar 是 RN 自造件不进 parts；查看器 chrome 不参与拆件。
- 本次产出：`(root)`: 2 件 html / 3 件 css；`common-control`: 26 件 html / 16 件 css；`home`: 8 件 html / 8 件 css；`playlist`: 3 件 html / 2 件 css；`rank`: 3 件 html / 3 件 css；`mine`: 5 件 html / 4 件 css；`setting`: 2 件 html / 2 件 css；`player`: 13 件 html / 12 件 css；`search`: 5 件 html / 5 件 css；`songlist-detail`: 6 件 html / 6 件 css；`sheets`: 10 件 html / 5 件 css。
