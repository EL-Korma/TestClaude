import React, { useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { Camera, CameraView } from "expo-camera";
import { colors, radii, shadows, typography } from "../../../theme/tokens";
import { checkInsApi } from "../../../services/api";
import { useDumbbells } from "../../../store/DumbbellStore";

export const CheckInCameraScreen = () => {
  const navigation = useNavigation<any>();
  const { earn } = useDumbbells();

  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [facing, setFacing] = useState<"front" | "back">("front");
  const [capturing, setCapturing] = useState(false);
  const [done, setDone] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const flashAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  const flashScreen = () => {
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    flashScreen();
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.6, base64: false });
      const photoUrl = photo?.uri ?? "placeholder://checkin";

      // POST check-in (groupId is optional for now — null means personal check-in)
      await checkInsApi.create("", photoUrl);

      // Reward 15 dumbbells for check-in
      earn(15);

      // Success animation
      Animated.spring(checkAnim, { toValue: 1, useNativeDriver: true, damping: 10 }).start();
      setDone(true);
      setTimeout(() => navigation.goBack(), 2000);
    } catch (e: any) {
      Alert.alert("Check-in failed", e.message ?? "Could not save check-in.");
      setCapturing(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.permText}>Camera access needed for check-in.</Text>
        <Pressable style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>GRANT ACCESS</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        {/* Flash overlay */}
        <Animated.View style={[styles.flashOverlay, { opacity: flashAnim }]} />

        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
            <Text style={styles.headerTitle}>GYM CHECK-IN</Text>
            <Pressable
              style={styles.flipBtn}
              onPress={() => setFacing((f) => f === "front" ? "back" : "front")}
            >
              <Text style={{ fontSize: 20 }}>🔄</Text>
            </Pressable>
          </View>

          {/* Viewfinder frame */}
          <View style={styles.frameContainer}>
            <View style={[styles.frameCorner, styles.frameCornerTL]} />
            <View style={[styles.frameCorner, styles.frameCornerTR]} />
            <View style={[styles.frameCorner, styles.frameCornerBL]} />
            <View style={[styles.frameCorner, styles.frameCornerBR]} />
          </View>

          {/* Bottom controls */}
          <View style={styles.controls}>
            {done ? (
              <Animated.View style={[styles.doneBox, { transform: [{ scale: checkAnim }] }]}>
                <Text style={styles.doneIcon}>✓</Text>
                <Text style={styles.doneText}>CHECK-IN SAVED!</Text>
                <Text style={styles.doneReward}>+🏋️ 15</Text>
              </Animated.View>
            ) : (
              <>
                <Text style={styles.hint}>Frame your face and tap to check in</Text>
                <Pressable
                  style={[styles.captureBtn, capturing && { opacity: 0.6 }]}
                  onPress={handleCapture}
                  disabled={capturing}
                >
                  <LinearGradient
                    colors={["#FF5E1A", "#FF8C42"]}
                    style={styles.captureBtnInner}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {capturing
                      ? <ActivityIndicator color="#fff" size="large" />
                      : <Text style={{ fontSize: 32 }}>📸</Text>}
                  </LinearGradient>
                </Pressable>
                <Text style={styles.hintSub}>+🏋️ 15 dumbbells for checking in</Text>
              </>
            )}
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  camera: { flex: 1 },
  safeArea: { flex: 1, justifyContent: "space-between" },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fff",
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center", justifyContent: "center",
  },
  closeBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  headerTitle: {
    fontFamily: typography.displayFont,
    fontSize: 18,
    letterSpacing: 2,
    color: "#fff",
  },
  flipBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center", justifyContent: "center",
  },
  frameContainer: {
    alignSelf: "center",
    width: 240,
    height: 300,
    position: "relative",
  },
  frameCorner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: colors.primary,
    borderWidth: 3,
  },
  frameCornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  frameCornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  frameCornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  frameCornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  controls: {
    alignItems: "center",
    paddingBottom: 32,
    gap: 16,
  },
  hint: {
    fontFamily: typography.bodyFont,
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  hintSub: {
    fontFamily: typography.bodyFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    ...shadows.orangeGlow,
  },
  captureBtnInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  doneBox: {
    alignItems: "center",
    gap: 8,
  },
  doneIcon: {
    fontSize: 64,
    color: colors.success,
  },
  doneText: {
    fontFamily: typography.displayFont,
    fontSize: 28,
    letterSpacing: 2,
    color: colors.textPrimary,
  },
  doneReward: {
    fontFamily: typography.displayFont,
    fontSize: 22,
    color: colors.primary,
  },
  permText: {
    fontFamily: typography.bodyFont,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 32,
  },
  permBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
  },
  permBtnText: {
    fontFamily: typography.displayFont,
    fontSize: 18,
    letterSpacing: 2,
    color: "#fff",
  },
});
