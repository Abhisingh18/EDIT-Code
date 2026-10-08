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
