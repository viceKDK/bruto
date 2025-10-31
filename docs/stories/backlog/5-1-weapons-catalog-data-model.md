# Story 5.1: Weapons Catalog Data Model

Status: backlog

## Story
As a developer, I want a complete weapons catalog with all weapon types, stats, and behaviors, so that weapons can be equipped and used in combat.

## Requirements Context Summary
- `docs/armas-especificaciones.md` — Weapon catalog with types, damage, reach, odds
- Epic 5 requires full weapon catalog with category behaviors and disarm stats

## Acceptance Criteria
1. Weapons catalog JSON with all documented weapon types
2. TypeScript interfaces for Weapon, WeaponType, WeaponStats
3. Database schema for bruto_weapons ownership tracking
4. Weapon metadata: damage, reach, type (blunt/slash/pierce), disarm chance

## Tasks / Subtasks
- [ ] Task 1: Create weapons.json catalog
- [ ] Task 2: TypeScript interfaces (Weapon, WeaponType, WeaponStats)
- [ ] Task 3: Database migration for bruto_weapons table
- [ ] Task 4: WeaponRepository with CRUD operations

## References
- Weapon specs in docs/armas-especificaciones.md
- Epic 5 in docs/epics.md

## Change Log
- 2025-10-31: Story created for Epic 5 Weapons System

## Dev Agent Record
### Agent Model Used
{{agent_model_name_version}}

## Senior Developer Review (AI)
**Reviewer:** {{reviewer_name}}  
**Date:** {{review_date}}  
**Outcome:** {{Approved | Changes Requested | Rejected}}
