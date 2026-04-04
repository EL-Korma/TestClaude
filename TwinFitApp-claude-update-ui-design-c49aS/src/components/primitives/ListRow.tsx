import React from "react";
import { Pressable, Text, View } from "react-native";
import { colors, radii, typography } from "../../theme/tokens";
import { IconSource } from "./PillButton";
import { Icon } from "./Icon";

export interface ListRowProps {
  title: string;
  subtitle?: string;
  iconLeft?: IconSource;
  right?: React.ReactNode;
  onPress?: () => void;
}

export const ListRow: React.FC<ListRowProps> = ({ title, subtitle, iconLeft, right, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        height: 58,
        paddingHorizontal: 14,
        borderRadius: radii.md,
        backgroundColor: colors.surface1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
        {iconLeft ? <Icon name={iconLeft.name} size={18} color={colors.textSecondary} /> : null}
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textPrimary, ...typography.body }}>{title}</Text>
          {subtitle ? <Text style={{ color: colors.textSecondary, ...typography.caption }}>{subtitle}</Text> : null}
        </View>
      </View>
      {right ? <View>{right}</View> : <Icon name="chevron-right" size={18} color={colors.textMuted} />}
    </Pressable>
  );
};
