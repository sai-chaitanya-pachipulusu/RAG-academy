/**
 * Weekly digest email template
 * Sent weekly with progress summary and recommendations
 */

import { EmailTemplate, WeeklyStats } from './types';

export interface WeeklyDigestData {
  userName: string;
  weekStart: string;
  weekEnd: string;
  stats: WeeklyStats;
  completedChallenges: Array<{
    slug: string;
    title: string;
    completedAt: string;
  }>;
  recommendedChallenges: Array<{
    slug: string;
    title: string;
    difficulty: string;
    category: string;
  }>;
  leaderboardPosition?: number;
  totalLearners: number;
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`;
}

function getEncouragementMessage(stats: WeeklyStats): string {
  if (stats.challengesCompleted >= 5) return "Outstanding week! You're crushing it! 🚀";
  if (stats.challengesCompleted >= 3) return "Great progress! Keep up the momentum! 💪";
  if (stats.challengesCompleted >= 1) return "Nice work! Every challenge completed is a step forward. ✨";
  if (stats.streakDays > 0) return "You're keeping your streak alive! Consistency is key. 🔥";
  return "Ready to start fresh this week? Let's do this! 💪";
}

export function getWeeklyDigestEmail(data: WeeklyDigestData): EmailTemplate {
  const { userName, weekStart, weekEnd, stats, completedChallenges, recommendedChallenges, leaderboardPosition, totalLearners } = data;
  const encouragement = getEncouragementMessage(stats);
  const formattedTime = formatTime(stats.timeSpentMinutes);

  return {
    subject: `Your Weekly Progress: ${stats.challengesCompleted} challenges completed! 📊`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Weekly Digest</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f7;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">Weekly Digest</h1>
                    <p style="color: #ddd6fe; font-size: 16px; margin: 10px 0 0 0;">${weekStart} - ${weekEnd}</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #1d1d1f; font-size: 18px; margin: 0 0 8px 0;">Hi ${userName},</p>
                    <p style="color: #7c3aed; font-size: 16px; font-weight: 600; margin: 0 0 24px 0;">${encouragement}</p>
                    
                    <!-- Stats Grid -->
                    <div style="background-color: #faf5ff; border-radius: 16px; padding: 24px; margin: 30px 0;">
                      <table role="presentation" style="width: 100%;">
                        <tr>
                          <td style="text-align: center; padding: 15px; width: 33.33%;">
                            <div style="font-size: 32px; margin-bottom: 8px;">🎯</div>
                            <p style="color: #5b21b6; font-size: 28px; font-weight: 700; margin: 0;">${stats.challengesCompleted}</p>
                            <p style="color: #7c3aed; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 4px 0 0 0;">Completed</p>
                          </td>
                          <td style="text-align: center; padding: 15px; width: 33.33%; border-left: 1px solid #e9d5ff;">
                            <div style="font-size: 32px; margin-bottom: 8px;">🔥</div>
                            <p style="color: #5b21b6; font-size: 28px; font-weight: 700; margin: 0;">${stats.streakDays}</p>
                            <p style="color: #7c3aed; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 4px 0 0 0;">Streak Days</p>
                          </td>
                          <td style="text-align: center; padding: 15px; width: 33.33%; border-left: 1px solid #e9d5ff;">
                            <div style="font-size: 32px; margin-bottom: 8px;">⏱️</div>
                            <p style="color: #5b21b6; font-size: 24px; font-weight: 700; margin: 0;">${formattedTime}</p>
                            <p style="color: #7c3aed; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 4px 0 0 0;">Time Spent</p>
                          </td>
                        </tr>
                      </table>
                    </div>
                    
                    ${leaderboardPosition ? `
                    <!-- Leaderboard -->
                    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 20px; margin: 30px 0; text-align: center;">
                      <p style="color: #92400e; font-size: 14px; margin: 0 0 8px 0;">🏆 Leaderboard Position</p>
                      <p style="color: #78350f; font-size: 32px; font-weight: 700; margin: 0;">#${leaderboardPosition}</p>
                      <p style="color: #b45309; font-size: 14px; margin: 4px 0 0 0;">out of ${totalLearners.toLocaleString()} learners</p>
                    </div>
                    ` : ''}
                    
                    ${completedChallenges.length > 0 ? `
                    <!-- Completed Challenges -->
                    <h2 style="color: #1d1d1f; font-size: 20px; margin: 30px 0 16px 0;">Challenges Completed</h2>
                    <table role="presentation" style="width: 100%;">
                      ${completedChallenges.map(challenge => `
                      <tr>
                        <td style="padding: 12px; background-color: #f5f5f7; border-radius: 8px; margin-bottom: 8px;">
                          <p style="color: #1d1d1f; font-size: 15px; font-weight: 600; margin: 0 0 4px 0;">${challenge.title}</p>
                          <p style="color: #6e6e73; font-size: 13px; margin: 0;">Completed on ${new Date(challenge.completedAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                        </td>
                      </tr>
                      <tr><td style="height: 8px;"></td></tr>
                      `).join('')}
                    </table>
                    ` : ''}
                    
                    ${stats.newAchievements > 0 ? `
                    <!-- Achievements -->
                    <div style="background-color: #dcfce7; border-radius: 12px; padding: 20px; margin: 30px 0; text-align: center;">
                      <p style="color: #166534; font-size: 14px; margin: 0 0 8px 0;">🏅 New Achievements Unlocked</p>
                      <p style="color: #15803d; font-size: 28px; font-weight: 700; margin: 0;">${stats.newAchievements}</p>
                      <a href="https://rag-academy.com/profile" style="display: inline-block; margin-top: 12px; color: #166534; font-weight: 600; text-decoration: none;">View Your Badges →</a>
                    </div>
                    ` : ''}
                    
                    ${recommendedChallenges.length > 0 ? `
                    <!-- Recommendations -->
                    <h2 style="color: #1d1d1f; font-size: 20px; margin: 30px 0 16px 0;">Recommended This Week</h2>
                    <table role="presentation" style="width: 100%;">
                      ${recommendedChallenges.slice(0, 3).map(challenge => `
                      <tr>
                        <td style="padding: 16px; background-color: #fafafa; border-radius: 12px; border: 1px solid #e5e5e7;">
                          <table role="presentation" style="width: 100%;">
                            <tr>
                              <td>
                                <p style="color: #1d1d1f; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">${challenge.title}</p>
                                <span style="display: inline-block; background-color: #e5e5e7; color: #424245; padding: 4px 10px; border-radius: 10px; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-right: 8px;">${challenge.difficulty}</span>
                                <span style="color: #6e6e73; font-size: 13px;">${challenge.category}</span>
                              </td>
                              <td style="width: 40px; text-align: right;">
                                <a href="https://rag-academy.com/challenges/${challenge.slug}" style="display: inline-block; width: 32px; height: 32px; background-color: #7c3aed; color: #ffffff; border-radius: 8px; text-align: center; line-height: 32px; text-decoration: none; font-size: 16px;">→</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr><td style="height: 12px;"></td></tr>
                      `).join('')}
                    </table>
                    ` : ''}
                    
                    <!-- CTA -->
                    <div style="text-align: center; margin: 40px 0;">
                      <a href="https://rag-academy.com/learn" style="display: inline-block; background-color: #7c3aed; color: #ffffff; padding: 16px 40px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px;">Continue Learning →</a>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px; background-color: #f5f5f7; text-align: center; border-top: 1px solid #e5e5e7;">
                    <p style="color: #6e6e73; font-size: 14px; margin: 0 0 8px 0;">Keep up the great work!</p>
                    <p style="color: #1d1d1f; font-size: 14px; font-weight: 600; margin: 0;">The RAG Academy Team</p>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #d1d1d6;">
                      <p style="color: #8e8e93; font-size: 12px; margin: 0;">
                        <a href="https://rag-academy.com/settings/email" style="color: #8e8e93; text-decoration: underline;">Manage email preferences</a> • 
                        <a href="https://rag-academy.com/unsubscribe?type=digest" style="color: #8e8e93; text-decoration: underline;">Unsubscribe from weekly digest</a>
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
    text: `Your Weekly Progress: ${stats.challengesCompleted} challenges completed!

Hi ${userName},

${encouragement}

Your Week at a Glance (${weekStart} - ${weekEnd}):
- Challenges Completed: ${stats.challengesCompleted}
- Streak Days: ${stats.streakDays}
- Time Spent: ${formattedTime}
- Total Submissions: ${stats.totalSubmissions}

${leaderboardPosition ? `Leaderboard Position: #${leaderboardPosition} out of ${totalLearners.toLocaleString()} learners

` : ''}${completedChallenges.length > 0 ? `Challenges Completed This Week:
${completedChallenges.map(c => `- ${c.title} (completed ${new Date(c.completedAt).toLocaleDateString()})`).join('\n')}

` : ''}${stats.newAchievements > 0 ? `🏅 New Achievements Unlocked: ${stats.newAchievements}
View Your Badges: https://rag-academy.com/profile

` : ''}${recommendedChallenges.length > 0 ? `Recommended This Week:
${recommendedChallenges.slice(0, 3).map(c => `- ${c.title} [${c.difficulty}] - https://rag-academy.com/challenges/${c.slug}`).join('\n')}

` : ''}Continue Learning: https://rag-academy.com/learn

Keep up the great work!
The RAG Academy Team

Manage email preferences: https://rag-academy.com/settings/email
Unsubscribe from weekly digest: https://rag-academy.com/unsubscribe?type=digest
    `,
  };
}
