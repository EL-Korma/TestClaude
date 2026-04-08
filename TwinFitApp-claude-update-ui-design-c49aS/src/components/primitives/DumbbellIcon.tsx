import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View, ViewStyle } from "react-native";

interface DumbbellIconProps {
  size?: number;
  glow?: boolean;
  pulse?: boolean;
  style?: ViewStyle;
}

export const DumbbellIcon: React.FC<DumbbellIconProps> = ({
  size = 28,
  glow = true,
  pulse = false,
  style,
}) => {
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (glow) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
        ])
      ).start();
    }
    if (pulse) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.18, duration: 700, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 0.92, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    }
  }, []);

  return (
    <View style={[styles.wrapper, style]}>
      {glow && (
        <Animated.View
          style={[
            styles.glow,
            {
              width: size * 1.8,
              height: size * 1.8,
              borderRadius: (size * 1.8) / 2,
              opacity: glowAnim,
            },
          ]}
        />
      )}
      <Animated.Text
        style={{
          fontSize: size,
          transform: [{ scale: pulse ? scaleAnim : 1 }],
          // Dark tint to make it feel "obsidian black-orange"
          textShadowColor: "#FF5E1A",
          textShadowRadius: 8,
          textShadowOffset: { width: 0, height: 0 },
        }}
      >
        🏋️
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  glow: {
    position: "absolute",
    backgroundColor: "#FF5E1A",
  },
});
