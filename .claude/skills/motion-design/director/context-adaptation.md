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

