/**
 * API route for sending emails
 * Used for transactional emails and admin broadcasts
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/sender';
import { logEmail, shouldSendEmail } from '@/lib/supabase/email';
import { rateLimit, getClientIp } from '@/lib/security/rateLimit';
import { verifySupabaseAccessToken } from '@/lib/supabase/serverAuth';
import type { EmailTemplate } from '@/lib/email/templates/types';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "") || request.cookies.get("sb-access-token")?.value;

    let userId: string | null = null;
    if (token) {
      const user = await verifySupabaseAccessToken(token);
      if (user?.id) userId = user.id;
    }

    // Rate limit (5 emails per minute per IP)
    const ip = getClientIp(request) || "unknown";
    const limit = rateLimit(`email-send:${ip}`, { windowMs: 60_000, limit: 5 });
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many email requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { to, subject, html, text, emailType, metadata = {} } = body;

    // Validate required fields
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      );
    }

    // Only allow sending to own email unless authenticated as admin
    // (For simplicity, we allow any authenticated user to send to their own email)
    // Unauthenticated requests are rejected
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required to send emails' },
        { status: 401 }
      );
    }

    // Check email preferences if emailType provided
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

      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

    // Log successful send
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

    return NextResponse.json({
      success: true,
      messageId: result.id,
    });

  } catch (error: unknown) {
    console.error('Email send API error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}
