import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { colors, radii, sizes, typography } from "../../theme/tokens";
import { Icon, IconName } from "./Icon";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export interface IconSource {
  name: IconName;
  size?: number;
  color?: string;
}

export interface PillButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  iconLeft?: IconSource;
  iconRight?: IconSource;
  loading?: boolean;
  disabled?: boolean;
}

export const PillButton: React.FC<PillButtonProps> = ({
  label,
  onPress,
  variant = "primary",
  iconLeft,
  iconRight,
  loading = false,
  disabled = false,
}) => {
  const bg =
    variant === "primary"
      ? colors.accentOrange
      : variant === "secondary"
      ? colors.surface2
      : "transparent";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => ({
        height: sizes.buttonHeight,
        paddingHorizontal: 22,
        borderRadius: radii.pill,
        backgroundColor: bg,
        borderWidth: variant === "ghost" ? 1 : 0,
        borderColor: colors.surface2,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed || disabled ? 0.7 : 1,
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {iconLeft ? <Icon name={iconLeft.name} size={iconLeft.size || 18} color={iconLeft.color || colors.textPrimary} /> : null}
        {loading ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <Text style={{ color: colors.textPrimary, ...typography.body, fontWeight: "700" }}>{label}</Text>
        )}
        {iconRight ? <Icon name={iconRight.name} size={iconRight.size || 18} color={iconRight.color || colors.textPrimary} /> : null}
      </View>
    </Pressable>
  );
};
