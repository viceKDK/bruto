# Story 9.4: Level-Based Filtering

**Epic:** 9 - Matchmaking & Opponents  
**Priority:** HIGH  
**Status:** ✅ IMPLEMENTED  
**Estimated Effort:** 2 hours  
**Actual Effort:** 0 hours (Already implemented in Story 9.1)

---

## User Story

**As a** player selecting opponents  
**I want** to only see brutos at my exact level  
**So that** battles are fair and balanced

---

## Context

Matchmaking must ensure fairness by restricting opponents to the same level. This prevents unfair advantages and ensures skill-based competition.

**Dependencies:**
- Story 9.1: Matchmaking Pool (DONE)
- Database with bruto levels

---

## Acceptance Criteria

### AC #1: Exact Level Match ✅
**Given** I have a level 5 bruto  
**When** I search for opponents  
**Then** I only see level 5 opponents (no level 4 or 6)

**Implementation:**
```typescript
WHERE level = ?  // Exact match in SQL query
```

### AC #2: No Mixed Levels ✅
**Given** multiple brutos exist at different levels  
**When** matchmaking queries the database  
**Then** results contain only brutos at the specified level

**Validation:**
- Query uses `=` not `BETWEEN` or `>=`
- Level parameter is strictly enforced

### AC #3: Empty Pool Handling ✅
**Given** no brutos exist at my level  
**When** I search for opponents  
**Then** ghosts are generated at my exact level (Story 9.3)

**Fallback:**
```typescript
GhostGenerationService.generateGhostPool(brutoLevel, count, userId)
```

---

## Technical Implementation

### Database Query
```typescript
// src/services/MatchmakingService.ts
const query = `
  SELECT * FROM brutos 
  WHERE level = ?           -- AC #1: Exact level match
    AND user_id != ?        -- Exclude own brutos
  ORDER BY RANDOM()
`;

const result = await repo.queryMany(query, [brutoLevel, currentUserId]);
```

### Level Validation
```typescript
// Ensure level is integer
if (!Number.isInteger(brutoLevel) || brutoLevel < 1) {
  return err('Invalid level', ErrorCodes.INVALID_INPUT);
}
```

---

## Testing

### Unit Tests (MatchmakingService.test.ts)
```typescript
it('should query for opponents with exact same level', async () => {
  await MatchmakingService.findOpponents(5, 'user-current', 5);
  
  expect(mockRepo.queryMany).toHaveBeenCalledWith(
    expect.stringContaining('WHERE level = ?'),
    [5, 'user-current']  // Level 5 exactly
  );
});

it('should not return opponents from other levels', async () => {
  // Mock returns only level 5 brutos
  const result = await MatchmakingService.findOpponents(5, 'user-current');
  
  result.data.opponents.forEach(opponent => {
    expect(opponent.level).toBe(5);
  });
});
```

### Integration Test
```typescript
it('should enforce level filtering in real database', async () => {
  // Create brutos at levels 4, 5, 6
  await createBruto('bruto-level-4', 4);
  await createBruto('bruto-level-5a', 5);
  await createBruto('bruto-level-5b', 5);
  await createBruto('bruto-level-6', 6);
  
  const result = await MatchmakingService.findOpponents(5, 'current-user');
  
  expect(result.data.opponents).toHaveLength(2); // Only 5a and 5b
  expect(result.data.opponents.every(o => o.level === 5)).toBe(true);
});
```

---

## Definition of Done

- ✅ SQL query uses `WHERE level = ?` for exact matching
- ✅ No opponents from other levels returned
- ✅ Ghost generation respects target level
- ✅ Unit tests validate level filtering
- ✅ Integration tests confirm database filtering
- ✅ Code review approved

---

## Notes

- **Already implemented** as part of Story 9.1's matchmaking logic
- Level filtering is fundamental to fair matchmaking
- Works seamlessly with Story 9.3 ghost generation
- No additional code changes needed - documentation only

---

**Implemented in:** `src/services/MatchmakingService.ts` (lines 48-52)  
**Tests:** `src/services/MatchmakingService.test.ts`  
**Related Stories:** 9.1, 9.3
