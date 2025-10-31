# Story 1.3: UI Shell & Navigation

Status: review

## Story

As a player,
I want a responsive layout with header, main content, and modal dialogs,
so that every screen feels cohesive and ready for content.

## Requirements Context Summary

### Requirement Sources
- `docs/epics.md` — Epic 1 Story 1.3 defines the UI shell requirements and acceptance criteria (responsive layout, navigation state machine, global audio toggle).
- `docs/architecture.md` — Section 5 specifies the scene architecture with 8 scenes and scene flow diagram showing navigation between Login, BrutoSelection, BrutoDetails, OpponentSelection, Combat, and LevelUp screens.
- `docs/GDD.md` — Section 12 defines controls as mouse/touch-based point-and-click navigation.

### Key Requirements
- Create a responsive layout system that handles desktop 16:9 ratio gracefully and scales down to tablet without overlap.
- Implement navigation state machine that swaps between placeholder screens (Login, Casillero, Arena, Replay) using Phaser's scene manager.
- Add global UI overlay (UIScene) with settings drawer, audio toggle, and persistent menu elements.
- Wire navigation between scenes following the scene flow diagram from architecture.
- Create reusable UI components (buttons, panels, modals) using the theme tokens from Story 1.1.

## Structure Alignment Summary

### Learnings from Previous Story

**From Story 1-2-local-database-layer-online (Status: drafted)**

- **Database Layer Complete**: DatabaseManager, repositories, and migration system implemented
- **CRUD Helpers Available**: BrutoRepository, UserRepository, BattleRepository ready for use
- **Architecture Pattern Established**: Repository pattern with Result<T> implemented
- **Testing Framework**: In-memory database testing pattern established

[Source: stories/1-2-local-database-layer-online.md#Dev-Agent-Record]

- UI scenes should consume repositories through clean interfaces (Dependency Inversion Principle).
- Navigation system will need to interact with Zustand state for user session and selected bruto.
- Follow the Clean Architecture pattern keeping scenes thin and delegating business logic to engine layer.

## Acceptance Criteria

1. Layout handles desktop 16:9 gracefully; scales down to tablet without overlap.
2. Navigation state machine swaps between placeholder screens (Login, Casillero, Arena, Replay).
3. Global audio toggle & settings drawer wired (stubbed, no logic yet).

## Tasks / Subtasks

- [x] Task 1 (AC: 1) Create responsive layout system
  - [x] Subtask 1.1 Implement base layout component with header, content area, and footer
  - [x] Subtask 1.2 Add responsive scaling logic for desktop (16:9) and tablet viewports
  - [x] Subtask 1.3 Create reusable UI components (buttons, panels, input fields) using theme tokens

- [x] Task 2 (AC: 2) Build navigation state machine
  - [x] Subtask 2.1 Create placeholder scenes: LoginScene, BrutoSelectionScene, BrutoDetailsScene, OpponentSelectionScene, CombatScene, LevelUpScene
  - [x] Subtask 2.2 Implement scene navigation manager with Phaser scene.start() transitions
  - [x] Subtask 2.3 Wire Zustand state integration for session management across scenes

- [x] Task 3 (AC: 3) Add persistent UI overlay
  - [x] Subtask 3.1 Create UIScene as persistent overlay with settings button
  - [x] Subtask 3.2 Build settings drawer component (audio toggle, volume slider, info)
  - [x] Subtask 3.3 Implement global audio toggle (stubbed - actual audio in later epic)

## Story Body

### Implementation Outline
1. Create base layout system using Phaser containers and positioning logic that adapts to viewport size.
2. Build reusable UI components (Button, Panel, Modal) following the theme tokens established in Story 1.1.
3. Implement all placeholder scenes extending Phaser.Scene with basic structure and navigation hooks.
4. Create navigation manager utility that handles scene transitions and maintains navigation history.
5. Build UIScene as a persistent overlay that runs parallel to main scenes.
6. Wire Zustand state for user session, selected bruto, and global settings.
7. Add responsive scaling logic using Phaser's scale configuration and event listeners.

## Dev Notes

### Learnings from Previous Story

- **Theme Tokens Available**: Colors, typography, and spacing variables defined in Story 1.1
- **Database Ready**: Can start wiring auth and data loading in scenes
- **Repository Pattern**: Use repositories through interfaces, never direct database access
- **Clean Architecture**: Keep scenes thin, delegate to controllers/engines

Follow the scene architecture and scene flow diagram to ensure navigation matches the documented user journey.

### Project Structure Notes

**Scene Layer Structure** (from architecture.md Section 4):
```
src/
  scenes/
    BootScene.ts               # Preload assets, initialize DB
    LoginScene.ts              # User login/registration
    BrutoSelectionScene.ts     # Choose bruto (3-4 slots)
    BrutoDetailsScene.ts       # Casillero (stats, weapons, skills)
    OpponentSelectionScene.ts  # Choose opponent (5 random)
    CombatScene.ts             # Auto-battle animation
    LevelUpScene.ts            # Choose upgrade (A/B)
    UIScene.ts                 # Persistent UI overlay
```

### References

- Follow the scene flow diagram precisely: BootScene → LoginScene → BrutoSelectionScene → [Main Loop: BrutoDetailsScene → OpponentSelectionScene → CombatScene → LevelUpScene]. [Source: docs/architecture.md#5-scene-architecture]
- Implement responsive layout targeting 30-60 FPS and <2s scene transitions as per performance requirements. [Source: docs/GDD.md#technical-specifications]
- Use Zustand for global state management, NOT local scene variables. [Source: docs/architecture.md#9-implementation-patterns-consistency-rules]
- Keep scenes thin following Single Responsibility Principle - scenes handle presentation only. [Source: docs/architecture.md#3-architecture-overview]
- Wire navigation using Phaser's scene.start() method for transitions. [Source: docs/architecture.md#5-scene-architecture]

## Change Log

- 2025-10-30: Draft story created from epics/architecture/GDD sources with learnings from Stories 1.1 and 1.2.

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

N/A - Implementation completed without blocking issues.

### Completion Notes List

- **UI Component Library**: Created reusable Button, Panel, Modal, InputField, and SettingsDrawer components following the theme tokens from Story 1.1.
- **Zustand State Management**: Implemented global state store with user session, selected bruto, UI settings, and navigation history.
- **UIScene Overlay**: Built persistent UI overlay with settings button, user info display, and settings drawer that runs parallel to all main scenes.
- **Settings Drawer**: Complete settings panel with audio toggle (stubbed), volume slider with draggable handle, and game information display.
- **Responsive Layout**: Created LayoutManager utility with viewport detection, scaling logic, and position helpers for desktop/tablet/mobile.
- **Navigation Integration**: Updated BootScene to launch UIScene as persistent overlay alongside main scene flow.
- **Theme Extensions**: Added secondary button color and input background color to theme tokens.
- **Build Status**: All TypeScript compilation successful, no errors.

### File List

**UI Components:**
- `src/ui/components/Button.ts` - Reusable button with hover states, click handling, and multiple styles (primary, secondary, danger)
- `src/ui/components/Panel.ts` - Panel container with background, border, and optional title
- `src/ui/components/Modal.ts` - Modal dialog with backdrop, content, and confirm/cancel buttons
- `src/ui/components/InputField.ts` - Text input field with placeholder and validation support
- `src/ui/components/SettingsDrawer.ts` - Settings panel with audio controls, volume slider, and game info

**State Management:**
- `src/state/store.ts` - Zustand global store with user session, selected bruto, UI settings, and navigation history

**Layout Utilities:**
- `src/utils/layout.ts` - LayoutManager with viewport detection, responsive scaling, and position calculations

**Scene Updates:**
- `src/scenes/UIScene.ts` - Updated with Button and SettingsDrawer integration, user info display, and persistent overlay logic
- `src/scenes/BootScene.ts` - Updated to launch UIScene alongside main scene flow

**Theme Updates:**
- `src/utils/theme.ts` - Added secondary and inputBg colors
