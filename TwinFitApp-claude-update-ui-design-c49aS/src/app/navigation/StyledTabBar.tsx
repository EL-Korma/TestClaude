import React from "react";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, View, Text } from "react-native";
import { colors, radii, shadows, typography } from "../../theme/tokens";

type TabInfo = {
  icon: string;
  label: string;
};

const TAB_CONFIG: Record<string, TabInfo> = {
  Home: { icon: "⊞", label: "HOME" },
  Log: { icon: "📸", label: "LOG" },
  Evolve: { icon: "⭐", label: "EVOLVE" },
  Nutrition: { icon: "🥗", label: "FUEL" },
  Profile: { icon: "👤", label: "ME" },
};

export const StyledTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingBottom: 20,
        paddingTop: 8,
        backgroundColor: colors.bg,
      }}
    >
      <View
        style={{
          height: 68,
          borderRadius: radii.xl,
          backgroundColor: colors.surface1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          paddingHorizontal: 8,
          borderWidth: 1,
          borderColor: colors.surface2,
          ...shadows.card,
        }}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const isCenter = route.name === "Log";
          const config = TAB_CONFIG[route.name] ?? { icon: "○", label: route.name.toUpperCase() };

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (isCenter) {
            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: radii.pill,
                    backgroundColor: colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    ...shadows.orangeGlow,
                    marginTop: -20,
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{config.icon}</Text>
                </View>
                <Text
                  style={{
                    color: isFocused ? colors.primary : colors.textMuted,
                    fontSize: 9,
                    fontFamily: typography.bodyFont,
                    letterSpacing: 0.8,
                    marginTop: 2,
                  }}
                >
                  {config.label}
                </Text>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 6 }}
            >
              <Text style={{ fontSize: 20 }}>{config.icon}</Text>
              {isFocused && (
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: colors.primary,
                    marginTop: 4,
                  }}
                />
              )}
              {!isFocused && <View style={{ width: 4, height: 4, marginTop: 4 }} />}
              <Text
                style={{
                  color: isFocused ? colors.primary : colors.textMuted,
                  fontSize: 9,
                  fontFamily: typography.bodyFont,
                  letterSpacing: 0.8,
                  marginTop: 1,
                }}
              >
                {config.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
