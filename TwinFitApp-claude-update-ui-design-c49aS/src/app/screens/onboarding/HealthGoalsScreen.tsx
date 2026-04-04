import React from "react";
import { Text, View } from "react-native";
import { AppScreen, InputField, PillButton, Chip } from "../../../components";
import { colors, typography } from "../../../theme/tokens";

export const HealthGoalsScreen = () => {
  return (
    <AppScreen>
      <View style={{ gap: 16 }}>
        <Text style={{ color: colors.textPrimary, ...typography.h1 }}>Health & Goals</Text>
        <InputField label="Height (cm)" value="" onChangeText={() => undefined} placeholder="180" />
        <InputField label="Weight (kg)" value="" onChangeText={() => undefined} placeholder="78" />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Chip label="Bulking" />
          <Chip label="Slimming" />
          <Chip label="Maintenance" />
        </View>
        <PillButton label="Finish" onPress={() => undefined} />
      </View>
    </AppScreen>
  );
};
