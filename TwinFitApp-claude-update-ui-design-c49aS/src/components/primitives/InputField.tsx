import React from "react";
import { Text, TextInput, View } from "react-native";
import { colors, radii, sizes, typography } from "../../theme/tokens";
import { IconSource } from "./PillButton";
import { Icon } from "./Icon";

export interface InputFieldProps {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  iconLeft?: IconSource;
  iconRight?: IconSource;
  secure?: boolean;
  error?: string;
  helperText?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  iconLeft,
  iconRight,
  secure = false,
  error,
  helperText,
}) => {
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={{ color: colors.textSecondary, ...typography.bodySm }}>{label}</Text> : null}
      <View
        style={{
          height: sizes.inputHeight,
          borderRadius: radii.md,
          backgroundColor: colors.surface1,
          paddingHorizontal: 16,
          borderWidth: error ? 1 : 0,
          borderColor: error ? colors.accentRed : "transparent",
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        {iconLeft ? <Icon name={iconLeft.name} size={18} color={colors.textSecondary} /> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secure}
          style={{ flex: 1, color: colors.textPrimary, ...typography.body }}
        />
        {iconRight ? <Icon name={iconRight.name} size={18} color={colors.textSecondary} /> : null}
      </View>
      {error ? <Text style={{ color: colors.accentRed, ...typography.caption }}>{error}</Text> : null}
      {helperText ? <Text style={{ color: colors.textSecondary, ...typography.caption }}>{helperText}</Text> : null}
    </View>
  );
};
