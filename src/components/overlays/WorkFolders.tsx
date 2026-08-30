import { lazy, Suspense } from 'react'
import { FOLDERS, INTERNSHIPS, PROJECTS } from '../../data/content'
import { useStore, type WorkView } from '../../store'
import CloseButton from './CloseButton'
import './overlay.css'
import './folders.css'

const WebsiteCarousel = lazy(() => import('../work/WebsiteCarousel'))

/* 两个文件夹的版位（相对 1320×724 底稿换算成百分比）：
   实习占中间大位，个人项目右侧偏上 */
const POS: Record<string, { l: number; t: number; w: number; h: number; rot: number }> = {
  intern: { l: 33.0, t: 27.6, w: 29.2, h: 44.2, rot: -7 },
  projects: { l: 58.0, t: 18.0, w: 23.0, h: 36.0, rot: 3 },
}

export default function WorkFolders() {
  const workView = useStore((s) => s.workView)
  const setWorkView = useStore((s) => s.setWorkView)

  if (workView) {
    return (
      <Suspense fallback={<div className="wv wv--loading" />}>
        {workView === 'intern' && <WebsiteCarousel items={INTERNSHIPS} head="INTERNSHIP" />}
        {workView === 'projects' && <WebsiteCarousel items={PROJECTS} head="PERSONAL PROJECTS" />}
      </Suspense>
    )
  }

  return (
    <div className="ov">
      <CloseButton />
      <div className="fw">
        <Star className="fw__star fw__star--yellow" points={12} color="#f6dc86" />
        <Star className="fw__star fw__star--lime" points={10} color="#c8f322" />

        {FOLDERS.map((f, i) => {
          const p = POS[f.id]
          return (
            <button
              key={f.id}
              type="button"
              className="fold"
              aria-label={`${f.en.join(' ')} ${f.cn}`}
              onClick={() => setWorkView(f.id as WorkView)}
              style={
                {
                  left: `${p.l}%`,
                  top: `${p.t}%`,
                  width: `${p.w}%`,
                  height: `${p.h}%`,
                  zIndex: f.z,
                  '--rot': `${p.rot}deg`,
                  '--bg': f.bg,
                  '--fg': f.fg,
                  '--cnfg': f.cnFg,
                  animationDelay: `${0.06 * i}s`,
                } as React.CSSProperties
              }
            >
              <span className="fold__back" />
              <span className="fold__papers">
                <i />
                <i />
                <i />
              </span>
              <span className="fold__front">
                <span className="fold__en">
                  {f.en.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </span>
                <span className="fold__cn">{f.cn}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Star({ points, color, className }: { points: number; color: string; className?: string }) {
  const pts: string[] = []
  const n = points * 2
  for (let i = 0; i < n; i++) {
    const r = i % 2 === 0 ? 50 : 30
    const a = (Math.PI * 2 * i) / n - Math.PI / 2
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`)
  }
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden>
      <polygon points={pts.join(' ')} fill={color} />
    </svg>
  )
}
