import React from "react";
import { Text, View } from "react-native";
import { colors, typography } from "../../theme/tokens";
import { GhostButton, SurfaceCard } from "../primitives";

export interface RecipeCardProps {
  title: string;
  steps: string[];
  onSave?: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ title, steps, onSave }) => {
  return (
    <SurfaceCard variant="surface-2" radius={22}>
      <View style={{ gap: 8 }}>
        <Text style={{ color: colors.textPrimary, ...typography.h3 }}>{title}</Text>
        {steps.slice(0, 3).map((s, i) => (
          <Text key={`step-${i}`} style={{ color: colors.textSecondary, ...typography.bodySm }}>
            {i + 1}. {s}
          </Text>
        ))}
        {onSave ? <GhostButton label="Save" onPress={onSave} /> : null}
      </View>
    </SurfaceCard>
  );
};
