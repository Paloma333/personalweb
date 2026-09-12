"""
从素材贴纸图（吉他 / 架子鼓×2 / 键盘 / 麦克风）里抠出 5 张透明 PNG。

难点：整张图的背景 (#fdfcf3) 和贴纸自带的白色模切边颜色几乎一致
（都是 253,252,243 附近），没法按颜色区分背景和贴纸边。

做法：
  1. 按"离背景色的距离"提取图案本体
  2. 框内 binary_closing 把贴纸白边那圈空心环和本体并起来
  3. binary_fill_holes 补掉图案内部浅色区（鼓面、键盘面板）
  4. mask 膨胀 BORDER px —— **重新造出**贴纸的白色模切边，填纯白
     （奶油色面板上，纯白边会让贴纸有"贴上去"的层次）

分组不靠连通分量（吉他和鼓离得近，闭合核一开就并成一块），
直接手填 5 个框更可控。
"""
from pathlib import Path
from PIL import Image
import numpy as np
from scipy import ndimage

SRC = '/Users/liuyushan/WorkBuddy/个人网站/素材/01-贴纸-透明底/Screenshot 2026-08-30 at 18.24.14.png'
OUT = Path('/Users/liuyushan/WorkBuddy/个人网站/locker-site/public/assets/rock-stickers')
OUT.mkdir(parents=True, exist_ok=True)
for f in OUT.glob('*.png'):
    f.unlink()

# 手填框 (x0, y0, x1, y1)，按源图 460×1060
BOXES = [
    ('01', 'guitar', (14,  12, 200, 415)),   # 电吉他
    ('02', 'drums-a', (200, 12, 452, 392)),  # 架子鼓（带镲片）
    ('03', 'drums-b', (96, 450, 448, 692)),  # 架子鼓（另一角度）
    ('04', 'keys',    (44, 710, 306, 1036)), # 键盘 / 合成器
    ('05', 'mic',     (298, 742, 442, 1066)),# 麦克风
]

im = Image.open(SRC).convert('RGB')
a = np.array(im).astype(int)
BG = np.array([253, 252, 243])
SQ = np.ones((3, 3))
BORDER = 8

for no, name, (x0, y0, x1, y1) in BOXES:
    sub = a[y0:y1, x0:x1]
    dist = np.abs(sub - BG).max(axis=2)
    m = dist > 12
    # 贴纸白边是空心环，闭合一下和本体并起来
    m = ndimage.binary_closing(m, structure=SQ, iterations=4)
    m = ndimage.binary_fill_holes(m)
    # 只保留最大的一块，丢掉框角带进来的邻居碎片
    lab, n = ndimage.label(m, structure=SQ)
    if n > 1:
        sizes = ndimage.sum(m, lab, range(1, n + 1))
        m = lab == (int(np.argmax(sizes)) + 1)
    art = m.copy()
    # 膨胀出白色模切边
    m = ndimage.binary_dilation(m, structure=SQ, iterations=BORDER)
    ys, xs = np.where(m)
    # 注意：下面都按**框内**坐标裁，sub / m / art 是同一坐标系
    by0, by1 = max(0, ys.min() - 1), min(m.shape[0], ys.max() + 2)
    bx0, bx1 = max(0, xs.min() - 1), min(m.shape[1], xs.max() + 2)
    rgb = sub[by0:by1, bx0:bx1].astype(np.uint8)
    mm = m[by0:by1, bx0:bx1]
    aa = art[by0:by1, bx0:bx1]

    rgba = np.dstack([rgb, (mm * 255).astype(np.uint8)])
    halo = mm & ~aa                       # 模切边那一圈 → 纯白
    rgba[halo] = [255, 255, 255, 255]
    rgba[..., 3] = np.clip(ndimage.gaussian_filter(rgba[..., 3].astype(float), 0.6), 0, 255).astype(np.uint8)

    img = Image.fromarray(rgba, 'RGBA')
    img.save(OUT / f'{name}.png', optimize=True)
    print(f'  {name:9s} {(x0,y0,x1,y1)} → {name}.png  {img.width}×{img.height}')

print(f'\n→ {OUT}')
