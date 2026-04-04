import React from "react";
import { Text, View } from "react-native";
import { colors, radii, typography } from "../../theme/tokens";

export interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
}

export const OTPInput: React.FC<OTPInputProps> = ({ length = 4, value }) => {
  const cells = Array.from({ length }).map((_, i) => value[i] || "");
  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      {cells.map((cell, index) => (
        <View
          key={`otp-${index}`}
          style={{
            width: 44,
            height: 52,
            borderRadius: radii.md,
            backgroundColor: colors.surface1,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: cell ? 1 : 0,
            borderColor: colors.accentOrange,
          }}
        >
          <Text style={{ color: colors.textPrimary, ...typography.h3 }}>{cell}</Text>
        </View>
      ))}
    </View>
  );
};
