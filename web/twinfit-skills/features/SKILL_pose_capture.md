# SKILL: Pose Capture
> TwinFit — Expo Camera, pose overlay, upload + log flow

## Log Screen Core
```tsx
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import * as Haptics from "expo-haptics";

export default function LogScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [capturing, setCapturing] = useState(false);

  async function handleCapture() {
    if (capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      const photoUrl = await uploadPosePhoto(user.id, photo.uri);
      await logSession(user.id, duo.id, photoUrl);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(app)/home");
    } catch (err) {
      showToast(err.message);
    } finally {
      setCapturing(false);
    }
  }

  if (!permission?.granted) {
    return <PermissionRequest onRequest={requestPermission} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <DuoStatusBar />
      <CameraView ref={cameraRef} style={styles.camera} facing="front">
        <PoseOverlay />
        <ScanLine />
        <CornerBrackets />
      </CameraView>
      <CaptureBar onCapture={handleCapture} loading={capturing} />
    </View>
  );
}
```

## Animated Scan Line
```tsx
function ScanLine() {
  const y = useSharedValue(0);
  useEffect(() => { y.value = withRepeat(withTiming(1, { duration: 2500 }), -1, false); }, []);
  const style = useAnimatedStyle(() => ({ top: (10 + y.value * 75) + "%" }));
  return <Animated.View style={[styles.scanLine, style]} />;
}
```
