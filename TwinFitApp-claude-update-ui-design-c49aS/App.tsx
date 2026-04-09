import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { View, ActivityIndicator } from "react-native";
import { RootNavigator } from "./src/app/navigation/RootNavigator";
import { colors } from "./src/theme/tokens";
import { ClickSpark } from "./src/components/primitives/ClickSpark";
import { DumbbellProvider } from "./src/store/DumbbellStore";
import { AuthProvider } from "./src/store/AuthStore";
import { ErrorBoundary } from "./src/components/ErrorBoundary";

const App = () => {
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <DumbbellProvider>
          <SafeAreaProvider>
            <NavigationContainer>
              <StatusBar style="light" backgroundColor={colors.bg} />
              <ClickSpark sparkColor="#FF5E1A" sparkCount={8} sparkRadius={44} sparkSize={4} duration={480}>
                <ErrorBoundary>
                  <RootNavigator />
                </ErrorBoundary>
              </ClickSpark>
            </NavigationContainer>
          </SafeAreaProvider>
        </DumbbellProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
