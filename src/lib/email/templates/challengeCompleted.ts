/**
 * Challenge completed email template
 * Sent when a user successfully completes a challenge
 */

import { EmailTemplate, ChallengeInfo } from './types';

export interface ChallengeCompletedData {
  userName: string;
  challenge: ChallengeInfo;
  score?: number;
  rank?: number;
  totalParticipants: number;
  nextChallenge?: {
    slug: string;
    title: string;
    difficulty: string;
  };
  achievementsUnlocked?: Array<{
    name: string;
    icon: string;
  }>;
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'beginner': return '#16a34a';
    case 'intermediate': return '#ca8a04';
    case 'advanced': return '#dc2626';
    default: return '#6b7280';
  }
}

function getDifficultyBg(difficulty: string): string {
  switch (difficulty) {
    case 'beginner': return '#dcfce7';
    case 'intermediate': return '#fef9c3';
    case 'advanced': return '#fee2e2';
    default: return '#f3f4f6';
  }
}

export function getChallengeCompletedEmail(data: ChallengeCompletedData): EmailTemplate {
  const { userName, challenge, score, rank, totalParticipants, nextChallenge, achievementsUnlocked } = data;
  const difficultyColor = getDifficultyColor(challenge.difficulty);
  const difficultyBg = getDifficultyBg(challenge.difficulty);

  return {
    subject: `🎉 Congratulations! You completed "${challenge.title}"`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Challenge Completed!</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f7;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 50px 30px; text-align: center;">
                    <div style="font-size: 72px; margin-bottom: 10px;">🎉</div>
                    <h1 style="color: #ffffff; font-size: 32px; margin: 0; font-weight: 700;">Challenge Completed!</h1>
                    <p style="color: #a7f3d0; font-size: 18px; margin: 12px 0 0 0;">Great job, ${userName}!</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <!-- Challenge Card -->
                    <div style="background-color: #f0fdf4; border-radius: 16px; padding: 30px; margin: 0 0 30px 0; text-align: center; border: 2px solid #bbf7d0;">
                      <span style="display: inline-block; background-color: ${difficultyBg}; color: ${difficultyColor}; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">${challenge.difficulty}</span>
                      <h2 style="color: #1d1d1f; font-size: 24px; margin: 0 0 8px 0; font-weight: 700;">${challenge.title}</h2>
                      <p style="color: #6e6e73; font-size: 15px; margin: 0;">${challenge.category}</p>
                    </div>
                    
                    ${score !== undefined ? `
                    <!-- Score -->
                    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 24px; margin: 30px 0; text-align: center;">
                      <p style="color: #92400e; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Your Score</p>
                      <p style="color: #78350f; font-size: 48px; font-weight: 700; margin: 0;">${score}%</p>
                    </div>
                    ` : ''}
                    
                    ${rank ? `
                    <!-- Rank -->
                    <div style="background-color: #fafafa; border-radius: 12px; padding: 20px; margin: 30px 0; text-align: center;">
                      <p style="color: #6e6e73; font-size: 14px; margin: 0 0 8px 0;">You ranked</p>
                      <p style="color: #1d1d1f; font-size: 36px; font-weight: 700; margin: 0;">#${rank}</p>
                      <p style="color: #8e8e93; font-size: 14px; margin: 4px 0 0 0;">out of ${totalParticipants.toLocaleString()} participants</p>
                    </div>
                    ` : ''}
                    
                    ${achievementsUnlocked && achievementsUnlocked.length > 0 ? `
                    <!-- Achievements -->
                    <div style="margin: 30px 0;">
                      <h3 style="color: #1d1d1f; font-size: 18px; margin: 0 0 16px 0; text-align: center;">🏅 Achievements Unlocked</h3>
                      <table role="presentation" style="width: 100%;">
                        ${achievementsUnlocked.map(achievement => `
                        <tr>
                          <td style="padding: 12px; background-color: #fef3c7; border-radius: 10px; margin-bottom: 8px; text-align: center;">
                            <span style="font-size: 32px; margin-right: 8px;">${achievement.icon}</span>
                            <span style="color: #92400e; font-size: 16px; font-weight: 600;">${achievement.name}</span>
                          </td>
                        </tr>
                        <tr><td style="height: 8px;"></td></tr>
                        `).join('')}
                      </table>
                    </div>
                    ` : ''}
                    
                    ${nextChallenge ? `
                    <!-- Next Challenge -->
                    <div style="background-color: #fafafa; border-radius: 12px; padding: 24px; margin: 30px 0;">
                      <p style="color: #6e6e73; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">Continue Your Journey</p>
                      <h3 style="color: #1d1d1f; font-size: 18px; margin: 0 0 8px 0;">${nextChallenge.title}</h3>
                      <span style="display: inline-block; background-color: ${getDifficultyBg(nextChallenge.difficulty)}; color: ${getDifficultyColor(nextChallenge.difficulty)}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 16px;">${nextChallenge.difficulty}</span>
                      <a href="https://rag-academy.com/challenges/${nextChallenge.slug}" style="display: inline-block; background-color: #1d1d1f; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Start Next Challenge →</a>
                    </div>
                    ` : ''}
                    
                    <!-- Share -->
                    <div style="text-align: center; margin: 40px 0;">
                      <p style="color: #6e6e73; font-size: 14px; margin: 0 0 16px 0;">Share your achievement!</p>
                      <a href="https://twitter.com/intent/tweet?text=I just completed ${encodeURIComponent(challenge.title)} on RAG Academy! 🎉&url=https://rag-academy.com/challenges/${challenge.slug}" style="display: inline-block; background-color: #1da1f2; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 0 4px;">Share on X</a>
                      <a href="https://www.linkedin.com/sharing/share-offsite/?url=https://rag-academy.com/challenges/${challenge.slug}" style="display: inline-block; background-color: #0a66c2; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 0 4px;">Share on LinkedIn</a>
                    </div>
                    
                    <!-- CTA -->
                    <div style="text-align: center; margin: 40px 0;">
                      <a href="https://rag-academy.com/challenges/${challenge.slug}/submissions" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 16px 40px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px;">View Your Solution →</a>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px; background-color: #f5f5f7; text-align: center; border-top: 1px solid #e5e5e7;">
                    <p style="color: #6e6e73; font-size: 14px; margin: 0 0 8px 0;">Keep up the amazing work!</p>
                    <p style="color: #1d1d1f; font-size: 14px; font-weight: 600; margin: 0;">The RAG Academy Team</p>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #d1d1d6;">
                      <p style="color: #8e8e93; font-size: 12px; margin: 0;">
                        <a href="https://rag-academy.com/settings/email" style="color: #8e8e93; text-decoration: underline;">Manage email preferences</a> • 
                        <a href="https://rag-academy.com/unsubscribe?type=challenges" style="color: #8e8e93; text-decoration: underline;">Unsubscribe from challenge notifications</a>
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
    text: `🎉 Challenge Completed: ${challenge.title}

Congratulations, ${userName}!

You've successfully completed:
${challenge.title}
Category: ${challenge.category}
Difficulty: ${challenge.difficulty}

${score !== undefined ? `Your Score: ${score}%

` : ''}${rank ? `You ranked #${rank} out of ${totalParticipants.toLocaleString()} participants

` : ''}${achievementsUnlocked && achievementsUnlocked.length > 0 ? `🏅 Achievements Unlocked:
${achievementsUnlocked.map(a => `- ${a.icon} ${a.name}`).join('\n')}

` : ''}${nextChallenge ? `Continue Your Journey:
Next Challenge: ${nextChallenge.title}
https://rag-academy.com/challenges/${nextChallenge.slug}

` : ''}View Your Solution: https://rag-academy.com/challenges/${challenge.slug}/submissions

Share your achievement:
Twitter: https://twitter.com/intent/tweet?text=I just completed ${encodeURIComponent(challenge.title)} on RAG Academy! 🎉

Keep up the amazing work!
The RAG Academy Team

Manage email preferences: https://rag-academy.com/settings/email
Unsubscribe from challenge notifications: https://rag-academy.com/unsubscribe?type=challenges
    `,
  };
}
