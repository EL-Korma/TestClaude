import React from "react";
import { Pressable, Text, View } from "react-native";
import { colors, radii, typography } from "../../theme/tokens";

export interface SegmentedControlOption {
  label: string;
  value: string;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, value, onChange }) => {
  return (
    <View style={{ height: 40, borderRadius: radii.pill, backgroundColor: colors.surface2, flexDirection: "row" }}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={{
              flex: 1,
              margin: 4,
              borderRadius: radii.pill,
              backgroundColor: active ? colors.accentOrange : "transparent",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: colors.textPrimary, ...typography.caption }}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};
