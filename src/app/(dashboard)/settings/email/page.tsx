"use client";

import { useEffect, useState } from "react";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { getEmailPreferences, updateEmailPreferences, unsubscribeAll } from "@/lib/supabase/email";
import type { EmailPreferences } from "@/lib/supabase/email";

interface EmailSetting {
  key: keyof EmailPreferences;
  label: string;
  description: string;
  icon: string;
  category: "notifications" | "marketing" | "schedule";
}

const emailSettings: EmailSetting[] = [
  {
    key: "welcome_email",
    label: "Welcome Emails",
    description: "Receive welcome messages and onboarding tips",
    icon: "👋",
    category: "notifications",
  },
  {
    key: "streak_reminders",
    label: "Streak Reminders",
    description: "Daily reminders to keep your learning streak alive",
    icon: "🔥",
    category: "notifications",
  },
  {
    key: "weekly_digest",
    label: "Weekly Digest",
    description: "Weekly summary of your progress and achievements",
    icon: "📊",
    category: "notifications",
  },
  {
    key: "challenge_notifications",
    label: "Challenge Updates",
    description: "Get notified when you complete challenges",
    icon: "🎯",
    category: "notifications",
  },
  {
    key: "achievement_notifications",
    label: "Achievement Notifications",
    description: "Celebrate when you unlock new badges",
    icon: "🏅",
    category: "notifications",
  },
  {
    key: "subscription_notifications",
    label: "Subscription Updates",
    description: "Important updates about your subscription",
    icon: "💎",
    category: "notifications",
  },
  {
    key: "marketing_emails",
    label: "Product Updates & Tips",
    description: "New features, tips, and educational content",
    icon: "📬",
    category: "marketing",
  },
];

const timezones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
];

export default function EmailSettingsPage() {
  const { user } = useSupabaseAuth();
  const [preferences, setPreferences] = useState<EmailPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const prefs = await getEmailPreferences(user.id);
      setPreferences(prefs);
    } catch (err) {
      setError("Failed to load email preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof EmailPreferences) => {
    if (!user || !preferences) return;
    
    const newValue = !preferences[key];
    
    // Optimistic update
    setPreferences({ ...preferences, [key]: newValue });
    
    try {
      const updated = await updateEmailPreferences(user.id, { [key]: newValue });
      if (updated) {
        setPreferences(updated);
        showSuccess("Preference updated");
      } else {
        // Revert on failure
        setPreferences({ ...preferences, [key]: !newValue });
        setError("Failed to update preference");
      }
    } catch (err) {
      setPreferences({ ...preferences, [key]: !newValue });
      setError("Failed to update preference");
    }
  };

  const handleTimeChange = async (key: "preferred_time" | "timezone", value: string) => {
    if (!user || !preferences) return;
    
    setSaving(true);
    
    try {
      const updated = await updateEmailPreferences(user.id, { [key]: value });
      if (updated) {
        setPreferences(updated);
        showSuccess("Schedule updated");
      } else {
        setError("Failed to update schedule");
      }
    } catch (err) {
      setError("Failed to update schedule");
    } finally {
      setSaving(false);
    }
  };

  const handleUnsubscribeAll = async () => {
    if (!user) return;
    
    if (!confirm("Are you sure you want to unsubscribe from all emails? You can still access your account, but you won't receive any notifications.")) {
      return;
    }
    
    setSaving(true);
    
    try {
      const success = await unsubscribeAll(user.id);
      if (success) {
        await loadPreferences();
        showSuccess("You have been unsubscribed from all emails");
      } else {
        setError("Failed to unsubscribe");
      }
    } catch (err) {
      setError("Failed to unsubscribe");
    } finally {
      setSaving(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const h = hour.toString().padStart(2, "0");
        const m = minute.toString().padStart(2, "0");
        const time = `${h}:${m}`;
        const label = new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        options.push({ value: time, label });
      }
    }
    return options;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-zinc-900"></div>
          <p className="text-gray-600">Loading preferences...</p>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load email preferences</p>
          <button
            onClick={loadPreferences}
            className="mt-4 rounded-lg bg-[#8B5CF6] px-4 py-2 text-white hover:bg-[#7C3AED] cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const notificationSettings = emailSettings.filter((s) => s.category === "notifications");
  const marketingSettings = emailSettings.filter((s) => s.category === "marketing");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Email Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your email preferences and notification settings
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Unsubscribed Warning */}
      {preferences.unsubscribed_all && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="font-medium text-amber-800">
            ⚠️ You are currently unsubscribed from all emails
          </p>
          <p className="mt-1 text-sm text-amber-700">
            You can re-enable specific email types below or click "Resubscribe" to receive all emails again.
          </p>
        </div>
      )}

      {/* Schedule Settings */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
          <span>⏰</span>
          Daily Reminder Schedule
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Preferred Time
            </label>
            <select
              value={preferences.preferred_time}
              onChange={(e) => handleTimeChange("preferred_time", e.target.value)}
              disabled={saving || preferences.unsubscribed_all}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#8B5CF6]900 focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]900 disabled:bg-gray-100"
            >
              {generateTimeOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              When you'll receive daily streak reminders
            </p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Timezone
            </label>
            <select
              value={preferences.timezone}
              onChange={(e) => handleTimeChange("timezone", e.target.value)}
              disabled={saving || preferences.unsubscribed_all}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#8B5CF6]900 focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]900 disabled:bg-gray-100"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Notification Settings */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
          <span>🔔</span>
          Notifications
        </h2>
        <div className="space-y-4">
          {notificationSettings.map((setting) => (
            <div
              key={setting.key}
              className="flex items-start justify-between rounded-lg border border-gray-100 p-4 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{setting.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{setting.label}</h3>
                  <p className="text-sm text-gray-600">{setting.description}</p>
                </div>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={preferences[setting.key] as boolean}
                  onChange={() => handleToggle(setting.key)}
                  disabled={preferences.unsubscribed_all}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-gray-900 peer-focus:ring-2 peer-focus:ring-[#8B5CF6]300 peer-disabled:opacity-50"></div>
                <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5 cursor-pointer"></div>
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* Marketing Settings */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
          <span>📬</span>
          Marketing & Updates
        </h2>
        <div className="space-y-4">
          {marketingSettings.map((setting) => (
            <div
              key={setting.key}
              className="flex items-start justify-between rounded-lg border border-gray-100 p-4 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{setting.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{setting.label}</h3>
                  <p className="text-sm text-gray-600">{setting.description}</p>
                </div>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={preferences[setting.key] as boolean}
                  onChange={() => handleToggle(setting.key)}
                  disabled={preferences.unsubscribed_all}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-gray-900 peer-focus:ring-2 peer-focus:ring-[#8B5CF6]300 peer-disabled:opacity-50"></div>
                <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5 cursor-pointer"></div>
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* Email Previews */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
          <span>👁️</span>
          Email Previews
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          See what each email type looks like
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {emailSettings.slice(0, 4).map((setting) => (
            <button
              key={`preview-${setting.key}`}
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition hover:border-gray-400 hover:bg-gray-50 cursor-pointer"
              onClick={() => alert(`Preview for ${setting.label} would open in a modal`)}
            >
              <span className="text-xl">{setting.icon}</span>
              <span className="text-sm font-medium text-gray-700">{setting.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Unsubscribe All */}
      <section className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="mb-2 text-xl font-semibold text-red-900">
          Unsubscribe from All Emails
        </h2>
        <p className="mb-4 text-sm text-red-700">
          This will disable all email notifications. You can still access your account and use all features.
        </p>
        {preferences.unsubscribed_all ? (
          <button
            onClick={() => handleToggle("unsubscribed_all")}
            disabled={saving}
            className="rounded-lg bg-[#8B5CF6] px-6 py-2 text-white transition hover:bg-[#7C3AED] disabled:opacity-50 cursor-pointer"
          >
            Resubscribe to Emails
          </button>
        ) : (
          <button
            onClick={handleUnsubscribeAll}
            disabled={saving}
            className="rounded-lg bg-red-600 px-6 py-2 text-white transition hover:bg-red-700 disabled:opacity-50 cursor-pointer"
          >
            Unsubscribe from All
          </button>
        )}
      </section>
    </div>
  );
}
