# TwinFit Component API

This document defines the TypeScript prop interfaces for the core primitives and composites.

## Common Types

```ts
export type ButtonVariant = "primary" | "secondary" | "ghost";
export type SurfaceVariant = "surface-0" | "surface-1" | "surface-2";
export type StreakLevel = 1 | 2 | 3 | 4;
export type MemberStatus = "pending" | "done";

export type IconSource = {
  name: string;
  size?: number;
  color?: string;
};
```

## Primitives

```ts
export interface AppScreenProps {
  children: React.ReactNode;
  bg?: string;
  safeTop?: boolean;
  safeBottom?: boolean;
  statusBarStyle?: "light-content" | "dark-content";
}

export interface SurfaceCardProps {
  children: React.ReactNode;
  variant?: SurfaceVariant;
  radius?: number;
  padding?: number;
  glow?: boolean;
}

export interface PillButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  iconLeft?: IconSource;
  iconRight?: IconSource;
  loading?: boolean;
  disabled?: boolean;
}

export interface GhostButtonProps {
  label: string;
  onPress: () => void;
  iconLeft?: IconSource;
  disabled?: boolean;
}

export interface IconButtonProps {
  icon: IconSource;
  onPress: () => void;
  size?: number;
  bg?: string;
}

export interface InputFieldProps {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  iconLeft?: IconSource;
  iconRight?: IconSource;
  secure?: boolean;
  error?: string;
  helperText?: string;
}

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  iconLeft?: IconSource;
}

export interface SegmentedControlOption {
  label: string;
  value: string;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
}

export interface ProgressBarProps {
  value: number;
  height?: number;
  color?: string;
}

export interface RadialMeterProps {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
}

export interface AvatarProps {
  size?: number;
  uri?: string;
  fallback?: string;
  streakLevel?: StreakLevel;
}

export interface StreakBorderProps {
  level: StreakLevel;
  animated?: boolean;
  size?: number;
}

export interface BadgeIconProps {
  icon: IconSource;
  size?: number;
  accent?: string;
}

export interface ListRowProps {
  title: string;
  subtitle?: string;
  iconLeft?: IconSource;
  right?: React.ReactNode;
  onPress?: () => void;
}

export interface ModalSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number;
}
```

## Composite

```ts
export interface WelcomeCarouselItem {
  title: string;
  subtitle: string;
  image: string;
  cta: string;
}

export interface WelcomeCarouselProps {
  items: WelcomeCarouselItem[];
  onCta: () => void;
}

export interface AuthFormField {
  name: string;
  label: string;
  placeholder?: string;
  secure?: boolean;
  iconLeft?: IconSource;
}

export interface AuthFormProps {
  variant: "signin" | "signup";
  fields: AuthFormField[];
  onSubmit: (data: Record<string, string>) => void;
  onSecondaryAction?: () => void;
}

export interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
}

export interface CheckInCTAProps {
  label?: string;
  onPress: () => void;
}

export interface GroupMember {
  id: string;
  avatarUrl?: string;
  status: MemberStatus;
}

export interface GroupSyncRowProps {
  members: GroupMember[];
}

export interface MealScanCardProps {
  onScan: () => void;
  onRecipe: () => void;
}

export interface RecipeCardProps {
  title: string;
  steps: string[];
  onSave?: () => void;
}

export interface NotificationCardProps {
  title: string;
  subtitle?: string;
  icon?: IconSource;
  accent?: string;
  ctaLabel?: string;
  onPress?: () => void;
}

export interface SearchFiltersSheetProps {
  initial: Record<string, unknown>;
  onApply: (filters: Record<string, unknown>) => void;
}
```

## Default Values

- AppScreen: `safeTop=true`, `safeBottom=true`, `statusBarStyle="light-content"`
- SurfaceCard: `variant="surface-1"`, `radius=22`, `padding=16`, `glow=false`
- PillButton: `variant="primary"`, `loading=false`, `disabled=false`
- InputField: `secure=false`
- Avatar: `size=60`, `streakLevel=1`
- StreakBorder: `animated=true`
