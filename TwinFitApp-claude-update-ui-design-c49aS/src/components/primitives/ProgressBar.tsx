import React from "react";
import { View } from "react-native";
import { colors, radii } from "../../theme/tokens";

export interface ProgressBarProps {
  value: number;
  height?: number;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, height = 8, color = colors.accentOrange }) => {
  return (
    <View style={{ height, backgroundColor: colors.surface2, borderRadius: radii.pill, overflow: "hidden" }}>
      <View style={{ width: `${Math.min(Math.max(value, 0), 1) * 100}%`, height, backgroundColor: color }} />
    </View>
  );
};
