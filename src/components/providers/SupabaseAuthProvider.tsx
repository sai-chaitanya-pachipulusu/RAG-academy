"use client";

import type { AuthChangeEvent, AuthError, Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { getSupabase, requireSupabase } from "@/lib/supabase/client";
import type { SubscriptionInfo, SubscriptionTier } from "@/lib/supabase/subscription";
import { getSubscriptionInfo, hasPaidAccess } from "@/lib/supabase/subscription";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscription: SubscriptionInfo | null;
  subscriptionLoading: boolean;
  hasPaidAccess: boolean;
  refreshSubscription: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const DEFAULT_SUBSCRIPTION: SubscriptionInfo = {
  tier: "free",
  status: "none",
  isActive: false,
  currentPeriodEnd: null,
  canceledAt: null,
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function SupabaseAuthProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const client = getSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(() => Boolean(client));
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  // Fetch subscription when user changes
  const fetchSubscription = useCallback(async (userId: string | undefined) => {
    if (!userId || !client) {
      setSubscription(DEFAULT_SUBSCRIPTION);
      return;
    }

    setSubscriptionLoading(true);
    try {
      const subInfo = await getSubscriptionInfo(client, userId);
      setSubscription(subInfo);
    } catch (e) {
      console.warn("Failed to fetch subscription:", e);
      setSubscription(DEFAULT_SUBSCRIPTION);
    } finally {
      setSubscriptionLoading(false);
    }
  }, [client]);

  // Refresh subscription (can be called after checkout)
  const refreshSubscription = useCallback(async () => {
    await fetchSubscription(session?.user?.id);
  }, [fetchSubscription, session?.user?.id]);

  useEffect(() => {
    let mounted = true;

    if (!client) return;

    client.auth
      .getSession()
      .then(({ data, error }: { data: { session: Session | null }; error: AuthError | null }) => {
        if (!mounted) return;
        if (error) {
          console.warn("supabase.auth.getSession error:", error.message);
        }
        setSession(data.session ?? null);
        setLoading(false);
        
        // Fetch subscription after getting session
        if (data.session?.user?.id) {
          fetchSubscription(data.session.user.id);
        }
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        console.warn("supabase.auth.getSession failed:", String(err));
        setSession(null);
        setLoading(false);
      });

    const { data: listener } = client.auth.onAuthStateChange(
      (_event: AuthChangeEvent, nextSession: Session | null) => {
        setSession(nextSession);
        // Fetch subscription when auth state changes
        fetchSubscription(nextSession?.user?.id);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [client, fetchSubscription]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      subscription,
      subscriptionLoading,
      hasPaidAccess: subscription ? hasPaidAccess(subscription) : false,
      refreshSubscription,
      async signUp(email: string, password: string, name?: string) {
        const client = requireSupabase();
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || email.split('@')[0],
            },
          },
        });
        if (error) return { error: error.message };
        
        // Send welcome email (non-blocking)
        if (data.user) {
          import('@/lib/email/triggers').then(({ sendWelcomeEmail }) => {
            import('@/lib/challenges/catalog').then(({ getPlatformStats }) => {
              const stats = getPlatformStats();
              sendWelcomeEmail(
                { id: data.user!.id, email, name: name || email.split('@')[0] },
                stats.freeChallenges
              ).catch(console.error);
            });
          });
        }
        
        return {};
      },
      async signIn(email: string, password: string) {
        const client = requireSupabase();
        const { error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (error) return { error: error.message };
        return {};
      },
      async signOut() {
        const client = requireSupabase();
        await client.auth.signOut();
        setSubscription(null);
        window.location.href = "/";
      },
    }),
    [loading, session, subscription, subscriptionLoading, refreshSubscription]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSupabaseAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error(
      "useSupabaseAuth must be used within <SupabaseAuthProvider />"
    );
  }
  return ctx;
}
