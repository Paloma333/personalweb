import { ABOUT } from '../../data/content'
import CloseButton from './CloseButton'
import './overlay.css'
import './about.css'

/** ABOUT —— 从挂绳上垂下的个人信息工牌 */
export default function AboutCard() {
  return (
    <div className="ov">
      <div className="idc">
        <div className="idc__lanyard" aria-hidden>
          <span className="idc__strap" />
          <svg className="idc__clip" viewBox="0 0 60 116" fill="none" aria-hidden>
            <path
              d="M18 4h24a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V10a6 6 0 0 1 6-6Z"
              stroke="#25262A"
              strokeWidth="4"
            />
            <path
              d="M30 30v34m0 0a19 19 0 1 0 0 38 19 19 0 0 0 0-38Z"
              stroke="#25262A"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <circle cx="30" cy="45" r="4.4" fill="#25262A" />
          </svg>
        </div>

        <article className="idc__card">
          <CloseButton />
          <div className="idc__frame">
            <div className="idc__head">
              <span className="idc__no">
                IDENTIFICATION CARD
                <br />
                {ABOUT.cardNo}
              </span>
            </div>

            <div className="idc__body">
              <div className="idc__photo">
                <img
                  className="idc__avatar"
                  src="/assets/portrait/id-avatar.png"
                  alt="刘雨姗 证件照"
                  draggable={false}
                />
              </div>

              <div className="idc__main">
                <header className="idc__titleRow">
                  <h2 className="idc__title">
                    {ABOUT.title.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </h2>
                </header>
                <span className="idc__titleCn">{ABOUT.titleCn}</span>
                <p className="idc__sub">{ABOUT.sub}</p>
                <span className="idc__rule" />

                <dl className="idc__fields">
                  {ABOUT.fields.map((f) => (
                    <div key={f.k} className="idc__field">
                      <dt>{f.k}</dt>
                      <dd>{f.v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

          </div>

          <div className="idc__lower">
            <svg className="idc__barcode" viewBox="0 0 240 44" aria-hidden>
              {BARS.map((w, i) => (
                <rect key={i} x={BAR_X[i]} y="0" width={w} height="44" fill="#1a1c20" />
              ))}
            </svg>
            <div className="idc__contact">
              <span className="idc__ck">EMAIL</span>
              <span className="idc__cv">{ABOUT.email}</span>
            </div>
            <div className="idc__contact idc__contact--mid">
              <span className="idc__ck">PHONE</span>
              <span className="idc__cv">{ABOUT.phone}</span>
            </div>
          </div>

          <footer className="idc__foot">
            <span>{ABOUT.footL}</span>
            <span>{ABOUT.footR}</span>
          </footer>
        </article>
      </div>
    </div>
  )
}

/* 条形码：固定序列，避免每次渲染跳动 */
const BARS = [
  3, 1, 2, 1, 4, 1, 2, 3, 1, 2, 1, 3, 2, 1, 4, 2, 1, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 1, 3, 2, 1, 4, 2,
  1, 3, 1, 2, 4, 1, 2,
]
const BAR_X = BARS.reduce<number[]>((acc, _w, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + BARS[i - 1] + 2)
  return acc
}, [])
