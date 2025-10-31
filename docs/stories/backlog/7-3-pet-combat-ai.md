# Story 7.3: Pet Combat AI

Status: backlog

## Story
As a player,
I want pets to take combat turns and attack enemies with their own stats and abilities,
so that battles feel more dynamic with multiple combatants.

## Requirements Context Summary

### Requirement Sources
- `docs/stast.md` — Pet initiative values (Perro: -10, Pantera: -60, Oso: -360)
- Story 4.1 — Combat turn scheduler
- Story 7.1 — Pet stats and abilities

### Key Requirements
- Pets take turns in combat based on initiative value
- Pets attack with own damage/agility stats
- Oso can disarm opponents (special ability)
- Pets can be targeted and defeated
- Pet actions logged in combat feed

## Acceptance Criteria

1. Pets scheduled in turn order based on negative initiative (later turns)
2. Pet attacks use pet's own agility for hit chance, damage tier for damage
3. Oso disarm ability has documented chance to remove opponent weapon
4. Pets can receive damage and be knocked out (removed from combat)
5. Combat log shows pet actions distinctly ("Perro A attacks!")

## Tasks / Subtasks

- [ ] Task 1: Extend turn scheduler for pet combatants
- [ ] Task 2: Implement pet attack action
- [ ] Task 3: Implement Oso disarm special ability
- [ ] Task 4: Handle pet defeat mechanics
- [ ] Task 5: Pet combat animations and UI
- [ ] Task 6: Test multi-pet combat scenarios

## References
- Turn scheduler from Story 4.1
- Pet stats from Story 7.1
- Initiative formulas in docs/stast.md

## Change Log
- 2025-10-31: Story created for Epic 7 pet combat AI

## Dev Agent Record
### Agent Model Used
{{agent_model_name_version}}

## Senior Developer Review (AI)
**Reviewer:** {{reviewer_name}}  
**Date:** {{review_date}}  
**Outcome:** {{Approved | Changes Requested | Rejected}}
