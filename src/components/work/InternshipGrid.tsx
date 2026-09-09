import { useEffect, useRef } from 'react'
import { type WebsiteEntry } from '../../data/content'
import BackToFolders from './BackToFolders'
import { releaseImages, SIZES, workImage } from './imageSources'
import './website.css'
import './internship.css'

/**
 * SELECTED WORK › INTERNSHIP —— 静态卡片网格
 *
 * 和 PERSONAL PROJECTS 走的是两条路：那边有真实可点的链接（小屋 / 数字人文），
 * 值得用 3D 环形封面轮播去做「翻封面」的仪式感；这边三段实习只有基础介绍、
 * 没有能打开的成品，轮播的拖拽 / 滚轮 / 点击展开反而是在给没有内容的东西
 * 加交互。所以这里干脆静态到底：一屏铺满三张卡，信息都在明面上，不藏。
 *
 * 真要加回交互时只需要补 href —— 卡片结构本身不变。
 */
type Props = {
  items: WebsiteEntry[]
  head?: string
}

export default function InternshipGrid({ items, head = 'INTERNSHIP' }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)

  // 关闭栏目时断开封面图引用（与 WebsiteCarousel 一致）
  useEffect(() => {
    const root = rootRef.current
    return () => releaseImages(root)
  }, [])

  return (
    <div ref={rootRef} className="wv ig">
      <BackToFolders />
      <div className="ig__wrap">
        <header className="ig__head">
          <h1>{head}</h1>
          <span className="ig__count">{String(items.length).padStart(2, '0')} EXPERIENCES</span>
        </header>

        <div className="ig__grid">
          {items.map((w) => (
            <article key={w.no} className="ig__card" style={{ ['--glow' as string]: w.glow }}>
              <div className="ig__cover">
                <img
                  {...workImage('cover', w.cover)}
                  sizes={SIZES.website}
                  alt={w.slug}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
                <span className="ig__bar">
                  <span>{w.slug}</span>
                  <span>{w.no}</span>
                </span>
              </div>

              <div className="ig__body">
                <span className="ig__kicker">{w.kicker}</span>
                <h2 className="ig__title">
                  {w.title.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </h2>
                <p className="ig__desc">{w.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
