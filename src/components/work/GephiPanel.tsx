/**
 * 《东方快车谋杀案》社会网络可视化主面板 — 黑底悬疑版
 *
 * 数据：
 *   20 节点（角色） + 190 完全图边（public/gephi/）+ story.json（5 段分析）
 *
 * 视图层：
 *   truth       —— 波洛侦探视角的关系（蓝色细线）
 *   conspiracy  —— 12 嫌疑人分刀 / 阴谋关系（红色粗线）
 *   complete    —— 全部 190 边（淡灰低透明度）
 *
 * 故事线联动：
 *   5 段分析（来自用户笔记）通过 highlight 字段指定要凸显的节点；
 *   选中分析段时自动切到对应 layer，并对 highlight 节点放大 + 描边。
 *
 * 文学注解散布 4 处：
 *   1. 顶部 intro：基础信息 + 方法论（折叠）
 *   2. 右侧 sidebar：5 段分析手记 + Agatha 原文金句
 *   3. 节点 hover / click：中文名 + 角色 + 注解 + modal 详情
 *   4. 侧栏底部：12 嫌疑人 ★ 评级
 */
import { useEffect, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  Handle,
  Position,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import './gephi.css'

type Layer = 'truth' | 'conspiracy' | 'complete'
type Role = 'detective' | 'victim' | 'suspect' | 'other'

type NodeData = {
  cn: string
  role: Role
  knife: number | null
  note: string
  dim?: boolean   // 故事线未命中时变暗
  hot?: boolean   // 故事线命中时变亮 + 描边
}
type EdgeData = {
  weight: number
  layer: 'truth' | 'conspiracy'
}

// ── 颜色：角色分组（黑底悬疑配色）────────────────────
const ROLE_BG: Record<Role, string> = {
  detective: '#3b4ed8',  // 波洛：冷蓝
  victim:    '#7d2424',  // 受害者：暗酒红
  suspect:   '#c83434',  // 嫌疑人：血红
  other:     '#9a8e80',  // 其他：米灰
}
const ROLE_FG: Record<Role, string> = {
  detective: '#fbfaf6', victim: '#fbfaf6', suspect: '#fbfaf6', other: '#1a1410',
}

/* ── 自定义节点 ─────────────────────────────────── */
function RfNode(props: any) {
  const data = (props.data ?? {}) as NodeData
  const bg = ROLE_BG[data.role]
  const fg = ROLE_FG[data.role]
  const size = data.role === 'detective' ? 64
              : data.role === 'victim' ? 60
              : data.role === 'suspect' ? 54
              : 46
  return (
    <div
      className={`gpn${data.hot ? ' gpn--hot' : ''}${data.dim ? ' gpn--dim' : ''}`}
      style={{ width: size, height: size }}
    >
      <Handle type="target" position={Position.Top} className="gpn-handle" />
      <div className="gpn__dot" style={{ background: bg, color: fg, width: size, height: size }}>
        <span className="gpn__role" aria-hidden>
          {data.role === 'detective' ? 'P' : data.role === 'victim' ? 'X' : data.role === 'suspect' ? '!' : '·'}
        </span>
        {data.knife != null && <span className="gpn__knife" aria-hidden>{data.knife}</span>}
      </div>
      <div className="gpn__cn">{data.cn}</div>
      <Handle type="source" position={Position.Bottom} className="gpn-handle" />
    </div>
  )
}
const nodeTypes = { role: RfNode }

/* ── 数据 fetch ────────────────────────────────── */
async function loadGephi() {
  const [metaRes, edgesRes, storyRes] = await Promise.all([
    fetch('/gephi/data.json'),
    fetch('/gephi/edges.json'),
    fetch('/gephi/story.json'),
  ])
  const metaRaw = await metaRes.json()
  const edgesRaw = await edgesRes.json()
  const story = await storyRes.json()
  return {
    // data.json 把描述信息包在 meta 里，节点/金句在顶层；这里展平，
    // 让组件统一用 meta.title / meta.nodes / meta.quotes 访问
    meta: { ...metaRaw.meta, nodes: metaRaw.nodes, quotes: metaRaw.quotes },
    edges: edgesRaw.edges as Array<{ id: string; source: string; target: string; weight: number; layer: string }>,
    story,
  }
}

/* ── 圆形布局 ──────────────────────────────────── */
function ringLayout(ids: string[], centerX = 0, centerY = 0, radius = 320) {
  const out: Record<string, { x: number; y: number }> = {}
  const N = ids.length
  const order = ids.filter((id) => id !== 'poirot')
  order.forEach((id, k) => {
    const ang = ((k / (N - 1)) * Math.PI * 2) - Math.PI / 2
    out[id] = {
      x: centerX + Math.cos(ang) * radius,
      y: centerY + Math.sin(ang) * radius,
    }
  })
  out['poirot'] = { x: centerX, y: centerY }
  return out
}

/* ── 主组件 ────────────────────────────────────── */
export default function GephiPanel() {
  const [meta, setMeta] = useState<any | null>(null)
  const [allEdges, setAllEdges] = useState<any[]>([])
  const [story, setStory] = useState<any | null>(null)
  const [layer, setLayer] = useState<Layer>('truth')
  const [activeChapter, setActiveChapter] = useState<string | null>('armstrong')
  const [selected, setSelected] = useState<any | null>(null)
  const [introOpen, setIntroOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    loadGephi().then((d) => {
      if (!mounted) return
      setMeta(d.meta)
      setAllEdges(d.edges)
      setStory(d.story)
    })
    return () => { mounted = false }
  }, [])

  // 当前故事段的 highlight 节点 id 集合
  const highlightIds = useMemo(() => {
    if (!story || !activeChapter) return null
    const ch = story.analysis.find((a: any) => a.id === activeChapter)
    return ch?.highlight ?? null
  }, [story, activeChapter])

  // 切换故事段时自动切到对应的 layer
  const pickChapter = (id: string) => {
    setActiveChapter(id)
    if (!story) return
    const ch = story.analysis.find((a: any) => a.id === id)
    if (ch?.layer && (ch.layer === 'truth' || ch.layer === 'conspiracy' || ch.layer === 'complete')) {
      setLayer(ch.layer)
    }
  }

  const nodes: Node<NodeData>[] = useMemo(() => {
    if (!meta) return []
    const positions = ringLayout(meta.nodes.map((n: any) => n.id))
    return meta.nodes.map((n: any) => {
      const isHot = highlightIds !== null && highlightIds.includes(n.id)
      const isDim = highlightIds !== null && !highlightIds.includes(n.id)
      return {
        id: n.id,
        type: 'role',
        position: positions[n.id],
        data: {
          cn: n.cn,
          role: n.role,
          knife: n.knife,
          note: n.note,
          hot: isHot || undefined,
          dim: isDim || undefined,
        },
      }
    })
  }, [meta, highlightIds])

  const edges: Edge<EdgeData>[] = useMemo(() => {
    if (!meta) return []
    const data = layer === 'complete' ? allEdges : allEdges.filter((e) => e.layer === layer)
    return data.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      data: { weight: e.weight, layer: e.layer },
      style: {
        stroke: e.layer === 'conspiracy' ? '#c83434' : '#5a6a8a',
        strokeWidth: Math.max(0.4, e.weight * 1.2),
        strokeOpacity: layer === 'complete' ? 0.18 : 0.6,
      },
      animated: layer === 'complete' ? false : e.layer === 'conspiracy',
    }))
  }, [meta, allEdges, layer])

  if (!meta || !story) return <div className="gph__loading">读取列车数据库…</div>

  const activeCh = activeChapter ? story.analysis.find((a: any) => a.id === activeChapter) : null

  return (
    <ReactFlowProvider>
      <div className="gph">
        {/* ── 左侧：图 ─────────────────────────────── */}
        <div className="gph__stage">
          <div className="gph__topbar">
            <span className="gph__eyebrow">SOCIAL NETWORK · 20 NODES · {layer === 'complete' ? 190 : allEdges.filter((e) => e.layer === layer).length} EDGES</span>
            <h2 className="gph__title">{meta.title}</h2>
            <p className="gph__subtitle">{meta.subtitle}</p>

            <div className="gph__toggle" role="tablist" aria-label="数据层">
              <button role="tab" aria-selected={layer === 'truth'}
                className={layer === 'truth' ? 'is-on' : ''}
                onClick={() => setLayer('truth')}>
                ① 侦探视角
                <small>{allEdges.filter((e) => e.layer === 'truth').length} edges</small>
              </button>
              <button role="tab" aria-selected={layer === 'conspiracy'}
                className={layer === 'conspiracy' ? 'is-on' : ''}
                onClick={() => setLayer('conspiracy')}>
                ② 12 刀阴谋
                <small>{allEdges.filter((e) => e.layer === 'conspiracy').length} edges</small>
              </button>
              <button role="tab" aria-selected={layer === 'complete'}
                className={layer === 'complete' ? 'is-on' : ''}
                onClick={() => setLayer('complete')}>
                ③ 完全图
                <small>190 edges</small>
              </button>
            </div>

            <details className="gph__intro" open={introOpen} onToggle={(e) => setIntroOpen((e.target as HTMLDetailsElement).open)}>
              <summary>基础信息 · 方法论</summary>
              <div className="gph__intro-body">
                <p className="gph__case"><b>案件：</b>{story.case.intro} {story.case.main} {story.case.mystery}</p>
                <p className="gph__meth"><b>读图：</b>节点 = 角色（{story.methodology.node}）；边 = {story.methodology.edge}；粗细 = {story.methodology.weight}。</p>
                <p className="gph__layout"><b>布局：</b>{story.methodology.layout}。</p>
                <ul className="gph__layers">
                  <li><span className="gph__layer-dot" style={{ background: '#5a6a8a' }} />{story.methodology.layers.truth}</li>
                  <li><span className="gph__layer-dot" style={{ background: '#c83434' }} />{story.methodology.layers.conspiracy}</li>
                  <li><span className="gph__layer-dot" style={{ background: '#888' }} />{story.methodology.layers.complete}</li>
                </ul>
              </div>
            </details>
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.18 }}
            minZoom={0.4}
            maxZoom={1.6}
            onNodeClick={(_, n) => setSelected(n.data)}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={32} color="#1f1a26" />
            <Controls showInteractive={false} />
          </ReactFlow>

          {/* ── 故事线联动条 ───────────────────────── */}
          <div className="gph__chapters" role="tablist" aria-label="分析章节">
            {story.analysis.map((ch: any) => (
              <button key={ch.id}
                role="tab"
                aria-selected={activeChapter === ch.id}
                className={`gph__chapter${activeChapter === ch.id ? ' is-on' : ''}`}
                onClick={() => pickChapter(ch.id)}>
                <span className="gph__chapter-no">{ch.title.split('、')[0]}</span>
                <span className="gph__chapter-cn">{ch.title.split('、')[1]}</span>
              </button>
            ))}
            <button className={`gph__chapter${activeChapter === null ? ' is-on' : ''}`}
              onClick={() => setActiveChapter(null)}>
              <span className="gph__chapter-no">·</span>
              <span className="gph__chapter-cn">清空高亮</span>
            </button>
          </div>
        </div>

        {/* ── 右侧：故事线 + 注解 sidebar ──────────── */}
        <aside className="gph__sidebar">
          <h3 className="gph__aside-title">分析手记</h3>
          <p className="gph__aside-meta">点击章节自动切层；点击节点查看注解。</p>

          {activeCh ? (
            <article className="gph__chapter-read">
              <h4>{activeCh.title}</h4>
              <p>{activeCh.body}</p>
            </article>
          ) : (
            <p className="gph__aside-hint">从下方章节条选一段，或直接看节点关系。</p>
          )}

          <h4 className="gph__aside-h4">Agatha · 原著金句</h4>
          <div className="gph__quotes">
            {meta.quotes.map((q: any, i: number) => (
              <blockquote key={i} className="gph__quote">
                <p>"{q.text}"</p>
                <footer>— {q.src}</footer>
              </blockquote>
            ))}
          </div>

          <h4 className="gph__aside-h4">嫌疑人 ★ 评级（波洛视角）</h4>
          <div className="gph__grid">
            {meta.nodes.filter((n: any) => n.role === 'suspect').map((n: any) => (
              <button key={n.id}
                className={`gph__cell${selected?.cn === n.cn ? ' is-on' : ''}`}
                onClick={() => setSelected({ cn: n.cn, role: n.role, knife: n.knife, note: n.note })}
              >
                <span className="gph__cell-num">{n.knife}</span>
                <span className="gph__cell-cn">{n.cn}</span>
                <span className="gph__cell-stars">★</span>
              </button>
            ))}
          </div>
        </aside>

        {/* ── 详情 modal ───────────────────────────── */}
        {selected && (
          <div className="gph__modal" role="dialog" aria-modal="true"
               onClick={() => setSelected(null)}>
            <div className="gph__panel" onClick={(e) => e.stopPropagation()}>
              <button className="gph__close" onClick={() => setSelected(null)} aria-label="关闭">×</button>
              <div className="gph__panel-tag" style={{
                background: ROLE_BG[selected.role as Role],
                color: ROLE_FG[selected.role as Role],
              }}>
                {selected.role === 'detective' ? 'DETECTIVE' :
                 selected.role === 'victim' ? 'VICTIM' :
                 selected.role === 'suspect' ? `SUSPECT · KNIFE ${selected.knife}` : 'OTHER'}
              </div>
              <h3 className="gph__panel-cn">{selected.cn}</h3>
              <p className="gph__panel-note">{selected.note}</p>
              {selected.role === 'suspect' && (
                <div className="gph__panel-foot">
                  <span>★ 「此人也认为雷切尔应受惩罚。」（波洛，第 13 章）</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ReactFlowProvider>
  )
}
