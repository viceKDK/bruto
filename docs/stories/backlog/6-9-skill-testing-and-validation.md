# Story 6.9: Skill Testing and Validation

Status: backlog

## Story
As a developer,
I want comprehensive tests validating all ~40 skills function correctly,
so that the skills system is reliable and matches documented mechanics.

## Requirements Context Summary

### Requirement Sources
- `docs/habilidades-catalogo.md` — Complete skill catalog with mechanics
- Stories 6.1-6.8 — All skill system components
- `docs/GDD.md` — Quality standards for game systems

### Key Requirements
- Unit tests for each skill effect type
- Integration tests for skill acquisition → effect → combat
- Validation tests comparing actual behavior to documented mechanics
- Edge case tests (stacking, caps, conflicts)
- Performance tests for combat with many skills

## Acceptance Criteria

1. Unit test coverage >90% for skill system code
2. Integration tests validate complete skill lifecycle (acquire → display → combat → level-up)
3. Each documented skill has at least one validation test
4. Edge cases tested (max skills, conflicting skills, cap overflows)
5. Performance tests confirm <16ms combat turn time with max skills

## Tasks / Subtasks

- [ ] Task 1: Unit tests for SkillCatalog
- [ ] Task 2: Unit tests for SkillEffectEngine
- [ ] Task 3: Unit tests for SkillRepository
- [ ] Task 4: Integration test: full skill lifecycle
- [ ] Task 5: Validation tests for all 40 skills
- [ ] Task 6: Edge case tests (stacking, caps, conflicts)
- [ ] Task 7: Performance benchmarks
- [ ] Task 8: Document test results vs skill catalog

## Test Categories

### Unit Tests
- Skill catalog loading
- Effect type parsing
- Odds-based selection
- Stacking calculations
- Cap enforcement

### Integration Tests
- Acquire skill → stats update → DB persist
- Passive skill → combat damage → correct reduction
- Active ability → trigger → uses decrement
- Level-up → skill bonus → enhanced gain

### Validation Tests (per skill)
- Fuerza Hércules: immediate +3 STR, +50%, level-up +3
- Toughened Skin: +10% armor in combat
- Fuerza Bruta: double damage, uses scale with STR
- Poción Trágica: heal 25-50%, cure poison
- (36 more skills...)

### Edge Cases
- 10 armor skills → capped at 75%
- Fuerza Hércules + Velocidad Mercurio together
- Skill acquired at level 1 vs level 50
- Battle with 0 skills vs 40 skills

## References
- All prior skill stories (6.1-6.8)
- Complete skill catalog in docs/habilidades-catalogo.md

## Change Log
- 2025-10-31: Story created for Epic 6 skill testing validation

## Dev Agent Record
### Agent Model Used
{{agent_model_name_version}}

## Senior Developer Review (AI)
**Reviewer:** {{reviewer_name}}  
**Date:** {{review_date}}  
**Outcome:** {{Approved | Changes Requested | Rejected}}
