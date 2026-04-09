# SKILL: Play Store Submission
> TwinFit — Google Play Console, AAB, data safety, rollout

## Play Console Setup
```
Package:     com.twinfit.app
App Name:    TwinFit - Couple Fitness Streak
Category:    Health & Fitness
Rating:      Everyone
```

## Build AAB
```bash
eas build --platform android --profile production
# Always submit .aab not .apk
```

## Data Safety Form
```
Data collected:
  Email (account, required, encrypted)
  Name (app function, required)
  Photos (app function, optional, encrypted)
  Health data (app function, optional)
Data shared: None
Security: Encrypted in transit, deletion on request
```

## Staged Rollout
```
Week 1:  10% — internal testing
Week 2:  25% — watch crash rate
Week 3:  50%
Week 4: 100%

Halt if: crash rate > 1%, ANR > 0.5%, rating < 4.0
```
