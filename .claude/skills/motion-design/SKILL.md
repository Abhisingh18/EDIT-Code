---
name: motion-design
description: >
  Applies motion design principles to create emotionally-driven, technically sound animations and transitions.
  Provides timing, easing, choreography, and Disney animation principles adapted for UI.
  Use when creating animations, transitions, micro-interactions, loading states, page transitions,
  scroll-triggered effects, or any motion work. Works with CSS, Framer Motion, GSAP, Lottie, Spring,
  or any animation system.
license: MIT
metadata:
  author: LottieFiles
  version: "1.0.0"
---

# Motion Design Skill

## When to Apply

Use this skill when:
- Creating UI animations (buttons, cards, modals, page transitions)
- Designing micro-interactions and feedback animations
- Building loading, success, or error states
- Animating illustrations or decorative elements
- Planning scroll-triggered or progress-based animations
- Establishing brand motion identity
- Choreographing multi-element sequences

**Decision tree:**
1. Does it serve a functional purpose (feedback, guidance)? → Timing rules for responsiveness
2. Does it express brand personality? → Motion Personality archetypes
3. Does it tell a story or guide attention? → Disney principles + choreography
4. Is this a complex multi-element scene? → 1/3 Rule + stagger patterns

---

## Quick Reference: 8-Step Checklist

Before creating any animation:

1. **Emotional target?** — joy, calm, urgency, elegance
2. **Motion Personality?** — Playful, Premium, Corporate, Energetic
3. **Primary property?** — position, scale, rotation, opacity
4. **Duration?** — see duration table below
5. **Easing family?** — entrance=decelerate, exit=accelerate
6. **Hero element?** — apply staging principles
7. **Secondary + ambient layers?** — add richness
8. **1/3 rules?** — motion distance, simultaneous elements

---

## Three Pillars (CRITICAL)

Every animation must satisfy three pillars before any technical decisions:

| Pillar | Question | Drives |
|--------|----------|--------|
| **Emotional Intent** | What should the viewer FEEL? | Easing, timing, amplitude |
| **Visual Narrative** | What's the micro-story? | Setup → Action → Resolution |
| **Motion Craft** | How do we make it believable? | Physics, secondary motion, paths |

**Three motion layers** (flat animation = missing layers):
- **Primary**: Main action the viewer follows
- **Secondary**: Supporting richness (shadows, icons shifting)
- **Ambient**: Background life (gradients, subtle pulses)

> Deep dive: [director/core-philosophy.md](director/core-philosophy.md)

---

## Motion Personality

Select ONE archetype per project. Apply consistently.

| Archetype | Duration | Easing | Overshoot | Keywords |
|-----------|----------|--------|-----------|----------|
| **Playful** | 150-300ms | ease-out-back | 10-20% | fun, whimsical, bouncy, cute |
| **Premium** | 350-600ms | cubic-bezier(0.4,0,0.2,1) | 0% | elegant, minimal, luxury, sophisticated |
| **Corporate** | 200-400ms | cubic-bezier(0.2,0,0,1) | 0-3% | clean, professional, business, dashboard |
| **Energetic** | 100-250ms | ease-out-expo | 15-30% | dynamic, energetic, bold, exciting |

**Default**: Corporate for UI, Playful for illustrations.

**Brand Motion Identity** — define three constants:
1. **Signature easing**: One curve for 80% of animations
2. **Duration palette**: 3 durations (quick / standard / slow)
3. **Entrance pattern**: One consistent entry style

> Deep dive: [director/motion-personality.md](director/motion-personality.md)

---

## Property Selection

| Effect Goal | Primary Property | Secondary Properties |
|-------------|------------------|---------------------|
| Entrance/Exit | position | opacity, scale |
| Emphasis/Attention | scale | rotation (subtle), opacity pulse |
| State Change | opacity, color | scale (press feedback) |
| Direction/Flow | position | rotation (follow path) |
| Depth/3D Feel | scale + shadow | position (parallax) |
| Loading/Progress | rotation (spinner) | scale, opacity pulse |
| Success | scale (pop) | color, rotation (checkmark draw) |
| Error/Alert | position (shake) | color, rotation (wobble) |

**Simplicity threshold**: Use the minimum properties needed. One = direct. Two = polished. Three+ = potentially overwhelming.

> Deep dive: [reference/property-selection.md](reference/property-selection.md)

---

## Duration Table

| Element Type | Duration | Rationale |
|-------------|----------|-----------|
| Tooltip / micro-feedback | 80-120ms | Must feel instant |
| Button press / toggle | 120-180ms | Responsive feedback |
| Icon transition | 150-250ms | Clear state change |
| Card enter / exit | 200-350ms | Spatial awareness |
| Modal / dialog | 300-400ms | Focus shift |
| Page transition | 400-600ms | Context switch |
| Dramatic reveal | 600-1200ms | Theatrical build |

**Distance scales duration**: 100px = base. 200px = 1.3x. 400px = 1.6x.

**Enter > Exit**: Entrances 30-50% longer than exits. Users care about what appears.

**Interactive feedback**:
- Hover: <100ms
- Press: <150ms
- Release/settle: 200-300ms
- Error shake: 300-400ms (2-3 oscillations)

> Deep dive: [reference/timing-easing-tables.md](reference/timing-easing-tables.md)

---

## Easing Selection

**Directional rules**:
- **Entrance** → decelerate (fast start, gentle landing): ease-out family
- **Exit** → accelerate (gentle start, fast departure): ease-in family
- **On-screen** → smooth both ends: ease-in-out family
- **Looping ambient** → seamless: sine-based ease-in-out

**Industry standards**:

| Standard | Cubic Bezier | Use For |
|----------|-------------|---------|
| Material Design 3 | (0.2, 0, 0, 1) | Default on-screen |
| MD3 Emphasized | (0.05, 0.7, 0.1, 1) | Entrances, attention |
| MD3 Accelerate | (0.3, 0, 1, 1) | Exits, dismissals |
| Apple HIG | (0.25, 0.1, 0.25, 1) | Standard iOS |
| Snappy UI | (0.2, 0, 0, 1) | Fast, decisive |
| Gentle float | (0.4, 0, 0.2, 1) | Ambient, background |
| Bounce settle | (0.175, 0.885, 0.32, 1.275) | Overshoot, playful |

**Material-based easing**:

