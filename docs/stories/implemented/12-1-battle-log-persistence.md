  # Story 12.1: Battle Log Persistence

**Epic:** 12 - Battle Replay System  
**Story Points:** 3  
**Priority:** Medium
**Status:** Done

---

## User Story

**As a player,**  
I want my last 8 battles automatically saved,  
So that I can review them later and analyze my bruto's performance.

---

## Acceptance Criteria

1. **Battle Logging:**
   - Save complete battle data after each fight
   - Store: combatants, all combat events, final result, timestamp
   - Use deterministic RNG seed for replay capability

2. **Storage Limit:**
   - Keep **last 8 battles per bruto**
   - Auto-delete oldest battle when 9th is added
   - Count applies per bruto, not account-wide

3. **Battle Data Structure:**
   - Bruto snapshots (stats, equipment, skills at time of battle)
   - Complete action log (attacks, dodges, crits, damage)
   - RNG seed used for combat
   - Battle outcome (win/loss, final HP)
   - Timestamp of battle

4. **Database Schema:**
   - battles table with JSON/TEXT field for event log
   - Foreign keys to bruto_id
   - Index on (bruto_id, created_at) for query performance

5. **Cleanup Logic:**
   - Trigger cleanup after each battle save
   - Delete battles older than 8th most recent
   - Maintain referential integrity

---

## Technical Implementation

### Database Schema

```sql
-- Already exists from Story 1.2, verify structure:
CREATE TABLE IF NOT EXISTS battles (
  id INTEGER PRIMARY KEY,
  bruto1_id INTEGER NOT NULL,
  bruto2_id INTEGER NOT NULL,
  winner_id INTEGER NOT NULL,
  turn_count INTEGER NOT NULL,
  battle_log TEXT NOT NULL, -- JSON of combat events
  rng_seed INTEGER NOT NULL,
  bruto1_snapshot TEXT NOT NULL, -- JSON of bruto state
  bruto2_snapshot TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bruto1_id) REFERENCES brutos(id),
  FOREIGN KEY (bruto2_id) REFERENCES brutos(id),
  FOREIGN KEY (winner_id) REFERENCES brutos(id)
);

CREATE INDEX idx_battles_bruto1 ON battles(bruto1_id, created_at DESC);
```

### Battle Logger Service

```typescript
// services/BattleLoggerService.ts
interface IBattleLog {
  id?: number;
  bruto1: IBrutoSnapshot;
  bruto2: IBrutoSnapshot;
  winnerId: number;
  turnCount: number;
  events: ICombatEvent[];
  rngSeed: number;
  timestamp: Date;
}

export class BattleLoggerService {
  static async saveBattle(battleLog: IBattleLog): Promise<void> {
    // Save to database
    // Trigger cleanup
  }

  static async cleanupOldBattles(brutoId: number): Promise<void> {
    // Keep only last 8 battles for this bruto
    const battles = await this.getBattlesForBruto(brutoId);
    if (battles.length > 8) {
      const toDelete = battles.slice(8);
      // Delete excess battles
    }
  }

  static async getBattlesForBruto(
    brutoId: number,
    limit: number = 8
  ): Promise<IBattleLog[]> {
    // Query battles where bruto1_id = brutoId
    // Order by created_at DESC
    // Limit to 8
  }
}
```

---

## Prerequisites

- ✅ Story 4.3: Combat Presentation Layer (battles produce events)
- ✅ Story 4.1: RNG Framework (seeded RNG exists)
- ✅ Story 1.2: Database Layer (battles table exists)

---

## Definition of Done

- [x] Battle data saved after each fight
- [x] RNG seed stored for replay
- [x] Last 8 battles kept per bruto
- [x] Older battles auto-deleted
- [x] Battle log includes all combat events
- [x] Bruto snapshots capture state at battle time
- [x] Query performance acceptable (< 100ms)
- [x] Unit tests for cleanup logic (18 tests)

---

## Notes

- This enables Story 12.2 (Replay Viewer)
- Battle log must be complete enough to recreate fight
- Consider compressing battle_log if size becomes issue
- Snapshots prevent issues with stat changes affecting old replays

---

## Implementation Summary

### Files Created
- `src/services/BattleLoggerService.ts` - Battle logging with automatic cleanup
- `src/services/BattleLoggerService.test.ts` - Comprehensive test suite (18 tests)
- `src/database/migrations/005_battle_snapshots.sql` - Database schema updates

### Files Modified
- `src/database/DatabaseManager.ts` - Registered new migration

### Features Implemented
- **Battle Snapshots**: Captures complete bruto state at battle time
- **Combat Event Logging**: Stores all combat events for replay
- **Automatic Cleanup**: Keeps only last 8 battles per bruto
- **RNG Seed Storage**: Enables deterministic replay
- **Efficient Queries**: Indexed queries for fast battle history retrieval

### Test Coverage
All acceptance criteria validated:
- Battle save with snapshots
- Automatic cleanup beyond 8 battles
- Battle retrieval by bruto ID
- Battle count tracking
- Error handling
- Integration flow (save 10, keep 8)
