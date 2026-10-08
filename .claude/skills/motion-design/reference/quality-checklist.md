# Quality Checklist

## Visual Quality
- [ ] Elements >40px for motion, >100px for detail
- [ ] Readable at full speed without slow-motion
- [ ] Clear primary, secondary, ambient layers
- [ ] Counter-motion for balance where needed
- [ ] Natural arcs (unless intentionally mechanical)
- [ ] 1/3 rule (distance): no unbroken motion >1/3 container
- [ ] 1/3 rule (density): max 1/3 elements active simultaneously

## Technical Quality
- [ ] No linear easing on spatial movement
- [ ] Duration matches element type table
- [ ] Ease-out entrances, ease-in exits
- [ ] Duration proportional to distance
- [ ] Entrance duration >= exit duration
- [ ] Not opacity-only for important state changes
- [ ] Stagger total <500ms
- [ ] Follow-through: child elements offset 50-150ms

## Emotional Quality
- [ ] Target emotion identified before properties
- [ ] Personality archetype matches brand
- [ ] Setup → action → resolution structure
- [ ] Intensity matches interaction importance
- [ ] Consistent: same interaction = same motion
- [ ] Appropriate on 100th viewing

## Performance Quality
- [ ] Primary motion uses transform + opacity
- [ ] <20 animated elements per viewport
- [ ] No layout-triggering properties animated
- [ ] Elements staggered, not simultaneous
