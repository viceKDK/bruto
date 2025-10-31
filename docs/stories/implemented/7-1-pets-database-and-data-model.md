# Story 7.1: Pets Database and Data Model

Status: backlog

## Story
As a developer,
I want a complete pets data model with catalog of all 3 pet types (Perro, Pantera, Oso) and database schema,
so that pets can be assigned to brutos and their stats/effects properly tracked.

## Requirements Context Summary

### Requirement Sources
- `docs/stast.md` — Complete pet stats: Perro (14 HP, Agility 5), Pantera (26 HP, Agility 16), Oso (110 HP, Agility 2)
- `docs/GDD.md` — Pets provide combat assistance with stat trade-offs
- `docs/epics.md` — Epic 7 requires pets with stat impacts, combat AI, and resistance trade-offs

### Key Requirements
- Create pets catalog with 3 types: Perro, Pantera, Oso
- Define pet stats: HP, Damage, Agility, Speed, Multi-hit%, Evasion%, Initiative
- Implement resistance cost system (Perro: -4 to -7, Pantera: -6 to -22, Oso: -8 to -42)
- Support stacking rules (up to 3 Perros, Pantera OR Oso, not both)
- Database schema for bruto_pets tracking ownership

## Acceptance Criteria

1. Pets catalog JSON contains all 3 pet types with complete stats
2. TypeScript interfaces define Pet, PetType, PetStats types
3. Database schema tracks pet ownership with bruto_pets table
4. Pet stacking rules documented and enforceable (max 3 Perros, Pantera XOR Oso)
5. Resistance cost calculations support Vitalidad/Inmortal skill modifiers

## Tasks / Subtasks

- [ ] Task 1: Create pet data structures and catalog
  - [ ] Subtask 1.1: Create `src/engine/pets/PetType.ts` with PetType enum
  - [ ] Subtask 1.2: Create `src/engine/pets/Pet.ts` with Pet and PetStats interfaces
  - [ ] Subtask 1.3: Create `src/data/pets.json` with all 3 pet types and their stats
  - [ ] Subtask 1.4: Create `src/engine/pets/PetCatalog.ts` loader class

- [ ] Task 2: Database schema and migrations
  - [ ] Subtask 2.1: Create `src/database/migrations/008_pets_system.sql` 
  - [ ] Subtask 2.2: Define bruto_pets table (id, bruto_id, pet_type, pet_slot, acquired_at, acquired_level)
  - [ ] Subtask 2.3: Create `src/database/repositories/PetRepository.ts` with CRUD methods
  - [ ] Subtask 2.4: Implement getBrutoPets(brutoId), addPetToBruto(), removePetFromBruto()

- [ ] Task 3: Pet stacking and validation logic
  - [ ] Subtask 3.1: Create `src/engine/pets/PetStackingValidator.ts`
  - [ ] Subtask 3.2: Implement max 3 Perros validation (slots A, B, C)
  - [ ] Subtask 3.3: Implement Pantera XOR Oso exclusion (cannot have both)
  - [ ] Subtask 3.4: Validate pet acquisition against current roster

- [ ] Task 4: Resistance cost calculations
  - [ ] Subtask 4.1: Create `src/engine/pets/PetCostCalculator.ts`
  - [ ] Subtask 4.2: Implement getResistanceCost(petType, hasVitalidad, hasInmortal)
  - [ ] Subtask 4.3: Support all 4 modifier combinations (base, +Vitalidad, +Inmortal, +both)
  - [ ] Subtask 4.4: Ensure no negative resistance (clamped to 0)

- [ ] Task 5: Unit tests
  - [ ] Subtask 5.1: Create `src/engine/pets/PetCatalog.test.ts` - verify all pets loaded correctly
  - [ ] Subtask 5.2: Create `src/engine/pets/PetStackingValidator.test.ts` - test stacking rules
  - [ ] Subtask 5.3: Create `src/engine/pets/PetCostCalculator.test.ts` - test all cost scenarios
  - [ ] Subtask 5.4: Create `src/database/repositories/PetRepository.test.ts` - database operations

## Story Body

### Pet Stats (from stast.md)

**Perro (Dog)**
- HP: 14, Damage: Low, Agility: 5, Speed: 3
- Multi-hit: 10%, Evasion: 0%, Initiative: -10
- Stackable: Up to 3 (A, B, C slots)
- Resistance Cost: -4 (base), -3 (Vitalidad), -7 (Inmortal), -10 (both)

**Pantera (Panther)**
- HP: 26, Damage: Medium, Agility: 16, Speed: 24
- Multi-hit: 60%, Evasion: 20%, Initiative: -60
- Exclusive: Cannot coexist with Oso
- Resistance Cost: -6 (base), -9 (Vitalidad), -15 (Inmortal), -22 (both)

**Oso (Bear)**
- HP: 110, Damage: High, Agility: 2, Speed: 1
- Multi-hit: -20%, Evasion: 0%, Initiative: -360
- Exclusive: Cannot coexist with Pantera
- Special: Can disarm opponents
- Resistance Cost: -8 (base), -12 (Vitalidad), -28 (Inmortal), -42 (both)

### Data Structure

```typescript
interface Pet {
  id: string;
  name: string;
  type: PetType;
  stats: PetStats;
  stackable: boolean;
  maxStacks: number;
  mutuallyExclusiveWith: PetType[];
  resistanceCost: {
    base: number;
    withVitalidad: number;
    withInmortal: number;
    withBoth: number;
  };
  specialAbilities?: string[];
}

enum PetType {
  PERRO = 'perro',
  PANTERA = 'pantera',
  OSO = 'oso'
}

interface PetStats {
  hp: number;
  damage: 'low' | 'medium' | 'high';
  agility: number;
  speed: number;
  multiHitChance: number;  // percentage
  evasionChance: number;   // percentage
  initiative: number;       // negative values delay turns
}
```

### Database Schema

```sql
CREATE TABLE bruto_pets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bruto_id INTEGER NOT NULL,
  pet_type TEXT NOT NULL, -- 'perro', 'pantera', 'oso'
  pet_slot TEXT,          -- 'A', 'B', 'C' for perros, NULL for others
  acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  acquired_level INTEGER,
  FOREIGN KEY (bruto_id) REFERENCES brutos(id) ON DELETE CASCADE,
  UNIQUE(bruto_id, pet_type, pet_slot)
);
```

## Dev Notes

### Architecture & Patterns
- Follow the **Strategy Pattern** for PetCostCalculator (different formulas for Vitalidad/Inmortal combinations)
- Use **Repository Pattern** for database access (PetRepository abstracts SQL)
- **Immutable Pet Catalog**: Load once on boot, don't modify during play
- **Enum-based types**: Use PetType enum to prevent string typos

### Project Structure
- Pet system lives in `src/engine/pets/` (core game logic)
- Pet data in `src/data/pets.json` (configuration)
- Database layer in `src/database/repositories/` (persistence)
- Tests mirror source: `src/engine/pets/*.test.ts`

### References
- Pet stats definition: [Source: docs/stast.md#Perro-Mascota, lines 71-120]
- Resistance cost formula: [Source: docs/stast.md#Vida-Complementaria, lines 44-70]
- Epic 7 breakdown: [Source: docs/epics.md#Epic-7-Pets-System]
- StatsCalculator pattern: [Source: docs/stories/implemented/4-2-stat-based-damage-and-evasion.md]

### Testing Standards
- Unit test each calculator function independently
- Mock database for repository tests
- Test all 4 resistance cost modifier combinations
- Verify stacking validation rejects invalid configurations
- Validate catalog loads all 3 pet types with correct stats

## References
- Pet stats in docs/stast.md lines 71-120
- Epic 7 definition in docs/epics.md
- Resistance calculations in docs/stast.md lines 44-45, 63-70

## Change Log
- 2025-10-31: Story created for Epic 7 Pets System data model

## Dev Agent Record
### Agent Model Used
{{agent_model_name_version}}

## Senior Developer Review (AI)
**Reviewer:** {{reviewer_name}}  
**Date:** {{review_date}}  
**Outcome:** {{Approved | Changes Requested | Rejected}}
