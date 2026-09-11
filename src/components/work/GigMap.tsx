/**
 * 演出地图（MY TIME › 个人爱好）· 真实底图版
 *
 * 底图 = 用户提供的长三角地图截图（裁剪后 public/assets/gig-map/base.png）。
 * 投影参数从底图 4 个城市标记最小二乘拟合（见 content.ts 的 GIG_PROJ 注释），
 * 残差 <2px，所以 pin 落点默认是**真实经纬度**。
 *
 * 唯一例外是上海 4 个场地：真实投影后只占 38×12 px（交大与 Sandbar 相距 600m ≈ 2px），
 * 圆点会完全叠死。按用户确认，这 4 个用 `spread` 位移推开到上海区域内，
 * **位移后的位置是示意，不是真实坐标**（真值仍在 GIGS 的 lat/lon）。
 *
 * 画布用 preserveAspectRatio="slice" 铺满卡片（不letterbox），
 * 内容安全区约 x 250–1150 / y 150–800，所有 pin 都在里面。
 */
import { GIGS, GIG_MAP_IMG, gigXY } from '../../data/content'

const VB = { w: GIG_MAP_IMG.w, h: GIG_MAP_IMG.h }

type Placed = { no: string; venue: string; area: string; x: number; y: number; solo: boolean }

/** 所有场地的落点：真坐标 + spread 位移 */
const PLACED: Placed[] = GIGS.map((g) => {
  const p = gigXY(g.lon, g.lat)
  const [dx, dy] = g.spread ?? [0, 0]
  return { no: g.no, venue: g.venue, area: g.area, x: p.x + dx, y: p.y + dy, solo: !g.spread }
})

type Props = {
  active: string
  hover: string | null
  onPick: (no: string) => void
  onHover: (no: string | null) => void
}

/** 白描边的地图字（跟底图自带的城市标签一个路子） */
function MapLabel({ x, y, text, size = 26, anchor = 'start' as const, weight = 600 }: {
  x: number; y: number; text: string; size?: number; anchor?: 'start' | 'middle' | 'end'; weight?: number
}) {
  return (
    <text className="gm__label" x={x} y={y} fontSize={size} fontWeight={weight} textAnchor={anchor}>
      {text}
    </text>
  )
}

export default function GigMap({ active, hover, onPick, onHover }: Props) {
  const shown = hover ?? active
  const shownPin = PLACED.find((p) => p.no === shown)

  return (
    <svg
      className="gigmap"
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      preserveAspectRatio="xMidYMid slice"
      role="group"
      aria-label="演出地图：上海 4 场、杭州 1 场、安吉 1 场，共 6 个场地"
    >
      {/* ═══════════ 真实底图 ═══════════ */}
      <image href="/assets/gig-map/base.png" x="0" y="0" width={VB.w} height={VB.h} />

      {/* ═══════════ 6 个场地 pin ═══════════ */}
      {PLACED.map((p, i) => {
        const sel = p.no === shown
        return (
          <g
            key={p.no}
            className={`gm__pin${sel ? ' is-on' : ''}${p.solo ? ' is-solo' : ''}`}
            transform={`translate(${p.x} ${p.y})`}
            role="button"
            tabIndex={0}
            aria-label={`${p.no} ${p.venue} · ${p.area}`}
            aria-pressed={p.no === active}
            onClick={() => onPick(p.no)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(p.no) }
            }}
            onMouseEnter={() => onHover(p.no)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(p.no)}
            onBlur={() => onHover(null)}
          >
            {/* 呼吸光环：错开相位，6 个不同时闪 */}
            <circle className="gm__pulse" r="18" style={{ animationDelay: `${i * 0.42}s` }} />
            <circle className="gm__pulse gm__pulse--2" r="18" style={{ animationDelay: `${i * 0.42 + 1.2}s` }} />
            {/* 主圆点 */}
            <circle className="gm__pin-hit" r="26" />
            <circle className="gm__pin-dot" r="18" />
            <text className="gm__pin-no" y="6.5">{p.no}</text>
            {/* 单场地（杭州 / 安吉）常驻标签，左右避开底图自带的城市名 */}
            {p.solo && (
              <>
                <MapLabel x={-26} y={-8} text={p.venue} size={27} anchor="end" />
                <MapLabel x={-26} y={18} text={p.area} size={20} anchor="end" weight={500} />
              </>
            )}
          </g>
        )
      })}

      {/* ═══════════ 当前 pin 的浮标（上海 4 个点靠它区分） ═══════════ */}
      {shownPin && !shownPin.solo && (() => {
        const tw = shownPin.venue.length * 15 + 26
        const bw = Math.max(tw, 150)
        const up = shownPin.y > 420
        const by = up ? -62 : 30
        return (
          <g className="gm__tip" transform={`translate(${shownPin.x} ${shownPin.y})`}>
            <rect x={-bw / 2} y={by} width={bw} height={38} rx="8" />
            <text x={0} y={by + 25}>{shownPin.venue}</text>
          </g>
        )
      })()}
    </svg>
  )
}
