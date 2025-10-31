# Story 2.1: Account Creation & Login Flow

Status: review

## Story

As a player,
I want to create an account with username + password (hashed locally),
so that my roster persists between sessions.

## Requirements Context Summary

### Requirement Sources
- `docs/epics.md` — Epic 2 Story 2.1 defines account creation requirements and acceptance criteria (registration form validation, password hashing, login routing).
- `docs/architecture.md` — Section 12 specifies security architecture with bcryptjs password hashing, session management, and authentication patterns.
- `docs/GDD.md` — Section 16 confirms local-first architecture with no server-side authentication.

### Key Requirements
- Implement registration form with username and password fields including validation (uniqueness, minimum length, character restrictions).
- Hash passwords using bcryptjs with salt before storing in database.
- Create login form that verifies credentials against hashed passwords.
- Wire successful login to route to BrutoSelectionScene (Casillero).
- Display appropriate error messages for failed login attempts.
- Store user session in Zustand state for access across scenes.

## Structure Alignment Summary

### Learnings from Previous Story

**From Story 1-3-ui-shell-and-navigation (Status: drafted)**

- **Scene Navigation Ready**: Navigation state machine implemented with scene transitions
- **UI Components Available**: Reusable Button, Panel, Modal components using theme tokens
- **UIScene Overlay**: Persistent overlay for global UI elements operational
- **Zustand Integration**: State management wired for session data
- **Responsive Layout**: Layout system handles desktop and tablet viewports

[Source: stories/1-3-ui-shell-and-navigation.md#Dev-Agent-Record]

- Use the established UI components and navigation system to build login/registration forms.
- Leverage UserRepository from Story 1.2 for database operations.
- Follow the scene flow: LoginScene → BrutoSelectionScene on successful authentication.

## Acceptance Criteria

1. Registration form validates uniqueness, empty fields, and minimum password length.
2. Passwords hashed with bcryptjs before storage.
3. Successful login routes to Casillero; failed login shows error state.

## Tasks / Subtasks

- [x] Task 1 (AC: 1) Build registration system
  - [x] Subtask 1.1 Create registration form UI with username and password inputs
  - [x] Subtask 1.2 Implement input validation (uniqueness check, minimum length, character restrictions)
  - [x] Subtask 1.3 Add error messaging for validation failures

- [x] Task 2 (AC: 2) Implement password security
  - [x] Subtask 2.1 Create AuthService with hashPassword() and verifyPassword() methods using bcryptjs
  - [x] Subtask 2.2 Integrate password hashing into registration flow
  - [x] Subtask 2.3 Store hashed passwords in users table via UserRepository

- [x] Task 3 (AC: 3) Build login flow
  - [x] Subtask 3.1 Create login form UI reusing registration components
  - [x] Subtask 3.2 Implement credential verification with database lookup and password comparison
  - [x] Subtask 3.3 Wire successful login to update Zustand session state and navigate to BrutoSelectionScene
  - [x] Subtask 3.4 Display error states for invalid credentials or database errors

## Story Body

### Implementation Outline
1. Create AuthService utility class with bcryptjs integration for password hashing and verification.
2. Build registration form in LoginScene using established UI components.
3. Implement username validation using Validators utility class (architecture.md Section 12).
4. Wire registration to UserRepository.create() with hashed password.
5. Build login form with credential verification logic.
6. Integrate Zustand useUserState for session management.
7. Add navigation on successful login using scene.start('BrutoSelectionScene').
8. Implement comprehensive error handling with GameError class.

## Dev Notes

### Learnings from Previous Story

- **UI Components Ready**: Button, Panel, Input components available with theme tokens
- **Navigation Working**: Scene transitions via Phaser scene manager functional
- **Zustand State**: Session management store ready for user data
- **Repository Pattern**: UserRepository available for database operations

Wire authentication through the established repository layer using the Result<T> pattern for error handling.

### Project Structure Notes

**Authentication Components** (from architecture.md Section 12):
```
src/
  utils/
    AuthService.ts            # bcryptjs hashing and verification
    validators.ts             # Username/password validation
  state/
    useUserState.ts           # User session Zustand store
  scenes/
    LoginScene.ts             # Login/registration UI
```

### References

- Use bcryptjs with salt rounds of 10 for password hashing as specified in architecture.md Section 12. [Source: docs/architecture.md#12-security-architecture]
- Implement username validation requiring 3+ characters and alphanumeric + underscore only. [Source: docs/architecture.md#12-security-architecture]
- Store session in Zustand in-memory (cleared on page refresh) per security notes. [Source: docs/architecture.md#12-security-architecture]
- Use GameError class with ErrorCodes.VALIDATION_INVALID_INPUT for validation failures. [Source: docs/architecture.md#9-implementation-patterns-consistency-rules]
- Follow the scene flow: LoginScene → BrutoSelectionScene on successful authentication. [Source: docs/architecture.md#5-scene-architecture]

## Change Log

- 2025-10-30: Draft story created from epics/architecture/GDD sources with learnings from Stories 1.1-1.3.

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

N/A - Implementation completed without blocking issues.

### Completion Notes List

- **AuthService**: Created password hashing and verification service using bcryptjs with 10 salt rounds per security specifications.
- **Validators**: Implemented username validation (3-20 chars, alphanumeric + underscore) and password validation (6+ chars minimum).
- **LoginScene Complete**: Built full login/registration UI with DOM input overlays for better user experience.
- **Registration Flow**: Username uniqueness check, input validation, password hashing, user creation via UserRepository, session initialization.
- **Login Flow**: Credential verification with hashed password comparison, last login timestamp update, session management with Zustand.
- **Error Handling**: Comprehensive error messages for validation failures, duplicate usernames, invalid credentials, and database errors.
- **Navigation**: Successful authentication routes to BrutoSelectionScene with user session stored in Zustand state.
- **DOM Input Integration**: Created positioned HTML input elements over canvas for better text input UX, with cleanup on scene shutdown.
- **Toggle Mode**: Switch between login and registration forms without page reload.
- **Build Status**: All TypeScript compilation successful, no errors.

### File List

**Authentication Utilities:**
- `src/utils/AuthService.ts` - Password hashing and verification using bcryptjs (10 salt rounds)
- `src/utils/validators.ts` - Input validation for usernames, passwords, and bruto names

**Scene Updates:**
- `src/scenes/LoginScene.ts` - Complete login/registration UI with DOM inputs, form validation, authentication flow, and error handling

**Utility Updates:**
- `src/utils/errors.ts` - Added AUTH_HASH_FAILED and AUTH_VERIFICATION_FAILED error codes
