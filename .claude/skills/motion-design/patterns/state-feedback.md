# State & Feedback Patterns

## Button Press

### Playful
- Press: scale 0.95 (60ms, ease-out); Release: overshoot 1.05 (80ms); Settle: 1.0 (120ms, spring)
- Secondary: shadow shrinks/grows; color darkens/brightens. Total ~260ms

### Premium
- Press: scale 0.98 (80ms); Release: 1.0 (150ms, no overshoot)
- Opacity dims to 90% on press. Total ~230ms

### Corporate
- Press: scale 0.97 (60ms); Release: 1.0 (100ms); overshoot 0-2%
- Background darkens 10%. Total ~160ms

## Hover States

| Element | Effect | Duration |
|---------|--------|----------|
| Button | Scale 1.02-1.05 | <100ms |
| Card | Scale 1.01-1.02 + shadow lift | <100ms |
| Link | Color change + underline | <100ms |
| Icon | Scale 1.1 + rotation 2-5° | <100ms |
