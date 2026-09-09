/**
 * 「Gephi 可视化」弹窗
 *
 * 原来是全屏 overlay（.wv.vizview + BackToFolders），但深色面板上
 * 深色 BACK 按钮完全隐身。2026-09-08 改成 ViewerFrame 大弹窗：
 * 顶部栏 × + 点遮罩 + Escape 三条回路，关闭回到 PROJECTS 陈列页。
 */
import GephiPanel from './GephiPanel'
import ViewerFrame from './ViewerFrame'
import './viewerframe.css'

export default function GephiView() {
  return (
    <ViewerFrame title="《东方快车谋杀案》社会网络分析 · GEPHI">
      <GephiPanel />
    </ViewerFrame>
  )
}
