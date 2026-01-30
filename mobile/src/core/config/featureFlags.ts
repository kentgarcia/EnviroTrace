import Constants from "expo-constants";

type Extras = Record<string, unknown> | undefined;

const parseBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) {
      return true;
    }
    if (["0", "false", "no", "off"].includes(normalized)) {
      return false;
    }
  }

  return undefined;
};

const expoExtra = (Constants.expoConfig?.extra ?? {}) as Extras;
const legacyExtra = (Constants.manifest?.extra ?? {}) as Extras;
const featuresExtra = (expoExtra as Record<string, unknown>)?.features as Extras;

const pickFlagValue = (...candidates: unknown[]): boolean | undefined => {
  for (const candidate of candidates) {
    const parsed = parseBoolean(candidate);
    if (typeof parsed === "boolean") {
      return parsed;
    }
  }
  return undefined;
};

const aiAssistantEnabled =
  pickFlagValue(
    process.env.EXPO_PUBLIC_ENABLE_AI_ASSISTANT,
    (expoExtra as Record<string, unknown>)?.ENABLE_AI_ASSISTANT,
    (expoExtra as Record<string, unknown>)?.enableAIAssistant,
    (featuresExtra as Record<string, unknown>)?.ENABLE_AI_ASSISTANT,
    (featuresExtra as Record<string, unknown>)?.enableAIAssistant,
    (legacyExtra as Record<string, unknown>)?.ENABLE_AI_ASSISTANT,
    (legacyExtra as Record<string, unknown>)?.enableAIAssistant
  ) ?? true;

export const featureFlags = {
  aiAssistantEnabled,
} as const;

export const isAIAssistantEnabled = featureFlags.aiAssistantEnabled;
