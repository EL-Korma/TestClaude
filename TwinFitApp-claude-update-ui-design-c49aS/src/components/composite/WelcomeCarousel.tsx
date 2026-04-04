import React from "react";
import { ImageBackground, Text, View } from "react-native";
import { colors, radii, typography } from "../../theme/tokens";
import { PillButton } from "../primitives";

export interface WelcomeCarouselItem {
  title: string;
  subtitle: string;
  image: string;
  cta: string;
}

export interface WelcomeCarouselProps {
  items: WelcomeCarouselItem[];
  onCta: () => void;
}

export const WelcomeCarousel: React.FC<WelcomeCarouselProps> = ({ items, onCta }) => {
  const first = items[0];
  return (
    <ImageBackground source={{ uri: first.image }} style={{ flex: 1 }} imageStyle={{ borderRadius: radii.xl }}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: radii.xl, padding: 20 }}>
        <View style={{ flex: 1, justifyContent: "flex-end", gap: 8 }}>
          <Text style={{ color: colors.textPrimary, ...typography.h1 }}>{first.title}</Text>
          <Text style={{ color: colors.textSecondary, ...typography.body }}>{first.subtitle}</Text>
          <PillButton label={first.cta} onPress={onCta} />
        </View>
      </View>
    </ImageBackground>
  );
};
