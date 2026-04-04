import React from "react";
import { View, ViewStyle } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/tokens";

export interface AppScreenProps {
  children: React.ReactNode;
  bg?: string;
  padH?: number;
  padV?: number;
  statusBarStyle?: "light-content" | "dark-content";
  style?: ViewStyle;
}

export const AppScreen: React.FC<AppScreenProps> = ({
  children,
  bg = colors.bg,
  padH = 20,
  padV = 0,
  statusBarStyle = "light-content",
  style,
}) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar style={statusBarStyle === "light-content" ? "light" : "dark"} />
      <View
        style={[
          { flex: 1, paddingHorizontal: padH, paddingVertical: padV },
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
};
