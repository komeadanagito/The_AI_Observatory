# MBTI Dynamic Questionnaire Design

## Goal

Add a complete MBTI feature that feels AI-driven and dynamic, while keeping the first release bounded, stable, and practical to implement.

## Product Scope

This feature covers only the MBTI system.

It does not include:

- horoscope implementation
- Chinese astrology implementation
- global history refactor across all modules

The first release should deliver a working end-to-end MBTI experience inside the existing authenticated platform.

## User Experience

### Entry Route

- `/mbti`

### User Flow

1. User opens the MBTI page
2. User sees a premium introduction screen with start button
3. User starts a new session
4. System presents one question at a time
5. User answers in natural-language or structured short-choice form
6. After question 8, the AI decides whether the current evidence is sufficient
7. The session ends no later than question 12
8. User receives a structured MBTI result page
9. User can revisit the final result for that session later

## Core Experience Decision

This is a **bounded dynamic questionnaire**, not a fully open-ended infinite AI interview.

### Question Count Rules

- Minimum questions: `8`
- Maximum questions: `12`
- After each answer from question 8 onward, the system evaluates whether enough evidence exists to finish
- If confidence is insufficient, the system continues
- The system must force completion at question 12

This preserves the user-facing promise of “AI decides dynamically” while keeping the product reliable.

## Interaction Model

### Question Style

Questions should be conversational but still decision-friendly.

Each question should include:

- a short prompt
- optional context line
- 2 to 4 answer choices
- optional free-text clarification field only if needed later, not required in V1

### Recommended Answer Model For V1

Use structured options for the main path.

Reason:

- easier to score reliably
- easier to resume sessions
- easier to keep AI output constrained
- lower risk than open text on the first release

The AI should generate the next question and answer options in a controlled schema, rather than fully free-form prose.

## System Behavior

### Session State Machine

MBTI sessions must follow a clear state machine:

- `pending`
- `running`
- `completed`
- `failed`
- `cancelled`

### Resume Behavior

If a user leaves mid-session:

- opening `/mbti` again should detect an unfinished session
- user may resume from the latest answered question
- there should only be one active unfinished MBTI session per user

### Completion Logic

At each step from question 8 onward, the AI response must include:

- whether more questions are needed
- current trait confidence
- if final, the predicted MBTI type and structured result payload

The backend, not the frontend, is responsible for deciding whether the session is done.

## Backend Design

## New Module

- `backend/src/mbti/`

### Responsibility Split

- `models.py`: session persistence models
- `schemas.py`: request/response models
- `service.py`: session orchestration, AI prompt building, result generation
- `router.py`: API endpoints
- `prompts.py`: MBTI-specific prompt templates and rules

### Required Endpoints

- `POST /api/mbti/session/start`
  - create a new session
  - return first question

- `GET /api/mbti/session/{session_id}/resume`
  - return latest session state and current question

- `POST /api/mbti/session/{session_id}/answer`
  - submit one answer
  - return either next question or completed result

- `GET /api/mbti/session/{session_id}/result`
  - return final completed result

- `GET /api/mbti/types`
  - return 16 type summaries for UI references

- `GET /api/mbti/types/{type_code}`
  - return detail for one MBTI type

### Data Model

Add an `MBTISession` persistence model.

Minimum fields:

- `id`
- `user_id`
- `status`
- `question_count`
- `answers_json`
- `current_question_json`
- `result_json`
- `created_at`
- `updated_at`

### AI Contract

The AI must never return raw unstructured text for session control.

The backend prompt must instruct the model to return structured JSON with fields such as:

- `question`
- `question_dimension`
- `options`
- `reasoning_summary`
- `scores`
- `should_finish`
- `confidence`
- `final_result`

If parsing fails, the backend must treat it as an error and retry according to configured retry policy.

## Result Structure

Final MBTI result should include:

- `personality_type` like `INTJ`
- `type_name` in Chinese
- `summary`
- `cognitive_functions`
- `strengths`
- `weaknesses`
- `career_matches`
- `relationship_advice`
- `famous_people`
- `disclaimer`

## Prompt Constraints

The MBTI prompt must explicitly forbid cross-domain contamination.

It must not reference:

- tarot
- astrology
- Chinese metaphysics

The tone should be reflective, insightful, and modern, not mystical.

## Frontend Design

## New Routes

- `frontend/src/app/mbti/page.tsx`
- `frontend/src/app/mbti/session/[sessionId]/page.tsx`
- `frontend/src/app/mbti/result/[sessionId]/page.tsx`

### Page Responsibilities

#### MBTI Landing Page

- present what the test is
- explain question count range `8-12`
- allow start or resume

#### MBTI Session Page

- show one question at a time
- display progress
- post answer and advance
- handle interruption and resume cleanly

#### MBTI Result Page

- show final type and premium result layout
- provide summary blocks and interpretation sections
- allow returning to MBTI entry page

### Frontend State

Frontend should not compute MBTI itself.

Frontend responsibilities are:

- fetch session state
- render current question
- submit answer
- redirect to result page when complete

### Design Direction

The MBTI module should match the refined premium dark style, but it should feel calmer and more modern than tarot.

- less occult symbolism
- more editorial typography
- cleaner data presentation
- restrained motion

## Validation Rules

### Backend Validation

- reject answers for completed sessions
- reject answers for another user's session
- reject malformed option payloads
- reject answering beyond question 12

### Frontend Validation

- require an option selection before submit
- prevent double-submit while request is pending
- show friendly retry UI on failure

## History Handling In V1

V1 does not need a fully unified cross-module history screen.

But MBTI must at minimum:

- persist finished results
- allow resuming unfinished sessions
- allow direct revisit of completed result pages by session id

Full integration into a multi-module history index can be a follow-up.

## Acceptance Criteria

The MBTI feature is complete when:

- a logged-in user can start a new MBTI session
- the system serves one question at a time
- the number of questions is always between 8 and 12
- the backend decides when to end the questionnaire
- the result page displays one of 16 MBTI types with structured analysis
- unfinished sessions can be resumed
- `npm run build` passes for frontend
- backend endpoints run successfully in local development

## Files Likely To Change

- `backend/src/main.py`
- `backend/src/mbti/models.py`
- `backend/src/mbti/schemas.py`
- `backend/src/mbti/service.py`
- `backend/src/mbti/router.py`
- `backend/src/mbti/prompts.py`
- database migration files for MBTI sessions
- `frontend/src/app/page.tsx` for MBTI entry activation
- `frontend/src/app/mbti/page.tsx`
- `frontend/src/app/mbti/session/[sessionId]/page.tsx`
- `frontend/src/app/mbti/result/[sessionId]/page.tsx`
- `frontend/src/lib/api.ts`

## Notes

This design intentionally avoids a fully open-ended AI interview. The first release should feel dynamic to users while remaining bounded, resumable, and operationally safe.
