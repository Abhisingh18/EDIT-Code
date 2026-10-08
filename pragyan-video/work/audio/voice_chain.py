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

for n in ["bhawna", "shreya", "arjun"]:
    src = A + f"df_{n}.wav"
    m0 = ltas(src, n)
    dead = m0 < -45                                   # band-limited source: never lift hiss
    g = np.zeros(len(C))
    for it in range(3):                               # measure -> correct residual -> repeat
        tmp = A + f"eqtest_{n}.wav"
        run(["-i", src, "-af", "highpass=f=75:p=2," + (eq_str(g) or "anull"), "-c:a", "pcm_f32le", tmp])
        r = np.array(TARGET) - ltas(tmp, n)
        g = g + 0.85 * r
        g = np.clip(g, -7.0, 7.0); g[dead] = 0.0
        g[:2] = np.minimum(g[:2], 3.0)                 # warmth below 160 Hz, never boom
    g = 0.8 * g                                       # keep 20% of each voice's own character
    res = np.array(TARGET) - ltas(tmp, n)
    pre = -23.0 - loud(src)
    chain = (f"volume={pre:.2f}dB,highpass=f=75:p=2,{eq_str(g)},deesser=i=0.35:m=0.5:f=0.4:s=o,"
             "acompressor=threshold=-27dB:ratio=2.0:attack=10:release=180:knee=6:makeup=3dB,"
             "dynaudnorm=f=400:g=21:p=0.9:m=4:r=0.13:b=1")
    run(["-i", src, "-af", chain, "-ar", "48000", "-c:a", "pcm_f32le", A + f"chain_{n}.wav"])
    gain = -16.0 - loud(A + f"chain_{n}.wav")
    run(["-i", A + f"chain_{n}.wav", "-af", f"volume={gain:.2f}dB,alimiter=limit=0.84:attack=3:release=50:level=disabled",
         "-c:a", "pcm_f32le", A + f"lev_{n}.wav"])
    print(n, "EQ", [round(float(x), 1) for x in g], "| residual mean", round(float(np.mean(np.abs(res[~dead]))), 1), "dB ->",
          loud(A + f"lev_{n}.wav"), "LUFS", flush=True)

# Shreya: identical jump cuts to the picture (cuts sit in pauses), 25 ms fades
d = json.load(open("work/transcripts.json", encoding="utf-8"))
