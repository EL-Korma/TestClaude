# SKILL: Supabase Edge Functions
> TwinFit — AI proxy, streak calculation, notifications

## Function: streak-update
```ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { duo_id } = await req.json();
  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

  const today = new Date().toISOString().split("T")[0];
  const { data: sessions } = await supabase.from("sessions").select("user_id").eq("duo_id", duo_id).eq("logged_date", today);
  const { data: duo } = await supabase.from("duos").select("*").eq("id", duo_id).single();

  if (sessions?.length === 2) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const { data: ySessions } = await supabase.from("sessions").select("user_id").eq("duo_id", duo_id).eq("logged_date", yesterday);
    const hadStreak = ySessions?.length === 2;
    const newStreak = hadStreak ? duo.current_streak + 1 : 1;
    await supabase.from("duos").update({
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, duo.longest_streak),
      total_sessions: duo.total_sessions + 1,
      last_activity_date: today,
    }).eq("id", duo_id);
  }

  return new Response("ok");
});
```

## Deploy
```bash
supabase functions deploy streak-update
supabase functions deploy ai-recipe
supabase functions deploy ai-meal-scan
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```
