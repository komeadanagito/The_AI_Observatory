# Dark Luxury Frontend Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage and shared visual shell into a premium dark-luxury tarot experience with restrained motion and lower visual noise.

**Architecture:** Keep the existing Next.js app structure and business logic intact, but upgrade the visual system through shared styling, a refined ambient background, a higher-end homepage layout, and more premium button/card treatments. Avoid global heavy animation and preserve the recent performance work by relying on layered gradients, material styling, and small motion only where it helps focus.

**Tech Stack:** Next.js App Router, React 18, TypeScript, Tailwind CSS, Framer Motion

---

### Task 1: Upgrade Shared Visual Tokens

**Files:**
- Modify: `frontend/src/app/globals.css`

- [ ] Define a tighter dark-luxury palette in `:root`, keeping obsidian backgrounds, antique brass accents, smoky amethyst, and warm ivory text.
- [ ] Add reusable utility classes for premium panels, brass borders, subtle glow, muted metadata text, and restrained hover states.
- [ ] Reduce any generic neon or overly loud glow treatment in shared CSS so the page reads as upscale instead of game-like.

### Task 2: Refine Global Ambient Shell

**Files:**
- Modify: `frontend/src/components/effects/AmbientBackground.tsx`
- Modify: `frontend/src/components/effects/PageTransition.tsx`
- Modify: `frontend/src/app/layout.tsx`

- [ ] Update `AmbientBackground` so it feels richer and more intentional: fewer random dots, more atmospheric depth, softer off-axis light, and a clearer premium backdrop.
- [ ] Keep motion subtle and low-cost: slow glow breathing and sparse drifting particles only.
- [ ] Refine `PageTransition` so it aligns with the new luxury style and stays restrained, using opacity, symbol, and halo rather than spectacle.
- [ ] Keep the layout composition stable so content remains readable on first paint.

### Task 3: Redesign Homepage Structure

**Files:**
- Modify: `frontend/src/app/page.tsx`

- [ ] Replace the current generic hero with a more editorial composition that gives the page a clear focal point.
- [ ] Rework the nav to feel slimmer and more premium without changing routes or auth behavior.
- [ ] Introduce a stronger hero statement, a tighter supporting paragraph, and a more premium CTA group.
- [ ] Add a right-side or central ceremonial visual composition using existing icons and layout, not new heavy media.

### Task 4: Restyle Feature Surfaces

**Files:**
- Modify: `frontend/src/app/page.tsx`
- Modify: `frontend/src/components/ui/button.tsx`
- Modify: `frontend/src/components/ui/card.tsx`

- [ ] Restyle homepage feature cards into curated showcase panels with darker glass, brass edge treatment, and clearer active/inactive hierarchy.
- [ ] Replace emoji-led emphasis on key homepage surfaces where practical with more coherent iconography or restrained symbol treatment.
- [ ] Upgrade primary and secondary button treatments so they feel tactile and premium while staying readable.

### Task 5: Verify Visual Refresh

**Files:**
- Modify: none

- [ ] Run `npm run build` in `frontend/`.
- [ ] Check that the homepage still renders content immediately, without the earlier false-black-screen behavior.
- [ ] Note any remaining non-blocking warnings separately instead of expanding scope during implementation.
