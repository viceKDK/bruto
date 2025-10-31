# Story 4.3: Combat Presentation Layer

Status: completed

## Story

As a player,
I want polished battle visuals—camera framing, hit effects, floating damage text—so that watching fights is exciting even without inputs.

## Requirements Context Summary

### Requirement Sources
- `docs/epics.md` — Epic 4 Story 4.3 defines combat presentation requirements and acceptance criteria (sprite animations, damage numbers, battle UI).
- `docs/GDD.md` — Section 13 describes art style with 2D sprites and animation priorities (attack, hit, victory, defeat).
- `docs/architecture.md` — Section 7 details CombatAnimator as Phaser-specific layer consuming CombatEngine results.

### Key Requirements
- Animate bruto sprites with hit, dodge, attack, and defeat states.
- Display floating damage numbers color-coded for crits (red) and dodges (gray "MISS").
- Show HP bars updating in real-time as damage is applied.
- Implement camera framing keeping both combatants visible.
- Create battle UI showing current turn, combatant names, and fight outcome banner.
- Ensure animations don't freeze or skip frames (30-60 FPS target).
- Timeline persists for potential replay viewing in Epic 12.

## Structure Alignment Summary

### Learnings from Previous Story

**From Story 4-2-stat-based-damage-and-evasion (Status: drafted)**

- **Damage Formulas Complete**: DamageCalculator with STR-based damage, dodge, crit, multi-hit implemented
- **Action Resolution**: ActionResolver integrating damage calculations with combat flow
- **Event Logging**: All combat events (hit, dodge, critical, multi-hit) logged to CombatAction array
- **Seeded RNG Integration**: All probability checks using SeededRandom for determinism
- **Pure Engine Layer**: Combat logic completely independent of Phaser

[Source: stories/4-2-stat-based-damage-and-evasion.md#Dev-Agent-Record]

- CombatScene will consume CombatEngine results and animate using CombatAnimator.
- CombatAction array provides event timeline for animation sequencing.
- Phaser sprite animations (idle, attack, hit, defeat) will be created here.

## Acceptance Criteria

1. Sprites animate with hit, dodge, and defeat states; no frozen frames.
2. Damage numbers color-code crits/dodges; timeline persists for replays.
3. Battle UI displays current turn, remaining HP bars, and fight outcome banner.

## Tasks / Subtasks

- [x] Task 1 (AC: 1) Build sprite animation system
  - [x] Subtask 1.1 Create sprite placeholder animations for bruto: attack, hit, dodge, victory, defeat
  - [x] Subtask 1.2 Implement CombatAnimator service coordinating animation playback
  - [x] Subtask 1.3 Wire animation triggers to CombatAction events
  - [x] Subtask 1.4 Ensure smooth transitions with async/await pattern and callbacks

- [x] Task 2 (AC: 2) Implement damage number system
  - [x] Subtask 2.1 Create floating damage text component with color coding (red crit, white normal, gray miss)
  - [x] Subtask 2.2 Use object pooling for damage number sprites (DamageNumberPool with auto-expand)
  - [x] Subtask 2.3 Add tween animations for damage numbers (float up, fade out, scale for crits)
  - [x] Subtask 2.4 CombatAction timeline preserved in BattleResult for replay capability

- [x] Task 3 (AC: 3) Build battle UI and camera system
  - [x] Subtask 3.1 Create HP bar components with smooth tween animations and color coding
  - [x] Subtask 3.2 Display current turn counter and combatant names
  - [x] Subtask 3.3 Implement camera framing with arena layout (player left, opponent right)
  - [x] Subtask 3.4 Create outcome banner (Victory/Defeat) with XP display and stats

## Story Body

### Implementation Outline
1. Create CombatScene extending Phaser.Scene as presentation layer.
2. Load bruto sprites and create sprite objects for player and opponent.
3. Build sprite animation frames for idle, attack, hit, dodge, victory, defeat states.
4. Create CombatAnimator utility coordinating animation playback with combat events.
5. Implement DamageNumberPool using object pooling pattern for performance (architecture.md Section 13).
6. Build floating damage text with color coding and tween animations (float up, fade).
7. Create HP bar components with smooth transitions using Phaser tweens.
8. Implement battle UI overlay showing turn count, combatant info, and HP.
9. Add outcome banner modal displaying victory/defeat and XP gained.
10. Wire CombatEngine execution to CombatAnimator playback with async/await for timing.
11. Store animation timeline for replay system integration in Epic 12.

## Dev Notes

### Learnings from Previous Story

- **Combat Engine Complete**: Pure TypeScript engine producing CombatAction timeline
- **Event Data Rich**: Each CombatAction contains all info needed for animation (attacker, action type, damage, HP)
- **Deterministic Flow**: Seeded RNG enables identical replay playback
- **Performance Focused**: Object pooling pattern established in architecture

Separate presentation completely from logic - CombatScene only animates, never computes game state.

### Project Structure Notes

**Combat Presentation Structure** (from architecture.md Section 7):
```
src/
  scenes/
    CombatScene.ts            # Main battle presentation
  engine/
    combat/
      CombatAnimator.ts       # Animation coordinator (Phaser-specific)
  components/
    DamageNumber.ts           # Floating damage text
    HealthBar.ts              # HP bar component
    DamageNumberPool.ts       # Object pool for performance
```

### References

- CombatAnimator is Phaser-specific layer consuming CombatEngine results (separation of concerns). [Source: docs/architecture.md#7-combat-system-architecture]
- Use object pooling for damage numbers to maintain 60 FPS performance target. [Source: docs/architecture.md#13-performance-considerations]
- Animation priority: Attack, hit, idle are critical; victory/defeat high priority. [Source: docs/GDD.md#13-art-and-audio-direction]
- Target 30-60 FPS during combat animations per performance requirements. [Source: docs/GDD.md#technical-specifications]
- CombatAction timeline persists for replay system in Epic 12. [Source: docs/architecture.md#7-combat-system-architecture]

## Change Log

- 2025-10-30: Draft story created from epics/GDD/architecture sources with learnings from Stories 1.1-4.2.
- 2025-10-30: Implementation complete - Full combat presentation layer with animations, UI components, and orchestration.
- 2025-10-30: Integration complete - Connected OpponentSelectionScene to CombatScene with proper data flow. Status changed to completed.

## Dev Agent Record

### Context Reference

No context file available - implemented from story file, GDD, and architecture docs with learnings from Stories 4.1-4.2.

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

**Implementation Approach:**
1. Built HealthBar component with smooth tween animations and color-coded HP display (green/yellow/red based on percentage)
2. Created DamageNumber component with color coding (white normal, red crit, gray miss) and float-up fade-out animations
3. Implemented DamageNumberPool using object pooling pattern for 60 FPS performance target (auto-expands when needed)
4. Built CombatAnimator coordinating all battle animations from CombatAction timeline
5. Integrated CombatEngine with presentation layer - engine computes, animator displays
6. Created full CombatScene orchestrating battle flow: setup → execute → animate → outcome
7. Added turn counter, combatant names, HP bars, and outcome banner UI
8. Used placeholder sprite rectangles (actual sprite art in future story)
9. Async/await pattern ensures smooth sequential animation playback

**Key Technical Decisions:**
- Complete separation: CombatEngine (logic) never touches Phaser, CombatScene (presentation) never computes state
- Object pooling for damage numbers maintains performance with many simultaneous hits
- Async playAction pattern allows sequential animation with natural timing
- HP bar animations use Phaser tweens for smooth transitions (300ms duration)
- Damage numbers scale larger for crits (1.3x), float up 80px over 1200ms
- Camera shake on critical hits for impact feel
- Flash effects on hit (red tint) and dodge (alpha fade)
- Victory/defeat animations play after combat complete
- Battle timeline preserved in BattleResult for Epic 12 replay system

**Animation Sequence:**
1. Attacker moves forward (200ms)
2. Attack animation plays (scale effect 100ms)
3. Hit effect on defender (flash + shake)
4. Damage number spawns and floats
5. HP bar updates with tween (300ms)
6. Attacker returns to position (200ms)
7. 200ms delay before next action

**Performance:**
- Object pool starts at 15 damage numbers, expands as needed
- All tweens use Power2 easing for smooth motion
- No frozen frames - async/await ensures animations complete before progressing
- Turn counter updates in real-time during battle playback

### Completion Notes List

✅ **AC1: Sprites animate with hit, dodge, and defeat states; no frozen frames** - Placeholder sprite rectangles with tween animations (move, scale, tint, alpha). Attacker moves forward/back, defender flashes red on hit, dodge shows alpha fade. Victory/defeat animations implemented. Async/await pattern prevents frozen frames.

✅ **AC2: Damage numbers color-code crits/dodges; timeline persists for replays** - DamageNumber component with red (crit), white (normal), gray (miss). Float-up fade-out animation (80px over 1200ms). Object pooling with auto-expand (starts 15, grows as needed). CombatAction timeline stored in BattleResult for Epic 12 replay capability.

✅ **AC3: Battle UI displays current turn, remaining HP bars, and fight outcome banner** - Turn counter shows "Turn X / Total" during battle. HP bars update with smooth tweens, color-coded (green/yellow/red). Combatant names displayed above sprites. Outcome banner shows Victory/Defeat, XP gained (+2 win, +1 loss), turn count, HP remaining. Continue button navigates to level up.

**Complete Presentation Layer:**
- CombatScene orchestrates full battle flow
- CombatAnimator coordinates all animations
- HealthBar component with smooth transitions
- DamageNumber + Pool system for performance
- Battle outcome UI with stats display
- Clean separation: engine computes, presentation displays

### File List

**New Files:**
- src/components/HealthBar.ts - HP bar component with tween animations (198 lines)
- src/components/DamageNumber.ts - Floating damage text with object pooling (148 lines)
- src/engine/combat/CombatAnimator.ts - Animation coordinator (304 lines)

**Modified Files:**
- src/scenes/CombatScene.ts - Complete combat presentation scene (299 lines)
- src/scenes/OpponentSelectionScene.ts - Added data flow to CombatScene with player/opponent combatants
- docs/stories/4-3-combat-presentation-layer.md - Updated status and completion notes

**Fixes Applied:**
- Fixed TypeScript errors in HealthBar (this.currentHp / this.maxHp references)
- Fixed TypeScript error in DamageNumber (removed unused initialSize property)
- Connected OpponentSelectionScene → CombatScene with proper IBrutoCombatant data
- All story 4.3 files now compile without errors

**Integration Points:**
- CombatScene consumes CombatEngine (Story 4.1) for battle logic
- Uses DamageCalculator (Story 4.2) formulas via engine results
- BattleResult.rngSeed preserved for Epic 12 replay system
- CombatAction timeline provides event-by-event animation sequence
- Placeholder sprites ready for actual sprite art in future story
