import { z } from "zod";

export type LLMProvider = "openai";

export type LLMUserSettings = {
  version: 1;
  provider: LLMProvider;
  model: string;
  rememberKey: boolean;
};

const STORAGE_SETTINGS_KEY = "ragacademy_llm_user_settings_v1";
const STORAGE_KEY_SESSION = "ragacademy_llm_api_key_session_v1";
const STORAGE_KEY_LOCAL = "ragacademy_llm_api_key_local_v1";

const LLMUserSettingsSchema: z.ZodType<LLMUserSettings> = z.object({
  version: z.literal(1),
  provider: z.literal("openai"),
  model: z.string().min(1).default("gpt-4o-mini"),
  rememberKey: z.boolean().default(false),
});

export function loadLLMUserSettings(): LLMUserSettings {
  const fallback: LLMUserSettings = {
    version: 1,
    provider: "openai",
    model: "gpt-4o-mini",
    rememberKey: false,
  };

  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (!raw) return fallback;
    return LLMUserSettingsSchema.parse(JSON.parse(raw));
  } catch {
    return fallback;
  }
}

export function saveLLMUserSettings(next: LLMUserSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(next));
}

export function loadLLMApiKey(settings: LLMUserSettings): string | null {
  if (typeof window === "undefined") return null;
  const keyName = settings.rememberKey ? STORAGE_KEY_LOCAL : STORAGE_KEY_SESSION;
  const store = settings.rememberKey ? window.localStorage : window.sessionStorage;
  const v = store.getItem(keyName);
  return v && v.trim() ? v.trim() : null;
}

export function saveLLMApiKey(settings: LLMUserSettings, apiKey: string) {
  if (typeof window === "undefined") return;

  const trimmed = apiKey.trim();
  if (!trimmed) {
    clearLLMApiKey();
    return;
  }

  // Ensure we only store it in one place.
  window.localStorage.removeItem(STORAGE_KEY_LOCAL);
  window.sessionStorage.removeItem(STORAGE_KEY_SESSION);

  if (settings.rememberKey) {
    window.localStorage.setItem(STORAGE_KEY_LOCAL, trimmed);
  } else {
    window.sessionStorage.setItem(STORAGE_KEY_SESSION, trimmed);
  }
}

export function clearLLMApiKey() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY_LOCAL);
  window.sessionStorage.removeItem(STORAGE_KEY_SESSION);
}


