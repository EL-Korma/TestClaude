import React from "react";
import { Text, View } from "react-native";
import { colors, radii, typography } from "../../theme/tokens";

export interface RadialMeterProps {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
}

export const RadialMeter: React.FC<RadialMeterProps> = ({ value, size = 140, color = colors.accentOrange, label }) => {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radii.pill,
        borderWidth: 8,
        borderColor: colors.surface2,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: radii.pill,
          borderWidth: 8,
          borderColor: color,
          opacity: 0.25 + Math.min(Math.max(value, 0), 1) * 0.75,
        }}
      />
      <Text style={{ color: colors.textPrimary, ...typography.h2 }}>{Math.round(value * 100)}</Text>
      {label ? <Text style={{ color: colors.textSecondary, ...typography.caption }}>{label}</Text> : null}
    </View>
  );
};
