# SKILL: EAS Build & Deploy
> TwinFit — Build profiles, store submission, OTA updates

## eas.json
```json
{
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": { "distribution": "internal" },
    "production": { "autoIncrement": true }
  },
  "submit": {
    "production": {
      "ios": { "appleId": "your@apple.id", "ascAppId": "APP_ID", "appleTeamId": "TEAM_ID" },
      "android": { "serviceAccountKeyPath": "./google-service-account.json", "track": "internal" }
    }
  }
}
```

## Commands
```bash
# Build
eas build --platform ios --profile development
eas build --platform android --profile preview
eas build --platform all --profile production

# Submit
eas submit --platform ios --latest
eas submit --platform android --latest

# OTA update (no store review)
eas update --branch production --message "Fix streak timezone bug"
```

## OTA vs Store Review
```
OTA allowed:  JS/TS fixes, UI tweaks, copy, AI prompts, analytics
Store needed: Native modules, permissions, new IAP products
```

## iOS Checklist
```
1. Apple Developer Account ($99/yr)
2. App ID: com.twinfit.app
3. APNs key for push
4. Sign In with Apple capability
5. In-App Purchase capability
```
