/**
 * Webhook handler for subscription events
 * Handles successful payments and sends confirmation emails
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendSubscriptionConfirmation } from '@/lib/email/triggers';
import { logEmail } from '@/lib/supabase/email';

// Initialize Supabase with service role
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error('Missing Supabase credentials');
  }
  
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify webhook signature (implement based on your payment provider)
    const signature = request.headers.get('webhook-signature');
    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    const supabase = getSupabaseAdmin();
    
    // Handle different event types
    switch (body.event) {
      case 'checkout.completed':
      case 'subscription.created':
      case 'subscription.active': {
        const { userId, tier, billingCycle, orderId, amount } = extractEventData(body);
        
        // Get user details
        const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
        
        if (userError || !user.user) {
          console.error('Failed to get user:', userError);
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        // Send subscription confirmation email
        const result = await sendSubscriptionConfirmation(
          { 
            id: userId, 
            email: user.user.email!, 
            name: user.user.user_metadata?.name 
          },
          {
            tier,
            price: amount,
            billingPeriod: billingCycle,
            startDate: new Date().toISOString(),
            nextBillingDate: billingCycle !== 'lifetime' 
              ? calculateNextBillingDate(billingCycle)
              : undefined,
          },
          orderId
        );
        
        // Log the email
        if (result.success) {
          await logEmail({
            user_id: userId,
            email_type: 'subscription_confirmation',
            recipient_email: user.user.email!,
            subject: `Welcome to RAG Academy ${tier.charAt(0).toUpperCase() + tier.slice(1)}!`,
            provider: 'resend',
            provider_message_id: result.id || null,
            status: 'sent',
            sent_at: new Date().toISOString(),
            delivered_at: null,
            opened_at: null,
            clicked_at: null,
            error_message: null,
            metadata: { tier, billingCycle, orderId },
          });
        } else {
          await logEmail({
            user_id: userId,
            email_type: 'subscription_confirmation',
            recipient_email: user.user.email!,
            subject: 'Subscription Confirmation',
            provider: 'resend',
            provider_message_id: null,
            status: 'failed',
            sent_at: null,
            delivered_at: null,
            opened_at: null,
            clicked_at: null,
            error_message: result.error || 'Unknown error',
            metadata: { tier, billingCycle, orderId },
          });
        }
        
        break;
      }
      
      default:
        console.log('Unhandled webhook event:', body.event);
    }
    
    return NextResponse.json({ received: true });
    
  } catch (error: any) {
    console.error('Subscription webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Verify webhook signature
 */
function verifyWebhookSignature(payload: any, signature: string | null): boolean {
  // Implement based on your payment provider's webhook verification
  // For Polar, use their webhook signing secret
  // For Paddle, use their webhook verification
  
  const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.warn('PAYMENT_WEBHOOK_SECRET not set, skipping verification');
    return true;
  }
  
  // TODO: Implement proper signature verification
  return true;
}

/**
 * Extract relevant data from webhook event
 */
function extractEventData(body: any) {
  // Adjust based on your payment provider's webhook format
  return {
    userId: body.user_id || body.metadata?.userId,
    tier: body.tier || body.metadata?.tier,
    billingCycle: body.billing_cycle || body.metadata?.billingCycle,
    orderId: body.id || body.order_id,
    amount: body.amount || body.total,
  };
}

/**
 * Calculate next billing date
 */
function calculateNextBillingDate(billingCycle: string): string {
  const now = new Date();
  
  if (billingCycle === 'annual') {
    now.setFullYear(now.getFullYear() + 1);
  } else {
    now.setMonth(now.getMonth() + 1);
  }
  
  return now.toISOString();
}
