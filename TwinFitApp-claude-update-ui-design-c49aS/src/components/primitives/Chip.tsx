import React from "react";
import { Pressable, Text } from "react-native";
import { colors, radii, typography } from "../../theme/tokens";
import { IconSource } from "./PillButton";

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  iconLeft?: IconSource;
}

export const Chip: React.FC<ChipProps> = ({ label, selected = false, onPress, iconLeft }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        height: 32,
        paddingHorizontal: 14,
        borderRadius: radii.pill,
        backgroundColor: selected ? colors.accentOrange : colors.surface2,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 6,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      {iconLeft ? <Text style={{ color: colors.textPrimary }}>{iconLeft.name}</Text> : null}
      <Text style={{ color: colors.textPrimary, ...typography.caption }}>{label}</Text>
    </Pressable>
  );
};
