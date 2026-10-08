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
