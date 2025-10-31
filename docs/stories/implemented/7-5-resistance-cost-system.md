# Story 7.5: Resistance Cost System

Status: backlog

## Story
As a developer,
I want resistance costs applied correctly when pets acquired,
so that pet power balanced by HP reduction trade-off.

## Requirements Context Summary

### Requirement Sources
- `docs/stast.md` — Resistance costs with Vitalidad/Inmortal modifiers
- Story 7.1 — Pet resistance cost data
- Story 7.2 — Pet stats integration

### Key Requirements
- Deduct resistance when pet acquired (Perro: -4 base, Pantera: -6, Oso: -8)
- Apply Vitalidad modifier (Perro: -3, Pantera: -9, Oso: -12)
- Apply Inmortal modifier (Perro: -7, Pantera: -15, Oso: -28)
- Apply both modifiers (Perro: -10, Pantera: -22, Oso: -42)
- Resistance affects HP (each point = +6 HP)
- Prevent resistance from going negative

## Acceptance Criteria

1. Pet acquisition reduces resistance by documented base amount
2. Vitalidad skill modifies resistance cost per pet type
3. Inmortal skill modifies resistance cost per pet type
4. Both skills stack for maximum resistance cost
5. HP recalculated after resistance change (Resistance × 6 + base HP)

## Tasks / Subtasks

- [ ] Task 1: Create ResistanceCostCalculator.calculateCost(pet, skills)
- [ ] Task 2: Query bruto's Vitalidad/Inmortal skills
- [ ] Task 3: Select correct cost from pet.resistanceCost object
- [ ] Task 4: Apply resistance deduction to bruto stats
- [ ] Task 5: Recalculate HP via StatsCalculator
- [ ] Task 6: Test all 12 cost scenarios (3 pets × 4 skill combos)

## References
- Resistance cost table in docs/stast.md lines 63-70, 145-191
- Pet costs from Story 7.1
- HP calculation formula: HP = (Resistance × 6) + base HP

## Change Log
- 2025-10-31: Story created for Epic 7 resistance cost system

## Dev Agent Record
### Agent Model Used
{{agent_model_name_version}}

## Senior Developer Review (AI)
**Reviewer:** {{reviewer_name}}  
**Date:** {{review_date}}  
**Outcome:** {{Approved | Changes Requested | Rejected}}
