#!/usr/bin/env node
/* 生成 new_design/data.js 里的 RANK_COVER_WORDS 字面量。
 * 词根 = manifest 的中文榜名（去掉结尾「榜」），再叠一层别名（真实目录里同一类榜各家叫法不同，
 * 如 流行指数榜 / 抖快榜 vs 抖音热歌榜 / 日本公信榜 vs 日本Oricon榜）。
 * 排序 = 最长词根优先，同长度时按「外部授权榜 > 语种 > 地区 > 曲风 > 场景 > 权益 > 排名机制 > 主打」，
 * 这样「欧美热歌榜」落 west 不落 hot、「国风热歌榜」落 chinese_style 不落 hot。
 * 用法：node scripts/gen-rank-cover-words.mjs            （打印字面量）
 *      node scripts/gen-rank-cover-words.mjs --check    （只跑真实目录覆盖率体检） */
import fs from 'node:fs';


const EXPANDED = '/home/joe/ダウンロード/music_rank_svg_expanded';
const PLATFORMS = ['tx', 'wy', 'kw', 'kg', 'mg'];
const BASE_ONLY = [['hot', '热歌榜', 'ranking'], ['new', '新歌榜', 'ranking'], ['rising', '飙升榜', 'ranking'],
  ['original', '原创榜', 'ranking'], ['classic', '经典榜', 'genre'], ['female', '女声榜', 'genre'], ['male', '男声榜', 'genre']];

/* 别名：真实目录里跟 canonical 不重名的叫法 */
const ALIAS = {
  trend: ['流行指数'],
  hot: ['热歌', '热门', '流行', '红歌', '爆款'],
  new: ['新碟', '首发'],
  rising: ['上升', '热涨'],
  original: ['独立音乐', '音乐人'],
  classic: ['经典', '老歌', '怀旧'],
  healing: ['疗愈', '助眠', '轻音乐', '睡前', '枕边'],
  electronic: ['电子', '电音', 'DJ', '舞曲', 'BEATPORT'],
  acg: ['动漫', '二次元', '动画', '游戏', '番剧'],
  ancient_style: ['古风'],
  rap: ['嘻哈', 'TRAP'],
  rock: ['乐队', '朋克'],
  cantonese_language: ['广东'],
  european_language: ['小语种'],
  soundtrack: ['原声', 'OST', '主题曲', '综艺'],
  short_video: ['抖音', '快手', '短视频'],
  oricon: ['公信'],
  nrj_france: ['NRJ', '法国'],
  russian: ['俄罗斯'],
  itunes: ['ITUNES'],
  billboard: ['BILLBOARD'],
  chinese: ['国语'],
  live_music: ['演唱会'],
  ringtone: ['彩铃'],
};
const CAT_RANK = { authority: 0, language: 1, region: 2, genre: 3, scene: 4, membership: 5, ranking: 6 };

const realNames = () => {
  const set = new Set();
  for (const p of PLATFORMS) {
    const s = fs.readFileSync(`src/utils/musicSdk/${p}/leaderboard.js`, 'utf8');
    new Function('return ' + s.match(/(?:boardList|topList)\s*=\s*(\[[\s\S]*?\])\s*\n/)[1])()
      .forEach((b) => set.add(b.name.trim()));
  }
  return [...set];
};

const build = () => {
  const man = JSON.parse(fs.readFileSync(path_join.join(EXPANDED, 'manifest.json'), 'utf8'));
  const rows = [...man.map((m) => ({ key: m.key, name: m.name, cat: m.category })), ...BASE_ONLY.map(([key, name, cat]) => ({ key, name, cat }))];
  const table = rows.map(({ key, name, cat }) => {
    const stem = name.replace(/榜$/, '');
    const words = [...new Set([stem, ...(ALIAS[key] || [])])].filter(Boolean);
    return { key, cat, words, rank: CAT_RANK[cat] ?? 9 };
  });
  const maxLen = (t) => Math.max(...t.words.map((w) => w.length));
  table.sort((a, b) => maxLen(b) - maxLen(a) || a.rank - b.rank || a.key.localeCompare(b.key));
  return table;
};


import path_join from 'node:path';
const table = build();
const lookup = (name) => {
  const n = name.toUpperCase();
  const hit = table.find((t) => t.words.some((w) => n.includes(w.toUpperCase())));
  return hit ? hit.key : null;
};

const names = realNames();
const miss = names.filter((n) => !lookup(n));
if (process.argv.includes('--check')) {
  console.log(`真实榜名 ${names.length} 个 → 命中 ${names.length - miss.length}，未命中 ${miss.length}`);
  if (miss.length) console.log('未命中：\n  ' + miss.join('\n  '));
  const dup = {};
  for (const n of names) (dup[lookup(n)] ||= []).push(n);
  console.log('\n每张封面顶到的榜名数：');
  Object.entries(dup).sort((a, b) => b[1].length - a[1].length).slice(0, 12)
    .forEach(([k, v]) => console.log(`  ${k.padEnd(20)}${v.length}  ${v.join(' / ')}`));
  const unused = table.filter((t) => !Object.keys(dup).includes(t.key)).map((t) => t.key);
  console.log(`\n没顶到任何真实榜的封面（${unused.length}）: ${unused.join(' ')}`);
} else {
  const lines = table.map((t) => `  ['${t.key}', [${t.words.map((w) => `'${w}'`).join(', ')}]],`);
  console.log(lines.join('\n'));
  console.error(`共 ${table.length} 个 key，未命中 ${miss.length} 个真实榜名${miss.length ? '：' + miss.join(' / ') : ''}`);
}
