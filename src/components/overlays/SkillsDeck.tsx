import { useCallback, useEffect, useRef, useState } from 'react'
import { SKILLS } from '../../data/content'
import { useStore } from '../../store'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import CloseButton from './CloseButton'
import './overlay.css'
import './skills.css'

type Slot = { x: number; y: number; s: number; r: number }

/* 卡片向右上错落堆叠，和参考一致；索引即层级，0 是最前面那张 */
const SLOTS: Slot[] = [
  { x: 0, y: 0, s: 1, r: 0 },
  { x: 40, y: -48, s: 0.978, r: 0.9 },
  { x: 79, y: -95, s: 0.956, r: 1.9 },
]

/* 前卡退出时的落点：向左下滑出，同时轻微缩小和反向倾斜 */
const EXIT: Slot = { x: -26, y: 150, s: 0.94, r: -4.6 }

/** 前卡滑出 + 后层卡上移的共同时长：两件事必须在同一条时间线里 */
const OUT_MS = 420
/** 滑出的卡片落回最后一层后淡入的时长 */
const BACK_MS = 260
/** Reduced Motion 下只保留一次短淡化 */
const FADE_MS = 150

/** 退出中的卡片压在所有卡片之上，落回后层时才把层级降下去 */
const EXIT_Z = 30

/* 2026-09-09：初始最前改回 01（AI 实践），不再沿用参考的 02 起手 */
const INITIAL_ORDER = [0, 1, 2]

type Moving = { card: number; stage: 'out' | 'back' }

function css(p: Slot) {
  return `translate(${p.x}px, ${p.y}px) scale(${p.s}) rotate(${p.r}deg)`
}

/**
 * SKILLS —— 从唱片箱里抽出的三张技能卡。
 *
 * 2026-09-09 简化：去掉「展开全部」，只保留左右箭头切换（外加键盘 ← →）。
 * 展开态那套 FAN/pick/toggleSpread 全删 —— 三张卡一字排开在窄屏上反而读不了，
 * 而且用户要的就是「翻卡」这一种动作。
 *
 * 下一张：前卡向左下滑出、落回最后一层（EXIT 动画）
 * 上一张：最后一张直接升到最前，其余靠 SLOT 之间的 transition 自然下沉
 */
export default function SkillsDeck() {
  const reduced = useReducedMotion()
  const openOverlay = useStore((s) => s.openOverlay)
  const [order, setOrder] = useState(INITIAL_ORDER)
  const [moving, setMoving] = useState<Moving | null>(null)
  // 入场动画只跑一次：播完（或用户提前换位）后彻底关掉，
  // 否则 slot 变化引起的 animation-delay 变化会让 skIn 重新触发并抢走 transform
  const [entered, setEntered] = useState(false)
  const busy = useRef(false)
  const timers = useRef<number[]>([])

  useEffect(
    () => () => {
      for (const t of timers.current) window.clearTimeout(t)
    },
    [],
  )

  const later = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms))
  }, [])

  /** 下一张：当前前卡滑出画面，落回最后一层 */
  const next = useCallback(() => {
    if (busy.current) return
    busy.current = true
    setEntered(true)
    const front = order[0]
    const done = () => {
      setMoving(null)
      busy.current = false
    }

    // 换位与前卡退出在同一帧提交：后层卡的上移、旋转与前卡的滑出共用一条时间线
    setOrder((o) => [...o.slice(1), o[0]])

    if (reduced) {
      setMoving({ card: front, stage: 'back' })
      later(FADE_MS, done)
      return
    }

    setMoving({ card: front, stage: 'out' })
    later(OUT_MS, () => {
      setMoving({ card: front, stage: 'back' })
      later(BACK_MS, done)
    })
  }, [order, reduced, later])

  /** 上一张：最后一张升到最前，剩下的靠 SLOT 位移过渡自然下沉 */
  const prev = useCallback(() => {
    if (busy.current) return
    busy.current = true
    setEntered(true)
    setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)])
    // 不需要 EXIT 动画：卡片自己会在 SLOTS 之间过渡，解锁即可
    later(reduced ? FADE_MS : OUT_MS, () => {
      busy.current = false
    })
  }, [reduced, later])

  // 键盘 ← → 切换
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  const front = SKILLS[order[0]]

  return (
    <div className="ov">
      <CloseButton />
      <div
        className="sk"
        role="group"
        aria-label={`技能卡组，共 ${SKILLS.length} 张`}
        data-entered={entered || undefined}
        onAnimationEnd={() => setEntered(true)}
      >
        <p className="sk__sr">用左右箭头切换技能卡。</p>
        <p className="sk__sr" aria-live="polite">
          当前最前：{front.no} {front.title}
        </p>

        {SKILLS.map((c, i) => {
          const slot = order.indexOf(i)
          const isFront = slot === 0
          const stage = moving?.card === i ? moving.stage : null
          const zIndex = stage === 'out' ? EXIT_Z : 10 - slot

          return (
            <button
              key={c.no}
              type="button"
              className="sk__card"
              data-stage={stage ?? undefined}
              tabIndex={isFront ? 0 : -1}
              onClick={isFront ? next : undefined}
              style={{
                zIndex,
                background: c.bg,
                color: c.fg,
                transform: css(stage === 'out' ? EXIT : SLOTS[slot] ?? SLOTS[2]),
                opacity: stage === 'out' ? 0 : 1,
                transition: transitionFor(stage, reduced),
                pointerEvents: isFront ? 'auto' : 'none',
                // 入场错峰按初始层级固定，换位时不能变，否则会重新触发入场动画
                ['--in-delay' as string]: `${(SKILLS.length - 1 - INITIAL_ORDER.indexOf(i)) * 0.075}s`,
              }}
            >
              <span className="sk__arc" aria-hidden />
              <span className="sk__kicker">{c.kicker}</span>
              <span className="sk__title">{c.title}</span>
              <span className="sk__desc">{c.desc}</span>

              {/* 卡内跳转入口（AI 卡的「具体作品」→ 作品展示）。
                  外层卡片本身是 button，这里只能用 span + role=button，
                  不能嵌套真 button。 */}
              {c.link && (
                <span
                  role="button"
                  tabIndex={isFront ? 0 : -1}
                  className="sk__link"
                  onClick={(e) => {
                    e.stopPropagation()
                    openOverlay(c.link!.target)
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter' && e.key !== ' ') return
                    e.preventDefault()
                    e.stopPropagation()
                    openOverlay(c.link!.target)
                  }}
                >
                  {c.link.text} ↗
                </span>
              )}

              <span className="sk__spacer" />
              <span className="sk__rows">
                {c.rows.map((r) => (
                  <span key={r.k} className="sk__row">
                    <span className="sk__k">{r.k}</span>
                    <span className="sk__v">{r.v}</span>
                  </span>
                ))}
              </span>
            </button>
          )
        })}
      </div>

      {/* 左右箭头切换 —— 取代原来的「展开全部」 */}
      <div className="sk__nav">
        <button type="button" className="sk__arrow" onClick={prev} aria-label="上一张">
          ←
        </button>
        <span className="sk__count">
          {front.no} / {String(SKILLS.length).padStart(2, '0')}
        </span>
        <button
          type="button"
          className="sk__arrow sk__arrow--next"
          onClick={next}
          aria-label="下一张"
        >
          →
        </button>
      </div>
    </div>
  )
}

function transitionFor(stage: 'out' | 'back' | null, reduced: boolean) {
  if (reduced) return 'none'
  // 落回最后一层：transform 不过渡，趁看不见的时候直接归位，只淡入
  if (stage === 'back') return `opacity ${BACK_MS}ms var(--ease-out)`
  return `transform ${OUT_MS}ms var(--ease-io), opacity ${Math.round(OUT_MS * 0.8)}ms linear`
}
