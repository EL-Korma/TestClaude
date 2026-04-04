import React from "react";
import { Feather } from "@expo/vector-icons";

export type IconName = keyof typeof Feather.glyphMap;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 18, color = "#FFFFFF" }) => {
  return <Feather name={name} size={size} color={color} />;
};
