// TwinFit Design System — matching the full brand spec
export const colors = {
  // Core brand
  primary: "#FF5E1A",
  primaryGlow: "rgba(255,94,26,0.35)",
  primaryDim: "rgba(255,94,26,0.15)",

  // Backgrounds
  bg: "#0A0A0A",
  surface0: "#141414",
  surface1: "#1C1C1C",
  surface2: "#242424",

  // Text
  textPrimary: "#F5F0EA",
  textMuted: "#7A7570",
  textDim: "#3A3835",

  // Semantic
  success: "#22C55E",
  successDim: "rgba(34,197,94,0.2)",
  warning: "#EAB308",
  info: "#3B82F6",
  infoDim: "rgba(59,130,246,0.2)",
  purple: "#A855F7",
  purpleDim: "rgba(168,85,247,0.2)",

  // Legacy aliases (keep old references working)
  bg0: "#0A0A0A",
  bg1: "#141414",
  accentOrange: "#FF5E1A",
  accentGreen: "#22C55E",
  accentBlue: "#3B82F6",
  accentRed: "#EF4444",
  textSecondary: "#7A7570",
};

export const radii = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
  pill: 999,
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 40,
};

export const typography = {
  // Bebas Neue for display / DM Sans for body
  displayFont: "BebasNeue_400Regular",
  bodyFont: "DMSans_400Regular",
  bodyMediumFont: "DMSans_500Medium",
  bodyBoldFont: "DMSans_700Bold",

  // Display styles (Bebas Neue)
  display: { fontSize: 64, letterSpacing: 2, lineHeight: 68 },
  hero: { fontSize: 48, letterSpacing: 2, lineHeight: 52 },
  h1: { fontSize: 36, letterSpacing: 1.5, lineHeight: 40 },
  h2: { fontSize: 28, letterSpacing: 1, lineHeight: 32 },
  h3: { fontSize: 22, letterSpacing: 0.8, lineHeight: 26 },

  // Body styles (DM Sans)
  bodyLg: { fontSize: 18, lineHeight: 26, fontWeight: "500" as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: "400" as const },
  bodySm: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" as const },
  label: { fontSize: 11, lineHeight: 14, fontWeight: "500" as const, letterSpacing: 0.8 },
};

export const shadows = {
  orangeGlow: {
    shadowColor: "#FF5E1A",
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
  card: {
    shadowColor: "#000000",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  subtle: {
    shadowColor: "#000000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  // Legacy
  soft: {
    shadowColor: "#000000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
};

export const sizes = {
  buttonHeight: 56,
  inputHeight: 54,
  iconButton: 44,
  avatar: 60,
  tabBarHeight: 72,
};

export const tokens = {
  colors,
  radii,
  spacing,
  typography,
  shadows,
  sizes,
};
