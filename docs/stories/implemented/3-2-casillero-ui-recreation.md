# Story 3.2: Casillero UI Recreation

Status: review

## Story

As a player,
I want the Casillero screen with stat panel, weapon rack, skill grid, and battle log,
so that managing a bruto mirrors the classic layout.

## Requirements Context Summary

### Requirement Sources
- `docs/epics.md` — Epic 3 Story 3.2 defines Casillero UI requirements and acceptance criteria (grid layout matching reference, weapon slots with tooltips, battle log stubbed).
- `docs/GDD.md` — Section 13 describes the Casillero visual aesthetic and Section 10 details the UI elements needed.
- `docs/architecture.md` — Section 5 maps BrutoDetailsScene to Epic 10 (UI/UX) with Casillero as the main character management interface.

### Key Requirements
- Recreate Casillero (bruto details) screen layout matching original El Bruto proportions and placements.
- Display stat panel with current HP, STR, Speed, Agility, and Resistance values.
- Show weapon rack with current arsenal (empty slots initially, populated in Epic 5).
- Create 7×7 skill grid display (empty initially, populated in Epic 6).
- Add battle log panel listing last 8 fights (stubbed data until Epic 12).
- Implement tooltip overlays for weapons referencing habilidades-catalogo.md.
- Add navigation buttons to opponent selection and settings.

## Structure Alignment Summary

### Learnings from Previous Story

**From Story 3-1-bruto-creation-flow (Status: drafted)**

- **BrutoFactory Established**: Complex bruto instantiation with initial stats working
- **Appearance System**: Random design + color variant selection implemented
- **Validation Patterns**: Name validation with uniqueness and profanity checking functional
- **Navigation Flow**: Creation → BrutoDetailsScene routing established
- **Initial Stats**: HP 60, STR 2, Speed 2, Agility 2, Resistance 1.67 seeding confirmed

[Source: stories/3-1-bruto-creation-flow.md#Dev-Agent-Record]

- Casillero screen (BrutoDetailsScene) is the main hub after bruto creation or selection.
- Load bruto data via BrutoRepository using selected bruto ID from Zustand state.
- Weapon and skill grids will be populated in later epics, show empty state for now.

## Acceptance Criteria

1. Grid layout matches reference screenshots for proportions and placements.
2. Weapon slots show current arsenal with tooltip overlays referencing `habilidades-catalogo.md`.
3. Battle log lists last eight fights (stubbed data until Epic 12).

## Tasks / Subtasks

- [x] Task 1 (AC: 1) Build Casillero layout structure
  - [x] Subtask 1.1 Create BrutoDetailsScene with main grid layout (stat panel, weapons, skills, log)
  - [x] Subtask 1.2 Implement responsive positioning matching original proportions
  - [x] Subtask 1.3 Add bruto appearance sprite display with idle animation
  - [x] Subtask 1.4 Create navigation header with back button and settings access
  - [ ] Subtask 1.2 Implement responsive positioning matching original proportions
  - [x] Subtask 1.3 Add bruto appearance sprite display with idle animation
  - [x] Subtask 1.4 Create navigation header with back button and settings access

- [x] Task 2 (AC: 2) Implement weapon rack display
  - [x] Subtask 2.1 Create weapon slot grid component (initially empty)
  - [x] Subtask 2.2 Build tooltip overlay component for weapon details
  - [x] Subtask 2.3 Wire weapon data loading from BrutoRepository (populate in Epic 5)
  - [x] Subtask 2.4 Add empty state messaging "No weapons equipped"

- [x] Task 3 (AC: 3) Build skill grid and battle log
  - [x] Subtask 3.1 Create 7×7 skill grid layout (initially empty)
  - [x] Subtask 3.2 Build battle log panel with scrollable list
  - [x] Subtask 3.3 Generate stubbed battle log data (8 placeholder fights)
  - [x] Subtask 3.4 Add empty states for skill grid "No skills learned"

## Story Body

### Implementation Outline
1. Create BrutoDetailsScene extending Phaser.Scene with comprehensive layout grid.
2. Build stat panel component displaying all bruto stats from database.
3. Implement weapon rack component with empty slots and tooltip system.
4. Create 7×7 skill grid using Phaser containers and grid layout math.
5. Build battle log component with scrollable list of last 8 fights (stub data).
6. Add bruto appearance sprite display with idle animation from spritesheet.
7. Wire data loading from BrutoRepository on scene start using selected bruto from Zustand.
8. Implement navigation: back to BrutoSelectionScene, forward to OpponentSelectionScene.
9. Add empty state messaging for weapons and skills grids.

## Dev Notes

### Learnings from Previous Story

- **Bruto Data Available**: BrutoRepository provides complete bruto data including stats
- **Appearance System**: Design + color variant can be used to load correct spritesheet
- **UI Components**: Reusable Panel, Button, Tooltip components from Story 1.3 available
- **Navigation Patterns**: Scene transitions via Zustand state + scene.start() established

Reference original El Bruto screenshots to match proportions, spacing, and visual hierarchy.

### Project Structure Notes

**Casillero Components**:
```
src/
  scenes/
    BrutoDetailsScene.ts      # Main Casillero screen
  components/
    StatPanel.ts              # Stat display component
    WeaponRack.ts             # Weapon slot grid
    SkillGrid.ts              # 7×7 skill display
    BattleLog.ts              # Last 8 fights list
    Tooltip.ts                # Weapon/skill hover overlay
```

### References

- Casillero is the central character management hub in the scene flow loop. [Source: docs/architecture.md#5-scene-architecture]
- 7×7 skill grid display for ~40-50 skills (grid accommodates future growth). [Source: docs/GDD.md#13-art-and-audio-direction]
- Last 8 battles displayed in battle log for quick history review. [Source: docs/GDD.md#10-game-mechanics]
- Weapon tooltips should reference weapon stats and categories from habilidades-catalogo.md. [Source: docs/epics.md#epic-3-character-creation--casillero]
- Empty states required for weapon rack and skill grid until those systems are implemented. [Source: docs/epics.md#epic-3-character-creation--casillero]

## Change Log

- 2025-10-30: Draft story created from epics/GDD/architecture sources with learnings from Stories 1.1-3.1.

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

- 2025-10-30T21:16:45Z Implementation Plan:
  - Establish `BrutoDetailsScene` layout scaffolding with panels matching classic Casillero proportions.
  - Create reusable UI components for stats, weapon rack, skill grid, battle log, and tooltips leveraging existing theme tokens.
  - Integrate scene with `BrutoRepository`/global store to hydrate UI and prepare for future dynamic data, including stub data where later epics will plug in.
  - Wire navigation hooks and empty states, then cover core rendering logic with targeted scene/component unit tests.
- 2025-10-30T21:18:30Z Responsive grid established:
  - Added design-space mapping with dynamic scaling to maintain legacy Casillero proportions across resolutions.
  - Introduced stacked fallback layout to protect readability on narrow viewports.
  - Ensured navigation copy scales with overall layout for consistent UX feedback.
- 2025-10-30T21:21:59Z Appearance and navigation systems wired:
  - Drew placeholder appearance texture keyed by bruto design/variant and layered idle tween for motion feedback.
  - Injected layout-aware navigation header with back and settings actions, broadcasting toggle events to UIScene.
  - Synchronized UIScene button handler with new global event channel to keep settings drawer state consistent.
- 2025-10-30T21:24:32Z Weapon rack scaffolded:
  - Added reusable `WeaponRack` UI component with 7-slot grid and empty-state messaging.
  - Anchored rack inside weapons panel with responsive sizing, ready for repository data wiring.
- 2025-10-30T21:28:14Z Weapon tooltips and data bridge:
  - Implemented generic `Tooltip` overlay and wired hover events on each slot referencing `docs/habilidades-catalogo.md`.
  - Hooked Casillero scene into `bruto_weapons` table via `DatabaseManager` to hydrate slots when data exists.
  - Normalized fallback messaging so empty slots still guide designers toward arsenal planning.
- 2025-10-30T21:30:38Z Skill grid & battle log pass:
  - Introduced `SkillGrid` component for 7x7 matrix with hover guidance tied to habilidades catalog.
  - Added scrollable `BattleLog` with eight stubbed bouts, wheel scrolling, and status badges.
  - Stub data wired to store-selected bruto so designers see context even before combat systems land.

### Completion Notes List

- Casillero layout now responsive across breakpoints with dedicated components for weapons, skills, and battle log; hover tooltips reference `docs/habilidades-catalogo.md`.
- Stub battle log and placeholder weapon data keep designers informed until real systems land; helper tests cover formatting logic.
- Test suite blocked by PowerShell execution policy (`npx vitest run`), manual run still pending once scripts are permitted.

### File List

- src/scenes/BrutoDetailsScene.ts
- src/scenes/BrutoDetailsScene.helpers.test.ts
- src/scenes/UIScene.ts
- src/ui/components/Tooltip.ts
- src/ui/components/WeaponRack.ts
- src/ui/components/SkillGrid.ts
- src/ui/components/BattleLog.ts
- docs/stories/3-2-casillero-ui-recreation.md
