import React, { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { AppScreen, PillButton, SurfaceCard } from "../../../components";
import { colors, radii, typography } from "../../../theme/tokens";
import { images } from "../../../assets/images";

export const AvatarSelectScreen = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const avatarList = [images.avatar1, images.avatar2, images.avatar3, images.avatar4, images.avatar5, images.avatar6];

  return (
    <AppScreen>
      <View style={{ gap: 20 }}>
        <Text style={{ color: colors.textPrimary, ...typography.h1 }}>Choose your identity</Text>
        <Text style={{ color: colors.textSecondary, ...typography.bodySm }}>
          This avatar will represent your progress.
        </Text>
        <SurfaceCard>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between" }}>
            {avatarList.map((uri) => (
              <Pressable
                key={uri}
                onPress={() => setSelected(uri)}
                style={{
                  width: "30%",
                  aspectRatio: 1,
                  borderRadius: radii.lg,
                  overflow: "hidden",
                  borderWidth: selected === uri ? 2 : 0,
                  borderColor: colors.accentOrange,
                }}
              >
                <Image source={{ uri }} style={{ width: "100%", height: "100%" }} />
              </Pressable>
            ))}
          </View>
        </SurfaceCard>
        <PillButton label="Upload a photo" onPress={() => undefined} />
        <PillButton label="Continue" onPress={() => undefined} />
      </View>
    </AppScreen>
  );
};
