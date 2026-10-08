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
