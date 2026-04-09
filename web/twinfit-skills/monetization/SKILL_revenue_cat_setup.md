# SKILL: RevenueCat Setup
> TwinFit — iOS/Android billing, entitlements, paywall

## Installation
```bash
npm install react-native-purchases
```

## Init (services/purchases.ts)
```ts
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { Platform } from "react-native";

export async function initRevenueCat(userId: string) {
  if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  await Purchases.configure({
    apiKey: Platform.OS === "ios" ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
    appUserID: userId,
  });
}

export async function purchasePremium(): Promise<boolean> {
  const offerings = await Purchases.getOfferings();
  const pkg = offerings.current?.availablePackages[0];
  if (!pkg) throw new Error("No packages available");
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo.entitlements.active["premium"] !== undefined;
}

export async function checkPremiumStatus(): Promise<boolean> {
  const info = await Purchases.getCustomerInfo();
  return info.entitlements.active["premium"] !== undefined;
}

export async function restorePurchases(): Promise<boolean> {
  const info = await Purchases.restorePurchases();
  return info.entitlements.active["premium"] !== undefined;
}
```

## RevenueCat Dashboard Config
```
Products:     twinfit_premium_monthly ($4.99/mo), twinfit_premium_annual ($34.99/yr)
Entitlement:  "premium" — attached to both products
Offering:     "default" — packages: monthly + annual
```

## Premium Gate Hook
```ts
export function usePremiumGate() {
  const { user } = useAuthStore();
  const router = useRouter();
  const requirePremium = (action: () => void) => {
    if (user?.is_premium) action();
    else router.push("/(app)/paywall");
  };
  return { isPremium: user?.is_premium ?? false, requirePremium };
}
```
