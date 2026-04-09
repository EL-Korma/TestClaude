# SKILL: Engagement Loops
> TwinFit — Milestone push, weekly summary, re-engagement

## Milestone Celebrations
```ts
const MILESTONES = [7, 14, 30, 50, 100, 200];

const MILESTONE_COPY: Record<number, { title: string; body: string }> = {
  7:   { title: "🔥 1 Week Streak!", body: "7 days strong. You two are just warming up." },
  14:  { title: "⚡ 2 Week Streak!", body: "14 days of showing up together. Real dedication." },
  30:  { title: "🏆 30 Day Streak!", body: "One month. Bronze is just the beginning." },
  50:  { title: "💫 50 Days!", body: "Silver tier is yours. Keep evolving." },
  100: { title: "👑 100 Day Streak!", body: "You are a duo legend." },
};

export async function checkMilestones(duoId: string, newStreak: number) {
  if (!MILESTONES.includes(newStreak)) return;
  const copy = MILESTONE_COPY[newStreak] ?? { title: newStreak + " Day Streak!", body: "Keep going!" };
  const { data: duo } = await supabase.from("duos")
    .select("user_a:users!user_a_id(push_token), user_b:users!user_b_id(push_token)")
    .eq("id", duoId).single();

  await Promise.all([
    sendPushNotification(duo.user_a.push_token, copy.title, copy.body, { screen: "home" }),
    sendPushNotification(duo.user_b.push_token, copy.title, copy.body, { screen: "home" }),
  ]);
}
```

## Re-engagement (streak broken)
```ts
export async function sendReengagement(token: string) {
  await sendPushNotification(
    token,
    "💔 Your streak ended... but it's not over",
    "Start fresh today. Every legend falls — champions get back up.",
    { screen: "home" }
  );
}
```
