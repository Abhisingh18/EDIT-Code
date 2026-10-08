"""Voice post-production: DeepFilterNet3 (done) -> match EQ -> de-ess -> gentle comp -> slow leveling -> -16 LUFS."""
import json, re, subprocess, numpy as np
from scipy.io import wavfile
A = "work/audio/"
C = [100, 160, 250, 400, 630, 1000, 1600, 2500, 4000, 6300, 10000]
TARGET = [-2, 3, 5, 4, 2, 0, -2, -4, -6.5, -10, -15]  # speech LTASS-like studio target (dB re 1 kHz)
MEAS = {
    "bhawna": [-19.3, -10.3, 8.6, 2.8, 1.4, 0, -5.3, -9.8, -22.3, -32.9, -31.8],
    "shreya": [-22.2, -5.0, 12.4, 5.2, 6.9, 0, -6.5, -7.5, -9.5, -15.9, -27.6],
    "arjun": [-4.2, 10.4, 13.3, 16.9, 10.3, 0, 1.1, -6.3, -14.0, -22.8, -53.2],
}
from scipy.signal import welch
D = json.load(open("work/transcripts.json", encoding="utf-8"))
def ltas(path, n):
    sr, x = wavfile.read(path); x = x.astype(np.float64)
    if np.max(np.abs(x)) > 4: x = x / 32768
    sp = np.concatenate([x[int(w["s"] * sr):int(w["e"] * sr)] for w in D[n]["words"]])  # speech only
    f, P = welch(sp, sr, nperseg=4096)
    v = []
    for c in C:
        m = (f >= c / 2 ** (1 / 3)) & (f < c * 2 ** (1 / 3)); v.append(10 * np.log10(P[m].mean() + 1e-20))
    v = np.array(v); return v - v[C.index(1000)]
def eq_str(g): return ",".join(f"equalizer=f={c}:t=o:w=1:g={x:.1f}" for c, x in zip(C, g) if abs(x) >= 0.8)
def loud(path):
    o = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af", "ebur128=framelog=quiet", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", o)[-1])
def run(args): subprocess.run(["ffmpeg", "-v", "error", "-y"] + args, check=True)

