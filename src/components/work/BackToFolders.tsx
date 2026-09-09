import { useStore } from '../../store'
import { sweepBackToFolders } from './workTransition'

/**
 * 作品子页面左上角的返回入口。
 *
 * 返回策略分两种，要在盖满的瞬间从 store 读当前状态决定：
 *   1. workView !== null —— 在 SELECTED WORK 文件夹里看具体作品（intern / projects），
 *      返回只是退出当前 workView，让文件夹视图还留着
 *   2. workView === null —— 在独立 overlay 里（THINKING / MUSIC / VIDEO / PHOTOGRAPH
 *      等），没有 workView 这层，需要把整个 overlay 关闭才会回到主场景
 *
 * 旧的实现统一调 setWorkView(null)，对第 2 类 overlay 是 no-op，会卡死。
 */
export default function BackToFolders() {
  // 不在顶层解构 setWorkView/closeOverlay：在 sweep 盖满的瞬间读 store，
  // 才能看到点击时那一刻的最新状态（避免闭包陷阱）。
  return (
    <button
      type="button"
      className="wv__back"
      onClick={() => {
        sweepBackToFolders(() => {
          const st = useStore.getState()
          if (st.workView) st.setWorkView(null)
          else st.closeOverlay()
        })
      }}
    >
      <span>←</span> BACK
    </button>
  )
}
