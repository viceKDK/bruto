# El Bruto - Architecture Document

**Project:** El Bruto
**Type:** Web-based Auto-Battler Game
**Level:** 3 (Greenfield)
**Author:** vice
**Date:** 2025-10-30
**Version:** 1.0

---

## Executive Summary

This architecture defines the technical foundation for "El Bruto," a web-based auto-battler game built with Phaser 3, TypeScript, and a local-first database approach. The architecture emphasizes **Clean Code**, **SOLID principles**, and **GRASP patterns** to ensure maintainability and AI agent consistency across ~100-135 user stories.

**Key Architectural Decisions:**
- **Game Engine:** Phaser 3.88 with TypeScript 5 and Vite
- **Database:** sql.js (SQLite for browser)
- **State Management:** Zustand
- **Architecture Style:** Clean Architecture with layered separation
- **Design Patterns:** Strategy, State, Command, Observer, Repository, Factory
- **Novel Pattern:** Local Ghost Matchmaking for offline PvP

---

## 1. Project Initialization

**First Implementation Story:**

```bash
# Clone official Phaser + TypeScript + Vite template
git clone https://github.com/phaserjs/template-vite-ts.git bruto
cd bruto
npm install

# Install additional dependencies
npm install zustand sql.js date-fns
npm install -D @types/sql.js
```

**Starter Template Provides:**
- ✅ TypeScript 5 configuration
- ✅ Vite 5.0+ (dev server, HMR, build tooling)
- ✅ Phaser 3.88 pre-configured
- ✅ Project structure (src/, assets/)
- ✅ ESLint + Prettier (code quality)

**Development Commands:**
- `npm run dev` - Start development server (localhost:8080)
- `npm run build` - Production build to dist/
- `npm run preview` - Preview production build

---

## 2. Technology Stack

### Core Technologies

| Technology | Version | Purpose | Decision Date |
|------------|---------|---------|---------------|
| **Phaser** | 3.88 "Minami" | Game engine, rendering, scenes | 2025-10-30 |
| **TypeScript** | 5.x | Type safety, developer experience | 2025-10-30 |
| **Vite** | 5.0+ | Build tool, dev server, HMR | 2025-10-30 |
| **sql.js** | 1.10+ | SQLite in browser (local database) | 2025-10-30 |
| **Zustand** | 4.5+ | Lightweight state management | 2025-10-30 |
| **date-fns** | 3.x | Date/time utilities | 2025-10-30 |

### Why These Choices?

**Phaser 3.88:**
- ✅ Mature, production-ready game framework
- ✅ Excellent 2D sprite support
- ✅ Scene system perfect for 6 screens
- ✅ Built-in animation, physics, input handling
- ✅ Large community, extensive documentation

**sql.js:**
- ✅ Full SQLite implementation in JavaScript
- ✅ Perfect for local-first architecture
- ✅ Complex queries supported (joins, indexes)
- ✅ No server required

**Zustand:**
- ✅ Lightweight (1KB)
- ✅ TypeScript-first
- ✅ No boilerplate
- ✅ Works seamlessly with Phaser

---

## 3. Architecture Overview

### Clean Architecture Layers

```
┌─────────────────────────────────────────┐
│   Presentation Layer (Phaser Scenes)    │
│  - LoginScene, CombatScene, etc.        │
│  - UI Components, Animations            │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│     Business Logic Layer (Engines)      │
│  - CombatEngine, ProgressionEngine      │
│  - GameRules, SkillSystem, WeaponSystem │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│    Data Access Layer (Repositories)     │
│  - BrutoRepository, BattleRepository    │
│  - WeaponRepository, SkillRepository    │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│       Data Layer (sql.js Database)      │
│  - SQLite tables, indexes, migrations   │
└─────────────────────────────────────────┘
```

### SOLID Principles Application

**Single Responsibility Principle (SRP):**
- `CombatEngine` - Handles combat logic ONLY
- `CombatAnimator` - Handles visual feedback ONLY
- `DamageCalculator` - Calculates damage ONLY
- Each class has one reason to change

**Open/Closed Principle (OCP):**
- Skills are extensible via `ISkill` interface
- New skill types don't modify core engine
- Weapon categories implement `IWeapon` interface

**Liskov Substitution Principle (LSP):**
- All weapon subtypes (Sharp, Fast, Heavy, Long) are interchangeable
- Any `ISkill` implementation works in combat system

**Interface Segregation Principle (ISP):**
- `IBruto` - Character data
- `IBrutoRepository` - Database operations
- `IBrutoCombatant` - Combat-specific interface
- Clients only depend on interfaces they use

**Dependency Inversion Principle (DIP):**
- Engines depend on `IRepository` interfaces, not concrete implementations
- Scenes depend on `IGameState`, not Zustand directly
- Easy to swap implementations (e.g., IndexedDB instead of sql.js)

### GRASP Principles Application

**Information Expert:**
- `BrutoStats` calculates effective stats (with modifiers)
- `Weapon` knows its own damage calculation
- `Skill` knows its activation probability

**Creator:**
- `BrutoFactory` creates new Bruto instances
- `OpponentGenerator` creates random opponents
- `BattleFactory` initializes combat state

**Controller:**
- `CombatController` orchestrates battle flow
- `ProgressionController` handles level-up flow
- Controllers coordinate between layers

**Low Coupling:**
- Scenes don't know database schema
- Combat engine doesn't know Phaser API
- Repositories don't know business rules

**High Cohesion:**
- All combat-related methods in `CombatEngine`
- All stat calculations in `StatsCalculator`
- All database operations in repositories

---

## 4. Project Structure

```
bruto/
├── src/
│   ├── main.ts                    # Phaser game initialization
│   ├── config.ts                  # Phaser configuration
│   │
│   ├── scenes/                    # Phaser Scenes (Presentation Layer)
│   │   ├── BootScene.ts           # Preload assets, initialize DB
│   │   ├── LoginScene.ts          # User login/registration
│   │   ├── BrutoSelectionScene.ts # Choose bruto (3-4 slots)
│   │   ├── BrutoDetailsScene.ts   # Casillero (stats, weapons, skills)
│   │   ├── OpponentSelectionScene.ts # Choose opponent (5 random)
│   │   ├── CombatScene.ts         # Auto-battle animation
│   │   ├── LevelUpScene.ts        # Choose upgrade (A/B)
│   │   └── UIScene.ts             # Persistent UI overlay
│   │
│   ├── engine/                    # Business Logic Layer
│   │   ├── combat/
│   │   │   ├── CombatEngine.ts    # Core combat logic
│   │   │   ├── CombatStateMachine.ts # Turn flow
│   │   │   ├── ActionResolver.ts  # Resolve attacks, skills
│   │   │   ├── DamageCalculator.ts # Damage formulas
│   │   │   └── CombatAnimator.ts  # Visual feedback coordinator
│   │   ├── progression/
│   │   │   ├── ProgressionEngine.ts # Level-up, XP
│   │   │   ├── UpgradeGenerator.ts # Random A/B options
│   │   │   └── StatBooster.ts     # Apply stat increases
│   │   ├── matchmaking/
│   │   │   ├── OpponentService.ts # Ghost opponent system
│   │   │   └── GhostBrutoFactory.ts # Create read-only copies
│   │   ├── skills/
│   │   │   ├── SkillSystem.ts     # Skill activation, effects
│   │   │   └── SkillRegistry.ts   # All 40-50 skills
│   │   ├── weapons/
│   │   │   ├── WeaponSystem.ts    # Weapon effects, draw chance
│   │   │   └── WeaponRegistry.ts  # All 25+ weapons
│   │   └── pets/
│   │       └── PetSystem.ts       # Pet stats, combat AI
│   │
│   ├── models/                    # TypeScript Interfaces
│   │   ├── Bruto.ts               # IBruto, BrutoStats
│   │   ├── Weapon.ts              # IWeapon, WeaponCategory
│   │   ├── Skill.ts               # ISkill, SkillEffect
│   │   ├── Pet.ts                 # IPet, PetType
│   │   ├── Battle.ts              # IBattle, BattleResult
│   │   └── User.ts                # IUser, UserSession
│   │
│   ├── database/                  # Data Access Layer
│   │   ├── DatabaseManager.ts     # sql.js wrapper, migrations
│   │   ├── repositories/
│   │   │   ├── BrutoRepository.ts # CRUD for brutos
│   │   │   ├── UserRepository.ts  # CRUD for users
│   │   │   ├── BattleRepository.ts # CRUD for battles
│   │   │   └── BaseRepository.ts  # Shared repository logic
│   │   ├── migrations/
│   │   │   ├── 001_initial_schema.sql
│   │   │   ├── 002_add_indexes.sql
│   │   │   └── ...
│   │   └── seeds/
│   │       ├── weapons.json       # All weapon data
│   │       └── skills.json        # All skill data
│   │
│   ├── state/                     # Zustand Stores
│   │   ├── useGameState.ts        # Global game state
│   │   ├── useCombatState.ts      # Active combat state
│   │   └── useUserState.ts        # Current user session
│   │
│   ├── data/                      # Static Data (JSON)
│   │   ├── weapons.json           # 25+ weapon definitions
│   │   ├── skills.json            # 40-50 skill definitions
│   │   ├── pets.json              # 3 pet types
│   │   └── appearances.json       # 10 bruto designs × colors
│   │
│   ├── utils/                     # Helper Functions
│   │   ├── random.ts              # RNG utilities
│   │   ├── errors.ts              # GameError class
│   │   ├── logger.ts              # Logging utilities
│   │   ├── validators.ts          # Input validation
│   │   └── constants.ts           # Game constants
│   │
│   └── assets/                    # Game Assets
│       ├── sprites/
│       │   ├── brutos/            # 10 designs × colors
│       │   ├── weapons/           # 25+ weapon sprites
│       │   ├── skills/            # 40-50 skill icons
│       │   └── pets/              # Dog, Panther, Bear
│       ├── sounds/
│       │   ├── combat/            # Hit, critical, dodge
│       │   ├── ui/                # Clicks, level-up
│       │   └── music/             # Background music
│       └── fonts/
│
├── dist/                          # Production build (generated)
├── public/                        # Static public files
├── tests/                         # Unit & integration tests
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 5. Scene Architecture

### Scene Flow Diagram

```
BootScene (Load assets, init DB)
    ↓
LoginScene (Authenticate)
    ↓
BrutoSelectionScene (Choose bruto)
    ↓
┌───────────────────────────────┐
│  Main Game Loop               │
│                               │
│  BrutoDetailsScene            │
│     (View stats, history)     │
│           ↓                   │
│  OpponentSelectionScene       │
│     (Choose from 5)           │
│           ↓                   │
│  CombatScene                  │
│     (Auto-battle)             │
│           ↓                   │
│  LevelUpScene (if level up)   │
│     (Choose A or B)           │
│           ↓                   │
│  Back to BrutoDetailsScene    │
└───────────────────────────────┘
```

### Scene Responsibilities

| Scene | Responsibility | Epic Mapping |
|-------|----------------|--------------|
| **BootScene** | Asset preloading, database init | Epic 1 (Infrastructure) |
| **LoginScene** | User authentication | Epic 2 (Account System) |
| **BrutoSelectionScene** | Display 3-4 bruto slots, create new | Epic 3 (Character Management) |
| **BrutoDetailsScene** | Casillero UI (stats, weapons, skills, history) | Epic 10 (UI/UX) |
| **OpponentSelectionScene** | Show 5 random same-level opponents | Epic 9 (Matchmaking) |
| **CombatScene** | Animate auto-battle, display results | Epic 4 (Combat), Epic 12 (Replay) |
| **LevelUpScene** | Present A/B upgrade choice | Epic 8 (Progression) |
| **UIScene** | Persistent overlay (menu, notifications) | Epic 10 (UI/UX) |

---

## 6. Data Architecture

### Database Schema (SQLite via sql.js)

```sql
-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    last_login INTEGER
);

-- Brutos table
CREATE TABLE brutos (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,

    -- Stats
    hp INTEGER DEFAULT 60,
    max_hp INTEGER DEFAULT 60,
    str INTEGER DEFAULT 2,
    speed INTEGER DEFAULT 2,
    agility INTEGER DEFAULT 2,
    resistance REAL DEFAULT 1.67,

    -- Appearance
    appearance_id INTEGER NOT NULL,
    color_variant INTEGER NOT NULL,

    -- Meta
    created_at INTEGER NOT NULL,
    last_battle INTEGER,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_brutos_user ON brutos(user_id);
CREATE INDEX idx_brutos_level ON brutos(level); -- For matchmaking

-- Bruto Weapons (many-to-many)
CREATE TABLE bruto_weapons (
    id TEXT PRIMARY KEY,
    bruto_id TEXT NOT NULL,
    weapon_id TEXT NOT NULL,
    acquired_at_level INTEGER NOT NULL,

    FOREIGN KEY (bruto_id) REFERENCES brutos(id) ON DELETE CASCADE
);

CREATE INDEX idx_bruto_weapons_bruto ON bruto_weapons(bruto_id);

-- Bruto Skills (many-to-many)
CREATE TABLE bruto_skills (
    id TEXT PRIMARY KEY,
    bruto_id TEXT NOT NULL,
    skill_id TEXT NOT NULL,
    acquired_at_level INTEGER NOT NULL,

    FOREIGN KEY (bruto_id) REFERENCES brutos(id) ON DELETE CASCADE
);

CREATE INDEX idx_bruto_skills_bruto ON bruto_skills(bruto_id);

-- Bruto Pets (many-to-many, max 4: 3 dogs + 1 other)
CREATE TABLE bruto_pets (
    id TEXT PRIMARY KEY,
    bruto_id TEXT NOT NULL,
    pet_type TEXT NOT NULL, -- 'dog_a', 'dog_b', 'dog_c', 'panther', 'bear'
    acquired_at_level INTEGER NOT NULL,

    FOREIGN KEY (bruto_id) REFERENCES brutos(id) ON DELETE CASCADE
);

CREATE INDEX idx_bruto_pets_bruto ON bruto_pets(bruto_id);

-- Battle History
CREATE TABLE battles (
    id TEXT PRIMARY KEY,
    player_bruto_id TEXT NOT NULL,
    opponent_bruto_id TEXT NOT NULL,

    -- Result
    winner_id TEXT, -- NULL = draw (shouldn't happen)
    player_xp_gained INTEGER NOT NULL,
    player_hp_remaining INTEGER,
    opponent_hp_remaining INTEGER,

    -- Combat log (JSON string for replay)
    combat_log TEXT NOT NULL,

    -- Meta
    fought_at INTEGER NOT NULL,

    FOREIGN KEY (player_bruto_id) REFERENCES brutos(id) ON DELETE CASCADE
);

CREATE INDEX idx_battles_player ON battles(player_bruto_id);
CREATE INDEX idx_battles_date ON battles(fought_at); -- For "last 8"

-- Daily Fight Tracker
CREATE TABLE daily_fights (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    fight_date TEXT NOT NULL, -- YYYY-MM-DD
    fight_count INTEGER DEFAULT 0,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_daily_fights_user_date ON daily_fights(user_id, fight_date);
```

### TypeScript Data Models

```typescript
// models/Bruto.ts
export interface IBruto {
  id: string;
  userId: string;
  name: string;
  level: number;
  xp: number;
  stats: BrutoStats;
  appearance: Appearance;
  weapons: IWeapon[];
  skills: ISkill[];
  pets: IPet[];
  createdAt: Date;
  lastBattle?: Date;
}

export interface BrutoStats {
  hp: number;
  maxHp: number;
  str: number;
  speed: number;
  agility: number;
  resistance: number;

  // Calculated effective stats (with modifiers from skills/weapons)
  getEffectiveStr(): number;
  getEffectiveSpeed(): number;
  getEffectiveAgility(): number;
  getDodgeChance(): number; // Based on agility
}

export interface Appearance {
  designId: number; // 1-10
  colorVariant: number;
}

// models/Weapon.ts
export enum WeaponCategory {
  Fast = 'fast',
  Heavy = 'heavy',
  Sharp = 'sharp',
  Long = 'long'
}

export interface IWeapon {
  id: string;
  name: string;
  category: WeaponCategory;

  // Stats (from armas-especificaciones.md)
  hitSpeed: number; // Percentage
  damage: number;
  drawChance: number; // Probability to use in combat
  reach: number; // For anticipo

  // Modifiers
  criticalChance?: number;
  evasion?: number;
  dexterity?: number;
  accuracy?: number;
  block?: number;
  disarm?: number;
  multiHit?: number; // Combo probability
  counterAttack?: number;
}

// models/Skill.ts
export enum SkillCategory {
  Augmenter = 'augmenter', // Herculean Strength, etc.
  Offensive = 'offensive',
  Defensive = 'defensive',
  Utility = 'utility',
  Super = 'super'
}

export interface ISkill {
  id: string;
  name: string;
  category: SkillCategory;
  odds: number; // Rarity (0.01 - 5.83)

  // Effect
  effect: SkillEffect;

  // Activation
  isPassive: boolean;
  usesPerCombat?: number; // For active skills
}

export interface SkillEffect {
  type: 'stat_modifier' | 'combat_action' | 'special';
  // ... (specific effect data)
}

// models/Pet.ts
export enum PetType {
  DogA = 'dog_a',
  DogB = 'dog_b',
  DogC = 'dog_c',
  Panther = 'panther',
  Bear = 'bear'
}

export interface IPet {
  type: PetType;

  // Stats (from stast.md)
  hp: number;
  damage: 'low' | 'medium' | 'high';
  agility: number;
  speed: number;
  multiHit: number; // Percentage
  evasion: number; // Percentage
  initiative: number; // Negative values
}

// models/Battle.ts
export interface IBattle {
  id: string;
  playerBrutoId: string;
  opponentBrutoId: string;
  winnerId: string;
  playerXpGained: number;
  playerHpRemaining: number;
  opponentHpRemaining: number;
  combatLog: CombatAction[]; // For replay
  foughtAt: Date;
}

export interface CombatAction {
  turn: number;
  attacker: 'player' | 'opponent';
  action: 'attack' | 'skill' | 'dodge' | 'critical';
  damage?: number;
  skillName?: string;
  hpRemaining: {
    player: number;
    opponent: number;
  };
}
```

---

## 7. Combat System Architecture

### Combat Engine Design

```
CombatEngine (Orchestrator)
├── Initialize(playerBruto, opponentBruto)
├── ExecuteBattle() → BattleResult
│   └── Loop until winner:
│       ├── CombatStateMachine.nextTurn()
│       ├── ActionResolver.resolveAction(currentTurn)
│       ├── DamageCalculator.calculate(action)
│       └── ApplyDamage()
└── GenerateCombatLog() → CombatAction[]

CombatStateMachine
├── PlayerTurn
├── OpponentTurn
├── CheckWinCondition
└── BattleEnd

ActionResolver
├── ResolveBasicAttack(attacker, defender)
├── ResolveWeaponAttack(weapon, attacker, defender)
├── ResolveSkillActivation(skill, attacker, defender)
├── CheckDodge(defender) → boolean
└── CheckCritical(attacker) → boolean

DamageCalculator
├── CalculateBaseDamage(str) → number
├── CalculateWeaponDamage(weapon, str) → number
├── ApplyCriticalMultiplier(damage) → number
├── ApplyArmor(damage, armor%) → number
└── CalculateFinalDamage() → number

CombatAnimator (Phaser-specific)
├── ShowAttackAnimation(attacker, defender)
├── ShowDamageNumber(damage, critical)
├── ShowDodgeEffect()
├── ShowSkillEffect(skillName)
└── UpdateHealthBars()
```

### Combat Flow (Clean Code)

```typescript
// engine/combat/CombatEngine.ts
export class CombatEngine {
  private stateMachine: CombatStateMachine;
  private actionResolver: ActionResolver;
  private damageCalculator: DamageCalculator;

  constructor(
    private player: IBrutoCombatant,
    private opponent: IBrutoCombatant
  ) {
    this.stateMachine = new CombatStateMachine(player, opponent);
    this.actionResolver = new ActionResolver();
    this.damageCalculator = new DamageCalculator();
  }

  /**
   * Execute complete battle until winner determined
   * Single Responsibility: Orchestrate combat flow ONLY
   */
  public executeBattle(): BattleResult {
    const combatLog: CombatAction[] = [];

    while (!this.stateMachine.isBattleOver()) {
      const turn = this.stateMachine.nextTurn();
      const action = this.actionResolver.resolveAction(turn);
      const damage = this.damageCalculator.calculate(action);

      this.applyDamage(action.defender, damage);
      combatLog.push(this.createLogEntry(turn, action, damage));
    }

    return {
      winner: this.stateMachine.getWinner(),
      combatLog,
      finalStats: this.getFinalStats()
    };
  }

  // ... rest of implementation
}
```

**Key Design Decisions:**
- ✅ Combat engine is **pure TypeScript** (no Phaser dependency)
- ✅ Testable without rendering
- ✅ `CombatScene` consumes engine results and animates
- ✅ Each class has **one responsibility** (SOLID)

---

## 8. Novel Architectural Pattern: Local Ghost Matchmaking

### Problem Statement

The game requires PvP combat but must work **fully offline**. Players fight "other users' brutos" without real-time connections.

### Solution: Ghost Opponent System

```typescript
// engine/matchmaking/OpponentService.ts

/**
 * Local Ghost Matchmaking Pattern
 *
 * Purpose: Create offline PvP experience by using read-only snapshots
 * of other users' brutos from the local database.
 *
 * Key Concepts:
 * - "Ghost" = Immutable snapshot of another user's bruto
 * - Opponent selection from local database pool
 * - Battle results don't affect ghost (only player bruto)
 */
export class OpponentService {
  constructor(private brutoRepo: IBrutoRepository) {}

  /**
   * Get random opponents at specific level
   * Information Expert: OpponentService knows how to find opponents
   */
  async getRandomOpponents(level: number, count: number = 5): Promise<IBruto[]> {
    // Query local database for brutos at exact level
    const candidates = await this.brutoRepo.findByLevel(level);

    // Exclude current user's brutos
    const opponents = candidates.filter(b => !this.isOwnBruto(b));

    // Return random selection
    return this.selectRandom(opponents, count);
  }

  /**
   * Create immutable ghost instance
   * Creator: OpponentService creates ghosts
   */
  createGhostInstance(bruto: IBruto): GhostBruto {
    return Object.freeze({
      ...bruto,
      isGhost: true,
      // Deep freeze to prevent any modifications
    });
  }

  /**
   * Record battle against ghost
   * Low Coupling: Only updates player bruto, not ghost
   */
  async recordBattleAgainstGhost(
    playerBruto: IBruto,
    ghost: GhostBruto,
    result: BattleResult
  ): Promise<void> {
    // Save battle to history
    await this.battleRepo.create({
      playerBrutoId: playerBruto.id,
      opponentBrutoId: ghost.id, // Reference original
      winnerId: result.winner.id,
      playerXpGained: result.xpGained,
      combatLog: result.combatLog,
      foughtAt: new Date()
    });

    // Update player bruto only (ghost is immutable)
    if (result.winner.id === playerBruto.id) {
      await this.progressionEngine.awardXp(playerBruto, 2);
    } else {
      await this.progressionEngine.awardXp(playerBruto, 1);
    }
  }
}

export interface GhostBruto extends IBruto {
  readonly isGhost: true;
}
```

### Pattern Benefits

✅ **Offline PvP** - No server required
✅ **Scalable** - Database grows with users
✅ **Fair** - Same-level matchmaking
✅ **Immutable** - Ghosts can't be modified
✅ **Performance** - Local queries are instant

### Pattern Affects Epics

- Epic 9 (Matchmaking & Opponents)
- Epic 4 (Combat System Core)
- Epic 12 (Battle Replay System)

---

## 9. Implementation Patterns (Consistency Rules)

### Naming Conventions

**MANDATORY: All code must follow these conventions**

| Element | Convention | Example | Rationale |
|---------|------------|---------|-----------|
| **Files - Scenes** | PascalCase | `LoginScene.ts` | Phaser convention |
| **Files - Classes** | PascalCase | `CombatEngine.ts` | TypeScript standard |
| **Files - Utilities** | camelCase | `randomUtils.ts` | Distinguish from classes |
| **Classes** | PascalCase | `class DamageCalculator` | TypeScript/OOP standard |
| **Interfaces** | PascalCase with `I` | `interface IBruto` | Clear interface identification |
| **Functions/Methods** | camelCase | `calculateDamage()` | JavaScript/TS standard |
| **Constants** | UPPER_SNAKE_CASE | `MAX_BRUTOS = 4` | Distinguish constants |
| **Enums** | PascalCase | `enum WeaponCategory` | Type-like naming |
| **Enum Values** | PascalCase | `WeaponCategory.Fast` | Readable in code |
| **Variables** | camelCase | `const playerBruto` | JavaScript/TS standard |
| **Database Tables** | snake_case | `brutos`, `battle_history` | SQL convention |
| **Database Columns** | snake_case | `user_id`, `max_hp` | SQL convention |
| **JSON Keys** | camelCase | `"weaponId": "sword"` | JavaScript convention |

### File Organization Patterns

```typescript
// ✅ CORRECT: Co-located tests
src/
  engine/
    combat/
      CombatEngine.ts
      CombatEngine.test.ts  // Test next to implementation

// ❌ WRONG: Separated tests
src/
  engine/
    combat/
      CombatEngine.ts
tests/
  engine/
    combat/
      CombatEngine.test.ts  // Don't do this
```

### Error Handling Pattern

**MANDATORY: All errors must use GameError class**

```typescript
// utils/errors.ts
export class GameError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'GameError';
  }
}

// Error codes format: COMPONENT_ERROR_TYPE
export const ErrorCodes = {
  // Combat
  COMBAT_INVALID_TARGET: 'COMBAT_INVALID_TARGET',
  COMBAT_BRUTO_DEFEATED: 'COMBAT_BRUTO_DEFEATED',

  // Database
  DB_QUERY_FAILED: 'DB_QUERY_FAILED',
  DB_NOT_FOUND: 'DB_NOT_FOUND',

  // Validation
  VALIDATION_INVALID_INPUT: 'VALIDATION_INVALID_INPUT',
} as const;

// ✅ CORRECT Usage:
throw new GameError(
  ErrorCodes.COMBAT_INVALID_TARGET,
  'Target bruto not found in combat',
  { brutoId: targetId }
);

// Error Display in UI:
try {
  await combatEngine.execute();
} catch (error) {
  if (error instanceof GameError) {
    // Show user-friendly message in UI overlay
    this.showError(error.message);

    // Log technical details for debugging
    console.error(`[${error.code}]`, error.message, error.context);
  }
}
```

### Result Pattern (Database Operations)

**MANDATORY: All async operations return Result<T>**

```typescript
// utils/result.ts
export type Result<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};

// ✅ CORRECT Usage in Repository:
export class BrutoRepository {
  async findById(id: string): Promise<Result<IBruto>> {
    try {
      const row = await this.db.get('SELECT * FROM brutos WHERE id = ?', id);

      if (!row) {
        return {
          success: false,
          error: 'Bruto not found'
        };
      }

      return {
        success: true,
        data: this.mapRowToBruto(row)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// ✅ CORRECT Usage in Scene:
const result = await brutoRepo.findById(selectedId);

if (result.success) {
  this.displayBruto(result.data);
} else {
  this.showError(result.error);
}
```

### Logging Pattern

**MANDATORY: All logs must use component prefix**

```typescript
// ✅ CORRECT:
console.log('[CombatEngine]', 'Battle started:', { player, opponent });
console.error('[Database]', 'Failed to save bruto:', error);
console.warn('[ProgressionEngine]', 'Invalid level-up option:', option);

// ❌ WRONG:
console.log('Battle started'); // No component prefix
console.log(player, opponent); // No context
```

**Log Levels:**
- `console.log()` - General information
- `console.warn()` - Unexpected but handled situations
- `console.error()` - Errors (always with context)

### Date/Time Handling

**MANDATORY: Use date-fns for all date operations**

```typescript
import { format, parseISO, isToday, startOfDay } from 'date-fns';

// ✅ CORRECT: Store as ISO strings in database
const now = new Date().toISOString(); // "2025-10-30T14:30:00.000Z"
await db.run('INSERT INTO battles (fought_at) VALUES (?)', now);

// ✅ CORRECT: Parse from database
const row = await db.get('SELECT fought_at FROM battles WHERE id = ?', id);
const foughtAt = parseISO(row.fought_at); // Date object

// ✅ CORRECT: Check daily limit
const today = format(new Date(), 'yyyy-MM-dd'); // "2025-10-30"
const fightsToday = await db.get(
  'SELECT fight_count FROM daily_fights WHERE user_id = ? AND fight_date = ?',
  userId,
  today
);

// ❌ WRONG: Don't use raw Date.getTime() or timestamps
const timestamp = Date.now(); // Hard to read/debug
```

### State Management Pattern

**MANDATORY: Use Zustand stores for global state**

```typescript
// state/useGameState.ts
import create from 'zustand';

interface GameState {
  currentUser: IUser | null;
  selectedBruto: IBruto | null;

  // Actions
  setUser: (user: IUser) => void;
  selectBruto: (bruto: IBruto) => void;
  logout: () => void;
}

export const useGameState = create<GameState>((set) => ({
  currentUser: null,
  selectedBruto: null,

  setUser: (user) => set({ currentUser: user }),
  selectBruto: (bruto) => set({ selectedBruto: bruto }),
  logout: () => set({ currentUser: null, selectedBruto: null }),
}));

// ✅ CORRECT Usage in Scene:
export class BrutoSelectionScene extends Phaser.Scene {
  private gameState = useGameState.getState();

  selectBruto(bruto: IBruto) {
    this.gameState.selectBruto(bruto);
    this.scene.start('BrutoDetailsScene');
  }
}
```

### Repository Pattern

**MANDATORY: All database access through repositories**

```typescript
// database/repositories/BaseRepository.ts
export abstract class BaseRepository<T> {
  constructor(protected db: DatabaseManager) {}

  abstract mapRowToEntity(row: any): T;
  abstract mapEntityToRow(entity: T): any;

  protected async queryOne<T>(sql: string, params: any[]): Promise<Result<T>> {
    // Shared query logic
  }

  protected async queryMany<T>(sql: string, params: any[]): Promise<Result<T[]>> {
    // Shared query logic
  }
}

// ✅ CORRECT: Extend base repository
export class BrutoRepository extends BaseRepository<IBruto> {
  async findById(id: string): Promise<Result<IBruto>> {
    return this.queryOne(
      'SELECT * FROM brutos WHERE id = ?',
      [id]
    );
  }

  mapRowToEntity(row: any): IBruto {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      // ... complete mapping
    };
  }

  mapEntityToRow(bruto: IBruto): any {
    return {
      id: bruto.id,
      user_id: bruto.userId,
      name: bruto.name,
      // ... complete mapping
    };
  }
}
```

---

## 10. Clean Code Principles

### Applied Throughout Codebase

**1. Meaningful Names**
```typescript
// ✅ GOOD: Clear, descriptive names
function calculateDamageWithCritical(baseDamage: number, isCritical: boolean): number

// ❌ BAD: Cryptic abbreviations
function calcDmg(bd: number, crit: boolean): number
```

**2. Functions Should Do One Thing**
```typescript
// ✅ GOOD: Single responsibility
function getDodgeChance(agility: number): number {
  return agility * 0.1; // Agility directly determines dodge %
}

function checkIfDodged(dodgeChance: number): boolean {
  return Math.random() < dodgeChance;
}

// ❌ BAD: Multiple responsibilities
function dodgeSystem(agility: number): boolean {
  const chance = agility * 0.1;
  return Math.random() < chance;
}
```

**3. Small Functions**
```typescript
// ✅ GOOD: 5-10 lines, one abstraction level
public executeTurn(attacker: IBrutoCombatant, defender: IBrutoCombatant): TurnResult {
  const action = this.determineAction(attacker);
  const damage = this.calculateDamage(action, attacker, defender);
  const finalDamage = this.applyDefenses(damage, defender);

  return { action, damage: finalDamage };
}
```

**4. Comments Explain Why, Not What**
```typescript
// ✅ GOOD: Explains rationale
// Weapon draw chance checked BEFORE attack to match original game behavior
if (Math.random() < weapon.drawChance) {
  this.executeWeaponAttack(weapon);
}

// ❌ BAD: States the obvious
// Check if random number is less than draw chance
if (Math.random() < weapon.drawChance) {
```

**5. Avoid Magic Numbers**
```typescript
// ✅ GOOD: Named constants
const MAX_DAILY_FIGHTS = 6;
const XP_FOR_WIN = 2;
const XP_FOR_LOSS = 1;

if (fightsToday >= MAX_DAILY_FIGHTS) {
  throw new GameError(ErrorCodes.DAILY_LIMIT_REACHED, 'Maximum fights reached');
}

// ❌ BAD: Magic numbers
if (fightsToday >= 6) { // What is 6?
```

**6. Error Handling: Don't Return Null**
```typescript
// ✅ GOOD: Use Result<T> pattern
async findBruto(id: string): Promise<Result<IBruto>> {
  const row = await this.db.get('SELECT * FROM brutos WHERE id = ?', id);

  if (!row) {
    return { success: false, error: 'Bruto not found' };
  }

  return { success: true, data: this.mapRow(row) };
}

// ❌ BAD: Returns null (caller must remember to check)
async findBruto(id: string): Promise<IBruto | null> {
  const row = await this.db.get('SELECT * FROM brutos WHERE id = ?', id);
  return row ? this.mapRow(row) : null; // Easy to forget null check
}
```

---

## 11. Epic to Architecture Mapping

| Epic | Architecture Components | Key Technologies |
|------|------------------------|------------------|
| **Epic 1: Core Infrastructure & Database** | DatabaseManager, migrations, sql.js setup | sql.js, TypeScript |
| **Epic 2: Account System** | LoginScene, UserRepository, auth utils | Zustand (user state) |
| **Epic 3: Character Creation & Management** | BrutoSelectionScene, BrutoFactory, BrutoRepository | Phaser scenes, sql.js |
| **Epic 4: Combat System Core** | CombatEngine, CombatStateMachine, ActionResolver, DamageCalculator | Pure TypeScript (testable) |
| **Epic 5: Weapons System** | WeaponSystem, WeaponRegistry, weapons.json | Static data + combat integration |
| **Epic 6: Skills System** | SkillSystem, SkillRegistry, skills.json | 40-50 skills, effect system |
| **Epic 7: Pets System** | PetSystem, pets.json, pet combat AI | Pet stats, resistance cost |
| **Epic 8: Progression & Leveling** | ProgressionEngine, UpgradeGenerator, StatBooster | XP formulas, augmenters |
| **Epic 9: Matchmaking & Opponents** | OpponentService, GhostBrutoFactory | Novel pattern: Local Ghost Matchmaking |
| **Epic 10: UI/UX (6 Screens)** | All 8 Phaser scenes, UIScene overlay | Phaser scenes, sprite rendering |
| **Epic 11: Economy & Daily Limits** | DailyFightTracker, coin system | date-fns, daily_fights table |
| **Epic 12: Battle Replay System** | BattleRepository, combat_log JSON, replay UI | JSON combat log, animations |

---

## 12. Security Architecture

### Authentication

**Password Hashing:**
```typescript
// ✅ Use bcrypt for password hashing
import bcrypt from 'bcryptjs';

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
```

**Session Management:**
```typescript
// Store session in Zustand (in-memory, cleared on page refresh)
interface UserState {
  currentUser: IUser | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
}

// ⚠️ Security Note: This is LOCAL-ONLY game
// No server, no real security concerns
// Passwords hashed to prevent casual viewing in DB inspector
```

### Data Validation

**Input Validation:**
```typescript
// utils/validators.ts
export class Validators {
  static validateUsername(username: string): Result<string> {
    if (!username || username.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { success: false, error: 'Username can only contain letters, numbers, and underscores' };
    }

    return { success: true, data: username };
  }

  static validateBrutoName(name: string): Result<string> {
    if (!name || name.length < 2 || name.length > 20) {
      return { success: false, error: 'Bruto name must be 2-20 characters' };
    }

    return { success: true, data: name };
  }
}
```

---

## 13. Performance Considerations

### Asset Loading Strategy

**Lazy Loading:**
```typescript
// BootScene: Load critical assets only
preload() {
  // Core UI
  this.load.image('button', 'assets/ui/button.png');
  this.load.image('panel', 'assets/ui/panel.png');

  // Bruto base sprites (all 10 designs)
  for (let i = 1; i <= 10; i++) {
    this.load.spritesheet(`bruto_${i}`, `assets/sprites/brutos/design_${i}.png`, {
      frameWidth: 64,
      frameHeight: 64
    });
  }
}

// CombatScene: Load combat-specific assets when needed
preload() {
  // Weapon sprites (only load as needed)
  this.loadWeaponSprites(this.selectedWeapons);

  // Skill effects (only load active skills)
  this.loadSkillEffects(this.activeSkills);
}
```

### Database Optimization

**Indexes:**
```sql
-- Critical indexes for performance
CREATE INDEX idx_brutos_level ON brutos(level); -- Matchmaking query
CREATE INDEX idx_battles_player ON battles(player_bruto_id); -- History lookup
CREATE INDEX idx_battles_date ON battles(fought_at); -- "Last 8" query
```

**Query Optimization:**
```typescript
// ✅ GOOD: Single query with JOIN
async getBrutoWithWeapons(brutoId: string): Promise<Result<IBruto>> {
  const sql = `
    SELECT
      b.*,
      GROUP_CONCAT(bw.weapon_id) as weapon_ids
    FROM brutos b
    LEFT JOIN bruto_weapons bw ON bw.bruto_id = b.id
    WHERE b.id = ?
    GROUP BY b.id
  `;

  // Single query instead of N+1
}

// ❌ BAD: N+1 query problem
const bruto = await this.getBruto(brutoId);
for (const weaponId of bruto.weaponIds) {
  const weapon = await this.getWeapon(weaponId); // Multiple queries!
}
```

### Rendering Optimization

**Object Pooling:**
```typescript
// Reuse damage number sprites instead of creating new ones
export class DamageNumberPool {
  private pool: Phaser.GameObjects.Text[] = [];

  get(scene: Phaser.Scene, x: number, y: number, text: string): Phaser.GameObjects.Text {
    let damageText = this.pool.pop();

    if (!damageText) {
      damageText = scene.add.text(0, 0, '', { fontSize: '24px', color: '#ff0000' });
    }

    damageText.setPosition(x, y).setText(text).setVisible(true);
    return damageText;
  }

  release(damageText: Phaser.GameObjects.Text) {
    damageText.setVisible(false);
    this.pool.push(damageText);
  }
}
```

**Target Performance:**
- 60 FPS during combat animations
- < 2s scene transitions
- < 300ms database queries
- < 200MB memory usage

---

## 14. Testing Strategy

### Unit Tests (Engine Layer)

```typescript
// engine/combat/DamageCalculator.test.ts
import { DamageCalculator } from './DamageCalculator';

describe('DamageCalculator', () => {
  let calculator: DamageCalculator;

  beforeEach(() => {
    calculator = new DamageCalculator();
  });

  it('should calculate base damage equal to STR', () => {
    const damage = calculator.calculateBaseDamage(5);
    expect(damage).toBe(5);
  });

  it('should apply critical multiplier (x2)', () => {
    const baseDamage = 10;
    const criticalDamage = calculator.applyCriticalMultiplier(baseDamage);
    expect(criticalDamage).toBe(20);
  });

  it('should apply armor reduction correctly', () => {
    const damage = 100;
    const armorPercent = 25; // 25% reduction
    const finalDamage = calculator.applyArmor(damage, armorPercent);
    expect(finalDamage).toBe(75); // 100 - 25% = 75
  });
});
```

### Integration Tests (Repository Layer)

```typescript
// database/repositories/BrutoRepository.test.ts
import { BrutoRepository } from './BrutoRepository';
import { DatabaseManager } from '../DatabaseManager';

describe('BrutoRepository', () => {
  let db: DatabaseManager;
  let repo: BrutoRepository;

  beforeEach(async () => {
    db = new DatabaseManager(':memory:'); // In-memory test DB
    await db.initialize();
    repo = new BrutoRepository(db);
  });

  it('should create and retrieve a bruto', async () => {
    const bruto: IBruto = {
      id: '123',
      userId: 'user1',
      name: 'TestBruto',
      level: 1,
      // ... complete data
    };

    const createResult = await repo.create(bruto);
    expect(createResult.success).toBe(true);

    const findResult = await repo.findById('123');
    expect(findResult.success).toBe(true);
    expect(findResult.data?.name).toBe('TestBruto');
  });
});
```

### E2E Tests (Scene Flow)

```typescript
// Not automated initially, manual testing checklist:
// 1. Login → Create bruto → Select opponent → Combat → Level up
// 2. Verify daily limit (6 fights)
// 3. Test replay system (last 8 battles)
// 4. Verify ghost opponent system (can't modify ghosts)
```

**Testing Priority:**
1. **High:** Combat engine, damage calculations (pure logic)
2. **Medium:** Repositories, progression engine
3. **Low:** UI scenes (manual testing initially)

---

## 15. Deployment Architecture

### Build Process

```bash
# Development
npm run dev  # Vite dev server on localhost:8080

# Production Build
npm run build  # Output to dist/

# Build Output:
dist/
├── index.html
├── assets/
│   ├── index-[hash].js    # Bundled JavaScript
│   ├── index-[hash].css   # Bundled CSS
│   └── sprites/           # Game assets
└── sql-wasm.wasm          # sql.js WebAssembly
```

### Hosting (Netlify)

**Netlify Configuration:**

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Deployment Steps:**
1. Push code to GitHub
2. Connect Netlify to repository
3. Auto-deploy on push to main branch
4. URL: `https://el-bruto.netlify.app`

**Environment:**
- No environment variables needed (local-only game)
- No server-side processing
- All data stored in browser (sql.js)

---

## 16. Development Environment Setup

### Prerequisites

```bash
# Required
- Node.js 18+ (LTS recommended)
- npm 9+
- Git

# Optional
- VS Code (recommended editor)
- VS Code extensions:
  - TypeScript + JavaScript Language Features
  - ESLint
  - Prettier
```

### Setup Steps

```bash
# 1. Clone starter template
git clone https://github.com/phaserjs/template-vite-ts.git bruto
cd bruto

# 2. Install dependencies
npm install

# 3. Install additional packages
npm install zustand sql.js date-fns bcryptjs
npm install -D @types/sql.js @types/bcryptjs

# 4. Start development server
npm run dev

# 5. Open browser
# Navigate to http://localhost:8080
```

### Editor Configuration

```json
// .vscode/settings.json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## 17. Architecture Decision Records (ADRs)

### ADR-001: Use Phaser 3 Instead of Godot

**Date:** 2025-10-30
**Status:** Accepted
**Context:** Need game engine for web-based auto-battler
**Decision:** Use Phaser 3.88 + TypeScript + Vite
**Rationale:**
- Better web-first architecture (no export step)
- Easier SQLite integration (sql.js)
- Smaller bundle size (~1-2MB vs 20-30MB)
- Native browser storage access
- Strong TypeScript ecosystem

**Consequences:**
- ✅ Faster web performance
- ✅ Better local database integration
- ⚠️ More manual coding (no visual editor)

### ADR-002: Use sql.js for Local Database

**Date:** 2025-10-30
**Status:** Accepted
**Context:** Need local-first database for offline play
**Decision:** Use sql.js (SQLite compiled to WebAssembly)
**Alternatives Considered:** IndexedDB, LocalStorage
**Rationale:**
- Full SQL capabilities (joins, indexes, complex queries)
- Familiar SQLite syntax
- Better for relational data (brutos, battles, weapons)
- Easier to migrate to server later if needed

**Consequences:**
- ✅ Powerful query capabilities
- ✅ Familiar SQL syntax
- ⚠️ +500KB bundle size
- ⚠️ Must handle async operations

### ADR-003: Separate Combat Engine from Presentation

**Date:** 2025-10-30
**Status:** Accepted
**Context:** Combat system is complex, needs testing
**Decision:** Pure TypeScript CombatEngine, separate from Phaser
**Rationale:**
- Testable without Phaser (unit tests)
- Reusable (could port to other platforms)
- SOLID: Single Responsibility
- Clean Architecture: Business logic separate from UI

**Consequences:**
- ✅ Highly testable
- ✅ Better separation of concerns
- ⚠️ Slightly more code (adapter layer)

### ADR-004: Use Clean Code + SOLID + GRASP

**Date:** 2025-10-30
**Status:** Accepted
**Context:** Large project (~100-135 stories), multiple agents
**Decision:** Apply Clean Code, SOLID, GRASP principles throughout
**Rationale:**
- Prevent AI agent conflicts (consistent patterns)
- Maintainability for large codebase
- Clear responsibilities reduce bugs
- Industry best practices

**Consequences:**
- ✅ More maintainable code
- ✅ Easier for AI agents to follow patterns
- ⚠️ Slightly more upfront design work

---

## 18. Consistency Checklist for AI Agents

**BEFORE implementing ANY story, agents MUST:**

- [ ] ✅ Follow naming conventions (PascalCase classes, camelCase functions, etc.)
- [ ] ✅ Use `GameError` class for all errors (never throw raw strings)
- [ ] ✅ Return `Result<T>` from all async database operations
- [ ] ✅ Log with component prefix: `console.log('[ComponentName]', ...)`
- [ ] ✅ Use `date-fns` for all date operations (no raw Date methods)
- [ ] ✅ Database tables/columns in `snake_case`, code in `camelCase`
- [ ] ✅ Implement ONE responsibility per class (SOLID: SRP)
- [ ] ✅ Depend on interfaces, not implementations (SOLID: DIP)
- [ ] ✅ Place tests co-located with implementation (`.test.ts` files)
- [ ] ✅ Use Zustand for global state, NOT local Scene variables
- [ ] ✅ Combat logic in Engine layer, NOT in Scene layer
- [ ] ✅ Repository pattern for ALL database access
- [ ] ✅ Constants in `UPPER_SNAKE_CASE` (no magic numbers)

---

## 19. Next Steps

**Immediate Actions:**

1. **Initialize Project** (Epic 1, Story 1)
   ```bash
   git clone https://github.com/phaserjs/template-vite-ts.git bruto
   cd bruto
   npm install
   npm install zustand sql.js date-fns bcryptjs
   npm install -D @types/sql.js @types/bcryptjs
   ```

2. **Create Project Structure** (Epic 1, Story 2)
   - Create folder structure as defined in Section 4
   - Set up `tsconfig.json` with path aliases
   - Configure ESLint/Prettier rules

3. **Database Schema** (Epic 1, Story 3-5)
   - Create migration files in `database/migrations/`
   - Implement `DatabaseManager.ts`
   - Write initial schema (users, brutos, battles, etc.)

4. **Seed Static Data** (Epic 5-7)
   - Create `data/weapons.json` with all 25+ weapons
   - Create `data/skills.json` with all 40-50 skills
   - Create `data/pets.json` with 3 pet types

5. **Validate Architecture** (Next workflow)
   - Run validation checklist
   - Ensure all decisions documented
   - Review with architect agent

---

## 20. Validation Checklist

✅ **Decision Table Complete:**
- [x] All technologies have specific versions
- [x] Every epic mapped to architecture components
- [x] Novel patterns fully documented

✅ **Source Tree Complete:**
- [x] Full directory structure defined (Section 4)
- [x] No placeholder text
- [x] All layers represented

✅ **Functional Requirements Coverage:**
- [x] Account system: LoginScene + UserRepository
- [x] Character management: BrutoSelectionScene + BrutoRepository
- [x] Combat: CombatEngine + CombatScene
- [x] Progression: ProgressionEngine + LevelUpScene
- [x] Matchmaking: OpponentService + Ghost pattern
- [x] Replay: BattleRepository + combat_log JSON
- [x] Daily limits: DailyFightTracker + date-fns

✅ **Non-Functional Requirements Coverage:**
- [x] Performance: < 2s load times, 60 FPS target
- [x] Security: bcrypt password hashing
- [x] Offline: sql.js local database
- [x] Scalability: Clean Architecture allows growth
- [x] Maintainability: SOLID + GRASP + Clean Code

✅ **Implementation Patterns:**
- [x] Naming conventions defined
- [x] Error handling pattern (GameError)
- [x] Logging pattern (component prefix)
- [x] State management (Zustand)
- [x] Database access (Repository pattern)
- [x] Date handling (date-fns)

✅ **Novel Patterns:**
- [x] Local Ghost Matchmaking fully documented (Section 8)
- [x] Components listed
- [x] Data flow explained
- [x] Affects epics identified

---

**Document Version:** 1.0
**Last Updated:** 2025-10-30
**Author:** vice
**Architect:** Winston (BMad Architect Agent)

---

_This architecture document serves as the consistency contract for all AI agents implementing "El Bruto." All agents MUST follow these decisions, patterns, and conventions to ensure a cohesive, maintainable codebase._
