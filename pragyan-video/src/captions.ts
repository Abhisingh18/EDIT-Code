import raw from "./data/words.json";
import { FPS } from "./lib";

type W = { w: string; s: number; e: number };
type Speaker = "bhawna" | "shreya" | "arjun";
const data = raw as Record<Speaker, W[]>;

// whisper mis-hearings -> what was actually said
const PRE: Record<Speaker, Record<string, string>> = {
  bhawna: { "competences.": "compliance.", document: "documents" },
  shreya: { meet: "-weight", Our: "A", your: "to a", an: "a" },
  arjun: { "field.": "failed." },
};
const POST: Record<string, string> = {
  "ProGaN.": "Pragyan.",
  ProGaN: "Pragyan",
  "Pryagyan.": "Pragyan.",
  Pryagyan: "Pragyan",
  "agent-to-care": "agentic AI",
  "interconnection.": "intervention.",
  "organizations'": "organization's",
};

export const words = (who: Speaker): W[] => {
  const out: W[] = [];
  for (const t of data[who]) {
    const w = PRE[who][t.w] ?? t.w;
    if (w.startsWith("-") && out.length) {
      const last = out[out.length - 1];
      last.w += w;
      last.e = t.e;
    } else out.push({ ...t, w });
  }
  return out.map((t) => ({ ...t, w: POST[t.w] ?? t.w }));
};

const norm = (s: string) => s.toLowerCase().replace(/^-/, "").replace(/[^a-z0-9']/g, "");

// frame (relative to clip start) of the n-th occurrence of a spoken word
export const at = (who: Speaker, word: string, n = 0): number => {
  let c = 0;
  for (const t of data[who]) {
    if (norm(t.w) === norm(word)) {
      if (c === n) return Math.round(t.s * FPS);
      c++;
    }
  }
  throw new Error(`word not found: ${who}/${word}#${n}`);
};

export type Page = { start: number; end: number; items: { text: string; s: number; e: number }[] };

export const pages = (who: Speaker, fromSec = 0, toSec = Infinity, maxWords = 4): Page[] => {
