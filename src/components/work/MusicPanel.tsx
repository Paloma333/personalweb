/**
 * 「MUSIC」乐队手记面板
 *
 * 第一个 demo 是 demo 视频（暂占位），后续会接入：
 *   - demo：现场 / 排练录像
 *   - 收藏：按专辑 / 单曲组织的专辑墙
 *   - 演出地图：手工 SVG 演出轨迹
 *   - 随笔：4 年乐队的成长笔记
 *
 * 与 ThinkingPanel 共用同一套 .mp__head / .mp__tabs / .mp__body 骨架，
 * 后续要复用就提一个 .mp 共享命名空间，这里先把样式独立出来，
 * 后续结构稳定后再合并。
 */
import { useState } from 'react'
import BackToFolders from './BackToFolders'
import './music.css'

type TabKey = 'demo' | 'collection' | 'tour' | 'journal'

const TABS: Array<{ key: TabKey; cn: string; en: string; hint: string }> = [
  { key: 'demo',       cn: '现场 · demo',  en: 'DEMO',       hint: '排练 / 演出录像（暂占位）' },
  { key: 'collection', cn: '收藏 · 专辑',  en: 'COLLECTION', hint: '按 J-rock / 流派组织的专辑墙' },
  { key: 'tour',       cn: '演出 · 地图',  en: 'TOUR MAP',   hint: '手工 SVG 的演出轨迹' },
  { key: 'journal',    cn: '随笔 · 乐队',  en: 'JOURNAL',    hint: '4 年乐队成长笔记' },
]

export default function MusicPanel() {
  const [tab, setTab] = useState<TabKey>('demo')
  return (
    <div className="mp">
      <BackToFolders />
      <header className="mp__head">
        <span className="mp__eyebrow">BAND · GUITAR · VJ</span>
        <h2 className="mp__title">乐队手记</h2>
        <p className="mp__desc">4 年乐队经历：吉他 / 主唱 / VJ 视觉编程。从排练到 Live，从演出地图到专辑收藏。</p>
        <nav className="mp__tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              className={tab === t.key ? 'is-on' : ''}
              onClick={() => setTab(t.key)}>
              <span className="mp__tab-cn">{t.cn}</span>
              <span className="mp__tab-en">{t.en}</span>
            </button>
          ))}
        </nav>
      </header>
      <div className="mp__body">
        {TABS.map((t) => tab === t.key && (
          <section key={t.key} className="mp__pane" role="tabpanel">
            <div className="mp__placeholder">
              <span className="mp__placeholder-mark">♪</span>
              <h3>{t.cn}</h3>
              <p>{t.hint}</p>
              <p className="mp__placeholder-note">素材到位后接入（demo 视频 / 专辑封面 / 演出地图 SVG / 随笔 Markdown）。</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
