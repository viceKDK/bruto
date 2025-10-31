# El Bruto - Game Design Document

**Author:** vice
**Game Type:** Auto-battler / Idle Fighter with RPG Progression
**Target Platform(s):** Web (Browser-based)

---

## Executive Summary

### Core Concept

A web-based auto-battler where players create and manage up to 4 "brutos" (fighters) that battle automatically against other players' brutos. Each bruto progresses through infinite levels, gaining random stat increases, weapons, skills, and pets. Combat is probabilistic with critical hits, dodging, and special abilities creating unique battles every time.

### Target Audience

Casual to core web gamers who enjoy idle/auto-battler games with progression systems, ages 13+, prefer short to medium play sessions (limited to 6 fights per day).

### Unique Selling Points (USPs)

1. **Faithful Recreation** - Authentic recreation of original "El Bruto" mechanics
2. **Local Matchmaking Innovation** - Fight against other users' brutos stored in local database (offline ghost system)
3. **Battle Replay System** - Review your last 8 fights to analyze strategies
4. **Emergent Complexity** - Simple systems + RNG = infinite unique battles
5. **Infinite Progression** - No level cap, endless character growth

---

## Goals and Context

### Project Goals

1. Faithfully recreate the core mechanics of the original "El Bruto" game
2. Implement complete progression system with infinite leveling
3. Create engaging auto-battle combat with randomization
4. Deliver fully offline local-first web experience

### Background and Rationale

This is a personal recreation of "El Bruto" focusing on maintaining the original's simplicity while adding two technical improvements: local database matchmaking against other users' brutos, and a replay system for the last 8 battles. The project embraces "emergent complexity" where simple systems combined with RNG create unique, unpredictable gameplay.

---

## Core Gameplay

### Game Pillars

1. **Randomization as Core Gameplay** - Random appearances, random stat increases, probabilistic combat
2. **Intentional Simplicity** - Easy to understand, no combos or complex systems
3. **Infinite Progression** - No level cap, always something to strive for
4. **Local-First Architecture** - Fully playable offline with local database

### Core Gameplay Loop

1. **Select Bruto** - Choose one of your 3-4 brutos
2. **Choose Opponent** - Select from 5 random brutos of same level
3. **Watch Auto-Battle** - Animated combat plays out automatically
4. **Gain XP** - Receive +1 XP for loss, +2 XP for win
5. **Level Up** - Choose between 2 random upgrade options (A or B):
   - New skill
   - New weapon
   - Full stat boost (+2 STR/Speed/Agility or +12 HP)
   - Split stat boost (+1/+1 or +6 HP + stat)
6. **Repeat** - Up to 6 fights per day, then wait for daily reset

### Win/Loss Conditions

**Win Condition:** Reduce opponent's HP to 0
**Loss Condition:** Your bruto's HP reaches 0

---

## Game Mechanics

### Primary Mechanics

**Combat Stats System:**
- **HP (Health Points)** - Starting: 60, increases by +12 per full stat boost or +6 per split
- **STR (Strength)** - Starting: 2, determines damage dealt (STR value = damage amount)
- **Speed** - Starting: 2, determines probability of extra attacks/turns
- **Agility** - Starting: 2, determines dodge chance percentage

**Character Management:**
- **Create Bruto** - Name + random appearance (10 designs × color variations)
- **Multi-Character System** - Manage 3 brutos (default), expandable to 4 with coins
- **Delete Bruto** - Option to remove unwanted characters

**Progression Mechanics:**
- **XP Gain** - Lose: +1 XP, Win: +2 XP
- **Level Up Choice** - Select from 2 random options each level
- **Infinite Leveling** - No level cap

**Equipment & Abilities:**
- **Weapons** - 4 categories (Fast, Heavy, Sharp, Long), each with unique stats
- **Skills** - ~40+ abilities copied from original game
- **Pets** - 4 types (Dog, Wolf, Panther, Bear) with fixed stats

**Economy:**
- **Coins** - Earn 100 coins at level 10
- **Bruto Slot Purchase** - 500 coins = +1 slot (max 4 total)

**Matchmaking & Replays:**
- **Same-Level Matching** - Only fight brutos at your exact level
- **Opponent Pool** - Choose from 5 random opponents
- **Replay System** - Store and review last 8 battles

### Controls and Input

**Interface:** Mouse/Touch-based UI
**Control Scheme:** Point-and-click navigation

- **Click** - Select brutos, choose opponents, pick level-up options
- **Navigation** - Click buttons to move between screens
- **Battle** - Fully automated (watch-only, no player input during combat)

---

## Combat System (Auto-Battler)

### Combat Algorithm

**Combat Type:** Turn-Based Auto-Battle
**Execution:** Fully automated with visual feedback

**Combat Actions Per Turn:**
1. **Base Attack** - Always executes (damage = STR value)
2. **Weapon Attack** - Chance to trigger based on weapon stats
3. **Skill Activation** - Chance to use equipped skills
4. **Critical Hit** - Chance for double damage (base + weapon/skill modifiers)

**Defensive Mechanics:**
- **Dodge** - Agility stat determines % chance to avoid attacks
- **Speed Advantage** - Extra turn probability based on Speed stat

**Combat Flow:**
1. Determine turn order
2. Attacker executes actions (base + weapon chance + skill chance)
3. Defender checks dodge (Agility %)
4. Calculate damage (with critical chance)
5. Apply damage to HP
6. Check win/loss condition
7. Repeat until HP reaches 0

### Weapons System

**4 Weapon Categories:**

| Category | Characteristics |
|----------|----------------|
| **Fast** | Higher attack speed, lower damage, increased crit chance |
| **Heavy** | Slower attacks, massive damage, lower accuracy |
| **Sharp** | Balanced stats, high critical damage multiplier |
| **Long** | Extended reach bonus, medium damage |

**Weapon Attributes:**
- **Reach** - Attack range modifier
- **Odds** - Probability to trigger weapon attack
- **Hit** - Accuracy rating
- **Speed** - Attack speed modifier
- **Damage** - Base damage value
- **Crit Chance** - Critical hit probability

### Skills System

**~40+ Skills** (from original game)

**Skill Categories:**
- **Offensive** - Damage boost, multi-hit attacks
- **Defensive** - Dodge increase, damage reduction
- **Buffs** - Temporary stat increases, crit chance up
- **Status Effects** - Varies by specific skill

**Skill Activation:** Probability-based during combat turns

### Pets System

**3 Pet Types** (Dog can be obtained multiple times)

| Pet | HP | Damage | AGI | SPD | Combo% | Evasion% | Initiative |
|-----|----|----|-----|-----|--------|----------|------------|
| **Dog** (A/B/C) | 14 | Low | 5 | 3 | 10% | 0% | -10 |
| **Panther** | 26 | Medium | 16 | 24 | 60% | 20% | -60 |
| **Bear** | 110 | High | 2 | 1 | -20% | 0% | -360 |

**Pet Mechanics:**
- **Fixed stats** - Do not level up or evolve
- **Stacking** - Can have up to 3 Dogs (A, B, C) simultaneously
- **Combinations** - 3 Dogs + Panther OR 3 Dogs + Bear (not Panther + Bear together)
- **Resistance Cost** - Acquiring pets reduces bruto's Resistance stat:
  - Dog: -2 Resistance (base), -3 with Vitality, -7 with Immortality
  - Panther: -6 Resistance (base), -9 with Vitality, -15 with Immortality
  - Bear: -8 Resistance (base), -12 with Vitality, -28 with Immortality
- **Combat Role** - Attack independently alongside bruto during battles

---

## Progression and Balance

### Player Progression

**Infinite Leveling System:**
- No level cap - endless progression
- XP per fight: Win = +2 XP, Loss = +1 XP
- Daily limit: 6 fights per 24-hour period (8 with Regeneration skill)

**Level-Up Progression:**
1. Gain required XP (increases per level)
2. Choose from 2 random options (A or B):
   - **New Skill** (~40+ skills from pool)
   - **New Weapon** (from 25+ weapons across 4 categories)
   - **Full Stat Boost:**
     - +2 STR OR +2 Speed OR +2 Agility OR +12 HP (2 Resistance)
     - With augmenter skills: +3 instead of +2 (STR/Speed/Agility), +18 HP instead of +12
   - **Split Stat Boost:**
     - +1/+1 to two stats OR +6 HP + 1 other stat
     - With augmenter: +1.5/+1.5 or +9 HP + 1 stat
   - **Pet** (Dog/Panther/Bear)

**Starting Stats:**
- HP: 60 (50 standard + 10 from base Resistance)
- STR: 2
- Speed: 2
- Agility: 2
- Resistance: ~1.67 (gives 10 HP)

**Augmenter Skills** (Permanent +50% boost to stat gains):
- **Herculean Strength** - +50% STR gains (+3 per level instead of +2)
- **Feline Agility** - +50% Agility gains (+3 instead of +2)
- **Lightning Strike** - +50% Speed gains (+3 instead of +2)
- **Vitality** - +50% HP/Resistance gains (+18 HP instead of +12)
- **Immortality** (rarest, 0.01% odds) - +250% Resistance, -25% other stats

**Progression Milestones:**
- **Level 10:** First coin reward (100 coins)
- **Every 10 levels:** Potential additional rewards
- **Infinite:** Continuous stat/skill/weapon accumulation

### Difficulty Curve

**Matchmaking Difficulty:**
- **Strict Level Matching** - Only fight opponents at exact same level
- **Build Variety** - Each opponent has unique stat/skill/weapon distribution
- **RNG Creates Challenge** - Randomness in opponent builds, critical hits, dodges

**Pacing by Level Range:**
- **Early (1-10)** - Learn mechanics, build foundation, acquire first weapons/skills
- **Mid (11-50)** - Expand arsenal, refine build strategy, discover synergies
- **Late (51-100)** - Optimize build, master complex combinations
- **Endgame (100+)** - Perfect min-maxing, rare skill combos, infinite scaling

**Challenge Sources:**
- Opponent stat distribution (high STR vs high Agility builds)
- Weapon/skill synergies (armor-piercing vs evasion builds)
- Pet combinations (3 Dogs swarm vs single Bear tank)
- Critical hit variance (can turn fights instantly)
- Dodge/block RNG (high-risk high-reward moments)

**Balance Mechanisms:**
- Daily fight limit prevents grinding advantage
- Guaranteed progress (always gain XP, even on loss)
- Random upgrades prevent perfect min-maxing
- Level-locked matchmaking ensures fair fights

### Economy and Resources

**Currency System:**
- **Coins** - Only currency in game
  - Earned at level milestones (100 coins at level 10)
  - Single use case: bruto slot expansion

**Coin Usage:**
- **Bruto Slot Expansion** - 500 coins = +1 slot (max 4 total)
  - Default: 3 bruto slots
  - Maximum: 4 bruto slots (requires 500 coin purchase)

**No Traditional Economy:**
- No shop for weapons/skills/pets (all earned via leveling RNG)
- No premium/paid currency
- No consumables or temporary items
- No trading or marketplace
- All progression through level-up choices only

---

## Level Design Framework

### Level Types

**Note:** "El Bruto" does not use traditional level/stage design. Combat takes place in a single arena environment.

**Arena Type:**
- **Combat Arena** - Single fighting environment where all battles occur
- Visual: Simple arena background (faithful to original)
- No environmental hazards or stage gimmicks
- Focus purely on character-vs-character combat

### Level Progression

**N/A** - Game uses character-level progression (1 → ∞) rather than stage/level progression.

All progression tied to:
1. **Bruto leveling** (infinite levels)
2. **Opponent selection** (5 random same-level opponents per fight)
3. **Daily fight availability** (6 per day limit)

---

## Art and Audio Direction

### Art Style

**Visual Aesthetic:** 2D sprite-based, faithful recreation of original "El Bruto"

**Character Sprites:**
- 10 unique bruto base designs with color variations
- Animations: idle, attack, hit, victory, defeat
- Pet sprites: Dog (3 variants), Panther, Bear

**Weapon & UI:**
- 25+ distinct weapon sprites across 4 categories
- Grid-based skill display (7×7 grid)
- Casillero (bruto details) layout preserved from original

**Animation Priority:**
1. Critical: Attack, hit, idle
2. High: Victory, defeat, critical effects
3. Medium: Skill activations
4. Low: Environmental

### Audio and Music

**Music:** Background combat/idle game atmosphere

**Sound Effects:**
- **High Priority:** Hit, critical, block, dodge, UI clicks, level-up
- **Medium Priority:** Weapon-specific SFX, skill sounds (~40+), pet attacks
- **Low Priority:** Ambience, hover effects

**Note:** Audio enhances but is not critical (mute-friendly)

---

## Technical Specifications

### Performance Requirements

**Target Performance:**
- **Frame Rate:** 30-60 FPS during combat animations
- **Load Times:** < 2 seconds for screen transitions
- **Database Queries:** < 300ms for local database operations
- **Memory:** < 200MB RAM usage

**Browser Compatibility:**
- Chrome, Firefox, Safari, Edge (latest 2 versions)
- Desktop and tablet support prioritized
- Mobile responsive design (secondary)

### Platform-Specific Details

**Web Platform (Primary):**
- **Technology Stack:** HTML5/JavaScript
- **Storage:** IndexedDB or LocalStorage for bruto/battle data
- **Database:** SQLite (via sql.js) or similar client-side database
- **Offline Capability:** Fully functional without internet

**Deployment:**
- Hosted web application
- Accessible via URL
- No installation required
- Progressive Web App (PWA) optional for future

### Asset Requirements

**Art Assets:**
- 10 bruto base sprites with color variations (idle, attack, hit, victory, defeat animations)
- 25+ weapon sprites (across 4 categories)
- 3 pet sprites (Dog×3, Panther, Bear)
- ~40-50 skill icons (7×7 grid display)
- UI elements (buttons, panels, stat displays, casillero layout)
- Combat arena background

**Audio Assets:**
- Background music track (loopable)
- Combat SFX library (hit, crit, dodge, block sounds)
- UI SFX (clicks, level-up notification)
- ~40+ skill activation sounds (can reuse some)

**Data Assets:**
- Weapons database (25+ weapons with complete stats)
- Skills database (~40-50 skills with effects, odds, mechanics)
- Pet stats database (3 types)
- Combat formulas and stat calculations

---

## Development Epics

### Epic Structure

**Total Estimated Stories:** 100-135 stories across 12 epics

**Epic 1: Core Infrastructure & Database** - Project setup, SQLite integration, data models, CRUD operations (8-10 stories)

**Epic 2: Account System** - Registration, login, authentication, session management (6-8 stories)

**Epic 3: Character Creation & Management** - Bruto creation, appearance randomization, multi-character slots, deletion (8-10 stories)

**Epic 4: Combat System Core** - Turn-based engine, stat system, base attacks, critical hits, dodge, combat flow (12-16 stories)

**Epic 5: Weapons System** - Weapon database (25+), categories, stat modifiers, integration into combat (10-14 stories)

**Epic 6: Skills System** - Skills database (~40-50), categories, activation, effects implementation, grid UI (14-20 stories)

**Epic 7: Pets System** - Pet database, stats, combat AI, stacking rules, resistance cost (6-8 stories)

**Epic 8: Progression & Leveling** - XP system, level-up, random upgrades (A/B), augmenter effects, infinite scaling (10-12 stories)

**Epic 9: Matchmaking & Opponents** - Local pool, same-level matching, random selection (5 choices), opponent generation (6-8 stories)

**Epic 10: UI/UX (6 Screens)** - Login, Bruto Selection, Details (Casillero), Opponent Selection, Combat, Level-Up (12-16 stories)

**Epic 11: Economy & Daily Limits** - Coins, level rewards, slot purchase, daily fight limit (6/day), reset timer (5-7 stories)

**Epic 12: Battle Replay System** - Combat recording, last 8 fights storage, playback UI, history display (6-8 stories)

---

## Success Metrics

### Technical Metrics

- **Performance:** Maintain 30+ FPS during combat
- **Load Times:** < 2s for all screen transitions
- **Database Performance:** < 300ms query times
- **Stability:** Zero critical bugs in core gameplay loop
- **Browser Compatibility:** 95%+ on Chrome/Firefox/Safari/Edge
- **Storage Efficiency:** < 50MB local storage per account

### Gameplay Metrics

- **Session Length:** Average time per play session
- **Fights Per Session:** Battles completed before stopping
- **Level Progression:** Average level reached per bruto
- **Retention:** % of players creating multiple brutos
- **Feature Usage:** Replay system engagement rate
- **Build Diversity:** Distribution of stat/skill/weapon choices

---

## Out of Scope

**Explicitly NOT Included:**

**1. Multiplayer Features:**
- Real-time PvP battles
- Tournaments/rankings
- Clans/guilds
- Leaderboards
- Chat systems

**2. Social Features:**
- Friend lists
- Referrals
- Social sharing
- Player profiles

**3. Monetization:**
- Premium currency
- In-app purchases
- Advertisements
- Paid content

**4. Advanced Features:**
- Character evolution/transformation
- Combo systems beyond multihit
- Class/specialization systems
- Multiple arenas/environments
- Daily quests/achievements
- Training mode

**5. Platform Expansion:**
- Native mobile apps
- Desktop standalone
- Console ports

---

## Assumptions and Dependencies

### Technical Assumptions

- Modern browsers support HTML5, JavaScript ES6+, and local storage
- SQLite (via sql.js) or equivalent available for client-side database
- Users have JavaScript enabled
- Sufficient local storage (50-100MB) available
- No server-side processing required (fully client-side)

### Design Assumptions

- Original "El Bruto" mechanics can be faithfully replicated
- Combat algorithm balanceable through iteration
- Infinite progression remains engaging long-term
- Daily 6-fight limit provides good pacing
- RNG-based progression acceptable to target audience
- Local-first architecture meets user expectations

### Resource Dependencies

- **Original Game Reference:** Access to "El Bruto" for accurate recreation
- **Complete Data:**
  - All 25+ weapons with complete stats
  - All ~40-50 skills with effects and odds
  - All combat formulas and hidden stat calculations
- **Art Assets:** Sprites recreated or extracted from original
- **Audio Assets:** SFX and music (original or recreated)

### User Dependencies

- Players understand auto-battler genre
- Users comfortable with RNG progression
- Acceptance of offline-first, no-multiplayer approach
- Web browser as primary gaming platform

---

**_End of Game Design Document_**

**Document Version:** 1.0
**Last Updated:** 2025-10-30
**Author:** vice
**Project:** El Bruto - Web-based Auto-Battler Recreation
