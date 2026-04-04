import React from "react";
import { Image, Text, View } from "react-native";
import { colors, sizes, typography } from "../../theme/tokens";
import { StreakBorder, StreakLevel } from "./StreakBorder";

export interface AvatarProps {
  size?: number;
  uri?: string;
  fallback?: string;
  streakLevel?: StreakLevel;
}

export const Avatar: React.FC<AvatarProps> = ({ size = sizes.avatar, uri, fallback = "A", streakLevel = 1 }) => {
  const borderSize = size + 6;
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <View style={{ position: "absolute" }}>
        <StreakBorder level={streakLevel} size={borderSize} />
      </View>
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surface2, overflow: "hidden" }}>
        {uri ? (
          <Image source={{ uri }} style={{ width: size, height: size }} />
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: colors.textPrimary, ...typography.h3 }}>{fallback}</Text>
          </View>
        )}
      </View>
    </View>
  );
};
