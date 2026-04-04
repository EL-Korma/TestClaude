import React from "react";
import { Text } from "react-native";
import { AppScreen } from "../../../components";
import { colors, typography } from "../../../theme/tokens";

export const CommunityScreen = () => {
  return (
    <AppScreen>
      <Text style={{ color: colors.textPrimary, ...typography.h1 }}>Community</Text>
    </AppScreen>
  );
};
