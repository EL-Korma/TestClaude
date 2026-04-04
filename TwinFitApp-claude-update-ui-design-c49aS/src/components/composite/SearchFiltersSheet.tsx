import React from "react";
import { Text, View } from "react-native";
import { colors, typography } from "../../theme/tokens";
import { Chip, ModalSheet, PillButton } from "../primitives";

export interface SearchFiltersSheetProps {
  visible: boolean;
  onClose: () => void;
  initial: Record<string, unknown>;
  onApply: (filters: Record<string, unknown>) => void;
}

export const SearchFiltersSheet: React.FC<SearchFiltersSheetProps> = ({ visible, onClose, onApply }) => {
  return (
    <ModalSheet visible={visible} onClose={onClose}>
      <View style={{ gap: 16 }}>
        <Text style={{ color: colors.textPrimary, ...typography.h2 }}>Filter Search Results</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Chip label="Workout" />
          <Chip label="Meal" />
          <Chip label="Community" />
        </View>
        <PillButton label="Apply Filters" onPress={() => onApply({})} />
      </View>
    </ModalSheet>
  );
};
