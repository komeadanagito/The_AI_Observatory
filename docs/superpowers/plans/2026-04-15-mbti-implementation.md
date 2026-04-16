# MBTI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bounded dynamic MBTI questionnaire with 8-12 AI-generated questions, resumable sessions, and a structured result page.

**Architecture:** Build a dedicated `mbti` backend module that owns session persistence, question generation, answer processing, and final result shaping. On the frontend, add a landing page, session page, and result page that talk only to the backend session API and do not compute MBTI locally.

**Tech Stack:** FastAPI, SQLAlchemy, PostgreSQL, Next.js App Router, React Query, TypeScript

---

### Task 1: Add MBTI Persistence Model And Migration

**Files:**
- Create: `backend/src/mbti/models.py`
- Create: `backend/alembic/versions/<new_revision>_add_mbti_sessions.py`
- Modify: `backend/src/auth/models.py`
- Modify: `backend/src/core/database.py` if model imports require registration

- [ ] Define `MBTISession` with user relation, session status, question count, answers JSON, current question JSON, result JSON, created/updated timestamps.
- [ ] Add one active-session-friendly index on `(user_id, status, updated_at)`.
- [ ] Create an Alembic migration that adds the table and index.

### Task 2: Add MBTI Schemas And Static Type Metadata

**Files:**
- Create: `backend/src/mbti/schemas.py`
- Create: `backend/src/mbti/type_data.py`

- [ ] Add Pydantic request/response schemas for start, resume, answer, result, and MBTI type info.
- [ ] Add static metadata for 16 MBTI personalities including Chinese/English names and default cognitive function stacks.
- [ ] Keep the API surface aligned with `specs/001-ai-metaphysics-platform/contracts/mbti.yaml`, simplified only where needed for the bounded 8-12 question release.

### Task 3: Implement MBTI Service Logic

**Files:**
- Create: `backend/src/mbti/prompts.py`
- Create: `backend/src/mbti/service.py`

- [ ] Add prompt builders that force structured JSON output for next-question and final-result modes.
- [ ] Implement `start_session`, `resume_session`, `submit_answer`, and `get_result` service methods.
- [ ] Enforce bounded dynamic logic: minimum 8 questions, maximum 12 questions, AI may end only from question 8 onward.
- [ ] Ensure only one running session exists per user.
- [ ] Persist the latest current question and all answers after each step.

### Task 4: Add MBTI API Router

**Files:**
- Create: `backend/src/mbti/router.py`
- Modify: `backend/src/main.py`

- [ ] Expose `POST /api/mbti/session/start`.
- [ ] Expose `GET /api/mbti/session/{session_id}/resume`.
- [ ] Expose `POST /api/mbti/session/{session_id}/answer`.
- [ ] Expose `GET /api/mbti/session/{session_id}/result`.
- [ ] Expose `GET /api/mbti/types` and `GET /api/mbti/types/{type_code}`.
- [ ] Register the router in `src/main.py`.

### Task 5: Extend Frontend API Client

**Files:**
- Modify: `frontend/src/lib/api.ts`

- [ ] Add TypeScript types for MBTI session question, answer payload, session progress, and final result.
- [ ] Add `mbtiApi.startSession`, `resumeSession`, `submitAnswer`, `getResult`, `getTypes`, and `getTypeDetail`.

### Task 6: Add MBTI Landing Page

**Files:**
- Create: `frontend/src/app/mbti/page.tsx`
- Modify: `frontend/src/app/page.tsx`

- [ ] Turn the homepage MBTI card into a live entry instead of a placeholder.
- [ ] Build the MBTI landing page with premium but calmer styling than tarot.
- [ ] Show intro copy, question count range, and start/resume actions.

### Task 7: Add MBTI Session Experience

**Files:**
- Create: `frontend/src/app/mbti/session/[sessionId]/page.tsx`
- Create: `frontend/src/components/mbti/MBTIQuestionCard.tsx`
- Create: `frontend/src/components/mbti/MBTIProgress.tsx`

- [ ] Build a one-question-at-a-time session page.
- [ ] Show progress, current question, answer options, and submit state.
- [ ] After submit, either render the next question or redirect to the result page.
- [ ] Support resume flow cleanly on reload.

### Task 8: Add MBTI Result Experience

**Files:**
- Create: `frontend/src/app/mbti/result/[sessionId]/page.tsx`
- Create: `frontend/src/components/mbti/MBTIResultHero.tsx`
- Create: `frontend/src/components/mbti/MBTIResultSections.tsx`

- [ ] Show type code, Chinese/English type names, summary, functions, strengths, weaknesses, career matches, and relationship advice.
- [ ] Keep the design premium and structured, not mystical-noisy.

### Task 9: Verify Build And Runtime Assumptions

**Files:**
- Modify: none

- [ ] Run `npm run build` in `frontend/`.
- [ ] Run backend startup command to ensure imports and router registration succeed.
- [ ] If backend test tooling is still unavailable, explicitly report that verification was limited to startup/import validation.
