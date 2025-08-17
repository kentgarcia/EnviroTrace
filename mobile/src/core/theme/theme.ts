import { MD3LightTheme as DefaultTheme } from "react-native-paper";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#003595", // App primary color (blue)
    primaryContainer: "#A5D6A7",
    secondary: "#4CAF50",
    secondaryContainer: "#C8E6C9",
    tertiary: "#1976D2",
    tertiaryContainer: "#BBDEFB",
    surface: "#FFFFFF",
    surfaceVariant: "#F5F5F5",
    background: "#FAFAFA",
    error: "#D32F2F",
    errorContainer: "#FFCDD2",
    onPrimary: "#FFFFFF",
    onPrimaryContainer: "#1B5E20",
    onSecondary: "#FFFFFF",
    onSecondaryContainer: "#2E7D32",
    onTertiary: "#FFFFFF",
    onTertiaryContainer: "#0D47A1",
    onSurface: "#212121",
    onSurfaceVariant: "#757575",
    onBackground: "#212121",
    onError: "#FFFFFF",
    onErrorContainer: "#B71C1C",
    outline: "#BDBDBD",
    outlineVariant: "#E0E0E0",
    inverseSurface: "#424242",
    inverseOnSurface: "#FAFAFA",
    inversePrimary: "#81C784",
    elevation: {
      level0: "transparent",
      level1: "#F8F8F8",
      level2: "#F5F5F5",
      level3: "#F0F0F0",
      level4: "#EEEEEE",
      level5: "#EBEBEB",
    },
  },
  fonts: {
    ...DefaultTheme.fonts,
    displayLarge: {
      ...DefaultTheme.fonts.displayLarge,
      fontWeight: "600" as const,
    },
    displayMedium: {
      ...DefaultTheme.fonts.displayMedium,
      fontWeight: "600" as const,
    },
    displaySmall: {
      ...DefaultTheme.fonts.displaySmall,
      fontWeight: "600" as const,
    },
    headlineLarge: {
      ...DefaultTheme.fonts.headlineLarge,
      fontWeight: "600" as const,
    },
    headlineMedium: {
      ...DefaultTheme.fonts.headlineMedium,
      fontWeight: "600" as const,
    },
    headlineSmall: {
      ...DefaultTheme.fonts.headlineSmall,
      fontWeight: "600" as const,
    },
    titleLarge: {
      ...DefaultTheme.fonts.titleLarge,
      fontWeight: "600" as const,
    },
    titleMedium: {
      ...DefaultTheme.fonts.titleMedium,
      fontWeight: "500" as const,
    },
    titleSmall: {
      ...DefaultTheme.fonts.titleSmall,
      fontWeight: "500" as const,
    },
    labelLarge: {
      ...DefaultTheme.fonts.labelLarge,
      fontWeight: "500" as const,
    },
    labelMedium: {
      ...DefaultTheme.fonts.labelMedium,
      fontWeight: "500" as const,
    },
    labelSmall: {
      ...DefaultTheme.fonts.labelSmall,
      fontWeight: "500" as const,
    },
    bodyLarge: {
      ...DefaultTheme.fonts.bodyLarge,
      fontWeight: "400" as const,
    },
    bodyMedium: {
      ...DefaultTheme.fonts.bodyMedium,
      fontWeight: "400" as const,
    },
    bodySmall: {
      ...DefaultTheme.fonts.bodySmall,
      fontWeight: "400" as const,
    },
  },
};

export default theme;
