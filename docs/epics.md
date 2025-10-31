# Bruto - Epic Breakdown

**Author:** vice  
**Date:** 2025-10-30  
**Project Level:** 3  
**Target Scale:** Solo project – faithful remake of El Bruto

---

## Overview

This epic breakdown translates the high-level plan from `docs/GDD.md` into a tactical roadmap. Each epic preserves the cadence and systems of the original El Bruto while sequencing implementation so we can prototype combat early, then layer progression.

**Epic Sequencing Principles**

- Epic 1 establishes tooling, storage, and reusable UI building blocks.
- Epic 2 unlocks account + profile flows so progress persists.
- Epic 3 delivers the Casillero experience: create, inspect, and manage brutos.
- Epic 4 brings the combat sandbox online with faithful stat math and RNG spectacle.
- Later epics add weapons, skills, pets, progression, economy, and replays.
- Stories are vertically sliced; each delivers a playable or testable slice that mirrors classic behaviour.

---

## Epic 1: Project Foundations & Infrastructure

**Expanded Goal**  
Stand up the baseline Vite + Phaser project, local database layer, and shared UI systems that every other epic depends on.

**Story Breakdown**

**Story 1.1: Project Skeleton Bootstrapped**  
As a developer, I want a configured Phaser + Vite TypeScript project with lint/build scripts so that every feature can compile and hot-reload reliably.  
**Acceptance Criteria**
1. Vite/Phaser project builds and runs `npm run dev`.
2. Shared UI theme variables defined (colors, typography, spacing).
3. Basic scene loader supports switching between placeholder screens.  
**Prerequisites:** None.

**Story 1.2: Local Database Layer Online**  
As a developer, I want the sql.js persistence layer configured with migrations so that I can store users, brutos, fights, and replays offline.  
**Acceptance Criteria**
1. Database schema files cover users, brutos, stats, weapons, skills, pets, battles, replays.
2. Migration runner initializes schema on first launch.
3. CRUD helpers exposed for future epics (`insertBruto`, `recordBattle`, etc.).  
**Prerequisites:** Story 1.1.

**Story 1.3: UI Shell & Navigation**  
As a player, I want a responsive layout with header, main content, and modal dialogs so that every screen feels cohesive and ready for content.  
**Acceptance Criteria**
1. Layout handles desktop 16:9 gracefully; scales down to tablet without overlap.
2. Navigation state machine swaps between placeholder screens (Login, Casillero, Arena, Replay).
3. Global audio toggle & settings drawer wired (stubbed, no logic yet).  
**Prerequisites:** Story 1.1.

---

## Epic 2: Account & Profile Management

**Expanded Goal**  
Allow users to register, log in, and manage up to four brutos with progress saved locally—mirroring the original account structure.

**Story Breakdown**

**Story 2.1: Account Creation & Login Flow**  
As a player, I want to create an account with username + password (hashed locally) so that my roster persists between sessions.  
**Acceptance Criteria**
1. Registration form validates uniqueness, empty fields, and minimum password length.
2. Passwords hashed with bcryptjs before storage.
3. Successful login routes to Casillero; failed login shows error state.  
**Prerequisites:** Story 1.2.

**Story 2.2: Bruto Slot Management**  
As a player, I want to view my available bruto slots, unlock additional slots with coins, and delete unwanted brutos so that roster management matches El Bruto.  
**Acceptance Criteria**
1. Default state: three slots; fourth slot locked behind 500 coins.
2. Slot unlock updates DB and UI instantly; cannot exceed four slots.
3. Deleting a bruto confirms action and removes related data (stats, history).  
**Prerequisites:** Story 2.1.

**Story 2.3: Daily Fight Limit Tracking**  
As a player, I need the six daily fight limit enforced across my account so that pacing matches the original.  
**Acceptance Criteria**
1. Fight counter decrements on battle start; locks selection after six fights.
2. Daily reset timer (UTC) restores fights and updates UI.
3. Counter persists across reloads via database.  
**Prerequisites:** Story 1.2.

---

## Epic 3: Character Creation & Casillero

**Expanded Goal**  
Recreate the iconic Casillero interface where players generate brutos, inspect stats, view weapons/skills grid, and scan battle history.

**Story Breakdown**

**Story 3.1: Bruto Creation Flow**  
As a player, I want to create a bruto with a unique name and randomized appearance so that onboarding feels identical to El Bruto.  
**Acceptance Criteria**
1. Name validator checks uniqueness and disallows profanity placeholder list.
2. Appearance generator cycles through the documented 10 base designs × color variants.
3. Initial stats seeded (HP 60, STR 2, Speed 2, Agility 2) with first level-up roll triggered automatically.  
**Prerequisites:** Story 2.2.

**Story 3.2: Casillero UI Recreation**  
As a player, I want the Casillero screen with stat panel, weapon rack, skill grid, and battle log so that managing a bruto mirrors the classic layout.  
**Acceptance Criteria**
1. Grid layout matches reference screenshots for proportions and placements.
2. Weapon slots show current arsenal with tooltip overlays referencing `habilidades-catalogo.md`.
3. Battle log lists last eight fights (stubbed data until Epic 12).  
**Prerequisites:** Story 3.1.

**Story 3.3: Stat & Upgrade Display Logic**  
As a player, I want to see my bruto’s current stats, pets, and passive modifiers reflecting every upgrade so that I can plan future builds.  
**Acceptance Criteria**
1. Stat panel pulls real values from DB (HP, STR, Speed, Agility, resistances).
2. Icon chips display acquired pets/multipliers with inline descriptions.
3. Level-up history view lists choices taken per level (A/B options).  
**Prerequisites:** Story 3.2.

---

## Epic 4: Core Combat Engine

**Expanded Goal**  
Deliver the auto-battle system with faithful stat math, weapon and skill hooks, and animation pacing that nails the “fast and unpredictable” fantasy.

**Story Breakdown**

**Story 4.1: Turn Scheduler & RNG Framework**  
As a developer, I want a deterministic-yet-seeded combat loop that handles initiative, multi-turns, and randomness exactly like El Bruto so that future systems plug in cleanly.  
**Acceptance Criteria**
1. Initiative interval logic reflects Speed-driven extra turns (per `stast.md` guidance).
2. RNG service seeded per fight; ensures replayable sequences for Epic 12.
3. Combat resolves to win/lose state with damage events logged.  
**Prerequisites:** Story 1.2, Story 3.3.

**Story 4.2: Stat-Based Damage & Evasion**  
As a player, I need base attacks, dodges, criticals, and multi-hit chances to follow the documented formulas so that fights feel authentic.  
**Acceptance Criteria**
1. Damage uses STR ± weapon modifiers; agility influences accuracy/evasion.
2. Critical strikes (x2) trigger per documented odds; logged in battle feed.
3. Multi-hit events triggered via Speed/skill modifiers and animated distinctly.  
**Prerequisites:** Story 4.1.

**Story 4.3: Combat Presentation Layer**  
As a player, I want polished battle visuals—camera framing, hit effects, floating damage text—so that watching fights is exciting even without inputs.  
**Acceptance Criteria**
1. Sprites animate with hit, dodge, and defeat states; no frozen frames.
2. Damage numbers color-code crits/dodges; timeline persists for replays.
3. Battle UI displays current turn, remaining HP bars, and fight outcome banner.  
**Prerequisites:** Story 4.2.

---

## Future Epics (High-Level Targets)

We will elaborate these epics once combat foundations stabilize. High-level goals are pulled directly from `docs/GDD.md`.

- **Epic 5: Weapons System** – Implement full weapon catalog with category behaviors, reach, odds, and disarm stats.
- **Epic 6: Skills System** – Wire the ~40 skill effects, activation odds, and stacking logic using the catalog.
- **Epic 7: Pets System** – Introduce pets with their stat impacts, combat AI turns, and resistance trade-offs.
- **Epic 8: Progression & Leveling** – Level-up option generator, XP curve, upgrade application, and UI.
- **Epic 9: Matchmaking & Opponents** – Local ghost pool, same-level filtering, opponent rotation.
- **Epic 10: UI/UX Polish** – Final art, casillero finesse, fight intro/outro animations, accessibility.
- **Epic 11: Economy & Daily Limits** – Coin rewards, slot purchases, timers, daily reset handshake.
- **Epic 12: Battle Replay System** – Persist fight logs, replay viewer, share/export hooks.

Each future epic will receive interactive story breakdowns before development begins.

---

## Story Guidelines Reference

Stories are sized for focused sessions (≈2–4 hours). Each includes:

```
**Story [EPIC.N]: [Story Title]**

As a [user type],
I want [goal/desire],
So that [benefit/value].

**Acceptance Criteria:**
1. [Specific testable criterion]
2. ...

**Prerequisites:** [Dependencies, if any]
```

Use the `create-story` workflow to expand backlog items into full implementation briefs once sprint planning begins.
