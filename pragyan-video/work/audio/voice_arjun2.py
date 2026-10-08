"""Same voice chain as voice_chain.py, for Arjun's new walkthrough (arjun2)."""
import json, re, subprocess, numpy as np
from scipy.io import wavfile
from scipy.signal import welch
A = "work/audio/"
C = [100, 160, 250, 400, 630, 1000, 1600, 2500, 4000, 6300, 10000]
TARGET = [-2, 3, 5, 4, 2, 0, -2, -4, -6.5, -10, -15]
W = json.load(open("work/arjun2/transcript.json", encoding="utf-8"))["words"]
def ltas(path):
    sr, x = wavfile.read(path); x = x.astype(np.float64)
    if np.max(np.abs(x)) > 4: x = x / 32768
    sp = np.concatenate([x[int(w["s"] * sr):int(w["e"] * sr)] for w in W])
    f, P = welch(sp, sr, nperseg=4096)
    v = np.array([10 * np.log10(P[(f >= c / 2 ** (1 / 3)) & (f < c * 2 ** (1 / 3))].mean() + 1e-20) for c in C])
    return v - v[C.index(1000)]
def eq_str(g): return ",".join(f"equalizer=f={c}:t=o:w=1:g={x:.1f}" for c, x in zip(C, g) if abs(x) >= 0.8)
def loud(path):
    o = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af", "ebur128=peak=true:framelog=quiet", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", o)[-1]), re.findall(r"Peak:\s+(-?[\d.]+)", o)[-1], re.findall(r"LRA:\s+([\d.]+)", o)[-1]
def run(args): subprocess.run(["ffmpeg", "-v", "error", "-y"] + args, check=True)
