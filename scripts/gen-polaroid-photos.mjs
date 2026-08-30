// 把 02 里的 5 张竖构图人像处理成「拍立得」格式，替换 /assets/photo/p1-p5.webp
// 步骤：center crop 到 4:3 横向 → 加白边（上 50 / 下 110 / 左右 32，约略拍立得）→ 锐化 → 输出 4 档 webp

import sharp from 'sharp'
import { readdirSync, mkdirSync, existsSync, unlinkSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const SRC = resolve('/Users/liuyushan/WorkBuddy/个人网站/素材/02-门上拍立得-竖构图')
const OUT = resolve('/Users/liuyushan/WorkBuddy/个人网站/locker-site/public/assets/photo')

// 拍立得白边参数（白底纯色，无透明）
const BORDER = { top: 50, bottom: 110, left: 32, right: 32 }

// 拍立得正片尺寸：1400px 宽。横向裁切后的内容区是 (1400 - 64) × ((1400 - 64) / (4/3))
// = 1336 × 1002，外加白边后总尺寸 1400 × 1162（上下白边合计 160，左右 64）
const FULL_W = 1400
const CONTENT_W = FULL_W - BORDER.left - BORDER.right // 1336
const CONTENT_H = Math.round(CONTENT_W / (4 / 3))       // 1002
const TOTAL_H = CONTENT_H + BORDER.top + BORDER.bottom  // 1162

// 4 档变体（与 imageSources.ts 的 photo 档对齐）
const VARIANTS = [300, 600, 900]

const files = readdirSync(SRC).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
if (files.length === 0) {
  console.error('src dir empty:', SRC)
  process.exit(1)
}
console.log(`input ${files.length} files:`, files)

// 给 5 张照片起固定别名 b1..b5，方便后续在 PHOTOS 数组里引用
const alias = ['b1', 'b2', 'b3', 'b4', 'b5']

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })

// 删旧 p1-p5.webp（包括变体）
for (const slot of alias) {
  for (const v of ['', ...VARIANTS.map((x) => `-${x}`), `-${FULL_W}`]) {
    const f = join(OUT, `${slot}${v}.webp`)
    if (existsSync(f)) unlinkSync(f)
  }
}

const WHITE = { r: 252, g: 250, b: 247 } // 略带暖色的白，更接近真拍立得
const processed = []

for (let i = 0; i < files.length; i++) {
  const f = files[i]
  const slot = alias[i] || `b${i + 1}`
  const inp = join(SRC, f)

  // 1. 先把图按 CONTENT_W / CONTENT_H 做「保持比例填满 + 中心裁切」
  const cropped = await sharp(inp)
    .resize(CONTENT_W, CONTENT_H, { fit: 'cover', position: 'attention' }) // attention: 自动找人脸/主体
    .toBuffer()

  // 2. 加白边成拍立得正片
  const fullBuf = await sharp({
    create: {
      width: FULL_W,
      height: TOTAL_H,
      channels: 3,
      background: WHITE,
    },
  })
    .composite([{ input: cropped, top: BORDER.top, left: BORDER.left }])
    .webp({ quality: 88 })
    .toBuffer()

  await sharp(fullBuf).toFile(join(OUT, `${slot}.webp`))
  processed.push(`${slot}.webp ${statSync(join(OUT, `${slot}.webp`)).size}b`)

  // 3. 4 档变体（按 FULL_W 等比缩）
  for (const w of VARIANTS) {
    const k = w / FULL_W
    await sharp(fullBuf)
      .resize(Math.round(FULL_W * k), Math.round(TOTAL_H * k))
      .webp({ quality: 86 })
      .toFile(join(OUT, `${slot}-${w}.webp`))
  }
}

console.log('done:', processed)
console.log(`output: ${OUT}`)
console.log(`FULL canvas: ${FULL_W}x${TOTAL_H} (拍立得白边 ${BORDER.top}/${BORDER.bottom}/${BORDER.left}/${BORDER.right})`)