#!/usr/bin/env python3
"""生成分享卡片图 public/og.png（1200×630，供 og:image / twitter:image 使用）。

为什么要自己画一张而不是用站内素材：
站内图片都是 3D 场景的贴图（AI 生成的角色贴纸、宝丽来、杂志页），
拿来当社交卡片第一印象不对；而降级模式要用的「场景预渲染图」还没出。
所以这里用站点自己的字体做一张纯排版卡片 —— 改文案只需改下面的常量。

依赖：pillow、fonttools（fonttools 只用于把 woff2 转成 PIL 能读的 ttf）
    python3 -m pip install pillow fonttools brotli

用法：
    python3 scripts/gen-og-card.py          # 写到 public/og.png
"""

from __future__ import annotations

import pathlib
import tempfile

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

# ── 文案（改这里就够了）────────────────────────────────────────
KICKER = "PERSONAL PORTFOLIO"
NAME = "LIU YUSHAN"
CN_LINE = "日本文学 × 数据 × AI × 音乐 × 摄影"
EN_LINE = "LITERATURE · DATA · AI · MUSIC · PHOTOGRAPHY"  # 中文字体缺失时的回退
FOOTER = "AI PRODUCT  ·  STRATEGY  ·  DATA PRODUCT"

# ── 站点设计变量（与 src/styles/global.css 保持一致）──────────
PAPER = "#f8f7fa"
INK = "#14161a"
INK_SOFT = "#4c5058"
INK_FAINT = "#9aa0a8"
LIME = "#c8f322"
RULE = "#dfdee4"

W, H, PAD = 1200, 630, 88

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONT_DIR = ROOT / "public" / "fonts"
OUT = ROOT / "public" / "og.png"

# 站点所用的两款字体；Playfair 是可变字重（400–900），PingFang 是 macOS 系统字体
WOFF2 = {
    "playfair": FONT_DIR / "PlayfairDisplay-normal-400-900-latin.woff2",
    "courier": FONT_DIR / "CourierPrime-normal-400-latin.woff2",
}
CJK_CANDIDATES = [
    "/System/Library/Fonts/PingFang.ttc",
    "/System/Library/Fonts/Supplemental/Songti.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
]


def woff2_to_ttf(src: pathlib.Path, dst: pathlib.Path) -> pathlib.Path:
    face = TTFont(src)
    face.flavor = None
    face.save(dst)
    return dst


def load(path, size, axes=None):
    font = ImageFont.truetype(str(path), size)
    if axes:
        try:
            font.set_variation_by_axes(axes)
        except Exception as exc:  # 不支持可变轴时退回默认字重
            print(f"[warn] 可变字重设置失败（{exc}），使用默认字重")
    return font


def spaced(draw, xy, text, font, fill, track):
    """PIL 没有字间距，逐字符手动画。"""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + track


def main() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        tmp = pathlib.Path(tmp)
        playfair = woff2_to_ttf(WOFF2["playfair"], tmp / "playfair.ttf")
        courier = woff2_to_ttf(WOFF2["courier"], tmp / "courier.ttf")

        img = Image.new("RGB", (W, H), PAPER)
        draw = ImageDraw.Draw(img)

        f_kicker = load(courier, 22)
        f_name = load(playfair, 118, axes=[900])
        f_body = load(courier, 25)

        spaced(draw, (PAD, 96), KICKER, f_kicker, INK_FAINT, 4.5)
        draw.text((PAD - 6, 150), NAME, font=f_name, fill=INK)

        rule_y = 330
        draw.line([(PAD, rule_y), (W - PAD, rule_y)], fill=RULE, width=1)
        draw.line([(PAD, rule_y), (PAD + 120, rule_y)], fill=LIME, width=3)

        cjk = next((p for p in CJK_CANDIDATES if pathlib.Path(p).exists()), None)
        if cjk:
            f_cjk = ImageFont.truetype(cjk, 30)
            draw.text((PAD - 2, 372), CN_LINE, font=f_cjk, fill=INK_SOFT)
        else:
            print("[warn] 没找到中文字体，改用英文副标题")
            spaced(draw, (PAD, 380), EN_LINE, f_body, INK_SOFT, 2.6)

        spaced(draw, (PAD, 508), FOOTER, f_body, INK_FAINT, 1.6)

        img.save(OUT)
        print(f"已写入 {OUT}（{img.size[0]}×{img.size[1]}）")


if __name__ == "__main__":
    main()
