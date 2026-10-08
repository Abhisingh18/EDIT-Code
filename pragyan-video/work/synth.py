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
DUR = 182.0; N = int(DUR * SR); t = np.arange(N) / SR
prog = [([62, 65, 69, 74], 38), ([58, 62, 65, 70], 34), ([60, 65, 69, 72], 41), ([60, 64, 67, 72], 36)]
CH = BAR * 4  # 9.6s per chord

# ---- pad + bass + arp (the bed) ----
pad = np.zeros(N); bass = np.zeros(N); arp = np.zeros(N)
nch = int(np.ceil(DUR / CH))
for c in range(nch):
    notes, root = prog[c % 4]
    s0 = int(c * CH * SR); s1 = min(N, int((c + 1) * CH * SR) + int(1.5 * SR))
    tt = np.arange(s1 - s0) / SR
    env = np.minimum(1, tt / 2.2) * np.clip((CH + 1.5 - tt) / 1.8, 0, 1)
    for m in notes:
        f = mtof(m)
        for det in (-0.07, 0.0, 0.07):
            ff = f * 2 ** (det / 12)
            pad[s0:s1] += env * sum(np.sin(2 * np.pi * ff * k * tt + k) / k ** 1.4 for k in range(1, 7)) * 0.12
    # sub bass pulses per beat
    for b in range(16):
        bs = s0 + int(b * BEAT * SR); be = min(N, bs + int(BEAT * SR))
        if bs >= N: break
        bt = np.arange(be - bs) / SR
        bass[bs:be] += np.sin(2 * np.pi * mtof(root) * bt) * np.exp(-bt * 2.2) * np.minimum(1, bt / 0.01) * 0.8
    # 8th-note arp
    seq = [notes[0] + 12, notes[2] + 12, notes[1] + 12, notes[3] + 12, notes[2] + 12, notes[1] + 12, notes[3] + 12, notes[2] + 12]
    for e in range(32):
        es = s0 + int(e * BEAT / 2 * SR); ee = min(N, es + int(0.5 * SR))
        if es >= N: break
        et = np.arange(ee - es) / SR; f = mtof(seq[e % 8])
        arp[es:ee] += (np.sin(2 * np.pi * f * et) + 0.3 * np.sin(4 * np.pi * f * et)) * np.exp(-et * 9) * np.minimum(1, et / 0.004) * 0.35
pad = lp(pad, 1800)
# slow filter-ish swell
pad *= 0.75 + 0.25 * np.sin(2 * np.pi * t / (CH * 2))
arp = lp(arp, 4000)
# ping-pong delay for arp
dl = int(BEAT * 0.75 * SR); arpL = arp.copy(); arpR = np.zeros(N)
arpR[dl:] += arp[:-dl] * 0.5; arpL[2 * dl:] += arp[:-2 * dl] * 0.3
bed_dry = np.stack([pad + arpL * 0.6, pad + arpR * 0.6], 1)
wet = reverb(pad + arp * 0.5, 3.5, 0.45)
bed = bed_dry / np.max(np.abs(bed_dry)) * 0.6 + wet * 0.5
bed[:, 0] += lp(bass, 200) * 0.45; bed[:, 1] += lp(bass, 200) * 0.45
fade = np.minimum(1, t / 1.0) * np.clip((DUR - t) / 3, 0, 1)
bed *= fade[:, None]
save("music_bed", bed)

# ---- drums (kick + hat + clap), separate stem ----
dr = np.zeros(N)
nb = int(DUR / BEAT)
for b in range(nb):
    s = int(b * BEAT * SR); e = min(N, s + int(0.45 * SR)); kt = np.arange(e - s) / SR
    ph = 2 * np.pi * np.cumsum(45 + 90 * np.exp(-kt * 28)) / SR
    dr[s:e] += np.sin(ph) * np.exp(-kt * 7) * 0.9
    hs = int((b + 0.5) * BEAT * SR); he = min(N, hs + int(0.07 * SR))
