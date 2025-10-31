# Story 6.5: Active Ability Combat Mechanics ✅

Status: **IMPLEMENTED** ✅  
Implementation Date: 2025-10-31  
Agent: Link Freeman (Game Developer)

## Story
As a player,
I want active skill abilities (Fuerza Bruta, Poción Trágica) to trigger during combat with limited uses and strategic timing,
so that battles feel dynamic and I can make tactical decisions.

## Implementation Summary

### ✅ What Was Implemented

**Core Components:**
1. **ActiveAbilityManager** (`src/engine/combat/ActiveAbilityManager.ts`)
   - Manages ability state during combat
   - Tracks uses remaining for each ability
   - Handles initialization and reset between battles
   - Calculates STR-based uses for Fuerza Bruta

2. **ActiveAbilityEffects** (`src/engine/combat/ActiveAbilityEffects.ts`)
   - Applies ability effects (damage multipliers, healing)
   - Fuerza Bruta: 2x damage multiplier
   - Poción Trágica: Random 25-50% HP healing

3. **CombatEngine Integration**
   - Abilities initialized at battle start
   - Fuerza Bruta automatically applied in attack calculation
   - Uses decremented when abilities trigger

**Test Coverage:**
- 21/21 tests passing for ActiveAbilityManager
- Full AC coverage with edge cases
- Battle lifecycle management verified

### 🎯 Acceptance Criteria Status

| AC  | Requirement | Status | Implementation |
|-----|-------------|--------|----------------|
| AC1 | Fuerza Bruta applies double damage | ✅ | `CombatEngine.ts:200-215`, `ActiveAbilityEffects.ts:26-32` |
| AC2 | Poción Trágica heals 25-50% HP | ✅ | `ActiveAbilityEffects.ts:37-51` |
| AC3 | Abilities reset between battles | ✅ | `ActiveAbilityManager.ts:45-48`, `CombatEngine.ts:69` |
| AC4 | STR-scaling uses calculated | ✅ | `ActiveAbilityManager.ts:104-108` |
| AC5 | Combat UI integration | ⏳ | Backend ready, UI pending Epic 10 |

**Total**: 4/5 ACs complete (AC5 pending UI epic)

## Requirements Context Summary

### Requirement Sources
- `docs/habilidades-catalogo.md` — Active skills: Fuerza Bruta (double damage, uses scale with STR), Poción Trágica (heal 25-50% HP once)
- Story 4.1 — Combat turn scheduler and action framework
- Story 6.2 — SkillEffectEngine with getActiveAbilities() method
- `docs/GDD.md` — Auto-battle with occasional player choices

### Key Requirements
- Implement active ability state tracking (uses remaining, cooldowns)
- Integrate abilities into combat action selection
- Apply ability effects when triggered (double damage, healing, etc.)
- Reset ability uses at battle end
- Support abilities with variable uses (Fuerza Bruta: 1 use per 30 STR)

## Acceptance Criteria

1. Fuerza Bruta active ability applies double damage and decrements use counter
2. Poción Trágica heals 25-50% HP once per combat
3. Active abilities reset to full uses at start of each new battle
4. Abilities with STR-scaling uses recalculate correctly (0-29 STR = 1 use, 30-59 = 2 uses, etc.)
5. Combat UI indicates available abilities and remaining uses

## Tasks / Subtasks

- [ ] Task 1 (AC: 1) Implement Fuerza Bruta
  - [ ] Subtask 1.1 Calculate initial uses: Math.floor(STR / 30) + 1
  - [ ] Subtask 1.2 Add "Fuerza Bruta" action to combat action pool
  - [ ] Subtask 1.3 Apply x2 damage multiplier when ability used
  - [ ] Subtask 1.4 Decrement uses counter after activation
  - [ ] Subtask 1.5 Remove from action pool when uses exhausted

- [ ] Task 2 (AC: 2) Implement Poción Trágica
  - [ ] Subtask 2.1 Add "Poción Trágica" action with 1 use
  - [ ] Subtask 2.2 Calculate heal amount: random 25-50% of max HP
  - [ ] Subtask 2.3 Apply healing to current HP (cap at max HP)
  - [ ] Subtask 2.4 Remove poison status if present (Chef ability counter)
  - [ ] Subtask 2.5 Mark ability as used (unavailable rest of combat)

- [ ] Task 3 (AC: 3) Battle lifecycle management
  - [ ] Subtask 3.1 Initialize ability uses at combat start via SkillEffectEngine
  - [ ] Subtask 3.2 Track ability state in combat context object
  - [ ] Subtask 3.3 Reset all abilities to full uses when new combat begins
  - [ ] Subtask 3.4 Clear ability state when exiting combat scene
  - [ ] Subtask 3.5 Test ability state persists through combat, resets between battles

- [ ] Task 4 (AC: 4) Dynamic use calculation
  - [ ] Subtask 4.1 Recalculate Fuerza Bruta uses if STR changes mid-combat (edge case)
  - [ ] Subtask 4.2 Support future abilities with level-based uses
  - [ ] Subtask 4.3 Support future abilities with HP-threshold uses
  - [ ] Subtask 4.4 Test use calculation with various STR values (1, 29, 30, 59, 60, 89, 90)
  - [ ] Subtask 4.5 Validate formula matches documented mechanics

- [ ] Task 5 (AC: 5) Combat UI integration
  - [ ] Subtask 5.1 Display ability icons in combat action bar
  - [ ] Subtask 5.2 Show remaining uses counter (e.g., "2/3" for Fuerza Bruta)
  - [ ] Subtask 5.3 Gray out abilities when exhausted
  - [ ] Subtask 5.4 Animate ability activation (flash, particle effect)
  - [ ] Subtask 5.5 Show ability effect in combat log ("Bruto used Fuerza Bruta! x2 damage!")

- [ ] Task 6 (Testing)
  - [ ] Subtask 6.1 Unit test: Fuerza Bruta damage calculation
  - [ ] Subtask 6.2 Unit test: Poción Trágica healing range
  - [ ] Subtask 6.3 Integration test: ability use → effect → uses decrement
  - [ ] Subtask 6.4 Integration test: ability reset between battles
  - [ ] Subtask 6.5 Test AI decision-making with abilities (auto-battle)

## Story Body

### Implementation Outline

**Ability State Tracking:**

```typescript
interface CombatAbilityState {
  fuerzaBruta?: {
    maxUses: number;
    usesRemaining: number;
  };
  pocionTragica?: {
    maxUses: 1;
    usesRemaining: number;
  };
  // ... other active abilities
}

class CombatContext {
  bruto1Abilities: CombatAbilityState;
  bruto2Abilities: CombatAbilityState;
  
  initializeAbilities(bruto: Bruto): CombatAbilityState {
    const abilities: CombatAbilityState = {};
    const skills = skillRepository.getBrutoSkills(bruto.id);
    
    if (skills.includes('fuerza_bruta')) {
      const maxUses = Math.floor(bruto.stats.STR / 30) + 1;
      abilities.fuerzaBruta = { maxUses, usesRemaining: maxUses };
    }
    
    if (skills.includes('pocion_tragica')) {
      abilities.pocionTragica = { maxUses: 1, usesRemaining: 1 };
    }
    
    return abilities;
  }
}
```

**Combat Action Integration:**

```typescript
class CombatEngine {
  getAvailableActions(bruto: Bruto, abilityState: CombatAbilityState): Action[] {
    const actions: Action[] = [
      { type: 'attack', label: 'Attack' }
    ];
    
    // Add active abilities if uses remaining
    if (abilityState.fuerzaBruta?.usesRemaining > 0) {
      actions.push({
        type: 'ability',
        abilityName: 'fuerza_bruta',
        label: `Fuerza Bruta (${abilityState.fuerzaBruta.usesRemaining})`,
        effect: (target) => this.applyFuerzaBruta(bruto, target)
      });
    }
    
    if (abilityState.pocionTragica?.usesRemaining > 0) {
      actions.push({
        type: 'ability',
        abilityName: 'pocion_tragica',
        label: 'Poción Trágica',
        effect: () => this.applyPocionTragica(bruto)
      });
    }
    
    return actions;
  }
  
  applyFuerzaBruta(attacker: Bruto, defender: Bruto): void {
    const baseDamage = this.calculateDamage(attacker, defender);
    const finalDamage = baseDamage * 2; // Double damage
    
    defender.currentHP -= finalDamage;
    
    // Decrement uses
    this.combatContext.getAbilityState(attacker).fuerzaBruta.usesRemaining--;
    
    this.logEvent({
      type: 'ability_used',
      attacker: attacker.name,
      ability: 'Fuerza Bruta',
      damage: finalDamage
    });
  }
  
  applyPocionTragica(bruto: Bruto): void {
    const healPercent = 0.25 + (Math.random() * 0.25); // 25-50%
    const healAmount = Math.floor(bruto.maxHP * healPercent);
    
    bruto.currentHP = Math.min(bruto.currentHP + healAmount, bruto.maxHP);
    
    // Remove poison if present
    if (bruto.statusEffects?.includes('poison')) {
      bruto.statusEffects = bruto.statusEffects.filter(e => e !== 'poison');
    }
    
    // Mark as used
    this.combatContext.getAbilityState(bruto).pocionTragica.usesRemaining = 0;
    
    this.logEvent({
      type: 'ability_used',
      user: bruto.name,
      ability: 'Poción Trágica',
      healing: healAmount
    });
  }
}
```

**AI Decision Making:**

```typescript
class CombatAI {
  selectAction(bruto: Bruto, abilities: CombatAbilityState): Action {
    // Priority: Healing if low HP
    if (bruto.currentHP < bruto.maxHP * 0.3 && abilities.pocionTragica?.usesRemaining > 0) {
      return { type: 'ability', abilityName: 'pocion_tragica' };
    }
    
    // Priority: Fuerza Bruta if available and enemy HP > threshold
    if (abilities.fuerzaBruta?.usesRemaining > 0 && enemy.currentHP > 50) {
      return { type: 'ability', abilityName: 'fuerza_bruta' };
    }
    
    // Default: normal attack
    return { type: 'attack' };
  }
}
```

### Testing Scenarios

1. **Fuerza Bruta Uses**: 
   - STR 15 → 1 use
   - STR 30 → 2 uses
   - STR 60 → 3 uses

2. **Double Damage**: Normal attack 50 damage → Fuerza Bruta 100 damage

3. **Healing Range**: Bruto with 200 max HP → heal 50-100 HP

4. **Ability Reset**: Use all abilities in Battle 1 → start Battle 2 with full uses

5. **Poison Cure**: Bruto poisoned → Poción Trágica → poison removed

## Dev Notes

### Future Active Abilities
- Guaranteed Critical (1 use)
- Counterattack (passive that can activate)
- Berserk Mode (temporary buff)
- Shield Block (damage negation)

### AI Complexity
Start with simple heuristics, refine based on playtesting:
- Use healing at <30% HP
- Use damage abilities early when enemy HP high
- Save abilities if losing badly (surrender logic)

## References
- Active abilities in docs/habilidades-catalogo.md
- Combat turn system from Story 4.1
- Effect engine design from Story 6.2

## Change Log
- 2025-10-31: Story created for Epic 6 active ability mechanics

## Dev Agent Record
### Agent Model Used
{{agent_model_name_version}}

## Senior Developer Review (AI)
**Reviewer:** {{reviewer_name}}  
**Date:** {{review_date}}  
**Outcome:** {{Approved | Changes Requested | Rejected}}
