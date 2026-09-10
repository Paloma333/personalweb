/**
 * 演出地图（MY TIME › 个人爱好）· 第五轮：AI 插画贴纸版
 *
 * 用户明确要求：不要手画 SVG 矢量图，直接用 AI 生成的插画抠图。
 * 贴纸从用户的 AI 参考图里抠出（scripts/extract-gig-stickers.py），
 * 存在 public/assets/gig-stickers/*.png，这里用 <image> 引入。
 *
 * SVG 只保留：城市标签、pin、虚线轨迹、比例尺、20+ 印章（这些是 UI 不是插画）。
 * 插画全部换成贴纸 PNG。
 */
import { GIG_CITIES, GIG_MAP_BOX, GIG_MAP_RANGE, GIG_STATS, GIGS, type Gig } from '../../data/content'

const RING_R = 52
const { x0, y0, w, h } = GIG_MAP_BOX
const [lon0, lon1] = GIG_MAP_RANGE.lon
const [lat0, lat1] = GIG_MAP_RANGE.lat
const px = (lon: number) => x0 + ((lon - lon0) / (lon1 - lon0)) * w
const py = (lat: number) => y0 + ((lat1 - lat) / (lat1 - lat0)) * h
const KM_PER_PX = ((lat1 - lat0) * 111.32) / h
const SCALE_KM = 50

const STICKER = (name: string) => `/assets/gig-stickers/${name}.png`

function pinAt(gig: Gig) {
  let home = GIG_CITIES[0]
  let best = Infinity
  for (const c of GIG_CITIES) {
    const d = (px(c.lon) - px(gig.lon)) ** 2 + (py(c.lat) - py(gig.lat)) ** 2
    if (d < best) { best = d; home = c }
  }
  if (gig.bearing === undefined) return { x: px(gig.lon), y: py(gig.lat) }
  const rad = (gig.bearing * Math.PI) / 180
  return { x: px(home.lon) + RING_R * Math.cos(rad), y: py(home.lat) + RING_R * Math.sin(rad) }
}

const PINS = GIGS.map((g) => ({ gig: g, ...pinAt(g) }))
const CITY_PT = GIG_CITIES.map((c) => ({ city: c, x: px(c.lon), y: py(c.lat) }))

/** 城市之间的平滑曲线 */
function arcPath(p1: {x:number;y:number}, p2: {x:number;y:number}, bow = 14) {
  const mx = (p1.x + p2.x) / 2
  const my = (p1.y + p2.y) / 2
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len * bow
  const ny = dx / len * bow
  return `M ${p1.x},${p1.y} Q ${mx + nx},${my + ny} ${p2.x},${p2.y}`
}

function tagWidth(s: string, size: number) {
  let u = 0
  for (const ch of s) u += /[\u3000-\u9fff\uff00-\uffef]/.test(ch) ? 1 : 0.55
  return u * size + 20
}

/** 贴纸 <image> 的快捷 wrapper：cx/cy 是中心点，w 是目标宽（高按比例） */
function Sticker({ src, cx, cy, w, ratio, tilt = 0, opacity = 1 }: {
  src: string; cx: number; cy: number; w: number; ratio: number; tilt?: number; opacity?: number
}) {
  const h = w * ratio
  return (
    <image
      href={src}
      x={cx - w / 2}
      y={cy - h / 2}
      width={w}
      height={h}
      transform={tilt ? `rotate(${tilt} ${cx} ${cy})` : undefined}
      opacity={opacity}
      preserveAspectRatio="xMidYMid meet"
    />
  )
}

/* 贴纸宽高比（w / h，从源文件实测）。装饰贴纸已删，只留 6 个场地建筑 */
const AR = {
  univClassic: 1.957, // 古典柱廊楼（华东师大）
  gate: 1.685,        // 中式门楼（交大）
  cafeYellow: 1.587,  // 两层黄楼（边角料）
  modern: 1.189,      // 现代高楼（Sandbar / Cream）
  barn: 1.573,        // 橙顶仓房（麓）
} as const

type Props = {
  active: string
  hover: string | null
  onPick: (no: string) => void
  onHover: (no: string | null) => void
}

export default function GigMap({ active, hover, onPick, onHover }: Props) {
  const shown = hover ?? active
  const shownPin = PINS.find((p) => p.gig.no === shown)

  return (
    <svg className="gigmap" viewBox="0 0 660 470" role="group" aria-label="演出地图：上海、杭州、安吉 6 个场地">
      {/* ═══════════ 经纬网 ═══════════ */}
      <g className="gm__grat">
        {[120.0, 121.0].map((lon) => (
          <line key={`lon${lon}`} x1={px(lon)} y1={y0} x2={px(lon)} y2={y0 + h} />
        ))}
        {[30.5, 31.0].map((lat) => (
          <line key={`lat${lat}`} x1={x0} y1={py(lat)} x2={x0 + w} y2={py(lat)} />
        ))}
      </g>

      {/* ═══════════ 巡演轨迹：平滑虚线曲线 ═══════════ */}
      <g className="gm__route">
        <path d={arcPath(CITY_PT[0], CITY_PT[1], 18)} />
        <path d={arcPath(CITY_PT[1], CITY_PT[2], 18)} />
        <path d={arcPath(CITY_PT[2], CITY_PT[0], 18)} />
      </g>

      {/* ═══════════ 场地贴纸（每个 pin 旁一座建筑） ═══════════ */}
      {/* ECNU (01)：古典柱廊楼，pin (457,112) 左上方 */}
      <Sticker src={STICKER('cx0472-cy0359')} cx={405} cy={95} w={72} ratio={AR.univClassic} tilt={-2} />
      {/* SJTU (02)：中式门楼，pin (478,179) 下方 */}
      <Sticker src={STICKER('cx1651-cy0512')} cx={480} cy={228} w={62} ratio={AR.gate} tilt={2} />
      {/* 边角料 (03)：两层黄楼，pin (267,312) 上方 */}
      <Sticker src={STICKER('cx1334-cy0610')} cx={218} cy={262} w={58} ratio={AR.cafeYellow} tilt={-3} />
      {/* Sandbar (04)：现代高楼，pin (455,152) 左侧 */}
      <Sticker src={STICKER('cx0501-cy0729')} cx={400} cy={160} w={42} ratio={AR.modern} tilt={3} />
      {/* 麓 Livehouse (05)：橙顶仓房，pin (109,311) 左下 */}
      <Sticker src={STICKER('cx1116-cy0825')} cx={58} cy={360} w={58} ratio={AR.barn} tilt={-2} />
      {/* Cream Club (06)：现代高楼（复用），pin (551,156) 右下 */}
      <Sticker src={STICKER('cx0501-cy0729')} cx={585} cy={200} w={38} ratio={AR.modern} tilt={-4} opacity={0.92} />

      {/* ═══════════ 音符点缀 ═══════════ */}
      <text x={(CITY_PT[0].x + CITY_PT[1].x) / 2 + 22} y={(CITY_PT[0].y + CITY_PT[1].y) / 2 - 4} className="gm__note">♫</text>
      <text x={(CITY_PT[1].x + CITY_PT[2].x) / 2 - 24} y={(CITY_PT[1].y + CITY_PT[2].y) / 2 - 2} className="gm__note">♪</text>

      {/* ═══════════ 城市标签 ═══════════ */}
      <g className="gm__cities">
        {CITY_PT.map(({ city, x, y }, idx) => {
          const tilt = [-2.5, 2, -2][idx]
          const tw = tagWidth(city.cn, 13)
          return (
            <g key={city.cn} transform={`translate(${x + city.dx} ${y + city.dy}) rotate(${tilt})`}>
              <rect className="gm__city-tag" x={-tw / 2} y={-14} width={tw} height={28} rx={4} />
              <text className="gm__city-cn" x={0} y={5}>{city.cn}</text>
            </g>
          )
        })}
      </g>

      {/* ═══════════ 上海那圈虚辐条 ═══════════ */}
      <g className="gm__spokes">
        {PINS.filter((p) => p.gig.bearing !== undefined).map((p) => {
          const home = CITY_PT.reduce((a, b) => {
            const da = (a.x - p.x) ** 2 + (a.y - p.y) ** 2
            const db = (b.x - p.x) ** 2 + (b.y - p.y) ** 2
            return da < db ? a : b
          })
          return <line key={p.gig.no} x1={home.x} y1={home.y} x2={p.x} y2={p.y} />
        })}
      </g>

      {/* ═══════════ pin ═══════════ */}
      <g className="gm__pins">
        {PINS.map(({ gig, x, y }) => {
          const on = gig.no === shown
          return (
            <g
              key={gig.no}
              className={`gm__pin${on ? ' is-on' : ''}`}
              transform={`translate(${x} ${y})`}
              role="button"
              tabIndex={0}
              aria-label={`${gig.no} ${gig.venue} · ${gig.area}`}
              aria-pressed={gig.no === active}
              onClick={() => onPick(gig.no)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(gig.no) }
              }}
              onMouseEnter={() => onHover(gig.no)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(gig.no)}
              onBlur={() => onHover(null)}
            >
              <circle className="gm__pin-outer" r="16" />
              <circle className="gm__pin-dot" r="12" />
              <text className="gm__pin-no" y="4">{gig.no}</text>
            </g>
          )
        })}
      </g>

      {/* ═══════════ 当前 pin 名字浮标 ═══════════ */}
      {shownPin && (() => {
        const tw = tagWidth(shownPin.gig.venue, 12)
        const bw = tw + 4
        const up = shownPin.y > 130
        const bx = -bw / 2
        const by = up ? -36 : 20
        return (
          <g className="gm__tag" transform={`translate(${shownPin.x} ${shownPin.y})`}>
            <rect x={bx} y={by} width={bw} height="26" rx="4" />
            <text x={bx + bw / 2} y={by + 17}>{shownPin.gig.venue}</text>
          </g>
        )
      })()}

      {/* ═══════════ 比例尺 + 20+ 印章 ═══════════ */}
      <g className="gm__scale" transform={`translate(${x0 + w - SCALE_KM / KM_PER_PX - 30} ${y0 + h - 12})`}>
        <line x1="0" y1="0" x2={SCALE_KM / KM_PER_PX} y2="0" />
        <line x1="0" y1="-3" x2="0" y2="3" />
        <line x1={SCALE_KM / KM_PER_PX} y1="-3" x2={SCALE_KM / KM_PER_PX} y2="3" />
        <text x={SCALE_KM / KM_PER_PX + 6} y="3">50 km</text>
      </g>
      <g className="gm__stamp" transform={`translate(${x0 - 6} ${y0 - 6})`}>
        <circle r="24" />
        <circle r="20" fill="none" stroke="#fbf2dd" strokeWidth="0.8" strokeDasharray="2 2.5" />
        <text className="gm__stamp-k" y="0">{GIG_STATS[0].k}</text>
        <text className="gm__stamp-v" y="12">SHOWS</text>
      </g>
    </svg>
  )
}