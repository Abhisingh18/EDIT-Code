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
