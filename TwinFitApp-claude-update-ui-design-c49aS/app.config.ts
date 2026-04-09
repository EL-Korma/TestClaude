import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "TwinFit",
  slug: "twinfitapp",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#0A0A0A",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.twinfit.app",
    infoPlist: {
      NSMicrophoneUsageDescription: "TwinFit uses the microphone for voice meal scanning.",
      NSSpeechRecognitionUsageDescription: "TwinFit uses speech recognition to describe meals hands-free.",
      NSCameraUsageDescription: "TwinFit uses the camera for gym check-ins.",
      NSPhotoLibraryUsageDescription: "TwinFit accesses photos for check-in uploads.",
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0A0A0A",
    },
    package: "com.twinfit.app",
    softwareKeyboardLayoutMode: "pan",
    permissions: [
      "CAMERA",
      "RECORD_AUDIO",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
    ],
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-camera",
    "expo-image-picker",
    ["expo-font", { fonts: [] }],
    "expo-secure-store",
    "expo-speech-recognition",
    [
      "expo-notifications",
      {
        icon: "./assets/icon.png",
        color: "#FF5E1A",
        defaultChannel: "default",
        sounds: [],
      },
    ],
  ],
  extra: {
    // In dev: falls back to localhost. In production: set EXPO_PUBLIC_API_URL env var.
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/api",
  },
});
