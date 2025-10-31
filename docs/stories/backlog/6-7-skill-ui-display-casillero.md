# Story 6.7: Skill UI Display in Casillero

Status: backlog

## Story
As a player,
I want to see my bruto's acquired skills in the Casillero with icons, descriptions, and effects,
so that I understand my bruto's capabilities and plan future builds.

## Requirements Context Summary

### Requirement Sources
- `docs/GDD.md` — Casillero features skill grid display
- Story 3.2 — Casillero UI layout established
- Story 6.1 — Skill catalog with metadata
- Original game screenshots — ~7x8 skill grid with icons

### Key Requirements
- Display skill grid in Casillero scene (7 columns × 8 rows)
- Show skill icons with tooltips (name, description, effects)
- Highlight acquired skills vs empty slots
- Support skill details modal on click
- Show stat bonuses granted by skills

## Acceptance Criteria

1. Skill grid renders in Casillero with proper layout (7×8 grid)
2. Acquired skills display with icons and highlight effect
3. Hover tooltips show skill name and brief description
4. Click skill opens details modal with full effects list
5. Empty slots indicated visually (grayed out or locked icon)

## Tasks / Subtasks

- [ ] Task 1: Create skill grid UI component (7×8 layout)
- [ ] Task 2: Load and display skill icons
- [ ] Task 3: Implement hover tooltips with skill info
- [ ] Task 4: Create skill details modal
- [ ] Task 5: Show stat bonuses in stat panel
- [ ] Task 6: Test grid with various skill counts (0, 5, 20, 40)

## References
- Casillero UI from Story 3.2
- Skill catalog from Story 6.1
- Original game grid screenshots

## Change Log
- 2025-10-31: Story created for Epic 6 skill UI in Casillero

## Dev Agent Record
### Agent Model Used
{{agent_model_name_version}}

## Senior Developer Review (AI)
**Reviewer:** {{reviewer_name}}  
**Date:** {{review_date}}  
**Outcome:** {{Approved | Changes Requested | Rejected}}
