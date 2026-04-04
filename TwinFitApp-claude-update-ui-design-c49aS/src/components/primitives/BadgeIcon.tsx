import React from "react";
import { View } from "react-native";
import { colors } from "../../theme/tokens";
import { IconSource } from "./PillButton";
import { Icon } from "./Icon";

export interface BadgeIconProps {
  icon: IconSource;
  size?: number;
  accent?: string;
}

export const BadgeIcon: React.FC<BadgeIconProps> = ({ icon, size = 20, accent = colors.accentOrange }) => {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.surface2,
        borderWidth: 1,
        borderColor: accent,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon name={icon.name} size={10} color={accent} />
    </View>
  );
};
