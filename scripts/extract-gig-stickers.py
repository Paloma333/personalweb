"""
按面积阈值（默认 area>=3000）抠出所有大尺寸连通分量作为透明 PNG。
位置信息写到文件名里，方便挑选。
"""
from pathlib import Path
from PIL import Image
import numpy as np
from scipy import ndimage

SRC = '/Users/liuyushan/.workbuddy/clipboard-images/clipboard-2026-09-10T08-58-49-015Z-b480156e.jpg'
OUT = Path('/Users/liuyushan/WorkBuddy/个人网站/locker-site/public/assets/gig-stickers')
OUT.mkdir(parents=True, exist_ok=True)
# 清空旧输出
for f in OUT.glob('*.png'):
    f.unlink()

im_rgb = np.array(Image.open(SRC).convert('RGB'))

def is_bg(px):
    return (px[..., 0] > 220) & (px[..., 1] > 220) & (px[..., 2] > 200) & \
           (np.abs(px[..., 0].astype(int) - px[..., 1].astype(int)) < 20) & \
           (np.abs(px[..., 1].astype(int) - px[..., 2].astype(int)) < 20)

mask = ~is_bg(im_rgb)
# 先腐蚀一下，断掉橙色虚线/边框那种细连接
mask = ndimage.binary_erosion(mask, iterations=2)
labels, n = ndimage.label(mask, structure=np.ones((3, 3)))
# 再用原 mask 取原始 bbox（保留完整元素）
slices = ndimage.find_objects(labels)

comps = []
for i, sl in enumerate(slices):
    if sl is None: continue
    area = (labels[sl] == i + 1).sum()
    if area < 3000: continue  # 过滤红圈标记和小字
    y0, y1 = sl[0].start, sl[0].stop
    x0, x1 = sl[1].start, sl[1].stop
    comps.append({'area': area, 'x0': x0, 'y0': y0, 'x1': x1, 'y1': y1})
comps.sort(key=lambda c: -c['area'])

print(f'共 {len(comps)} 个大分量 (area>=3000)')

# 跳过外框（bbox 占满整图）
def is_whole_frame(c, w, h):
    return c['x0'] < 100 and c['x1'] > w - 100 and c['y0'] < 100 and c['y1'] > h - 100

H, W = im_rgb.shape[:2]
for c in comps:
    if is_whole_frame(c, W, H):
        print(f'  skip 外框  bbox=({c["x0"]},{c["y0"]})-({c["x1"]},{c["y1"]})  area={c["area"]}')
        continue
    pad = 10
    y0p = max(0, c['y0'] - pad); y1p = min(H, c['y1'] + pad)
    x0p = max(0, c['x0'] - pad); x1p = min(W, c['x1'] + pad)
    crop = Image.fromarray(im_rgb[y0p:y1p, x0p:x1p]).convert('RGBA')
    arr = np.array(crop)
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    bg = (r > 220) & (g > 220) & (b > 200) & \
         (np.abs(r.astype(int) - g.astype(int)) < 20) & \
         (np.abs(g.astype(int) - b.astype(int)) < 20)
    # 红色 marker pin（亮红圆 + 白数字）——按色相干掉。
    # 采样：r均值222 g均值105 b均值64，和奶油底（r≈g≈b）差很远
    red_pin = (r > 170) & ((r - g) > 60) & ((r - b) > 80)
    fg = ~(bg | red_pin)
    arr[..., 3] = np.where(fg, 255, 0)
    # 裁掉全透明的边
    ys, xs = np.where(arr[..., 3] > 0)
    if len(ys) == 0: continue
    arr = arr[ys.min():ys.max()+1, xs.min():xs.max()+1]
    # 文件名带位置信息（cx,cy）
    name = f'cx{c["x0"]+((c["x1"]-c["x0"])//2):04d}-cy{c["y0"]+((c["y1"]-c["y0"])//2):04d}.png'
    Image.fromarray(arr).save(OUT / name, optimize=True)
    print(f'  bbox=({c["x0"]:4d},{c["y0"]:4d})-({c["x1"]:4d},{c["y1"]:4d})  size={c["x1"]-c["x0"]+2*pad}×{c["y1"]-c["y0"]+2*pad}  →  {name}')

print(f'\n→ {OUT}')