import React from "react";
import { View } from "react-native";
import { colors } from "../../theme/tokens";
import { Avatar } from "../primitives";

export type MemberStatus = "pending" | "done";

export interface GroupMember {
  id: string;
  avatarUrl?: string;
  status: MemberStatus;
}

export interface GroupSyncRowProps {
  members: GroupMember[];
}

export const GroupSyncRow: React.FC<GroupSyncRowProps> = ({ members }) => {
  return (
    <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
      {members.map((m) => (
        <View key={m.id} style={{ alignItems: "center" }}>
          <Avatar size={44} uri={m.avatarUrl} fallback="" streakLevel={2} />
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: m.status === "done" ? colors.accentGreen : colors.textMuted,
              marginTop: 6,
            }}
          />
        </View>
      ))}
    </View>
  );
};
