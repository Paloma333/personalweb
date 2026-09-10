/**
 * 「MY TIME」个人爱好面板
 *
 * 2026-09-09 重做：原来 4 个栏目（现场 demo / 专辑收藏 / 演出地图 / 随笔）
 * 全是占位，现在先把演出地图做实 —— 6 个场地 + 20 多场，其余栏目等素材到位再加。
 * 所以这里没有 tab 栏，整屏就是地图 + 海报夹。
 *
 * 骨架（.mp__head / .mp__body）沿用 ThinkingPanel 那套，样式在 music.css。
 */
import { useState } from 'react'
import { GIGS, GIG_STATS, MYTIME_HEAD } from '../../data/content'
import BackToFolders from './BackToFolders'
import GigMap from './GigMap'
import { SIZES, workImage } from './imageSources'
import './music.css'

export default function MusicPanel() {
  const [no, setNo] = useState(GIGS[0].no)
  const [hover, setHover] = useState<string | null>(null)
  const gig = GIGS.find((g) => g.no === no) ?? GIGS[0]
  const img = gig.poster ? workImage('gig', gig.poster) : null

  return (
    <div className="mp">
      <BackToFolders />
      <header className="mp__head">
        <span className="mp__eyebrow">{MYTIME_HEAD.kicker}</span>
        <h2 className="mp__title">
          {MYTIME_HEAD.cn}
          <span className="mp__title-en">{MYTIME_HEAD.en}</span>
        </h2>
        <p className="mp__desc">{MYTIME_HEAD.desc}</p>
        <ul className="mp__stats">
          {GIG_STATS.map((s) => (
            <li key={s.v}>
              <span className="mp__stat-k">{s.k}</span>
              <span className="mp__stat-v">{s.v}</span>
            </li>
          ))}
        </ul>
      </header>

      <div className="mp__body">
        <section className="mp__map">
          <div className="mp__map-head">
            <span className="mp__map-cn">演出地图</span>
            <span className="mp__map-en">TOUR MAP</span>
            <span className="mp__map-note">城市按真实方位，同城场地环形示意排布</span>
          </div>
          <div className="mp__map-card">
            <GigMap active={no} hover={hover} onPick={setNo} onHover={setHover} />
          </div>
          <ul className="mp__chips">
            {GIGS.map((g) => (
              <li key={g.no}>
                <button
                  className={g.no === no ? 'is-on' : ''}
                  onClick={() => setNo(g.no)}
                  onMouseEnter={() => setHover(g.no)}
                  onMouseLeave={() => setHover(null)}
                >
                  <span className="mp__chip-no">{g.no}</span>
                  <span className="mp__chip-name">{g.venue}</span>
                  <span className="mp__chip-area">{g.area}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <aside className="mp__poster">
          <div className="mp__pframe">
            {img ? (
              <img
                src={img.src}
                srcSet={img.srcSet}
                sizes={SIZES.gig}
                alt={`${gig.venue} 演出海报`}
                width="1000"
                height="1778"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="mp__ptba">
                <span className="mp__ptba-mark">♪</span>
                <strong>海报待补</strong>
                <span className="mp__ptba-en">POSTER TBA</span>
              </div>
            )}
          </div>
          <div className="mp__pmeta">
            <span className="mp__pmeta-no">{gig.no}</span>
            <h3>{gig.venue}</h3>
            <p className="mp__pmeta-en">{gig.en}</p>
            <p className="mp__pmeta-area">{gig.area}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
