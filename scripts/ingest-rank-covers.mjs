#!/usr/bin/env node
/* 榜单封面入库：把设计好的 SVG 原包搬进 new_design/rank-covers/，只做三件事
 *   1. 去掉满幅圆角矩形上的 rx（圆角由卡片容器给，图本身留圆角会在深色底上露出四角空隙）
 *   2. 去掉自带的「榜名 + 英文副标 + 下划线」标题块（卡上那两行字由 DOM 画，留着会重复一遍，
 *      而且真实榜名带平台前缀（咪咕欧美榜）与图上印的死名（欧美榜）对不上）
 *   3. 去掉原基础包那圈 1px 内描边
 * 除这三处外图案一字不动，脚本会逐文件核对删掉的节点数，对不上就报错退出。
 * 用法：node scripts/ingest-rank-covers.mjs [源目录] */
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('new_design/rank-covers');
const EXPANDED = process.argv[2] || '/home/joe/ダウンロード/music_rank_svg_expanded';
const BASE = path.join(path.dirname(EXPANDED), 'music_chart_svg_pack');
/* 扩展包没画的 7 个概念仍用基础包那批：热歌 / 新歌 / 飙升 / 原创 / 经典 / 女声 / 男声
 *（基础包的 cantonese 由扩展包的 cantonese_language 顶掉，不再入库） */
const FROM_BASE = ['hot', 'new', 'rising', 'original', 'classic', 'female', 'male'];

const TITLE_NODES = [
  /<text x="42" y="66"[^>]*>[\s\S]*?<\/text>/g,
  /<text x="44" y="98"[^>]*>[\s\S]*?<\/text>/g,
  /<path d="M42 122 H\d+"[^>]*\/>/g,
];
const BORDER = /<path d="M0 0 H512 V512 H0Z"[^>]*\/>/g;
const ROUNDED_FULL = /(<rect width="512" height="512") rx="\d+"/g;

const ingest = (file, label) => {
  const src = fs.readFileSync(file, 'utf8');
  let s = src;
  let cut = 0;
  for (const re of [...TITLE_NODES, BORDER]) s = s.replace(re, () => (cut++, ''));
  const rounded = (s.match(ROUNDED_FULL) || []).length;
  s = s.replace(ROUNDED_FULL, '$1');
  if (/<text|font-family/.test(s)) throw new Error(`${label}: 还残留文字节点`);
  if (/<rect width="512" height="512" rx=/.test(s)) throw new Error(`${label}: 满幅底板仍带圆角`);
  const expect = label.startsWith('base:') ? (src.match(BORDER) || []).length : 3;
  if (cut !== expect) throw new Error(`${label}: 删掉 ${cut} 个节点，预期 ${expect} 个`);
  return { out: s, cut, rounded };
};

fs.mkdirSync(OUT, { recursive: true });
const manifest = JSON.parse(fs.readFileSync(path.join(EXPANDED, 'manifest.json'), 'utf8'));
const wanted = new Set([...manifest.map((m) => m.file.replace(/\.svg$/, '')), ...FROM_BASE]);

const log = [];
for (const m of manifest) {
  const r = ingest(path.join(EXPANDED, m.file), `exp:${m.key}`);
  fs.writeFileSync(path.join(OUT, m.file), r.out);
  log.push(`${m.file.padEnd(26)}${m.name.padEnd(16)}去节点 ${r.cut} / 去圆角 ${r.rounded}`);
}
for (const k of FROM_BASE) {
  const r = ingest(path.join(BASE, `${k}.svg`), `base:${k}`);
  fs.writeFileSync(path.join(OUT, `${k}.svg`), r.out);
  log.push(`${(k + '.svg').padEnd(26)}扩展包未画，沿基础包　去节点 ${r.cut} / 去圆角 ${r.rounded}`);
}
for (const f of fs.readdirSync(OUT)) {
  if (f.endsWith('.svg') && !wanted.has(f.replace(/\.svg$/, ''))) {
    fs.rmSync(path.join(OUT, f));
    log.push(`${f.padEnd(26)}清掉（已被扩展包的 key 顶替）`);
  }
}
console.log(`入库 ${wanted.size} 张 → ${OUT}`);
log.forEach((l) => console.log('  ' + l));
