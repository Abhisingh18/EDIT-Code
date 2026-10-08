"""Quality pass for the speaker footage (v2). Same cuts/timing/audio as prep.py, better picture."""
import json, subprocess
P = "public/"
def run(args): subprocess.run(["ffmpeg", "-v", "error", "-y"] + args, check=True)
AUD = "highpass=f=80,afftdn=nf=-25,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,loudnorm=I=-16:TP=-1.5:LRA=9"
ENC = ["-c:v", "libx264", "-crf", "15", "-preset", "slow", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k"]

# Bhawna: 4K crop (drops the corner logo) -> 1080p, light temporal denoise, CAS + clarity, warm skin grade
BH = ("crop=3200:1800:0:360,scale=1920:1080:flags=lanczos,hqdn3d=1.2:1.2:4:4,cas=strength=0.75,"
      "unsharp=11:11:0.38:11:11:0,eq=contrast=1.08:saturation=1.03:gamma=1.03,"
      "colorbalance=rm=0.025:gm=-0.03:rs=0.01:gs=-0.025,vibrance=intensity=0.12,fps=30")
run(["-i", P + "bhawna_src.mp4", "-vf", BH, "-af", AUD] + ENC + [P + "bhawna.mp4"])
print("bhawna done", flush=True)

# Arjun: screen recording -> 2x lanczos + CAS keeps UI text crisp
AR = "scale=1696:960:flags=lanczos,cas=strength=0.6,eq=contrast=1.03,fps=30"
run(["-i", P + "arjun_src.mp4", "-vf", AR, "-af", AUD] + ENC + [P + "arjun.mp4"])
print("arjun done", flush=True)

# Shreya: identical jump cuts, then crop -> nlmeans -> 2x -> CAS + clarity -> neutral WB -> face vignette
d = json.load(open("work/transcripts.json", encoding="utf-8"))
w = d["shreya"]["words"]; dur = 53.18
segs = []; start = max(0, w[0]["s"] - 0.12)
for a, b in zip(w, w[1:]):
    if b["s"] - a["e"] > 0.45:
        segs.append((start, a["e"] + 0.11)); start = b["s"] - 0.11
segs.append((start, min(dur, w[-1]["e"] + 0.5)))
parts = []; labels = ""
for i, (s, e) in enumerate(segs):
    parts.append(f"[0:v]trim={s:.3f}:{e:.3f},setpts=PTS-STARTPTS[v{i}];[0:a]atrim={s:.3f}:{e:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={e-s-0.03:.3f}:d=0.03[a{i}]")
    labels += f"[v{i}][a{i}]"
SH = ("fps=30,crop=480:684:0:180,hqdn3d=1.5:1.5:6:6,nlmeans=s=1.8:p=5:r=9,scale=960:1368:flags=lanczos,"
      "cas=strength=0.55,unsharp=9:9:0.32:9:9:0,eq=contrast=1.06:brightness=0.02:saturation=1.04:gamma=1.05,"
      "colortemperature=temperature=7000:mix=0.5,vibrance=intensity=0.10,vignette=angle=PI/5")
fc = ";".join(parts) + f";{labels}concat=n={len(segs)}:v=1:a=1[cv][ca];[cv]{SH}[vo];[ca]{AUD}[ao]"
run(["-i", P + "shreya_src.mp4", "-filter_complex", fc, "-map", "[vo]", "-map", "[ao]"] + ENC + [P + "shreya.mp4"])
print("shreya done", len(segs), "segments", flush=True)
