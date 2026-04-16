# Chinese Fortune Module Design

## Goal

Add a complete authenticated Chinese fortune-reading module that delivers two real divination systems in the first release:

- Bazi
- Ziwei Doushu

The module must provide real chart calculation, structured chart rendering, AI-assisted deep interpretation, and persistent history inside the existing platform.

## Confirmed Product Scope

The first release includes all of the following:

- a unified Chinese fortune entry experience
- full Bazi chart calculation
- full Ziwei Doushu chart calculation
- shared birth-input workflow using Gregorian datetime and gender
- structured chart result pages for both engines
- AI-generated deep interpretation based on calculated chart data
- per-user reading history and detail pages

The first release does not include:

- lunar calendar manual input from the user
- birthplace or true solar time adjustment
- cross-module global history unification with tarot or future systems
- astrology, MBTI, or other metaphysics systems

## Core Product Decision

This feature should be implemented as one new `fortune` domain with a unified workflow and a shared protocol, not as two unrelated modules.

The system should expose one user-facing Chinese fortune product with two engines:

- `bazi`
- `ziwei`

The backend owns engine dispatching, chart standardization, AI interpretation orchestration, session caching, and history persistence.

## User Experience

### Entry Routes

- `/fortune`
- `/fortune/reading/[sessionId]`
- `/fortune/history`
- `/fortune/history/[readingId]`

### User Flow

1. User opens `/fortune`
2. User selects `八字` or `紫微`
3. User enters Gregorian birth datetime, gender, and optional question
4. Frontend submits a chart calculation request
5. Backend calculates a real chart through the selected engine provider
6. Frontend routes to `/fortune/reading/[sessionId]`
7. Result page first renders the structured chart payload
8. Result page then starts AI interpretation streaming
9. If streaming fails, frontend falls back to polling `GET /api/fortune/interpret/result/{session_id}` until completion or timeout
10. When interpretation completes, backend persists the final reading record
11. User can revisit the reading from `/fortune/history`

### Experience Principle

Chart calculation must complete before AI interpretation starts.

This prevents the feature from feeling like free-form AI prose and makes the product credibly chart-driven.

## Backend Design

## New Domain Module

- `backend/src/fortune/`

### Responsibility Split

- `router.py`: API routes
- `schemas.py`: request and response contracts
- `service.py`: orchestration, caching, history persistence, AI invocation
- `models.py`: reading persistence model
- `providers/base.py`: engine provider protocol
- `providers/bazi.py`: Bazi chart calculation and normalization
- `providers/ziwei.py`: Ziwei chart calculation and normalization
- `prompts/`: engine-specific prompt templates and builders

### Main Architectural Rule

Third-party fortune libraries must never leak their native output shape into routes or frontend code.

Each provider must normalize its raw library output into internal standard payloads defined in `schemas.py`.

This keeps the rest of the system stable if a library changes or is replaced.

## Engine Provider Contract

Each provider must implement a shared contract equivalent to:

- validate input constraints for the engine
- calculate a real chart from normalized birth input
- return a standardized chart payload
- return a short structured summary for top-level UI display
- expose any engine-specific metadata required for interpretation

The implementation may use mature third-party libraries, but only if they meet all of the following:

- compatible with Python `3.10`
- acceptable license for repository use
- stable enough to support repeatable chart generation
- supports programmatic access without shelling out to external processes

If no acceptable library exists for an engine during implementation, work should pause and be raised to the user rather than silently downgrading to fake chart logic.

## API Contracts

## Shared Input Contract

All calculation requests use one input model:

- `engine`: `bazi | ziwei`
- `birth_datetime`: ISO datetime string from the frontend
- `gender`: constrained enum
- `question`: optional free-text question, max-length bounded

The backend is responsible for:

- datetime parsing
- future-date rejection
- lower-bound sanity validation
- engine validation
- gender validation

## Calculation Response

`POST /api/fortune/calculate` returns a structured calculation payload, not final interpretation prose.

The response should include:

- `session_id`
- `engine`
- `created_at`
- `birth_profile`
- `chart_summary`
- `chart_payload`

`birth_profile` contains normalized display-safe birth data.

`chart_summary` contains a concise top-level overview for the reading page hero area and the history list summary text.

`chart_payload` contains the full engine-specific structured chart.

## Interpretation Contract

`POST /api/fortune/interpret` uses:

- `session_id`
- optional `question` override

Interpretation generation must only use the standardized calculated chart payload stored for that session.

The AI layer must never interpret directly from raw user input without chart calculation.

## Required Endpoints

- `POST /api/fortune/calculate`
  - calculate chart for the selected engine
  - return `session_id` and structured chart payload

- `POST /api/fortune/interpret`
  - stream deep interpretation based on calculated chart data

- `GET /api/fortune/interpret/result/{session_id}`
  - return fallback interpretation readiness and final content when available

- `GET /api/fortune/history`
  - return paginated reading history for the authenticated user

- `GET /api/fortune/history/{reading_id}`
  - return one persisted reading detail

- `DELETE /api/fortune/history/{reading_id}`
  - delete one reading

- `DELETE /api/fortune/history`
  - delete all fortune readings for the user

## Result Structure

## Shared Outer Result Shape

Both engines should share a stable outer structure so the frontend can render common surfaces consistently:

- `engine`
- `birth_profile`
- `chart_summary`
- `chart_payload`
- `interpretation`
- `disclaimer`
- `created_at`

## Bazi Chart Payload

The Bazi payload must include at least:

- `pillars`
- `day_master`
- `ten_gods`
- `five_elements`
- `luck_cycles`
- `yearly_focus`

The payload should be rich enough to support:

- chart header summary
- four-pillar visualization
- element distribution display
- ten-god relationship summary
- major luck-cycle timeline
- year-focused interpretation snippets

## Ziwei Chart Payload

The Ziwei payload must include at least:

- `palaces`
- `life_palace`
- `body_palace`
- `major_stars`
- `minor_stars`
- `decade_cycles`
- `yearly_focus`

The payload should be rich enough to support:

- palace grid rendering
- main-star summary cards
- life/body palace emphasis
- decade-cycle timeline
- year-focused interpretation snippets

## Persistence Design

## New Database Model

Add a new `FortuneReading` model in `backend/src/fortune/models.py`.

Minimum fields:

- `id`
- `user_id`
- `engine`
- `birth_datetime`
- `gender`
- `question`
- `chart_summary`
- `chart_payload`
- `interpretation`
- `created_at`

`chart_payload` must be stored as structured JSONB.

The stored payload is the source of truth for future detail-page rendering. The system must not recalculate old charts for history pages.

This preserves historical consistency even if provider libraries change later.

## Session Caching

The service layer should maintain short-lived session cache entries keyed by `session_id`.

Cached session data should include:

- calculated chart payload
- normalized birth profile
- engine type
- summary block
- optional completed interpretation
- creation timestamp

This session cache exists to support the reading page and streaming flow before the reading is permanently written to history.

## AI Interpretation Design

## Prompt Sources

AI prompts must be engine-specific.

There should be separate prompt builders or prompt files for:

- Bazi interpretation
- Ziwei interpretation

The prompts must be based on:

- normalized birth profile
- structured chart summary
- structured chart payload
- optional user question

## Interpretation Output Structure

The first release may render interpretation as formatted Markdown text, but the content should follow fixed sections:

- overall destiny overview
- personality and temperament
- career and wealth
- emotional relationships
- stage-based reminders
- entertainment disclaimer

This keeps the output readable and consistent without requiring frontend text parsing.

## Prompt Constraints

The Chinese fortune prompts must explicitly avoid contamination from other modules.

They must not reference:

- tarot cards
- western astrology
- MBTI

The voice should feel reflective, traditional-aware, and grounded rather than theatrical or sensational.

## Frontend Design

## Entry Page

`frontend/src/app/fortune/page.tsx` should be a real module landing page, not a placeholder card.

The page should include:

- top-level product introduction
- engine switcher with `八字` and `紫微`
- shared birth-input form
- optional question input
- engine-specific capability notes
- premium CTA to start calculation

## Reading Page

`frontend/src/app/fortune/reading/[sessionId]/page.tsx` should render in two stages:

1. structured calculated chart
2. AI deep interpretation

The page must support engine-specific rendering while preserving shared layout sections such as:

- reading header
- birth profile summary
- disclaimer surface
- interpretation panel
- retry interpretation action if needed
- links to history and new reading

## History Pages

- `frontend/src/app/fortune/history/page.tsx`
- `frontend/src/app/fortune/history/[readingId]/page.tsx`

The history list should show mixed results from both engines and allow filtering by engine.

Each item should display:

- engine
- normalized birth datetime
- optional question preview
- summary text
- created time

The detail page should render the stored chart payload and stored interpretation, not a recomputed result.

## Frontend State Ownership

The frontend must not perform fortune calculation logic.

Frontend responsibilities are limited to:

- collect and validate user input
- submit requests
- render chart payloads
- render interpretation output
- handle loading, error, retry, and history navigation

## Visual Design Direction

The module should preserve the platform's premium dark identity while clearly separating itself from tarot.

### Visual Language

- deep ink-black base
- bronze-gold and muted teal accents
- palace-grid and chart-disk motifs
- restrained celestial markers and linework
- less western occult symbolism
- calmer motion and more editorial information layout

### Motion Language

Allowed motion:

- chart reveal transitions
- palace highlight fades
- subtle constellation-point activation
- controlled section entrance transitions

Disallowed motion:

- tarot-style card-flip theatrics
- heavy particle storms
- noisy animated backdrops that obscure data readability

## Homepage Integration

The homepage should promote Chinese fortune as a live route rather than an unreleased teaser.

`中式算命` must become a real clickable entry that routes to `/fortune`.

The card should still visually read as distinct from tarot, but it should no longer be marked as unavailable.

## Error Handling

## Validation Errors

Use `400` for:

- unsupported engine
- invalid datetime
- future birth datetime
- impossible or unsupported calculation inputs

## Calculation Failures

Use `422` when the provider cannot produce a valid normalized chart because the input is unsupported or the raw result is structurally incomplete.

Use `500` when:

- provider library throws
- provider output cannot be normalized
- required chart fields are missing after calculation

These errors should be logged in detail on the backend and surfaced to the frontend as stable user-facing messages.

## Interpretation Failures

Interpretation failure must not destroy chart visibility.

Use `502` or `503` for AI interpretation failures depending on whether the failure is upstream response failure or temporary service unavailability.

If AI interpretation fails, the reading page should still show the calculated chart and offer:

- retry interpretation
- return to form
- view history if already persisted

## Testing Strategy

## Backend Tests

Minimum backend coverage should include:

- request schema validation
- provider output normalization
- service orchestration for calculation sessions
- interpretation persistence flow
- history retrieval and deletion

## API Tests

Cover the main paths for:

- `POST /api/fortune/calculate`
- `POST /api/fortune/interpret`
- `GET /api/fortune/interpret/result/{session_id}`
- `GET /api/fortune/history`
- `GET /api/fortune/history/{reading_id}`

## Frontend Tests

Minimum frontend coverage should include:

- fortune form validation and submission
- reading page rendering for `bazi`
- reading page rendering for `ziwei`
- interpretation error fallback state
- history list filter behavior

## Contract Stability Tests

Add contract-style tests for normalized provider outputs.

These tests should assert that the shared outer response shape and required engine-specific payload fields stay stable so frontend rendering does not silently break.

## Acceptance Criteria

The feature is successful when all of the following are true:

- authenticated users can open `/fortune` and start a real Bazi reading
- authenticated users can open `/fortune` and start a real Ziwei reading
- both engines return structured chart payloads before AI interpretation starts
- the reading page renders engine-specific chart data correctly
- AI interpretation uses calculated chart data rather than raw birth input alone
- users can revisit stored readings without recalculation drift
- interpretation failure still leaves the calculated chart visible
- homepage exposes `/fortune` as a live module entry
- backend and frontend verification commands pass for the changed scope

## Files Likely To Change

- `backend/src/main.py`
- `backend/src/fortune/`
- database migration files for `fortune_readings`
- `frontend/src/app/page.tsx`
- `frontend/src/app/fortune/`
- `frontend/src/lib/api.ts`
- shared UI components reused by the fortune routes

## Notes

This design intentionally favors a stable shared protocol over provider-specific convenience. The goal is to ship two real chart-driven systems inside one coherent product surface without overfitting the codebase to any single metaphysics library.
