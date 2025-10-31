# Pets System Module

**Stories:** 7.1 (Database & Data Model) + 7.2 (Stats System) + 7.3 (Combat AI)  
**Epic:** 7 - Pets System

## Overview

This module implements the complete pet system for El Bruto, including:
- Pet data model and catalog
- Stacking validation rules
- Resistance cost calculations
- Combat stat contributions
- Pet combat AI and attacks
- Special abilities (Oso disarm)
- Integration with StatsCalculator and CombatEngine

## Module Structure

```
src/engine/pets/
├── PetType.ts                    # Pet type enum (Perro, Pantera, Oso)
├── Pet.ts                        # Core interfaces
├── PetCatalog.ts                 # Singleton catalog loader
├── PetCostCalculator.ts          # Resistance cost calculations
├── PetStackingValidator.ts       # Stacking rules validator
├── PetStatsService.ts            # Stat calculations (Story 7.2)
├── PetCombatStats.ts             # Combat modifier functions (Story 7.2)
├── PetCombatant.ts               # Pet combatant model (Story 7.3)
├── PetCombatService.ts           # Pet combat AI (Story 7.3)
└── index.ts                      # Module exports
```

## Usage Examples

### 1. Loading Pet Catalog

```typescript
import { PetCatalog, PetType } from './engine/pets';

const catalog = PetCatalog.getInstance();
const perro = catalog.getPetByType(PetType.PERRO);

console.log(perro?.stats.hp); // 14
console.log(perro?.resistanceCost.base); // 2
```

### 2. Validating Pet Acquisition

```typescript
import { PetStackingValidator, PetType } from './engine/pets';

const validator = new PetStackingValidator();
const currentPets = [...]; // BrutoPet[]

// Can bruto acquire a new Perro?
const result = validator.canAcquirePet(currentPets, PetType.PERRO);

if (result.valid) {
  const slot = validator.getNextPerroSlot(currentPets);
  console.log(`Can acquire Perro in slot ${slot}`);
} else {
  console.log(`Cannot acquire: ${result.reason}`);
}
```

### 3. Calculating Resistance Cost

```typescript
import { PetCostCalculator, PetType } from './engine/pets';

const calculator = new PetCostCalculator();

// Base cost
const baseCost = calculator.getResistanceCost(PetType.OSO, false, false);
// 8

// Cost with Vitalidad + Inmortal
const highCost = calculator.getResistanceCost(PetType.OSO, true, true);
// 42

// Calculate new resistance after acquisition
const newResistance = calculator.calculateNewResistance(
  50,              // current resistance
  PetType.OSO,     // pet to acquire
  true,            // has Vitalidad
  true             // has Inmortal
);
// 8 (50 - 42)
```

### 4. Calculating Pet Stats (Story 7.2)

```typescript
import { PetStatsService } from './engine/pets';

const statsService = new PetStatsService();
const brutoPets = [...]; // BrutoPet[]

// Calculate all stat contributions
const summary = statsService.calculatePetStats(
  brutoPets,
  true,  // has Vitalidad
  false  // has Inmortal
);

console.log(summary.hpBonus);          // Total HP from pets
console.log(summary.agilityBonus);     // Total agility from pets
console.log(summary.multiHitBonus);    // Multi-hit % modifier
console.log(summary.resistanceCost);   // Total resistance cost
```

### 5. Integration with StatsCalculator

```typescript
import { StatsCalculator } from './engine/StatsCalculator';
import { PetStatsService } from './engine/pets';

const statsCalc = new StatsCalculator();
const petStatsService = new PetStatsService();

// Get pet stat contributions
const petContributions = petStatsService.getPetStatContributions(brutoPets);

// Build stats summary with pet bonuses
const summary = statsCalc.buildSummary(bruto, {
  flatModifiers: [
    ...skillModifiers,
    ...petContributions  // Add pet contributions
  ]
});

// Summary now includes pet HP, agility, speed bonuses
console.log(summary.primary.find(s => s.key === 'hp')?.effective);
// Base HP + skill bonuses + pet bonuses
```

### 6. Combat Stats with Pets

```typescript
import {
  calculateMultiHitChance,
  calculateEvasionChance,
  calculateInitiative
} from './engine/pets';

const petStats = statsService.calculatePetStats(brutoPets);

// Multi-hit chance in combat
const multiHit = calculateMultiHitChance(
  0,                           // base multi-hit
  petStats.multiHitBonus       // pet modifier
);

// Evasion chance in combat
const agilityEvasion = bruto.agility * 0.1;
const evasion = calculateEvasionChance(
  agilityEvasion * 100,        // base evasion %
  petStats.evasionBonus        // pet modifier %
);

// Initiative for turn order
const initiative = calculateInitiative(
  bruto.speed,
  petStats.initiativeBonus
);
```

### 7. Pet Combat (Story 7.3)

```typescript
import {
  PetCombatService,
  createPetCombatant,
  getPetDisplayName,
  PetType
} from './engine/pets';
import { SeededRandom } from './utils/SeededRandom';

const rng = new SeededRandom(Date.now());
const petCombat = new PetCombatService(rng);

// Create pet combatant from catalog data
const catalog = PetCatalog.getInstance();
const perroData = catalog.getPetByType(PetType.PERRO);
const perroCombatant = createPetCombatant(
  PetType.PERRO,
  'A',           // slot
  'player',      // owner side
  'bruto-123',   // owner ID
  perroData!.stats
);

// Execute pet attack
const attackResult = petCombat.executePetAttack(
  perroCombatant,
  'opponent',    // target side
  15,            // target agility
  true           // target has weapon (for Oso disarm)
);

if (attackResult.hit) {
  console.log(`${getPetDisplayName(perroCombatant)} hits for ${attackResult.damage} damage!`);
  
  if (attackResult.isCritical) {
    console.log('Critical hit!');
  }
  
  if (attackResult.disarmEvent?.success) {
    console.log('Oso disarmed the opponent!');
  }
}

// Apply damage to pet
const damagedPet = petCombat.applyDamageToPet(perroCombatant, 8);
console.log(`${getPetDisplayName(damagedPet)} HP: ${damagedPet.currentHp}/${damagedPet.stats.hp}`);

if (damagedPet.isDefeated) {
  console.log(`${getPetDisplayName(damagedPet)} was defeated!`);
}

// Calculate initiative for turn order
const perroInit = petCombat.calculatePetInitiative(PetType.PERRO, 3);
const panteraInit = petCombat.calculatePetInitiative(PetType.PANTERA, 24);
const osoInit = petCombat.calculatePetInitiative(PetType.OSO, 1);

console.log('Turn order (lower = faster):');
console.log(`Pantera: ${panteraInit}`);  // Fastest
console.log(`Perro: ${perroInit}`);
console.log(`Oso: ${osoInit}`);          // Slowest
```

### 8. Combat Integration with Pets

```typescript
import { CombatStateMachine } from './engine/combat/CombatStateMachine';

const stateMachine = new CombatStateMachine();

// Build turn queue with brutos and pets
const turnQueue = [];

// Player bruto
turnQueue.push({
  side: 'player',
  initiative: 850,
  isExtraTurn: false,
  combatantType: 'bruto'
});

// Player's Perro A
turnQueue.push({
  side: 'player',
  initiative: 890,
  isExtraTurn: false,
  combatantType: 'pet',
  petId: 'Perro-A'
});

// Opponent bruto
turnQueue.push({
  side: 'opponent',
  initiative: 900,
  isExtraTurn: false,
  combatantType: 'bruto'
});

// Opponent's Pantera
turnQueue.push({
  side: 'opponent',
  initiative: 700,
  isExtraTurn: false,
  combatantType: 'pet',
  petId: 'Pantera'
});

// Initialize battle
stateMachine.initialize(turnQueue);

// Process turns
while (!stateMachine.isBattleOver()) {
  const state = stateMachine.getState();
  const side = stateMachine.getCurrentSide();
  
  if (state === 'pet_turn') {
    // Execute pet attack
    console.log(`Pet turn for ${side} side`);
  } else if (state === 'player_turn' || state === 'opponent_turn') {
    // Execute bruto attack
    console.log(`Bruto turn for ${side}`);
  }
  
  stateMachine.nextTurn();
}
```

## Combat Action Log Format

```typescript
// Bruto attack action (existing)
{
  turn: 1,
  attacker: 'player',
  action: 'attack',
  damage: 15,
  hpRemaining: { player: 100, opponent: 85 }
}

// Pet attack action (Story 7.3)
{
  turn: 2,
  attacker: 'pet',
  action: 'attack',
  damage: 5,
  hpRemaining: { player: 100, opponent: 80 },
  petData: {
    petType: 'Perro',
    petSlot: 'A',
    ownerSide: 'player',
    targetSide: 'opponent'
  }
}

// Oso disarm action (Story 7.3)
{
  turn: 5,
  attacker: 'pet',
  action: 'disarm',
  damage: 22,
  hpRemaining: { player: 75, opponent: 53 },
  petData: {
    petType: 'Oso',
    ownerSide: 'player',
    targetSide: 'opponent',
    disarmSuccess: true,
    weaponRemoved: 'Espada'
  }
}

// Pet defeated action (Story 7.3)
{
  turn: 8,
  attacker: 'opponent',
  action: 'pet_defeat',
  damage: 14,
  hpRemaining: { player: 75, opponent: 53 },
  petData: {
    petType: 'Perro',
    petSlot: 'A',
    ownerSide: 'player',
    petHpRemaining: 0
  }
}
```

## Pet Damage Tiers (Story 7.3)

Based on `docs/stast.md`:

| Pet     | Damage Tier | Min | Max | Avg |
|---------|-------------|-----|-----|-----|
| Perro   | Bajo (Low)  | 3   | 7   | 5   |
| Pantera | Medio (Med) | 8   | 15  | 11.5|
| Oso     | Alto (High) | 18  | 30  | 24  |

**Critical Hit:** 1.5x damage multiplier (based on pet's multi-hit chance)

## Special Abilities (Story 7.3)

### Oso Disarm
- **Chance:** 15% on successful hit
- **Effect:** Removes opponent's weapon, reducing damage output
- **Exclusive:** Only Oso has this ability
- **Conditions:** Only triggers when target has weapon equipped

## Database Integration

### Schema

```sql
-- Migration 007: Pets System
CREATE TABLE IF NOT EXISTS bruto_pets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bruto_id INTEGER NOT NULL,
  pet_type TEXT NOT NULL,
  pet_slot TEXT,              -- 'A', 'B', 'C' for Perros, NULL for others
  acquired_at TEXT NOT NULL,
  acquired_level INTEGER NOT NULL,
  FOREIGN KEY (bruto_id) REFERENCES brutos (id) ON DELETE CASCADE,
  UNIQUE (bruto_id, pet_type, pet_slot)
);
```

### Repository Usage

```typescript
import { DatabaseManager } from './database/DatabaseManager';
import { PetRepository } from './database/repositories/PetRepository';

const db = DatabaseManager.getInstance();
const petRepo = new PetRepository(db);

// Get bruto's pets
const result = await petRepo.getBrutoPets(brutoId);
if (result.success) {
  const pets = result.data;
  // Use pets for stat calculations
}

// Add new pet
const addResult = await petRepo.addPetToBruto({
  brutoId: 1,
  petType: PetType.PERRO,
  petSlot: 'A',
  acquiredAt: new Date(),
  acquiredLevel: 5
});
```

## Pet Stat Reference

### Perro
- HP: +14
- Damage: Low (3-7)
- Agility: +5
- Speed: +3
- Multi-hit: +10%
- Evasion: 0%
- Initiative: -10
- Stackable: Yes (max 3, slots A/B/C)
- Base Resistance Cost: 2

### Pantera
- HP: +26
- Damage: Medium (8-15)
- Agility: +16
- Speed: +24
- Multi-hit: +60%
- Evasion: +5%
- Initiative: +15
- Stackable: No
- Exclusive: Cannot coexist with Oso
- Base Resistance Cost: 6

### Oso
- HP: +110
- Damage: High (18-30)
- Agility: 0
- Speed: -12
- Multi-hit: -20%
- Evasion: 0%
- Initiative: -25
- Stackable: No
- Exclusive: Cannot coexist with Pantera
- Special: Can disarm opponent (15% chance)
- Base Resistance Cost: 8

## Resistance Cost Modifiers

| Pet     | Base | +Vitalidad | +Inmortal | +Both |
|---------|------|------------|-----------|-------|
| Perro   | 2    | 3          | 7         | 8     |
| Pantera | 6    | 9          | 15        | 22    |
| Oso     | 8    | 12         | 28        | 42    |

## Testing

All modules have comprehensive unit tests:
- `PetCatalog.test.ts` - 15 tests
- `PetCostCalculator.test.ts` - 31 tests  
- `PetStackingValidator.test.ts` - 25 tests
- `PetStatsService.test.ts` - 40+ tests
- `PetCombatStats.test.ts` - 15+ tests
- `PetCombatService.test.ts` - 30+ tests (Story 7.3)

**Total:** 156+ tests across Epic 7 Stories 7.1-7.3

Run tests:
```bash
npm test pets
```

## Next Steps (Future Stories)

- **Story 7.4**: Pet Stacking Rules UI
- **Story 7.5**: Resistance Cost System UI
- **Story 7.6**: Pets UI in Casillero
- **Story 7.7**: Pet Acquisition Logic
- **Story 7.8**: Pets Combat Integration (Full battle flow)

## References

- Pet stats specification: `docs/stast.md`
- Story 7.1: `docs/stories/backlog/7-1-pets-database-and-data-model.md`
- Story 7.2: `docs/stories/backlog/7-2-pet-stats-system.md`
- Story 7.3: `docs/stories/backlog/7-3-pet-combat-ai.md`
````

### Schema

```sql
-- Migration 007: Pets System
CREATE TABLE IF NOT EXISTS bruto_pets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bruto_id INTEGER NOT NULL,
  pet_type TEXT NOT NULL,
  pet_slot TEXT,              -- 'A', 'B', 'C' for Perros, NULL for others
  acquired_at TEXT NOT NULL,
  acquired_level INTEGER NOT NULL,
  FOREIGN KEY (bruto_id) REFERENCES brutos (id) ON DELETE CASCADE,
  UNIQUE (bruto_id, pet_type, pet_slot)
);
```

### Repository Usage

```typescript
import { DatabaseManager } from './database/DatabaseManager';
import { PetRepository } from './database/repositories/PetRepository';

const db = DatabaseManager.getInstance();
const petRepo = new PetRepository(db);

// Get bruto's pets
const result = await petRepo.getBrutoPets(brutoId);
if (result.success) {
  const pets = result.data;
  // Use pets for stat calculations
}

// Add new pet
const addResult = await petRepo.addPetToBruto({
  brutoId: 1,
  petType: PetType.PERRO,
  petSlot: 'A',
  acquiredAt: new Date(),
  acquiredLevel: 5
});
```

## Pet Stat Reference

### Perro
- HP: +14
- Agility: +5
- Speed: +3
- Multi-hit: +10%
- Evasion: 0%
- Initiative: -10
- Stackable: Yes (max 3, slots A/B/C)
- Base Resistance Cost: 2

### Pantera
- HP: +26
- Agility: +16
- Speed: +24
- Multi-hit: +60%
- Evasion: +5%
- Initiative: +15
- Stackable: No
- Exclusive: Cannot coexist with Oso
- Base Resistance Cost: 6

### Oso
- HP: +110
- Agility: 0
- Speed: -12
- Multi-hit: -20%
- Evasion: 0%
- Initiative: -25
- Stackable: No
- Exclusive: Cannot coexist with Pantera
- Special: Can disarm opponent
- Base Resistance Cost: 8

## Resistance Cost Modifiers

| Pet     | Base | +Vitalidad | +Inmortal | +Both |
|---------|------|------------|-----------|-------|
| Perro   | 2    | 3          | 7         | 8     |
| Pantera | 6    | 9          | 15        | 22    |
| Oso     | 8    | 12         | 28        | 42    |

## Testing

All modules have comprehensive unit tests:
- `PetCatalog.test.ts` - 15 tests
- `PetCostCalculator.test.ts` - 31 tests  
- `PetStackingValidator.test.ts` - 25 tests
- `PetStatsService.test.ts` - 40+ tests
- `PetCombatStats.test.ts` - 15+ tests

Run tests:
```bash
npm test pets
```

## Next Steps (Future Stories)

- **Story 7.3**: Pet Combat AI - Pet turn logic in combat
- **Story 7.4**: Pet Acquisition UI - UI for acquiring pets
- **Story 7.6**: Casillero Pet Display - Show pets in bruto details
- **Story 7.8**: Combat Integration - Full pet combat behavior

## References

- Pet stats specification: `docs/stast.md`
- Story 7.1: `docs/stories/backlog/7-1-pets-database-and-data-model.md`
- Story 7.2: `docs/stories/backlog/7-2-pet-stats-system.md`
