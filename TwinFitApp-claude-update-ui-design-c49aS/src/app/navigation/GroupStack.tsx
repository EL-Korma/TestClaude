import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GroupWaitingScreen } from "../screens/group/GroupWaitingScreen";

export type GroupStackParamList = {
  GroupWaiting: undefined;
};

const Stack = createNativeStackNavigator<GroupStackParamList>();

export const GroupStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GroupWaiting" component={GroupWaitingScreen} />
    </Stack.Navigator>
  );
};
