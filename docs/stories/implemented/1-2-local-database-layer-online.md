# Story 1.2: Local Database Layer Online

Status: review

## Story

As a developer,
I want the sql.js persistence layer configured with migrations,
so that I can store users, brutos, fights, and replays offline.

## Requirements Context Summary

### Requirement Sources
- `docs/epics.md` — Epic 1 Story 1.2 defines the database initialization scope and acceptance criteria (schema files, migration runner, CRUD helpers).
- `docs/architecture.md` — Section 6 specifies the complete SQLite schema with tables for users, brutos, weapons, skills, pets, battles, and daily_fights. Section 1 mandates sql.js 1.10+ as the database technology.
- `docs/GDD.md` — Sections 15 and 16 confirm the local-first architecture requirement and offline capability as a core pillar.

### Key Requirements
- Initialize sql.js in the browser with proper error handling and fallback mechanisms.
- Create migration files covering all tables: users, brutos, bruto_weapons, bruto_skills, bruto_pets, battles, daily_fights.
- Implement a migration runner that executes schema files in order and tracks applied migrations.
- Build CRUD helper functions (insertBruto, recordBattle, findByLevel, etc.) that future epics can consume.
- Add appropriate indexes for performance (brutos by level for matchmaking, battles by date, etc.).

## Structure Alignment Summary

### Learnings from Previous Story

**From Story 1-1-project-skeleton-bootstrapped (Status: drafted)**

- **New files**: Project structure established with src/scenes, src/database, src/state folders
- **Configuration**: TypeScript, Vite, ESLint, and Prettier configured and working
- **Baseline**: npm run dev, build, and preview all functional
- **Folder Structure**: Clean Architecture layers scaffolded and ready for implementation

[Source: stories/1-1-project-skeleton-bootstrapped.md#Dev-Agent-Record]

- Database layer should be implemented in `src/database/` following the Clean Architecture pattern established in Story 1.1.
- Leverage the dependency installation (sql.js already added) and build tools validated in the previous story.
- Create migration system that aligns with the documented schema in architecture.md Section 6. [Source: docs/architecture.md#6-data-architecture]

## Acceptance Criteria

1. Database schema files cover users, brutos, stats, weapons, skills, pets, battles, replays.
2. Migration runner initializes schema on first launch.
3. CRUD helpers exposed for future epics (`insertBruto`, `recordBattle`, etc.).

## Tasks / Subtasks

- [x] Task 1 (AC: 1) Create database schema and migration system
  - [x] Subtask 1.1 Create DatabaseManager.ts wrapper for sql.js with initialization and error handling
  - [x] Subtask 1.2 Write migration files for all tables (users, brutos, bruto_weapons, bruto_skills, bruto_pets, battles, daily_fights)
  - [x] Subtask 1.3 Add indexes for performance (level matching, battle history lookups)

- [x] Task 2 (AC: 2) Implement migration runner
  - [x] Subtask 2.1 Build migration tracking system to record applied migrations
  - [x] Subtask 2.2 Create initialization logic that runs migrations on first launch
  - [x] Subtask 2.3 Add migration rollback capability for development testing

- [x] Task 3 (AC: 3) Build CRUD helper functions
  - [x] Subtask 3.1 Implement BaseRepository with common CRUD operations and Result<T> pattern
  - [x] Subtask 3.2 Create BrutoRepository with findById, findByLevel, create, update, delete methods
  - [x] Subtask 3.3 Create BattleRepository with recordBattle, getLastEightBattles methods
  - [x] Subtask 3.4 Create UserRepository with authentication and session management helpers
  - [x] Subtask 3.5 Add DailyFightsRepository for tracking fight limits

## Story Body

### Implementation Outline
1. Create DatabaseManager.ts that wraps sql.js initialization, provides query methods, and manages the migration system.
2. Write SQL migration files (001_initial_schema.sql, 002_add_indexes.sql, etc.) covering all tables defined in architecture.md Section 6.
3. Implement migration runner that tracks applied migrations in a migrations table and executes pending migrations in order.
4. Build BaseRepository with shared query logic and Result<T> error handling pattern as specified in architecture.md Section 9.
5. Create concrete repositories (BrutoRepository, UserRepository, BattleRepository, DailyFightsRepository) with domain-specific CRUD operations.
6. Add comprehensive error handling using GameError class from architecture.md Section 9.
7. Write unit tests for repositories using in-memory database (:memory:) as shown in architecture.md Section 14.

## Dev Notes

### Learnings from Previous Story

- **Folder Structure Ready**: src/database/ folder is scaffolded and waiting for implementation
- **Dependencies Installed**: sql.js and @types/sql.js are already available from Story 1.1
- **Build Tooling Stable**: Development environment is configured and tested
- **Architecture Patterns Established**: Clean Architecture layers are defined and documented

Use the established project structure to place database files in the correct locations following the Clean Architecture pattern.

### Project Structure Notes

**Database Layer Structure** (from architecture.md Section 4):
```
src/
  database/
    DatabaseManager.ts          # sql.js wrapper, migrations
    repositories/
      BaseRepository.ts         # Shared repository logic
      BrutoRepository.ts        # CRUD for brutos
      UserRepository.ts         # CRUD for users
      BattleRepository.ts       # CRUD for battles
    migrations/
      001_initial_schema.sql
      002_add_indexes.sql
    seeds/
      weapons.json              # All weapon data
      skills.json               # All skill data
```

### References

- Follow the complete schema specification from architecture.md Section 6, ensuring all tables, columns, and foreign keys are created correctly. [Source: docs/architecture.md#6-data-architecture]
- Use the Result<T> pattern mandatorily for all async database operations as defined in architecture.md Section 9. [Source: docs/architecture.md#9-implementation-patterns-consistency-rules]
- Implement GameError class for error handling with specific error codes (DB_QUERY_FAILED, DB_NOT_FOUND, etc.). [Source: docs/architecture.md#9-implementation-patterns-consistency-rules]
- Add indexes for critical queries: brutos by level (matchmaking), battles by player (history), battles by date (last 8), daily_fights by user and date. [Source: docs/architecture.md#13-performance-considerations]
- Use in-memory database (:memory:) for unit testing as shown in the testing strategy. [Source: docs/architecture.md#14-testing-strategy]

## Change Log

- 2025-10-30: Draft story created from epics/architecture/GDD sources with learnings from Story 1.1.

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

N/A - Implementation completed without blocking issues.

### Completion Notes List

- **Database Infrastructure**: Created complete database layer with sql.js wrapper, migration system, and repository pattern.
- **Error Handling**: Implemented Result<T> pattern and GameError class for type-safe error handling across all database operations.
- **Migration System**: Built automatic migration tracking and execution system with rollback capability.
- **Repository Pattern**: Created BaseRepository with shared query logic, plus concrete repositories for User, Bruto, Battle, and DailyFights entities.
- **Schema Complete**: All tables from architecture.md Section 6 implemented with proper foreign keys and cascade deletes.
- **Performance Indexes**: Added indexes for matchmaking (level), battle history (date), and daily fight tracking (user+date).
- **BootScene Integration**: Wired DatabaseManager initialization in BootScene with error handling and user feedback.
- **Build Status**: All TypeScript compilation successful, no errors.

### File List

**Core Database Infrastructure:**
- `src/database/DatabaseManager.ts` - sql.js wrapper with singleton pattern, migration runner, and localStorage persistence
- `src/database/repositories/BaseRepository.ts` - Abstract base repository with common CRUD operations

**Database Repositories:**
- `src/database/repositories/UserRepository.ts` - User CRUD with authentication helpers
- `src/database/repositories/BrutoRepository.ts` - Bruto CRUD with matchmaking and stat management
- `src/database/repositories/BattleRepository.ts` - Battle recording and history retrieval
- `src/database/repositories/DailyFightsRepository.ts` - Daily fight limit tracking with date-based queries

**Database Schema:**
- `src/database/migrations/001_initial_schema.sql` - Complete schema with 8 tables (migrations, users, brutos, bruto_weapons, bruto_skills, bruto_pets, battles, daily_fights)
- `src/database/migrations/002_add_indexes.sql` - Performance indexes for critical queries

**TypeScript Models:**
- `src/models/User.ts` - IUser interface
- `src/models/Bruto.ts` - IBruto, BrutoStats, Appearance interfaces
- `src/models/Battle.ts` - IBattle, CombatAction interfaces
- `src/models/DailyFights.ts` - IDailyFights interface

**Utilities:**
- `src/utils/errors.ts` - GameError class and ErrorCodes constants
- `src/utils/result.ts` - Result<T> type and ok/err helper functions
- `src/utils/constants.ts` - Game constants (max brutos, fight limits, stats, etc.)

**Scene Integration:**
- `src/scenes/BootScene.ts` - Updated with DatabaseManager initialization and error handling
