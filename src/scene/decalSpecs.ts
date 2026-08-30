/* ============================================================================
 * 柜门贴花的位置表
 *
 * ── 坐标用的是门面百分比 ────────────────────────────────────
 *   left / top  = 贴花左上角相对门面左上角的比例
 *   width       = 贴花宽度相对门宽的比例
 *   高度不写   —— 由贴图 alpha 包围盒的宽高比算，换素材自动跟着变
 *
 * 门内侧那一组的百分比是**镜像坐标系**里的值：`Door_02_InnerContent`
 * 整组绕 Y 转了 180°，法线才朝外，所以它的 left 从门的右边算起。
 *
 * ── 缺的几张 ────────────────────────────────────────────────
 * 参考里还有几张手写纸条和气泡，仓库里没有对应贴图资源，
 * 不能凭空造一张进 3D，这几张就先空着。
 * ========================================================================== */

export type DecalSpec = {
  /** 稳定 id：热点绑定和拖拽状态都按它索引，可交互节点必须稳定命名 */
  id: string
  url: string
  /** 左上角相对门面的比例 */
  left: number
  top: number
  /** 宽度相对门宽的比例 */
  width: number
  /** 面内旋转（度） */
  rot?: number
  /** 是否允许在门板平面内拖动 */
  draggable?: boolean
}

/** 第 1 扇门（关着）外表面 */
// 海报与两个托盘已经换成独立、有厚度的实体组件（Props.tsx）；这里不再保留
// 透明平面副本，否则会与实体重叠并重新产生穿过通风槽的视觉问题。
export const DOOR1_DECALS: readonly DecalSpec[] = []

/** 第 4 扇门（关着）外表面 */
// 原先一张复合 polaroids.webp 已拆成五张可单独拖动的实体磁吸卡。
export const DOOR4_DECALS: readonly DecalSpec[] = []

/**
 * 第 2 扇门的内侧 —— 翻开后正对观众的那一面，贴纸最密的地方。
 *
 * ABOUT 的入口是工牌，它已经不在这张表里：贴花是零厚度的平面，工牌挂在
 * 实体挂钩上、还要被钩尖穿过吊环，做成实体才成立。现在它是 PhysicalProps
 * 的 IdCardModel，由 Props.tsx 按 ID_CARD_AT 装到门上。
 *
 * 这里的 7 张拍立得围着工牌散落（左右各一排），每张都可拖动；
 * 偏移 / 旋转 / 尺寸都按"避免规则重复、有照片墙的呼吸感"设计。
 * 拍立得源图见 /public/assets/polaroid/{p1..p5,i6,i7}.webp，
 * 由 scripts/gen-polaroid-decals.mjs 从素材/02 + 素材/06 批量生成。
 */
export const DOOR2_INNER_DECALS: readonly DecalSpec[] = [
  // 左侧一列（4 张，自上而下：东京塔 → 海边吉他 → 滑雪 → 得物实习）
  { id: 'photo-tokyo',    url: '/assets/polaroid/p1.webp', left: 0.02, top: 0.04, width: 0.22, rot: -6, draggable: true },
  { id: 'photo-beach-guitar', url: '/assets/polaroid/p4.webp', left: 0.05, top: 0.30, width: 0.20, rot: 5, draggable: true },
  { id: 'photo-ski',      url: '/assets/polaroid/p5.webp', left: 0.02, top: 0.56, width: 0.22, rot: -3, draggable: true },
  { id: 'photo-intern-dewu', url: '/assets/polaroid/i6.webp', left: 0.06, top: 0.79, width: 0.20, rot: 4, draggable: true },

  // 右侧一列（3 张：日语+演出 → 乐队排练 → 麦当劳实习）
  { id: 'photo-jp-show',  url: '/assets/polaroid/p3.webp', left: 0.75, top: 0.04, width: 0.20, rot: 5, draggable: true },
  { id: 'photo-band-rehearsal', url: '/assets/polaroid/p2.webp', left: 0.78, top: 0.30, width: 0.20, rot: -5, draggable: true },
  { id: 'photo-intern-mcd', url: '/assets/polaroid/i7.webp', left: 0.74, top: 0.56, width: 0.20, rot: 4, draggable: true },
]

/* ============================================================================
 * 工牌与它的挂钩
 *
 * 这两个坐标不是贴花，但必须和这张贴花表里那套「门面百分比」反解出自同一处：
 * 工牌原本就是按 left 26% / top 18% / width 38% 摆的一张贴花，挂钩是照着它的
 * 印刷吊环对齐做出来的。工牌换成实体（PhysicalProps 的 IdCardModel）之后，
 * 位置一个像素都不能动，否则钩尖就不再从吊环的孔里穿过去。两个数放在一起，
 * 就不会有人只改一个。
 *
 *   贴片宽  w = 0.38 × DOOR_W(0.924)                = 0.35112
 *   贴片高  h = w ÷ 源图宽高比 430/760(0.565789)     = 0.62059
 *   贴片中心 x = (0.26 + 0.38/2) × DOOR_W − DOOR_W/2 = −0.0462
 *          y = DOOR_H/2 − (0.18 × DOOR_H + h/2)     =  0.55307
 *
 * 吊环的孔在 430×760 源图里占 x 177–252 / y 25–108，换算到内容组：
 *          x = −0.0462 + (214.5/430 − 0.5) × w      = −0.04661
 *          y ∈ 0.55307 + (0.5 − {25,108}/760) × h   = 0.7752 … 0.8430
 *   净空 0.062 × 0.069，钩体直径 0.012，穿得过去。
 *
 * 挂钩底板压在孔上沿之上，所以 ID_CARD_HOOK_AT 给的是**底板中心**：
 * y = 手臂下端 0.810 + 0.087（模型里手臂到底板的距离），z 落在门内侧面上。
 * 手臂下端 0.810、钩尖 0.810–0.835 都落在上面那段孔高里。
 * ========================================================================== */

export const ID_CARD_HOOK_AT: readonly [number, number, number] = [-0.0466, 0.897, -0.0045]

/**
 * 工牌整张（吊环 + 卡体）的世界宽高 —— 就是上面那两行 w / h。
 *
 * 两处在用，必须是同一份：拖拽的占地范围（Props.tsx），以及实体模型反推
 * 「源图 1px 折算多少世界单位」的基准（PhysicalProps 的 IdCardModel）。
 */
export const ID_CARD_SIZE: readonly [number, number] = [0.35112, 0.62059]

/**
 * 工牌实体的装配点：整张牌（吊环 + 卡体）的中心，与原贴花中心重合。
 *
 * z 是卡背离门内侧面的距离。门内侧面在 −0.0045，挂钩底板厚 0.012 压在上面，
 * 正面就到 0.0075 —— 牌子贴着承它重量的那块五金件，卡背取同一个 z。
 * 由此卡体中面（IdCardModel 里吊环片所在的位置）落在 0.0075 + 0.014/2 = 0.0145：
 * 挂钩手臂在 −0.0025 被环带挡住，钩尖在 0.0255 从孔里探到牌子前面 0.011。
 */
export const ID_CARD_AT: readonly [number, number, number] = [-0.0462, 0.55307, 0.0075]

/**
 * 图集要打包的全部贴图（去重后）。
 *
 * 工牌退出这张表之后，图集里 `/assets/obj/idcard2.webp` 那一格就成了「已备好、
 * 场景层未排位」的多余项 —— pack-decals 对这个方向只警告不失败，重打图集时
 * 它会被顺手挤掉，都不影响运行时。素材本身仍在用：IdCardModel 按 URL 单独加载它。
 */
export const DECAL_URLS: readonly string[] = [
  ...new Set(
    [...DOOR1_DECALS, ...DOOR4_DECALS, ...DOOR2_INNER_DECALS].map((d) => d.url),
  ),
]
