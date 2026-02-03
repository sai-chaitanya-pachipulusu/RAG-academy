/**
 * Subscription confirmation email template
 * Sent when a user purchases a subscription
 */

import { EmailTemplate, SubscriptionInfo } from './types';
import { getPlatformStats } from '@/lib/challenges/catalog';

export interface SubscriptionConfirmationData {
  userName: string;
  subscription: SubscriptionInfo;
  orderId: string;
  receiptUrl?: string;
}

function getTierDisplayName(tier: string): string {
  switch (tier) {
    case 'pro': return 'Pro';
    case 'team': return 'Team';
    case 'lifetime': return 'Lifetime';
    default: return tier.charAt(0).toUpperCase() + tier.slice(1);
  }
}

function getTierColor(tier: string): string {
  switch (tier) {
    case 'pro': return '#7c3aed';
    case 'team': return '#0891b2';
    case 'lifetime': return '#dc2626';
    default: return '#6b7280';
  }
}

export function getSubscriptionConfirmationEmail(data: SubscriptionConfirmationData): EmailTemplate {
  const { userName, subscription, orderId, receiptUrl } = data;
  const stats = getPlatformStats();
  const tierName = getTierDisplayName(subscription.tier);
  const tierColor = getTierColor(subscription.tier);
  const priceDisplay = subscription.billingPeriod === 'annual' 
    ? `$${subscription.price}/year` 
    : `$${subscription.price}/month`;

  return {
    subject: `Welcome to RAG Academy ${tierName}! 🎉`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${tierName}!</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f7;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, ${tierColor} 0%, ${tierColor}dd 100%); padding: 50px 30px; text-align: center;">
                    <div style="font-size: 64px; margin-bottom: 10px;">💎</div>
                    <h1 style="color: #ffffff; font-size: 32px; margin: 0; font-weight: 700;">Welcome to ${tierName}!</h1>
                    <p style="color: rgba(255,255,255,0.8); font-size: 18px; margin: 12px 0 0 0;">Your subscription is now active</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #1d1d1f; font-size: 18px; margin: 0 0 20px 0;">Hi ${userName},</p>
                    
                    <p style="color: #424245; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                      Thank you for upgrading to RAG Academy ${tierName}! Your subscription is now active and you have immediate access to all premium features.
                    </p>
                    
                    <!-- Subscription Details -->
                    <div style="background-color: #fafafa; border-radius: 16px; padding: 24px; margin: 30px 0; border: 2px solid #e5e5e7;">
                      <h2 style="color: #1d1d1f; font-size: 18px; margin: 0 0 20px 0;">Subscription Details</h2>
                      <table role="presentation" style="width: 100%;">
                        <tr>
                          <td style="padding: 8px 0; color: #6e6e73; font-size: 14px;">Plan</td>
                          <td style="padding: 8px 0; color: #1d1d1f; font-size: 14px; font-weight: 600; text-align: right;">${tierName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #6e6e73; font-size: 14px;">Price</td>
                          <td style="padding: 8px 0; color: #1d1d1f; font-size: 14px; font-weight: 600; text-align: right;">${priceDisplay}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #6e6e73; font-size: 14px;">Start Date</td>
                          <td style="padding: 8px 0; color: #1d1d1f; font-size: 14px; font-weight: 600; text-align: right;">${new Date(subscription.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                        </tr>
                        ${subscription.nextBillingDate ? `
                        <tr>
                          <td style="padding: 8px 0; color: #6e6e73; font-size: 14px;">Next Billing</td>
                          <td style="padding: 8px 0; color: #1d1d1f; font-size: 14px; font-weight: 600; text-align: right;">${new Date(subscription.nextBillingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                        </tr>
                        ` : ''}
                        <tr>
                          <td style="padding: 8px 0; color: #6e6e73; font-size: 14px;">Order ID</td>
                          <td style="padding: 8px 0; color: #1d1d1f; font-size: 14px; font-family: monospace; text-align: right;">${orderId}</td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- Price Lock Notice -->
                    <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 12px; padding: 20px; margin: 30px 0;">
                      <p style="color: #166534; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">✅ Price Locked In</p>
                      <p style="color: #15803d; font-size: 14px; margin: 0; line-height: 1.5;">
                        Your price of ${priceDisplay} is locked in forever. Even when we raise prices for new users, you'll always pay the same rate.
                      </p>
                    </div>
                    
                    <!-- What's Included -->
                    <h2 style="color: #1d1d1f; font-size: 20px; margin: 30px 0 16px 0;">What's Included</h2>
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 12px; background-color: #fafafa; border-radius: 8px;">
                          <p style="color: #1d1d1f; font-size: 15px; margin: 0;">✅ <strong>All ${stats.totalChallenges}+ challenges</strong> including advanced techniques</p>
                        </td>
                      </tr>
                      <tr><td style="height: 8px;"></td></tr>
                      <tr>
                        <td style="padding: 12px; background-color: #fafafa; border-radius: 8px;">
                          <p style="color: #1d1d1f; font-size: 15px; margin: 0;">✅ <strong>Progress tracking</strong> with detailed analytics</p>
                        </td>
                      </tr>
                      <tr><td style="height: 8px;"></td></tr>
                      <tr>
                        <td style="padding: 12px; background-color: #fafafa; border-radius: 8px;">
                          <p style="color: #1d1d1f; font-size: 15px; margin: 0;">✅ <strong>Priority support</strong> via email and Discord</p>
                        </td>
                      </tr>
                      <tr><td style="height: 8px;"></td></tr>
                      <tr>
                        <td style="padding: 12px; background-color: #fafafa; border-radius: 8px;">
                          <p style="color: #1d1d1f; font-size: 15px; margin: 0;">✅ <strong>Certificates</strong> of completion for your portfolio</p>
                        </td>
                      </tr>
                      ${subscription.tier === 'team' ? `
                      <tr><td style="height: 8px;"></td></tr>
                      <tr>
                        <td style="padding: 12px; background-color: #fafafa; border-radius: 8px;">
                          <p style="color: #1d1d1f; font-size: 15px; margin: 0;">✅ <strong>5 team seats</strong> to share with colleagues</p>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                    
                    <!-- Getting Started -->
                    <h2 style="color: #1d1d1f; font-size: 20px; margin: 30px 0 16px 0;">Getting Started</h2>
                    <div style="border-left: 4px solid ${tierColor}; padding-left: 16px; margin: 16px 0;">
                      <p style="color: #1d1d1f; font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">1. Explore all challenges</p>
                      <p style="color: #6e6e73; font-size: 14px; margin: 0;">Access the full curriculum including advanced RAG techniques.</p>
                    </div>
                    <div style="border-left: 4px solid ${tierColor}; padding-left: 16px; margin: 16px 0;">
                      <p style="color: #1d1d1f; font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">2. Track your progress</p>
                      <p style="color: #6e6e73; font-size: 14px; margin: 0;">Monitor your learning journey with detailed analytics.</p>
                    </div>
                    <div style="border-left: 4px solid ${tierColor}; padding-left: 16px; margin: 16px 0;">
                      <p style="color: #1d1d1f; font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">3. Join our community</p>
                      <p style="color: #6e6e73; font-size: 14px; margin: 0;">Get priority support on Discord and connect with other Pro members.</p>
                    </div>
                    
                    <!-- CTA -->
                    <div style="text-align: center; margin: 40px 0;">
                      <a href="https://rag-academy.com/learn" style="display: inline-block; background-color: ${tierColor}; color: #ffffff; padding: 16px 40px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px;">Start Learning →</a>
                    </div>
                    
                    ${receiptUrl ? `
                    <p style="color: #6e6e73; font-size: 14px; text-align: center; margin: 20px 0 0 0;">
                      <a href="${receiptUrl}" style="color: ${tierColor}; text-decoration: underline;">Download Receipt</a>
                    </p>
                    ` : ''}
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px; background-color: #f5f5f7; text-align: center; border-top: 1px solid #e5e5e7;">
                    <p style="color: #6e6e73; font-size: 14px; margin: 0 0 8px 0;">Questions? Reply to this email — we're here to help!</p>
                    <p style="color: #1d1d1f; font-size: 14px; font-weight: 600; margin: 0;">The RAG Academy Team</p>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #d1d1d6;">
                      <p style="color: #8e8e93; font-size: 12px; margin: 0;">
                        <a href="https://rag-academy.com/settings/email" style="color: #8e8e93; text-decoration: underline;">Manage email preferences</a> • 
                        <a href="https://rag-academy.com" style="color: #8e8e93; text-decoration: underline;">rag-academy.com</a>
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Welcome to RAG Academy ${tierName}!

Hi ${userName},

Thank you for upgrading to RAG Academy ${tierName}! Your subscription is now active and you have immediate access to all premium features.

Subscription Details:
- Plan: ${tierName}
- Price: ${priceDisplay}
- Start Date: ${new Date(subscription.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
${subscription.nextBillingDate ? `- Next Billing: ${new Date(subscription.nextBillingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
` : ''}- Order ID: ${orderId}

✅ Price Locked In
Your price of ${priceDisplay} is locked in forever. Even when we raise prices for new users, you'll always pay the same rate.

What's Included:
✅ All ${stats.totalChallenges}+ challenges including advanced techniques
✅ Progress tracking with detailed analytics
✅ Priority support via email and Discord
✅ Certificates of completion for your portfolio
${subscription.tier === 'team' ? '✅ 5 team seats to share with colleagues\n' : ''}
Getting Started:
1. Explore all challenges - Access the full curriculum including advanced RAG techniques.
2. Track your progress - Monitor your learning journey with detailed analytics.
3. Join our community - Get priority support on Discord and connect with other Pro members.

Start Learning: https://rag-academy.com/learn

${receiptUrl ? `Download Receipt: ${receiptUrl}

` : ''}Questions? Reply to this email — we're here to help!

The RAG Academy Team

Manage email preferences: https://rag-academy.com/settings/email
rag-academy.com
    `,
  };
}
