import json, numpy as np
from scipy.io import wavfile
from scipy.signal import welch
d = json.load(open("work/transcripts.json", encoding="utf-8"))
C = [100, 160, 250, 400, 630, 1000, 1600, 2500, 4000, 6300, 10000]
def band_db(f, p, c):
    lo, hi = c / 2 ** (1 / 3), c * 2 ** (1 / 3)
    m = (f >= lo) & (f < hi)
    return 10 * np.log10(np.mean(p[m]) + 1e-20)
out = {}
for n in ["bhawna", "shreya", "arjun"]:
    sr, x = wavfile.read(f"work/audio/df_{n}.wav"); x = x.astype(np.float64) / 32768
    sp = np.concatenate([x[int(w["s"] * sr):int(w["e"] * sr)] for w in d[n]["words"]])
    f, p = welch(sp, sr, nperseg=4096)
    v = np.array([band_db(f, p, c) for c in C]); v -= v[C.index(1000)]
    out[n] = v
    print(f"{n:7s}", " ".join(f"{c}:{x:+5.1f}" for c, x in zip(C, v)))
mean = np.mean([out[n] for n in out], axis=0)
# studio target = speaker average with a touch of warmth/presence/air and less mud
shape = np.array([0, +0.5, +1.0, -0.8, -0.5, 0, +0.5, +1.5, +1.8, +0.8, +1.0])
target = mean + shape
eq = {}
for n in out:
    g = np.clip(target - out[n], -4.5, 4.5)
    g[np.abs(g) < 0.8] = 0
    eq[n] = [round(float(x), 1) for x in g]
    print("EQ", n, eq[n])
json.dump({"centers": C, "eq": eq}, open("work/audio/eq.json", "w"))
