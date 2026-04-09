# SKILL: Partner Connect System
> TwinFit — Invite codes, deep links, duo linking

## Partner Connect Service (services/partner.ts)
```ts
export async function connectPartner(myUserId: string, partnerCode: string) {
  const { data: partner, error } = await supabase
    .from("users")
    .select("id, name, avatar, duo_id")
    .eq("invite_code", partnerCode.toUpperCase())
    .single();

  if (error || !partner) throw new Error("Partner code not found");
  if (partner.id === myUserId) throw new Error("You cannot connect with yourself");
  if (partner.duo_id) throw new Error("This user is already in a duo");

  const { data: duo } = await supabase
    .from("duos")
    .insert({ user_a_id: myUserId, user_b_id: partner.id, mode: "couple" })
    .select().single();

  await supabase.from("users")
    .update({ duo_id: duo.id })
    .in("id", [myUserId, partner.id]);

  return duo;
}
```

## Deep Link Handling
```ts
// Handle twinfit://invite/TF8X2A
import * as Linking from "expo-linking";

export function useDeepLinkInvite() {
  const router = useRouter();
  useEffect(() => {
    const sub = Linking.addEventListener("url", ({ url }) => {
      const parsed = Linking.parse(url);
      if (parsed.path === "invite" && parsed.queryParams?.code) {
        router.push({
          pathname: "/(auth)/signup",
          params: { partnerCode: parsed.queryParams.code },
        });
      }
    });
    return () => sub.remove();
  }, []);
}
```

## Share Invite
```ts
async function shareInviteCode(code: string) {
  await Share.share({
    message: "Join me on TwinFit! Use my code: " + code,
    url: "https://twinfit.app/invite/" + code,
  });
}
```
