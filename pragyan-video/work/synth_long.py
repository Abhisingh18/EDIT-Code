import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt
from scipy.io import wavfile
SR = 44100
rng = np.random.default_rng(7)
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def save(name, x):
    x = np.asarray(x)
    if x.ndim == 1: x = np.stack([x, x], 1)
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.89
    wavfile.write(f"public/sfx/{name}.wav", SR, (x * 32767).astype(np.int16))
def lp(x, f, o=2): return sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)
def bp(x, lo, hi): return sosfilt(butter(2, [lo, hi], "band", fs=SR, output="sos"), x)
def reverb(x, secs=2.8, mix=0.35):
    n = int(secs * SR); t = np.arange(n) / SR
    irL = rng.standard_normal(n) * np.exp(-t * 3.2 / secs * 2.3); irR = rng.standard_normal(n) * np.exp(-t * 3.2 / secs * 2.3)
    irL = lp(irL, 6000); irR = lp(irR, 6000)
    wl = fftconvolve(x, irL)[: len(x)]; wr = fftconvolve(x, irR)[: len(x)]
    wl /= np.max(np.abs(wl)) + 1e-9; wr /= np.max(np.abs(wr)) + 1e-9
    d = x / (np.max(np.abs(x)) + 1e-9)
    return np.stack([d * (1 - mix) + wl * mix, d * (1 - mix) + wr * mix], 1)

BPM = 100; BEAT = 60 / BPM; BAR = BEAT * 4
DUR = 412.0; N = int(DUR * SR); t = np.arange(N) / SR
prog = [([62, 65, 69, 74], 38), ([58, 62, 65, 70], 34), ([60, 65, 69, 72], 41), ([60, 64, 67, 72], 36)]
CH = BAR * 4  # 9.6s per chord

# ---- pad + bass + arp (the bed) ----
