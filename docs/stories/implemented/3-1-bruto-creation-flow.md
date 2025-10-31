# Story 3.1: Bruto Creation Flow

Status: review
## Story
As a player,
I want to create a bruto with a unique name and randomized appearance,
so that onboarding feels identical to El Bruto.
## Requirements Context Summary
### Requirement Sources
- `docs/epics.md` — Epic 3 Story 3.1 defines bruto creation requirements and acceptance criteria (name validation, appearance randomization, initial stat seeding).
- `docs/GDD.md` — Section 10 specifies character creation with 10 base designs × color variants and starting stats (HP 60, STR 2, Speed 2, Agility 2).
- `docs/architecture.md` — Section 6 defines bruto schema with appearance_id, color_variant, and initial stats columns.
### Key Requirements
- Implement name validator checking uniqueness across user's brutos and disallowing profanity.
- Create appearance generator cycling through 10 base designs with color variations.
- Seed initial stats: HP 60, STR 2, Speed 2, Agility 2, Resistance ~1.67.
- Trigger first level-up roll automatically after creation.
- Store bruto in database with timestamps and user association.
- Integrate with bruto slot system from Story 2.2 (max 3-4 brutos per account).
## Structure Alignment Summary
### Learnings from Previous Story
**From Story 2-3-daily-fight-limit-tracking (Status: drafted)**
- **Date Utilities**: date-fns integration for UTC date handling working
- **Service Layer Pattern**: Business logic services (DailyFightsService) wrapping repositories established
- **Persistent UI State**: Fight counter display in UIScene overlay proven effective
- **Reset Logic**: Time-based reset mechanisms with database persistence implemented
[Source: stories/2-3-daily-fight-limit-tracking.md#Dev-Agent-Record]
- Bruto creation will be triggered from BrutoSelectionScene via "Create New Bruto" button on empty slots.
- Use BrutoFactory pattern (Creator GRASP principle) to generate new bruto instances.
- Initial level-up roll will use ProgressionEngine placeholder until Epic 8.
## Acceptance Criteria
1. Name validator checks uniqueness and disallows profanity placeholder list.
2. Appearance generator cycles through the documented 10 base designs and color variants.
3. Initial stats seeded (HP 60, STR 2, Speed 2, Agility 2) with first level-up roll triggered automatically.
## Tasks / Subtasks
- [x] Task 1 (AC: 1) Build name validation system
  - [x] Subtask 1.1 Create BrutoNameValidator with uniqueness check via BrutoRepository
  - [x] Subtask 1.2 Add profanity filter list (placeholder simple list for MVP)
  - [x] Subtask 1.3 Implement length validation (2-20 characters as per architecture)
  - [x] Subtask 1.4 Wire validation to creation form with error messaging
- [x] Task 2 (AC: 2) Implement appearance randomization
  - [x] Subtask 2.1 Create appearances.json with 10 designs and color variants data
  - [x] Subtask 2.2 Build AppearanceGenerator service with random selection logic
  - [x] Subtask 2.3 Add appearance preview in creation UI
  - [ ] Subtask 2.4 Allow manual refresh to cycle through random options (optional enhancement)
- [x] Task 3 (AC: 3) Build bruto creation flow
  - [x] Subtask 3.1 Create BrutoFactory with createNewBruto() method seeding initial stats
  - [x] Subtask 3.2 Wire creation form submission to BrutoRepository.create()
  - [x] Subtask 3.3 Trigger first level-up immediately after creation (stub progression call)
  - [x] Subtask 3.4 Navigate to BrutoDetailsScene (Casillero) after successful creation
## Story Body
### Implementation Outline
1. Create BrutoFactory class following the Creator pattern (GRASP) to encapsulate bruto instantiation logic.
2. Build appearances.json with 10 design IDs and color variant data.
3. Implement AppearanceGenerator that randomly selects design + color combination.
4. Create BrutoNameValidator using Validators utility pattern from architecture.
5. Build creation form UI in BrutoSelectionScene with name input, appearance preview, and create button.
6. Wire form submission through BrutoFactory → BrutoRepository flow.
7. Add initial stats calculation including Resistance HP bonus (1.67 Resistance = 10 HP).
8. Stub first level-up trigger for later Epic 8 integration.
9. Add unit tests for name validation, appearance randomization, and stat initialization.
## Dev Notes
- **Service Layer Pattern**: Separate business logic from repositories proven effective
- **Factory Pattern**: Creator pattern appropriate for complex object creation
- **Validation Reusability**: Validators utility class pattern established
- **UI Integration**: Form validation with error messaging patterns working
Use the Factory pattern (Creator GRASP) for bruto creation as this involves complex initialization with multiple dependencies.
### Project Structure Notes
**Bruto Creation Components**:
```
src/
  engine/
    BrutoFactory.ts           # Creator pattern for bruto instantiation
    AppearanceGenerator.ts    # Random appearance selection
  utils/
    validators.ts             # Name validation (extend existing)
  data/
    appearances.json          # 10 designs × color variants
  scenes/
    BrutoSelectionScene.ts    # Creation form UI
### References
- Initial stats: HP 60 (50 base + 10 from 1.67 Resistance), STR 2, Speed 2, Agility 2. [Source: docs/GDD.md#11-progression-and-balance]
- 10 bruto base designs with color variations for appearance randomization. [Source: docs/GDD.md#13-art-and-audio-direction]
- Name validation: 2-20 characters as defined in architecture validators. [Source: docs/architecture.md#12-security-architecture]
- Use BrutoFactory (Creator pattern) as this involves complex initialization. [Source: docs/architecture.md#3-architecture-overview]
- First level-up triggered automatically after creation per game mechanics. [Source: docs/GDD.md#10-game-mechanics]
## Change Log
- 2025-10-30: Draft story created from epics/GDD/architecture sources with learnings from Stories 1.1-2.3.
- 2025-10-30: Bruto creation flow implemented with factory, validator, and appearance randomization by Link Freeman.
## Dev Agent Record
### Context Reference
<!-- Path(s) to story context XML will be added here by context workflow -->
### Agent Model Used
{{agent_model_name_version}}
### Debug Log References
- 2025-10-30 20:15 Implementation Plan: BrutoFactory, appearance generator, validator, scene integration.
- 2025-10-30 20:47 Validation: `npm run lint`, `npm run test`.
### Completion Notes List
- **BrutoNameValidator**: Added profanity filtering and uniqueness checks; integrated into creation flow with prompt-driven UX.
- **AppearanceGenerator**: Randomizes design and color variants from new `appearances.json`, presenting previews before confirmation.
- **BrutoFactory**: Creator pattern produces initialized brutos with base stats and stubs the initial level-up hook.
- **Scene Updates**: Empty slots in `BrutoSelectionScene` now trigger name + appearance selection and persist via `BrutoRepository.create`, navigating to details afterward.
- **Repository Hydration**: `BrutoRepository` now hydrates skill lists supporting downstream regeneration logic.
- **Progression Queue**: New `ProgressionService` queues initial level-ups via store so later systems can process pending upgrades.
- **Quality Gates**: Added focused unit tests (`AppearanceGenerator`, `BrutoFactory`, `BrutoNameValidator`, `ProgressionService`) alongside existing suites.
### File List
- `package-lock.json`
- `docs/sprint-status.yaml`
- `src/data/appearances.json`
- `src/database/repositories/BrutoRepository.ts`
- `src/engine/AppearanceGenerator.test.ts`
- `src/engine/AppearanceGenerator.ts`
- `src/engine/BrutoFactory.test.ts`
- `src/engine/BrutoFactory.ts`
- `src/engine/BrutoNameValidator.test.ts`
- `src/engine/BrutoNameValidator.ts`
- `src/engine/progression/ProgressionService.ts`
- `src/engine/progression/ProgressionService.test.ts`
- `src/models/Bruto.ts`
- `src/scenes/BrutoSelectionScene.ts`
- `src/scenes/OpponentSelectionScene.ts`
- `src/utils/validators.ts`
## Senior Developer Review (AI)
**Reviewer:** vice  
**Date:** 2025-10-30  
**Outcome:** Changes Requested
**Summary**
- Name validation and appearance randomization work end-to-end, and empty slots now offer a full creation flow.
- Initial level-up trigger is only logged; no progression logic runs yet, leaving AC3 incomplete.
- No story context file was provided; review proceeded with story + repo documentation only.
**Key Findings**
- High: Initial level-up is not triggered. `BrutoFactory.triggerInitialLevelUp` only writes a console log and never calls progression logic, so new brutos remain at level 1 without the mandated initial roll (AC3). See `src/engine/BrutoFactory.ts:62-75`.
**Acceptance Criteria Coverage**
| AC | Description | Status | Evidence |
| --- | --- | --- | --- |
| AC1 | Name validator checks uniqueness and disallows profanity placeholder list | Implemented | src/engine/BrutoNameValidator.ts:17-37, src/utils/validators.ts:60-79 |
| AC2 | Appearance generator cycles through 10 base designs and color variants | Implemented | src/data/appearances.json:1-10, src/engine/AppearanceGenerator.ts:18-44 |
| AC3 | Initial stats seeded with automatic first level-up roll | **Partial** | Stats seeded in src/engine/BrutoFactory.ts:27-55 but level-up only logs at src/engine/BrutoFactory.ts:73-75 |
**Task Completion Validation**
| Task / Subtask | Marked As | Verified As | Evidence |
| Task 1 | [x] | Verified complete | Validators + repository checks at src/engine/BrutoNameValidator.ts:17-37, integration via src/scenes/BrutoSelectionScene.ts:435-441 |
| Task 2 | [x] | Verified complete (optional 2.4 still open) | Randomization and preview at src/engine/AppearanceGenerator.ts:18-44, src/scenes/BrutoSelectionScene.ts:443-458 |
| Task 3 | [x] | **Not done (3.3)** | Factory wiring at src/engine/BrutoFactory.ts:21-55, creation flow at src/scenes/BrutoSelectionScene.ts:418-469, but level-up missing (see Finding above) |
**Test Coverage and Gaps**
- ✅ `npm run lint`
- ✅ `npm run test`
- Unit tests cover validator, factory, and appearance generator (`src/engine/*.test.ts`). No automated coverage yet for creation flow UI or progression integration.
**Architectural Alignment**
- Factory/validator/services follow patterns from architecture.md (GRASP Creator, layered separation).  
- BrutoRepository now hydrates skills, aligning with data layer responsibilities.
- Level-up integration should hook into the planned ProgressionEngine per docs/GDD.md#10-game-mechanics.
**Security Notes**
- Inputs validated for length and profanity; no new security risks introduced.
**Best-Practices and References**
- appearance definitions stored in `src/data/appearances.json` per architecture documentation.
### Action Items
**Code Changes Required:**
- [ ] [High] Replace the placeholder log in `BrutoFactory.triggerInitialLevelUp` with real progression logic (or a dedicated stub invoking the planned `ProgressionEngine`) so the mandated first level-up roll actually occurs (`src/engine/BrutoFactory.ts:62-75`).
**Advisory Notes:**
- None.
