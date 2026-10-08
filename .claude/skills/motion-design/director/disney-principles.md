# Disney's 12 Principles — UI Adapted

## 1. Squash and Stretch

- Squash: scale ~[1.2, 0.8]; Stretch: ~[0.85, 1.15]
- Impact: 2-4 frames (30-65ms); Recovery: 4-8 frames (65-130ms)
- Preserve volume: width +20% → height decreases proportionally
- Skip for premium/luxury brands

## 2. Anticipation

- Small motion opposite to main direction before action
- Duration: 100-200ms, magnitude: 10-20% of main action
- Button: scale down 3% before expanding; Card: shift 5-10px away first
- Skip for micro-feedback (<150ms)

## 3. Staging

- Dim non-hero elements to 40-60% opacity; optional 2-4px blur
- Hero enters 100-200ms after supporting elements
- One primary action per timing beat

## 4. Straight Ahead vs. Pose to Pose

| Approach | Feel | Best For |
|----------|------|----------|
| Straight Ahead | Fluid, spontaneous | Particles, ambient, generative art |
| Pose to Pose | Planned, controlled | UI transitions, state changes |

## 5. Follow Through and Overlapping Action

- Child delay: 50-150ms behind parent
- Trailing elements: offset stop times by 100-200ms
- Use spring easing for trailing parts (lower stiffness = more trailing)

## 6. Slow In and Slow Out

| Context | Easing | Why |
|---------|--------|-----|
| Entrance | ease-out | Arrives smoothly |
| Exit | ease-in | Departs quickly |
| On-screen | ease-in-out | Smooth journey |
| Ambient loop | sine ease-in-out | Seamless |

**NEVER** linear for spatial movement. Linear only for: rotation, progress bars, timers.

## 7. Arcs

- Add 10-20px perpendicular offset at path midpoint
- Subtle (5px) for corporate, pronounced (20px+) for playful
- Mechanical UIs can use straight paths intentionally
