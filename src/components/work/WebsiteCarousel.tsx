import { useCallback, useEffect, useRef, useState } from 'react'
import { WEBSITES, type WebsiteEntry } from '../../data/content'
import { useStore } from '../../store'
import BackToFolders from './BackToFolders'
import { releaseImages, SIZES, workImage } from './imageSources'
import './website.css'

/* 环上相邻两张的夹角。78° 时邻片正面投影只剩 28px，是贴在画框边上的一条立边；
   50° 时投影宽 214px（7.6 倍），内缘还能塞到活动卡背后 7px，两张之间不留纸缝。
   可用区间 46–51：52° 起内缘退出活动卡，10px 的缝会重新露出来。 */
const STEP = 78
const RADIUS = 560

type Props = {
  /** 这一组轮播的作品；不传时回落到旧的 WEBSITES（占位数据） */
  items?: WebsiteEntry[]
  /** 左上角栏目标题 */
  head?: string
}

/** SELECTED WORK › WEBSITE & WRITING —— 3D 环形封面轮播 */
export default function WebsiteCarousel({ items = WEBSITES, head = 'WEBSITE & WRITING' }: Props) {
  /** 连续位置（不取模），保证旋转永远沿最短方向且两侧始终有卡片 */
  const [pos, setPos] = useState(0)
  const [open, setOpen] = useState(false)
  const [drift, setDrift] = useState(0)
  const openOverlay = useStore((s) => s.openOverlay)
  const [dragging, setDragging] = useState(false)
  const drag = useRef({ on: false, x: 0, base: 0, moved: false })
  const wheelLock = useRef(0)
  const rootRef = useRef<HTMLDivElement>(null)

  // 关闭栏目时断开封面图引用
  useEffect(() => {
    const root = rootRef.current
    return () => releaseImages(root)
  }, [])

  const n = items.length
  const idx = ((Math.round(pos) % n) + n) % n
  const cur = items[idx]

  const go = useCallback((d: number) => {
    setOpen(false)
    setPos((p) => p + d)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    const onWheel = (e: WheelEvent) => {
      const now = performance.now()
      if (now - wheelLock.current < 460) return
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      if (Math.abs(d) < 12) return
      wheelLock.current = now
      go(d > 0 ? 1 : -1)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('wheel', onWheel)
    }
  }, [go])

  const onDown = (e: React.PointerEvent) => {
    drag.current = { on: true, x: e.clientX, base: drift, moved: false }
    setDragging(true) // 拖拽期间关掉卡片过渡，角度要跟手
  }
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.on) return
    const dx = e.clientX - drag.current.x
    /* 指针捕获要等真拖起来（>4px）才拿：在 pointerdown 就捕获，后续事件全被锁在
       ring 上，封面 button 收不到 click，data-open 永远翻不过来 —— 点封面没反应。
       挪到这里之后，单击照常冒泡开面板，真拖拽仍然捕获、仍然靠 moved 吃掉那次 click。 */
    if (Math.abs(dx) > 4 && !drag.current.moved) {
      drag.current.moved = true
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    }
    setDrift(drag.current.base + dx * 0.26)
  }
  const onUp = () => {
    if (!drag.current.on) return
    drag.current.on = false
    setDragging(false)
    const steps = Math.round(drift / STEP)
    if (steps) {
      setOpen(false)
      setPos((p) => p - steps)
    }
    setDrift(0)
  }

  /* 每张卡片渲染前后各一份副本，环上任意角度都不会缺口 */
  const slots: { key: string; w: WebsiteEntry; a: number; active: boolean }[] = []
  for (let rep = -1; rep <= 1; rep++) {
    items.forEach((w, i) => {
      const a = (i + rep * n - pos) * STEP + drift
      if (Math.abs(a) > 150) return
      slots.push({ key: `${rep}-${i}`, w, a, active: Math.abs(a) < STEP / 2 })
    })
  }

  return (
    <div ref={rootRef} className="wv wsc" style={{ ['--glow' as string]: cur.glow }}>
      <BackToFolders />
      <h1 className="wsc__head">{head}</h1>
      <div className="wsc__glow" aria-hidden />

      <div
        className="wsc__ring"
        data-open={open}
        data-drag={dragging}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        {/* translateZ(-560px) 挪进 website.css：内联 style 的特异性压过一切，
            展开态那条 .wsc__ring[data-open='true'] .wsc__spin 根本推不动卡片 */}
        <div className="wsc__spin">
          {slots.map((s) => (
            /* data-gone：超过这个角度就淡掉（背面不可靠，见 website.css）。 */
            <button
              key={s.key}
              type="button"
              className="wsc__card"
              data-active={s.active}
              data-gone={Math.abs(s.a) > 88}
              tabIndex={s.active ? 0 : -1}
              style={{
                transform: `rotateY(${s.a}deg) translateZ(${RADIUS}px)`,
                zIndex: 100 - Math.round(Math.abs(s.a)),
              }}
              onClick={() => {
                if (drag.current.moved) return
                if (s.active) setOpen((o) => !o)
              }}
            >
              <img
                {...(s.w.portrait ? workImage('portrait', s.w.cover) : workImage('cover', s.w.cover))}
                sizes={s.w.portrait ? SIZES.portrait : SIZES.website}
                alt={s.w.slug}
                loading="lazy"
                decoding="async"
                draggable={false}
                className={s.w.portrait ? 'wsc__img wsc__img--portrait' : 'wsc__img'}
              />
              <span className="wsc__bar">
                <span>{s.w.slug}</span>
                <span>{s.w.no}</span>
              </span>
            </button>
          ))}
        </div>

        <aside className="wsc__panel" data-show={open} aria-hidden={!open}>
          <span className="wsc__kicker">{cur.kicker}</span>
          <h2 className="wsc__title">
            {cur.title.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </h2>
          <p className="wsc__desc">{cur.desc}</p>

          {/* 详情正文：有 body 时优先显示（小屋那段引言式文案） */}
          {cur.body && <p className="wsc__body">{cur.body}</p>}

          {/* 功能列表：小屋那段核心功能 */}
          {cur.features && cur.features.length > 0 && (
            <ul className="wsc__features">
              {cur.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}

          {/* 故事段落：放在最后，与上面区分 */}
          {cur.story && <p className="wsc__story">{cur.story}</p>}

          {/* 主出口：viewer 走站内 overlay（按钮）；其他走外链或占位 */}
          {cur.viewer ? (
            <button
              type="button"
              className="wsc__open wsc__open--viewer"
              onClick={() => openOverlay(cur.viewer as 'gephi' | 'jrock')}
              tabIndex={open ? 0 : -1}
            >
              查看可视化 ↗
            </button>
          ) : (
            <a
              className="wsc__open"
              href={cur.href}
              target="_blank"
              rel="noreferrer"
              aria-disabled={cur.href === '#' ? 'true' : undefined}
              tabIndex={open ? 0 : -1}
            >
              OPEN PROJECT ↗
            </a>
          )}

          {/* 次级入口：与 OPEN PROJECT 平级但更深入（子页面 / 附件 / 源码） */}
          {cur.links && cur.links.length > 0 && (
            <ul className="wsc__links" data-show={open}>
              {cur.links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1}>
                    {l.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      <div className="wsc__below" data-dim={open}>
        <h2 className="wsc__slug">{cur.slug}</h2>
        <div className="wsc__nav">
          <button
            type="button"
            className="wsc__arrow"
            onClick={() => go(-1)}
            aria-label="上一项"
          >
            ←
          </button>
          <span className="wsc__count">
            {String(idx + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
          </span>
          <button
            type="button"
            className="wsc__arrow wsc__arrow--next"
            onClick={() => go(1)}
            aria-label="下一项"
          >
            →
          </button>
        </div>
        <p className="wv__tip">DRAG / SCROLL TO ROTATE · CLICK A COVER</p>
      </div>
    </div>
  )
}
