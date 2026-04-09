# SKILL: Supabase Realtime
> TwinFit — Live duo sync when partner logs

## Enable Realtime
```sql
alter publication supabase_realtime add table public.sessions;
```

## Realtime Hook (hooks/useDuoRealtime.ts)
```ts
import { useEffect } from "react";
import { supabase } from "@services/supabase";
import { useDuoStore } from "@stores/duoStore";
import { format } from "date-fns";

export function useDuoRealtime() {
  const { duo, setRealtimeStatus } = useDuoStore();

  useEffect(() => {
    if (!duo?.id) return;
    const today = format(new Date(), "yyyy-MM-dd");

    const channel = supabase
      .channel("duo-" + duo.id + "-sessions")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "sessions",
        filter: "duo_id=eq." + duo.id,
      }, (payload) => {
        const session = payload.new;
        if (session.logged_date !== today) return;
        const isUserA = duo.user_a_id === session.user_id;
        setRealtimeStatus((prev) => ({
          duo_id: duo.id,
          user_a_logged_today: isUserA ? true : (prev?.user_a_logged_today ?? false),
          user_b_logged_today: !isUserA ? true : (prev?.user_b_logged_today ?? false),
          last_updated: new Date().toISOString(),
        }));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [duo?.id]);
}
```
