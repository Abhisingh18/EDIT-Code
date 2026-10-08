# Motion Patterns — Component Library

Working implementations. Import `theme` from the project's `src/theme.ts`.
All components assume `useCurrentFrame()` / `useVideoConfig()` from remotion.

## Contents
1. Premium entrance (the workhorse)
2. Staggered children
3. Word-by-word text reveal
4. Background mesh (never flat backgrounds)
5. Color grade overlay
6. Procedural grain (no asset file)
7. Vignette
8. Ken Burns for stills
9. Animated counter
10. Spark / radial logo mark
11. Exits
12. Idle breathing
13. Parallax depth
14. Transitions (library + hand-rolled)
15. Motion blur
16. Audio + SFX sync
17. Word-synced captions over footage

---

## 1. Premium entrance (fade + rise + scale)
```tsx
const Entrance: React.FC<{delay?: number; children: React.ReactNode}> =
({ delay = 0, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: theme.spring.smooth });
  return (
    <div style={{
      opacity: p,
      transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px)
                  scale(${interpolate(p, [0, 1], [0.94, 1])})`,
    }}>{children}</div>
  );
};
```
For bezier instead of spring (controlled slides):
```tsx
const x = interpolate(frame, [0, 25], [60, 0], {
  easing: theme.ease.out,
  extrapolateLeft: "clamp", extrapolateRight: "clamp", // ALWAYS both
});
```

## 2. Staggered children
```tsx
{items.map((item, i) => <Entrance key={i} delay={start + i * 4}>{item}</Entrance>)}
```
3–6 frame offsets. Words: 3. Cards/list items: 4–5. Big blocks: 6.

## 3. Word-by-word text reveal
```tsx
const WordReveal: React.FC<{text: string; delay?: number; per?: number;
  style?: React.CSSProperties}> = ({ text, delay = 0, per = 3, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.26em", ...style }}>
      {text.split(" ").map((word, i) => {
        const p = spring({ frame: frame - delay - i * per, fps,
          config: theme.spring.snappy });
        return (
          <span key={i} style={{
            display: "inline-block", opacity: p,
            transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px)`,
          }}>{word}</span>
        );
      })}
    </div>
  );
};
```
GOTCHA: when placing two big text blocks side by side in a flex row, use a
pixel `gap` (e.g. `gap: 42`), NOT em — em resolves against the parent's font
size (usually 16px), producing near-zero gaps next to 150px type.

## 4. Background mesh
```tsx
const BgMesh: React.FC = () => {
  const frame = useCurrentFrame();
  const d1 = Math.sin(frame / 55) * 50, d2 = Math.cos(frame / 70) * 40;
  return (
    <AbsoluteFill style={{ background: theme.colors.bg }}>
      <div style={{ position: "absolute", width: 1200, height: 1200,
        borderRadius: "50%", top: -450, left: -300 + d1, filter: "blur(50px)",
        background: `radial-gradient(circle, ${theme.colors.primary}33, transparent 62%)` }}/>
      <div style={{ position: "absolute", width: 900, height: 900,
        borderRadius: "50%", bottom: -400, right: -250 - d2, filter: "blur(70px)",
        background: `radial-gradient(circle, ${theme.colors.accent}22, transparent 65%)` }}/>
    </AbsoluteFill>
  );
};
```

## 5. Color grade overlay (renders ABOVE all content, below grain)
Unifies mismatched assets (AI stills + B-roll + screenshots) into one look.
```tsx
const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ backgroundColor: theme.colors.primary,
      mixBlendMode: "soft-light", opacity: 0.18 }}/>
    <AbsoluteFill style={{ background:
      "linear-gradient(180deg, rgba(0,0,0,0.10), transparent 28%, transparent 72%, rgba(0,0,0,0.2))" }}/>
  </AbsoluteFill>
);
```
Opacity 0.10–0.15 for light themes, 0.18–0.25 for dark. Per-asset correction
when one clip still sticks out: `filter: "saturate(1.1) contrast(1.08)"`.

## 6. Procedural grain — zero asset files
```tsx
const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;
  return <AbsoluteFill style={{ pointerEvents: "none",
    backgroundImage: noise, backgroundSize: "220px",
    backgroundPosition: `${(frame * 7) % 220}px ${(frame * 13) % 220}px`, // film flicker
    opacity: 0.05, mixBlendMode: "multiply" }}/>; // "overlay" on dark themes
};
```

## 7. Vignette (topmost layer)
```tsx
const Vignette: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", background:
    "radial-gradient(ellipse at center, transparent 56%, rgba(0,0,0,0.22) 100%)" }}/>
);
```

## 8. Ken Burns — every still, no exceptions
```tsx
const KenBurns: React.FC<{src: string; zoomTo?: number}> = ({ src, zoomTo = 1.1 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [1, zoomTo],
    { easing: theme.ease.inOut });
  const pan = interpolate(frame, [0, durationInFrames], [0, -25]);
  return <Img src={staticFile(src)} style={{ width: "100%", height: "100%",
    objectFit: "cover", transform: `scale(${scale}) translateX(${pan}px)` }}/>;
};
```
Alternate zoom-in/zoom-out between consecutive shots. Mask into rounded cards:
`borderRadius: 32, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)",
boxShadow: "0 40px 80px -20px rgba(0,0,0,0.6)"`.

## 9. Animated counter
```tsx
const value = interpolate(
