# Context Adaptation

## Platform Scaling

| Platform | Duration Modifier | Complexity | Physics |
|----------|------------------|------------|---------|
| Desktop | 1.0x (baseline) | Full | All types |
| Tablet | 0.9x | Standard | Most types |
| Mobile | 0.8x | Reduced (1-2 properties) | Snappy only |
| Watch | 0.6x | Minimal (1 property) | None |
| TV/Kiosk | 1.3x | Full | All types |

**Mobile rules**: prefer opacity + transform; touch feedback <100ms; reduce stagger budgets by 30%; avoid parallax
**Desktop opportunities**: hover states, cursor tracking, multi-column stagger, spatial choreography

## Accessibility

### prefers-reduced-motion

| Original Motion | Reduced Alternative |
|----------------|-------------------|
| Slide entrance | Opacity fade only |
| Bounce/spring | Instant or simple ease-out |
| Parallax | Static positioning |
| Auto-playing | Paused, user-initiated |
| Complex choreography | Single fade |
| Continuous ambient | Static or subtle opacity pulse |

Reduced motion means: remove spatial movement, keep opacity, remove spring easing, reduce duration 50%+, never auto-play loops.

### Vestibular Triggers (avoid or provide alternatives)
- Large-scale zoom, full-screen position transitions
- Spinning elements >100px, parallax >2 layers, rapid direction changes

### Cognitive Accessibility
- Same interaction = same animation every time
- Pause controls for animations >5 seconds
- Don't convey critical info through motion alone

## Performance Budgets

| Tier | Properties | Max Elements |
|------|-----------|-------------|
| Optimal | transform, opacity | Unlimited (GPU) |
| Good | + color, clip-path | 10-15 |
| Acceptable | + width, height, margin | 5-8 |
| Avoid | box-shadow, border-radius, filter | 1-3 |

- Target 60fps (16.67ms/frame); animation logic <10ms/frame
- will-change sparingly; keep animated elements <20 per viewport
- Stagger reduces peak load vs simultaneous
- Fallback: 30fps acceptable for ambient

## Content Type Adaptation

| Content Type | Personality | Duration | Motion Density |
