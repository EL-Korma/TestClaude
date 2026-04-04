import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SplashScreen } from "../screens/SplashScreen";
import { ModeSelectScreen } from "../screens/ModeSelectScreen";
import { AuthStack } from "./AuthStack";
import { MainTabs } from "./MainTabs";

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  ModeSelect: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#0A0A0A" },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Auth" component={AuthStack} />
      <Stack.Screen name="ModeSelect" component={ModeSelectScreen} />
      <Stack.Screen
        name="Main"
        component={MainTabs}
        options={{ animation: "fade" }}
      />
    </Stack.Navigator>
  );
};
