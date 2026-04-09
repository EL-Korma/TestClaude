# SKILL: Subscription Paywall
> TwinFit — Paywall screen, feature comparison, purchase flow

## Paywall Screen Key Parts
```tsx
const PREMIUM_FEATURES = [
  "Everything in Free",
  "Ad-free experience",
  "Streak freeze (2x/month)",
  "Silver + Gold evolution",
  "Unlimited session history",
  "Unlimited AI recipes",
  "Unlimited meal scans",
];

export default function PaywallScreen() {
  const [plan, setPlan] = useState<"monthly"|"annual">("annual");
  const [loading, setLoading] = useState(false);

  async function handlePurchase() {
    setLoading(true);
    try {
      const ok = await purchasePremium();
      if (ok) {
        await supabase.from("users").update({ is_premium: true }).eq("id", user.id);
        router.back();
      }
    } catch (err) {
      if (!err.userCancelled) showToast("Purchase failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView>
      <Text style={styles.title}>GO PREMIUM 👑</Text>
      <PlanToggle plan={plan} onSelect={setPlan} />
      {PREMIUM_FEATURES.map(f => <FeatureRow key={f} label={f} />)}
      <Button
        label={"START PREMIUM — " + (plan === "annual" ? "$34.99/yr" : "$4.99/mo")}
        onPress={handlePurchase}
        loading={loading}
      />
      <TouchableOpacity onPress={restorePurchases}>
        <Text style={styles.restore}>Restore purchases</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
```

## Premium Feature Gate Component
```tsx
export function PremiumGate({ children, feature }) {
  const { isPremium, requirePremium } = usePremiumGate();
  if (isPremium) return children;
  return (
    <TouchableOpacity onPress={() => requirePremium(() => {})} style={styles.locked}>
      {children}
      <View style={styles.overlay}>
        <Text>🔒 Premium</Text>
      </View>
    </TouchableOpacity>
  );
}
```
