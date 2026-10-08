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
for a, b in CARDS:  # stinger swells over Arjun's chapter cards
    BED += [(A0 + a - 0.25, 0.2), (A0 + a, 0.4), (A0 + b - 0.2, 0.4), (A0 + b + 0.15, 0.2)]
    DRUMS += [(A0 + a - 0.25, 0.14), (A0 + a, 0.55), (A0 + b - 0.2, 0.55), (A0 + b + 0.15, 0.14)]
e0, e1 = CH["endCard"]
BED += [(A0 + e0 - 0.3, 0.2), (A0 + e0, 0.45), (OUT0, 0.55)]
DRUMS += [(A0 + e0 - 0.3, 0.14), (A0 + e0, 0.6), (OUT0 - 0.1, 0.6), (OUT0, 0.7)]
BED += [(t + SHIFT, v) for t, v in [(166.2, 0.55), (166.6, 0.5), (172.15, 0.5), (172.2, 0.0), (172.78, 0.0), (172.82, 0.52), (176.3, 0.45), (178.0, 0.0)]]
DRUMS += [(t + SHIFT, v) for t, v in [(166.0, 0.7), (166.4, 0), (178.0, 0)]]
def auto(keys):
    k = np.array(keys, np.float64)
    return np.interp(ts, k[:, 0], k[:, 1]).astype(np.float32)[:, None]

bed = load("public/sfx/music_bed_long.wav")[:N]
drums = load("public/sfx/music_drums_long.wav")[:N]
# spectral duck: a copy of the bed with the speech band carved out, crossfaded in while people talk
run(["-i", "public/sfx/music_bed_long.wav", "-af", "equalizer=f=2500:t=o:w=1.6:g=-6,equalizer=f=1000:t=o:w=1:g=-3,equalizer=f=250:t=o:w=1:g=-2",
     "-c:a", "pcm_f32le", A + "bed_dip.wav"])
bed_dip = load(A + "bed_dip.wav")[:N]
DUCK_DEPTH = 0.5  # -6 dB more under speech (dialogue: ~18 dB below voice; pauses: ~12 dB)
music = (bed * (1 - duck) + bed_dip * duck) * auto(BED) * (1 - (1 - DUCK_DEPTH) * duck)
music += drums * auto(DRUMS) * (1 - 0.6 * duck)

# ---------- sfx stem ----------
old = load("out/stem_sfx.wav")
sfx = np.zeros((N, 2), np.float32)
k = int(round(A0 * SR)); fade = np.linspace(1, 0, int(0.05 * SR), dtype=np.float32)[:, None]
head = old[:k].copy(); head[-len(fade):] *= fade
sfx[:k] += head
for cue in json.load(open("src/data/arjun2_sfx.json")):
    place(sfx, load(f"public/sfx/{cue['name']}.wav") * cue["vol"], A0 + cue["t"])
o0 = int(round(153.0 * SR))
place(sfx, old[o0:], OUT0)
sfx *= (1 - 0.4 * duck)  # impacts never sit on top of words
# tame stray transients on the effects bus (smooth limiter, not per-sample clipping)
wavfile.write(A + "sfx_duck.wav", SR, sfx.astype(np.float32))
run(["-i", A + "sfx_duck.wav", "-af", "alimiter=limit=0.5:attack=5:release=80:level=disabled", "-c:a", "pcm_f32le", A + "sfx_lim.wav"])
sfx = load(A + "sfx_lim.wav")[:N]

mix = voice + music + sfx
wavfile.write(A + "premaster.wav", SR, mix.astype(np.float32))

# ---------- master ----------
run(["-i", A + "premaster.wav", "-af",
     "highpass=f=28:p=2,acompressor=threshold=-15dB:ratio=1.6:attack=25:release=250:knee=6:makeup=1dB",
     "-c:a", "pcm_f32le", A + "bus.wav"])
I, _ = loud(A + "bus.wav")
g = -16.0 - I
run(["-i", A + "bus.wav", "-af",
     f"volume={g:.2f}dB,aresample=192000,alimiter=limit=0.84:attack=2:release=60:level=disabled,aresample=48000",
     "-c:a", "pcm_f32le", A + "master.wav"])
I2, TP = loud(A + "master.wav")
print(f"master: {I2} LUFS integrated, true peak {TP} dBTP (gain {g:+.2f} dB)")

# stems report: music-under-voice separation
def seg_loud(x, a, b):
    y = x[int(a * SR):int(b * SR)]
    wavfile.write(A + "_seg.wav", SR, y.astype(np.float32))
    return loud(A + "_seg.wav")[0]
for name, (a, b) in {"Bhavna": (12, 43), "Shreya (reveal)": (44.6, 52), "Shreya": (52, 93), "Arjun ch.1-6": (96, 215), "Arjun ch.7-12": (215, 380)}.items():
    print(f"{name:16s} voice {seg_loud(voice, a, b):6.1f} LUFS | music {seg_loud(music, a, b):6.1f} LUFS | sfx {seg_loud(sfx, a, b):6.1f} LUFS")
