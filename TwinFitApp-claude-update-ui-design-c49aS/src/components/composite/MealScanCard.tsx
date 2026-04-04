import React from "react";
import { Text, View } from "react-native";
import { colors, typography } from "../../theme/tokens";
import { GhostButton, PillButton, SurfaceCard } from "../primitives";

export interface MealScanCardProps {
  onScan: () => void;
  onRecipe: () => void;
}

export const MealScanCard: React.FC<MealScanCardProps> = ({ onScan, onRecipe }) => {
  return (
    <SurfaceCard variant="surface-1" radius={22}>
      <View style={{ gap: 10 }}>
        <Text style={{ color: colors.textPrimary, ...typography.h3 }}>Just trained?</Text>
        <Text style={{ color: colors.textSecondary, ...typography.bodySm }}>Check your meal balance.</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <PillButton label="Scan meal" onPress={onScan} iconLeft={{ name: "camera" }} />
          <GhostButton label="Generate recipe" onPress={onRecipe} iconLeft={{ name: "zap" }} />
        </View>
      </View>
    </SurfaceCard>
  );
};
