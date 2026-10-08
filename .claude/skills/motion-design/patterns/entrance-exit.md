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

