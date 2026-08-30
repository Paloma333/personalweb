#!/usr/bin/env node
/**
 * 生成 Phase 1 的占位封面（1400×788 webp + 480/640/960 变体）。
 * 用完即可删：拿到真实截图后按相同命名覆盖 assets/cover/{slug}.webp
 * 再跑 scripts/gen-image-variants.sh 重新生成变体。
 *
 * 用法：node scripts/gen-placeholder-covers.mjs
 */
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const outDir = decodeURIComponent(
  new URL('../public/assets/cover/', import.meta.url).pathname,
)
mkdirSync(outDir, { recursive: true })

const W = 1400
const H = 788

/** 与 content.ts 里 INTERNSHIPS / PROJECTS 的 cover 字段一一对应 */
const covers = [
  {
    slug: 'meituan',
    bg: '#ffc300',
    fg: '#14161a',
    accent: '#1b28d8',
    en: 'MEITUAN',
    cn: '营销策略中台 × AI Copilot',
    note: 'PRODUCT INTERNSHIP',
  },
  {
    slug: 'dewu',
    bg: '#14161a',
    fg: '#f8f7fa',
    accent: '#c8f322',
    en: 'DEWU',
    cn: '内容社区 · 流量分析重构',
    note: 'DATA PM INTERNSHIP',
  },
  {
    slug: 'mcd',
    bg: '#e0322a',
    fg: '#ffc72c',
    accent: '#f8f7fa',
    en: "MCDONALD'S",
    cn: 'Global · AI Summary Agent',
    note: 'DATA PM INTERNSHIP',
  },
  {
    slug: 'him',
    bg: '#f2e3cf',
    fg: '#2c2925',
    accent: '#1b28d8',
    en: 'HIM',
    cn: '小屋日志 · 家用物品清单 App',
    note: 'INDIE PROJECT',
  },
  {
    slug: 'dh',
    bg: '#1b28d8',
    fg: '#c8f322',
    accent: '#f8f7fa',
    en: 'DIGITAL HUMANITIES',
    cn: '数字人文资源库 · 70页指南',
    note: 'CAMPUS PROJECT',
  },
  {
    slug: 'ielts',
    bg: '#c8f322',
    fg: '#1b28d8',
    accent: '#14161a',
    en: 'IELTS COACH',
    cn: '雅思口语 · AI 陪练',
    note: 'TEAM PROJECT',
  },
]

const font = "'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif"

function svg({ bg, fg, accent, en, cn, note }) {
  const enSize = en.length > 12 ? 130 : 190
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${bg}"/>
  <rect x="36" y="36" width="${W - 72}" height="${H - 72}" fill="none" stroke="${accent}" stroke-width="4" stroke-dasharray="18 12"/>
  <text x="90" y="${H / 2 - 30}" font-family="${font}" font-weight="900" font-size="${enSize}" fill="${fg}" letter-spacing="2">${en}</text>
  <text x="96" y="${H / 2 + 60}" font-family="${font}" font-weight="600" font-size="52" fill="${fg}" opacity="0.85">${cn}</text>
  <text x="96" y="${H - 110}" font-family="'Courier New',monospace" font-size="30" fill="${accent}" letter-spacing="6">${note}</text>
  <text x="${W - 96}" y="${H - 110}" text-anchor="end" font-family="'Courier New',monospace" font-size="24" fill="${fg}" opacity="0.55" letter-spacing="4">PLACEHOLDER · 待替换</text>
  <circle cx="${W - 130}" cy="130" r="46" fill="none" stroke="${accent}" stroke-width="6"/>
  <circle cx="${W - 130}" cy="130" r="14" fill="${accent}"/>
</svg>`
}

for (const c of covers) {
  const buf = Buffer.from(svg(c))
  await sharp(buf).webp({ quality: 85 }).toFile(join(outDir, `${c.slug}.webp`))
  for (const w of [480, 640, 960]) {
    await sharp(buf)
      .resize(w)
      .webp({ quality: 80 })
      .toFile(join(outDir, `${c.slug}-${w}.webp`))
  }
  console.log(`ok ${c.slug}`)
}
