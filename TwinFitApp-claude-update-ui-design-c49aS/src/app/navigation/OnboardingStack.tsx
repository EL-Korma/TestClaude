import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { WelcomeScreen } from "../screens/onboarding/WelcomeScreen";
import { AvatarSelectScreen } from "../screens/onboarding/AvatarSelectScreen";
import { ChallengeModeScreen } from "../screens/onboarding/ChallengeModeScreen";
import { GroupInviteScreen } from "../screens/onboarding/GroupInviteScreen";
import { HealthGoalsScreen } from "../screens/onboarding/HealthGoalsScreen";

export type OnboardingStackParamList = {
  Welcome: undefined;
  AvatarSelect: undefined;
  ChallengeMode: undefined;
  GroupInvite: undefined;
  HealthGoals: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="AvatarSelect" component={AvatarSelectScreen} />
      <Stack.Screen name="ChallengeMode" component={ChallengeModeScreen} />
      <Stack.Screen name="GroupInvite" component={GroupInviteScreen} />
      <Stack.Screen name="HealthGoals" component={HealthGoalsScreen} />
    </Stack.Navigator>
  );
};
