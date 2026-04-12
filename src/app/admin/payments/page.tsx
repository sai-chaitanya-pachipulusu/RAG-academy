"use client";

/**
 * Admin Payment Debug Dashboard
 * 
 * Provides an admin interface for:
 * - Viewing recent transactions
 * - Checking subscription statuses
 * - Viewing webhook logs
 * - Testing refund flows
 * - Managing payment issues
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { TestCardQuickReference } from "@/components/payments/TestCardDisplay";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface WebhookLog {
  id: string;
  provider: string;
  event_type: string;
  event_id: string;
  payload: any;
  created_at: string;
}

interface Transaction {
  id: string;
  transaction_id: string;
  status: string;
  amount: string;
  currency: string;
  customer_id: string;
  subscription_id?: string;
  created_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  tier: string;
  status: string;
  subscription_id?: string;
  current_period_end?: string;
  canceled_at?: string;
  created_at: string;
}

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "webhooks" | "subscriptions">("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    canceledSubscriptions: 0,
    failedPayments: 0,
  });
  
  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  
  useEffect(() => {
    loadData();
  }, [activeTab, page]);
  
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load data based on active tab
      if (activeTab === "overview" || activeTab === "webhooks") {
        const { data: logs, error: logsError } = await supabase
          .from("webhook_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);
        
        if (logsError) throw logsError;
        setWebhookLogs(logs || []);
      }
      
      if (activeTab === "overview" || activeTab === "transactions") {
        const { data: txs, error: txsError } = await supabase
          .from("transactions")
          .select("*")
          .order("created_at", { ascending: false })
          .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);
        
        if (txsError) throw txsError;
        setTransactions(txs || []);
      }
      
      if (activeTab === "overview" || activeTab === "subscriptions") {
        const { data: subs, error: subsError } = await supabase
          .from("subscriptions")
          .select("*")
          .order("created_at", { ascending: false })
          .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);
        
        if (subsError) throw subsError;
        setSubscriptions(subs || []);
      }
      
      // Calculate stats for overview
      if (activeTab === "overview") {
        const { count: txCount } = await supabase
          .from("transactions")
          .select("*", { count: "exact", head: true });
        
        const { count: activeCount } = await supabase
          .from("subscriptions")
          .select("*", { count: "exact", head: true })
          .eq("status", "active");
        
        const { count: canceledCount } = await supabase
          .from("subscriptions")
          .select("*", { count: "exact", head: true })
          .eq("status", "canceled");
        
        const { count: failedCount } = await supabase
          .from("transactions")
          .select("*", { count: "exact", head: true })
          .eq("status", "past_due");
        
        // Calculate total revenue
        const { data: revenueData } = await supabase
          .from("transactions")
          .select("amount")
          .eq("status", "completed");
        
        const totalRevenue = revenueData?.reduce((sum, tx) => {
          return sum + (parseFloat(tx.amount) || 0);
        }, 0) || 0;
        
        setStats({
          totalTransactions: txCount || 0,
          totalRevenue,
          activeSubscriptions: activeCount || 0,
          canceledSubscriptions: canceledCount || 0,
          failedPayments: failedCount || 0,
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const refreshData = () => {
    setPage(1);
    loadData();
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  const formatCurrency = (amount: string, currency: string) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return `${amount} ${currency}`;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(num / 100); // Assuming amount is in cents
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#2563EB]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/admin" className="hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer">
                Admin
              </Link>
              <span>/</span>
              <span className="text-gray-900 dark:text-gray-200">Payments</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Payment Debug Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/settings/billing/test"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-[#2563EB] dark:text-gray-300 cursor-pointer"
            >
              Test Payments
            </Link>
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-6">
        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex gap-4">
            {[
              { id: "overview", label: "Overview", icon: "📊" },
              { id: "transactions", label: "Transactions", icon: "💳" },
              { id: "subscriptions", label: "Subscriptions", icon: "🔄" },
              { id: "webhooks", label: "Webhook Logs", icon: "📡" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setPage(1);
                }}
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
        
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.totalTransactions}
                    </p>
                  </div>
                  <span className="text-2xl">💳</span>
                </div>
              </div>
              
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                    <p className="mt-1 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      ${stats.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                  <span className="text-2xl">💰</span>
                </div>
              </div>
              
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Subscriptions</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.activeSubscriptions}
                    </p>
                  </div>
                  <span className="text-2xl">✅</span>
                </div>
              </div>
              
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Failed Payments</p>
                    <p className="mt-1 text-3xl font-bold text-red-600 dark:text-red-400">
                      {stats.failedPayments}
                    </p>
                  </div>
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Recent Webhooks
                </h3>
                {webhookLogs.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No webhook logs found</p>
                ) : (
                  <div className="space-y-3">
                    {webhookLogs.slice(0, 5).map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-[#2563EB]/50"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {log.event_type}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(log.created_at)}
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                          Received
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Recent Transactions
                </h3>
                {transactions.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-[#2563EB]/50"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(tx.amount, tx.currency)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {tx.transaction_id.slice(0, 16)}...
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            tx.status === "completed"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                              : tx.status === "past_due"
                              ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <TestCardQuickReference />
          </div>
        )}
        
        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Transaction ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer">
                        <td className="px-4 py-3 font-mono text-sm text-gray-900 dark:text-gray-100">
                          {tx.transaction_id.slice(0, 20)}...
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                          {formatCurrency(tx.amount, tx.currency)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              tx.status === "completed"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                                : tx.status === "past_due"
                                ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-gray-600 dark:text-gray-400">
                          {tx.customer_id.slice(0, 12)}...
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(tx.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-800">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-200 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-700"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">Page {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={transactions.length < itemsPerPage}
                className="rounded-lg border border-gray-200 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {/* Subscriptions Tab */}
        {activeTab === "subscriptions" && (
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      User ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tier
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Current Period Ends
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        No subscriptions found
                      </td>
                    </tr>
                  ) : (
                    subscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer">
                        <td className="px-4 py-3 font-mono text-sm text-gray-900 dark:text-gray-100">
                          {sub.user_id.slice(0, 16)}...
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 capitalize">
                            {sub.tier}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              sub.status === "active"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                                : sub.status === "canceled"
                                ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                : sub.status === "past_due"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                                : "bg-gray-100 text-gray-700 dark:bg-[#2563EB] dark:text-gray-300"
                            }`}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {sub.current_period_end
                            ? formatDate(sub.current_period_end)
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(sub.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-800">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-200 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-700"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">Page {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={subscriptions.length < itemsPerPage}
                className="rounded-lg border border-gray-200 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {/* Webhooks Tab */}
        {activeTab === "webhooks" && (
          <div className="space-y-4">
            {webhookLogs.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
                <p className="text-gray-500 dark:text-gray-400">No webhook logs found</p>
              </div>
            ) : (
              webhookLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                          {log.provider}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {log.event_type}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Event ID: {log.event_id} • {formatDate(log.created_at)}
                      </p>
                    </div>
                  </div>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">
                      View Payload
                    </summary>
                    <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-gray-100 p-3 text-xs dark:bg-[#2563EB]">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </details>
                </div>
              ))
            )}
            
            {/* Pagination */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">Page {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={webhookLogs.length < itemsPerPage}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
