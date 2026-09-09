import { lazy, Suspense } from 'react'
import { FOLDERS, INTERNSHIPS, PROJECTS } from '../../data/content'
import { useStore, type WorkView } from '../../store'
import CloseButton from './CloseButton'
import './overlay.css'
import './folders.css'

const InternshipGrid = lazy(() => import('../work/InternshipGrid'))
const ProjectsCarousel = lazy(() => import('../work/ProjectsCarousel'))

/* 两个文件夹的版位（相对 1320×724 底稿换算成百分比）：
   实习 → 偏左大位；个人项目 → 右侧偏上。
   思考手记 (THINKING) 和 乐队手记 (MUSIC) 已升级为独立 overlay，
   各自有 3D 柜子上的文件夹 / 吉他作为入口，不再经过 SELECTED WORK。 */

/* 两个栏目用的不是同一个组件：
   - intern  → 静态卡片网格（没有可打开的成品，不做翻封面的交互）
   - projects → 横屏切屏轮播（2026-09-09 改版：从纵向 ProjectsScroll 换成
     横屏 ProjectsCarousel，左右箭头 + 右侧项目名锚点导航——
     与 INTERNSHIP 的卡片网格形成节奏差异，
     同时每屏一项目左视觉右文案全部平铺保留） */
const POS: Record<string, { l: number; t: number; w: number; h: number; rot: number }> = {
  intern:    { l: 30.0, t: 30.0, w: 32.0, h: 44.0, rot: -7 },
  projects:  { l: 64.0, t: 18.0, w: 24.0, h: 38.0, rot: 3 },
}

export default function WorkFolders() {
  const workView = useStore((s) => s.workView)
  const setWorkView = useStore((s) => s.setWorkView)

  if (workView === 'intern' || workView === 'projects') {
    return (
      <Suspense fallback={<div className="wv wv--loading" />}>
        {workView === 'intern' && <InternshipGrid items={INTERNSHIPS} head="INTERNSHIP" />}
        {workView === 'projects' && <ProjectsCarousel items={PROJECTS} head="PERSONAL PROJECTS" />}
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
