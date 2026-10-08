import json
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
segs, info = m.transcribe("public/arjun2_src.mp4", word_timestamps=True, vad_filter=True, language="en")
words, text = [], []
for s in segs:
    text.append(f"[{s.start:.2f}-{s.end:.2f}] {s.text}")
    for w in s.words: words.append({"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)})
json.dump({"segments": text, "words": words}, open("work/arjun2/transcript.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("\n".join(text))
