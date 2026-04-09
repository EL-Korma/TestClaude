# SKILL: Git Workflow
> TwinFit — Branching strategy, commits, versioning, PR templates

---

## Branch Strategy

```
main          ← production (protected, requires PR + review)
develop       ← integration branch (all features merge here first)
feature/*     ← new features  e.g. feature/meal-scan
fix/*         ← bug fixes     e.g. fix/streak-timezone
hotfix/*      ← urgent prod fixes
release/*     ← release prep  e.g. release/1.2.0
```

### Rules
- `main` and `develop` are protected — no direct pushes
- All work happens in `feature/*` or `fix/*` branches
- PR required to merge into `develop`
- `develop` → `main` only via release branch
- Delete branches after merge

---

## Commit Convention (Conventional Commits)

```
<type>(<scope>): <short description>

Types:
  feat      New feature
  fix       Bug fix
  docs      Documentation only
  style     Formatting (no logic change)
  refactor  Code change (no feature/fix)
  perf      Performance improvement
  test      Adding/fixing tests
  build     Build system or deps
  ci        CI/CD changes
  chore     Maintenance

Examples:
  feat(streak): add streak freeze logic
  fix(auth): handle Apple Sign-In token expiry
  feat(nutrition): add meal scan AI analysis
  fix(camera): resolve Android permission crash
  ci(eas): add production build workflow
  docs(readme): update setup instructions
```

---

## PR Template (.github/pull_request_template.md)

```markdown
## What does this PR do?
<!-- Short description of changes -->

## Type of change
- [ ] New feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Performance improvement
- [ ] Documentation

## Testing
- [ ] Tested on iOS simulator
- [ ] Tested on Android emulator
- [ ] Tested on physical device
- [ ] Unit tests added/updated

## Screenshots (if UI changes)
| Before | After |
|--------|-------|
| | |

## Related issues
Closes #
```

---

## .gitignore

```
# Dependencies
node_modules/
.yarn/

# Expo
.expo/
dist/
web-build/

# Environment
.env
.env.local
.env.*.local
*.pem

# EAS
google-service-account.json
GoogleService-Info.plist

# OS
.DS_Store
*.log

# IDEs
.vscode/
.idea/

# Native
ios/
android/
```

---

## Versioning Strategy

```
MAJOR.MINOR.PATCH
1.0.0  ← initial launch
1.0.1  ← bug fix
1.1.0  ← new feature (meal scan)
2.0.0  ← breaking change (new onboarding)
```

Build numbers auto-increment via EAS (`"autoIncrement": true`)

---

## Setup Commands

```bash
# Initial setup
git clone https://github.com/yourorg/twinfit
git checkout -b develop origin/develop

# Start a new feature
git checkout develop
git pull origin develop
git checkout -b feature/meal-scan

# Daily workflow
git add -p                              # stage hunks selectively
git commit -m "feat(scan): add food picker UI"
git push origin feature/meal-scan

# Finish feature
git checkout develop
git pull origin develop
git merge --no-ff feature/meal-scan    # preserve merge commit
git push origin develop
git branch -d feature/meal-scan

# Hotfix
git checkout main
git checkout -b hotfix/streak-calculation
# ... fix ...
git checkout main && git merge hotfix/streak-calculation
git checkout develop && git merge hotfix/streak-calculation
git tag -a v1.0.1 -m "Fix streak calculation"
```
