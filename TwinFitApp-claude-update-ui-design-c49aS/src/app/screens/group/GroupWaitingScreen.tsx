import React from "react";
import { ImageBackground, Text, View } from "react-native";
import { AppScreen, Avatar, PillButton, SurfaceCard } from "../../../components";
import { colors, radii, typography } from "../../../theme/tokens";
import { images } from "../../../assets/images";

export const GroupWaitingScreen = () => {
  return (
    <AppScreen>
      <ImageBackground source={{ uri: images.welcomeHero }} style={{ flex: 1 }} imageStyle={{ borderRadius: radii.xl }}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.55)",
            borderRadius: radii.xl,
            padding: 20,
            justifyContent: "flex-end",
            gap: 14,
          }}
        >
          <Text style={{ color: colors.textPrimary, ...typography.h1 }}>Waiting for your team</Text>
          <Text style={{ color: colors.textSecondary, ...typography.bodySm }}>
            Your challenge starts when your team is complete.
          </Text>
          <SurfaceCard>
            <Text style={{ color: colors.textPrimary, ...typography.body }}>Invited members</Text>
            <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
              <Avatar size={48} fallback="A" streakLevel={2} />
              <Avatar size={48} fallback="B" streakLevel={2} />
              <Avatar size={48} fallback="C" streakLevel={2} />
            </View>
          </SurfaceCard>
          <PillButton label="Share invite" onPress={() => undefined} iconLeft={{ name: "share-2" }} />
        </View>
      </ImageBackground>
    </AppScreen>
  );
};
