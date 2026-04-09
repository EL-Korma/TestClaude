/**
 * Expo Push Notifications service
 * - Registers device for push notifications
 * - Saves push token to backend so server can send alerts
 * - Handles foreground notification display
 */
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { apiFetch } from "./api";

// Show notifications even when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register this device for push notifications.
 * Saves the Expo push token to the backend.
 * Call once after login.
 */
export async function registerPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    // Simulators can't receive push notifications
    return null;
  }

  // Request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return null;

  // Android channel setup
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "TwinFit",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF5E1A",
    });
    await Notifications.setNotificationChannelAsync("streak", {
      name: "Streak Alerts",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500, 200, 500],
      lightColor: "#FF5E1A",
    });
  }

  // Get Expo push token
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: "twinfitapp", // matches slug in app.config.ts
  });
  const token = tokenData.data;

  // Save to backend
  try {
    await apiFetch("/me/push-token", { method: "POST", body: { token } });
  } catch {
    // Non-critical — app still works without push
  }

  return token;
}

/**
 * Schedule a local notification (for streak reminders etc.)
 */
export async function scheduleStreakReminder(streakDays: number) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Fire at 8PM every day
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `🔥 ${streakDays}-day streak at risk!`,
      body: "Don't break the chain — log your session now.",
      data: { screen: "Log" },
    },
    trigger: {
      hour: 20,
      minute: 0,
      repeats: true,
    } as any,
  });
}

/**
 * Clear the app badge count
 */
export async function clearBadge() {
  await Notifications.setBadgeCountAsync(0);
}
