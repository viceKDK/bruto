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

- [ ] Task 1 (AC: 1, 2): Create pets data structure
  - [ ] Subtask 1.1: Create TypeScript interfaces (Pet, PetType, PetStats)
  - [ ] Subtask 1.2: Create pets.json catalog with 3 pet types
  - [ ] Subtask 1.3: Add pet metadata: stats, costs, stacking rules
  - [ ] Subtask 1.4: Document resistance cost formula variations

- [ ] Task 2 (AC: 3): Database schema
  - [ ] Subtask 2.1: Create bruto_pets migration table
  - [ ] Subtask 2.2: Add columns: bruto_id, pet_type, pet_slot (A/B/C for dogs), acquired_at
  - [ ] Subtask 2.3: Create PetRepository with CRUD operations
  - [ ] Subtask 2.4: Add getBrutoPets(brutoId) query method

- [ ] Task 3 (AC: 4, 5): Stacking and cost rules
  - [ ] Subtask 3.1: Document max 3 Perros (slots A, B, C)
  - [ ] Subtask 3.2: Document Pantera XOR Oso exclusion
  - [ ] Subtask 3.3: Create PetCostCalculator for resistance penalties
  - [ ] Subtask 3.4: Support Vitalidad/Inmortal cost modifiers

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
