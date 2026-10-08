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
