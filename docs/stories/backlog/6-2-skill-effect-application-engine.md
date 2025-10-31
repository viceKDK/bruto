# Story 6.2: Skill Effect Application Engine

Status: backlog

## Story
As a developer,
I want a skill effect application engine that interprets and applies skill effects during stat calculations, combat, and level-ups,
so that all ~40 skills function correctly according to their documented mechanics.

## Requirements Context Summary

### Requirement Sources
- `docs/epics.md` — Epic 6 requires skill effects, activation odds, and stacking logic implementation.
- `docs/habilidades-catalogo.md` — Documents exact effect mechanics for all skills (stat boosts, damage modifiers, passive effects, special abilities).
- `docs/GDD.md` — Section 11 defines skill impact on combat stats and progression.
- `docs/stast.md` — Defines base stat calculations and how skills modify them.

### Key Requirements
- Create SkillEffectEngine that applies skill effects to bruto stats in different contexts (stat display, combat initialization, level-up).
- Implement stat modification pipeline: base stats → passive skill effects → equipment modifiers → temporary buffs.
- Handle immediate effects (applied when skill acquired), passive effects (always active), and active abilities (triggered in combat).
- Support complex skill mechanics: percentage boosts, conditional bonuses, stacking rules, mutual exclusions.
- Integrate with StatsCalculator for stat display and combat initialization.
- Wire skill effects into combat engine for damage modifiers, evasion bonuses, special actions.

## Structure Alignment Summary

### Learnings from Previous Stories

**From Story 4-2-stat-based-damage-and-evasion (Status: implemented)**
- **Formula-based Calculations**: Centralized stat formulas in StatsCalculator enable consistent damage/evasion across contexts
- **Modifier Pipeline**: Damage calculations support base → weapon → skill → buff modifier chains
- **Type-safe Effects**: Strong typing for effect types prevents invalid modifications
[Source: stories/implemented/4-2-stat-based-damage-and-evasion.md]

**From Story 8-1-xp-and-level-progression (Status: implemented)**
- **Event-driven Updates**: Level-up events trigger stat recalculations
- **State Management**: Global progression store tracks level-up choices and stat changes
- **Validation Layer**: Stat changes validated before persistence
[Source: stories/implemented/8-1-xp-and-level-progression.md]

**From Story 6-1-skill-catalog-data-structure (Status: backlog)**
- **Skill Type System**: Comprehensive interfaces for Skill, SkillEffect, SkillCategory
- **Effect Categories**: StatBoost, DamageModifier, SpecialAbility, ResistanceChange, PassiveBuff
- **Catalog Service**: Centralized skill lookup with category/rarity filters
[Source: stories/backlog/6-1-skill-catalog-data-structure.md]

### Architecture Integration
- SkillEffectEngine will be called by StatsCalculator to modify base stats.
- Combat engine will query SkillEffectEngine for damage modifiers, evasion bonuses, special abilities.
- Level-up flow will apply immediate skill effects via SkillEffectEngine.
- Skill acquisition triggers effect application and stat recalculation.

## Acceptance Criteria

1. SkillEffectEngine applies stat boost effects (immediate +X, +Y%, level-up bonuses) correctly.
2. Passive skill effects (damage reduction, evasion bonuses, resistances) integrate with combat calculations.
3. Active skill abilities (Fuerza Bruta double damage, guaranteed criticals) trigger correctly in combat.
4. Skill stacking rules enforced (e.g., multiple armor passives stack, unique buffs don't).
5. StatsCalculator integration: skill-modified stats display correctly in Casillero and combat initialization.

## Tasks / Subtasks

- [ ] Task 1 (AC: 1) Implement stat boost application
  - [ ] Subtask 1.1 Create SkillEffectEngine class with applyStatBoosts(bruto, skills) method
  - [ ] Subtask 1.2 Handle immediate flat bonuses (+3 STR from Fuerza Hércules)
  - [ ] Subtask 1.3 Handle immediate percentage bonuses (+50% current STR)
  - [ ] Subtask 1.4 Handle level-up bonuses (3 STR instead of 2 when leveling STR)
  - [ ] Subtask 1.5 Apply effect order: flat bonuses first, then percentage modifiers

- [ ] Task 2 (AC: 2) Implement passive effect integration
  - [ ] Subtask 2.1 Create applyPassiveEffects(bruto, skills) for damage reduction, evasion
  - [ ] Subtask 2.2 Integrate armor/resistance passives (Toughened Skin +10% armor)
  - [ ] Subtask 2.3 Integrate evasion modifiers (Reflejos Felinos +15% evasion)
  - [ ] Subtask 2.4 Integrate weapon-specific bonuses (Maestro de Espadas +20% slash damage)
  - [ ] Subtask 2.5 Calculate stacking effects (multiple armor passives sum, capped at documented limits)

- [ ] Task 3 (AC: 3) Implement active ability system
  - [ ] Subtask 3.1 Create getActiveAbilities(bruto, skills) returning available special actions
  - [ ] Subtask 3.2 Implement Fuerza Bruta (limited uses, double damage action)
  - [ ] Subtask 3.3 Implement guaranteed critical mechanics
  - [ ] Subtask 3.4 Track ability uses per combat (reset between battles)
  - [ ] Subtask 3.5 Wire abilities into combat action selection

- [ ] Task 4 (AC: 4) Enforce stacking rules
  - [ ] Subtask 4.1 Implement stackable effect summation (armor, resistances)
  - [ ] Subtask 4.2 Implement unique effect replacement (only one stat buff of same type)
  - [ ] Subtask 4.3 Validate mutual exclusions (check mutuallyExclusiveWith on acquisition)
  - [ ] Subtask 4.4 Document stacking cap logic (max armor %, max evasion %)

- [ ] Task 5 (AC: 5) Integrate with StatsCalculator
  - [ ] Subtask 5.1 Modify StatsCalculator.calculateStats(bruto) to call SkillEffectEngine
  - [ ] Subtask 5.2 Update stat display pipeline: base → skills → equipment → buffs
  - [ ] Subtask 5.3 Ensure combat initialization uses skill-modified stats
  - [ ] Subtask 5.4 Add skill breakdown to stat tooltips (show base + skill bonuses)

- [ ] Task 6 (Testing & Validation)
  - [ ] Subtask 6.1 Unit tests for each skill effect type application
  - [ ] Subtask 6.2 Integration tests: stat boosts → stat display → combat initialization
  - [ ] Subtask 6.3 Test skill stacking scenarios (multiple armor passives, conflicting buffs)
  - [ ] Subtask 6.4 Test active ability tracking (uses, resets, combat integration)
  - [ ] Subtask 6.5 Validate against documented skills in habilidades-catalogo.md

## Story Body

### Implementation Outline

1. **Design Effect Application Pipeline**
   - Define clear execution order for skill effects
   - Separate immediate effects (on acquisition) from ongoing effects (in combat/stat calc)
   - Support context-aware application (stat display vs combat vs level-up)

2. **Create SkillEffectEngine Service**
   - Singleton pattern for centralized effect interpretation
   - Methods: applyStatBoosts, applyPassiveEffects, getActiveAbilities, validateStacking
   - Load bruto's skills from SkillRepository, fetch definitions from SkillCatalog
   - Apply effects according to type and timing

3. **Stat Boost Application**
   - Immediate effects applied when skill acquired (persisted to bruto base stats)
   - Ongoing effects applied during stat calculation (not persisted, calculated on-the-fly)
   - Level-up bonuses modify progression choices (3 STR instead of 2)
   - Order matters: flat bonuses → percentage bonuses → final caps

4. **Passive Effect Integration**
   - Modify damage calculation: base damage → weapon bonus → skill modifiers → final damage
   - Modify evasion calculation: base agility → skill bonuses → evasion chance
   - Modify damage reduction: armor equipment → skill passives → total reduction %
   - Stack multiple passive effects correctly (sum armor %, sum resistances, respect caps)

5. **Active Ability System**
   - Store ability state in combat context (uses remaining, cooldowns)
   - Abilities available as action options during combat turn
   - Apply ability effects (double damage, guaranteed crit) to specific actions
   - Reset ability uses at battle end

6. **StatsCalculator Integration**
   - Extend existing StatsCalculator to call SkillEffectEngine
   - Return detailed stat breakdown: { base, skillBonus, equipmentBonus, total }
   - UI displays bonuses with tooltips showing sources
   - Combat engine uses skill-modified stats for all calculations

### Effect Application Examples

**Example 1: Fuerza Hércules (Immediate + Ongoing)**
```typescript
// On skill acquisition:
bruto.stats.STR += 3;                    // Immediate +3
bruto.stats.STR *= 1.5;                  // Immediate +50%
// Persisted to database

// On level-up choosing STR:
if (hasSkill(bruto, 'fuerza_hercules')) {
  strGain = 3;  // Instead of default 2
}
```

**Example 2: Toughened Skin (Passive)**
```typescript
// During damage calculation:
function calculateDamageReduction(bruto: Bruto): number {
  let reduction = bruto.equipment.armor || 0;  // Base armor
  const skills = getSkills(bruto);
  
  skills.forEach(skill => {
    skill.effects
      .filter(e => e.type === 'DamageReduction')
      .forEach(e => reduction += e.value);  // +10% from Toughened Skin
  });
  
  return Math.min(reduction, 0.75);  // Cap at 75%
}
```

**Example 3: Fuerza Bruta (Active Ability)**
```typescript
// In combat, before action:
const abilities = skillEffectEngine.getActiveAbilities(bruto);
if (abilities.fuerzaBruta.usesRemaining > 0) {
  // Offer as action option
  if (playerChooses('fuerzaBruta')) {
    damage *= 2;
    abilities.fuerzaBruta.usesRemaining--;
  }
}
```

### Skill Effect Priority Order

1. **Immediate Effects** (on acquisition)
   - Flat stat bonuses
   - Percentage stat bonuses
   - Persisted to database

2. **Passive Effects** (calculated on-the-fly)
   - Damage reduction modifiers
   - Evasion bonuses
   - Resistance modifiers
   - Not persisted, recalculated each time

3. **Active Abilities** (during combat)
   - Special actions with limited uses
   - Triggered by player/AI decision
   - Uses tracked in combat state, reset after battle

4. **Level-up Bonuses** (during progression)
   - Modified stat gains when leveling
   - Applied in progression flow

### Integration Points

**StatsCalculator Integration**
```typescript
class StatsCalculator {
  calculateStats(bruto: Bruto): BrutoStats {
    const baseStats = this.getBaseStats(bruto);
    const skillModifiers = skillEffectEngine.applyStatBoosts(bruto);
    const equipmentModifiers = this.getEquipmentModifiers(bruto);
    
    return this.combineModifiers(baseStats, skillModifiers, equipmentModifiers);
  }
}
```

**Combat Engine Integration**
```typescript
class CombatEngine {
  initializeCombat(bruto1: Bruto, bruto2: Bruto) {
    const stats1 = statsCalculator.calculateStats(bruto1);  // Includes skills
    const abilities1 = skillEffectEngine.getActiveAbilities(bruto1);
    
    // Combat uses skill-modified stats and available abilities
  }
}
```

**Progression Integration**
```typescript
class ProgressionEngine {
  applyLevelUpChoice(bruto: Bruto, stat: StatType) {
    let gain = 2;  // Default
    
    const levelUpBonuses = skillEffectEngine.getLevelUpBonuses(bruto, stat);
    gain += levelUpBonuses;  // Fuerza Hércules adds +1, making it 3
    
    bruto.stats[stat] += gain;
  }
}
```

## Dev Notes

### Design Considerations
- **Separation of Concerns**: SkillEffectEngine interprets effects; StatsCalculator/CombatEngine apply them
- **Performance**: Cache skill lookups to avoid repeated database queries
- **Maintainability**: Effect logic driven by skill catalog data, not hardcoded
- **Testability**: Each effect type independently testable
- **Extensibility**: Adding new skills doesn't require code changes (data-driven)

### Edge Cases to Handle
- Skill acquired mid-combat (doesn't affect current battle)
- Multiple skills with same effect type (stacking rules)
- Negative stat modifiers (debuffs from future skills)
- Conditional effects (weapon-specific, HP threshold triggers)
- Effect caps (max armor %, max evasion %, stat maximums)

### Project Structure Notes
```
src/
  engine/
    skills/
      SkillEffectEngine.ts     # Main effect application logic
      SkillEffectEngine.test.ts
      types.ts                 # Effect interfaces (from Story 6.1)
      effectHandlers/          # Specific effect type handlers
        StatBoostHandler.ts
        PassiveEffectHandler.ts
        ActiveAbilityHandler.ts
    StatsCalculator.ts         # Updated to integrate skills
    combat/
      CombatEngine.ts          # Updated to use skill abilities
    progression/
      ProgressionEngine.ts     # Updated for level-up bonuses
```

### References
- All skill mechanics documented in docs/habilidades-catalogo.md with exact formulas
- Base stat calculations in docs/stast.md showing modifier pipeline
- Combat damage formulas in Story 4.2 establishing modifier chain pattern
- Level-up mechanics in Story 8.1 defining progression flow
- Skill catalog structure from Story 6.1 providing skill data access

## Change Log
- 2025-10-31: Story created for Epic 6 Skills System effect application engine

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
| AC1 | Stat boost effects apply correctly | {{status}} | {{file:line}} |
| AC2 | Passive effects integrate with combat | {{status}} | {{file:line}} |
| AC3 | Active abilities trigger correctly | {{status}} | {{file:line}} |
| AC4 | Stacking rules enforced | {{status}} | {{file:line}} |
| AC5 | StatsCalculator integration complete | {{status}} | {{file:line}} |

**Task Completion Validation**
<!-- Task verification table -->

**Test Coverage and Gaps**
<!-- Test execution results and missing coverage -->

**Architectural Alignment**
<!-- Architecture compliance notes -->
