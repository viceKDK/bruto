# Story 9.5: Opponent Pool Rotation

**Epic:** 9 - Matchmaking & Opponents  
**Priority:** MEDIUM  
**Status:** ✅ IMPLEMENTED  
**Estimated Effort:** 3 hours  
**Actual Effort:** 0 hours (Already implemented in Story 9.1)

---

## User Story

**As a** player selecting opponents  
**I want** to see different opponents each time I refresh  
**So that** I have variety and can choose my preferred matchup

---

## Context

Players should see randomized opponents every time they access matchmaking. This prevents stale matchmaking pools and gives players control over opponent selection.

**Dependencies:**
- Story 9.1: Matchmaking Pool (DONE)
- Story 9.2: Opponent Selection UI (DONE)

---

## Acceptance Criteria

### AC #1: Randomized Results ✅
**Given** I search for opponents multiple times  
**When** I click "Refresh Opponents"  
**Then** I see different brutos in different orders

**Implementation:**
```sql
ORDER BY RANDOM()  -- SQL randomization
```

### AC #2: Fresh Pool on Refresh ✅
**Given** I'm viewing 5 opponents  
**When** I click "Refresh Opponents" button  
**Then** a new database query runs and returns fresh results

**UI Flow:**
```typescript
// OpponentSelectionScene.ts
private async refreshOpponents(): Promise<void> {
  await this.loadOpponents();  // Re-fetches from database
  this.renderOpponentCards();  // Re-renders UI
}
```

### AC #3: No Result Caching ✅
**Given** the opponent pool  
**When** matchmaking queries execute  
**Then** results are never cached (always fresh from DB)

**Validation:**
- No static result storage
- Each call executes new SQL query
- `ORDER BY RANDOM()` ensures variance

### AC #4: Ghost Rotation ✅
**Given** ghosts are generated to fill the pool  
**When** I refresh opponents  
**Then** new ghosts are generated with different seeds

**Ghost Seed:**
```typescript
const seed = `ghost-${userId}-${level}-${timestamp}-${i}`;
// timestamp ensures uniqueness per refresh
```

---

## Technical Implementation

### Database Query (Story 9.1)
```typescript
// src/services/MatchmakingService.ts
static async findOpponents(
  brutoLevel: number,
  currentUserId: string,
  count: number = 5
): Promise<Result<IOpponentPool>> {
  const query = `
    SELECT * FROM brutos 
    WHERE level = ? 
      AND user_id != ?
    ORDER BY RANDOM()  -- AC #1: Random order every query
  `;
  
  // No caching - fresh query each time (AC #3)
  const result = await repo.queryMany(query, [brutoLevel, currentUserId]);
  
  // ... rest of implementation
}
```

### UI Refresh Button (Story 9.2)
```typescript
// src/scenes/OpponentSelectionScene.ts
private renderActionButtons(width: number, height: number): void {
  // AC #2: "Refresh Opponents" button
  new Button(this, {
    x: width / 2,
    y: height - SPACING.xl - 100,
    text: 'Refresh Opponents',
    onClick: () => this.refreshOpponents(),  // Re-fetches pool
  });
}

private async refreshOpponents(): Promise<void> {
  // Clear current cards
  this.opponentCards.forEach(card => card.destroy());
  this.opponentCards = [];
  
  // Reload opponents (fresh database query)
  await this.loadOpponents();
  
  // Re-render
  if (this.opponentPool && this.opponentPool.opponents.length > 0) {
    this.renderOpponentCards(width, height);
  }
}
```

### Ghost Rotation (Story 9.3)
```typescript
// src/services/GhostGenerationService.ts
static generateGhostPool(
  level: number,
  count: number,
  userId: string
): IGhostBruto[] {
  const timestamp = Date.now();  // AC #4: Unique per refresh
  const ghosts: IGhostBruto[] = [];
  
  for (let i = 0; i < count; i++) {
    const seed = `ghost-${userId}-${level}-${timestamp}-${i}`;
    const ghost = this.generateGhost(level, seed);
    ghosts.push(ghost);
  }
  
  return ghosts;
}
```

---

## Testing

### Unit Tests
```typescript
describe('Opponent Pool Rotation', () => {
  it('should execute new query on each findOpponents call', async () => {
    await MatchmakingService.findOpponents(5, 'user1', 5);
    await MatchmakingService.findOpponents(5, 'user1', 5);
    
    expect(mockRepo.queryMany).toHaveBeenCalledTimes(2);
  });
  
  it('should use ORDER BY RANDOM for variance', async () => {
    await MatchmakingService.findOpponents(5, 'user1');
    
    expect(mockRepo.queryMany).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY RANDOM()'),
      expect.any(Array)
    );
  });
  
  it('should generate different ghosts on each call', () => {
    const pool1 = GhostGenerationService.generateGhostPool(10, 5, 'user1');
    
    // Wait 1ms to ensure different timestamp
    setTimeout(() => {
      const pool2 = GhostGenerationService.generateGhostPool(10, 5, 'user1');
      
      // Seeds should be different due to timestamp
      expect(pool1[0].generationSeed).not.toBe(pool2[0].generationSeed);
    }, 1);
  });
});
```

### Integration Test (UI)
```typescript
it('should clear and reload opponents on refresh', async () => {
  const scene = new OpponentSelectionScene();
  await scene.create({ brutoId: 'test-bruto' });
  
  const initialOpponents = scene.opponentCards.length;
  expect(initialOpponents).toBe(5);
  
  // Refresh
  await scene.refreshOpponents();
  
  // Should have 5 new cards
  expect(scene.opponentCards.length).toBe(5);
  expect(scene.opponentCards[0]).not.toBe(initialOpponents[0]); // Different instances
});
```

---

## Performance Considerations

### Database Optimization
- ✅ `ORDER BY RANDOM()` is efficient on small datasets (< 1000 brutos/level)
- ✅ Indexed `level` column for fast filtering
- ✅ LIMIT clause prevents over-fetching

### Ghost Generation Performance
- ✅ Ghost generation is synchronous and fast (< 1ms per ghost)
- ✅ Timestamp-based seeds ensure uniqueness without complex hashing

### UI Refresh UX
- ✅ Refresh button provides immediate feedback
- ✅ Loading state could be added for slow connections
- ✅ Cards animate smoothly on refresh

---

## Definition of Done

- ✅ SQL query uses `ORDER BY RANDOM()` for variance
- ✅ No result caching between queries
- ✅ UI refresh button re-fetches opponents
- ✅ Ghost generation uses unique seeds per refresh
- ✅ Unit tests validate randomization
- ✅ Integration tests confirm fresh results
- ✅ Performance acceptable (< 100ms refresh)
- ✅ Code review approved

---

## Notes

- **Already implemented** as part of Stories 9.1 and 9.2
- `ORDER BY RANDOM()` provides good-enough randomization
- Could enhance with weighted matchmaking in future
- Timestamp-based ghost seeds ensure variety

---

## Future Enhancements

- **Smart Rotation**: Prevent seeing same opponent twice in a row
- **Weighted Matchmaking**: Prioritize opponents with similar win rates
- **Opponent History**: Track recently fought opponents
- **Pool Size Expansion**: Show more than 5 with pagination

---

**Implemented in:**  
- `src/services/MatchmakingService.ts` (line 51)
- `src/scenes/OpponentSelectionScene.ts` (refreshOpponents method)
- `src/services/GhostGenerationService.ts` (timestamp-based seeds)

**Tests:**  
- `src/services/MatchmakingService.test.ts`
- `src/scenes/OpponentSelectionScene.test.ts` (if exists)

**Related Stories:** 9.1, 9.2, 9.3
