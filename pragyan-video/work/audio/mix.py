"""Final mix + master.

voice (processed, -16 LUFS each)  ->  dialogue bus
music bed + drums                  ->  section automation x speech-keyed ducking (+ spectral dip under speech)
sfx stem (rendered by Remotion)    ->  ducked under speech, peaks tamed
master: gentle bus compression -> -16 LUFS integrated -> 4x oversampled limiter (true peak <= -1 dBTP)
"""
import json, re, subprocess, sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import resample_poly

SR = 48000
A = "work/audio/"
DUR = 5340 / 30  # 178.0 s
N = int(round(DUR * SR))
OFF = {"bhawna": 270 / 30, "shreya": 1338 / 30, "arjun": 2856 / 30}  # scene starts (s)


def run(args):
    subprocess.run(["ffmpeg", "-v", "error", "-y"] + args, check=True)


def loud(path):
    o = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af", "ebur128=peak=true:framelog=quiet", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", o)[-1]), float(re.findall(r"Peak:\s+(-?[\d.]+)", o)[-1])


def load(path, stereo=True):
    sr, x = wavfile.read(path)
    x = x.astype(np.float32)
    if np.abs(x).max() > 4:
        x /= 32768.0
    if sr != SR:
        x = resample_poly(x, SR, sr, axis=0).astype(np.float32)
    if x.ndim == 1 and stereo:
        x = np.stack([x, x], 1)
    return x


def place(buf, x, t0):
    i = int(round(t0 * SR))
    n = min(len(x), len(buf) - i)
    buf[i:i + n] += x[:n]


# ---------- dialogue bus ----------
voice = np.zeros((N, 2), np.float32)
for who, t0 in OFF.items():
    place(voice, load(A + f"voice_{who}.wav"), t0)

# ---------- speech activity from word timings (what is actually said, not energy) ----------
words = json.load(open("src/data/words.json", encoding="utf-8"))
CR = 200  # control rate (Hz)
nc = int(DUR * CR) + 1
act = np.zeros(nc, np.float32)
for who, t0 in OFF.items():
    ws = words[who]
    spans = [[t0 + w["s"] - 0.12, t0 + w["e"] + 0.20] for w in ws]
    merged = []
    for s, e in spans:  # bridge short gaps so the bed doesn't pump between words
        if merged and s - merged[-1][1] < 0.6:
            merged[-1][1] = max(merged[-1][1], e)
        else:
            merged.append([s, e])
    for s, e in merged:
        act[max(0, int(s * CR)):min(nc, int(e * CR))] = 1.0
# smooth: quick duck (120 ms), slow recovery (550 ms) -> sidechain-style, no pumping
env = np.zeros_like(act)
a_att, a_rel = 1 - np.exp(-1 / (0.12 * CR)), 1 - np.exp(-1 / (0.55 * CR))
v = 0.0
for i, x in enumerate(act):
    v += (x - v) * (a_att if x > v else a_rel)
    env[i] = v
tc = np.arange(nc) / CR
ts = np.arange(N) / SR
duck = np.interp(ts, tc, env).astype(np.float32)[:, None]

# ---------- music: section levels (pause level during dialogue; ducking does the rest) ----------
BED = [(0, 0), (0.4, 0), (1.67, 0.42), (7.2, 0.46), (8.73, 0.34), (9.7, 0.2),
