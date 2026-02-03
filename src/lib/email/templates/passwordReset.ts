/**
 * Password reset email template
 * Sent when a user requests a password reset
 */

import { EmailTemplate } from './types';

export interface PasswordResetData {
  userName: string;
  resetToken: string;
  resetUrl: string;
  expiresIn: string;
}

export function getPasswordResetEmail(data: PasswordResetData): EmailTemplate {
  const { userName, resetUrl, expiresIn } = data;

  return {
    subject: "Reset your RAG Academy password 🔐",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f7;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #374151 0%, #1f2937 100%); padding: 40px 30px; text-align: center;">
                    <div style="font-size: 56px; margin-bottom: 10px;">🔐</div>
                    <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">Reset Your Password</h1>
                    <p style="color: #9ca3af; font-size: 16px; margin: 10px 0 0 0;">Secure your account</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #1d1d1f; font-size: 18px; margin: 0 0 20px 0;">Hi ${userName},</p>
                    
                    <p style="color: #424245; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                      We received a request to reset your RAG Academy password. Click the button below to create a new password.
                    </p>
                    
                    <!-- Security Notice -->
                    <div style="background-color: #fef3c7; border-radius: 12px; padding: 16px; margin: 30px 0; border-left: 4px solid #f59e0b;">
                      <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
                        <strong>Security tip:</strong> This link will expire in ${expiresIn}. If you didn't request this reset, you can safely ignore this email.
                      </p>
                    </div>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 40px 0;">
                      <a href="${resetUrl}" style="display: inline-block; background-color: #374151; color: #ffffff; padding: 16px 40px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px;">Reset Password →</a>
                    </div>
                    
                    <!-- Alternative Link -->
                    <div style="background-color: #f5f5f7; border-radius: 8px; padding: 16px; margin: 30px 0;">
                      <p style="color: #6e6e73; font-size: 13px; margin: 0 0 8px 0;">Or copy and paste this link into your browser:</p>
                      <p style="color: #1d1d1f; font-size: 13px; margin: 0; word-break: break-all; font-family: monospace;">${resetUrl}</p>
                    </div>
                    
                    <!-- Help -->
                    <div style="border-top: 1px solid #e5e5e7; padding-top: 24px; margin-top: 30px;">
                      <p style="color: #6e6e73; font-size: 14px; margin: 0 0 8px 0;">Need help?</p>
                      <p style="color: #424245; font-size: 14px; margin: 0; line-height: 1.5;">
                        If you're having trouble, contact us at <a href="mailto:support@rag-academy.com" style="color: #374151; text-decoration: underline;">support@rag-academy.com</a>
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px; background-color: #f5f5f7; text-align: center; border-top: 1px solid #e5e5e7;">
                    <p style="color: #6e6e73; font-size: 14px; margin: 0 0 8px 0;">Stay secure!</p>
                    <p style="color: #1d1d1f; font-size: 14px; font-weight: 600; margin: 0;">The RAG Academy Team</p>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #d1d1d6;">
                      <p style="color: #8e8e93; font-size: 12px; margin: 0;">
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
    text: `Reset Your RAG Academy Password

Hi ${userName},

We received a request to reset your RAG Academy password. Click the link below to create a new password:

Reset Password: ${resetUrl}

Security tip: This link will expire in ${expiresIn}. If you didn't request this reset, you can safely ignore this email.

Need help? Contact us at support@rag-academy.com

Stay secure!
The RAG Academy Team

rag-academy.com
    `,
  };
}
