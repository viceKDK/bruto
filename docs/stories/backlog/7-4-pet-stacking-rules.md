# Story 7.4: Pet Stacking Rules

Status: backlog

## Story
As a developer,
I want pet stacking rules enforced (max 3 Perros, Pantera XOR Oso),
so that pet acquisition follows documented game balance.

## Requirements Context Summary

### Requirement Sources
- `docs/stast.md` — Stacking rules: 3 Perros + (Pantera OR Oso)
- Story 7.1 — Pet data model with mutual exclusions
- Story 7.7 — Pet acquisition logic (future dependency)

### Key Requirements
- Allow up to 3 Perros (slots A, B, C)
- Prevent Pantera + Oso on same bruto
- Allow 3 Perros + Pantera OR 3 Perros + Oso
- Validate stacking on acquisition attempt
- Show available pet slots in UI

## Acceptance Criteria

1. Bruto can own max 3 Perros in slots A, B, C
2. Acquiring Pantera blocks Oso acquisition and vice versa
3. Bruto can have 3 Perros + Pantera simultaneously
4. Bruto can have 3 Perros + Oso simultaneously
5. Acquisition attempt of conflicting pet shows error message

## Tasks / Subtasks

- [ ] Task 1: Implement PetStackValidator.canAddPet(bruto, petType)
- [ ] Task 2: Check current pet count vs max allowed
- [ ] Task 3: Check mutual exclusions (Pantera <-> Oso)
- [ ] Task 4: Assign Perro slot (A, B, or C) on acquisition
- [ ] Task 5: UI shows available/locked pet slots
- [ ] Task 6: Test all valid/invalid stacking combinations

## References
- Stacking rules in docs/stast.md lines 81-83, 95-96, 108-109
- Pet catalog from Story 7.1

## Change Log
- 2025-10-31: Story created for Epic 7 pet stacking rules

## Dev Agent Record
### Agent Model Used
{{agent_model_name_version}}

## Senior Developer Review (AI)
**Reviewer:** {{reviewer_name}}  
**Date:** {{review_date}}  
**Outcome:** {{Approved | Changes Requested | Rejected}}
