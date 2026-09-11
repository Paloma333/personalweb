/* 站点全部文案与作品数据 —— 与参考逐帧核对整理 */

export const SITE = {
  owner: 'LIU YUSHAN', // 草稿：拼写方式待把关（LIU YUSHAN / YUSHAN LIU）
  tagline: "LIU YUSHAN — PORTFOLIO '26", // 草稿：待把关
  year: '2026',
}

/* ── 出处与源码 ───────────────────────────────────────
 * 本站是对小红书博主 momo 的 Locker 个人网站的复刻练习：视觉创意归原作者，
 * 这条出处要一直挂在页面上（左下角 Credit 组件），不是只写在 README 里。
 * repoUrl 是开源仓库地址，换仓库时只改这一处。 */
export const CREDIT = {
  author: 'momo',
  platform: '小红书',
  originUrl:
    'https://www.xiaohongshu.com/discovery/item/6a852ae7000000002500b24e?xsec_token=ABxWdb99F51QhPGOvNNuLGxYSbTeGIKFnMDujjIeP1Kr8=',
  repoUrl: 'https://github.com/qzz0518/locker-folio',
}

/* ── 顶部导航 ─────────────────────────────────────────── */
export const NAV = [
  { id: 'about', label: 'ABOUT' },
  { id: 'skills', label: 'SKILLS' },
  { id: 'work', label: 'SELECTED WORK' },
  { id: 'music', label: 'MY TIME' },
  { id: 'contact', label: 'CONTACT' },
] as const

/* ── ABOUT：工牌 ───────────────────────────────────────
 * 6 字段 + 页脚。name 拼写（LIU YUSHAN / YUSHAN LIU）与出处声明待你把关。
 * 背景钢印（原 CERTIFIED / 雨姗）已按 2026-09-08 要求整块移除。 */
export const ABOUT = {
  cardNo: 'NO. 027',
  title: ['BASIC', 'INFORMATION'],
  titleCn: '个人简介',
  sub: 'PERSONAL PORTFOLIO ID CARD',
  fields: [
    { k: 'NAME / 姓名', v: '刘雨姗 LIU YUSHAN' },
    { k: 'EDUCATION / 教育', v: '香港中文大学 · Marketing 市场营销 · 2027 届' },
    { k: 'UNDERGRAD / 本科', v: '华东师范大学 · 日语 + 数字素养微专业' },
    { k: 'EXCHANGE / 交换', v: '日本神奈川大学 2024.9 – 2025.2' },
    { k: 'LANGUAGE / 语言', v: '日语 专八 · N1 ｜ 英语 IELTS 7.0' },
    { k: 'FOCUS / 求职方向', v: 'AI 产品 · 策略产品 · 数据产品' },
  ],
  email: 'paloma333@163.com',
  phone: '+86 15159265131',
  footL: 'IN MY CREATIVE ERA',
  footR: 'PERSONAL PORTFOLIO · 2026',
}

/* ── SKILLS：三张卡片 ─────────────────────────────────── */
export type SkillCard = {
  no: string
  kicker: string
  title: string
  desc: string
  rows: { k: string; v: string }[]
  bg: string
  fg: string
  /** 卡内跳转入口。只支持站内 overlay（目前是 'work' = SELECTED WORK 作品展示），
   *  走外链的话这里就该是 href 了；留空表示这张卡没有跳转。 */
  link?: { text: string; target: 'work' }
}

/* 2026-09-09 重排：AI 提到最前（01），人文 / 数据顺延。
   AI 卡末尾的「具体作品」是站内跳转到 SELECTED WORK 作品展示。 */
export const SKILLS: SkillCard[] = [
  {
    no: '01',
    kicker: '01 / AI PRACTICE',
    title: 'AI 实践',
    desc: 'AI 实践：从 RAG 到 Copilot 到 Agent，我在实践中抓住 AI 的发展脉络；从 AI 赋能学科研究到 AI 结合生产领域，我用数个实践项目、产品实习，不断打磨 AI 时代 builder 的思维与能力。',
    rows: [
      { k: 'PRODUCT', v: 'AI Copilot · AI Summary Agent · Webapp · Skill' },
      { k: 'BUILD', v: 'Next.js + Supabase + Qwen-VL · Vibe Coding' },
    ],
    bg: '#ffffff',
    fg: '#14161a',
    link: { text: '具体作品', target: 'work' },
  },
  {
    no: '02',
    kicker: '02 / HUMANITIES',
    title: '人文素养',
    desc: 'AI 时代更宝贵的是对「人」的回望。我在文学、艺术中汲取审美养分，在多文化求学历程中开拓视野，用商科思维对现实生活进一步洞察。善于与人合作交流、保持独立思考与判断，活跃创作之心与产品思维，是我相信「行远」的必需品质。',
    rows: [
      { k: 'LANGUAGES', v: '日语 专八 · N1 / 英语 IELTS 7.0' },
      { k: 'FIELDS', v: '文学计量 · 数字人文 · 数字媒体' },
    ],
    bg: '#1b28d8',
    fg: '#ffffff',
  },
  {
    no: '03',
    kicker: '03 / DATA',
    title: '数据能力',
    desc: 'Python / Pandas 文本处理、Gephi 社会网络分析、SQL 与看板搭建；也会把数据做成艺术——用 p5.js 给乐队写演出 VJ。',
    rows: [
      { k: 'ANALYSIS', v: 'Python · Pandas · SQL · Gephi' },
      { k: 'OUTPUT', v: '数据看板 · 可视化 · 文本分析' },
    ],
    bg: '#c8f322',
    fg: '#12140f',
  },
]

/* ── SELECTED WORK：两个文件夹（实习 / 个人项目） ── */
/* THINKING 和 MUSIC 已升级为独立 overlay（在 3D 柜子上的文件夹 / 吉他直接进）。 */
export const FOLDERS = [
  {
    id: 'intern',
    en: ['INTERNSHIP'],
    cn: '实习经历',
    bg: '#c8f322',
    fg: '#1b28d8',
    cnFg: '#1b28d8',
    x: 8,
    y: 6,
    rot: -7,
    z: 3,
  },
  {
    id: 'projects',
    en: ['PROJECTS'],
    cn: '个人项目',
    bg: '#1b28d8',
    fg: '#c8f322',
    cnFg: '#ffffff',
    x: 38,
    y: -12,
    rot: 3,
    z: 2,
  },
] as const

/* ── DESIGN › 01 POSTERS ─────────────────────────────── */
export const POSTERS = [
  { src: 'greenapple', title: 'GREEN APPLE' },
  { src: 'happynewyear', title: 'HAPPY NEW YEAR' },
  { src: 'streamnow', title: 'STREAM NOW' },
  { src: 'butterfly', title: '无人之境 · UNMANNED REALM' },
  { src: 'frangipani', title: 'WHERE FRANGIPANI FALLS' },
  { src: 'chocaward', title: '年度创新糖巧奖' },
  { src: 'childhood', title: 'HELLO CHILDHOOD MEMORIES' },
  { src: 'yexing', title: '夜行之梦 · DREAM IN FLIGHT' },
  { src: 'chocmint', title: '薄荷味夹心黑巧克力' },
  { src: 'grassfest', title: '草地音乐节 · GRASS FEST' },
  { src: 'research', title: 'US-CHINA RESEARCH TRENDS' },
]

/* ── DESIGN › 02 MAGAZINE ────────────────────────────── */
export const MAGAZINE_PAGES = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6']

/* ── DESIGN › 03 IP DESIGN ───────────────────────────── */
export const IP_DESIGN = {
  kicker: '03 / IP DESIGN',
  title: 'IP DESIGN',
  cn: 'IP 形象设计',
  desc: '围绕一个圆润的原创角色展开：从基础形体、材质到延展物料，建立一套可复用的形象语言。',
  swatches: [
    { name: 'CLAY', hex: '#e3d3bb' },
    { name: 'SAND', hex: '#d6c3a5' },
    { name: 'CREAM', hex: '#f2eadd' },
    { name: 'INK', hex: '#2c2925' },
  ],
  specs: [
    { k: 'FORM', v: '球体 / 圆角几何体' },
    { k: 'MATERIAL', v: '哑光陶土 · 微磨砂' },
    { k: 'OUTPUT', v: '3D 模型 / 表情包 / 周边' },
  ],
}

/* ── PHOTOGRAPH ────────────────────────────────────────
 * 拍立得正片：5 张原创人像，4:3 横向中心裁切 + 白边（上 50 / 下 110 / 左右 32）。
 * 详见 scripts/gen-polaroid-photos.mjs。循环顺序按主观节奏排：远眺（东京塔）→ 玩（滑雪）→ 乐队 → 演出 → 海边吉他 */
export const PHOTOS = [
  'b1', 'b3', 'b4', 'b2',
  'b5', 'b1', 'b2', 'b4',
  'b3', 'b5', 'b1', 'b3',
  'b2', 'b4', 'b5', 'b1',
]

/* ── VIDEO ───────────────────────────────────────────── */
export const VIDEOS = [
  {
    no: '01',
    en: 'CHARACTER PV',
    cn: '动漫单人角色 PV',
    desc: 'Minimax 辅助生成制作二次元风格单人角色宣传短片',
    cover: 'pv1',
    href: 'https://www.feicut.com/fv/FVf0hc366wam?cm=1&fc=2&p=0',
  },
  {
    no: '02',
    en: 'ACTION CUT',
    cn: '动作向动漫 PV',
    desc: '多角色动作分镜与节奏剪辑试验',
    cover: 'pv2',
    href: 'https://www.feicut.com/fv/FVbhfppjrege?cm=1&fc=1&p=0',
  },
]

/* ── WEBSITE & WRITING ───────────────────────────────── */
/* href 是占位：三个站点还没有可公开的正式地址，一律先指向 '#'，
   面板上的 OPEN PROJECT 同时带 aria-disabled。拿到真实链接后只改这三处。
   glow 是每张封面的主色，用来喂 .wsc__glow 的背景光晕 —— 原来那三个值
   （#f6e9c8 / #f7dcd8 / #dceccd）是掺了大量白的浅色，铺在 --paper #f8f7fa 上
   几乎没有色差，看不出光晕；这里往各自封面的主色方向加饱和度。 */
export const WEBSITES = [
  {
    no: '01',
    slug: 'COFFEE / IN CHINA',
    title: ['Coffee / In', 'China'],
    kicker: 'DATA JOURNALISM · WEB',
    desc: '中国咖啡市场在消费降级、价格竞争与情绪经济之间的增长逻辑。',
    cover: 'coffee',
    glow: '#f2d49a', // 咖啡封面的焦糖黄
    href: '#',
  },
  {
    no: '02',
    slug: 'SHORT DRAMA / OVERSEAS',
    title: ['Short Drama /', 'Overseas'],
    kicker: 'FEATURE · WEB',
    desc: '短剧出海：内容工业化生产与海外分发链路的一次拆解。',
    cover: 'drama',
    glow: '#f0bfa4', // 短剧封面的暖橘
    href: '#',
  },
  {
    no: '03',
    slug: 'WECHAT / ARTICLE',
    title: ['WeChat /', 'Article'],
    kicker: 'EDITORIAL · 图文',
    desc: '公众号长图文写作与版式：把调研转成可读、可传播的叙事。',
    cover: 'wechat',
    glow: '#d7e3a4', // 图文封面的草绿
    href: '#',
  },
]

/* ── INTERNSHIP / PROJECTS：作品数据 ──
 * href 为 '#' 表示暂无公开链接（OPEN PROJECT 按钮 aria-disabled）。
 * glow 是封面主色光晕，取各自封面往饱和方向偏一点的浅色。
 * links 是主链接之外的次级入口（如数字人文项目的多个子页面/附件/GitHub），
 *   OPEN PROJECT 始终指向 href，下方列出 links 给访客更深的入口。
 * viewer 是站内可视化查看器（'gephi' | 'jrock'）：
 *   有这个字段的项目不展示 OPEN PROJECT 按钮，改成「查看可视化」打开站内 overlay。
 * portrait 标记封面是竖屏（手机截图），不写表示横屏 16:9。
 * body / features / story 是详情页附加内容：详情面板的 desc 之后展开这些。
 *
 * ⚠️ 三段实习的「数字归属」尚未与你最终核对：
 *   草稿里「发券千万级、UV +13.5%」两个数字已按理解分布，
 *   实际可能错位，发送前请回头核一遍。月份按你简历里的区间写。 */
export type WebsiteEntry = {
  no: string
  slug: string
  title: string[]
  kicker: string
  desc: string
  cover: string
  glow: string
  href: string
  links?: { label: string; href: string }[]
  viewer?: 'gephi' | 'jrock'
  portrait?: boolean
  body?: string
  features?: string[]
  story?: string
}

export const INTERNSHIPS: WebsiteEntry[] = [
  {
    no: '01',
    slug: 'MEITUAN / 策略中台',
    title: ['美团 · PM ·', '营销策略中台 × AI Copilot'],
    kicker: 'PRODUCT INTERNSHIP · 2026.01–06',
    desc: '营销策略引擎 0→1：沉淀可复用的策略模板，支撑发券、选品等场景规模化落地；引入 AI Copilot，把业务方的策略接入成本压缩到 3 人日，单次营销活动发券量级达千万级。',
    cover: 'meituan',
    glow: '#ffdf70',
    href: '#',
  },
  {
    no: '02',
    slug: 'DEWU / 内容流量分析',
    title: ['得物 · PM ·', '内容社区'],
    kicker: 'DATA PM INTERNSHIP · 2025.08–12',
    desc: '重构得物内容社区流量分析体系：从指标口径到看板架构整体重做，让运营与推荐团队自助读数，驱动核心页面 UV 增长 13.5%。',
    cover: 'dewu',
    glow: '#c9c9d6',
    href: '#',
  },
  {
    no: '03',
    slug: "MCDONALD'S / GLOBAL DATA",
    title: ['麦当劳 · PM ·', '数据产品组'],
    kicker: 'DATA PM INTERNSHIP · 2025.04–07',
    desc: '在麦当劳数据产品组，我提出并落地了 BI 组的第一个 AI 项目：报表解读 Agent。针对不同业务问题设计多线 workflow，用 RAG 注入指标口径与业务规则，并给模型立规矩——必须引用具体指标变化、区分结构性变化与短期波动。完成 demo 与趋势分析，团队内测反馈正面，被列为部门可持续迭代方向。',
    cover: 'mcd',
    glow: '#ffb3a0',
    href: '#',
  },
]

export const PROJECTS: WebsiteEntry[] = [
  {
    no: '01',
    slug: '小屋日志 / MY CABIN LOG',
    title: ['小屋日志 /', 'My Cabin Log'],
    kicker: 'INDIE PROJECT · 2026',
    desc: '一个帮你记录家里有什么的 AI 库存工具。买东西时拍张照，剩下的交给它——快用完的时候它会提醒你补货。',
    cover: 'him',
    glow: '#cfe3b8',
    portrait: true,
    href: 'https://mycabinlog.edgeone.dev',
    body: 'My Cabin Log：A little diary for your home stuff. 记录、整理买回家的物品；轻松、用心地过好今天的生活。爱是宜居的岛，欢迎回到温暖的家。',
    features: [
      '拍小票 / 截图 / 拍照识物，AI 自动识别物品入库',
      '库存一览：搜索、分类、低库存与临期提醒',
      '补货清单：已用完 / 快用完 / 快过期自动分组，一键勾选买回',
      '购物清单可分享给家人，公开链接只读，token 可随时作废',
    ],
    story: '本科毕业清空宿舍时，我翻出大量闲置物品，很多买过便忘，甚至重复购入。问题不在消费，而在于「看不见自己拥有什么」。现阶段进入留学生活后，我开始学习从零经营一个最小单位的家：采购、做饭、收纳……物品清单不断变长，同样的遗忘再次发生。小屋日志由此而生——把每件物品登记成清单，让「拥有」被看见、被记得。它先服务于我自己，如今也在服务我的家人和朋友。',
  },
  {
    no: '02',
    slug: 'J-Rock 歌词 / 60 年的可视化',
    title: ['J-Rock 歌词', '60 年表现特征研究'],
    kicker: 'THESIS VISUALIZATION · 2026',
    desc: '毕业论文长篇可视化：1965–2025 年 1,061 首 J-Rock 歌词，从词汇密度、句长分布到 11 张滚动叙事图表，一份把日语歌词当数据的读法。',
    cover: 'jrock',
    glow: '#c8334e',
    href: '#',
    viewer: 'jrock',
  },
  {
    no: '03',
    slug: '数字人文 / RESOURCE HUB',
    title: ['数字人文 /', 'Digital Humanities'],
    kicker: 'CAMPUS PROJECT · 2024',
    desc: '2024 年 ECNU 校级大创负责人：Jekyll 搭建数字人文学科资源汇总网站（99 项资源 / 9 大学科），编写 100 页《AI 驱动的数字人文教学与工具指南》。',
    cover: 'dh',
    glow: '#b3c0ff',
    href: 'https://paloma333.github.io/DigitalHumanitiesHub/',
    links: [
      { label: '学术前沿 · Linked Pasts 10', href: 'https://paloma333.github.io/DigitalHumanitiesHub/Linked_Pasts_2024.html' },
      { label: 'AI 教学指南 · 100 页',         href: 'https://paloma333.github.io/DigitalHumanitiesHub/Teaching_Guide.html' },
      { label: '附件下载 · materials-v1',     href: 'https://github.com/Paloma333/DigitalHumanitiesHub/releases/tag/materials-v1' },
      { label: 'GitHub 源码',                  href: 'https://github.com/Paloma333/DigitalHumanitiesHub' },
    ],
  },
  {
    no: '04',
    slug: '东方快车 / 社会网络分析',
    title: ['《东方快车谋杀案》', '社会网络分析'],
    kicker: 'LITERATURE VISUALIZATION · 2026',
    desc: '把阿加莎的群像小说读成一幅社会网络：20 节点、3 章节视角、随章节切换的网络层、嫌疑人星级 + 经典金句的关联阅读。',
    cover: 'gephi',
    glow: '#c8334e',
    href: '#',
    viewer: 'gephi',
  },
]

/* ── THINKING：思考手记 ────────────────────────────────────
 * 包含一个 Gephi 可视化（社会网络分析）+ 多篇短文分析 */
export const THINKING_HEAD = {
  cn: '思考手记',
  en: 'THINKING',
  kicker: 'SOCIAL NETWORK · LITERATURE · MARKETS',
  desc: '把零散的阅读、鉴赏、随想沉淀成可视化与分析。第一个 demo 是《东方快车谋杀案》社会网络分析。',
}

/* ── MY TIME：个人爱好 › 演出地图 ──────────────────────────
 * 2026-09-11：改用**真实地图底图**。
 *
 * 底图 = 用户提供的长三角地图截图，裁掉外围后存在 public/assets/gig-map/。
 * 投影参数不是猜的：从底图上 4 个城市标记（上海市 / 杭州市 / 南京市 / 宁波市）
 * 的最小二乘拟合解出来的，残差 < 2px，c/a = 1.1700 与 Web Mercator 在 31°N 的
 * 理论值 1.1691 吻合 —— 说明底图是标准 Web Mercator 投影，坐标可信。
 *
 * 于是所有场地 pin 都直接落在**真实经纬度投影**的位置上，不再有任何"示意性排布"。
 * 代价：上海 4 个场地真实间距只有 38×12 px（交大和 Sandbar 相距 600m ≈ 2px），
 * 物理上不可能各画一个可点的大 pin —— 所以上海用「引线卡」承载这 4 个场地。
 *
 * poster 对应 public/assets/gig/<slug>.webp，由 scripts/gen-gig-posters.mjs 生成；
 * 没有海报的场地（上海交通大学）组件会画占位框。 */
export const MYTIME_HEAD = {
  cn: '个人爱好',
  en: 'MY TIME',
  kicker: 'BAND · GUITAR · VOCAL · VJ',
  desc: '4 年乐队：吉他 / 主唱 / VJ 视觉编程。从校园礼堂到 Livehouse，这张图是这四年演过的地方。',
}

/* ── 底图投影 ─────────────────────────────────────────
 * 底图是 1686×1156 的原截图裁掉 (100,150)-(1500,1090) 后的 1400×940。
 * 全图坐标系下的拟合式（最小二乘，4 点残差 <2px）：
 *   x_img = 364.0 · lon - 43180.4
 *   y_img = -425.9 · lat + 13728.3
 * 下面把裁剪偏移减掉，直接得到裁剪图内坐标。 */
export const GIG_MAP_IMG = { w: 1400, h: 940 }
const CROP_X = 100
const CROP_Y = 150
export const GIG_PROJ = {
  a: 364.0, b: -43180.4,   // x = a·lon + b
  c: -425.9, d: 13728.3,   // y = c·lat + d
  ox: CROP_X, oy: CROP_Y,  // 裁剪偏移
}
/** 经纬度 → 底图内像素坐标 */
export function gigXY(lon: number, lat: number) {
  return {
    x: GIG_PROJ.a * lon + GIG_PROJ.b - GIG_PROJ.ox,
    y: GIG_PROJ.c * lat + GIG_PROJ.d - GIG_PROJ.oy,
  }
}

/** 城市节点（真实经纬度） */
export const GIG_CITIES: {
  cn: string
  en: string
  lat: number
  lon: number
}[] = [
  /* 2026-09-11：改用真实底图后，city 只用来做「哪些场地属于同一个城市」的分组判断，
     坐标不再参与作图（城市名已经印在底图上了）。 */
  { cn: '上海', en: 'SHANGHAI', lat: 31.23, lon: 121.47 },
  { cn: '杭州', en: 'HANGZHOU', lat: 30.274, lon: 120.155 },
  { cn: '安吉', en: 'ANJI', lat: 30.63, lon: 119.68 },
]

export type Gig = {
  no: string
  /** 场地名 */
  venue: string
  /** 场地英文名 / 拼音，卡片副标题 */
  en: string
  /** 城市 + 区，卡片与地图标签共用 */
  area: string
  lat: number
  lon: number
  /** 所属城市（GIG_CITIES.cn）。底图上同城场地会挤在几 px 内，需要分组处理 */
  city: string
  /** public/assets/gig 下的 slug；缺省 = 海报待补 */
  poster?: string
}

export const GIGS: Gig[] = [
  {
    no: '01',
    venue: '华东师范大学',
    en: 'EAST CHINA NORMAL UNIVERSITY',
    area: '上海 · 普陀',
    city: '上海',
    lat: 31.229,
    lon: 121.405,
    poster: 'ecnu',
  },
  {
    no: '02',
    venue: '上海交通大学',
    en: 'SHANGHAI JIAO TONG UNIVERSITY',
    area: '上海 · 徐汇',
    city: '上海',
    lat: 31.203,
    lon: 121.437,
  },
  {
    no: '03',
    venue: '边角料咖啡酒馆',
    en: 'LEFT CORNER COFFEE & BARS',
    area: '杭州 · 拱墅',
    city: '杭州',
    lat: 30.323,
    lon: 120.137,
    poster: 'hangzhou',
  },
  {
    no: '04',
    venue: 'Sandbar',
    en: 'SANDBAR 柏沙吧',
    area: '上海 · 长宁',
    city: '上海',
    lat: 31.201,
    lon: 121.431,
    poster: 'sandbar',
  },
  {
    no: '05',
    venue: '麓 Livehouse',
    en: 'LU LIVEHOUSE',
    area: '湖州 · 安吉',
    city: '安吉',
    lat: 30.587,
    lon: 119.655,
    poster: 'anji',
  },
  {
    no: '06',
    venue: '奶油俱乐部',
    en: 'CREAM CLUB',
    area: '上海 · 浦东',
    city: '上海',
    lat: 31.21,
    lon: 121.51,
    poster: 'cream',
  },
]

/** 顶部计数条。场次只给总量：每场地的场次没有单独统计，先不编数字 */
export const GIG_STATS = [
  { k: '20+', v: '场次 SHOWS' },
  { k: '06', v: '场地 VENUES' },
  { k: '03', v: '城市 CITIES' },
  { k: '4', v: '年 YEARS' },
]

/* ── CONTACT：软木板便签 ───────────────────────────────
 * 三张种子便签 + 用户可自己钉新的。位置/旋转用软木板百分比，组件会钳在软木板范围内。
 * ⚠️ s2 简历下载链接待简历 PDF 到位后挂 href（先保留 '#'）。 */
export const NOTE_COLORS = ['#cfe0c3', '#f0e6a8', '#e8b7b7', '#a9c9dd', '#e5cfe0', '#d8cdb8']

export const SEED_NOTES = [
  { id: 's1', text: '📮  paloma333@163.com', color: '#cfe0c3', x: 14, y: 42, rot: -2 },
  { id: 's2', text: '🎓  27 届 PM · 秋招联系 · 简历 ↓', color: '#f0e6a8', x: 70, y: 12, rot: 3 },
  { id: 's3', text: '💬  加微信请注明「雨姗 + 求职」', color: '#e8b7b7', x: 80, y: 33, rot: -3 },
]
