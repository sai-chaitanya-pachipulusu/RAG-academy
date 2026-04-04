/**
 * Webhook handler for email provider events
 * Handles delivery status, opens, clicks, bounces from Resend
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateEmailStatus } from '@/lib/supabase/email';

// Resend webhook event types
interface ResendWebhookEvent {
  type: 'email.sent' | 'email.delivered' | 'email.opened' | 'email.clicked' | 'email.bounced' | 'email.complained' | 'email.delivery_delayed';
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    // Additional fields based on event type
    click?: {
      ipAddress: string;
      link: string;
      timestamp: string;
      userAgent: string;
    };
    open?: {
      ipAddress: string;
      timestamp: string;
      userAgent: string;
    };
    bounce?: {
      reason: string;
      timestamp: string;
    };
  };
}

/**
 * Verify Resend webhook signature using HMAC-SHA256
 * Resend signs webhooks with a signing secret from the dashboard
 */
function verifyWebhookSignature(payload: string, signature: string | null): boolean {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('RESEND_WEBHOOK_SECRET not set — rejecting webhook for security');
    return false;
  }
  
  if (!signature) {
    console.warn('No signature provided in request');
    return false;
  }
  
  try {
    const crypto = require("crypto");
    
    const hmac = crypto.createHmac("sha256", webhookSecret);
    hmac.update(payload);
    const computedSignature = hmac.digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('resend-signature');
    const body = await request.text();
    
    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    const event: ResendWebhookEvent = JSON.parse(body);
    
    // Map Resend event types to our status
    const statusMap: Record<string, 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed'> = {
      'email.sent': 'sent',
      'email.delivered': 'delivered',
      'email.opened': 'opened',
      'email.clicked': 'clicked',
      'email.bounced': 'bounced',
      'email.complained': 'bounced',
      'email.delivery_delayed': 'sent', // Still considered sent
    };
    
    const status = statusMap[event.type];
    
    if (!status) {
      console.warn('Unknown webhook event type:', event.type);
      return NextResponse.json({ received: true });
    }
    
    // Find the email log by provider message ID
    // Note: We need to query the database to find the log entry
    // For now, we'll just log the event
    console.log('Email webhook event:', {
      type: event.type,
      emailId: event.data.email_id,
      to: event.data.to,
      subject: event.data.subject,
    });
    
    // Update email status if we can find the log entry
    // This would require storing the provider_message_id when sending
    // and looking it up here
    
    return NextResponse.json({ received: true });
    
  } catch (error: any) {
    console.error('Email webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle batch webhook events (Resend can send multiple events)
 */
export async function PUT(request: NextRequest) {
  // Delegate to POST for single event handling
  return POST(request);
}
