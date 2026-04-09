# SKILL: Streak Engine
> TwinFit — State machine, freeze logic, timezone handling

## Streak Service (services/streak.ts)
```ts
import { supabase } from "./supabase";
import { format, subDays } from "date-fns";

export async function logSession(userId: string, duoId: string, photoUrl: string) {
  const localDate = format(new Date(), "yyyy-MM-dd");

  const { error } = await supabase.from("sessions").insert({
    user_id: userId, duo_id: duoId, photo_url: photoUrl, logged_date: localDate,
  });

  if (error?.code === "23505") throw new Error("Already logged today");
  if (error) throw error;

  await supabase.functions.invoke("streak-update", { body: { duo_id: duoId } });
}

export async function getStreakHistory(duoId: string, days = 7) {
  const endDate = new Date();
  const startDate = subDays(endDate, days - 1);

  const { data: sessions } = await supabase
    .from("sessions").select("user_id, logged_date").eq("duo_id", duoId)
    .gte("logged_date", format(startDate, "yyyy-MM-dd"));

  const { data: duo } = await supabase.from("duos").select("user_a_id, user_b_id").eq("id", duoId).single();

  return Array.from({ length: days }, (_, i) => {
    const date = format(subDays(endDate, days - 1 - i), "yyyy-MM-dd");
    const daySessions = sessions?.filter(s => s.logged_date === date) ?? [];
    return {
      date,
      user_a_logged: daySessions.some(s => s.user_id === duo?.user_a_id),
      user_b_logged: daySessions.some(s => s.user_id === duo?.user_b_id),
      both_logged: daySessions.length >= 2,
    };
  });
}
```
