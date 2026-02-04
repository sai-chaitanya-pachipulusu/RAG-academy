"use client";

import { useEffect, useMemo, useState } from "react";

import {
  clearLLMApiKey,
  loadLLMApiKey,
  loadLLMUserSettings,
  saveLLMApiKey,
  saveLLMUserSettings,
} from "@/lib/llm/settings";

export function LLMSettingsPanel() {
  const [settings, setSettings] = useState(loadLLMUserSettings);
  const [apiKeyDraft, setApiKeyDraft] = useState("");
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const s = loadLLMUserSettings();
    setSettings(s);
    setHasKey(Boolean(loadLLMApiKey(s)));
  }, []);

  const providerLabel = useMemo(() => {
    if (settings.provider === "openai") return "OpenAI";
    return settings.provider;
  }, [settings.provider]);

  function save() {
    saveLLMUserSettings(settings);
    if (apiKeyDraft.trim()) {
      saveLLMApiKey(settings, apiKeyDraft);
      setApiKeyDraft("");
    }
    setHasKey(Boolean(loadLLMApiKey(settings)));
  }

  function clearKey() {
    clearLLMApiKey();
    setHasKey(false);
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-900">LLM (Bring Your Own Key)</p>
          <p className="mt-1 text-sm text-zinc-600">
            Enable "Explain" mode in the chat using your own API key. The key is
            stored only in your browser (session by default).
          </p>
        </div>
        <div className="text-xs text-zinc-500">
          Status: {hasKey ? "key set" : "no key"}
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-xs font-medium text-zinc-700">
              Provider
            </span>
            <input
              value={providerLabel}
              disabled
              className="h-10 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-600 outline-none"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-zinc-700">
              Model
            </span>
            <input
              value={settings.model}
              onChange={(e) =>
                setSettings((s) => ({ ...s, model: e.target.value }))
              }
              placeholder="e.g. gpt-4o-mini"
              className="h-10 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </label>
        </div>

        <label className="grid gap-1">
          <span className="text-xs font-medium text-zinc-700">
            API key
          </span>
          <input
            value={apiKeyDraft}
            onChange={(e) => setApiKeyDraft(e.target.value)}
            placeholder={hasKey ? "Key already set (paste to replace)" : "Paste key"}
            type="password"
            className="h-10 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
          />
          <span className="text-xs text-zinc-500">
            Tip: leave blank and hit Save to keep the existing key.
          </span>
        </label>

        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={settings.rememberKey}
            onChange={(e) =>
              setSettings((s) => ({ ...s, rememberKey: e.target.checked }))
            }
          />
          Remember key on this device (stores in localStorage)
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={save}
            className="inline-flex h-9 items-center justify-center rounded-full bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Save
          </button>
          <button
            type="button"
            onClick={clearKey}
            className="inline-flex h-9 items-center justify-center rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-950 hover:bg-zinc-50"
          >
            Clear key
          </button>
        </div>

        <p className="text-xs text-zinc-500">
          Security note: never reuse keys with broad permissions. Prefer
          restricted keys and rotate regularly.
        </p>
      </div>
    </div>
  );
}


