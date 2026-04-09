import React, { Component, ReactNode } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("[TwinFit ErrorBoundary]", error);
  }

  retry = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>⚠️</Text>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          {this.state.error?.message ?? "An unexpected error occurred."}
        </Text>
        <Pressable style={styles.btn} onPress={this.retry}>
          <Text style={styles.btnText}>TRY AGAIN</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: "#0A0A0A",
    alignItems: "center", justifyContent: "center", padding: 32,
  },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: {
    fontFamily: "BebasNeue_400Regular", fontSize: 28,
    letterSpacing: 2, color: "#fff", marginBottom: 12,
  },
  message: {
    fontFamily: "DMSans_400Regular", fontSize: 14,
    color: "#7A7570", textAlign: "center", lineHeight: 20, marginBottom: 32,
  },
  btn: {
    backgroundColor: "#FF5E1A", borderRadius: 14,
    paddingHorizontal: 32, paddingVertical: 14,
  },
  btnText: {
    fontFamily: "BebasNeue_400Regular", fontSize: 18,
    letterSpacing: 2, color: "#fff",
  },
});
