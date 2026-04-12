/**
 * Vector Database Connector Component
 * 
 * UI for connecting to and managing external vector databases.
 * Includes connection testing, index browsing, and query interface.
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Key,
  Globe,
  Server,
  AlertCircle,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TouchButton } from "@/components/ui/TouchButton";
import { useToast } from "@/components/ui/Toast";
import type {
  VectorDbProvider,
  VectorDbTestResult,
  VectorDbIndex,
  StoredConnection,
} from "@/lib/integrations/vectorDatabases";
import {
  VECTOR_DB_CONFIGS,
  testVectorDbConnection,
  saveConnection,
  loadConnections,
  deleteConnection,
  getProviderName,
  getProviderFeatures,
  hasFreeTier,
  getProviderDocsUrl,
  validateConnectionParams,
} from "@/lib/integrations/vectorDatabases";

interface VectorDbConnectorProps {
  onConnectionSelect?: (connection: StoredConnection) => void;
  selectable?: boolean;
}

export function VectorDbConnector({
  onConnectionSelect,
  selectable = false,
}: VectorDbConnectorProps) {
  const [connections, setConnections] = useState<StoredConnection[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<VectorDbProvider | null>(null);
  const [expandedConnection, setExpandedConnection] = useState<string | null>(null);
  const { addToast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    endpoint: "",
    apiKey: "",
    environment: "",
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<VectorDbTestResult | null>(null);

  useEffect(() => {
    setConnections(loadConnections());
  }, []);

  const handleTestConnection = async () => {
    if (!selectedProvider) return;

    const validation = validateConnectionParams(
      selectedProvider,
      formData.endpoint,
      formData.apiKey,
      formData.environment
    );

    if (!validation.valid) {
      addToast(validation.error || "Invalid parameters", "error");
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const result = await testVectorDbConnection(
      selectedProvider,
      formData.endpoint,
      formData.apiKey,
      formData.environment
    );

    setTestResult(result);
    setIsTesting(false);

    if (result.success) {
      addToast(`Connected successfully! Latency: ${result.latencyMs}ms`, "success");
    } else {
      addToast(result.error || "Connection failed", "error");
    }
  };

  const handleSaveConnection = () => {
    if (!selectedProvider || !testResult?.success) return;

    const newConnection: StoredConnection = {
      id: `conn_${Date.now()}`,
      provider: selectedProvider,
      name: formData.name || `${getProviderName(selectedProvider)} Connection`,
      endpoint: formData.endpoint,
      environment: formData.environment || undefined,
      hasApiKey: !!formData.apiKey,
      isActive: true,
      lastTestedAt: new Date().toISOString(),
    };

    saveConnection(newConnection);
    setConnections([...connections, newConnection]);
    setIsAddingNew(false);
    setSelectedProvider(null);
    setFormData({ name: "", endpoint: "", apiKey: "", environment: "" });
    setTestResult(null);

    addToast("Connection saved!", "success");
  };

  const handleDeleteConnection = (id: string) => {
    if (!confirm("Are you sure you want to delete this connection?")) return;

    deleteConnection(id);
    setConnections(connections.filter((c) => c.id !== id));
    addToast("Connection deleted", "success");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Vector Database Connections
          </h2>
          <p className="text-sm text-gray-500">
            Connect to external vector databases for real-world testing
          </p>
        </div>
        <TouchButton
          onClick={() => setIsAddingNew(true)}
          className="bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Connection
        </TouchButton>
      </div>

      {/* Provider Selection */}
      <AnimatePresence>
        {isAddingNew && !selectedProvider && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-6">
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">
                Select Provider
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(Object.keys(VECTOR_DB_CONFIGS) as VectorDbProvider[]).map((provider) => {
                  const config = VECTOR_DB_CONFIGS[provider];
                  return (
                    <button
                      key={provider}
                      onClick={() => setSelectedProvider(provider)}
                      className="rounded-lg border border-gray-200 p-4 text-left transition-all duration-200-all duration-200 hover:border-indigo-500 hover:bg-indigo-50 dark:border-gray-800 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/20 cursor-pointer"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {config.name}
                        </span>
                        {hasFreeTier(provider) && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            Free Tier
                          </span>
                        )}
                      </div>
                      <p className="mb-3 text-sm text-gray-500">{config.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {config.features.slice(0, 2).map((feature) => (
                          <span
                            key={feature}
                            className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-[#2563EB] dark:text-gray-400"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex justify-end">
                <TouchButton variant="ghost" onClick={() => setIsAddingNew(false)}>
                  Cancel
                </TouchButton>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Form */}
      <AnimatePresence>
        {selectedProvider && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Connect to {getProviderName(selectedProvider)}
                </h3>
                <a
                  href={getProviderDocsUrl(selectedProvider)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-indigo-600 hover:underline cursor-pointer"
                >
                  <ExternalLink className="h-3 w-3" />
                  Docs
                </a>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Connection Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={`My ${getProviderName(selectedProvider)}`}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Globe className="mb-0.5 mr-1 inline h-4 w-4" />
                    Endpoint URL
                  </label>
                  <input
                    type="url"
                    value={formData.endpoint}
                    onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                    placeholder={
                      selectedProvider === "pinecone"
                        ? "https://your-index.pinecone.io"
                        : "https://your-instance.com"
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
                  />
                </div>

                {VECTOR_DB_CONFIGS[selectedProvider].supportsEnvironment && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Server className="mb-0.5 mr-1 inline h-4 w-4" />
                      Environment
                    </label>
                    <select
                      value={formData.environment}
                      onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
                    >
                      <option value="">Select environment...</option>
                      <option value="gcp-starter">GCP Starter (Free)</option>
                      <option value="us-west1-gcp">GCP US West</option>
                      <option value="us-east1-gcp">GCP US East</option>
                      <option value="eu-west1-gcp">GCP EU West</option>
                      <option value="us-east1-aws">AWS US East</option>
                    </select>
                  </div>
                )}

                {VECTOR_DB_CONFIGS[selectedProvider].requiresApiKey && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Key className="mb-0.5 mr-1 inline h-4 w-4" />
                      API Key
                    </label>
                    <input
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      placeholder="Enter your API key"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Your API key is encrypted and stored securely
                    </p>
                  </div>
                )}

                {/* Test Result */}
                {testResult && (
                  <div
                    className={`rounded-lg p-4 ${
                      testResult.success
                        ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                        : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {testResult.success ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                      <span className="font-medium">
                        {testResult.success ? "Connection successful!" : "Connection failed"}
                      </span>
                    </div>
                    {testResult.success && (
                      <p className="mt-1 text-sm">
                        Latency: {testResult.latencyMs}ms
                        {testResult.indexes && ` • ${testResult.indexes.length} indexes found`}
                      </p>
                    )}
                    {!testResult.success && testResult.error && (
                      <p className="mt-1 text-sm">{testResult.error}</p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <TouchButton
                    variant="ghost"
                    onClick={() => {
                      setSelectedProvider(null);
                      setTestResult(null);
                    }}
                  >
                    Back
                  </TouchButton>
                  <TouchButton
                    variant="secondary"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isTesting ? "animate-spin" : ""}`} />
                    {isTesting ? "Testing..." : "Test Connection"}
                  </TouchButton>
                  <TouchButton
                    onClick={handleSaveConnection}
                    disabled={!testResult?.success}
                    className="bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                  >
                    Save Connection
                  </TouchButton>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Connections */}
      {connections.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Saved Connections
          </h3>
          {connections.map((connection) => (
            <Card key={connection.id} className="overflow-hidden">
              <div
                className="flex cursor-pointer items-center justify-between p-4"
                onClick={() =>
                  setExpandedConnection(
                    expandedConnection === connection.id ? null : connection.id
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                    <Database className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {connection.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {getProviderName(connection.provider)} • {connection.endpoint}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {connection.isActive ? (
                    <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      <Zap className="h-3 w-3" />
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-[#2563EB] dark:text-gray-400">
                      Inactive
                    </span>
                  )}
                  {selectable && (
                    <TouchButton
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onConnectionSelect?.(connection);
                      }}
                    >
                      Select
                    </TouchButton>
                  )}
                  <TouchButton
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConnection(connection.id);
                    }}
                    className="text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </TouchButton>
                  {expandedConnection === connection.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              <AnimatePresence>
                {expandedConnection === connection.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50"
                  >
                    <div className="p-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-gray-500">Provider</p>
                          <p className="font-medium">{getProviderName(connection.provider)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Endpoint</p>
                          <p className="font-medium">{connection.endpoint}</p>
                        </div>
                        {connection.environment && (
                          <div>
                            <p className="text-xs text-gray-500">Environment</p>
                            <p className="font-medium">{connection.environment}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-500">Last Tested</p>
                          <p className="font-medium">
                            {connection.lastTestedAt
                              ? new Date(connection.lastTestedAt).toLocaleString()
                              : "Never"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="mb-2 text-xs text-gray-500">Features</p>
                        <div className="flex flex-wrap gap-2">
                          {getProviderFeatures(connection.provider).map((feature) => (
                            <span
                              key={feature}
                              className="rounded bg-white px-2 py-1 text-xs text-gray-600 shadow-sm dark:bg-[#2563EB] dark:text-gray-400"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      )}

      {connections.length === 0 && !isAddingNew && (
        <Card className="p-8 text-center">
          <Database className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
            No Connections Yet
          </h3>
          <p className="mb-4 text-gray-500">
            Connect to Pinecone, Weaviate, Qdrant, or other vector databases to test your RAG implementations
          </p>
          <button
            onClick={() => setIsAddingNew(true)}
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Connection
          </button>
        </Card>
      )}
    </div>
  );
}
