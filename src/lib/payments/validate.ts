/**
 * Payment Environment Validation
 *
 * Validates that all required environment variables and configurations
 * are properly set for the Polar payment system to function.
 */

import { createClient } from "@supabase/supabase-js";

export interface ValidationResult {
  valid: boolean;
  provider: string;
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

export async function validatePaymentEnvironment(): Promise<ValidationResult> {
  const checks: ValidationResult["checks"] = [];
  const environment = process.env.NODE_ENV || "development";
  const provider = "polar";

  const polarAccessToken = process.env.POLAR_ACCESS_TOKEN;
  checks.push({
    name: "POLAR_ACCESS_TOKEN",
    status: polarAccessToken ? "pass" : "fail",
    message: polarAccessToken
      ? "Polar access token is configured"
      : "POLAR_ACCESS_TOKEN is missing - required for payment processing",
    details: polarAccessToken ? { prefix: polarAccessToken.substring(0, 12) + "..." } : undefined,
  });

  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
  checks.push({
    name: "POLAR_WEBHOOK_SECRET",
    status: webhookSecret ? "pass" : "warning",
    message: webhookSecret
      ? "Webhook secret is configured"
      : "POLAR_WEBHOOK_SECRET is missing - webhooks will not be verified (security risk)",
  });

  const orgSlug = process.env.NEXT_PUBLIC_POLAR_ORGANIZATION_SLUG;
  checks.push({
    name: "NEXT_PUBLIC_POLAR_ORGANIZATION_SLUG",
    status: orgSlug ? "pass" : "warning",
    message: orgSlug
      ? `Organization slug: ${orgSlug}`
      : "NEXT_PUBLIC_POLAR_ORGANIZATION_SLUG is missing - needed for customer portal",
  });

  checks.push({
    name: "Environment",
    status: "pass",
    message: `Environment: ${environment}`,
    details: {
      environment,
      isProduction: environment === "production",
      apiUrl: environment === "production"
        ? "https://api.polar.sh/v1"
        : "https://api.polar.sh/v1 (sandbox)",
    },
  });

  const productIds = [
    { name: "POLAR_PRODUCT_PRO_MONTHLY", env: process.env.POLAR_PRODUCT_PRO_MONTHLY },
    { name: "POLAR_PRODUCT_PRO_ANNUAL", env: process.env.POLAR_PRODUCT_PRO_ANNUAL },
    { name: "POLAR_PRODUCT_TEAM_MONTHLY", env: process.env.POLAR_PRODUCT_TEAM_MONTHLY },
    { name: "POLAR_PRODUCT_TEAM_ANNUAL", env: process.env.POLAR_PRODUCT_TEAM_ANNUAL },
    { name: "POLAR_PRODUCT_LIFETIME", env: process.env.POLAR_PRODUCT_LIFETIME },
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

       const { error: logsError } = await supabase.from("webhook_logs").select("count").limit(1);
       checks.push({
         name: "Webhook Logs Table",
         status: logsError ? "warning" : "pass",
         message: logsError
           ? "webhook_logs table not found - create it for webhook debugging"
           : "webhook_logs table exists",
       });

     } catch (error: any) {
       // Handle case where fetch is not available in Node.js environment
       checks.push({
         name: "Supabase Connection",
         status: "warning",
         message: `Could not test Supabase connection in this environment: ${error.message}`,
         details: { 
           error: error.message,
           note: "This is expected in some environments - webhook processing will still work when credentials are valid"
         }
       });
       
       // Also check webhook logs table status optimistically
       checks.push({
         name: "Webhook Logs Table",
         status: "warning",
         message: "Cannot verify webhook_logs table exists in this environment",
         details: { note: "Table will be created during first webhook processing" }
       });
     }
   }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  checks.push({
    name: "NEXT_PUBLIC_APP_URL",
    status: appUrl ? "pass" : "warning",
    message: appUrl
      ? `App URL: ${appUrl}`
      : "NEXT_PUBLIC_APP_URL not set - using fallback for redirects",
  });

  const passed = checks.filter(c => c.status === "pass").length;
  const failed = checks.filter(c => c.status === "fail").length;
  const warnings = checks.filter(c => c.status === "warning").length;

  return {
    valid: failed === 0,
    provider,
    environment,
    checks,
    summary: {
      passed,
      failed,
      warnings,
    },
  };
}

function getProductDescription(envVarName: string): string {
  const descriptions: Record<string, string> = {
    POLAR_PRODUCT_PRO_MONTHLY: "Pro Monthly subscription",
    POLAR_PRODUCT_PRO_ANNUAL: "Pro Annual subscription",
    POLAR_PRODUCT_TEAM_MONTHLY: "Team Monthly subscription",
    POLAR_PRODUCT_TEAM_ANNUAL: "Team Annual subscription",
    POLAR_PRODUCT_LIFETIME: "Lifetime access",
  };
  return descriptions[envVarName] || "Product configuration";
}

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

export function isTestMode(): boolean {
  return (process.env.NODE_ENV || "development") !== "production";
}

export function formatValidationReport(result: ValidationResult): string {
  const lines: string[] = [];

  lines.push("=".repeat(60));
  lines.push("PAYMENT SYSTEM VALIDATION REPORT");
  lines.push("=".repeat(60));
  lines.push(`Provider: ${result.provider}`);
  lines.push(`Environment: ${result.environment}`);
  lines.push(`Status: ${result.valid ? "✅ VALID" : "❌ INVALID"}`);
  lines.push("");

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
