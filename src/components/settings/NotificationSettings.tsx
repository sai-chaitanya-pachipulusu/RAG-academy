"use client";

import { useState, useEffect } from "react";
import type { NotificationPreferences } from "@/lib/notifications/email";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/notifications/email";

const STORAGE_KEY = "rag_academy_notification_prefs";

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES
  );
  const [saved, setSaved] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPreferences(JSON.parse(stored));
      } catch {
        // Use defaults
      }
    }
  }, []);

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const settings = [
    {
      key: "streakReminders" as const,
      title: "Streak Reminders",
      description: "Get notified when your streak is at risk",
      icon: "🔥",
    },
    {
      key: "weeklyDigest" as const,
      title: "Weekly Digest",
      description: "Receive a weekly summary of your progress",
      icon: "📊",
    },
    {
      key: "achievementNotifications" as const,
      title: "Achievement Notifications",
      description: "Get notified when you earn achievements",
      icon: "🏆",
    },
    {
      key: "marketingEmails" as const,
      title: "Product Updates",
      description: "Hear about new features and content",
      icon: "📣",
    },
  ];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
            <span>🔔</span>
            Email Notifications
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Choose what emails you want to receive
          </p>
        </div>
        {saved && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
            Saved!
          </span>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {settings.map((setting) => (
          <div
            key={setting.key}
            className="flex items-center justify-between rounded-lg border border-zinc-100 p-4 dark:border-zinc-800"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{setting.icon}</span>
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {setting.title}
                </p>
                <p className="text-sm text-zinc-500">{setting.description}</p>
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={preferences[setting.key]}
                onChange={(e) => updatePreference(setting.key, e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-zinc-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-focus:outline-none dark:bg-zinc-700" />
            </label>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-zinc-400">
        Note: Email notifications require signing up with a valid email address.
      </p>
    </div>
  );
}
