import type { ReactNode } from 'react'
import { useStore } from '../../store'

/**
 * 「站内可视化查看器」的统一弹窗框架（gephi / jrock 共用）。
 *
 * 为什么从全屏 overlay 改成大弹窗：
 *   全屏 overlay 的 BACK 按钮是深色字（.wv__back 用 var(--ink)），
 *   而 gephi / jrock 两个面板自身就是深色背景，按钮直接隐身 ——
 *   用户打开后「没有回去的地方」。
 *
 * 弹窗形态的好处：
 *   1. 关闭入口明显：顶部栏 × 按钮 + 点遮罩 + Escape，三条路都通
 *   2. 视觉上它「浮」在 PROJECTS 页之上，关掉回到 PROJECTS 符合心智
 *   3. 深色面板被包在带圆角的弹窗里，和浅色站点有了边界
 *
 * 关闭行为：回到 SELECTED WORK 的 projects 视图（不是主场景）。
 *   openOverlay('work') 会把 workView 重置为 null（见 store.send），
 *   所以紧接着 setWorkView('projects') 补回项目陈列页。
 */
type Props = {
  title: string
  children: ReactNode
}

export function closeViewerToProjects() {
  const st = useStore.getState()
  st.openOverlay('work')
  st.setWorkView('projects')
}

export default function ViewerFrame({ title, children }: Props) {
  return (
    <div className="vf" onClick={closeViewerToProjects}>
      <div
        className="vf__dialog"
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="vf__bar">
          <span className="vf__title">{title}</span>
          <button type="button" className="vf__close" onClick={closeViewerToProjects}>
            ✕ 关闭
          </button>
        </div>
        <div className="vf__body">{children}</div>
      </div>
    </div>
  )
}
