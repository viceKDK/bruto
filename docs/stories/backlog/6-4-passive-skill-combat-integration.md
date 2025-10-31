# Story 6.4: Passive Skill Combat Integration

Status: backlog

## Story
As a developer,
I want passive skill effects (armor bonuses, evasion modifiers, resistances) fully integrated into combat calculations,
so that skills like Toughened Skin, Esqueleto de Plomo, and Reflejos Felinos work correctly during battles.

## Requirements Context Summary

### Requirement Sources
- `docs/habilidades-catalogo.md` — Passive skills: Toughened Skin (+10% armor), Esqueleto de Plomo (+15% armor, -15% evasion), etc.
- Story 4.2 — Combat damage and evasion formulas established
- Story 6.2 — SkillEffectEngine design for applying passive effects
- `docs/stast.md` — Base stat calculations and modifier chains

### Key Requirements
- Integrate armor/damage reduction passives into damage calculation
- Integrate evasion modifiers into dodge chance calculation
- Integrate weapon-specific damage bonuses (Maestro de Espadas)
- Support damage type resistances (blunt, slash, pierce)
- Apply passives in correct order: base stats → equipment → skills → caps

## Acceptance Criteria

1. Armor passives (Toughened Skin, Esqueleto de Plomo) reduce incoming damage correctly
2. Evasion modifiers affect dodge chance during combat turns
3. Weapon-specific bonuses apply only when wielding matching weapon types
4. Damage type resistances reduce damage from specific weapon categories
5. All passive effects stack correctly and respect documented caps (max 75% armor)

## Tasks / Subtasks

- [ ] Task 1 (AC: 1) Integrate armor passives
  - [ ] Subtask 1.1 Modify CombatEngine.calculateDamage() to query SkillEffectEngine.getArmorModifiers()
  - [ ] Subtask 1.2 Sum base armor + equipment armor + skill armor bonuses
  - [ ] Subtask 1.3 Apply armor percentage to incoming damage
  - [ ] Subtask 1.4 Enforce 75% armor cap per documented rules
  - [ ] Subtask 1.5 Test with multiple armor skills stacking

- [ ] Task 2 (AC: 2) Integrate evasion modifiers
  - [ ] Subtask 2.1 Modify CombatEngine.calculateEvasion() to query SkillEffectEngine.getEvasionModifiers()
  - [ ] Subtask 2.2 Apply evasion bonuses (+Reflejos Felinos) and penalties (-Esqueleto de Plomo)
  - [ ] Subtask 2.3 Calculate final evasion chance: base agility + skill modifiers
  - [ ] Subtask 2.4 Enforce evasion caps (max documented evasion %)
  - [ ] Subtask 2.5 Test evasion with conflicting skills (bonus + penalty)

- [ ] Task 3 (AC: 3) Weapon-specific bonuses
  - [ ] Subtask 3.1 Add weapon type check in damage calculation
  - [ ] Subtask 3.2 Apply Maestro de Espadas +20% slash damage only with swords
  - [ ] Subtask 3.3 Apply similar bonuses for other weapon mastery skills
  - [ ] Subtask 3.4 Test bonus applies only with matching weapon equipped
  - [ ] Subtask 3.5 Test bonus does NOT apply with wrong weapon type

- [ ] Task 4 (AC: 4) Damage type resistances
  - [ ] Subtask 4.1 Add damage type metadata to weapons (blunt, slash, pierce)
  - [ ] Subtask 4.2 Query skill resistances from SkillEffectEngine
  - [ ] Subtask 4.3 Apply Esqueleto de Plomo -15% blunt damage reduction
  - [ ] Subtask 4.4 Stack with armor for total damage reduction
  - [ ] Subtask 4.5 Test resistance applies only to matching damage types

- [ ] Task 5 (AC: 5) Stacking and caps validation
  - [ ] Subtask 5.1 Document stacking rules for each passive type
  - [ ] Subtask 5.2 Implement cap enforcement (armor max 75%, evasion max X%)
  - [ ] Subtask 5.3 Test edge case: exceeding caps with multiple skills
  - [ ] Subtask 5.4 Log warnings if caps exceeded during development
  - [ ] Subtask 5.5 Unit tests for all cap scenarios

## Story Body

### Implementation Outline

**Combat Integration Points:**

```typescript
class CombatEngine {
  calculateDamage(attacker: Bruto, defender: Bruto, weapon: Weapon): number {
    // 1. Base damage from STR + weapon
    let damage = attacker.stats.STR + weapon.baseDamage;
    
    // 2. Apply weapon-specific skill bonuses (Maestro de Espadas)
    const weaponBonuses = skillEffectEngine.getWeaponBonuses(attacker, weapon.type);
    damage *= (1 + weaponBonuses);
    
    // 3. Calculate defender armor
    const baseArmor = defender.equipment.armor || 0;
    const skillArmor = skillEffectEngine.getArmorModifiers(defender);
    const totalArmor = Math.min(baseArmor + skillArmor, 0.75); // Cap at 75%
    
    // 4. Apply damage type resistance
    const typeResistance = skillEffectEngine.getResistance(defender, weapon.damageType);
    
    // 5. Apply reductions
    damage *= (1 - totalArmor);
    damage *= (1 - typeResistance);
    
    return Math.max(1, Math.floor(damage)); // Minimum 1 damage
  }
  
  calculateEvasion(defender: Bruto): number {
    const baseEvasion = defender.stats.Agility * 0.01; // 1% per agility point
    const skillModifiers = skillEffectEngine.getEvasionModifiers(defender);
    
    return Math.min(baseEvasion + skillModifiers, 0.9); // Cap at 90%
  }
}
```

**SkillEffectEngine Methods:**

```typescript
class SkillEffectEngine {
  getArmorModifiers(bruto: Bruto): number {
    const skills = skillRepository.getBrutoSkills(bruto.id);
    let armorBonus = 0;
    
    skills.forEach(skill => {
      const skillDef = skillCatalog.getSkillByName(skill);
      skillDef.effects
        .filter(e => e.type === 'DamageReduction')
        .forEach(e => armorBonus += e.value);
    });
    
    return armorBonus; // e.g., 0.10 for Toughened Skin, 0.15 for Esqueleto de Plomo
  }
  
  getEvasionModifiers(bruto: Bruto): number {
    const skills = skillRepository.getBrutoSkills(bruto.id);
    let evasionMod = 0;
    
    skills.forEach(skill => {
      const skillDef = skillCatalog.getSkillByName(skill);
      skillDef.effects
        .filter(e => e.type === 'EvasionModifier')
        .forEach(e => evasionMod += e.value); // Can be negative (Esqueleto de Plomo -0.15)
    });
    
    return evasionMod;
  }
  
  getWeaponBonuses(bruto: Bruto, weaponType: string): number {
    const skills = skillRepository.getBrutoSkills(bruto.id);
    let bonus = 0;
    
    skills.forEach(skill => {
      const skillDef = skillCatalog.getSkillByName(skill);
      skillDef.effects
        .filter(e => e.type === 'WeaponMastery' && e.weaponType === weaponType)
        .forEach(e => bonus += e.value);
    });
    
    return bonus; // e.g., 0.20 for +20% damage
  }
  
  getResistance(bruto: Bruto, damageType: string): number {
    const skills = skillRepository.getBrutoSkills(bruto.id);
    let resistance = 0;
    
    skills.forEach(skill => {
      const skillDef = skillCatalog.getSkillByName(skill);
      skillDef.effects
        .filter(e => e.type === 'DamageTypeResistance' && e.damageType === damageType)
        .forEach(e => resistance += e.value);
    });
    
    return resistance; // e.g., 0.15 for -15% blunt damage
  }
}
```

### Testing Scenarios

1. **Armor Stacking**: Bruto with Toughened Skin + Esqueleto de Plomo = 25% armor (10% + 15%)
2. **Evasion Trade-off**: Esqueleto de Plomo gives +15% armor but -15% evasion
3. **Weapon Mastery**: Maestro de Espadas with sword = +20% damage, with axe = no bonus
4. **Type Resistance**: Esqueleto de Plomo vs blunt weapon = -15% extra reduction
5. **Cap Enforcement**: 5 armor skills totaling 90% = capped at 75%

## Dev Notes

### Performance Optimization
- Cache skill queries per combat session (don't query DB every turn)
- Pre-calculate passive modifiers at combat start
- Only recalculate if skills change mid-combat (rare)

### Future Extensions
- Conditional passives (e.g., "at low HP")
- Time-based passives (e.g., "first 3 turns")
- Stacking penalties (diminishing returns)

## References
- Passive skill catalog in docs/habilidades-catalogo.md
- Combat formulas from Story 4.2
- SkillEffectEngine from Story 6.2
- Stat calculation pipeline from docs/stast.md

## Change Log
- 2025-10-31: Story created for Epic 6 passive skill combat integration

## Dev Agent Record
### Agent Model Used
{{agent_model_name_version}}

## Senior Developer Review (AI)
**Reviewer:** {{reviewer_name}}  
**Date:** {{review_date}}  
**Outcome:** {{Approved | Changes Requested | Rejected}}
