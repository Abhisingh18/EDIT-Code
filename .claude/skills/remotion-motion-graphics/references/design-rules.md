# Design Rules — Color, Type, Pacing, Sound, Checklist

## Color system
One dark (or light) base + ONE hero color + one accent + neutrals. 60/30/10:
60% base, 30% secondary surfaces, 10% hero. The hero color appears on AT MOST
one element per frame — it directs the eye.

Proven palettes (adapt to user's brand if they have one):
- Dark tech: base #0A0A0F, hero #7C3AED, accent #22D3EE, text #F4F4F5
- Warm editorial (Claude-like): base #FAF7F2, hero #D97757, ink #1F1E1B
- Warm premium: base #1A120B, hero #E8A33D, accent #F4E9DA
- Clean light: base #F7F5F2, ink #1A1A1A + one saturated accent

Glow on the hero element only:
`boxShadow: 0 0 60px ${hero}66, 0 0 120px ${hero}33` (text: textShadow).
More than one glowing element per frame = Vegas. Don't.

## Typography
- Hero text: display face (Clash Display, Cabinet Grotesk, General Sans, Satoshi —
  free on Fontshare; or a Google variable font via @remotion/google-fonts).
  Weight 600–800, letterSpacing -0.03em, lineHeight 1.05.
- Reels hero size: 80–140px at 1080 wide. Landscape: 100–160px at 1920.
- Body/captions: a clean sans (Inter/system) at 400–500, dimmed color.
- Highlight ONE word per headline: hero color, animated underline, or a pill
  scaling in behind it 5 frames after the word lands.
- Numbers: animated counters with tabular-nums (see motion-patterns §9).

## Scene architecture
