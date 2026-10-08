import json, subprocess
d = json.load(open("work/transcripts.json", encoding="utf-8"))
P = "public/"
def run(args): subprocess.run(["ffmpeg","-v","error","-y"]+args, check=True)

AUD = "highpass=f=80,afftdn=nf=-25,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,loudnorm=I=-16:TP=-1.5:LRA=9"
# logo from 4K frame
run(["-ss","5","-i",P+"bhawna_src.mp4","-frames:v","1","-vf","crop=530:470:3212:80",P+"logo.png"])
# Bhawna: downscale 4K -> 1080p
run(["-i",P+"bhawna_src.mp4","-vf","scale=1920:1080:flags=lanczos,fps=30","-af",AUD,
     "-c:v","libx264","-crf","16","-preset","medium","-pix_fmt","yuv420p","-c:a","aac","-b:a","192k",P+"bhawna.mp4"])
# Arjun: upscale with lanczos + light sharpen
run(["-i",P+"arjun_src.mp4","-vf","scale=1696:960:flags=lanczos,unsharp=5:5:0.6,fps=30","-af",AUD,
     "-c:v","libx264","-crf","16","-preset","medium","-pix_fmt","yuv420p","-c:a","aac","-b:a","192k",P+"arjun.mp4"])

# Shreya: jump cuts from word timings (gaps > 0.45s shrink to ~0.22s)
w = d["shreya"]["words"]; dur = 53.18
segs = []; start = max(0, w[0]["s"]-0.12)
for a, b in zip(w, w[1:]):
    if b["s"] - a["e"] > 0.45:
        segs.append((start, a["e"]+0.11)); start = b["s"]-0.11
segs.append((start, min(dur, w[-1]["e"]+0.5)))
# remap words
