/**
 * 演出地图（MY TIME › 个人爱好）· 真实底图版
 *
 * 底图 = 用户提供的长三角地图截图（裁剪后 public/assets/gig-map/base.png）。
 * 投影参数从底图上 4 个城市标记最小二乘拟合出来（见 content.ts 的 GIG_PROJ 注释），
 * 残差 <2px，所以下面所有 pin 都直接落在**真实经纬度**的位置上。
 *
 * 尺度带来的必然结果：上海 4 个场地真实间距 38×12 px，交大和 Sandbar 只差 600m
 * （≈2px），不可能各画一个可点的大 pin。所以：
 *   - 上海 → 真位置画一个聚合标记 + 「引线卡」把 4 个场地列出来（可点）
 *   - 杭州 / 安吉 → 单场地，直接按真坐标落 pin
 */
import { GIGS, GIG_MAP_IMG, gigXY, type Gig } from '../../data/content'

const VB = { w: GIG_MAP_IMG.w, h: GIG_MAP_IMG.h }

/** 上海 4 个场地的真实投影位置（用来算聚合点和引线范围） */
const SHA = GIGS.filter((g) => g.city === '上海').map((g) => ({ gig: g, ...gigXY(g.lon, g.lat) }))
const SHA_C = {
  x: SHA.reduce((s, p) => s + p.x, 0) / SHA.length,
  y: SHA.reduce((s, p) => s + p.y, 0) / SHA.length,
}
const SHA_R = {
  /* +10 而不是 +16：聚焦圈再往外扩就会压到底图自带的「上海市」标签 */
  x: Math.max(...SHA.map((p) => Math.abs(p.x - SHA_C.x))) + 10,
  y: Math.max(...SHA.map((p) => Math.abs(p.y - SHA_C.y))) + 10,
}

/** 单场地城市：直接落 pin */
const SOLO = GIGS.filter((g) => g.city !== '上海').map((g) => ({ gig: g, ...gigXY(g.lon, g.lat) }))

/** 引线卡（装在东海空白处）的几何。
 *  放在 (1058,296)：左缘给底图自带的「上海市」标签留出 23px 空隙，
 *  引线锥也从聚焦圈**下方**出，不走标签上那条水平带。 */
const CARD = { x: 1058, y: 296, w: 320, h: 300, r: 14 }
const CARD_ROW_H = 52
const CARD_ROW_Y0 = 388   // 第一行的中心 y（绝对值）
/** 引线锥顶点：聚焦圈右下方，避开「上海市」文字的垂直范围（259–295） */
const CONE_APEX = { x: 952, y: 300 }

type Props = {
  active: string
  hover: string | null
  onPick: (no: string) => void
  onHover: (no: string | null) => void
}

/** 白底描边的地图字（跟底图自带的城市标签一个路子） */
function MapLabel({ x, y, text, size = 26, anchor = 'middle' as const, weight = 500 }: {
  x: number; y: number; text: string; size?: number; anchor?: 'start' | 'middle' | 'end'; weight?: number
}) {
  return (
    <text
      className="gm__label"
      x={x}
      y={y}
      fontSize={size}
      fontWeight={weight}
      textAnchor={anchor}
    >
      {text}
    </text>
  )
}

export default function GigMap({ active, hover, onPick, onHover }: Props) {
  const shown = hover ?? active

  /** 一个场地是否高亮 */
  const on = (g: Gig) => g.no === shown

  return (
    <svg
      className="gigmap"
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      role="group"
      aria-label="演出地图：上海 4 场、杭州 1 场、安吉 1 场，共 6 个场地"
    >
      {/* ═══════════ 真实底图 ═══════════ */}
      <image href="/assets/gig-map/base.png" x="0" y="0" width={VB.w} height={VB.h} />

      {/* ═══════════ 上海：真位置聚合标记 + 引线锥 + 引线卡 ═══════════ */}
      {/* 聚焦圈：圈出上海 4 个场地的真实范围 */}
      <ellipse
        className="gm__focus"
        cx={SHA_C.x}
        cy={SHA_C.y}
        rx={SHA_R.x}
        ry={SHA_R.y}
      />
      {/* 4 个场地的真实位置小点（看得出是 4 个不同地方） */}
      {SHA.map((p) => (
        <circle
          key={p.gig.no}
          className={`gm__dot${on(p.gig) ? ' is-on' : ''}`}
          cx={p.x}
          cy={p.y}
          r={4.5}
        />
      ))}
      {/* 引线锥：聚焦圈下方 → 卡片左缘（从下方出，避开底图「上海市」标签） */}
      <line
        className="gm__cone-stem"
        x1={SHA_C.x}
        y1={SHA_C.y + SHA_R.y}
        x2={CONE_APEX.x}
        y2={CONE_APEX.y}
      />
      <path
        className="gm__cone"
        d={`M ${CONE_APEX.x},${CONE_APEX.y}
            L ${CARD.x},${CARD.y + 54}
            L ${CARD.x},${CARD.y + CARD.h - 20}
            Z`}
      />
      {/* 聚合标记：压在上海真实位置上 */}
      <g
        className={`gm__agg${GIGS.some((g) => g.city === '上海' && on(g)) ? ' is-on' : ''}`}
        transform={`translate(${SHA_C.x} ${SHA_C.y})`}
        role="button"
        tabIndex={0}
        aria-label="上海 4 个场地"
        onMouseEnter={() => onHover(SHA[0].gig.no)}
      >
        <circle className="gm__agg-ring" r="13" />
        <text className="gm__agg-n" y="6">{SHA.length}</text>
      </g>

      {/* 引线卡：4 个上海场地 */}
      <g className="gm__card">
        <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} rx={CARD.r} />
        <text className="gm__card-kicker" x={CARD.x + 20} y={CARD.y + 34}>上海 · 4 个场地</text>
        <line
          className="gm__card-rule"
          x1={CARD.x + 20}
          y1={CARD.y + 52}
          x2={CARD.x + CARD.w - 20}
          y2={CARD.y + 52}
        />
        {SHA.map((p, i) => {
          const y = CARD_ROW_Y0 + i * CARD_ROW_H
          const sel = on(p.gig)
          return (
            <g
              key={p.gig.no}
              className={`gm__row${sel ? ' is-on' : ''}`}
              transform={`translate(${CARD.x + 20} ${y})`}
              role="button"
              tabIndex={0}
              aria-label={`${p.gig.no} ${p.gig.venue} · ${p.gig.area}`}
              aria-pressed={p.gig.no === active}
              onClick={() => onPick(p.gig.no)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(p.gig.no) }
              }}
              onMouseEnter={() => onHover(p.gig.no)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(p.gig.no)}
              onBlur={() => onHover(null)}
            >
              <rect className="gm__row-hit" x={-8} y={-22} width={CARD.w - 24} height={44} rx={9} />
              <circle className="gm__row-dot" cx="13" cy="0" r="13" />
              <text className="gm__row-no" x="13" y="5">{p.gig.no}</text>
              <text className="gm__row-name" x="38" y="-2">{p.gig.venue}</text>
              <text className="gm__row-area" x="38" y="18">{p.gig.area}</text>
            </g>
          )
        })}
      </g>

      {/* ═══════════ 杭州 / 安吉：单场地直接落 pin ═══════════ */}
      {SOLO.map((p) => {
        const sel = on(p.gig)
        // 标签放在 pin 左上，避开底图自带的「杭州市」标签
        return (
          <g
            key={p.gig.no}
            className={`gm__pin${sel ? ' is-on' : ''}`}
            transform={`translate(${p.x} ${p.y})`}
            role="button"
            tabIndex={0}
            aria-label={`${p.gig.no} ${p.gig.venue} · ${p.gig.area}`}
            aria-pressed={p.gig.no === active}
            onClick={() => onPick(p.gig.no)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(p.gig.no) }
            }}
            onMouseEnter={() => onHover(p.gig.no)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(p.gig.no)}
            onBlur={() => onHover(null)}
          >
            <line className="gm__pin-stem" x1="0" y1="-4" x2="0" y2="-30" />
            <circle className="gm__pin-dot" r="14" />
            <text className="gm__pin-no" y="6">{p.gig.no}</text>
            <MapLabel x={-20} y={-40} text={p.gig.venue} size={26} anchor="end" weight={600} />
            <MapLabel x={-20} y={-14} text={p.gig.area} size={20} anchor="end" />
          </g>
        )
      })}

      {/* ═══════════ 图例：底图出处 + 尺度说明 ═══════════ */}
      <g className="gm__legend" transform={`translate(28 ${VB.h - 68})`}>
        <rect x="0" y="-26" width="452" height="56" rx="10" />
        <text x="16" y="-2" className="gm__legend-t">底图为长三角真实地图 · pin 按真实经纬度落点</text>
        <text x="16" y="19" className="gm__legend-s">上海 4 个场地真实相距仅 38×12 px，用引线卡展开</text>
      </g>
    </svg>
  )
}
