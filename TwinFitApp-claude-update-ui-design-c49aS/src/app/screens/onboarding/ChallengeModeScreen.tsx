import React from "react";
import { Text, View } from "react-native";
import { AppScreen, SurfaceCard, PillButton } from "../../../components";
import { colors, typography } from "../../../theme/tokens";

export const ChallengeModeScreen = () => {
  return (
    <AppScreen>
      <View style={{ gap: 16 }}>
        <Text style={{ color: colors.textPrimary, ...typography.h1 }}>Choose your mode</Text>
        <SurfaceCard>
          <Text style={{ color: colors.textPrimary, ...typography.h3 }}>Couple Mode</Text>
          <Text style={{ color: colors.textSecondary, ...typography.bodySm }}>2 people, strong commitment.</Text>
        </SurfaceCard>
        <SurfaceCard>
          <Text style={{ color: colors.textPrimary, ...typography.h3 }}>Besties Mode</Text>
          <Text style={{ color: colors.textSecondary, ...typography.bodySm }}>2 people, mutual motivation.</Text>
        </SurfaceCard>
        <SurfaceCard>
          <Text style={{ color: colors.textPrimary, ...typography.h3 }}>Squad Mode</Text>
          <Text style={{ color: colors.textSecondary, ...typography.bodySm }}>4 people, collective challenge.</Text>
        </SurfaceCard>
        <PillButton label="Continue" onPress={() => undefined} />
      </View>
    </AppScreen>
  );
};
