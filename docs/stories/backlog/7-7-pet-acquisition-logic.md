# Story 7.7: Pet Acquisition Logic

Status: backlog

## Story
As a player,
I want to acquire pets through victory rewards with proper odds and validation,
so that my bruto can gain combat companions.

## Requirements Context Summary

### Requirement Sources
- Story 7.4 — Pet stacking validation rules
- Story 7.5 — Resistance cost system
- Story 6.3 — Skill acquisition pattern (similar flow)
- Epic 10 — Victory rewards system

### Key Requirements
- Pet rewards granted after battle victories
- Odds-based selection from available pet types
- Validate stacking rules before granting pet
- Apply resistance cost immediately on acquisition
- Persist pet ownership to database
- Show acquisition UI with pet details and stat changes

## Acceptance Criteria

1. Victory reward system can award pets with documented odds
2. Stacking validator prevents invalid pet acquisitions
3. Resistance cost applied and HP recalculated on acquisition
4. Pet persisted to bruto_pets table with metadata
5. Acquisition UI shows new pet and stat changes (HP reduction from resistance)

## Tasks / Subtasks

- [ ] Task 1: Create PetRewardService.selectRandomPet(bruto)
- [ ] Task 2: Filter available pets via PetStackValidator
- [ ] Task 3: Apply resistance cost via ResistanceCostCalculator
- [ ] Task 4: Persist via PetRepository.addPetToBruto()
- [ ] Task 5: Create pet acquisition modal UI
- [ ] Task 6: Integration test full acquisition flow

## References
- Stacking rules from Story 7.4
- Resistance costs from Story 7.5
- Acquisition pattern from Story 6.3

## Change Log
- 2025-10-31: Story created for Epic 7 pet acquisition logic

## Dev Agent Record
### Agent Model Used
{{agent_model_name_version}}

## Senior Developer Review (AI)
**Reviewer:** {{reviewer_name}}  
**Date:** {{review_date}}  
**Outcome:** {{Approved | Changes Requested | Rejected}}
