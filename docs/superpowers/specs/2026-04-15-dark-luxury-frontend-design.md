# Dark Luxury Frontend Design

## Goal

Upgrade the frontend into a dark luxury tarot experience that feels premium, mysterious, and deliberate while keeping motion subtle and GPU cost low.

## Design Intent

The UI should feel like a private occult salon rather than a game landing page. The interface should communicate exclusivity, ritual, and trust through restrained composition, controlled glow, elegant typography, and material contrast.

This redesign should avoid three failure modes:

- empty dark screens that feel unfinished
- noisy mystical decoration that looks cheap
- heavy full-screen animation that hurts performance

## Visual Direction

### Primary Style

Dark luxury with a touch of classical ritual.

### Mood Keywords

- obsidian
- brass
- velvet shadow
- candlelit
- ceremonial
- private salon

### Color System

- Base background: near-black obsidian with deep blue-violet undertones
- Primary accent: muted antique gold, not bright yellow
- Secondary accent: smoky amethyst
- Supporting accent: parchment-ivory for key highlights only
- Text: soft warm gray and muted ivory, never pure white for large surfaces

### Material Language

- tinted glass panels with dark translucency
- fine brass outlines instead of hard bright borders
- soft inner shadows and restrained edge light
- faint radial glows behind focal areas
- subtle grain or atmospheric texture, not obvious noise

## Motion Principles

Motion stays present across all pages, but should feel ambient rather than animated.

### Allowed Motion

- slow ambient glow breathing
- sparse drifting particles
- slight card lift on hover
- light opacity and vertical entrance transitions
- restrained page transition overlays

### Disallowed Motion

- always-on WebGL starfields
- large blur bursts
- aggressive scaling explosions
- dense particle fields
- constant multi-layer competing animations

## Global Layout System

### Global Background

All pages keep a lightweight ambient backdrop made from:

- layered dark gradients
- faint off-center light blooms
- sparse animated dust-like particles

The background should support content, not dominate it. It must never make the main content feel visually absent.

### Navigation Bar

The nav should feel refined and architectural.

- slimmer vertical height
- semi-transparent dark panel
- subtle brass lower border
- more premium logo treatment
- buttons styled as dark-glass chips instead of generic pills

### Typography

The current mystical serif direction can remain, but hierarchy must become more disciplined.

- Hero title: ceremonial and elegant, with tighter control of line breaks
- Supporting body: easier to read, lower contrast, more air
- Labels and metadata: small, spaced, quiet

## Homepage Redesign

### Structure

The homepage should become a composed editorial landing page.

1. Refined navigation
2. Hero section with brand statement
3. Premium tarot entry as the main focal action
4. Secondary product grid for future systems
5. Minimal footer

### Hero Section

The hero should no longer read like a default app landing section.

It should include:

- a stronger central brand statement
- one short supporting line focused on guidance, ritual, and reflection
- a premium primary CTA
- a quieter secondary CTA or secondary route
- one visual focal composition, such as a halo, sigil ring, or framed symbolic emblem

The hero must feel full and intentional even before any user interaction.

### Feature Cards

The cards should shift from flat utility tiles to curated exhibit panels.

- larger spacing between cards
- deeper panel contrast
- more controlled icon styling
- distinct active and inactive states
- unreleased features should look intentionally reserved, not disabled by accident

### Footer

The footer should become lighter and more elegant.

- reduced visual weight
- refined typography
- more breathing room from the bottom edge

## Component-Level Design Changes

### Buttons

Buttons should feel premium and tactile.

- primary buttons: dark gold-glass treatment with depth
- secondary buttons: charcoal glass with soft brass outline
- hover: slight lift, soft edge light, no loud glow sweep

### Cards And Panels

- use softer corner rhythm
- reduce generic rounded-card feel
- emphasize depth with layered shadows
- keep hover movement subtle

### Icons

Emoji should not remain as primary visual anchors on premium surfaces.

Where possible, key homepage iconography should move toward a more unified mystical icon language using the existing icon set or refined symbol treatment.

## Scope Of First Implementation

The first implementation pass should focus on high-impact surfaces only.

### In Scope

- global ambient background styling
- global nav refinement
- homepage hero redesign
- homepage feature card redesign
- homepage CTA redesign
- lighter premium transition styling where needed for coherence

### Out Of Scope For This Pass

- full redesign of tarot reading flows
- full redesign of history pages
- auth page structural rewrite
- new illustration system

## Stability And Performance Constraints

The redesign must preserve the recent performance improvements.

- no return of global WebGL effects
- no large persistent blur overlays
- no heavy animation loops beyond lightweight CSS motion
- maintain instant readability on first paint

## Acceptance Criteria

The redesign is successful when all of the following are true:

- the homepage feels clearly more premium and intentional
- the interface reads as mysterious and upscale rather than playful or unfinished
- every page keeps subtle ambient motion without obvious GPU-heavy effects
- first load no longer feels visually empty or black
- the main CTA and tarot entry feel like a premium focal point
- `npm run build` still succeeds

## Files Likely To Change

- `frontend/src/app/page.tsx`
- `frontend/src/app/layout.tsx`
- `frontend/src/app/globals.css`
- `frontend/src/components/effects/AmbientBackground.tsx`
- `frontend/src/components/effects/PageTransition.tsx`
- `frontend/src/components/ui/button.tsx`
- shared UI components used by homepage cards and sections

## Notes

This design intentionally prefers restraint over spectacle. The target is a premium occult product aesthetic, not a fantasy game interface and not a neon AI dashboard.
