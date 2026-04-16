# Frontend Performance And Stability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce global GPU load while keeping subtle motion on every page and fixing the streaming reading page request lifecycle.

**Architecture:** Replace the current always-on WebGL background stack with a single lightweight ambient background component that uses restrained CSS-only motion. Simplify the full-screen transition overlay so it preserves the mystical visual language without large blur and scale effects, then make the reading page fetch logic react to real parameter changes without duplicate requests.

**Tech Stack:** Next.js App Router, React 18, TypeScript, Framer Motion, Tailwind CSS

---

### Task 1: Replace Global Heavy Background Effects

**Files:**
- Create: `frontend/src/components/effects/AmbientBackground.tsx`
- Modify: `frontend/src/app/layout.tsx`

- [ ] Add a single shared background component that renders low-count ambient glows and particles with CSS-only animation.
- [ ] Remove `WebGLStarfield` and `CSSParticles` from the global layout.
- [ ] Mount the new ambient background in the layout so all pages retain subtle motion.

### Task 2: Reduce Transition Cost

**Files:**
- Modify: `frontend/src/components/effects/PageTransition.tsx`

- [ ] Keep the existing transition API and names.
- [ ] Replace the most expensive blur, huge scale, and layered effects with lighter opacity, translate, and restrained glow animations.
- [ ] Preserve visual differentiation between transition types without full-screen heavy compositing.

### Task 3: Fix Reading Page Fetch Lifecycle

**Files:**
- Modify: `frontend/src/app/tarot/reading/[sessionId]/page.tsx`

- [ ] Make the effect depend on `sessionId`, `isReady`, and `question`.
- [ ] Prevent duplicate requests in Strict Mode by caching the last request key instead of omitting dependencies.
- [ ] Reset loading and completion state correctly when the request key changes.

### Task 4: Verify Build

**Files:**
- Modify: none

- [ ] Run `npm run build` in `frontend/`.
- [ ] Confirm the app builds successfully and note any non-blocking warnings that remain.
