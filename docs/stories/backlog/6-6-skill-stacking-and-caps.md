# Story 6.6: Skill Stacking and Caps

Status: backlog

## Story
As a developer,
I want skill stacking rules and stat caps enforced correctly,
so that multiple skills combine fairly without breaking game balance.

## Requirements Context Summary

### Requirement Sources
- `docs/habilidades-catalogo.md` — Stacking notes: armor caps at 75%, multiple armor passives stack
- Story 6.2 — SkillEffectEngine design
- Story 6.4 — Passive skill integration

### Key Requirements
- Enforce armor cap at 75% total (equipment + skills)
- Enforce evasion caps (documented maximum)
- Allow stackable effects to sum (multiple armor bonuses)
- Prevent duplicate unique skills
- Validate skill conflicts via mutuallyExclusiveWith

## Acceptance Criteria

1. Multiple armor skills stack additively (Toughened Skin 10% + Esqueleto de Plomo 15% = 25%)
2. Total armor capped at 75% regardless of skill count
3. Unique skills cannot be acquired twice (Fuerza Hércules once only)
4. Mutually exclusive skills prevented (documented conflicts)
5. Stat caps enforced and logged for debugging

## Tasks / Subtasks

- [ ] Task 1: Implement additive stacking for armor/resistance
- [ ] Task 2: Implement cap enforcement (75% armor, etc.)
- [ ] Task 3: Validate unique skill ownership rules
- [ ] Task 4: Enforce mutual exclusion rules
- [ ] Task 5: Add cap warning logs for development
- [ ] Task 6: Unit tests for all stacking scenarios

## References
- Stacking rules in docs/habilidades-catalogo.md
- SkillEffectEngine from Story 6.2

## Change Log
- 2025-10-31: Story created for Epic 6 skill stacking rules

## Dev Agent Record
### Agent Model Used
{{agent_model_name_version}}

## Senior Developer Review (AI)
**Reviewer:** {{reviewer_name}}  
**Date:** {{review_date}}  
**Outcome:** {{Approved | Changes Requested | Rejected}}
