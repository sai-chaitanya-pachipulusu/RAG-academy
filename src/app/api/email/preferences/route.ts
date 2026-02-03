/**
 * API route for managing email preferences
 * GET: Fetch user's email preferences
 * POST/PUT: Update email preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEmailPreferences, updateEmailPreferences } from '@/lib/supabase/email';

// Helper to get current user from request headers/cookies
async function getCurrentUser(request: NextRequest) {
  // Get the authorization header
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  
  // Verify token with Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'apikey': supabaseAnonKey,
    },
  });
  
  if (!response.ok) {
    return null;
  }
  
  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const preferences = await getEmailPreferences(user.id);

    if (!preferences) {
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({ preferences });

  } catch (error: any) {
    console.error('Get email preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate allowed fields
    const allowedFields = [
      'welcome_email',
      'streak_reminders',
      'weekly_digest',
      'challenge_notifications',
      'achievement_notifications',
      'subscription_notifications',
      'marketing_emails',
      'preferred_time',
      'timezone',
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const preferences = await updateEmailPreferences(user.id, updates);

    if (!preferences) {
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({ preferences });

  } catch (error: any) {
    console.error('Update email preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // POST delegates to PUT for updates
  return PUT(request);
}
