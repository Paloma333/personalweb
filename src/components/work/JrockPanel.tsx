/**
 * 「J-ROCK」タブ —— 卒業論文の可視化
 *
 * 内容是一份独立的长篇滚动叙事页面（hero + 5 章 + 11 个 echarts 图表），
 * 放在 public/jrock/ 下作为静态资源，这里用 iframe 嵌入。
 *
 * 为什么不移植成 React 组件：
 *   - 页面有 1023 行自定义 CSS + 593 行 echarts 配置，移植成本高且极易破坏已调好的视觉
 *   - 它是纵向滚动叙事，本来就需要整页空间，iframe 内部滚动比塞进固定高度面板更自然
 *   - 依赖已精简：tailwind / gsap 两个 CDN 是僵尸依赖（零调用）已移除，只剩本地 echarts
 *
 * iframe 方案的两个细节：
 *   1. allowFullScreen —— 长页面在面板高度里看不全，提供全屏入口
 *   2. loading 态 —— echarts.min.js 有 1MB，首帧会白屏一小会儿
 */
import { useRef, useState } from 'react'
import './jrock.css'

export default function JrockPanel() {
  const [loaded, setLoaded] = useState(false)
  const frameRef = useRef<HTMLIFrameElement>(null)

  const openFullscreen = () => {
    const el = frameRef.current
    if (!el) return
    if (el.requestFullscreen) el.requestFullscreen()
    // Safari 前缀
    else if ((el as unknown as { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
      ;(el as unknown as { webkitRequestFullscreen: () => void }).webkitRequestFullscreen()
    }
  }

  return (
    <section className="jrk">
      <div className="jrk__bar">
        <div className="jrk__meta">
          <span className="jrk__dot" />
          <span className="jrk__badge">ECNU · 日本語学科 · 卒業論文</span>
          <span className="jrk__stat">1965–2025 · 60 年 · 11 图</span>
        </div>
        <button className="jrk__fs" onClick={openFullscreen} title="全屏阅读（长篇滚动叙事，全屏体验更佳）">
          <span className="jrk__fs-icon" aria-hidden>⤢</span>
          全屏阅读
        </button>
      </div>

      <div className="jrk__frame">
        {!loaded && <div className="jrk__loading">正在渲染 60 年歌词数据…</div>}
        <iframe
          ref={frameRef}
          className="jrk__iframe"
          src="/jrock/index.html"
          title="J-Rock 歌詞における表現特徴の研究｜60年の可視化"
          loading="lazy"
          allowFullScreen
          onLoad={() => setLoaded(true)}
        />
      </div>
    </section>
  )
}
