/**
 * API route for sending emails
 * Used for transactional emails and admin broadcasts
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/sender';
import { logEmail, shouldSendEmail } from '@/lib/supabase/email';
import type { EmailTemplate } from '@/lib/email/templates/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html, text, userId, emailType, metadata = {} } = body;

    // Validate required fields
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      );
    }

    // Check email preferences if userId and emailType provided
    if (userId && emailType) {
      const shouldSend = await shouldSendEmail(userId, emailType);
      if (!shouldSend) {
        return NextResponse.json(
          { message: 'Email not sent - user preferences disabled', skipped: true },
          { status: 200 }
        );
      }
    }

    // Create email template
    const template: EmailTemplate = {
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
    };

    // Send email
    const result = await sendEmail(to, template);

    if (!result.success) {
      // Log failed attempt
      if (userId) {
        await logEmail({
          user_id: userId,
          email_type: emailType || 'custom',
          recipient_email: to,
          subject,
          provider: 'resend',
          provider_message_id: null,
          status: 'failed',
          error_message: result.error || 'Unknown error',
          sent_at: null,
          delivered_at: null,
          opened_at: null,
          clicked_at: null,
          metadata,
        });
      }

      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

    // Log successful send
    if (userId) {
      await logEmail({
        user_id: userId,
        email_type: emailType || 'custom',
        recipient_email: to,
        subject,
        provider: 'resend',
        provider_message_id: result.id || null,
        status: 'sent',
        sent_at: new Date().toISOString(),
        delivered_at: null,
        opened_at: null,
        clicked_at: null,
        error_message: null,
        metadata,
      });
    }

    return NextResponse.json({
      success: true,
      messageId: result.id,
    });

  } catch (error: any) {
    console.error('Email send API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
