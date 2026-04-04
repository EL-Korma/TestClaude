import React, { useState } from "react";
import { View } from "react-native";
import { InputField, PillButton } from "../primitives";

export interface AuthFormField {
  name: string;
  label: string;
  placeholder?: string;
  secure?: boolean;
  iconLeft?: {
    name: import("../primitives").IconName;
    size?: number;
    color?: string;
  };
}

export interface AuthFormProps {
  variant: "signin" | "signup";
  fields: AuthFormField[];
  onSubmit: (data: Record<string, string>) => void;
  onSecondaryAction?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ fields, onSubmit }) => {
  const initialState = fields.reduce<Record<string, string>>((acc, f) => {
    acc[f.name] = "";
    return acc;
  }, {});
  const [form, setForm] = useState(initialState);

  return (
    <View style={{ gap: 12 }}>
      {fields.map((field) => (
        <InputField
          key={field.name}
          label={field.label}
          placeholder={field.placeholder}
          secure={field.secure}
          iconLeft={field.iconLeft}
          value={form[field.name]}
          onChangeText={(value) => setForm((prev) => ({ ...prev, [field.name]: value }))}
        />
      ))}
      <PillButton label="Continue" onPress={() => onSubmit(form)} />
    </View>
  );
};
