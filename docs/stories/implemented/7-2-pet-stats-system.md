# Story 7.2: Pet Stats System

Status: backlog

## Story
As a developer,
I want pet stats to modify bruto's effective combat stats correctly,
so that pets provide meaningful combat advantages while respecting the resistance cost trade-off.

## Requirements Context Summary

### Requirement Sources
- Story 7.1 — Pet data model and catalog
- `docs/stast.md` — Pet stat contributions and resistance costs
- Story 4.2 — Combat stat calculations

### Key Requirements
- Add pet stats to bruto's effective combat stats (HP, Agility, Speed, multi-hit, evasion)
- Subtract resistance cost from bruto's resistance when pet acquired
- Resistance cost varies by Vitalidad/Inmortal skills owned
- Recalculate stats when pets added/removed
- Display pet contributions in stat breakdown

## Acceptance Criteria

1. Pet HP adds to bruto's total HP in combat (Perro +14, Pantera +26, Oso +110)
2. Pet agility/speed/evasion bonuses apply to combat calculations
3. Resistance reduced correctly on pet acquisition (base, Vitalidad, Inmortal, both)
4. Multi-hit chance modified by pets (Perro +10%, Pantera +60%, Oso -20%)
5. Stat UI shows pet contributions separately from base stats

## Tasks / Subtasks

- [ ] Task 1: Integrate pet stats into StatsCalculator
- [ ] Task 2: Implement resistance cost deduction
- [ ] Task 3: Support Vitalidad/Inmortal cost modifiers
- [ ] Task 4: Update combat stat calculations with pet bonuses
- [ ] Task 5: Display pet stat breakdown in UI
- [ ] Task 6: Unit tests for all pet stat scenarios

## References
- Pet stats from Story 7.1
- StatsCalculator from Story 4.2
- Resistance formulas in docs/stast.md

## Change Log
- 2025-10-31: Story created for Epic 7 pet stats system

## Dev Agent Record
### Agent Model Used
{{agent_model_name_version}}

## Senior Developer Review (AI)
**Reviewer:** {{reviewer_name}}  
**Date:** {{review_date}}  
**Outcome:** {{Approved | Changes Requested | Rejected}}
