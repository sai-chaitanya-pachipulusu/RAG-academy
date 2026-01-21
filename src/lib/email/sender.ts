/**
 * Email sending utilities using Resend
 * Install: npm install resend
 */

import { Resend } from "resend";
import type { EmailTemplate } from "./templates";
import {
  getWelcomeEmail,
  getCountdown7DaysEmail,
  getCountdown3DaysEmail,
  getCountdown1DayEmail,
  getThankYouEmail,
} from "./templates";

// Lazy init to avoid build-time errors when RESEND_API_KEY is not set
let resendInstance: Resend | null = null;
function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

const FROM_EMAIL = "RAG Academy <hello@rag-academy.com>";

export async function sendEmail(
  to: string,
  template: EmailTemplate
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (error) {
      console.error("Email sending error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error: any) {
    console.error("Email sending exception:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  to: string,
  userName: string,
  freeChallengeCount: number
) {
  const template = getWelcomeEmail(userName, freeChallengeCount);
  return sendEmail(to, template);
}

/**
 * Send countdown email (7 days before price increase)
 */
export async function send7DayCountdownEmail(
  to: string,
  daysRemaining: number,
  currentPrice: number,
  nextPrice: number
) {
  const template = getCountdown7DaysEmail(daysRemaining, currentPrice, nextPrice);
  return sendEmail(to, template);
}

/**
 * Send countdown email (3 days before price increase)
 */
export async function send3DayCountdownEmail(
  to: string,
  daysRemaining: number,
  currentPrice: number,
  nextPrice: number
) {
  const template = getCountdown3DaysEmail(daysRemaining, currentPrice, nextPrice);
  return sendEmail(to, template);
}

/**
 * Send countdown email (1 day before price increase)
 */
export async function send1DayCountdownEmail(
  to: string,
  currentPrice: number,
  nextPrice: number
) {
  const template = getCountdown1DayEmail(currentPrice, nextPrice);
  return sendEmail(to, template);
}

/**
 * Send thank you email after upgrade
 */
export async function sendThankYouEmail(
  to: string,
  userName: string,
  tier: string,
  price: number,
  phase: string
) {
  const template = getThankYouEmail(userName, tier, price, phase);
  return sendEmail(to, template);
}
