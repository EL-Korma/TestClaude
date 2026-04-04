import React from "react";
import { Modal, Pressable, View } from "react-native";
import { colors, radii } from "../../theme/tokens";

export interface ModalSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number;
}

export const ModalSheet: React.FC<ModalSheetProps> = ({ visible, onClose, children, height = 0.6 }) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} onPress={onClose} />
      <View
        style={{
          height: `${height * 100}%`,
          backgroundColor: colors.surface1,
          borderTopLeftRadius: radii.xl,
          borderTopRightRadius: radii.xl,
          padding: 16,
        }}
      >
        {children}
      </View>
    </Modal>
  );
};
