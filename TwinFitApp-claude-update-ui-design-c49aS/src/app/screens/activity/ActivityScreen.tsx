import React from "react";
import { Text } from "react-native";
import { AppScreen } from "../../../components";
import { colors, typography } from "../../../theme/tokens";

export const ActivityScreen = () => {
  return (
    <AppScreen>
      <Text style={{ color: colors.textPrimary, ...typography.h1 }}>Activity</Text>
    </AppScreen>
  );
};
