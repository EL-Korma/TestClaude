# SKILL: Expo + React Native Setup
> TwinFit — Full Expo SDK configuration, EAS Build, environments

---

## app.json (full config)

```json
{
  "expo": {
    "name": "TwinFit",
    "slug": "twinfit",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "scheme": "twinfit",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#080808"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.twinfit.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "TwinFit uses the camera to capture your gym pose and scan your meals.",
        "NSPhotoLibraryUsageDescription": "TwinFit accesses your photo library to upload pose and meal photos.",
        "NSUserNotificationsUsageDescription": "TwinFit sends reminders to keep your duo streak alive."
      },
      "entitlements": {
        "com.apple.developer.applesignin": ["Default"]
      }
    },
    "android": {
      "package": "com.twinfit.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#080808"
      },
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-camera",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#FF5E1A",
          "sounds": []
        }
      ],
      [
        "expo-build-properties",
        {
          "ios": { "deploymentTarget": "15.1" },
          "android": { "compileSdkVersion": 34, "targetSdkVersion": 34 }
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "eas": { "projectId": "YOUR_EAS_PROJECT_ID" },
      "router": { "origin": false }
    }
  }
}
```

---

## eas.json (build profiles)

```json
{
  "cli": { "version": ">= 10.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": { "EXPO_PUBLIC_APP_ENV": "development" }
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": false },
      "env": { "EXPO_PUBLIC_APP_ENV": "staging" }
    },
    "production": {
      "autoIncrement": true,
      "env": { "EXPO_PUBLIC_APP_ENV": "production" }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@apple.id",
        "ascAppId": "YOUR_APP_STORE_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

---

## Root Layout (app/_layout.tsx)

```tsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { DMSans_300Light, DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold } from '@expo-google-fonts/dm-sans';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/services/supabase';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    DMSans_300Light,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
  });
  const { setSession, setUser } = useAuthStore();

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          // Fetch full user profile
          const { data } = await supabase
            .from('users')
            .select('*, duo:duos(*)')
            .eq('id', session.user.id)
            .single();
          if (data) setUser(data);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </GestureHandlerRootView>
  );
}
```

---

## App Tab Navigator (app/(app)/_layout.tsx)

```tsx
import { Tabs } from 'expo-router';
import { colors } from '@/constants/tokens';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(8,8,8,0.97)',
          borderTopColor: 'rgba(255,255,255,0.06)',
          height: 76,
          paddingBottom: 12,
        },
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontSize: 9,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          fontFamily: 'DMSans_500Medium',
        },
      }}
    >
      <Tabs.Screen name="home" options={{ tabBarLabel: 'Home', tabBarIcon: ({ color }) => <TabIcon name="home" color={color} /> }} />
      <Tabs.Screen name="log" options={{ tabBarLabel: 'Log', tabBarIcon: ({ color }) => <TabIcon name="camera" color={color} /> }} />
      <Tabs.Screen name="evolution" options={{ tabBarLabel: 'Evolve', tabBarIcon: ({ color }) => <TabIcon name="star" color={color} /> }} />
      <Tabs.Screen name="nutrition" options={{ tabBarLabel: 'Fuel', tabBarIcon: ({ color }) => <TabIcon name="leaf" color={color} /> }} />
    </Tabs>
  );
}
```

---

## Environment Config (constants/config.ts)

```ts
const ENV = process.env.EXPO_PUBLIC_APP_ENV ?? 'development';

export const config = {
  isDev: ENV === 'development',
  isStaging: ENV === 'staging',
  isProd: ENV === 'production',
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  },
  revenuecat: {
    iosKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY!,
    androidKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY!,
  },
  posthog: {
    key: process.env.EXPO_PUBLIC_POSTHOG_KEY!,
    host: process.env.EXPO_PUBLIC_POSTHOG_HOST!,
  },
};
```

---

## Quick Commands

```bash
# Development
npx expo start                        # Start dev server
npx expo start --ios                  # iOS simulator
npx expo start --android              # Android emulator

# EAS Builds
eas build --platform ios --profile development
eas build --platform android --profile preview
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android

# OTA Update (no store review needed)
eas update --branch production --message "Fix streak bug"
```
