# Horoscope Engine Design

## Goal

Add a complete authenticated horoscope feature that uses real astrology calculations instead of template-by-sign text.

The user experience should cover:

- birth profile capture and reuse
- location search and resolution
- natal chart calculation
- current transit calculation for the target date
- structured daily fortune output
- premium result page with chart visualization
- reading history and revisit flow

## Product Scope

This feature covers the horoscope system only.

It includes:

- a new `/horoscope` entry flow for logged-in users
- saving and reusing birth data: date, time, place
- resolved place search instead of free-form place submission
- real natal chart computation based on birth data
- real transit computation for the requested day
- a structured result containing:
  - overall summary
  - love fortune
  - career fortune
  - wealth fortune
  - health fortune
  - lucky elements
  - warnings
  - key time windows
- an SVG-based chart summary in the frontend
- reading history list and detail pages

This first implementation does not include:

- synastry / compatibility charts
- long-term annual forecasting
- multi-user chart comparison
- a shared cross-module history landing page

The architecture should leave room for those later, but they are not part of this spec.

## Core Experience Decisions

### Astrology System Choices

Use a single explicit calculation standard for the whole feature:

- zodiac: `tropical`
- house system: `placidus`
- target period in this spec: `daily`
- chart basis: natal chart plus same-day transit chart
- timezone resolution: derived from the selected place coordinates

These values must be loaded through the backend settings layer and referenced from a single astrology engine configuration surface. They must not be scattered across business logic.

### Canonical Birth Profile Source

The existing `users` table already contains encrypted `birth_date`, `birth_time`, and `birth_place` fields and matching auth service support.

This feature should reuse that existing profile storage as the canonical user-level birth profile instead of creating a second permanent horoscope-specific profile table.

Design implication:

- expose authenticated profile read/update endpoints if they are not already wired
- the horoscope flow reads from the shared user profile by default
- the saved `birth_place` value should be the normalized display name selected from place search, not arbitrary user text

This keeps one source of truth for user birth data and avoids duplicating sensitive data across tables.

### Reading Snapshot Principle

Even though the shared user profile is canonical, every horoscope reading must store a full snapshot of the inputs and resolved place data that produced that reading.

This is required so that:

- history remains reproducible
- later profile edits do not rewrite old readings
- chart rendering can revisit the exact data used at creation time

## User Experience

### Routes

- `frontend/src/app/horoscope/page.tsx`
- `frontend/src/app/horoscope/reading/[readingId]/page.tsx`
- `frontend/src/app/horoscope/history/page.tsx`

The home page card for horoscope should be changed from a placeholder state to a real entry link.

### User Flow

1. Logged-in user opens `/horoscope`
2. Frontend loads the saved birth profile from the authenticated profile API
3. If the user has no complete birth profile, they must provide:
   - birth date
   - birth time
   - birth place from search suggestions
4. User may optionally enter a focus question for the current reading
5. User submits a request to generate today's horoscope
6. Backend validates the profile and resolves the selected place into coordinates and timezone
7. Backend computes natal chart and daily transit chart
8. Backend produces a structured horoscope report
9. Backend asks the AI layer to turn that structured report into polished narrative text
10. Backend saves the reading snapshot and final result
11. Frontend navigates to the reading detail page
12. User can revisit the reading later from history

### Experience Constraints

- horoscope is login-required in this spec
- profile editing and reading creation happen in the same route for the first release
- a reading is considered successful if structured output is available, even when AI narrative generation fails

## Backend Design

## New Module

- `backend/src/horoscope/`

Recommended layout:

- `router.py`
- `schemas.py`
- `models.py`
- `service.py`
- `prompts.py`
- `engine/protocols.py`
- `engine/place_resolver.py`
- `engine/chart_calculator.py`
- `engine/transit_calculator.py`
- `engine/report_builder.py`

### Responsibility Split

- `router.py`
  - authenticated API endpoints
  - HTTP error mapping

- `schemas.py`
  - request/response contracts
  - structured astrology payloads

- `models.py`
  - persistent reading history model
  - reading status fields and snapshots

- `service.py`
  - orchestration of profile loading, validation, place resolution, calculations, AI generation, and persistence

- `engine/place_resolver.py`
  - geocoding provider integration
  - provider result normalization
  - timezone derivation

- `engine/chart_calculator.py`
  - natal chart calculation wrappers around the astrology library

- `engine/transit_calculator.py`
  - transit calculation for the target date

- `engine/report_builder.py`
  - deterministic transformation from chart data into structured fortune sections

- `prompts.py`
  - AI narration prompt templates and output constraints

## Shared Profile API Work

The auth module already has profile update/decrypt support but does not currently expose the full profile over HTTP.

This feature should add:

- `GET /api/auth/profile`
- `PUT /api/auth/profile`

Those endpoints should reuse the existing auth service and encrypted `users` table fields.

Write-path rule:

- the frontend saves a selected place candidate
- the backend persists the candidate `display_name` into the shared `birth_place` field
- the frontend does not save arbitrary free-form place text into the shared profile

The horoscope frontend should use those shared endpoints instead of inventing a second profile API.

## Horoscope Endpoints

- `GET /api/horoscope/places/search?q=...`
  - returns normalized place candidates
  - used by the birth place autocomplete UI

- `POST /api/horoscope/readings`
  - creates one new daily reading for the current user
  - reads the saved birth profile unless an explicit inline override is allowed later
  - returns the completed reading payload

- `GET /api/horoscope/readings`
  - returns reading history list for the current user

- `GET /api/horoscope/readings/{reading_id}`
  - returns one saved reading detail

Optional later extension, not required in this spec:

- `POST /api/horoscope/chart/preview`
  - calculate chart preview without saving history

## Domain Contracts

### Place Search

Use a provider-neutral contract so the geocoding backend can be swapped later.

Required response shape for each place candidate:

- `provider`
- `provider_place_id`
- `display_name`
- `country`
- `latitude`
- `longitude`
- `timezone`

Frontend must submit a selected candidate, not raw place text.

For shared profile persistence:

- the write contract may accept `birth_place_candidate`
- the backend persists only the candidate `display_name` into the existing encrypted `birth_place` column
- the reading snapshot stores the full resolved candidate data used for that reading

### Birth Profile Contract

Profile fields used by horoscope generation:

- `birth_date`
- `birth_time`
- `birth_place`

Validation rules:

- birth date format must be valid calendar date
- birth time format must be valid `HH:MM`
- birth place must come from a resolved place candidate in the UI flow

### Chart Data Contract

Natal and transit chart payloads should use explicit structured models.

Minimum natal body contract:

- `body`
- `sign`
- `degree`
- `house`
- `longitude`

Minimum house cusp contract:

- `house`
- `sign`
- `degree`
- `longitude`

Minimum aspect contract:

- `body_a`
- `body_b`
- `aspect_type`
- `orb`

Transit-to-natal aspect contract:

- `transit_body`
- `natal_body`
- `aspect_type`
- `orb`
- `influence_area`

### Structured Horoscope Contract

The deterministic report builder must return a stable schema before any AI expansion.

Minimum fields:

- `summary`
- `love`
- `career`
- `wealth`
- `health`
- `dimension_scores`
- `lucky_elements`
- `warnings`
- `time_windows`
- `chart_highlights`

Recommended detail:

- each major dimension includes `score`, `headline`, `guidance`
- `lucky_elements` includes `colors`, `numbers`, `actions`
- `time_windows` includes `label`, `theme`, `guidance`

### Reading Response Contract

`HoroscopeReadingResponse` should include:

- `id`
- `status`
- `target_date`
- `focus_question`
- `profile_snapshot`
- `resolved_place`
- `natal_chart`
- `transit_chart`
- `structured_report`
- `narrative`
- `disclaimer`
- `created_at`

## Data Model

Add a new persistent model: `HoroscopeReading`.

Minimum fields:

- `id`
- `user_id`
- `status`
- `period`
- `target_date`
- `focus_question`
- `profile_snapshot_json`
- `resolved_place_json`
- `natal_chart_json`
- `transit_chart_json`
- `structured_report_json`
- `narrative`
- `ai_error_message`
- `created_at`
- `updated_at`

### Reading Status Rules

The reading status machine must be explicit:

- `pending`
- `running`
- `success`
- `failed`
- `cancelled`

Normal request flow for this spec:

1. insert row as `pending`
2. move to `running` when orchestration starts
3. move to `success` when structured report is saved
4. move to `failed` if mandatory calculation steps fail

If the AI narrative fails after the structured report has been built, keep the reading in `success`, persist the structured report, and store the AI failure in `ai_error_message`.

## External Integrations

### Astrology Engine

Use a real astrology calculation library behind a thin adapter protocol.

Recommended implementation:

- `pyswisseph` for planetary and house calculations
- `timezonefinder` and `zoneinfo` for timezone derivation and local/UTC conversion

The rest of the application should depend only on local protocols, not directly on library-specific APIs.

### Geocoding Provider

Use an async geocoding provider behind `PlaceResolverProtocol`.

The provider must support:

- autocomplete search
- provider id and normalized display name
- coordinates
- timezone derivation or enough coordinates to derive timezone locally

All provider configuration must come from `.env`, including:

- provider base URL
- provider API key if needed
- timeout
- retry count
- retry backoff

### Caching

Resolved places should be cached in Redis by normalized display name to avoid repeated geocoding for the same saved birth place.

The cache TTL must come from configuration, not hardcoded values in business logic.

## Generation Pipeline

1. Authenticate user
2. Load and decrypt saved birth profile from the shared auth profile source
3. Validate birth date, time, and place completeness
4. Resolve the normalized birth place to coordinates and timezone, using cache first
5. Convert local birth datetime to UTC
6. Calculate natal chart bodies, houses, and major aspects
7. Calculate transit chart for the target day in the resolved timezone
8. Build a deterministic structured horoscope report
9. Build AI prompt from the structured report and chart highlights
10. Attempt AI narrative generation
11. Save all snapshots and outputs
12. Return the persisted reading response

The AI layer must never be responsible for inventing chart facts.

## AI Contract

The AI is a narrator, not the source of astrological truth.

Prompt inputs should include:

- focus question if present
- natal chart highlights
- transit highlights
- structured summary for overall, love, career, wealth, and health
- lucky elements
- warnings
- time windows

Prompt rules must explicitly forbid:

- inventing uncalculated planets or aspects
- claiming deterministic real-world certainty
- giving medical, legal, or investment advice
- mixing tarot, MBTI, or Chinese metaphysics concepts into horoscope output

Expected AI output:

- Chinese text
- premium but restrained tone
- clearly separated overall and four-dimension fortune sections
- short entertainment disclaimer

If the AI is ever asked to return JSON during this flow, malformed JSON should use a `json-repair` fallback before final failure.

## Frontend Design

### Horoscope Entry Page

Responsibilities:

- load the saved authenticated profile
- show a premium horoscope introduction
- present editable birth profile fields
- provide place autocomplete and candidate selection
- allow entering an optional focus question
- submit the reading request
- redirect to the saved reading detail page on success

UI structure:

- hero section with horoscope-specific visual language, distinct from tarot but still consistent with the dark premium theme
- birth profile card
- place search dropdown
- optional focus question card
- primary action button
- quick link to history

### Reading Detail Page

Responsibilities:

- fetch one reading by id
- render summary blocks and chart content
- show structured report even if narrative text is empty

UI structure:

- top identity strip: target date, sun/moon/rising summary
- chart summary card with dominant signs, houses, and key aspects
- SVG natal chart panel
- overall fortune hero block
- four dimension cards: love, career, wealth, health
- lucky elements panel
- warnings panel
- key time windows panel
- narrative text section
- back-to-history action

### History Page

Responsibilities:

- show the current user's saved horoscope readings
- allow opening any reading detail

Minimum list fields:

- target date
- sun/moon/rising summary
- focus question excerpt
- created time

### Frontend State Rules

- frontend must not compute astrology results itself
- frontend only handles profile editing, candidate selection, request submission, and rendering
- chart drawing should be purely presentational, using longitudes and house cusps already returned by the backend

## Error Handling

The feature must handle these cases explicitly:

- missing birth profile
- invalid birth date/time format
- place search returns no candidate
- place resolution fails for a previously saved place
- timezone cannot be derived
- astrology engine calculation fails
- geocoding provider timeout
- AI narration failure
- reading persistence failure

Rules:

- input problems return `4xx`
- external dependency failures return user-facing business errors, not raw tracebacks
- AI narration failure must not discard a valid structured report
- every failure path must log structured context with `trace_id`

## Logging And Observability

Horoscope generation should follow the existing structured logging approach and the repository rules.

At minimum, log:

- request start and finish
- place search provider calls
- chart calculation duration
- transit calculation duration
- AI prompt and response metadata
- status transitions for `HoroscopeReading`
- failure reason and retry count for external providers

All duration thresholds and retry limits must be configuration-driven.

## Configuration Additions

Expected new `.env` settings include fields like:

- `GEOCODING_PROVIDER`
- `GEOCODING_API_BASE`
- `GEOCODING_API_KEY`
- `GEOCODING_TIMEOUT_SECONDS`
- `GEOCODING_MAX_RETRIES`
- `GEOCODING_RETRY_DELAY_MS`
- `PLACE_CACHE_TTL_SECONDS`
- `HOROSCOPE_ZODIAC_SYSTEM`
- `HOROSCOPE_HOUSE_SYSTEM`
- `HOROSCOPE_LOG_WARNING_THRESHOLD_MS`
- `HOROSCOPE_LOG_ERROR_THRESHOLD_MS`
- `HOROSCOPE_MAX_MODEL_CALLS`
- `HOROSCOPE_MAX_CONCURRENT_REQUESTS`
- `HOROSCOPE_TARGET_PERIOD_DEFAULT`

The final implementation can refine exact names, but this feature must not hardcode provider credentials, retry policy, thresholds, or concurrency limits.

## Testing

### Backend Tests

- shared profile read/update endpoints
- place search normalization
- timezone derivation
- UTC conversion correctness
- natal chart adapter output shape
- transit adapter output shape
- deterministic report builder output
- reading creation success path
- history list and detail path
- AI failure fallback path

### Frontend Tests

- profile form validation
- place autocomplete selection flow
- disable submit while request is in flight
- reading detail renders with and without `narrative`
- history navigation flow

## Acceptance Criteria

The feature is complete when:

- a logged-in user can save birth date, birth time, and birth place through authenticated profile APIs
- the horoscope page can reuse the saved profile
- place search uses resolved candidates rather than arbitrary place text
- the backend computes a real natal chart and a same-day transit chart
- the reading result contains overall, love, career, wealth, and health sections
- the reading detail page renders a chart summary and an SVG chart panel
- readings are persisted and visible in history
- old readings remain reproducible after profile edits because snapshots are stored
- AI narrative failure still returns a successful structured result

## Files Likely To Change

- `backend/src/main.py`
- `backend/src/auth/router.py`
- `backend/src/auth/schemas.py`
- `backend/src/auth/service.py`
- `backend/src/horoscope/models.py`
- `backend/src/horoscope/schemas.py`
- `backend/src/horoscope/service.py`
- `backend/src/horoscope/router.py`
- `backend/src/horoscope/prompts.py`
- `backend/src/horoscope/engine/protocols.py`
- `backend/src/horoscope/engine/place_resolver.py`
- `backend/src/horoscope/engine/chart_calculator.py`
- `backend/src/horoscope/engine/transit_calculator.py`
- `backend/src/horoscope/engine/report_builder.py`
- database migration files for horoscope readings and any needed auth profile exposure changes
- `frontend/src/app/page.tsx`
- `frontend/src/app/horoscope/page.tsx`
- `frontend/src/app/horoscope/reading/[readingId]/page.tsx`
- `frontend/src/app/horoscope/history/page.tsx`
- `frontend/src/lib/api.ts`
