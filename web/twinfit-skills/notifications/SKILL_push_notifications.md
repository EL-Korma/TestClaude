# SKILL: Push Notifications
> TwinFit — Expo Notifications, APNs/FCM, deep link routing

## Setup
```bash
npx expo install expo-notifications expo-device expo-constants
```

## Register Device (services/notifications.ts)
```ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications(userId: string): Promise<string | null> {
  if (!Device.isDevice) return null;
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return null;

  const token = (await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  })).data;

  await supabase.from("users").update({ push_token: token }).eq("id", userId);
  return token;
}
```

## Notification Templates
```ts
export const NOTIFS = {
  partnerLogged: (name: string) => ({
    title: "🔥 " + name + " just logged their session!",
    body: "Don't break the streak — your turn now!",
    data: { screen: "log" },
  }),
  streakAtRisk: (streak: number) => ({
    title: "⚠️ Your " + streak + "-day streak is at risk!",
    body: "Log before midnight to keep it alive.",
    data: { screen: "log" },
  }),
  evolutionUnlocked: (tier: string) => ({
    title: "🎉 You reached " + tier + "!",
    body: "Your duo pose has evolved. Check it out!",
    data: { screen: "evolution" },
  }),
};
```

## Handle Tap (deep link)
```ts
useEffect(() => {
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const screen = response.notification.request.content.data?.screen;
    if (screen) router.push("/(app)/" + screen);
  });
  return () => sub.remove();
}, []);
```
