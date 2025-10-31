# Story 7.8: Pets Combat Integration

Status: backlog

## Story
As a player,
I want pets to participate in combat with correct timing, actions, and visual representation,
so that battles showcase my full bruto+pets team.

## Requirements Context Summary

### Requirement Sources
- Story 7.3 — Pet combat AI
- Story 4.3 — Combat presentation layer
- Story 7.2 — Pet stats system
- `docs/stast.md` — Pet combat mechanics

### Key Requirements
- Pets appear in combat scene with bruto
- Pets take turns based on initiative
- Pet attacks animated with sprites
- Oso disarm ability triggers visually
- Pet defeat shows knockout animation
- Combat log includes pet actions

## Acceptance Criteria

1. All owned pets appear in combat scene positioned near bruto
2. Pet sprites animate during their turns (attack, hit, idle)
3. Turn order respects pet initiative (Perro earlier, Oso much later)
4. Oso disarm shows weapon flying away animation
5. Defeated pets show knockout and become inactive rest of battle

## Tasks / Subtasks

- [ ] Task 1: Add pet sprites to combat scene
- [ ] Task 2: Position pets relative to bruto (formation)
- [ ] Task 3: Animate pet attack actions
- [ ] Task 4: Implement Oso disarm visual effect
- [ ] Task 5: Pet defeat/knockout animation
- [ ] Task 6: Combat log pet action formatting
- [ ] Task 7: Test battles with 0, 1, 2, 3, 4 pets

## References
- Combat scene from Story 4.3
- Pet AI from Story 7.3
- Pet stats from Story 7.1 and 7.2

## Change Log
- 2025-10-31: Story created for Epic 7 pets combat integration

## Dev Agent Record
### Agent Model Used
{{agent_model_name_version}}

## Senior Developer Review (AI)
**Reviewer:** {{reviewer_name}}  
**Date:** {{review_date}}  
**Outcome:** {{Approved | Changes Requested | Rejected}}
