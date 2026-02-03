/**
 * Payment Environment Validation
 * 
 * Validates that all required environment variables and configurations
 * are properly set for the payment system to function.
 */

import { createClient } from "@supabase/supabase-js";

export interface ValidationResult {
  valid: boolean;
  environment: string;
  checks: {
    name: string;
    status: "pass" | "fail" | "warning";
    message: string;
    details?: Record<string, unknown>;
  }[];
  summary: {
    passed: number;
    failed: number;
    warnings: number;
  };
}

/**
 * Validate all payment-related environment variables
 */
export async function validatePaymentEnvironment(): Promise<ValidationResult> {
  const checks: ValidationResult["checks"] = [];
  const environment = process.env.PADDLE_ENVIRONMENT || "sandbox";
  
  // Check Paddle API Key
  const paddleApiKey = process.env.PADDLE_API_KEY;
  checks.push({
    name: "PADDLE_API_KEY",
    status: paddleApiKey ? "pass" : "fail",
    message: paddleApiKey 
      ? "Paddle API key is configured" 
      : "PADDLE_API_KEY is missing - required for payment processing",
    details: paddleApiKey ? { prefix: paddleApiKey.substring(0, 8) + "..." } : undefined,
  });
  
  // Check Paddle Webhook Secret
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
  checks.push({
    name: "PADDLE_WEBHOOK_SECRET",
    status: webhookSecret ? "pass" : "warning",
    message: webhookSecret 
      ? "Webhook secret is configured" 
      : "PADDLE_WEBHOOK_SECRET is missing - webhooks will not be verified (security risk)",
  });
  
  // Check Paddle Environment
  checks.push({
    name: "PADDLE_ENVIRONMENT",
    status: "pass",
    message: `Paddle environment: ${environment}`,
    details: { 
      environment,
      isProduction: environment === "production",
      apiUrl: environment === "production" 
        ? "https://api.paddle.com" 
        : "https://sandbox-api.paddle.com"
    },
  });
  
  // Check Product IDs
  const productIds = [
    { name: "PADDLE_PRODUCT_PRO_MONTHLY", env: process.env.PADDLE_PRODUCT_PRO_MONTHLY },
    { name: "PADDLE_PRODUCT_PRO_ANNUAL", env: process.env.PADDLE_PRODUCT_PRO_ANNUAL },
    { name: "PADDLE_PRODUCT_TEAM_MONTHLY", env: process.env.PADDLE_PRODUCT_TEAM_MONTHLY },
    { name: "PADDLE_PRODUCT_TEAM_ANNUAL", env: process.env.PADDLE_PRODUCT_TEAM_ANNUAL },
    { name: "PADDLE_PRODUCT_LIFETIME", env: process.env.PADDLE_PRODUCT_LIFETIME },
  ];
  
  for (const product of productIds) {
    checks.push({
      name: product.name,
      status: product.env ? "pass" : "warning",
      message: product.env 
        ? `${product.name} is configured` 
        : `${product.name} is missing - ${getProductDescription(product.name)}`,
      details: product.env ? { id: product.env } : undefined,
    });
  }
  
  // Check Supabase credentials
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  checks.push({
    name: "Supabase URL",
    status: supabaseUrl ? "pass" : "fail",
    message: supabaseUrl ? "Supabase URL is configured" : "NEXT_PUBLIC_SUPABASE_URL is missing",
  });
  
  checks.push({
    name: "Supabase Service Key",
    status: supabaseServiceKey ? "pass" : "fail",
    message: supabaseServiceKey 
      ? "Supabase service key is configured" 
      : "SUPABASE_SERVICE_ROLE_KEY is missing - required for webhook processing",
  });
  
  // Test Supabase connection
  if (supabaseUrl && supabaseServiceKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data, error } = await supabase.from("subscriptions").select("count").limit(1);
      
      checks.push({
        name: "Supabase Connection",
        status: error ? "fail" : "pass",
        message: error 
          ? `Failed to connect to Supabase: ${error.message}` 
          : "Successfully connected to Supabase",
        details: error ? { error: error.message } : undefined,
      });
      
      // Check if webhook_logs table exists
      const { error: logsError } = await supabase.from("webhook_logs").select("count").limit(1);
      checks.push({
        name: "Webhook Logs Table",
        status: logsError ? "warning" : "pass",
        message: logsError 
          ? "webhook_logs table not found - create it for webhook debugging" 
          : "webhook_logs table exists",
      });
      
      // Check if transactions table exists
      const { error: transError } = await supabase.from("transactions").select("count").limit(1);
      checks.push({
        name: "Transactions Table",
        status: transError ? "warning" : "pass",
        message: transError 
          ? "transactions table not found - create it for transaction tracking" 
          : "transactions table exists",
      });
      
    } catch (error: any) {
      checks.push({
        name: "Supabase Connection",
        status: "fail",
        message: `Failed to connect to Supabase: ${error.message}`,
      });
    }
  }
  
  // Check App URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  checks.push({
    name: "NEXT_PUBLIC_APP_URL",
    status: appUrl ? "pass" : "warning",
    message: appUrl 
      ? `App URL: ${appUrl}` 
      : "NEXT_PUBLIC_APP_URL not set - using fallback for redirects",
  });
  
  // Calculate summary
  const passed = checks.filter(c => c.status === "pass").length;
  const failed = checks.filter(c => c.status === "fail").length;
  const warnings = checks.filter(c => c.status === "warning").length;
  
  return {
    valid: failed === 0,
    environment,
    checks,
    summary: {
      passed,
      failed,
      warnings,
    },
  };
}

/**
 * Get description for product environment variable
 */
function getProductDescription(envVarName: string): string {
  const descriptions: Record<string, string> = {
    PADDLE_PRODUCT_PRO_MONTHLY: "Pro Monthly subscription",
    PADDLE_PRODUCT_PRO_ANNUAL: "Pro Annual subscription",
    PADDLE_PRODUCT_TEAM_MONTHLY: "Team Monthly subscription",
    PADDLE_PRODUCT_TEAM_ANNUAL: "Team Annual subscription",
    PADDLE_PRODUCT_LIFETIME: "Lifetime access",
  };
  return descriptions[envVarName] || "Product configuration";
}

/**
 * Validate a specific webhook signature
 */
export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): { valid: boolean; message: string } {
  if (!secret) {
    return {
      valid: false,
      message: "Webhook secret is not configured",
    };
  }
  
  if (!signature) {
    return {
      valid: false,
      message: "No signature provided in request",
    };
  }
  
  try {
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(payload);
    const computedSignature = hmac.digest("hex");
    
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );
    
    return {
      valid: isValid,
      message: isValid ? "Signature is valid" : "Signature mismatch",
    };
  } catch (error: any) {
    return {
      valid: false,
      message: `Signature validation error: ${error.message}`,
    };
  }
}

/**
 * Check if running in test/sandbox mode
 */
export function isTestMode(): boolean {
  return (process.env.PADDLE_ENVIRONMENT || "sandbox") !== "production";
}

/**
 * Get validation report as formatted string
 */
export function formatValidationReport(result: ValidationResult): string {
  const lines: string[] = [];
  
  lines.push("=".repeat(60));
  lines.push("PAYMENT SYSTEM VALIDATION REPORT");
  lines.push("=".repeat(60));
  lines.push(`Environment: ${result.environment}`);
  lines.push(`Status: ${result.valid ? "✅ VALID" : "❌ INVALID"}`);
  lines.push("");
  
  // Group by status
  const failed = result.checks.filter(c => c.status === "fail");
  const warnings = result.checks.filter(c => c.status === "warning");
  const passed = result.checks.filter(c => c.status === "pass");
  
  if (failed.length > 0) {
    lines.push("❌ FAILED CHECKS:");
    failed.forEach(check => {
      lines.push(`  • ${check.name}: ${check.message}`);
    });
    lines.push("");
  }
  
  if (warnings.length > 0) {
    lines.push("⚠️  WARNINGS:");
    warnings.forEach(check => {
      lines.push(`  • ${check.name}: ${check.message}`);
    });
    lines.push("");
  }
  
  if (passed.length > 0) {
    lines.push("✅ PASSED CHECKS:");
    passed.forEach(check => {
      lines.push(`  • ${check.name}: ${check.message}`);
    });
    lines.push("");
  }
  
  lines.push("-".repeat(60));
  lines.push(`Summary: ${passed.length} passed, ${failed.length} failed, ${warnings.length} warnings`);
  lines.push("=".repeat(60));
  
  return lines.join("\n");
}
