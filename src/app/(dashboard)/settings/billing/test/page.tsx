"use client";

/**
 * Payment Test Page
 * 
 * Provides a UI for testing payment flows with Polar.
 * Includes test card numbers, checkout creation, and webhook simulation.
 */

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { TestCardDisplay, TestCardSelector } from "@/components/payments/TestCardDisplay";
import { TestCardKey } from "@/lib/payments/polar";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";

function PaymentTestPageContent() {
  const searchParams = useSearchParams();
  const { user } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState<"checkout" | "webhooks" | "scenarios" | "logs">("checkout");
  
  // Checkout form state
  const [selectedTier, setSelectedTier] = useState<"pro" | "team" | "lifetime">("pro");
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly" | "annual" | "lifetime">("monthly");
  const [selectedTestCard, setSelectedTestCard] = useState<TestCardKey>("success");
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<any>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  
  // Environment validation state
  const [envValidation, setEnvValidation] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  // Webhook simulation state
  const [selectedWebhookEvent, setSelectedWebhookEvent] = useState("subscription.created");
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState(false);
  const [webhookResult, setWebhookResult] = useState<any>(null);
  
  // Scenario testing state
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [scenarioResult, setScenarioResult] = useState<any>(null);
  
  // Handle success callback
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      setActiveTab("logs");
    }
  }, [searchParams]);
  
  // Load environment validation on mount
  useEffect(() => {
    validateEnvironment();
  }, []);
  
  const validateEnvironment = async () => {
    setIsValidating(true);
    try {
      const response = await fetch("/api/payments/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "validate-env" }),
      });
      const data = await response.json();
      setEnvValidation(data);
    } catch (error: any) {
      setEnvValidation({ error: error.message });
    } finally {
      setIsValidating(false);
    }
  };
  
  const createCheckout = async () => {
    if (!user) {
      setCheckoutError("You must be signed in to test checkout");
      return;
    }
    
    setIsCreatingCheckout(true);
    setCheckoutError(null);
    setCheckoutResult(null);
    
    try {
      const response = await fetch("/api/payments/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-checkout",
          tier: selectedTier,
          billingCycle: selectedPeriod,
          userId: user.id,
          email: user.email,
          testScenario: selectedTestCard,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout");
      }
      
      setCheckoutResult(data);
    } catch (error: any) {
      setCheckoutError(error.message);
    } finally {
      setIsCreatingCheckout(false);
    }
  };
  
  const simulateWebhook = async () => {
    setIsSimulatingWebhook(true);
    setWebhookResult(null);
    
    try {
      const response = await fetch("/api/payments/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "simulate-webhook",
          eventType: selectedWebhookEvent,
          payload: {
            userId: user?.id || "test-user",
            tier: selectedTier,
          },
        }),
      });
      
      const data = await response.json();
      setWebhookResult(data);
    } catch (error: any) {
      setWebhookResult({ error: error.message });
    } finally {
      setIsSimulatingWebhook(false);
    }
  };
  
  const runScenario = async (scenario: string) => {
    setActiveScenario(scenario);
    setScenarioResult(null);
    
    try {
      const response = await fetch("/api/payments/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "simulate-payment-scenario",
          scenario,
        }),
      });
      
      const data = await response.json();
      setScenarioResult(data);
    } catch (error: any) {
      setScenarioResult({ error: error.message });
    }
  };
  
  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/settings" className="hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer">
            Settings
          </Link>
          <span>/</span>
          <Link href="/settings/billing" className="hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer">
            Billing
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-200">Test</span>
        </div>
        
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
          Payment Testing
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Test payment flows with Polar sandbox environment
        </p>
        
        {/* Environment Indicator */}
        <div className="mt-4 flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
              envValidation?.environment === "production"
                ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                envValidation?.environment === "production" ? "bg-red-500" : "bg-emerald-500"
              }`}
            />
            {envValidation?.environment === "production" ? "PRODUCTION" : "SANDBOX"} MODE
          </span>
          
          {envValidation && !envValidation.valid && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300">
              ⚠️ Configuration Issues
            </span>
          )}
        </div>
      </div>
      
      {/* Validation Status */}
      {envValidation && (
        <div
          className={`mb-6 rounded-lg border p-4 ${
            envValidation.valid
              ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20"
              : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Environment Validation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {envValidation.valid
                  ? "All required configuration is present"
                  : `${envValidation.summary?.failed || 0} failed, ${envValidation.summary?.warnings || 0} warnings`}
              </p>
            </div>
            <button
              onClick={validateEnvironment}
              disabled={isValidating}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-[#7C3AED] dark:text-gray-300 cursor-pointer"
            >
              {isValidating ? "Checking..." : "Re-check"}
            </button>
          </div>
          
          {envValidation.checks && (
            <div className="mt-3 space-y-1">
              {envValidation.checks
                .filter((c: any) => c.status !== "pass")
                .slice(0, 3)
                .map((check: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span>{check.status === "fail" ? "❌" : "⚠️"}</span>
                    <span className="text-gray-700 dark:text-gray-300">{check.message}</span>
                  </div>
                ))}
              {envValidation.checks.filter((c: any) => c.status !== "pass").length > 3 && (
                <p className="text-sm text-gray-500">
                  and{" "}
                  {envValidation.checks.filter((c: any) => c.status !== "pass").length - 3} more...
                </p>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-4">
          {[
            { id: "checkout", label: "Test Checkout", icon: "💳" },
            { id: "webhooks", label: "Webhooks", icon: "📡" },
            { id: "scenarios", label: "Scenarios", icon: "🎭" },
            { id: "logs", label: "View Logs", icon: "📊" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-200"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Checkout Tab */}
      {activeTab === "checkout" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Checkout Form */}
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Create Test Checkout
              </h2>
              
              {/* Tier Selection */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Plan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["pro", "team", "lifetime"] as const).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => {
                        setSelectedTier(tier);
                        if (tier === "lifetime") setSelectedPeriod("lifetime");
                      }}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${
                        selectedTier === tier
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/30 dark:text-indigo-300"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Period Selection */}
              {selectedTier !== "lifetime" && (
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Billing Period
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["monthly", "annual"] as const).map((period) => (
                      <button
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${
                          selectedPeriod === period
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/30 dark:text-indigo-300"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Test Card Selection */}
              <div className="mb-6">
                <TestCardSelector
                  selected={selectedTestCard}
                  onSelect={setSelectedTestCard}
                />
              </div>
              
              {/* Create Button */}
              <button
                onClick={createCheckout}
                disabled={isCreatingCheckout || !user}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingCheckout
                  ? "Creating Checkout..."
                  : user
                  ? "Create Test Checkout"
                  : "Sign in to Test"}
              </button>
              
              {!user && (
                <p className="mt-2 text-center text-xs text-gray-500">
                  <Link href="/login" className="text-indigo-600 hover:underline cursor-pointer">
                    Sign in
                  </Link>{" "}
                  to test payment flows
                </p>
              )}
            </div>
            
            {/* Result */}
            {checkoutError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{checkoutError}</span>
                </div>
              </div>
            )}
            
            {checkoutResult && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/20">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">Checkout Created!</span>
                </div>
                <div className="mt-3 space-y-2">
                  <a
                    href={checkoutResult.checkout.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 cursor-pointer"
                  >
                    Open Checkout
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    Checkout ID: {checkoutResult.checkout.id}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Test Cards Reference */}
          <div>
            <TestCardDisplay />
          </div>
        </div>
      )}
      
      {/* Webhooks Tab */}
      {activeTab === "webhooks" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Simulate Webhook Event
            </h2>
            
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Event Type
              </label>
              <select
                value={selectedWebhookEvent}
                onChange={(e) => setSelectedWebhookEvent(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="subscription.created">subscription.created</option>
                <option value="subscription.updated">subscription.updated</option>
                <option value="subscription.canceled">subscription.canceled</option>
                <option value="subscription.past_due">subscription.past_due</option>
                <option value="transaction.completed">transaction.completed</option>
                <option value="transaction.past_due">transaction.past_due</option>
                <option value="transaction.ready">transaction.ready</option>
              </select>
            </div>
            
            <button
              onClick={simulateWebhook}
              disabled={isSimulatingWebhook}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
            >
              {isSimulatingWebhook ? "Simulating..." : "Simulate Webhook"}
            </button>
            
            {webhookResult && (
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Result
                </h4>
                <pre className="max-h-64 overflow-auto rounded-lg bg-gray-100 p-3 text-xs dark:bg-[#7C3AED]">
                  {JSON.stringify(webhookResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Webhook Configuration
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Endpoint URL</span>
                  <code className="rounded bg-gray-100 px-2 py-0.5 text-xs dark:bg-[#7C3AED]">
                    {typeof window !== "undefined"
                    ? `${window.location.origin}/api/webhooks/polar`
                      : "/api/webhooks/polar"}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Method</span>
                  <span className="font-medium text-emerald-600">POST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Content-Type</span>
                  <span className="font-medium">application/json</span>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
              <h4 className="mb-2 font-medium text-amber-900 dark:text-amber-200">
                Local Webhook Testing
              </h4>
              <p className="text-sm text-amber-800 dark:text-amber-300">
                For local development, use ngrok to expose your webhook endpoint:
              </p>
              <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-amber-800 dark:text-amber-300">
                <li>Install ngrok: <code>npm install -g ngrok</code></li>
                <li>Start your dev server: <code>npm run dev</code></li>
                <li>Expose webhook: <code>ngrok http 3000</code></li>
                <li>Copy the HTTPS URL to Polar dashboard</li>
                <li>Add <code>/api/webhooks/polar</code> to the URL</li>
              </ol>
            </div>
          </div>
        </div>
      )}
      
      {/* Scenarios Tab */}
      {activeTab === "scenarios" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                id: "new-subscription",
                title: "New Subscription",
                description: "User subscribes to Pro monthly",
                icon: "✨",
              },
              {
                id: "upgrade-tier",
                title: "Upgrade Plan",
                description: "Monthly to annual upgrade",
                icon: "⬆️",
              },
              {
                id: "cancel-subscription",
                title: "Cancel Subscription",
                description: "User cancels their plan",
                icon: "🚫",
              },
              {
                id: "payment-failure",
                title: "Payment Failure",
                description: "Failed renewal with retry",
                icon: "⚠️",
              },
              {
                id: "subscription-renewal",
                title: "Subscription Renewal",
                description: "Successful automatic renewal",
                icon: "🔄",
              },
            ].map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => runScenario(scenario.id)}
                className={`rounded-xl border p-4 text-left transition hover:shadow-md ${
                  activeScenario === scenario.id
                    ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/20"
                    : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{scenario.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {scenario.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {scenario.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {scenarioResult && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Scenario: {scenarioResult.scenario}
              </h3>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                {scenarioResult.description}
              </p>
              
              {scenarioResult.steps && (
                <div className="space-y-2">
                  {scenarioResult.steps.map((step: any) => (
                    <div
                      key={step.step}
                      className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-[#7C3AED]/50"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                        {step.step}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {step.action}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {scenarioResult.testCard && (
                <div className="mt-4 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/20">
                  <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                    Test Card: {scenarioResult.testCard.number}
                  </p>
                </div>
              )}
              
              {scenarioResult.expectedResult && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Expected Result:
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {scenarioResult.expectedResult}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Logs Tab */}
      {activeTab === "logs" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Recent Webhook Logs
              </h2>
              <Link
                href="/admin/payments"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 cursor-pointer"
              >
                View Full Dashboard →
              </Link>
            </div>
            
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-800 dark:bg-gray-900/50">
              <p className="text-gray-600 dark:text-gray-400">
                Webhook logs are available in the{" "}
                <Link href="/admin/payments" className="text-indigo-600 hover:underline dark:text-indigo-400 cursor-pointer">
                  Payment Debug Dashboard
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentTestPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <PaymentTestPageContent />
    </Suspense>
  );
}
