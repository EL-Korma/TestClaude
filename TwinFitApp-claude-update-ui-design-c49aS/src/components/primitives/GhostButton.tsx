import React from "react";
import { Pressable, Text, View } from "react-native";
import { colors, radii, typography } from "../../theme/tokens";
import { IconSource } from "./PillButton";
import { Icon } from "./Icon";

export interface GhostButtonProps {
  label: string;
  onPress: () => void;
  iconLeft?: IconSource;
  disabled?: boolean;
}

export const GhostButton: React.FC<GhostButtonProps> = ({ label, onPress, iconLeft, disabled = false }) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        height: 50,
        paddingHorizontal: 20,
        borderRadius: radii.pill,
        backgroundColor: colors.surface2,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed || disabled ? 0.7 : 1,
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {iconLeft ? <Icon name={iconLeft.name} size={iconLeft.size || 18} color={iconLeft.color || colors.textPrimary} /> : null}
        <Text style={{ color: colors.textPrimary, ...typography.body }}>{label}</Text>
      </View>
    </Pressable>
  );
};
