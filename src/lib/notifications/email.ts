/**
 * Email Notification System Scaffold
 * 
 * This module provides the foundation for email notifications.
 * Implementation requires Resend API integration.
 */

export interface EmailNotification {
  to: string;
  subject: string;
  template: EmailTemplate;
  data: Record<string, unknown>;
}

export type EmailTemplate =
  | "welcome"
  | "streak-reminder"
  | "streak-at-risk"
  | "weekly-digest"
  | "challenge-complete"
  | "phase-complete"
  | "achievement-unlocked"
  | "account-activated";

// Email templates configuration
export const EMAIL_TEMPLATES: Record<EmailTemplate, {
  subject: string;
  previewText: string;
}> = {
  welcome: {
    subject: "Welcome to RAG Academy! 🎓",
    previewText: "Start your journey to mastering RAG systems",
  },
  "streak-reminder": {
    subject: "🔥 Don't break your streak!",
    previewText: "Complete a challenge today to keep your streak alive",
  },
  "streak-at-risk": {
    subject: "⚠️ Your streak is at risk!",
    previewText: "You have 24 hours to maintain your learning streak",
  },
  "weekly-digest": {
    subject: "📊 Your Weekly RAG Academy Report",
    previewText: "See your progress and what's next",
  },
  "challenge-complete": {
    subject: "🎯 Challenge Completed!",
    previewText: "Great job completing another challenge",
  },
  "phase-complete": {
    subject: "🏆 Phase Complete!",
    previewText: "You've mastered another phase of RAG learning",
  },
  "achievement-unlocked": {
    subject: "🌟 Achievement Unlocked!",
    previewText: "You've earned a new achievement",
  },
  "account-activated": {
    subject: "✅ Account Activated",
    previewText: "Your RAG Academy account is ready",
  },
};

// User notification preferences
export interface NotificationPreferences {
  streakReminders: boolean;
  weeklyDigest: boolean;
  achievementNotifications: boolean;
  marketingEmails: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  streakReminders: true,
  weeklyDigest: true,
  achievementNotifications: true,
  marketingEmails: false,
};

/**
 * Send an email notification
 * Requires RESEND_API_KEY to be set in environment
 */
export async function sendEmail(notification: EmailNotification): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.warn("[Email] RESEND_API_KEY not configured, skipping email");
    return { success: false, error: "Email service not configured" };
  }

  const template = EMAIL_TEMPLATES[notification.template];
  
  try {
    // Resend API integration
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "RAG Academy <noreply@ragacademy.com>",
        to: notification.to,
        subject: template.subject,
        // In production, render actual HTML templates
        html: generateEmailHTML(notification.template, notification.data),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Email] Failed to send:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error("[Email] Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Generate email HTML from template
 * In production, use a proper templating engine like React Email
 */
function generateEmailHTML(template: EmailTemplate, data: Record<string, unknown>): string {
  const baseStyles = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #18181b; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 32px; }
    .logo { font-size: 24px; font-weight: bold; }
    .content { background: #f4f4f5; border-radius: 16px; padding: 32px; }
    .button { display: inline-block; background: #18181b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px; }
    .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #71717a; }
  `;

  const templateContent: Record<EmailTemplate, string> = {
    welcome: `
      <div class="content">
        <h1>Welcome to RAG Academy! 🎓</h1>
        <p>You've just taken the first step toward mastering Retrieval-Augmented Generation.</p>
        <p>Here's what's waiting for you:</p>
        <ul>
          <li>📚 12 comprehensive modules</li>
          <li>💻 50+ hands-on challenges</li>
          <li>🏆 Skill-based achievements</li>
        </ul>
        <a href="https://ragacademy.com/learn" class="button">Start Learning</a>
      </div>
    `,
    "streak-reminder": `
      <div class="content">
        <h1>🔥 Your ${data.streakDays || 0} day streak is waiting!</h1>
        <p>Complete just one challenge today to keep your streak alive.</p>
        <p>Consistency is the key to mastery. You've got this!</p>
        <a href="https://ragacademy.com/challenges" class="button">Complete a Challenge</a>
      </div>
    `,
    "streak-at-risk": `
      <div class="content">
        <h1>⚠️ Don't lose your ${data.streakDays || 0} day streak!</h1>
        <p>You have less than 24 hours to maintain your learning streak.</p>
        <p>Even a quick quiz counts! Keep the momentum going.</p>
        <a href="https://ragacademy.com/challenges" class="button">Save Your Streak</a>
      </div>
    `,
    "weekly-digest": `
      <div class="content">
        <h1>📊 Your Week in Review</h1>
        <p><strong>Challenges completed:</strong> ${data.challengesCompleted || 0}</p>
        <p><strong>XP earned:</strong> ${data.xpEarned || 0}</p>
        <p><strong>Current streak:</strong> ${data.streakDays || 0} days</p>
        <h2>Recommended Next Steps</h2>
        <p>${data.recommendation || "Continue your learning journey!"}</p>
        <a href="https://ragacademy.com/learn" class="button">Continue Learning</a>
      </div>
    `,
    "challenge-complete": `
      <div class="content">
        <h1>🎯 Challenge Complete!</h1>
        <p>You've completed <strong>${data.challengeTitle || "a challenge"}</strong>!</p>
        <p><strong>+${data.xpEarned || 50} XP</strong> earned</p>
        <a href="https://ragacademy.com/challenges" class="button">Try Another Challenge</a>
      </div>
    `,
    "phase-complete": `
      <div class="content">
        <h1>🏆 Phase ${data.phaseNumber || ""} Complete!</h1>
        <p>Congratulations! You've mastered <strong>${data.phaseName || "this phase"}</strong>.</p>
        <p>You're making incredible progress in your RAG journey!</p>
        <a href="https://ragacademy.com/learn" class="button">Start Next Phase</a>
      </div>
    `,
    "achievement-unlocked": `
      <div class="content">
        <h1>🌟 Achievement Unlocked!</h1>
        <p>You've earned: <strong>${data.achievementName || "a new achievement"}</strong></p>
        <p>${data.achievementDescription || ""}</p>
        <a href="https://ragacademy.com/progress" class="button">View All Achievements</a>
      </div>
    `,
    "account-activated": `
      <div class="content">
        <h1>✅ You're All Set!</h1>
        <p>Your RAG Academy account has been activated.</p>
        <p>You now have full access to all free content. Ready to start?</p>
        <a href="https://ragacademy.com/learn" class="button">Begin Your Journey</a>
      </div>
    `,
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎓 RAG Academy</div>
        </div>
        ${templateContent[template]}
        <div class="footer">
          <p>RAG Academy • Learn Production RAG Systems</p>
          <p><a href="https://ragacademy.com/settings">Manage email preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Schedule streak reminder emails
 * Should be called by a cron job
 */
export async function sendStreakReminders(): Promise<void> {
  // In production, query database for users whose streak is at risk
  // and send appropriate reminder emails
  console.log("[Email] Streak reminder job would run here");
}

/**
 * Schedule weekly digest emails
 * Should be called by a weekly cron job
 */
export async function sendWeeklyDigests(): Promise<void> {
  // In production, query database for user stats and send personalized digests
  console.log("[Email] Weekly digest job would run here");
}
