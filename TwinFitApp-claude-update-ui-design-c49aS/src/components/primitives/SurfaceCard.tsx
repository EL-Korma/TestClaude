import React from "react";
import { View, ViewStyle } from "react-native";
import { colors, radii, shadows } from "../../theme/tokens";

export type SurfaceVariant = "surface-0" | "surface-1" | "surface-2";

export interface SurfaceCardProps {
  children: React.ReactNode;
  variant?: SurfaceVariant;
  radius?: number;
  padding?: number;
  glow?: boolean;
  style?: ViewStyle;
}

const surfaceMap: Record<SurfaceVariant, string> = {
  "surface-0": colors.surface0,
  "surface-1": colors.surface1,
  "surface-2": colors.surface2,
};

export const SurfaceCard: React.FC<SurfaceCardProps> = ({
  children,
  variant = "surface-1",
  radius = radii.lg,
  padding = 16,
  glow = false,
  style,
}) => {
  const cardStyle: ViewStyle = {
    backgroundColor: surfaceMap[variant],
    borderRadius: radius,
    padding,
    ...shadows.soft,
  };

  return (
    <View style={[cardStyle, glow && { borderWidth: 1, borderColor: colors.accentOrange }, style]}>
      {children}
    </View>
  );
};
