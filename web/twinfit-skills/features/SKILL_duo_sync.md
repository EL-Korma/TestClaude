# SKILL: Duo Sync
> TwinFit — Real-time partner status, push on partner log

## Fetch Duo With Users
```ts
export async function fetchDuoWithUsers(duoId: string) {
  const { data, error } = await supabase
    .from("duos")
    .select("*, user_a:users!user_a_id(*), user_b:users!user_b_id(*)")
    .eq("id", duoId).single();
  if (error) throw error;
  return data;
}

export async function fetchTodayStatus(duoId: string) {
  const today = format(new Date(), "yyyy-MM-dd");
  const { data } = await supabase
    .from("sessions").select("user_id").eq("duo_id", duoId).eq("logged_date", today);
  return data ?? [];
}
```

## Duo Status Bar Component
```tsx
export function DuoStatusBar() {
  const { duo, realtimeStatus } = useDuoStore();
  const { user } = useAuthStore();
  const isUserA = duo?.user_a_id === user?.id;
  const partner = isUserA ? duo?.user_b : duo?.user_a;
  const myLogged = isUserA ? realtimeStatus?.user_a_logged_today : realtimeStatus?.user_b_logged_today;
  const partnerLogged = isUserA ? realtimeStatus?.user_b_logged_today : realtimeStatus?.user_a_logged_today;

  return (
    <View style={styles.row}>
      <StatusPip name="You" logged={myLogged ?? false} />
      <ConnectorLine done={myLogged && partnerLogged} />
      <StatusPip name={partner?.name ?? "Partner"} logged={partnerLogged ?? false} />
    </View>
  );
}
```
