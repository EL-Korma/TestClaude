import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { colors } from "../../theme/tokens";

export type StreakLevel = 1 | 2 | 3 | 4;

export interface StreakBorderProps {
  level: StreakLevel;
  animated?: boolean;
  size?: number;
}

export const StreakBorder: React.FC<StreakBorderProps> = ({ level, animated = true, size = 66 }) => {
  const rotate = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;
    if (level >= 4) {
      Animated.loop(
        Animated.timing(rotate, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
        })
      ).start();
    }
    if (level >= 3) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 1200, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [animated, level, pulse, rotate]);

  const borderColor =
    level === 1
      ? colors.surface2
      : level === 2
      ? colors.accentOrange
      : level === 3
      ? colors.accentBlue
      : colors.accentGreen;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: level === 1 ? 2 : 3,
          borderColor,
        }}
      />
      {level >= 3 ? (
        <Animated.View
          style={{
            position: "absolute",
            width: size + 6,
            height: size + 6,
            borderRadius: (size + 6) / 2,
            borderWidth: 1,
            borderColor: level === 3 ? colors.accentBlue : colors.accentGreen,
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.6] }),
            transform: [
              { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) },
              { rotate: rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) },
            ],
          }}
        />
      ) : null}
      {level >= 4 ? (
        <Animated.View
          style={{
            position: "absolute",
            width: size + 10,
            height: size + 10,
            borderRadius: (size + 10) / 2,
            borderWidth: 1,
            borderColor: colors.accentBlue,
            opacity: 0.4,
            transform: [
              { rotate: rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) },
            ],
          }}
        />
      ) : null}
    </View>
  );
};
