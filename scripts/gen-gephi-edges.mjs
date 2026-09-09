/**
 * 生成《东方快车谋杀案》社会网络完全图 (20 nodes, 190 edges) 的边表。
 */
import { readFileSync, writeFileSync } from 'node:fs'

const ROOT = '/Users/liuyushan/WorkBuddy/个人网站/locker-site'
const data = JSON.parse(readFileSync(`${ROOT}/public/gephi/data.json`, 'utf8'))
const NODES = data.nodes
const IDS = NODES.map((n) => n.id)

// 12 嫌疑人彼此 "同谋" – layer = 'conspiracy'
// 其他人 – layer = 'truth' (波洛侦探视角)
const ROLE = {}
for (const n of NODES) ROLE[n.id] = n.role

const CLOSE = {
  arbuthnot: ['debenham', 'sarah', 'sonia', 'daisy', 'coljohnson'],
  debenham: ['arbuthnot', 'sarah', 'sonia', 'daisy'],
  sarah: ['hubbard', 'sonia', 'daisy', 'coljohnson', 'macqueen', 'arbuthnot', 'ohlsson', 'schmidt', 'countessa', 'dragomiroff', 'foscarelli', 'michel', 'hardman'],
  hubbard: ['sarah', 'sonia', 'daisy', 'coljohnson'],
  macqueen: ['ratchett', 'cassetti'],
  ratchett: ['macqueen', 'cassetti'],
  cassetti: ['ratchett', 'macqueen'],
  dragomiroff: ['schmidt', 'sarah', 'sonia'],
  schmidt: ['dragomiroff', 'sarah', 'sonia'],
  countessa: ['sonia', 'daisy', 'sarah', 'counta'],
  counta: ['countessa', 'sarah', 'sonia'],
  coljohnson: ['sarah', 'sonia', 'daisy', 'arbuthnot'],
  sonia: ['sarah', 'daisy', 'coljohnson', 'arbuthnot', 'countessa', 'ohlsson', 'foscarelli', 'hardman', 'michel', 'debenham'],
  daisy: ['sarah', 'sonia', 'coljohnson', 'hubbard', 'arbuthnot', 'countessa'],
  hardman: ['sarah', 'sonia'],
  ohlsson: ['sarah', 'sonia', 'daisy'],
  foscarelli: ['sarah', 'sonia', 'daisy'],
  michel: ['sarah', 'sonia', 'coljohnson'],
}

function inClose(a, b) {
  return CLOSE[a] && CLOSE[a].includes(b)
}

const edges = []
let idx = 0
for (let i = 0; i < IDS.length; i++) {
  for (let j = i + 1; j < IDS.length; j++) {
    const a = IDS[i]
    const b = IDS[j]
    let w = 0.35
    let layer = 'truth'

    if (inClose(a, b)) w = 1.0
    if ((a === 'arbuthnot' && b === 'debenham')) w = 1.5

    // 雷切尔 vs 任何嫌疑人 = 审判关系 (conspiracy, weight 1.2)
    if ((a === 'ratchett' && ROLE[b] === 'suspect') ||
        (b === 'ratchett' && ROLE[a] === 'suspect')) {
      w = 1.2
      layer = 'conspiracy'
    }

    // 12 嫌疑人彼此 = 同谋网 (conspiracy, weight 1.0)
    if (ROLE[a] === 'suspect' && ROLE[b] === 'suspect') {
      layer = 'conspiracy'
      w = 1.0
    }

    // 嫌疑人与「复仇对象」(Sarah / Sonia / Linda / Daisy / ColJohnson / Arbuthnot 等)
    // = 阴谋关系, weight 1.0
    const conspiracyTargets = new Set(['sarah', 'sonia', 'daisy', 'hubbard', 'coljohnson', 'arbuthnot'])
    if (conspiracyTargets.has(a) && ROLE[b] === 'suspect') {
      layer = 'conspiracy'
      w = 1.0
    }
    if (conspiracyTargets.has(b) && ROLE[a] === 'suspect') {
      layer = 'conspiracy'
      w = 1.0
    }

    // Poirot 调查关系
    if (a === 'poirot' || b === 'poirot') w = Math.max(w, 0.9)

    edges.push({
      id: `e${idx++}`,
      source: a,
      target: b,
      weight: Number(w.toFixed(2)),
      layer,
    })
  }
}

if (edges.length !== 190) console.warn(`!!! edges = ${edges.length}, expected 190`)

writeFileSync(`${ROOT}/public/gephi/edges.json`, JSON.stringify({ edges }, null, 2))
console.log(`Wrote ${edges.length} edges to public/gephi/edges.json`)
