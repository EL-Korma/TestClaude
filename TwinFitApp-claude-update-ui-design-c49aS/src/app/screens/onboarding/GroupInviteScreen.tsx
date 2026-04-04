import React from "react";
import { Text, View } from "react-native";
import { AppScreen, InputField, PillButton } from "../../../components";
import { colors, typography } from "../../../theme/tokens";

export const GroupInviteScreen = () => {
  return (
    <AppScreen>
      <View style={{ gap: 16 }}>
        <Text style={{ color: colors.textPrimary, ...typography.h1 }}>Invite your team</Text>
        <InputField label="Invite Code" value="" onChangeText={() => undefined} placeholder="ABCD1234" />
        <PillButton label="Share invite" onPress={() => undefined} />
      </View>
    </AppScreen>
  );
};
