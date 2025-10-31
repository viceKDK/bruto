# Story 6.3: Skill Acquisition System

Status: backlog

## Story
As a player,
I want to acquire new skills through victory rewards and level-ups with proper odds and rarity distribution,
so that my bruto becomes more powerful and unique over time.

## Requirements Context Summary

### Requirement Sources
- `docs/epics.md` — Epic 6 requires skill activation odds implementation
- `docs/habilidades-catalogo.md` — Documents skill odds/rarity percentages (e.g., Fuerza Hércules: 5.83%)
- `docs/GDD.md` — Section 11 defines skill acquisition through post-victory rewards
- Story 6.1 — Skill catalog with odds metadata established

### Key Requirements
- Implement skill reward system triggered after battle victories
- Use documented odds percentages to select skills randomly
- Prevent duplicate skill acquisition (respect unique/stackable rules)
- Integrate with victory rewards flow (Epic 10 dependency)
- Support level-up skill rewards as alternative acquisition method
- Track skill acquisition history (when, at what level, from what source)

## Acceptance Criteria

1. Victory reward system randomly awards skills based on documented odds from skills catalog
2. Skill uniqueness enforced: cannot acquire same unique skill twice
3. Mutual exclusion rules respected: cannot acquire conflicting skills
4. Skill acquisition persisted to database with metadata (source, level, timestamp)
5. UI displays newly acquired skill with description and immediate effects applied

## Tasks / Subtasks

- [ ] Task 1 (AC: 1) Implement skill reward selector
  - [ ] Subtask 1.1 Create SkillRewardService with selectRandomSkill(bruto, rewardPool) method
  - [ ] Subtask 1.2 Weight selection by odds percentages from skill catalog
  - [ ] Subtask 1.3 Filter out already owned unique skills
  - [ ] Subtask 1.4 Filter out mutually exclusive skills based on current skills
  - [ ] Subtask 1.5 Use seeded RNG for deterministic replay compatibility

- [ ] Task 2 (AC: 2, 3) Enforce ownership rules
  - [ ] Subtask 2.1 Query bruto's current skills before selection
  - [ ] Subtask 2.2 Check skill.stackable flag from catalog
  - [ ] Subtask 2.3 Check skill.mutuallyExclusiveWith array
  - [ ] Subtask 2.4 Fall back to alternative reward if no valid skills available

- [ ] Task 3 (AC: 4) Persist skill acquisition
  - [ ] Subtask 3.1 Call SkillRepository.addSkillToBruto(brutoId, skillName, metadata)
  - [ ] Subtask 3.2 Record acquisition source (victory, level-up, purchase, etc.)
  - [ ] Subtask 3.3 Record bruto level at acquisition time
  - [ ] Subtask 3.4 Record timestamp for history tracking

- [ ] Task 4 (AC: 5) Integrate skill effects on acquisition
  - [ ] Subtask 4.1 Call SkillEffectEngine.applyImmediateEffects(bruto, skill) after acquisition
  - [ ] Subtask 4.2 Update bruto stats if skill has stat boosts (Fuerza Hércules +3 STR, +50%)
  - [ ] Subtask 4.3 Recalculate derived stats via StatsCalculator
  - [ ] Subtask 4.4 Persist updated stats to database

- [ ] Task 5 (UI & Integration)
  - [ ] Subtask 5.1 Create skill acquisition modal/notification UI
  - [ ] Subtask 5.2 Display skill icon, name, description, and effects
  - [ ] Subtask 5.3 Animate stat changes if applicable (HP, STR, Speed, Agility)
  - [ ] Subtask 5.4 Wire into victory screen flow (post-combat)
  - [ ] Subtask 5.5 Wire into level-up flow as skill reward option

- [ ] Task 6 (Testing)
  - [ ] Subtask 6.1 Unit test: odds-based selection with weighted probabilities
  - [ ] Subtask 6.2 Unit test: uniqueness enforcement
  - [ ] Subtask 6.3 Unit test: mutual exclusion enforcement
  - [ ] Subtask 6.4 Integration test: acquire skill → effects applied → stats updated → persisted
  - [ ] Subtask 6.5 Test edge case: no valid skills available (all owned/excluded)

## Story Body

### Implementation Outline

**Skill Reward Flow:**
1. Battle victory triggers reward calculation
2. SkillRewardService determines if skill reward granted (vs coins/items)
3. Filter available skills: exclude owned unique skills, mutually exclusive skills
4. Weight remaining skills by odds percentages
5. Select random skill using weighted RNG
6. Apply immediate skill effects via SkillEffectEngine
7. Persist skill to bruto_skills table
8. Display acquisition UI with before/after stats

**Odds-Based Selection Algorithm:**
```typescript
class SkillRewardService {
  selectRandomSkill(bruto: Bruto, rewardPool: string[] = 'all'): Skill | null {
    const ownedSkills = skillRepository.getBrutoSkills(bruto.id);
    const allSkills = skillCatalog.getAll();
    
    // Filter available skills
    const available = allSkills.filter(skill => {
      // Skip if already owned and not stackable
      if (!skill.stackable && ownedSkills.includes(skill.name)) return false;
      
      // Skip if mutually exclusive with owned skill
      const hasExclusion = skill.mutuallyExclusiveWith.some(
        excluded => ownedSkills.includes(excluded)
      );
      if (hasExclusion) return false;
      
      // Apply reward pool filter if specified
      if (rewardPool !== 'all' && !rewardPool.includes(skill.name)) return false;
      
      return true;
    });
    
    if (available.length === 0) return null;
    
    // Weight by odds and select
    return this.weightedRandomSelect(available, skill => skill.odds);
  }
}
```

**Immediate Effect Application:**
```typescript
async function acquireSkill(bruto: Bruto, skill: Skill, source: string) {
  // Apply immediate effects
  const updatedStats = skillEffectEngine.applyImmediateEffects(bruto, skill);
  bruto.stats = updatedStats;
  
  // Persist skill ownership
  await skillRepository.addSkillToBruto(bruto.id, skill.name, {
    source,
    level: bruto.level,
    acquiredAt: new Date()
  });
  
  // Persist updated stats
  await brutoRepository.updateStats(bruto.id, updatedStats);
  
  // Trigger UI notification
  uiService.showSkillAcquired(skill, bruto);
}
```

### Integration Points

- **Epic 10 (Victory Rewards)**: Post-combat reward screen triggers skill acquisition
- **Epic 8 (Progression)**: Level-up may offer skill as upgrade option
- **Story 6.2**: SkillEffectEngine applies immediate effects
- **Story 6.1**: SkillCatalog provides skill data and odds

### Skill Acquisition Sources

1. **Victory Rewards** (Primary)
   - Random chance after winning battle
   - Higher chance at certain milestones (e.g., every 5 victories)
   
2. **Level-Up Rewards** (Secondary)
   - May appear as one of the A/B upgrade options
   - Competes with stat boosts

3. **Special Events** (Future)
   - Quest completions
   - Achievement unlocks
   - Shop purchases (if implemented)

## Dev Notes

### Weighted Random Selection
Use cumulative probability ranges for fair distribution:
- Fuerza Hércules: 5.83% → range [0, 5.83)
- Toughened Skin: 8% → range [5.83, 13.83)
- etc.

### Edge Cases
- All skills owned/excluded → grant alternative reward (coins)
- Multiple acquisitions in same session → refresh available pool each time
- Skill acquired during level-up → immediate effects apply before next level

### Performance Considerations
- Cache bruto skills list during reward session
- Pre-filter skill catalog at session start
- Batch database writes if multiple rewards granted

## References
- Skill odds documented in docs/habilidades-catalogo.md
- Victory reward system from Epic 10
- Level-up flow from Epic 8 (Stories 8.1, 8.2)
- Skill catalog from Story 6.1
- Effect engine from Story 6.2

## Change Log
- 2025-10-31: Story created for Epic 6 Skills System acquisition mechanics

## Dev Agent Record
### Context Reference
<!-- Populated during implementation -->

### Agent Model Used
{{agent_model_name_version}}

### Completion Notes List
<!-- Populated during implementation -->

### File List
<!-- Populated during implementation -->

## Senior Developer Review (AI)
**Reviewer:** {{reviewer_name}}  
**Date:** {{review_date}}  
**Outcome:** {{Approved | Changes Requested | Rejected}}
