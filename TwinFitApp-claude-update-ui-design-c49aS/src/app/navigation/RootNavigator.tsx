import React from "react";
import { ActivityIndicator, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SplashScreen } from "../screens/SplashScreen";
import { ModeSelectScreen } from "../screens/ModeSelectScreen";
import { AuthStack } from "./AuthStack";
import { MainTabs } from "./MainTabs";
import { SettingsScreen } from "../screens/settings/SettingsScreen";
import { ProfileSettingsScreen } from "../screens/settings/ProfileSettingsScreen";
import { ShopScreen } from "../screens/shop/ShopScreen";
import { QuestsScreen } from "../screens/quests/QuestsScreen";
import { useAuth } from "../../store/AuthStore";
import { colors } from "../../theme/tokens";

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  ModeSelect: undefined;
  Main: undefined;
  Settings: undefined;
  ProfileSettings: undefined;
  Shop: undefined;
  Quests: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { user, bootstrapped } = useAuth();

  // Wait for SecureStore token restore before rendering navigation
  if (!bootstrapped) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#0A0A0A" },
      }}
    >
      {!user ? (
        // ── Unauthenticated ─────────────────────────────────────
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Auth" component={AuthStack} />
          <Stack.Screen name="ModeSelect" component={ModeSelectScreen} />
        </>
      ) : (
        // ── Authenticated ───────────────────────────────────────
        <>
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{ animation: "fade" }}
          />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
          <Stack.Screen
            name="Shop"
            component={ShopScreen}
            options={{ animation: "slide_from_bottom", presentation: "modal" }}
          />
          <Stack.Screen
            name="Quests"
            component={QuestsScreen}
            options={{ animation: "slide_from_bottom", presentation: "modal" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};
