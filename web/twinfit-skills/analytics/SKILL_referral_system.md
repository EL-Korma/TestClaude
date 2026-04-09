# SKILL: Referral System
> TwinFit — Partner invite as viral growth loop

## How It Works
```
1. User A signs up → gets invite code: TF8X2A
2. User A shares: twinfit.app/invite/TF8X2A
3. User B taps → App Store install
4. User B opens app → code pre-filled
5. Both auto-connected as duo
6. Track referrer = User A, referred = User B
```

## Share Invite
```ts
export async function shareInvite(user: UserProfile) {
  const link = "https://twinfit.app/invite/" + user.invite_code;
  await Share.share({
    title: "Train with me on TwinFit",
    message: "Join me on TwinFit! Use my invite code: " + user.invite_code + "\n" + link,
    url: link,
  });
  analytics.track("invite_shared", { user_id: user.id, method: "share_sheet" });
}
```

## Track Attribution in DB
```sql
ALTER TABLE public.users
  ADD COLUMN referred_by_code TEXT,
  ADD COLUMN referred_by_user_id UUID REFERENCES public.users(id);
```

## Viral Metrics
```
K-factor = avg invites sent per referred user
Target K-factor > 0.5

Track:
  invite_shared events / day
  Link click → install conversion (via Branch or Firebase)
  Referred user D7 retention (usually higher than organic)
```
