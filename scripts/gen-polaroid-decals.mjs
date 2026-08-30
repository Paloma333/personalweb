// 把 02 的 5 张人像 + 06 的 2 张实习场面,处理成「白边拍立得 + 透明背景」webp,放进柜门贴纸位。
//
// 关键决策：
//   · 输出 webp 带 alpha — 比 PNG 小 50%+；decal 系统对 alpha 通道透明背景兼容
//   · 内容高度上限 1000px — 比之前 1400 减小 30% 体积，仍满足 4K 屏清晰度
//   · 保持原图比例（不做强制方形裁切）— 拍立得正片本身就是长方形
//
// 拍立得白边沿用之前确认过的「上薄下厚」比例（上 50px / 下 130px / 左右 36px）。
// 策略：分两步合成 ——
//   1. 生成一张「白底 RGBA」正片（背景完整白 + 内容图）
//   2. 用灰度阈值生成 alpha mask，把白边像素改为透明

import sharp from 'sharp'
import { readdirSync, mkdirSync, existsSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const SOURCES = [
  { dir: '/Users/liuyushan/WorkBuddy/个人网站/素材/02-门上拍立得-竖构图', prefix: 'p' },
  { dir: '/Users/liuyushan/WorkBuddy/个人网站/素材/06-实习项目截图-脱敏', prefix: 'i' },
]
const OUT = resolve('/Users/liuyushan/WorkBuddy/个人网站/locker-site/public/assets/polaroid')

const BORDER = { top: 50, bottom: 130, left: 36, right: 36 }
const CONTENT_H = 1000

const WHITE = { r: 252, g: 250, b: 247, alpha: 1 } // 略带暖色的白

const collected = []
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })

for (const src of SOURCES) {
  const files = readdirSync(src.dir)
    .filter((f) => /\.(png|jpe?g|webp|heic)$/i.test(f))
    .filter((f) => !f.startsWith('.'))
  for (const f of files) collected.push({ inp: join(src.dir, f), group: src.prefix, name: f })
}

if (collected.length === 0) {
  console.error('no source images found')
  process.exit(1)
}

let idx = 0
for (const item of collected) {
  idx++
  const slot = `${item.group}${idx}`

  // 1. 内容图：保持原比例，高度限制 CONTENT_H，宽度等比
  const meta = await sharp(item.inp).metadata()
  const aspect = (meta.width || 3) / (meta.height || 4)
  let targetH = CONTENT_H
  let targetW
  if (aspect >= 1) {
    // 原图偏横：以高度为基准
    targetH = CONTENT_H
    targetW = Math.round(CONTENT_H * aspect)
  } else {
    // 原图偏竖：以高度为基准
    targetH = CONTENT_H
    targetW = Math.round(CONTENT_H * aspect)
  }

  const contentBuf = await sharp(item.inp)
    .resize(targetW, targetH, { fit: 'cover', position: 'attention' })
    .modulate({ brightness: 1.02 })
    .sharpen({ sigma: 0.5, m1: 0.5, m2: 1.0 })
    .toBuffer()

  const cMeta = await sharp(contentBuf).metadata()
  const contentW = cMeta.width

  // 2. 总画布尺寸
  const totalW = contentW + BORDER.left + BORDER.right
  const totalH = CONTENT_H + BORDER.top + BORDER.bottom

  // 3. 拍立得白底 RGBA（白底 + 内容图）
  const whiteRgba = await sharp({
    create: { width: totalW, height: totalH, channels: 4, background: WHITE },
  })
    .composite([{ input: contentBuf, top: BORDER.top, left: BORDER.left }])
    .png()
    .toBuffer()

  // 4. alpha mask：白边 → 透明
  const alphaMask = await sharp(whiteRgba)
    .toColourspace('b-w')
    .threshold(248)
    .negate({ alpha: false })
    .toBuffer()

  // 5. webp with alpha
  const outPath = join(OUT, `${slot}.webp`)
  await sharp(whiteRgba)
    .joinChannel(alphaMask)
    .webp({ quality: 86, alphaQuality: 80 })
    .toFile(outPath)

  const sz = statSync(outPath).size
  console.log(`  ${slot} <- ${item.group === 'p' ? 'person' : 'intern'} · ${item.name} · ${contentW}×${CONTENT_H} → ${totalW}×${totalH} · ${(sz / 1024).toFixed(0)} KB`)
}

console.log(`\ndone. ${idx} polaroids -> ${OUT}`)