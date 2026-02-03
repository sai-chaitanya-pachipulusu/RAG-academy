/**
 * Unsubscribe endpoint
 * Allows users to unsubscribe from specific email types or all emails
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateEmailPreferences, unsubscribeAll } from '@/lib/supabase/email';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // 'all', 'streak', 'digest', 'challenges', 'achievements', 'marketing'
    const token = searchParams.get('token'); // Verification token
    
    // Validate required parameters
    if (!userId || !token) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Verify token (in production, implement proper token verification)
    // For now, we'll use a simple hash verification
    const expectedToken = generateUnsubscribeToken(userId);
    if (token !== expectedToken) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    let success = false;
    
    // Handle different unsubscribe types
    switch (type) {
      case 'all':
        success = await unsubscribeAll(userId);
        break;
        
      case 'streak':
        success = !!(await updateEmailPreferences(userId, { streak_reminders: false }));
        break;
        
      case 'digest':
        success = !!(await updateEmailPreferences(userId, { weekly_digest: false }));
        break;
        
      case 'challenges':
        success = !!(await updateEmailPreferences(userId, { challenge_notifications: false }));
        break;
        
      case 'achievements':
        success = !!(await updateEmailPreferences(userId, { achievement_notifications: false }));
        break;
        
      case 'marketing':
        success = !!(await updateEmailPreferences(userId, { marketing_emails: false }));
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid unsubscribe type' },
          { status: 400 }
        );
    }
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }
    
    // Return HTML success page
    return new NextResponse(getUnsubscribeSuccessHtml(type), {
      headers: { 'Content-Type': 'text/html' },
    });
    
  } catch (error: any) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type = 'all' } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }
    
    let success = false;
    
    switch (type) {
      case 'all':
        success = await unsubscribeAll(userId);
        break;
      case 'streak':
        success = !!(await updateEmailPreferences(userId, { streak_reminders: false }));
        break;
      case 'digest':
        success = !!(await updateEmailPreferences(userId, { weekly_digest: false }));
        break;
      case 'challenges':
        success = !!(await updateEmailPreferences(userId, { challenge_notifications: false }));
        break;
      case 'achievements':
        success = !!(await updateEmailPreferences(userId, { achievement_notifications: false }));
        break;
      case 'marketing':
        success = !!(await updateEmailPreferences(userId, { marketing_emails: false }));
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid unsubscribe type' },
          { status: 400 }
        );
    }
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully unsubscribed from ${type} emails` 
    });
    
  } catch (error: any) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate a secure unsubscribe token
 * In production, use a proper HMAC or JWT
 */
function generateUnsubscribeToken(userId: string): string {
  // Simple hash for demonstration
  // In production, use crypto.createHmac or similar
  const secret = process.env.UNSUBSCRIBE_SECRET || 'default-secret-change-in-production';
  return Buffer.from(`${userId}:${secret}`).toString('base64').substring(0, 32);
}

/**
 * Generate unsubscribe success HTML page
 */
function getUnsubscribeSuccessHtml(type: string | null): string {
  const typeLabel = type === 'all' ? 'all emails' : `${type} emails`;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribed - RAG Academy</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1d1d1f 0%, #434344 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 20px;
      padding: 60px 40px;
      max-width: 500px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
    h1 {
      color: #1d1d1f;
      font-size: 28px;
      margin-bottom: 16px;
    }
    p {
      color: #6e6e73;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .button {
      display: inline-block;
      background: #1d1d1f;
      color: white;
      padding: 14px 32px;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 600;
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
    }
    .note {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e5e5e7;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">✅</div>
    <h1>You've Been Unsubscribed</h1>
    <p>You have successfully unsubscribed from ${typeLabel}. We're sorry to see you go!</p>
    <p class="note">Changed your mind? You can always update your email preferences in your <a href="https://rag-academy.com/settings/email">account settings</a>.</p>
    <a href="https://rag-academy.com" class="button">Return to RAG Academy</a>
  </div>
</body>
</html>
  `;
}
