import React, { useEffect, useRef, memo } from "react";
import { Animated, StyleSheet, Text, View, TextStyle } from "react-native";

// ─── Single rolling digit ────────────────────────────────────────────────────

interface DigitProps {
  digit: string;
  fontSize: number;
  color: string;
  fontFamily?: string;
}

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

const RollingDigit = memo(({ digit, fontSize, color, fontFamily }: DigitProps) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const lineHeight = fontSize * 1.1;

  const targetIndex = isNaN(Number(digit)) ? -1 : Number(digit);

  useEffect(() => {
    if (targetIndex < 0) return;
    Animated.spring(translateY, {
      toValue: -targetIndex * lineHeight,
      useNativeDriver: true,
      damping: 14,
      stiffness: 120,
      mass: 0.8,
    }).start();
  }, [targetIndex, lineHeight]);

  // Non-numeric character (comma, dot, space) — render static
  if (targetIndex < 0) {
    return (
      <Text style={{ fontSize, color, fontFamily, lineHeight }}>{digit}</Text>
    );
  }

  return (
    <View style={{ height: lineHeight, overflow: "hidden" }}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        {DIGITS.map((d) => (
          <Text key={d} style={{ fontSize, color, fontFamily, lineHeight, height: lineHeight }}>
            {d}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
});

// ─── Counter ─────────────────────────────────────────────────────────────────

interface CounterProps {
  value: number;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  /** Optional suffix like "kcal", "g", "%" rendered as plain text */
  suffix?: string;
  /** Optional prefix like "$" */
  prefix?: string;
  style?: TextStyle;
  /** Format with locale commas e.g. 1,234 */
  formatWithCommas?: boolean;
}

export const Counter: React.FC<CounterProps> = ({
  value,
  fontSize = 48,
  color = "#FF5E1A",
  fontFamily,
  suffix,
  prefix,
  formatWithCommas = false,
}) => {
  const str = formatWithCommas
    ? Math.round(value).toLocaleString()
    : String(Math.round(value));

  const chars = [...(prefix ?? ""), ...str.split(""), ...(suffix ? [" ", ...suffix.split("")] : [])];

  return (
    <View style={styles.row}>
      {chars.map((ch, i) => (
        <RollingDigit key={i} digit={ch} fontSize={fontSize} color={color} fontFamily={fontFamily} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
});
