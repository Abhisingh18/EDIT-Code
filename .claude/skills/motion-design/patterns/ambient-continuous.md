# Ambient & Continuous Patterns

Ambient amplitude: 10-20% of primary motion. Never compete for attention.

## Breathing / Pulse

- Scale oscillation 0.98-1.02, sine ease-in-out, 2000-4000ms/cycle
- Alt: opacity oscillation 0.7-1.0

| Context | Scale Range | Duration | Opacity Range |
|---------|-----------|----------|--------------|
| Active indicator | 0.95-1.05 | 2000ms | 0.6-1.0 |
| Waiting/idle | 0.98-1.02 | 3000ms | 0.8-1.0 |
| Background element | 0.99-1.01 | 4000ms | 0.9-1.0 |
| CTA attention | 0.97-1.03 | 2500ms | 0.7-1.0 |

Pulsing >±5% scale becomes attention-demanding.

## Floating / Hovering

- Y position ±5-15px, sine ease-in-out, 3000-5000ms/cycle
- Optional: slight rotation ±2-3°, offset 30% of position cycle

**Layered floating** (multiple elements — different durations prevent sync):
- Element 1: 4000ms, ±10px
- Element 2: 5500ms, ±8px (offset 30%)
- Element 3: 3500ms, ±12px (offset 60%)

## Gradient Shift

- Background-position or gradient angle shift
- Duration: 8000-20000ms/cycle; range: ±10-20% position or ±15° angle
- Easing: linear or sine; should be imperceptible at a glance

## Parallax

| Layer | Speed Ratio | Content |
|-------|------------|---------|
| Foreground | 1.0x | Interactive, text |
| Midground | 0.5x | Decorative, cards |
| Background | 0.2x | Patterns, scenery |
| Deep background | 0.1x | Texture, atmospheric |

**Scroll-driven**: total displacement <100px; avoid on mobile; never parallax text
**Mouse-driven**: foreground 10-20px max, background 5-10px opposite direction, 100-200ms interpolation

## Continuous Rotation

- Spinners: linear easing, 1000-2000ms/revolution

| Variant | Speed | Use Case |
|---------|-------|----------|
| Slow spin | 10-30s/rev | Background decoration |
| Gear-like | 3-5s/rev | Technical/mechanical |
