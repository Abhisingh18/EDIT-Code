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

src = A + "df_arjun2.wav"
m0 = ltas(src); dead = m0 < -45
print("LTAS:", " ".join(f"{c}:{x:+.1f}" for c, x in zip(C, m0)))
g = np.zeros(len(C))
for it in range(3):
    run(["-i", src, "-af", "highpass=f=75:p=2," + (eq_str(g) or "anull"), "-c:a", "pcm_f32le", A + "eqtest_arjun2.wav"])
    g = np.clip(g + 0.85 * (np.array(TARGET) - ltas(A + "eqtest_arjun2.wav")), -7, 7); g[dead] = 0; g[:2] = np.minimum(g[:2], 3)
g = 0.8 * g
pre = -23.0 - loud(src)[0]
chain = (f"volume={pre:.2f}dB,highpass=f=75:p=2,{eq_str(g)},deesser=i=0.35:m=0.5:f=0.4:s=o,"
         "acompressor=threshold=-27dB:ratio=2.0:attack=10:release=180:knee=6:makeup=3dB,dynaudnorm=f=400:g=21:p=0.9:m=4:r=0.13:b=1")
run(["-i", src, "-af", chain, "-ar", "48000", "-c:a", "pcm_f32le", A + "chain_arjun2.wav"])
gain = -16.0 - loud(A + "chain_arjun2.wav")[0]
run(["-i", A + "chain_arjun2.wav", "-af", f"volume={gain:.2f}dB,alimiter=limit=0.84:attack=3:release=50:level=disabled", "-c:a", "pcm_f32le", A + "voice_arjun2.wav"])
print("EQ", [round(float(x), 1) for x in g], "->", loud(A + "voice_arjun2.wav"))
sr, x = wavfile.read(A + "voice_arjun2.wav"); hop = sr // 30; nfr = len(x) // hop
db = 20 * np.log10(np.sqrt(np.mean(x[: nfr * hop].reshape(nfr, hop) ** 2, axis=1)) + 1e-9)
env = json.load(open("src/data/voice_env.json")); env["arjun2"] = [round(float(v), 3) for v in np.clip((db + 48) / 36, 0, 1)]
json.dump(env, open("src/data/voice_env.json", "w")); print("env frames", nfr)
