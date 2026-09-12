/**
 * 「MY TIME」个人爱好面板
 *
 * 2026-09-12 结构调整：
 *   - 海报不再固定在右列（右边太挤，海报被压得显示不全），改成**地图上的浮窗**，
 *     点 pin 或点场地列表才出现，可关闭。
 *   - 右列上半放两件 rock 贴纸当装饰画（一把电吉他 + 一套架子鼓），
 *     贴纸从 素材/01-贴纸-透明底 抠出（scripts/extract-rock-stickers.py）。
 *     2026-09-12 二次调整：去掉贴纸外面的白卡，只留这两件乐器本身。
 *   - 右列下半仍是 6 个场地的竖排列表。
 */
import { useEffect, useState } from 'react'
import { GIGS, GIG_STATS, MYTIME_HEAD } from '../../data/content'
import BackToFolders from './BackToFolders'
import GigMap from './GigMap'
import { SIZES, workImage } from './imageSources'
import './music.css'

/** 装饰贴纸：一把吉他 + 一套鼓。尺寸与倾角手调 ——
 *  吉他竖长（0.43）、鼓横宽（1.53），让鼓压住吉他右缘 22px，
 *  吉他再抬到上层（CSS 里 z-index），读起来就是「吉他斜靠在鼓组上」。
 *  尺寸按**高度**给（宽度 auto 跟出等比）：吉他 184、鼓 96，
 *  合计宽 204px 放进 300px 的右列；高度写 CSS 变量是为了让
 *  `max-height: 100%` 能在矮窗口里把它整体缩下来，压不到下面的场地列表。 */
const ROCK_STICKERS = [
  { src: 'guitar', h: 184, rot: -9, dy: 19 },
  { src: 'drums-b', h: 96, rot: 3, dy: -13 },
] as const

export default function MusicPanel() {
  const [no, setNo] = useState(GIGS[0].no)
  const [hover, setHover] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const gig = GIGS.find((g) => g.no === no) ?? GIGS[0]
  const img = gig.poster ? workImage('gig', gig.poster) : null

  /** 点场地 → 选中 + 打开浮窗 */
  const pick = (id: string) => {
    setNo(id)
    setOpen(true)
  }

  // Esc 关浮窗
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="mp">
      <BackToFolders />
      <header className="mp__head">
        <span className="mp__eyebrow">{MYTIME_HEAD.kicker}</span>
        <h2 className="mp__title">
          {MYTIME_HEAD.cn}
          <span className="mp__title-en">{MYTIME_HEAD.en}</span>
        </h2>
        <p className="mp__desc">{MYTIME_HEAD.desc}</p>
        <ul className="mp__stats">
          {GIG_STATS.map((s) => (
            <li key={s.v}>
              <span className="mp__stat-k">{s.k}</span>
              <span className="mp__stat-v">{s.v}</span>
            </li>
          ))}
        </ul>
      </header>

      <div className="mp__body">
        <section className="mp__map">
          <div className="mp__map-head">
            <span className="mp__map-cn">演出地图</span>
            <span className="mp__map-en">TOUR MAP</span>
          </div>
          <div className="mp__map-card">
            <GigMap active={no} hover={hover} onPick={pick} onHover={setHover} />

            {/* ── 海报浮窗：点 pin / 列表才出现 ── */}
            <div className={`mp__float${open ? ' is-open' : ''}`} aria-hidden={!open}>
              <button
                type="button"
                className="mp__float-x"
                onClick={() => setOpen(false)}
                tabIndex={open ? 0 : -1}
                aria-label="关闭海报"
              >
                ×
              </button>
              <div className="mp__float-frame">
                {img ? (
                  <img
                    src={img.src}
                    srcSet={img.srcSet}
                    sizes={SIZES.gig}
                    alt={`${gig.venue} 演出海报`}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="mp__ptba">
                    <span className="mp__ptba-mark">♪</span>
                    <strong>海报待补</strong>
                    <span className="mp__ptba-en">POSTER TBA</span>
                  </div>
                )}
              </div>
              <div className="mp__float-meta">
                <span className="mp__pmeta-no">{gig.no}</span>
                <h3>{gig.venue}</h3>
                <p className="mp__pmeta-en">{gig.en}</p>
                <p className="mp__pmeta-area">{gig.area}</p>
              </div>
            </div>
          </div>
        </section>

        <aside className="mp__side">
          {/* 装饰：一把吉他 + 一套鼓（纯装饰，无卡片底框） */}
          <div className="mp__rocks" aria-hidden="true">
            {ROCK_STICKERS.map((s) => (
              <img
                key={s.src}
                src={`/assets/rock-stickers/${s.src}.png`}
                alt=""
                draggable={false}
                style={{
                  ['--h' as string]: `${s.h}px`,
                  transform: `rotate(${s.rot}deg) translateY(${s.dy}px)`,
                }}
              />
            ))}
          </div>

          {/* 场地列表 */}
          <ul className="mp__chips">
            {GIGS.map((g) => (
              <li key={g.no}>
                <button
                  className={g.no === no ? 'is-on' : ''}
                  onClick={() => pick(g.no)}
                  onMouseEnter={() => setHover(g.no)}
                  onMouseLeave={() => setHover(null)}
                >
                  <span className="mp__chip-no">{g.no}</span>
                  <span className="mp__chip-name">{g.venue}</span>
                  <span className="mp__chip-area">{g.area}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}
