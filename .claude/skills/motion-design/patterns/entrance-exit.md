# Entrance & Exit Patterns

## Entrance Strategies

### 1. Direct Entrance (Slide In)
- Position + opacity; offset 20-40px + opacity 0 → final position + opacity 1
- Easing: ease-out; duration 200-350ms

| Personality | Offset | Easing | Overshoot |
|------------|--------|--------|-----------|
| Playful | 30-50px | ease-out-back | 10-15% |
| Premium | 15-25px | (0.4, 0, 0.2, 1) | 0% |
| Corporate | 20-30px | (0.2, 0, 0, 1) | 0-3% |
| Energetic | 40-80px | ease-out-expo | 15-25% |

Direction: below=arrival, right=forward, left=back, above=dropdown/authority.

### 2. Emergent Entrance (Scale In)
- Scale + opacity; start 85-95% + opacity 0 → 100% + opacity 1
- Duration 250-400ms

| Personality | Start Scale | Easing | Overshoot |
|------------|------------|--------|-----------|
| Playful | 70-80% | ease-out-back | 10-20% |
| Premium | 95-98% | (0.4, 0, 0.2, 1) | 0% |
| Corporate | 90-95% | (0.2, 0, 0, 1) | 0-3% |
| Energetic | 50-70% | ease-out-expo | 15-30% |

Best for: modals, dialogs, notifications, popovers, tooltips.

### 3. Reveal Entrance (Clip/Mask)
- clip-path or mask + opacity; 300-500ms, ease-out
- Directions: top-to-bottom (dramatic), L-to-R (reading order), center-out (focus), edge-in (contained)

### 4. Assembled Entrance (Multi-Part)
- Parts arrive from different positions; stagger 50-100ms; total 300-600ms
- Best for: icon assembly, logo builds, data viz construction

## Exit Strategies

**Rule**: Exits = 65-75% of entrance duration.

### 1. Direct Exit (Slide Out)
- Offset 20-40px + opacity 0; ease-in; 150-250ms

### 2. Dissolve Exit (Fade Out)
- Opacity (+ optional scale to 98%); ease-in; 150-250ms
- Best for: gentle departures, backgrounding, crossfades

### 3. Collapse Exit (Shrink Out)
- Scale 85-95% + opacity 0; ease-in; 150-250ms
- Best for: deletion, closing modals, dismissal

### 4. Transfer Exit (Move Away)
- Position toward destination + scale shrink; ease-in-out; 250-400ms
