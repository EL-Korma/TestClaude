# SKILL: Streak Reminder System
> TwinFit — Daily reminders, duo-aware, smart scheduling

## Schedule Daily Reminder
```ts
import * as Notifications from "expo-notifications";

export async function scheduleStreakReminder() {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🔥 Keep the streak alive!",
      body: "Log your session today to keep the streak going.",
      data: { screen: "log", type: "streak_reminder" },
    },
    trigger: { hour: 20, minute: 0, repeats: true },
  });
}

export async function cancelTodayReminderIfBothLogged(duoId: string) {
  const today = format(new Date(), "yyyy-MM-dd");
  const { data } = await supabase.from("sessions").select("user_id").eq("duo_id", duoId).eq("logged_date", today);
  if (data?.length === 2) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await scheduleStreakReminder();
  }
}
```

## Context-Aware Copy
```ts
async function buildReminderContent(userId: string, duoId: string) {
  const today = format(new Date(), "yyyy-MM-dd");
  const { data } = await supabase.from("sessions").select("user_id").eq("duo_id", duoId).eq("logged_date", today);
  const partnerLogged = data?.some(s => s.user_id !== userId);

  if (partnerLogged) {
    return { title: "⏳ Your partner is waiting!", body: "They already logged today. Your turn!" };
  }
  return { title: "🔥 Don't break the streak!", body: "Neither of you has logged today. Go!" };
}
```
