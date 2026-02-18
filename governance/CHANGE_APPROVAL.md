# Change Approval Process

## Purpose
Defines how changes to Koli One are proposed, reviewed, and merged.

## Roles

| Role | Responsibility |
|------|---------------|
| **Owner** | Final approval authority. Merge rights to `main`. |
| **Lead Developer** | Code review, architecture decisions, CI/CD oversight. |
| **Contributor** | Feature branches, pull requests, test coverage. |

## Workflow

### 1. Branch Strategy
- `main` — production-ready, protected. Deployable at any time.
- `feat/*` — feature branches. Created from `main`.
- `fix/*` — bug-fix branches. Created from `main`.
- `hotfix/*` — urgent production fixes. Fast-track review.

### 2. Pull Request Requirements
- At least **1 approval** before merge.
- All CI checks must pass:
  - `npm run type-check` (zero TypeScript errors)
  - `npm test` (all suites pass)
  - `npm run build` (successful production build)
- PR description must include:
  - **What** changed
  - **Why** it changed
  - **Testing** evidence (screenshots, test output)

### 3. Review Checklist
- [ ] No `console.*` calls in `src/` (use `logger-service`)
- [ ] File stays under 300 lines (split if exceeded)
- [ ] No Firebase UIDs in public URLs
- [ ] No emoji characters in code
- [ ] No file deletions (move to `DDD/` instead)
- [ ] TypeScript strict mode compliant
- [ ] Tests added for new functionality

### 4. Emergency Hotfix
1. Create `hotfix/*` branch from `main`.
2. Minimal, focused fix only.
3. Owner can self-approve and merge.
4. Post-merge: create follow-up PR for tests and cleanup.

## Deployment
- Web: `firebase deploy --only hosting` after merge to `main`.
- Functions: `firebase deploy --only functions` (separate approval for backend changes).
- Domain: https://koli.one (Firebase Hosting, custom domain).

## Communication
- All decisions logged in PR comments.
- Breaking changes require advance notice in PR title: `[BREAKING]`.
