  # Story 8.2: Level-Up Upgrade Options (A/B Choice)

**Epic:** 8 - Progression & Leveling  
**Story Points:** 5  
**Priority:** High  
**Status:** Todo

---

## User Story

**As a player,**  
I want to choose between 2 random upgrade options (A or B) when I level up,  
So that I can customize my bruto's build and progression path.

---

## Acceptance Criteria

1. **Upgrade Option Generation:**
   - Generate 2 random options from pool: New Weapon, New Skill, Full Stat Boost, Split Stat Boost, Pet
   - Options are weighted/filtered based on what bruto already has
   - Options are truly random but seeded for fairness

2. **Option Types:**
   - **Full Stat Boost:** +2 STR OR +2 Speed OR +2 Agility OR +12 HP
   - **Split Stat Boost:** +1/+1 in two different stats OR +6 HP + 1 stat
   - **New Weapon:** Random weapon from available pool (Epic 5 - stub for now)
   - **New Skill:** Random skill from available pool (Epic 6 - stub for now)
   - **New Pet:** Dog/Panther/Bear (Epic 7 - stub for now)

3. **UI Presentation:**
   - Modal/screen shows both options side-by-side
   - Clear description of what each option provides
   - Click to select Option A or Option B
   - Cannot proceed without making a choice

4. **Choice Recording:**
   - Store selected option in database (level_upgrades table)
   - Track upgrade history: level_number, option_chosen, option_a_desc, option_b_desc
   - History viewable in Casillero (Story 8.4)

5. **Application:**
   - Selected upgrade applies immediately to bruto stats
   - UI updates to reflect new values
   - Return to Casillero or continue to next battle

---

## Technical Implementation

### Database Schema

```sql
CREATE TABLE level_upgrades (
  id INTEGER PRIMARY KEY,
  bruto_id INTEGER NOT NULL,
  level_number INTEGER NOT NULL,
  option_a_type TEXT NOT NULL,
  option_a_value TEXT NOT NULL,
  option_b_type TEXT NOT NULL,
  option_b_value TEXT NOT NULL,
  chosen_option TEXT NOT NULL, -- 'A' or 'B'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bruto_id) REFERENCES brutos(id)
);
```

### Upgrade Generator

```typescript
// engine/UpgradeGenerator.ts
type UpgradeType = 'FULL_STAT' | 'SPLIT_STAT' | 'WEAPON' | 'SKILL' | 'PET';

interface UpgradeOption {
  type: UpgradeType;
  description: string;
  stats?: { str?: number; speed?: number; agi?: number; hp?: number };
  weaponId?: number;
  skillId?: number;
  petType?: string;
}

export class UpgradeGenerator {
  static generateOptions(bruto: IBruto): [UpgradeOption, UpgradeOption] {
    // Generate 2 random different options
  }
}
```

---

## Prerequisites

- ✅ Story 8.1: XP and Level Progression
- ⚠️ Epics 5, 6, 7 (Weapons, Skills, Pets) - can stub for now

---

## Definition of Done

- [ ] Level-up triggers option selection screen
- [ ] 2 random options generated each level
- [ ] Full and Split stat boosts work correctly
- [ ] Weapon/Skill/Pet options stubbed (show placeholder)
- [ ] Choice is recorded in database
- [ ] Selected upgrade applies immediately
- [ ] UI shows clear A/B choice with descriptions
- [ ] Unit tests for option generator

---

## Notes

- For now, stub Weapon/Skill/Pet options with placeholders
- Focus on stat boost options first (most common)
- Ensure no duplicate option types in same level-up
- UI should feel impactful - this is a key decision moment!
