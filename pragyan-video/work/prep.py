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
def remap(t):
    acc = 0
    for s,e in segs:
        if t < s: return acc
        if t <= e: return acc + t - s
        acc += e - s
    return acc
newwords = [{"w":x["w"],"s":round(remap(x["s"]),3),"e":round(remap(x["e"]),3)} for x in w]
vf = ",".join([])
parts=[]; labels=""
for i,(s,e) in enumerate(segs):
    parts.append(f"[0:v]trim={s:.3f}:{e:.3f},setpts=PTS-STARTPTS[v{i}];[0:a]atrim={s:.3f}:{e:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={e-s-0.03:.3f}:d=0.03[a{i}]")
    labels += f"[v{i}][a{i}]"
fc = ";".join(parts) + f";{labels}concat=n={len(segs)}:v=1:a=1[cv][ca];" \
     "[cv]fps=30,crop=480:684:0:180,scale=960:1368:flags=lanczos,eq=contrast=1.07:brightness=0.025:saturation=1.1:gamma=1.03,colorbalance=rs=-0.03:bs=0.03,unsharp=5:5:0.7[vo];" \
     f"[ca]{AUD}[ao]"
run(["-i",P+"shreya_src.mp4","-filter_complex",fc,"-map","[vo]","-map","[ao]",
     "-c:v","libx264","-crf","16","-preset","medium","-pix_fmt","yuv420p","-c:a","aac","-b:a","192k",P+"shreya.mp4"])
total = sum(e-s for s,e in segs)
print("shreya segs", len(segs), "new dur", round(total,2))
d["shreya"]["words"] = newwords
json.dump({k:v["words"] for k,v in d.items()}, open("work/words.json","w",encoding="utf-8"), ensure_ascii=False)
