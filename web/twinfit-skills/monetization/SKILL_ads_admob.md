# SKILL: Google AdMob
> TwinFit — Free tier ads, banner placement, premium check

## Installation
```bash
npm install react-native-google-mobile-ads
```

## Ad Units Config
```ts
export const AD_UNITS = {
  banner: {
    ios: __DEV__ ? "ca-app-pub-3940256099942544/2934735716" : "ca-app-pub-REAL/IOS_ID",
    android: __DEV__ ? "ca-app-pub-3940256099942544/6300978111" : "ca-app-pub-REAL/AND_ID",
  },
};
```

## AdBanner Component
```tsx
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { Platform } from "react-native";

export function AdBanner() {
  const { isPremium } = usePremiumGate();
  if (isPremium) return null;

  return (
    <BannerAd
      unitId={Platform.OS === "ios" ? AD_UNITS.banner.ios : AD_UNITS.banner.android}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      requestOptions={{ requestNonPersonalizedAdsOnly: true }}
    />
  );
}
```

## Ad Placement Rules
```
Show ads:     Home (bottom), Evolution (bottom), Nutrition (between sections)
Never show:   Login, Signup, Recipe result, Meal scan result, Partner connect
Max 1 interstitial per day, only post-session-log for free users
```
