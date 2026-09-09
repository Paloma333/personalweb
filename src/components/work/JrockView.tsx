/**
 * 「J-Rock 歌词研究」弹窗
 *
 * 同 GephiView：全屏 overlay → ViewerFrame 大弹窗。
 * JrockPanel 自带的 .jrk__bar（ECNU 卒論 meta + 全屏阅读按钮）保留，
 * 与弹窗顶部栏功能不同（一个是作品信息，一个是窗口控制），两条都留。
 */
import JrockPanel from './JrockPanel'
import ViewerFrame from './ViewerFrame'
import './viewerframe.css'

export default function JrockView() {
  return (
    <ViewerFrame title="J-Rock 歌詞における表現特徴の研究 · 60年の可視化">
      <JrockPanel />
    </ViewerFrame>
  )
}
