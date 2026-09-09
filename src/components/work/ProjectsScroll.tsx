import { useEffect, useRef, useState } from 'react'
import { PROJECTS, type WebsiteEntry } from '../../data/content'
import { useStore } from '../../store'
import BackToFolders from './BackToFolders'
import { releaseImages, SIZES, workImage } from './imageSources'
import './website.css'
import './projects.css'

/**
 * SELECTED WORK › PERSONAL PROJECTS —— 纵向滚动项目陈列
 *
 * 为什么不沿用 3D 环形轮播（WebsiteCarousel）：
 *   1. 轮播的前提是「信息值得藏」——封面后面藏着详情，点开才有。
 *      但这四个项目每个都有完整的简介/功能/故事，藏进点击后面就是让人多一步。
 *   2. 3D 透视让封面本身不可读：卡片一转，真实截图（Gephi / J-rock）全变成立边。
 *   3. 竖屏手机截图硬塞进横屏卡，两侧黑条。
 *
 * 新结构：
 *   - 每个项目占一屏，左视觉右文案，信息全部平铺
 *   - 竖屏（小屋）用竖屏比例完整显示，横屏用 16:9
 *   - 顶部吸顶导航：编号锚点，滚动同步高亮
 *   - gephi / jrock 的「查看可视化」仍打开独立全屏 overlay
 */
type Props = {
  items?: WebsiteEntry[]
  head?: string
}

export default function ProjectsScroll({ items = PROJECTS, head = 'PERSONAL PROJECTS' }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const openOverlay = useStore((s) => s.openOverlay)

  // 关闭栏目时断开图片引用
  useEffect(() => {
    const root = rootRef.current
    return () => releaseImages(root)
  }, [])

  // scroll spy：哪个 section 占视口过半就高亮哪个锚点
  useEffect(() => {
    const scrollEl = scrollRef.current
    if (!scrollEl) return
    const sections = scrollEl.querySelectorAll<HTMLElement>('.psc__item')
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActive(Number((e.target as HTMLElement).dataset.index ?? 0))
          }
        }
      },
      { root: scrollEl, threshold: 0.5 },
    )
    sections.forEach((s) => obs.observe(s))
    return () => obs.disconnect()
  }, [items])

  const scrollTo = (i: number) => {
    scrollRef.current
      ?.querySelector(`[data-index="${i}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div ref={rootRef} className="wv psc">
      <BackToFolders />

      <header className="psc__head">
        <h1 className="psc__title-main">{head}</h1>
        <nav className="psc__nav" aria-label="项目锚点">
          {items.map((w, i) => (
            <button
              key={w.no}
              type="button"
              className="psc__nav-dot"
              data-on={i === active}
              onClick={() => scrollTo(i)}
              aria-label={`跳到 ${w.slug}`}
            >
              {w.no}
            </button>
          ))}
        </nav>
      </header>

      <div ref={scrollRef} className="psc__scroll">
        {items.map((w, i) => (
          <section key={w.no} className="psc__item" data-index={i}>
            {/* 视觉区：竖屏项目（小屋）用竖屏比例，其余 16:9 */}
            <div className={`psc__visual${w.portrait ? ' psc__visual--portrait' : ''}`}>
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
            <div className="psc__text">
              <div className="psc__meta">
                <span className="psc__no">{w.no}</span>
                <span className="psc__kicker">{w.kicker}</span>
              </div>

              <h2 className="psc__title">
                {w.title.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </h2>

              <p className="psc__desc">{w.desc}</p>

              {w.body && <p className="psc__body">{w.body}</p>}

              {w.features && w.features.length > 0 && (
                <ul className="psc__features">
                  {w.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              )}

              {w.story && <p className="psc__story">{w.story}</p>}

              <div className="psc__actions">
                {w.viewer ? (
                  <button
                    type="button"
                    className="psc__open"
                    onClick={() => openOverlay(w.viewer as 'gephi' | 'jrock')}
                  >
                    查看可视化 ↗
                  </button>
                ) : (
                  <a
                    className="psc__open"
                    href={w.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-disabled={w.href === '#' ? 'true' : undefined}
                  >
                    OPEN PROJECT ↗
                  </a>
                )}

                {w.links && w.links.length > 0 && (
                  <ul className="psc__links">
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

        <footer className="psc__foot">
          <span>END OF PROJECTS</span>
          <span>{items.length} / {items.length}</span>
        </footer>
      </div>
    </div>
  )
}
