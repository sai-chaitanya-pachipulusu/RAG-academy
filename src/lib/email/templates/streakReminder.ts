/**
 * Streak reminder email template
 * Sent daily at user's preferred time to encourage consistency
 */

import { EmailTemplate, StreakData } from './types';

export interface StreakReminderData {
  userName: string;
  streakData: StreakData;
  suggestedChallenge?: {
    slug: string;
    title: string;
    difficulty: string;
  };
}

function getStreakMessage(streak: number): string {
  if (streak === 0) return "Start your streak today! 🔥";
  if (streak === 1) return "You've started your streak! Keep it going! 💪";
  if (streak < 3) return `You're on a ${streak}-day streak! Keep the momentum! 🔥`;
  if (streak < 7) return `Amazing ${streak}-day streak! You're building a great habit! 🚀`;
  if (streak < 14) return `Incredible ${streak}-day streak! You're on fire! 🔥🔥`;
  if (streak < 30) return `Wow! ${streak} days strong! You're a RAG master in training! 🏆`;
  return `LEGENDARY ${streak}-day streak! You're unstoppable! 👑🔥`;
}

function getMilestoneMessage(daysUntil: number, milestone: number): string {
  if (daysUntil === 0) return `🎉 You've reached ${milestone} days! Amazing achievement!`;
  if (daysUntil === 1) return `You're 1 day away from ${milestone} days! Don't break it now!`;
  return `Only ${daysUntil} days until ${milestone} days! Keep pushing!`;
}

export function getStreakReminderEmail(data: StreakReminderData): EmailTemplate {
  const { userName, streakData, suggestedChallenge } = data;
  const streakMessage = getStreakMessage(streakData.currentStreak);
  const milestoneMessage = getMilestoneMessage(streakData.daysUntilNextMilestone, streakData.nextMilestone);

  const flameCount = Math.min(Math.ceil(streakData.currentStreak / 3), 5);
  const flames = "🔥".repeat(flameCount || 1);

  return {
    subject: `${streakMessage} ${flames}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Daily Streak Reminder</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f7;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 30px; text-align: center;">
                    <div style="font-size: 64px; margin-bottom: 10px;">${flames}</div>
                    <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">${streakData.currentStreak}-Day Streak</h1>
                    <p style="color: #fed7aa; font-size: 16px; margin: 10px 0 0 0;">${streakMessage}</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #1d1d1f; font-size: 18px; margin: 0 0 20px 0;">Hi ${userName},</p>
                    
                    <p style="color: #424245; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                      ${streakData.currentStreak === 0 
                        ? "It's a new day! Time to start your learning streak and make progress on your RAG journey." 
                        : "Don't let your streak slip away! Just a few minutes of practice today keeps your momentum alive."}
                    </p>
                    
                    <!-- Stats -->
                    <div style="background-color: #fff7ed; border-radius: 12px; padding: 24px; margin: 30px 0; border: 2px solid #fed7aa;">
                      <table role="presentation" style="width: 100%;">
                        <tr>
                          <td style="text-align: center; padding: 10px;">
                            <p style="color: #9a3412; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Current Streak</p>
                            <p style="color: #c2410c; font-size: 36px; font-weight: 700; margin: 0;">${streakData.currentStreak}</p>
                            <p style="color: #ea580c; font-size: 14px; margin: 4px 0 0 0;">days</p>
                          </td>
                          <td style="text-align: center; padding: 10px; border-left: 1px solid #fed7aa;">
                            <p style="color: #9a3412; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Longest Streak</p>
                            <p style="color: #c2410c; font-size: 36px; font-weight: 700; margin: 0;">${streakData.longestStreak}</p>
                            <p style="color: #ea580c; font-size: 14px; margin: 4px 0 0 0;">days</p>
                          </td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- Milestone -->
                    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 20px; margin: 30px 0; text-align: center;">
                      <p style="color: #92400e; font-size: 16px; font-weight: 600; margin: 0;">${milestoneMessage}</p>
                    </div>
                    
                    ${suggestedChallenge ? `
                    <!-- Suggested Challenge -->
                    <div style="background-color: #f5f5f7; border-radius: 12px; padding: 24px; margin: 30px 0;">
                      <p style="color: #6e6e73; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">Recommended for you</p>
                      <h3 style="color: #1d1d1f; font-size: 18px; margin: 0 0 8px 0;">${suggestedChallenge.title}</h3>
                      <span style="display: inline-block; background-color: #e5e5e7; color: #424245; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase;">${suggestedChallenge.difficulty}</span>
                      <a href="https://rag-academy.com/challenges/${suggestedChallenge.slug}" style="display: inline-block; margin-top: 16px; background-color: #1d1d1f; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Start Challenge →</a>
                    </div>
                    ` : ''}
                    
                    <!-- CTA -->
                    <div style="text-align: center; margin: 40px 0;">
                      <a href="https://rag-academy.com/learn" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; padding: 16px 40px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4);">Keep Your Streak Alive →</a>
                    </div>
                    
                    <!-- Tips -->
                    <div style="border-left: 4px solid #f97316; padding-left: 16px; margin: 30px 0;">
                      <p style="color: #1d1d1f; font-size: 15px; font-weight: 600; margin: 0 0 8px 0;">💡 Pro Tip</p>
                      <p style="color: #6e6e73; font-size: 14px; margin: 0; line-height: 1.5;">
                        Even 15 minutes of practice counts toward your streak. Small, consistent efforts lead to mastery!
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px; background-color: #f5f5f7; text-align: center; border-top: 1px solid #e5e5e7;">
                    <p style="color: #6e6e73; font-size: 14px; margin: 0 0 8px 0;">Keep the fire burning! 🔥</p>
                    <p style="color: #1d1d1f; font-size: 14px; font-weight: 600; margin: 0;">The RAG Academy Team</p>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #d1d1d6;">
                      <p style="color: #8e8e93; font-size: 12px; margin: 0;">
                        <a href="https://rag-academy.com/settings/email" style="color: #8e8e93; text-decoration: underline;">Manage email preferences</a> • 
                        <a href="https://rag-academy.com/unsubscribe?type=streak" style="color: #8e8e93; text-decoration: underline;">Unsubscribe from streak reminders</a>
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
    text: `${streakMessage}

Hi ${userName},

${streakData.currentStreak === 0 
  ? "It's a new day! Time to start your learning streak and make progress on your RAG journey." 
  : "Don't let your streak slip away! Just a few minutes of practice today keeps your momentum alive."}

Your Stats:
- Current Streak: ${streakData.currentStreak} days
- Longest Streak: ${streakData.longestStreak} days

${milestoneMessage}

${suggestedChallenge ? `Recommended Challenge: ${suggestedChallenge.title} (${suggestedChallenge.difficulty})
https://rag-academy.com/challenges/${suggestedChallenge.slug}

` : ''}Keep Your Streak Alive: https://rag-academy.com/learn

💡 Pro Tip: Even 15 minutes of practice counts toward your streak. Small, consistent efforts lead to mastery!

Keep the fire burning! 🔥
The RAG Academy Team

Manage email preferences: https://rag-academy.com/settings/email
Unsubscribe from streak reminders: https://rag-academy.com/unsubscribe?type=streak
    `,
  };
}
