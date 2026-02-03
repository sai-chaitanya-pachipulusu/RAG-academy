/**
 * Welcome email template for new users
 */

import { EmailTemplate } from './types';
import { getPlatformStats } from '@/lib/challenges/catalog';

export interface WelcomeEmailData {
  userName: string;
  freeChallengeCount: number;
}

export function getWelcomeEmailNew(data: WelcomeEmailData): EmailTemplate {
  const { userName, freeChallengeCount } = data;
  const stats = getPlatformStats();

  return {
    subject: "Welcome to RAG Academy! 🎉",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to RAG Academy</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f7;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #1d1d1f 0%, #434344 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">Welcome to RAG Academy!</h1>
                    <p style="color: #a1a1aa; font-size: 16px; margin: 10px 0 0 0;">Your journey to RAG mastery starts now</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #1d1d1f; font-size: 18px; margin: 0 0 20px 0;">Hi ${userName},</p>
                    
                    <p style="color: #424245; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Welcome to the most comprehensive platform for learning RAG engineering. We're excited to have you join thousands of developers mastering retrieval-augmented generation.
                    </p>
                    
                    <div style="background-color: #f5f5f7; border-radius: 12px; padding: 24px; margin: 30px 0;">
                      <h2 style="color: #1d1d1f; font-size: 18px; margin: 0 0 16px 0;">Your free account includes:</h2>
                      <ul style="color: #424245; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                        <li><strong>${freeChallengeCount}</strong> foundational challenges</li>
                        <li>Essential playbooks and guides</li>
                        <li>Tool comparison matrices</li>
                        <li>Community Discord access</li>
                        <li>Progress tracking</li>
                      </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://rag-academy.com/learn" style="display: inline-block; background-color: #1d1d1f; color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px;">Start Learning →</a>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); border-radius: 12px; padding: 20px; margin: 30px 0;">
                      <p style="color: #92400e; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">🎉 Early Bird Special</p>
                      <p style="color: #78350f; font-size: 14px; margin: 0; line-height: 1.5;">
                        Lock in Pro access at <strong>$12/month forever</strong> before the price increases. Get access to all ${stats.totalChallenges}+ challenges.
                      </p>
                      <a href="https://rag-academy.com/pricing" style="display: inline-block; margin-top: 12px; color: #92400e; font-weight: 600; text-decoration: none;">View Pricing →</a>
                    </div>
                    
                    <h2 style="color: #1d1d1f; font-size: 18px; margin: 30px 0 16px 0;">Quick Tips to Get Started</h2>
                    
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 12px; background-color: #fafafa; border-radius: 8px; margin-bottom: 8px;">
                          <p style="color: #1d1d1f; font-size: 15px; font-weight: 600; margin: 0 0 4px 0;">1. Start with the basics</p>
                          <p style="color: #6e6e73; font-size: 14px; margin: 0;">Begin with foundational challenges to build your RAG fundamentals.</p>
                        </td>
                      </tr>
                      <tr><td style="height: 8px;"></td></tr>
                      <tr>
                        <td style="padding: 12px; background-color: #fafafa; border-radius: 8px;">
                          <p style="color: #1d1d1f; font-size: 15px; font-weight: 600; margin: 0 0 4px 0;">2. Join our community</p>
                          <p style="color: #6e6e73; font-size: 14px; margin: 0;">Connect with fellow learners on <a href="https://discord.gg/rag-academy" style="color: #5865F2; text-decoration: none;">Discord</a>.</p>
                        </td>
                      </tr>
                      <tr><td style="height: 8px;"></td></tr>
                      <tr>
                        <td style="padding: 12px; background-color: #fafafa; border-radius: 8px;">
                          <p style="color: #1d1d1f; font-size: 15px; font-weight: 600; margin: 0 0 4px 0;">3. Track your progress</p>
                          <p style="color: #6e6e73; font-size: 14px; margin: 0;">Monitor your learning journey with detailed analytics.</p>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #424245; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                      Have questions? Just reply to this email — we're here to help!
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px; background-color: #f5f5f7; text-align: center; border-top: 1px solid #e5e5e7;">
                    <p style="color: #6e6e73; font-size: 14px; margin: 0 0 8px 0;">Happy learning!</p>
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
    text: `Welcome to RAG Academy!

Hi ${userName},

Welcome to the most comprehensive platform for learning RAG engineering. We're excited to have you join thousands of developers mastering retrieval-augmented generation.

Your free account includes:
- ${freeChallengeCount} foundational challenges
- Essential playbooks and guides
- Tool comparison matrices
- Community Discord access
- Progress tracking

Start Learning: https://rag-academy.com/learn

🎉 Early Bird Special
Lock in Pro access at $12/month forever before the price increases. Get access to all ${stats.totalChallenges}+ challenges.
View Pricing: https://rag-academy.com/pricing

Quick Tips to Get Started:
1. Start with the basics - Begin with foundational challenges to build your RAG fundamentals.
2. Join our community - Connect with fellow learners on Discord: https://discord.gg/rag-academy
3. Track your progress - Monitor your learning journey with detailed analytics.

Have questions? Just reply to this email — we're here to help!

Happy learning!
The RAG Academy Team

Manage email preferences: https://rag-academy.com/settings/email
rag-academy.com
    `,
  };
}
