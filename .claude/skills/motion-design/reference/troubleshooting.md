# Troubleshooting

## Looks Robotic
- Linear easing → use ease-out (entrance) or ease-in-out
- Straight paths → add 10-20px arc at midpoint
- Uniform timing → stagger 50-100ms between elements
- Everything synced → offset start/stop 50-150ms
- No secondary → add shadow, icon reaction, ambient

## Feels Too Slow
- Duration exceeds type budget → check duration table
- ease-in-out when ease-out works → ease-out feels faster
- Too much anticipation → reduce to 10% or remove
- Stagger exceeded → total <500ms
- Overshoot settle too long → increase damping

## Feels Too Fast / Jarring
- Duration below minimum → modals 300ms+, pages 400ms+
- No easing → add ease-out minimum
- Missing resolution → add 50-100ms settle
- No anticipation on large motion → add 100-200ms wind-up

## Feels Cheap / Flat
- Only primary motion → add secondary + ambient
- Opacity-only → combine with position or scale
- Same easing everywhere → vary primary vs secondary
- No follow-through → child elements trail 50-150ms
- No overshoot → add 3-10%

## Too Distracting
- Too many moving → 1/3 rule
- Amplitude too large → reduce to minimum
- Competing heroes → one per moment, dim rest
- Ambient too prominent → 10-20% amplitude, slower
- No breathing room → 100-200ms pause between beats

## No Personality
