import React from "react";
import { Text, View } from "react-native";
import { colors, typography } from "../../theme/tokens";
import { PillButton } from "../primitives";

export interface CheckInCTAProps {
  label?: string;
  onPress: () => void;
}

export const CheckInCTA: React.FC<CheckInCTAProps> = ({ label = "Check in at the gym", onPress }) => {
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: colors.textSecondary, ...typography.bodySm }}>Primary Action</Text>
      <PillButton label={label} onPress={onPress} iconLeft={{ name: "camera" }} />
    </View>
  );
};
