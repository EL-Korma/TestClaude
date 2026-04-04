import React from "react";
import { Pressable } from "react-native";
import { colors, radii } from "../../theme/tokens";
import { IconSource } from "./PillButton";
import { Icon } from "./Icon";

export interface IconButtonProps {
  icon: IconSource;
  onPress: () => void;
  size?: number;
  bg?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, onPress, size = 44, bg = colors.surface2 }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: radii.pill,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Icon name={icon.name} size={icon.size || 18} color={icon.color || colors.textPrimary} />
    </Pressable>
  );
};
