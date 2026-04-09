# SKILL: Landing Page
> TwinFit — Next.js, conversion optimized, SEO

## Stack
```bash
npx create-next-app@latest twinfit-web --typescript --tailwind --app
```

## Page Structure
```
/              Hero, features, how-it-works, pricing, FAQ
/pricing       Full pricing page
/invite/:code  Deep link → App Store redirect
/privacy       Privacy policy
/terms         Terms of service
```

## SEO Metadata
```ts
export const metadata = {
  title: "TwinFit – Couple Fitness Streak App",
  description: "Shared gym streak app for couples and best friends. Train together, log daily, evolve your pose. iOS and Android.",
  keywords: "couple fitness app,workout streak,gym partner,duo workout,streak tracker",
  openGraph: {
    title: "TwinFit – Train Together. Never Break the Streak.",
    description: "Log daily sessions with your partner. Keep your shared streak alive.",
    images: [{ url: "https://twinfit.app/og.png", width: 1200, height: 630 }],
  },
};
```

## Conversion Checklist
```
[ ] Hero with CTA above the fold (App Store + Play Store buttons)
[ ] Phone mockup showing real app screens
[ ] 3 core benefits with icons
[ ] How it works (3 steps max)
[ ] Pricing table with free vs premium
[ ] Social proof: rating + duo count
[ ] FAQ (5-7 questions)
[ ] Footer with Privacy, Terms, Support
```
