import React from "react";
import { AppScreen, WelcomeCarousel } from "../../../components";
import { images } from "../../../assets/images";

export const WelcomeScreen = () => {
  return (
    <AppScreen>
      <WelcomeCarousel
        items={[
          {
            title: "Challenge each other. Stay consistent.",
            subtitle: "Your consistency is visible to your squad.",
            image: images.welcomeHero,
            cta: "Get Started",
          },
        ]}
        onCta={() => undefined}
      />
    </AppScreen>
  );
};
