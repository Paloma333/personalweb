import { useCallback, useEffect, useRef, useState } from 'react'
import { PROJECTS, type WebsiteEntry } from '../../data/content'
import { useStore } from '../../store'
import BackToFolders from './BackToFolders'
import { releaseImages, SIZES, workImage } from './imageSources'
import './website.css'
import './projects-carousel.css'

/**
 * SELECTED WORK › PERSONAL PROJECTS —— 横屏轮播
 *
 * 2026-09-09：从 ProjectsScroll（纵向滚动）改回横屏切屏。理由：
 *   - INTERNSHIP 已经是静态卡片网格，PROJECTS 再用纵向会让两个栏目节奏雷同
 *   - 横屏左右箭头 + 右侧项目名导航更像"翻作品集"的心智，访客能直觉地
 *     看到"还有 4 个项目"
 *   - 每屏一项目，左视觉右文案全部平铺（不藏在点击后面）—— 沿用之前的
 *     信息密度，不退回 3D 环形轮播那种封面不可读的状态
 */
type Props = {
  items?: WebsiteEntry[]
  head?: string
}

export default function ProjectsCarousel({ items = PROJECTS, head = 'PERSONAL PROJECTS' }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const openOverlay = useStore((s) => s.openOverlay)
  const busy = useRef(false)

  // 关闭栏目时断开图片引用
  useEffect(() => {
    const root = rootRef.current
    return () => releaseImages(root)
  }, [])

  const go = useCallback(
    (i: number) => {
      if (busy.current) return
      const next = ((i % items.length) + items.length) % items.length
      busy.current = true
      setActive(next)
      // 跟过渡时间同步（CSS 0.5s）锁一下，避免快速连点抢状态
      window.setTimeout(() => {
        busy.current = false
      }, 500)
    },
    [items.length],
  )

  // 键盘 ← →
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setActive((cur) => (cur + 1) % items.length)
      if (e.key === 'ArrowLeft') setActive((cur) => (cur - 1 + items.length) % items.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [items.length])

  return (
    <div ref={rootRef} className="wv pcr">
      <BackToFolders />

      {/* 顶部头部：标题 + 计数 */}
      <header className="pcr__head">
        <h1 className="pcr__title-main">{head}</h1>
        <span className="pcr__count">
          {items[active].no} / {String(items.length).padStart(2, '0')}
        </span>
      </header>

      {/* 横向切屏 viewport */}
      <div className="pcr__viewport">
        <div
          className="pcr__track"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {items.map((w, i) => (
            <section
              key={w.no}
              className="pcr__item"
              data-active={i === active || undefined}
              aria-hidden={i !== active}
            >
              {/* 视觉区：竖屏项目（小屋）用竖屏比例，其余 16:9 */}
              <div className={`pcr__visual${w.portrait ? ' pcr__visual--portrait' : ''}`}>
                <img
                  {...(w.portrait ? workImage('portrait', w.cover) : workImage('cover', w.cover))}
                  sizes={w.portrait ? SIZES.portrait : SIZES.website}
                  alt={w.slug}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  style={{ ['--glow' as string]: w.glow }}
                />
              </div>

              {/* 文案区：全部平铺，不藏 */}
              <div className="pcr__text">
                <div className="pcr__meta">
                  <span className="pcr__no">{w.no}</span>
                  <span className="pcr__kicker">{w.kicker}</span>
                </div>

                <h2 className="pcr__title">
                  {w.title.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </h2>

                <p className="pcr__desc">{w.desc}</p>

                {w.body && <p className="pcr__body">{w.body}</p>}

                {w.features && w.features.length > 0 && (
                  <ul className="pcr__features">
                    {w.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                )}

                {w.story && <p className="pcr__story">{w.story}</p>}

                <div className="pcr__actions">
                  {w.viewer ? (
                    <button
                      type="button"
                      className="pcr__open"
                      onClick={() => openOverlay(w.viewer as 'gephi' | 'jrock')}
                    >
                      查看可视化 ↗
                    </button>
                  ) : (
                    <a
                      className="pcr__open"
                      href={w.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-disabled={w.href === '#' ? 'true' : undefined}
                    >
                      OPEN PROJECT ↗
                    </a>
                  )}

                  {w.links && w.links.length > 0 && (
                    <ul className="pcr__links">
                      {w.links.map((l) => (
                        <li key={l.href}>
                          <a href={l.href} target="_blank" rel="noreferrer">
                            {l.label} ↗
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* 左右箭头 */}
        <button
          type="button"
          className="pcr__arrow pcr__arrow--prev"
          onClick={() => setActive((cur) => (cur - 1 + items.length) % items.length)}
          aria-label="上一项"
        >
          ←
        </button>
        <button
          type="button"
          className="pcr__arrow pcr__arrow--next"
          onClick={() => setActive((cur) => (cur + 1) % items.length)}
          aria-label="下一项"
        >
          →
        </button>
      </div>

      {/* 右侧项目名锚点导航（垂直居中）。
          用户要求：居中点、能看到项目名称、支持跳转。 */}
      <nav className="pcr__nav" aria-label="项目锚点">
        {items.map((w, i) => (
          <button
            key={w.no}
            type="button"
            className="pcr__nav-item"
            data-on={i === active || undefined}
            onClick={() => go(i)}
            aria-label={`跳到 ${w.slug}`}
          >
            <span className="pcr__nav-no">{w.no}</span>
            <span className="pcr__nav-label">{w.title[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}