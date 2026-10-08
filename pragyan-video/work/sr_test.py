import cv2, time, numpy as np
# dnn_superres is shadowed by the non-contrib cv2 build, so run the TF graphs directly
# (same preprocessing as OpenCV's DnnSuperResImpl: network on Y channel, CrCb bicubic)
def make(path):
    net = cv2.dnn.readNetFromTensorflow(path)
    def up(img):
        ycc = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
        y = ycc[:, :, 0].astype(np.float32) / 255.0
        net.setInput(cv2.dnn.blobFromImage(y))
        out = net.forward()
        y2 = np.clip(out[0, 0] * 255.0, 0, 255).astype(np.uint8)
        H, W = y2.shape
        cc = cv2.resize(ycc, (W, H), interpolation=cv2.INTER_CUBIC)
        cc[:, :, 0] = y2
        return cv2.cvtColor(cc, cv2.COLOR_YCrCb2BGR)
    return up
for name, path in [("fsrcnn","FSRCNN_x2.pb"),("espcn","ESPCN_x2.pb"),("lapsrn","LapSRN_x2.pb")]:
    try:
        up = make("work/models/"+path)
    except Exception as e:
        print(name, "load failed", e); continue
    for img in ["sh_in","ar_in"]:
        im = cv2.imread(f"work/q/{img}.png")
        try:
            t=time.time(); out = up(im); dt=time.time()-t
            cv2.imwrite(f"work/q/{img}_{name}.png", out); print(name, img, out.shape, f"{dt*1000:.0f} ms")
        except Exception as e:
            print(name, img, "failed", str(e)[:120])
for img in ["sh_in","ar_in"]:
    im = cv2.imread(f"work/q/{img}.png")
    cv2.imwrite(f"work/q/{img}_lanczos.png", cv2.resize(im, None, fx=2, fy=2, interpolation=cv2.INTER_LANCZOS4))
