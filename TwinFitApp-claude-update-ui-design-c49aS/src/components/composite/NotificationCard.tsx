import React from "react";
import { Pressable, Text, View } from "react-native";
import { colors, radii, typography } from "../../theme/tokens";
import { Icon, IconSource } from "../primitives";

export interface NotificationCardProps {
  title: string;
  subtitle?: string;
  icon?: IconSource;
  accent?: string;
  ctaLabel?: string;
  onPress?: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  title,
  subtitle,
  icon,
  accent = colors.accentOrange,
  ctaLabel,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: radii.xl,
        backgroundColor: colors.surface1,
        padding: 16,
        opacity: pressed ? 0.9 : 1,
        borderWidth: 1,
        borderColor: accent,
      })}
    >
      <View style={{ gap: 8 }}>
        {icon ? <Icon name={icon.name} size={18} color={accent} /> : null}
        <Text style={{ color: colors.textPrimary, ...typography.h3 }}>{title}</Text>
        {subtitle ? <Text style={{ color: colors.textSecondary, ...typography.bodySm }}>{subtitle}</Text> : null}
        {ctaLabel ? <Text style={{ color: accent, ...typography.bodySm }}>{ctaLabel}</Text> : null}
      </View>
    </Pressable>
  );
};
