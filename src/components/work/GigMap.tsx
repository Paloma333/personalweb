/**
 * 演出地图（MY TIME › 个人爱好）
 *
 * 一张手绘感的示意图：城市节点按真实经纬度投影（上海 / 杭州 / 安吉 的相对
 * 方位是真的），同一城市里的多个场地改按「方位 + 固定半径」摆开 —— 上海那
 * 四个场地真坐标挤在 20px 内，直接画会互相压死。
 *
 * 刻意没有画行政边界和海岸线：一是这是示意图不是底图服务，二是少画就少错。
 * 图上只有经纬网、比例尺和指北针这类不依赖边界数据的元素。
 */
import {
  GIG_CITIES,
  GIG_MAP_BOX,
  GIG_MAP_RANGE,
  GIG_STATS,
  GIGS,
  type Gig,
} from '../../data/content'

/** 上海那圈场地 pin 距城市节点的半径（px）。只保证彼此不重叠 */
const RING_R = 52

const { x0, y0, w, h } = GIG_MAP_BOX
const [lon0, lon1] = GIG_MAP_RANGE.lon
const [lat0, lat1] = GIG_MAP_RANGE.lat

const px = (lon: number) => x0 + ((lon - lon0) / (lon1 - lon0)) * w
const py = (lat: number) => y0 + ((lat1 - lat) / (lat1 - lat0)) * h

/** 1px 代表多少公里（用纬度跨度算，纵向不受 cos 影响） */
const KM_PER_PX = ((lat1 - lat0) * 111.32) / h
/** 比例尺取 50km，图上约 105px */
const SCALE_KM = 50

/** 经纬网：只画整度和半度，纯装饰 + 给读者一个尺度感 */
const GRAT_LON = [120, 121]
const GRAT_LAT = [30.5, 31]

/** 场地 pin 的位置：有 bearing 就绕最近的城市节点摆，否则直接落在真坐标上 */
function pinAt(gig: Gig) {
  if (gig.bearing === undefined) return { x: px(gig.lon), y: py(gig.lat) }
  let home = GIG_CITIES[0]
  let best = Infinity
  for (const c of GIG_CITIES) {
    const d = (px(c.lon) - px(gig.lon)) ** 2 + (py(c.lat) - py(gig.lat)) ** 2
    if (d < best) {
      best = d
      home = c
    }
  }
  const rad = (gig.bearing * Math.PI) / 180
  return { x: px(home.lon) + RING_R * Math.cos(rad), y: py(home.lat) + RING_R * Math.sin(rad) }
}

const PINS = GIGS.map((g) => ({ gig: g, ...pinAt(g) }))
const CITY_PT = GIG_CITIES.map((c) => ({ city: c, x: px(c.lon), y: py(c.lat) }))

/** 巡演轨迹：上海 → 杭州 → 安吉 → 上海 */
const ROUTE = [0, 1, 2]
  .map((i) => CITY_PT[i])
  .map((p) => `${p.x},${p.y}`)
  .join(' ')

/** 标签底板的估宽：中日韩字符按 1 个字宽，其余按 0.55 */
function labelWidth(s: string, size: number) {
  let u = 0
  for (const ch of s) u += /[\u2e80-\u9fff\uff00-\uffef]/.test(ch) ? 1 : 0.55
  return u * size
}

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
      <defs>
        <pattern id="gm-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1.2" cy="1.2" r="1.2" fill="rgba(200,243,34,0.09)" />
        </pattern>
      </defs>

      {/* 底纹 */}
      <rect x={x0 - 24} y={y0 - 20} width={w + 48} height={h + 44} fill="url(#gm-dots)" rx="10" />

      {/* 经纬网 */}
      <g className="gm__grat">
        {GRAT_LON.map((lon) => (
          <g key={`lon${lon}`}>
            <line x1={px(lon)} y1={y0 - 20} x2={px(lon)} y2={y0 + h + 24} />
            <text x={px(lon)} y={y0 + h + 40}>{lon}°E</text>
          </g>
        ))}
        {GRAT_LAT.map((lat) => (
          <g key={`lat${lat}`}>
            <line x1={x0 - 24} y1={py(lat)} x2={x0 + w + 24} y2={py(lat)} />
            <text x={x0 - 24} y={py(lat) - 6}>{lat}°N</text>
          </g>
        ))}
      </g>

      {/* 巡演轨迹 */}
      <polygon className="gm__route" points={ROUTE} />

      {/* 城市节点 + 名字 */}
      <g className="gm__cities">
        {CITY_PT.map(({ city, x, y }) => (
          <g key={city.cn}>
            <circle className="gm__city" cx={x} cy={y} r="4.5" />
            <text
              className="gm__city-cn"
              x={x + city.dx}
              y={y + city.dy}
              textAnchor={city.anchor}
            >
              {city.cn}
            </text>
            <text
              className="gm__city-en"
              x={x + city.dx}
              y={y + city.dy + 12}
              textAnchor={city.anchor}
            >
              {city.en}
            </text>
          </g>
        ))}
      </g>

      {/* 上海那圈：城市节点到各 pin 的辐条 */}
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

      {/* 场地 pin */}
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
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onPick(gig.no)
                }
              }}
              onMouseEnter={() => onHover(gig.no)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(gig.no)}
              onBlur={() => onHover(null)}
            >
              <circle className="gm__pin-halo" r="20" />
              <circle className="gm__pin-dot" r="13" />
              <text className="gm__pin-no" y="4">{gig.no}</text>
            </g>
          )
        })}
      </g>

      {/* 当前 pin 的名字（hover / 选中才出现，避免 6 个标签互相压） */}
      {shownPin && (
        <g className="gm__tag" transform={`translate(${shownPin.x} ${shownPin.y})`}>
          {(() => {
            const size = 13
            const tw = labelWidth(shownPin.gig.venue, size)
            const bw = tw + 20
            const up = shownPin.y > 130
            const bx = Math.max(x0 - 24, Math.min(x0 + w + 24 - bw, -bw / 2))
            const by = up ? -34 : 22
            return (
              <>
                <rect x={bx} y={by} width={bw} height="24" rx="12" />
                <text x={bx + bw / 2} y={by + 16}>{shownPin.gig.venue}</text>
              </>
            )
          })()}
        </g>
      )}

      {/* 比例尺 */}
      <g className="gm__scale" transform={`translate(${x0 + 4} ${y0 + h + 6})`}>
        <line x1="0" y1="0" x2={SCALE_KM / KM_PER_PX} y2="0" />
        <line x1="0" y1="-4" x2="0" y2="4" />
        <line x1={SCALE_KM / KM_PER_PX} y1="-4" x2={SCALE_KM / KM_PER_PX} y2="4" />
        <text x={SCALE_KM / KM_PER_PX + 8} y="4">50 km</text>
      </g>

      {/* 指北针 */}
      <g className="gm__compass" transform={`translate(${x0 + w + 6} ${y0 - 8})`}>
        <line x1="0" y1="10" x2="0" y2="-10" />
        <polygon points="0,-14 -4,-6 4,-6" />
        <text y="24">N</text>
      </g>

      {/* 场次总数 */}
      <g className="gm__total" transform={`translate(${x0 - 24} ${y0 - 22})`}>
        <text className="gm__total-k">{GIG_STATS[0].k}</text>
        <text className="gm__total-v" x="62">SHOWS</text>
      </g>
    </svg>
  )
}
