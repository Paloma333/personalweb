"""
按**位置/尺寸**匹配连通分量（不靠 ID，ID 每次跑会重排）。
"""
from pathlib import Path
from PIL import Image
import numpy as np
from scipy import ndimage

SRC = '/Users/liuyushan/.workbuddy/clipboard-images/clipboard-2026-09-10T08-58-49-015Z-b480156e.jpg'
OUT = Path('/Users/liuyushan/WorkBuddy/个人网站/locker-site/public/assets/gig-stickers')
OUT.mkdir(parents=True, exist_ok=True)

im_rgb = np.array(Image.open(SRC).convert('RGB'))

def is_bg(px):
    return (px[..., 0] > 220) & (px[..., 1] > 220) & (px[..., 2] > 200) & \
           (np.abs(px[..., 0].astype(int) - px[..., 1].astype(int)) < 20) & \
           (np.abs(px[..., 1].astype(int) - px[..., 2].astype(int)) < 20)

mask = ~is_bg(im_rgb)
labels, n = ndimage.label(mask, structure=np.ones((3, 3)))
slices = ndimage.find_objects(labels)

comps = []
for i, sl in enumerate(slices):
    if sl is None: continue
    area = (labels[sl] == i + 1).sum()
    if area < 500: continue  # 过滤红圈标记/小字
    y0, y1 = sl[0].start, sl[0].stop
    x0, x1 = sl[1].start, sl[1].stop
    comps.append({'area': area, 'x0': x0, 'y0': y0, 'x1': x1, 'y1': y1, 'cx': (x0+x1)//2, 'cy': (y0+y1)//2})
comps.sort(key=lambda c: -c['area'])

# 输出每个分量，按位置帮我目视匹配
print(f'共 {len(comps)} 个分量（area>=500）')
for c in comps[:60]:
    print(f'  bbox=({c["x0"]:4d},{c["y0"]:4d})-({c["x1"]:4d},{c["y1"]:4d})  w×h={c["x1"]-c["x0"]:4d}×{c["y1"]-c["y0"]:3d}  center=({c["cx"]:4d},{c["cy"]:4d})  area={c["area"]}')