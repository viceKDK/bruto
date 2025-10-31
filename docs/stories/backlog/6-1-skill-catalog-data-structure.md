# Story 6.1: Skill Catalog Data Structure

Status: backlog

## Story
As a developer,
I want a comprehensive skill catalog data structure with all ~40 documented skills,
so that skills can be randomly awarded, tracked, and their effects applied during combat and progression.

## Requirements Context Summary

### Requirement Sources
- `docs/epics.md` — Epic 6 defines skills system with ~40 skill effects, activation odds, and stacking logic.
- `docs/habilidades-catalogo.md` — Complete catalog of all skills with effects, odds, categories, and implementation notes.
- `docs/GDD.md` — Section 11 defines skill acquisition through post-victory rewards and level-up bonuses.
- `docs/architecture.md` — Section 6 defines bruto_skills junction table for many-to-many skill ownership.

### Key Requirements
- Create TypeScript skill catalog with all documented skills from habilidades-catalogo.md.
- Define skill categories: Stat Buffs, Passive Effects, Active Abilities, Combat Modifiers, Resistance Modifiers.
- Implement skill metadata: name, description, category, rarity/odds, effects, stacking rules.
- Create skill effect type system for different effect patterns (stat boost, damage modifier, special actions).
- Support skill dependencies and mutual exclusions (e.g., can't have both Fuerza Hércules and Velocidad Mercurio at max).
- Wire skill catalog to database schema for ownership tracking.

## Structure Alignment Summary

### Learnings from Previous Stories

**From Story 3-1-bruto-creation-flow (Status: review)**
- **Factory Pattern**: Creator pattern works well for complex object initialization with multiple dependencies
- **Data-driven Design**: JSON catalogs (appearances.json) enable easy content updates without code changes
- **Service Layer Separation**: Business logic services wrapping repositories maintain clean architecture
[Source: stories/implemented/3-1-bruto-creation-flow.md#Dev-Agent-Record]

**From Story 4-1-turn-scheduler-and-rng-framework (Status: implemented)**
- **Deterministic RNG**: Seeded random number generation enables replay functionality
- **Event-driven Architecture**: Combat events (damage, dodge, critical) logged for replay and UI updates
- **Type Safety**: Strong TypeScript interfaces for combat effects improve maintainability
[Source: stories/implemented/4-1-turn-scheduler-and-rng-framework.md]

### Architecture Integration
- Skills will be loaded from centralized catalog (similar to appearances.json pattern).
- SkillRepository will manage bruto_skills junction table for ownership.
- SkillEffectEngine will interpret skill effects during combat and stat calculations.
- Skills awarded through VictoryRewards system (Epic 10) and level-up options (Epic 8).

## Acceptance Criteria

1. Skill catalog JSON contains all ~40 documented skills with complete metadata (name, description, category, odds, effects).
2. TypeScript interfaces define Skill, SkillEffect, and SkillCategory types with proper type safety.
3. SkillCatalog service provides lookup methods (getByName, getByCategory, getByRarity).
4. Skill effects support stat modifications, damage modifiers, special abilities, and resistance changes.
5. Database schema updated to track skill ownership via bruto_skills table with acquisition tracking.

## Tasks / Subtasks

- [ ] Task 1 (AC: 1, 2) Build skill data structure
  - [ ] Subtask 1.1 Create TypeScript interfaces for Skill, SkillEffect, SkillCategory
  - [ ] Subtask 1.2 Define SkillEffectType enum (StatBoost, DamageModifier, SpecialAbility, ResistanceChange, PassiveBuff)
  - [ ] Subtask 1.3 Create skills.json catalog with all documented skills from habilidades-catalogo.md
  - [ ] Subtask 1.4 Add skill metadata: odds/rarity percentages, stacking rules, mutual exclusions

- [ ] Task 2 (AC: 3) Implement SkillCatalog service
  - [ ] Subtask 2.1 Create SkillCatalog class loading skills.json at initialization
  - [ ] Subtask 2.2 Add getSkillByName(name: string) lookup method
  - [ ] Subtask 2.3 Add getSkillsByCategory(category: SkillCategory) filter method
  - [ ] Subtask 2.4 Add getSkillsByRarity(minOdds: number, maxOdds: number) for reward pools

- [ ] Task 3 (AC: 4) Define skill effect system
  - [ ] Subtask 3.1 Create SkillEffect interface with type, value, target, condition fields
  - [ ] Subtask 3.2 Document effect patterns for stat boosts (+X stat, +Y% stat, both)
  - [ ] Subtask 3.3 Document effect patterns for damage modifiers (weapon type, damage type, conditional)
  - [ ] Subtask 3.4 Document effect patterns for special abilities (extra actions, turn manipulation)

- [ ] Task 4 (AC: 5) Update database schema
  - [ ] Subtask 4.1 Create bruto_skills table migration (bruto_id, skill_name, acquired_at, acquired_level)
  - [ ] Subtask 4.2 Create SkillRepository with CRUD operations for skill ownership
  - [ ] Subtask 4.3 Add getBrutoSkills(brutoId: number) method returning full skill objects
  - [ ] Subtask 4.4 Add hasSkill(brutoId: number, skillName: string) check method

- [ ] Task 5 (Testing & Validation)
  - [ ] Subtask 5.1 Unit tests for SkillCatalog lookup methods
  - [ ] Subtask 5.2 Unit tests for SkillRepository CRUD operations
  - [ ] Subtask 5.3 Validate all skills.json entries against TypeScript interfaces
  - [ ] Subtask 5.4 Integration test: load catalog, assign skill, retrieve from database

## Story Body

### Implementation Outline

1. **Design Skill Type System**
   - Create comprehensive TypeScript interfaces for Skill and SkillEffect
   - Define SkillCategory enum: StatBuff, PassiveEffect, ActiveAbility, CombatModifier, ResistanceModifier
   - Define SkillEffectType enum: StatBoost, DamageModifier, SpecialAbility, ResistanceChange, PassiveBuff, CriticalBonus
   - Support complex effects (skills can have multiple effects like Fuerza Hércules: immediate +3 STR + 50% STR + level-up bonus)

2. **Create Skills Catalog JSON**
   - Port all skills from habilidades-catalogo.md into structured JSON format
   - Include metadata: id, name, description, category, odds, effects[], stackable, mutuallyExclusiveWith[]
   - Organize by category for easier maintenance
   - Document effect calculation patterns in comments

3. **Build SkillCatalog Service**
   - Singleton pattern for catalog access (single source of truth)
   - Load and validate skills.json at initialization
   - Provide type-safe lookup methods
   - Cache frequently accessed skills
   - Validate skill references (mutual exclusions, dependencies)

4. **Database Integration**
   - Create bruto_skills junction table migration
   - Implement SkillRepository following repository pattern established in previous stories
   - Support skill acquisition tracking (when, at what level)
   - Enable skill queries for combat and UI display

5. **Testing Strategy**
   - Validate JSON catalog completeness (all documented skills present)
   - Test catalog lookup methods with various filters
   - Test repository persistence and retrieval
   - Ensure TypeScript type safety catches invalid skill configurations

### Example Skill Structure
```json
{
  "id": "fuerza_hercules",
  "name": "Fuerza Hércules",
  "category": "StatBuff",
  "description": "Aumenta STR inmediatamente y potencia las subidas de nivel futuras",
  "odds": 5.83,
  "effects": [
    {
      "type": "StatBoost",
      "stat": "STR",
      "value": 3,
      "timing": "immediate"
    },
    {
      "type": "StatBoost",
      "stat": "STR",
      "value": 0.5,
      "timing": "immediate",
      "modifier": "percentage"
    },
    {
      "type": "LevelUpBonus",
      "stat": "STR",
      "value": 3,
      "condition": "when_choosing_STR"
    }
  ],
  "stackable": false,
  "mutuallyExclusiveWith": [],
  "implementationStatus": "documented"
}
```

### Skill Categories to Implement

Based on habilidades-catalogo.md:

1. **Stat Buffs** (~8 skills)
   - Fuerza Hércules, Velocidad Mercurio, Piel de Acero, etc.
   - Immediate stat boosts + level-up modifiers

2. **Passive Effects** (~15 skills)
   - Toughened Skin, Esqueleto de Plomo, Reflejos Felinos, etc.
   - Always-active damage reduction, evasion bonuses, etc.

3. **Active Abilities** (~6 skills)
   - Fuerza Bruta (double damage special action)
   - Golpe Crítico Garantizado
   - Requires activation logic in combat

4. **Combat Modifiers** (~8 skills)
   - Weapon-specific bonuses
   - Damage type modifiers (blunt, slash, pierce resistance)
   - Multi-hit chances

5. **Resistance/Special** (~8 skills)
   - Elemental resistances
   - Unique mechanics (Regeneración, Vampirismo, etc.)

## Dev Notes

### Design Considerations
- **Extensibility**: Effect system must support future skill additions without code changes
- **Type Safety**: Strong typing prevents invalid skill configurations
- **Performance**: Catalog loaded once, cached lookups for combat speed
- **Maintainability**: JSON catalog allows content updates by non-developers
- **Validation**: Runtime validation ensures catalog integrity

### Integration Points
- **Epic 8 (Progression)**: Level-up rewards may offer skill choices
- **Epic 10 (Rewards)**: Victory rewards include skill acquisition
- **Epic 4 (Combat)**: SkillEffectEngine interprets skill effects during battles
- **Epic 3 (Casillero)**: Skill grid display shows acquired skills

### Project Structure Notes
```
src/
  engine/
    skills/
      SkillCatalog.ts          # Singleton catalog service
      SkillEffectEngine.ts     # Interprets effects (Story 6.2)
      types.ts                 # Skill, SkillEffect interfaces
  data/
    skills.json                # Complete skill catalog
  database/
    repositories/
      SkillRepository.ts       # Skill ownership persistence
    migrations/
      006_create_bruto_skills.sql  # Junction table
```

### References
- Complete skill catalog in docs/habilidades-catalogo.md with ~40 skills documented
- Skill categories: Stat Buffs, Passive Effects, Active Abilities, Combat Modifiers, Resistance Modifiers
- Database schema: bruto_skills junction table for many-to-many ownership [Source: docs/architecture.md#6-data-architecture]
- Skill acquisition: Victory rewards (Epic 10) and level-up bonuses (Epic 8) [Source: docs/GDD.md#11-progression-and-balance]

## Change Log
- 2025-10-31: Story created for Epic 6 Skills System foundational data structure

## Dev Agent Record

### Context Reference
<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used
{{agent_model_name_version}}

### Debug Log References
<!-- Populated during implementation -->

### Completion Notes List
<!-- Populated during implementation -->

### File List
<!-- Populated during implementation -->

## Senior Developer Review (AI)

**Reviewer:** {{reviewer_name}}  
**Date:** {{review_date}}  
**Outcome:** {{Approved | Changes Requested | Rejected}}

**Summary**
<!-- Review summary -->

**Key Findings**
<!-- Critical issues, improvements, or observations -->

**Acceptance Criteria Coverage**
| AC | Description | Status | Evidence |
| --- | --- | --- | --- |
| AC1 | Skill catalog contains all ~40 skills | {{status}} | {{file:line}} |
| AC2 | TypeScript interfaces defined | {{status}} | {{file:line}} |
| AC3 | SkillCatalog service with lookups | {{status}} | {{file:line}} |
| AC4 | Skill effects support all types | {{status}} | {{file:line}} |
| AC5 | Database schema updated | {{status}} | {{file:line}} |

**Task Completion Validation**
<!-- Task verification table -->

**Test Coverage and Gaps**
<!-- Test execution results and missing coverage -->

**Architectural Alignment**
<!-- Architecture compliance notes -->
