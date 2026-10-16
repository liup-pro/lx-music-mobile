#!/usr/bin/env node
/**
 * newui-parity —— 原型（new_design/parts/*.css）↔ RN（src/newui）机械对账 v1
 * 用法：node scripts/newui-parity.mjs [--refresh-map] [--verbose]
 *
 * 定位：把「重读全套原型逐条比对」从人肉审计降级成机械对账，只输出 mismatch（像 tsc）。
 * v1 只查两类（保守取向：宁可漏报，不制造噪音）：
 *   A 缺属性：件里出现的样式属性族（font-family/font-size/font-weight/letter-spacing/
 *     line-height/text-transform/text-align），映射到的 RN 件里连对应的 RN 键都没出现过。
 *     （正例：opt-list 的 .or-body b small 有 font-family，OptionRow 无 fontFamily → 必须报出。）
 *   B 数值缺：件里 font-size/font-weight/letter-spacing/line-height/gap/border-radius/
 *     opacity 的字面数值（跳过 var()/%/calc()/0/1），在映射件的「数值池」里找不到。
 *     数值池 = 映射件代码字面量（去注释去字符串）+ 其从 '@/newui/theme' 导入的 token 块全部数值。
 *
 * 机制：
 * - 新鲜度探针：件内每条规则的 `/* ─ 源 styles.css La-Lb ─ *​/` 标记，与 styles.css 原文
 *   逐字（去空白）比对；任何一条对不上即报「零件过期，重跑 node scripts/gen-newui-parts.mjs」
 *   并退出（本脚本只读，绝不自动重生）。
 * - 映射表：件 → RN 文件的引用打分（直接引「parts/xx/yy」+100；件内选择器类名在该 RN 文件
 *   注释里被引用每个 +1），按阈值取前几名，缓存到 scripts/newui-parity-map.json。
 *   人工可在该文件 manual 字段钉死覆盖（改完不用加 --refresh-map 也生效）。
 * - 白名单：scripts/newui-parity-whitelist.json（不存在=全量报）。键＝`件|A|属性` 或
 *   `件|B|属性=数值`，值为理由；命中的对账项被抑制并在统计里计数（抑制数量可见）。
 *
 * 口径（v1 有意跳过，不报）：
 * - _chrome/_shell 不参与（查看器 chrome/页壳，RN 不承接）；_base 只做新鲜度探针
 *   （原子分散在各组件，对 tokens.ts 单点对账必然噪音）；sprite 等无样式件自然跳过。
 * - box-shadow/background/display/width/height 等 RN 表达不直译的属性族不在 A 表内。
 * - var()/%/calc() 值不查 B（token 间接引用 v2 再上）。
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PARTS_DIR = join(root, 'new_design/parts')
const RN_DIR = join(root, 'src/newui')
const MAP_FILE = join(root, 'scripts/newui-parity-map.json')
const WL_FILE = join(root, 'scripts/newui-parity-whitelist.json')

const argv = new Set(process.argv.slice(2))
const REFRESH = argv.has('--refresh-map')
const VERBOSE = argv.has('--verbose')

// ---------------------------------------------------------------------------
// 工具
// ---------------------------------------------------------------------------
function walk(dir, filter) {
  const res = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) res.push(...walk(p, filter))
    else if (filter(p)) res.push(p)
  }
  return res
}
const normWs = (s) => s.replace(/\s+/g, '')
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const byStr = (a, b) => (a < b ? -1 : a > b ? 1 : 0)

const errors = []
const fail = (msg) => errors.push(msg)

// ---------------------------------------------------------------------------
// 1. 解析 parts/*.css：规则 + 源行号标记（_chrome/_shell 不参与）
// ---------------------------------------------------------------------------
const MARKER = /^\/\* ─ 源 styles\.css L(\d+)-L(\d+).*─ \*\/\s*$/

function parsePartRules(abs) {
  const lines = readFileSync(abs, 'utf8').split('\n')
  let i = 0
  while (i < lines.length && !lines[i].includes('*/')) i++ // 跳过件头注释块
  i++
  const rules = []
  while (i < lines.length) {
    const m = MARKER.exec(lines[i].trim())
    if (!m) { i++; continue }
    const a = +m[1]
    const b = +m[2]
    i++
    while (i < lines.length && lines[i].trim() === '') i++
    const atLine = i + 1
    const chunkLines = []
    let depth = 0
    let started = false
    while (i < lines.length) {
      const ln = lines[i]
      chunkLines.push(ln)
      for (const c of ln) {
        if (c === '{') { depth++; started = true } else if (c === '}') depth--
      }
      i++
      if (started && depth <= 0) break
    }
    const t = chunkLines.join('\n').trim()
    const brace = t.indexOf('{')
    const sel = brace >= 0 ? t.slice(0, brace).trim().replace(/\s+/g, ' ') : ''
    const at = sel.startsWith('@')
    const decls = []
    if (!at && brace >= 0) {
      const body = t.slice(brace + 1, t.lastIndexOf('}'))
      for (const seg of body.split(';')) {
        const ci = seg.indexOf(':')
        if (ci <= 0) continue
        const prop = seg.slice(0, ci).trim()
        const val = seg.slice(ci + 1).trim().replace(/\s+/g, ' ')
        if (!prop || prop.startsWith('--')) continue
        decls.push({ prop, val })
      }
    }
    rules.push({ sel, at, decls, a, b, atLine, chunk: t })
  }
  return rules
}

const partFiles = walk(PARTS_DIR, (p) => p.endsWith('.css'))
  .map((p) => ({ abs: p, rel: p.slice(PARTS_DIR.length + 1), key: p.slice(PARTS_DIR.length + 1).replace(/\.css$/, '') }))
  .filter((x) => x.rel !== '_chrome.css' && x.rel !== '_shell.css')
  .sort((x, y) => byStr(x.rel, y.rel))

const parts = partFiles.map((f) => ({ ...f, rules: parsePartRules(f.abs) }))

// ---------------------------------------------------------------------------
// 2. 新鲜度探针：件内规则 vs styles.css 原文（去空白逐字），过期即退出
// ---------------------------------------------------------------------------
const STYLES = readFileSync(join(root, 'new_design/styles.css'), 'utf8').split('\n')
const stale = []
for (const part of parts) {
  for (const r of part.rules) {
    const target = STYLES.slice(r.a - 1, r.b).join('\n')
    if (normWs(r.chunk) !== normWs(target)) stale.push(`${part.rel} 规则(supposed styles.css L${r.a}-L${r.b})`)
  }
}

// ---------------------------------------------------------------------------
// 3. RN 侧：候选文件索引 + 引用打分 + 映射缓存
// ---------------------------------------------------------------------------
const rnFiles = walk(RN_DIR, (p) => p.endsWith('.tsx') || p.endsWith('.ts'))
  .map((p) => ({ abs: p, rel: p.slice(RN_DIR.length + 1) }))
  .filter((x) => x.rel.startsWith('components/') || x.rel.startsWith('screens/'))
  .sort((x, y) => byStr(x.rel, y.rel))

const rnCache = new Map()
function rn(x) {
  if (!rnCache.has(x.rel)) {
    const src = readFileSync(x.abs, 'utf8')
    let comments = ''
    for (const m of src.matchAll(/\/\*[\s\S]*?\*\//g)) comments += m[0] + '\n'
    for (const line of src.split('\n')) {
      const k = line.indexOf('//')
      if (k >= 0) comments += line.slice(k) + '\n'
    }
    let code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
    const codeNoStr = code
      .replace(/'(?:[^'\\\n]|\\.)*'/g, ' ')
      .replace(/"(?:[^"\\\n]|\\.)*"/g, ' ')
      .replace(/`(?:[^`\\]|\\.)*`/g, ' ')
    const nums = new Set()
    for (const m of codeNoStr.matchAll(/-?(?:\d+(?:\.\d+)?|\.\d+)/g)) nums.add(parseFloat(m[0]))
    // RN fontWeight 用字符串数字（'600'），单独捞三位数字串（注释已去，版本号在字符串里已被剥、不受扰）
    const codeNoComment = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
    for (const m of codeNoComment.matchAll(/['"](\d{3})['"]/g)) nums.add(+m[1])
    const imports = []
    for (const m of src.matchAll(/import\s*(?:type\s+)?\{([^}]*)\}\s*from\s*['"]@\/newui\/theme['"]/g)) {
      for (const seg of m[1].split(',')) {
        const name = seg.trim().split(/\s+as\s+/)[0].trim()
        if (name) imports.push(name)
      }
    }
    rnCache.set(x.rel, { src, comments, codeNoStr: codeNoStr, nums, imports })
  }
  return rnCache.get(x.rel)
}

// tokens.ts：导出块名 → 块内全部数值（含嵌套键、引号数字串）
const tokensSrc = readFileSync(join(RN_DIR, 'theme/tokens.ts'), 'utf8')
const tokenBlocks = new Map()
for (const m of tokensSrc.matchAll(/export const ([A-Z][A-Z0-9_]*)\s*=\s*\{([\s\S]*?)\}\s*as const/g)) {
  const vals = new Set()
  for (const v of m[2].matchAll(/:\s*(-?\d+(?:\.\d+)?)\s*[,}\n]/g)) vals.add(parseFloat(v[1]))
  for (const v of m[2].matchAll(/['"](\d+(?:\.\d+)?)['"]/g)) vals.add(parseFloat(v[1]))
  tokenBlocks.set(m[1], vals)
}

const NOISE_TOKENS = new Set(['.html', '.css', '.js', '.mjs', '.ts', '.tsx', '.on', '.off', '.ic'])
function partTokens(rules) {
  const set = new Set()
  for (const r of rules) {
    if (r.at) continue
    for (const m of r.sel.matchAll(/[.#][a-zA-Z][\w-]*/g)) {
      if (m[0].length < 3 || NOISE_TOKENS.has(m[0])) continue
      set.add(m[0])
    }
  }
  return [...set]
}

function computeMapping(key, rules) {
  const toks = partTokens(rules)
  const pathRe = new RegExp('parts/' + escRe(key) + '(?![-\\w])')
  const scored = []
  for (const x of rnFiles) {
    const { src, comments } = rn(x)
    let s = pathRe.test(src) ? 100 : 0
    for (const t of toks) if (comments.includes(t)) s++
    if (s > 0) scored.push({ rel: x.rel, s })
  }
  scored.sort((p, q) => q.s - p.s || byStr(p.rel, q.rel))
  if (!scored.length) return []
  const best = scored[0].s
  // 保留：直接路径引用（+100）一律保留；纯类名引用需 ≥2，或就是最高分（兜底防整件失配）
  return scored.filter((x) => x.s >= 100 || x.s >= 2 || (x.s === best && x.s >= 1)).slice(0, 6)
}

const mapSrc = existsSync(MAP_FILE) ? JSON.parse(readFileSync(MAP_FILE, 'utf8')) : { auto: {}, manual: {} }
const rnByRel = new Map(rnFiles.map((x) => [x.rel, x]))
const autoMap = {}
let mapWrote = false
for (const part of parts) {
  const prev = mapSrc.auto?.[part.key]
  const cached = !REFRESH && Array.isArray(prev) ? prev.filter((f) => rnByRel.has(f)) : null
  if (cached && cached.length && cached.length === prev.length) {
    autoMap[part.key] = cached
    continue
  }
  const scored = computeMapping(part.key, part.rules)
  autoMap[part.key] = scored.map((x) => x.rel)
  mapWrote = true
  if (VERBOSE && scored.length) {
    console.log(`[映射] ${part.key} → ${scored.map((x) => `${x.rel}(${x.s})`).join(' , ')}`)
  }
}
if (mapWrote || REFRESH || !existsSync(MAP_FILE)) {
  writeFileSync(
    MAP_FILE,
    JSON.stringify({ _note: '自动映射缓存（件 → RN 文件，按引用打分）。manual 段人工钉死覆盖，不受 --refresh-map 影响。重算：node scripts/newui-parity.mjs --refresh-map', auto: autoMap, manual: mapSrc.manual || {} }, null, 2) + '\n',
  )
}

// ---------------------------------------------------------------------------
// 4. 输出头 + 新鲜度闸门
// ---------------------------------------------------------------------------
console.log(`原型 ↔ RN 对账（new_design/parts/*.css ↔ src/newui，v1：属性类别 + 数值）`)
console.log(`零件新鲜度：${parts.length} 件 / ${parts.reduce((n, p) => n + p.rules.length, 0)} 条规则对照 styles.css 原文`)
if (stale.length) {
  console.log(`\n✗ 零件过期（${stale.length} 条规则与 styles.css 对不上）——重跑 node scripts/gen-newui-parts.mjs 后再对账：`)
  for (const s of stale.slice(0, 20)) console.log('  ' + s)
  if (stale.length > 20) console.log(`  …等 ${stale.length} 条`)
  process.exit(2)
}
console.log('  ✓ 全绿（无漂移）')

// ---------------------------------------------------------------------------
// 5. 对账 A（属性族）/ B（数值）
// ---------------------------------------------------------------------------
const FAM = new Map([
  ['font-family', 'fontFamily'],
  ['font-size', 'fontSize'],
  ['font-weight', 'fontWeight'],
  ['letter-spacing', 'letterSpacing'],
  ['line-height', 'lineHeight'],
  ['text-transform', 'textTransform'],
  ['text-align', 'textAlign'],
])
const NUMERIC_PROPS = new Set(['font-size', 'font-weight', 'letter-spacing', 'line-height', 'gap', 'border-radius', 'opacity'])

const wl = existsSync(WL_FILE) ? (JSON.parse(readFileSync(WL_FILE, 'utf8')).flags || {}) : {}
const flagsA = []
const flagsB = []
const unmapped = []
let suppressed = 0
let mappedCount = 0

for (const part of parts) {
  if (part.key === '_base') continue // 公共底：原子分散在各组件，v1 只做新鲜度
  const mapped = (mapSrc.manual?.[part.key]?.length ? mapSrc.manual[part.key] : autoMap[part.key] || [])
    .filter((f) => rnByRel.has(f))
  if (!mapped.length) { if (part.rules.some((r) => r.decls.length)) unmapped.push(part.key); continue }
  mappedCount++
  const pools = new Set()
  let codeText = ''
  for (const f of mapped) {
    const c = rn(rnByRel.get(f))
    for (const n of c.nums) pools.add(n)
    for (const name of c.imports) for (const v of tokenBlocks.get(name) || []) pools.add(v)
    codeText += c.codeNoStr + '\n'
  }

  // A：属性族覆盖（件里有该 CSS 属性，映射件里该 RN 键一次都没出现）
  const seenA = new Map()
  for (const r of part.rules) {
    if (r.at) continue
    for (const d of r.decls) {
      const rnKey = FAM.get(d.prop)
      if (!rnKey) continue
      // 机械化 no-op：inherit 系本就不产样式；text-align:left 是 RN 默认，无需落地
      if (/^(inherit|initial|unset)$/.test(d.val)) continue
      if (d.prop === 'text-align' && d.val === 'left') continue
      const k = `${d.prop}|${rnKey}`
      if (!seenA.has(k)) seenA.set(k, { rnKey, rule: r })
    }
  }
  for (const [k, { rnKey, rule }] of seenA) {
    const wlKey = `${part.key}|A|${k.split('|')[0]}`
    if (wl[wlKey] !== undefined) { suppressed++; continue }
    if (!new RegExp(`\\b${rnKey}\\b`).test(codeText)) {
      flagsA.push({ part: part.key, prop: k.split('|')[0], rnKey, rule, files: mapped })
    }
  }

  // B：数值缺（件里的字面数值在映射件数值池找不到）
  const seenB = new Map()
  for (const r of part.rules) {
    if (r.at) continue
    for (const d of r.decls) {
      if (!NUMERIC_PROPS.has(d.prop)) continue
      if (/var\(|%|calc\(/.test(d.val)) continue
      // 无单位 line-height（倍数）在 RN 无对应表达，机械不可查，跳过
      if (d.prop === 'line-height' && !/px/.test(d.val)) continue
      const ns = d.val.match(/-?(?:\d+(?:\.\d+)?|\.\d+)/g)
      if (!ns) continue
      for (const s of ns) {
        const n = parseFloat(s)
        if (n === 0 || n === 1) continue
        const k = `${d.prop}=${n}`
        if (!seenB.has(k)) seenB.set(k, { prop: d.prop, val: d.val, n, rule: r })
      }
    }
  }
  for (const [k, { prop, val, n, rule }] of seenB) {
    const wlKey = `${part.key}|B|${k}`
    if (wl[wlKey] !== undefined) { suppressed++; continue }
    if (!pools.has(n)) flagsB.push({ part: part.key, prop, val, n, rule, files: mapped })
  }
}

// ---------------------------------------------------------------------------
// 6. 输出
// ---------------------------------------------------------------------------
console.log(`映射：${mappedCount} 件已映射 / ${unmapped.length} 件未建映射${VERBOSE ? '' : '（--verbose 看打分过程）'}`)
if (unmapped.length) console.log('  未建映射（跳过对账）：' + unmapped.join('、'))

console.log(`\n—— 缺属性（件里有、映射件无该 RN 键）：${flagsA.length} 项 ——`)
for (const f of flagsA) {
  console.log(`[缺属性] ${f.part}  ${f.rule.sel} { ${f.prop} }`)
  console.log(`    ${f.files.join(' , ')} 均无 ${f.rnKey}（源 styles.css L${f.rule.a}）`)
}
console.log(`\n—— 数值缺（件里字面数值、映射件数值池没有）：${flagsB.length} 项 ——`)
for (const f of flagsB) {
  console.log(`[数值缺] ${f.part}  ${f.rule.sel} { ${f.prop}: ${f.val} }`)
  console.log(`    ${f.n} 不在数值池（源 styles.css L${f.rule.a}）：${f.files.join(' , ')}`)
}
const total = flagsA.length + flagsB.length
console.log(`\n结论：flags = ${total}（A ${flagsA.length} / B ${flagsB.length}）${suppressed ? `，白名单抑制 ${suppressed} 项` : ''}`)
if (errors.length) { console.log('\n内部错误：'); for (const e of errors) console.log('  ' + e); process.exit(2) }
process.exit(total > 0 ? 1 : 0)
