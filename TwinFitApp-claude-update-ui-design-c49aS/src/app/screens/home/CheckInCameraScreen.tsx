import React from "react";
import { ImageBackground, Text, View } from "react-native";
import { AppScreen, IconButton, PillButton, SurfaceCard } from "../../../components";
import { colors, radii, typography } from "../../../theme/tokens";
import { images } from "../../../assets/images";

export const CheckInCameraScreen = () => {
  return (
    <AppScreen>
      <ImageBackground source={{ uri: images.authSignIn }} style={{ flex: 1 }} imageStyle={{ borderRadius: radii.xl }}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", borderRadius: radii.xl, padding: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <IconButton icon={{ name: "x" }} onPress={() => undefined} />
            <Text style={{ color: colors.textPrimary, ...typography.body }}>Gym Check‑In</Text>
            <IconButton icon={{ name: "zap" }} onPress={() => undefined} />
          </View>

          <View style={{ flex: 1, justifyContent: "flex-end", gap: 14 }}>
            <SurfaceCard>
              <Text style={{ color: colors.textPrimary, ...typography.h3 }}>Frame your face</Text>
              <Text style={{ color: colors.textSecondary, ...typography.bodySm }}>
                We validate presence for group sync.
              </Text>
            </SurfaceCard>
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: colors.accentOrange,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: colors.textPrimary, fontSize: 20 }}>●</Text>
              </View>
            </View>
            <PillButton label="Confirm check‑in" onPress={() => undefined} iconLeft={{ name: "check" }} />
          </View>
        </View>
      </ImageBackground>
    </AppScreen>
  );
};
