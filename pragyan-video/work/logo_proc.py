import numpy as np, json
from PIL import Image, ImageFilter
im = np.asarray(Image.open("public/logo.png").convert("RGB")).astype(np.float32) / 255
H, W, _ = im.shape
# color-to-alpha against white (GIMP style)
a = np.max(1 - im, axis=2)
a = np.clip((a - 0.06) / 0.94, 0, 1)
fg = np.where(a[..., None] > 1e-4, (im - (1 - a[..., None])) / np.maximum(a[..., None], 1e-4), 0)
fg = np.clip(fg, 0, 1)
# detect dark navy wordmark in the middle band -> recolor white
lum = im @ np.array([0.299, 0.587, 0.114])
sat = im.max(2) - im.min(2)
yy, xx = np.mgrid[0:H, 0:W]
cx, cy = W * 0.5, H * 0.5
box = (np.abs(xx - cx) < W * 0.33) & (np.abs(yy - cy) < H * 0.14)
text = box & (lum < 0.55) & ~((sat > 0.35) & (lum > 0.3))
tm = Image.fromarray((text * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
tm = np.asarray(tm).astype(np.float32) / 255
white = np.ones_like(fg)
fg = fg * (1 - tm[..., None]) + white * tm[..., None]
a = np.maximum(a, tm * 0.98)
# soften outer tile edge (fade alpha near borders)
edge = np.minimum.reduce([xx, W - 1 - xx, yy, H - 1 - yy]).astype(np.float32)
a *= np.clip(edge / 28, 0, 1)
out = np.dstack([fg, a])
Image.fromarray((out * 255).astype(np.uint8), "RGBA").save("public/logo_dark.png")
# ring only (no text) for particle targets
ring_a = a * (1 - tm)
pts = []
rng = np.random.default_rng(3)
ys, xs = np.where(ring_a > 0.55)
idx = rng.choice(len(xs), size=min(900, len(xs)), replace=False)
for i in idx:
    r, g, b = fg[ys[i], xs[i]]
    pts.append([round(xs[i] / W, 4), round(ys[i] / H, 4), "#%02x%02x%02x" % (int(r * 255), int(g * 255), int(b * 255))])
json.dump({"w": W, "h": H, "pts": pts}, open("src/data/logo_points.json", "w"))
print(W, H, len(pts))
