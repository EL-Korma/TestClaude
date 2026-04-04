import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeScreen } from "../screens/home/HomeScreen";
import { LogScreen } from "../screens/home/LogScreen";
import { EvolveScreen } from "../screens/evolve/EvolveScreen";
import { NutritionScreen } from "../screens/nutrition/NutritionScreen";
import { StyledTabBar } from "./StyledTabBar";

export type MainTabsParamList = {
  Home: undefined;
  Log: undefined;
  Evolve: undefined;
  Nutrition: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

export const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <StyledTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Log" component={LogScreen} />
      <Tab.Screen name="Evolve" component={EvolveScreen} />
      <Tab.Screen name="Nutrition" component={NutritionScreen} />
    </Tab.Navigator>
  );
};
