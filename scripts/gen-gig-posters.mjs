#!/usr/bin/env node
/**
 * 生成「个人爱好 → 演出地图」用的海报图。
 *
 * 源图在仓库外的 素材/04-乐队现场照（原始 JPG，竖构图 1:1.4 – 1:1.8），
 * 这里统一压成 webp，按面板里的真实显示宽度出两档变体：
 *   -600（2x）/ -300（1x），原图再限到 1000 宽作为 srcset 的最大档。
 *
 * 用法：node scripts/gen-gig-posters.mjs
 * 依赖：sharp（devDependency）
 */
import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const here = path.dirname(fileURLToPath(import.meta.url))
const SRC_DIR = path.resolve(here, '../../素材/04-乐队现场照')
const OUT_DIR = path.resolve(here, '../public/assets/gig')

/** 源文件名 → 输出 slug。改文件名时改这里即可 */
const SLUG = {
  '海报-安吉.JPG': 'anji',
  '海报-杭州.JPG': 'hangzhou',
  '海报-上海cream.JPG': 'cream',
  '海报-上海sandbar.JPG': 'sandbar',
  '海报-上海交大.JPG': 'sjtu',
  '海报-上海毕业晚会.jpg': 'ecnu',
}

const VARIANTS = [300, 600]
const FULL_W = 1000

await mkdir(OUT_DIR, { recursive: true })
const files = await readdir(SRC_DIR)

for (const [srcName, slug] of Object.entries(SLUG)) {
  const hit = files.find((f) => f === srcName)
  if (!hit) {
    console.warn(`! 缺源图：${srcName}（跳过 ${slug}）`)
    continue
  }
  const buf = await sharp(path.join(SRC_DIR, hit))
    .rotate() // 读 EXIF 方向，避免手机竖拍被放倒
    .resize({ width: FULL_W, withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toBuffer()
  await sharp(buf).toFile(path.join(OUT_DIR, `${slug}.webp`))
  const meta = await sharp(buf).metadata()

  for (const w of VARIANTS) {
    await sharp(buf)
      .resize({ width: w })
      .webp({ quality: 80, effort: 6 })
      .toFile(path.join(OUT_DIR, `${slug}-${w}.webp`))
  }

  console.log(`${slug.padEnd(10)} ${meta.width}×${meta.height}  ${(buf.length / 1024).toFixed(0)}KB`)
}
console.log(`\n→ ${path.relative(process.cwd(), OUT_DIR)}`)
