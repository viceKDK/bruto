# Story 7.6: Pets UI in Casillero

Status: backlog

## Story
As a player,
I want to see my bruto's pets in the Casillero with icons and stats,
so that I understand my pet roster and plan future acquisitions.

## Requirements Context Summary

### Requirement Sources
- Story 3.2 — Casillero UI layout
- Story 7.1 — Pet data and stats
- `docs/ui-analisis-original.md` — Original pet display area

### Key Requirements
- Display pet section in Casillero showing owned pets
- Show pet icons/sprites for Perro (A/B/C), Pantera, Oso
- Display pet stats (HP, Agility, Speed, multi-hit, evasion)
- Show resistance cost per pet
- Indicate available pet slots vs occupied

## Acceptance Criteria

1. Pet roster area displays all owned pets with icons
2. Each pet shows mini stat panel (HP, Agility, special abilities)
3. Empty pet slots shown with placeholder icons
4. Hover tooltips show full pet details and resistance cost
5. Visual distinction for Perro slots (A, B, C)

## Tasks / Subtasks

- [ ] Task 1: Design pet roster UI component for Casillero
- [ ] Task 2: Load pet sprites/icons
- [ ] Task 3: Display owned pets from PetRepository
- [ ] Task 4: Show empty slots with acquisition prompts
- [ ] Task 5: Create pet details tooltip
- [ ] Task 6: Test with various pet combinations

## References
- Casillero layout from Story 3.2
- Pet stats from Story 7.1
- UI mockups in docs/ui-analisis-original.md

## Change Log
- 2025-10-31: Story created for Epic 7 pets UI in Casillero

## Dev Agent Record
### Agent Model Used
{{agent_model_name_version}}

## Senior Developer Review (AI)
**Reviewer:** {{reviewer_name}}  
**Date:** {{review_date}}  
**Outcome:** {{Approved | Changes Requested | Rejected}}
