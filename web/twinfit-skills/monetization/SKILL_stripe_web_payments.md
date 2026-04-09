# SKILL: Stripe Web Payments
> TwinFit — Web checkout for landing page purchases

## When to Use
- RevenueCat: iOS App Store + Google Play (mobile in-app purchases)
- Stripe: Web landing page purchases, gifted subs, B2B

## Checkout API (web/pages/api/checkout.ts)
```ts
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { plan, userId, email } = req.body;
  const priceId = plan === "annual" ? process.env.STRIPE_ANNUAL_PRICE_ID : process.env.STRIPE_MONTHLY_PRICE_ID;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: "https://twinfit.app/success?session_id={CHECKOUT_SESSION_ID}&userId=" + userId,
    cancel_url: "https://twinfit.app/pricing",
    metadata: { userId },
  });

  res.json({ url: session.url });
}
```

## Webhook Handler
```ts
export default async function handler(req, res) {
  const event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);

  if (["customer.subscription.created", "customer.subscription.updated"].includes(event.type)) {
    const sub = event.data.object;
    await supabase.from("users").update({ is_premium: sub.status === "active" }).eq("id", sub.metadata.userId);
  }

  res.json({ received: true });
}
```
