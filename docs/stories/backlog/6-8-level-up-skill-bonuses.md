# Story 6.8: Level-Up Skill Bonuses

Status: backlog

## Story
As a player,
I want skills like Fuerza Hércules to enhance my level-up stat gains,
so that skill acquisition feels impactful on long-term progression.

## Requirements Context Summary

### Requirement Sources
- `docs/habilidades-catalogo.md` — Fuerza Hércules: +3 STR on level-up (instead of +2)
- Story 8.2 — Level-up upgrade options established
- Story 6.2 — SkillEffectEngine design

### Key Requirements
- Modify level-up stat gains when stat-boosting skills owned
- Fuerza Hércules: STR level-ups grant +3 instead of +2
- Similar bonuses for Velocidad Mercurio (Speed), Agilidad Felina (Agility)
- Display enhanced gains in level-up UI ("STR +3" instead of "STR +2")
- Apply bonuses immediately and persist to database

## Acceptance Criteria

1. Fuerza Hércules grants +3 STR on STR level-up choice (vs default +2)
2. Velocidad Mercurio grants +3 Speed on Speed level-up choice
3. Agilidad Felina grants +3 Agility on Agility level-up choice
4. Level-up UI displays enhanced values when skills owned
5. Bonuses apply cumulatively if multiple stat-boosting skills owned (future-proofing)

## Tasks / Subtasks

- [ ] Task 1: Modify ProgressionEngine.applyLevelUpChoice()
- [ ] Task 2: Query SkillEffectEngine.getLevelUpBonuses(bruto, stat)
- [ ] Task 3: Add bonus to base gain (2 + bonus)
- [ ] Task 4: Update level-up UI to show enhanced gains
- [ ] Task 5: Test with each stat-boosting skill
- [ ] Task 6: Test without skills (default +2 behavior)

## References
- Level-up system from Story 8.2
- Skill effects from Story 6.2
- Stat-boosting skills in docs/habilidades-catalogo.md

## Change Log
- 2025-10-31: Story created for Epic 6 level-up skill bonuses

## Dev Agent Record
### Agent Model Used
{{agent_model_name_version}}

## Senior Developer Review (AI)
**Reviewer:** {{reviewer_name}}  
**Date:** {{review_date}}  
**Outcome:** {{Approved | Changes Requested | Rejected}}
