import json, sys
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
out = {}
for n in ["bhawna","shreya","arjun"]:
    segs, info = m.transcribe(f"E:/EDIT/pragyan-video/public/{n}_src.mp4", word_timestamps=True, vad_filter=True)
    words=[]; text=[]
    for s in segs:
        text.append(f"[{s.start:.2f}-{s.end:.2f}] {s.text}")
        for w in s.words: words.append({"w":w.word.strip(),"s":round(w.start,2),"e":round(w.end,2)})
    out[n]={"lang":info.language,"segments":text,"words":words}
    print(n, info.language, flush=True)
json.dump(out, open("E:/EDIT/pragyan-video/work/transcripts.json","w",encoding="utf-8"), ensure_ascii=False, indent=1)
print("done")
