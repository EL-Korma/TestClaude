# SKILL: CI/CD Pipeline
> TwinFit — GitHub Actions, automated EAS builds

## .github/workflows/ci.yml
```yaml
name: CI
on:
  pull_request:
    branches: [develop, main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "npm" }
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test -- --passWithNoTests
```

## .github/workflows/deploy.yml
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "npm" }
      - uses: expo/expo-github-action@v8
        with: { eas-version: latest, token: "${{ secrets.EXPO_TOKEN }}" }
      - run: npm ci
      - run: eas build --platform all --profile production --non-interactive --auto-submit
        env:
          EXPO_APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_PASSWORD }}
```

## Required Secrets
```
EXPO_TOKEN                From expo.dev account settings
APPLE_APP_PASSWORD        App-specific password from appleid.apple.com
```
