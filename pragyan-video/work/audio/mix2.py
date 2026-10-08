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
DUR = 12216 / 30  # 407.2 s (v3: Arjun's new 4:47 walkthrough)
N = int(round(DUR * SR))
OFF = {"bhawna": 270 / 30, "shreya": 1338 / 30, "arjun2": 2856 / 30}  # scene starts (s)
OUT0 = 11466 / 30  # outro start (s)
SHIFT = OUT0 - 4590 / 30  # old outro -> new outro


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
words["arjun2"] = json.load(open("work/arjun2/transcript.json", encoding="utf-8"))["words"]
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
A0 = OFF["arjun2"]
CH = json.load(open("src/data/arjun2_chapters.json"))
CARDS = [c["card"] for c in CH["chapters"] if c["card"]]
BED = [(0, 0), (0.4, 0), (1.67, 0.42), (7.2, 0.46), (8.73, 0.34), (9.7, 0.2),
       (43.0, 0.2), (43.9, 0.0), (46.7, 0.0), (46.85, 0.2),
       (93.4, 0.2), (93.9, 0.4), (95.0, 0.4), (95.9, 0.2)]
DRUMS = [(0, 0), (4.67, 0), (4.8, 0.62), (7.13, 0.62), (7.8, 0.3), (8.73, 0),
         (93.87, 0), (94.0, 0.55), (95.07, 0.55), (95.4, 0.14)]
