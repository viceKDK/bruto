# Story 2.3: Daily Fight Limit Tracking

Status: done

## Story

As a player,
I need the six daily fight limit enforced across my account,
so that pacing matches the original.

## Requirements Context Summary

### Requirement Sources
- `docs/epics.md` — Epic 2 Story 2.3 defines daily limit tracking requirements and acceptance criteria (fight counter decrements, daily reset timer, persistence).
- `docs/GDD.md` — Section 10 specifies 6 fights per day limit with daily reset, Section 15 confirms 8 fights with Regeneration skill.
- `docs/architecture.md` — Section 6 defines daily_fights table schema with user_id, fight_date, and fight_count columns.

### Key Requirements
- Track fight count per user per day (6 fight limit standard, 8 with Regeneration skill).
- Decrement available fights on battle start and lock opponent selection after limit reached.
- Implement daily reset timer using UTC date comparison.
- Persist fight counter across page reloads via database.
- Display remaining fights prominently in UI.
- Handle edge case: Regeneration skill acquired mid-day adds +2 to daily limit.

## Structure Alignment Summary

### Learnings from Previous Story

**From Story 2-2-bruto-slot-management (Status: drafted)**

- **User Data Management**: Coin tracking and slot unlock state persisted in database
- **Transaction Logic**: Purchase flow with validation implemented
- **Confirmation Dialogs**: Modal component for destructive actions available
- **Repository Pattern**: UserRepository and BrutoRepository handling complex updates
- **UI State Sync**: Zustand state updates driving instant UI refresh

[Source: stories/2-2-bruto-slot-management.md#Dev-Agent-Record]

- Daily fight tracking will use DailyFightsRepository created in Story 1.2.
- UI will display fight counter in UIScene persistent overlay or scene headers.
- Fight decrement will be triggered at battle start in OpponentSelectionScene or CombatScene.

## Acceptance Criteria

1. Fight counter decrements on battle start; locks selection after six fights.
2. Daily reset timer (UTC) restores fights and updates UI.
3. Counter persists across reloads via database.

## Tasks / Subtasks

- [x] Task 1 (AC: 1) Implement fight tracking system
  - [x] Subtask 1.1 Create DailyFightsService with getCurrentDailyFights(), decrementFight(), and checkLimit() methods
  - [x] Subtask 1.2 Wire fight decrement to battle initialization in CombatScene
  - [x] Subtask 1.3 Add UI lock state in OpponentSelectionScene when limit reached
  - [x] Subtask 1.4 Display remaining fights counter in UIScene overlay

- [x] Task 2 (AC: 2) Build daily reset system
  - [x] Subtask 2.1 Create reset check using date-fns to compare fight_date with current UTC date
  - [x] Subtask 2.2 Implement reset logic that initializes new daily_fights row for current date
  - [x] Subtask 2.3 Add reset check on scene load and after each battle
  - [x] Subtask 2.4 Display time until reset in UI (e.g., "Resets in 5h 23m")

- [x] Task 3 (AC: 3) Ensure persistence and edge cases
  - [x] Subtask 3.1 Verify fight count loads from database on session start
  - [x] Subtask 3.2 Handle Regeneration skill acquisition mid-day (add +2 to max_fights)
  - [x] Subtask 3.3 Add unit tests for date rollover logic and limit enforcement

## Story Body

### Implementation Outline
1. Create DailyFightsService that wraps DailyFightsRepository with business logic for limit checking and resets.
2. Implement date handling using date-fns as mandated in architecture.md Section 9 (format(), parseISO(), startOfDay()).
3. Build UI component showing "Fights: 4/6" in persistent overlay or scene header.
4. Wire fight decrement trigger to battle initialization, updating database and Zustand state.
5. Add reset check logic that runs on scene load comparing stored fight_date to current UTC date.
6. Implement time-until-reset calculation and display using date-fns.
7. Handle Regeneration skill edge case by reading bruto skills and adjusting max_fights dynamically.
8. Add comprehensive unit tests for reset logic, timezone handling, and limit enforcement.

## Dev Notes

### Learnings from Previous Story

- **Database Operations**: Repository pattern with Result<T> well-established
- **UI State Management**: Zustand updates driving UI refresh patterns working
- **Date Handling**: Use date-fns for all date operations (mandated pattern)
- **Validation Logic**: Check-then-act pattern with error states proven effective

Follow the date handling pattern mandatorily: store as ISO strings, parse with parseISO(), compare with date-fns functions.

### Project Structure Notes

**Daily Limit Components**:
```
src/
  engine/
    DailyFightsService.ts     # Business logic for fight limits
  database/
    repositories/
      DailyFightsRepository.ts # CRUD for daily_fights table
  state/
    store.ts                  # Zustand store extended with daily fight status
  scenes/
    OpponentSelectionScene.ts # Locks combat when limit reached
    UIScene.ts                # Persistent overlay showing remaining fights
  utils/
    dates.ts                  # UTC date helpers using date-fns
```

### References

- Use date-fns mandatorily for all date operations: format(new Date(), 'yyyy-MM-dd') for date keys. [Source: docs/architecture.md#9-implementation-patterns-consistency-rules]
- Store fight_date as TEXT in 'YYYY-MM-DD' format for daily uniqueness constraint. [Source: docs/architecture.md#6-data-architecture]
- Daily reset at UTC midnight: use startOfDay() to normalize dates. [Source: docs/architecture.md#9-implementation-patterns-consistency-rules]
- Base limit is 6 fights, increased to 8 with Regeneration skill. [Source: docs/GDD.md#10-game-mechanics]
- Unique index on (user_id, fight_date) prevents duplicate rows. [Source: docs/architecture.md#6-data-architecture]

## Change Log

- 2025-10-30: Draft story created from epics/GDD/architecture sources with learnings from Stories 1.1-2.2.
- 2025-10-30: Daily fight enforcement implemented with service, UI gating, and tests by Link Freeman.
- 2025-10-30: Regeneration skill hydration wired through BrutoRepository and scenes to elevate limits dynamically.
- 2025-10-30: Senior Developer Review approved with no follow-up actions.

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

- 2025-10-30 19:45 Implementation Plan: service + repository refactor, UI gating, utc helpers.
- 2025-10-30 20:13 Validation: `npm run lint`, `npm run test`.
- 2025-10-30 20:38 Regression: Re-ran `npm run lint`, `npm run test` after Regeneration wiring.

### Completion Notes List

- **DailyFightsService**: Added UTC-aware orchestration over `DailyFightsRepository`, handles max upgrade when Regeneration unlocks mid-day and exposes status/register APIs.
- **Repository Enhancements**: Refined `DailyFightsRepository` with deterministic UTC helpers and explicit insert/update pathways to avoid silent upserts.
- **State & UI**: Zustand store now tracks daily fight status; `UIScene` overlay displays fights remaining and countdown to UTC reset.
- **Opponent Locking**: `OpponentSelectionScene` blocks combat when limit exhausted, ensuring decrement before scene transition.
- **Regeneration Hook**: `BrutoRepository` hydrates skill lists so scenes detect Regeneration and upgrade daily limits without reloads.
- **Quality Guardrails**: Added `DailyFightsService.test.ts` covering initialization, limit enforcement, and Regeneration upgrades; all checks pass via `npm run test` and `npm run lint`.

### File List

- `package-lock.json`
- `package.json`
- `src/database/repositories/DailyFightsRepository.ts`
- `src/database/repositories/BrutoRepository.ts`
- `src/engine/DailyFightsService.test.ts`
- `src/engine/DailyFightsService.ts`
- `src/models/Bruto.ts`
- `src/scenes/BrutoSelectionScene.ts`
- `src/scenes/OpponentSelectionScene.ts`
- `src/scenes/UIScene.ts`
- `src/state/store.ts`
- `src/utils/dates.ts`
- `vitest.config.ts`

## Senior Developer Review (AI)

**Reviewer:** vice  
**Date:** 2025-10-30  
**Outcome:** Approve

**Summary**
- Regeneration ownership now hydrates through `BrutoRepository`, so daily fight limits jump to eight immediately when the skill is present.
- Daily fight gating, UTC reset countdown, and persistence flow all align with architecture patterns and acceptance criteria.

**Key Findings**
- None.

**Acceptance Criteria Coverage**

| AC | Description | Status | Evidence |
| --- | --- | --- | --- |
| AC1 | Fight counter decrements on battle start; locks selection after six fights | Implemented | src/engine/DailyFightsService.ts:106, src/scenes/OpponentSelectionScene.ts:120 |
| AC2 | Daily reset timer (UTC) restores fights and updates UI | Implemented | src/utils/dates.ts:25, src/scenes/UIScene.ts:63 |
| AC3 | Counter persists across reloads via database | Implemented | src/database/repositories/DailyFightsRepository.ts:145, src/scenes/BrutoSelectionScene.ts:134 |

**Task Completion Validation**

| Task / Subtask | Marked As | Verified As | Evidence |
| --- | --- | --- | --- |
| Task 1 | [x] | Verified complete | src/engine/DailyFightsService.ts:94, src/scenes/OpponentSelectionScene.ts:110 |
| Subtask 1.1 | [x] | Verified complete | src/engine/DailyFightsService.ts:24 |
| Subtask 1.2 | [x] | Verified complete | src/scenes/OpponentSelectionScene.ts:121 |
| Subtask 1.3 | [x] | Verified complete | src/scenes/OpponentSelectionScene.ts:93 |
| Subtask 1.4 | [x] | Verified complete | src/scenes/UIScene.ts:63 |
| Task 2 | [x] | Verified complete | src/utils/dates.ts:25, src/engine/DailyFightsService.ts:37 |
| Subtask 2.1 | [x] | Verified complete | src/utils/dates.ts:25 |
| Subtask 2.2 | [x] | Verified complete | src/engine/DailyFightsService.ts:49 |
| Subtask 2.3 | [x] | Verified complete | src/scenes/BrutoSelectionScene.ts:134 |
| Subtask 2.4 | [x] | Verified complete | src/scenes/UIScene.ts:72 |
| Task 3 | [x] | Verified complete | src/database/repositories/DailyFightsRepository.ts:145, src/scenes/BrutoSelectionScene.ts:134 |
| Subtask 3.1 | [x] | Verified complete | src/scenes/BrutoSelectionScene.ts:134 |
| Subtask 3.2 | [x] | Verified complete | src/database/repositories/BrutoRepository.ts:20, src/scenes/OpponentSelectionScene.ts:137 |
| Subtask 3.3 | [x] | Verified complete | src/engine/DailyFightsService.test.ts:55 |

**Test Coverage and Gaps**
- `npm run lint`
- `npm run test`
- Unit tests cover daily limit enforcement and regeneration upgrades; integration/UI automation can follow once combat loops exist.

**Architectural Alignment**
- Repository/service split respects Clean Architecture; UTC helpers centralize date logic per architecture.md §9.
- Zustand overlay cleanly separates presentation from business logic.

**Security Notes**
- Local-only database mutations; no new attack surface introduced.

**Best-Practices and References**
- Regeneration handling leverages repository hydration rather than scene-specific hacks, staying consistent with architecture skill patterns.

### Action Items

**Code Changes Required:**
- None.

**Advisory Notes:**
- None.

## Senior Developer Review (AI)

**Reviewer:** vice  
**Date:** 2025-10-30  
**Outcome:** Changes Requested

**Summary**
- Daily fight gating, UTC reset handling, and persistence look solid; countdown surfaces clearly in the HUD.
- Regeneration bonus is not actually applied because no scene populates `skills`, so the service never receives `hasRegeneration = true`; this violates Task 3.2 and risks exceeding the per-day cap.

**Key Findings**
- High: Regeneration edge case not satisfied. `hasRegenerationSkill()` only inspects `selectedBruto?.skills`, but `IBruto` instances loaded via `BrutoRepository` never populate `skills`, so the flag is always false. Result: players with Regeneration stay capped at 6 fights (AC Task 3.2). See `src/scenes/OpponentSelectionScene.ts:137` and `src/database/repositories/BrutoRepository.ts:20`.

**Acceptance Criteria Coverage**

| AC | Description | Status | Evidence |
| --- | --- | --- | --- |
| AC1 | Fight counter decrements on battle start; locks selection after six fights | Implemented | src/engine/DailyFightsService.ts:106, src/scenes/OpponentSelectionScene.ts:110 |
| AC2 | Daily reset timer (UTC) restores fights and updates UI | Implemented | src/engine/DailyFightsService.ts:37, src/utils/dates.ts:25, src/scenes/UIScene.ts:63 |
| AC3 | Counter persists across reloads via database | Implemented | src/database/repositories/DailyFightsRepository.ts:145, src/scenes/BrutoSelectionScene.ts:134 |

**Task Completion Validation**

| Task / Subtask | Marked As | Verified As | Evidence |
| --- | --- | --- | --- |
| Task 1 | [x] | Verified complete | src/engine/DailyFightsService.ts:94, src/scenes/OpponentSelectionScene.ts:110 |
| Subtask 1.1 | [x] | Verified complete | src/engine/DailyFightsService.ts:24 |
| Subtask 1.2 | [x] | Verified complete | src/scenes/OpponentSelectionScene.ts:110 |
| Subtask 1.3 | [x] | Verified complete | src/scenes/OpponentSelectionScene.ts:93 |
| Subtask 1.4 | [x] | Verified complete | src/scenes/UIScene.ts:63 |
| Task 2 | [x] | Verified complete | src/engine/DailyFightsService.ts:37 |
| Subtask 2.1 | [x] | Verified complete | src/utils/dates.ts:25 |
| Subtask 2.2 | [x] | Verified complete | src/engine/DailyFightsService.ts:49 |
| Subtask 2.3 | [x] | Verified complete | src/scenes/BrutoSelectionScene.ts:134 |
| Subtask 2.4 | [x] | Verified complete | src/scenes/UIScene.ts:72 |
| Task 3 | [x] | **Not done (High)** | src/scenes/OpponentSelectionScene.ts:137, src/database/repositories/BrutoRepository.ts:20 |
| Subtask 3.1 | [x] | Verified complete | src/scenes/BrutoSelectionScene.ts:134 |
| Subtask 3.2 | [x] | **Not done (High)** | src/scenes/OpponentSelectionScene.ts:137, src/database/repositories/BrutoRepository.ts:20 |
| Subtask 3.3 | [x] | Verified complete | src/engine/DailyFightsService.test.ts:55 |

**Test Coverage and Gaps**
- New unit tests in `DailyFightsService.test.ts` cover initialization, limit enforcement, and upgrade to 8 fights; add integration coverage once Regeneration data flow is wired into the scene/state.

**Architectural Alignment**
- Repository/service split and UTC helpers follow architecture.md directives; Zustand overlay updates comply with Clean Architecture boundaries.
- Regeneration handling needs real skill data retrieval to satisfy the requirement and align with epic skill architecture.

**Security Notes**
- No new security surface introduced; DB writes remain local.

**Best-Practices and References**
- UTC handling centralized via `src/utils/dates.ts:11`, complying with architecture.md §9.

### Action Items

**Code Changes Required:**
- [ ] [High] Populate player skill ownership (Regeneration) before evaluating daily limits so `hasRegenerationSkill()` can elevate max fights as required (AC Task 3.2) [src/scenes/OpponentSelectionScene.ts:137]
- [ ] [High] Extend repository/state flow to hydrate `IBruto.skills` (or otherwise expose Regeneration state) so the service receives accurate `hasRegeneration` flags (AC Task 3.2) [src/database/repositories/BrutoRepository.ts:20]

**Advisory Notes:**
- None.
