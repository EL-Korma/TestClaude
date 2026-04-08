import React, { useRef, useState, useCallback } from "react";
import { View, Animated, StyleSheet, GestureResponderEvent } from "react-native";

interface Spark {
  id: number;
  x: number;
  y: number;
  angle: number;
  anim: Animated.Value;
}

interface ClickSparkProps {
  children: React.ReactNode;
  sparkColor?: string;
  sparkCount?: number;
  sparkRadius?: number;
  sparkSize?: number;
  duration?: number;
}

export const ClickSpark: React.FC<ClickSparkProps> = ({
  children,
  sparkColor = "#FF5E1A",
  sparkCount = 8,
  sparkRadius = 44,
  sparkSize = 4,
  duration = 480,
}) => {
  const [sparks, setSparks] = useState<Spark[]>([]);
  const nextId = useRef(0);

  const triggerSpark = useCallback(
    (x: number, y: number) => {
      const baseId = nextId.current;
      nextId.current += sparkCount;

      const newSparks: Spark[] = Array.from({ length: sparkCount }, (_, i) => {
        const angle = (i / sparkCount) * 2 * Math.PI;
        const anim = new Animated.Value(0);
        const id = baseId + i;

        Animated.timing(anim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }).start(() => {
          setSparks((prev) => prev.filter((s) => s.id !== id));
        });

        return { id, x, y, angle, anim };
      });

      setSparks((prev) => [...prev, ...newSparks]);
    },
    [sparkCount, duration]
  );

  const onStartShouldSetResponder = useCallback(
    (e: GestureResponderEvent) => {
      triggerSpark(e.nativeEvent.pageX, e.nativeEvent.pageY);
      return false; // don't steal touch from children
    },
    [triggerSpark]
  );

  return (
    <View style={styles.wrapper} onStartShouldSetResponder={onStartShouldSetResponder}>
      {children}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {sparks.map((spark) => {
          const dx = Math.cos(spark.angle) * sparkRadius;
          const dy = Math.sin(spark.angle) * sparkRadius;

          const translateX = spark.anim.interpolate({
            inputRange: [0, 1],
            outputRange: [spark.x, spark.x + dx],
          });
          const translateY = spark.anim.interpolate({
            inputRange: [0, 1],
            outputRange: [spark.y, spark.y + dy],
          });
          const opacity = spark.anim.interpolate({
            inputRange: [0, 0.55, 1],
            outputRange: [1, 0.9, 0],
          });
          const scale = spark.anim.interpolate({
            inputRange: [0, 0.2, 1],
            outputRange: [0.3, 1.2, 0.6],
          });

          return (
            <Animated.View
              key={spark.id}
              style={[
                styles.spark,
                {
                  width: sparkSize,
                  height: sparkSize,
                  borderRadius: sparkSize / 2,
                  backgroundColor: sparkColor,
                  opacity,
                  transform: [{ translateX }, { translateY }, { scale }],
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  spark: {
    position: "absolute",
    left: 0,
    top: 0,
  },
});
