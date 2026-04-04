import React from "react";
import { Text, View } from "react-native";
import { AppScreen, Avatar, BadgeIcon, SurfaceCard } from "../../../components";
import { colors, typography } from "../../../theme/tokens";

export const ProfileScreen = () => {
  return (
    <AppScreen>
      <View style={{ gap: 16 }}>
        <SurfaceCard>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Avatar size={70} fallback="T" streakLevel={4} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, ...typography.h2 }}>TwinFit</Text>
              <Text style={{ color: colors.textSecondary, ...typography.bodySm }}>Consistency level 4</Text>
            </View>
            <Text style={{ color: colors.accentOrange, fontSize: 22 }}>🔥</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <BadgeIcon icon={{ name: "globe" }} accent={colors.accentBlue} />
            <BadgeIcon icon={{ name: "clock" }} accent={colors.accentOrange} />
            <BadgeIcon icon={{ name: "users" }} accent={colors.accentGreen} />
          </View>
        </SurfaceCard>
      </View>
    </AppScreen>
  );
};
