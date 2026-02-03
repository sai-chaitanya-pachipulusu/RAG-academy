/**
 * Achievement unlocked email template
 * Sent when a user unlocks a new badge/achievement
 */

import { EmailTemplate, AchievementInfo } from './types';

export interface AchievementUnlockedData {
  userName: string;
  achievement: AchievementInfo;
  totalAchievements: number;
  nextAchievement?: {
    name: string;
    description: string;
    progress: number;
    total: number;
  };
}

function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common': return '#6b7280';
    case 'rare': return '#3b82f6';
    case 'epic': return '#a855f7';
    case 'legendary': return '#f59e0b';
    default: return '#6b7280';
  }
}

function getRarityBg(rarity: string): string {
  switch (rarity) {
    case 'common': return '#f3f4f6';
    case 'rare': return '#dbeafe';
    case 'epic': return '#f3e8ff';
    case 'legendary': return '#fef3c7';
    default: return '#f3f4f6';
  }
}

function getRarityLabel(rarity: string): string {
  switch (rarity) {
    case 'common': return 'Common';
    case 'rare': return 'Rare';
    case 'epic': return 'Epic';
    case 'legendary': return 'LEGENDARY';
    default: return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  }
}

export function getAchievementUnlockedEmail(data: AchievementUnlockedData): EmailTemplate {
  const { userName, achievement, totalAchievements, nextAchievement } = data;
  const rarityColor = getRarityColor(achievement.rarity);
  const rarityBg = getRarityBg(achievement.rarity);
  const rarityLabel = getRarityLabel(achievement.rarity);
  const isLegendary = achievement.rarity === 'legendary';

  return {
    subject: `${isLegendary ? '🏆' : '🏅'} Achievement Unlocked: ${achievement.name}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Achievement Unlocked!</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f7;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background: ${isLegendary 
                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #f59e0b 100%)' 
                    : `linear-gradient(135deg, ${rarityColor} 0%, ${rarityColor}dd 100%)`}; padding: 50px 30px; text-align: center;">
                    ${isLegendary ? '<div style="font-size: 80px; margin-bottom: 10px; animation: pulse 2s infinite;">👑</div>' : ''}
                    <div style="font-size: 64px; margin-bottom: 10px;">${achievement.icon}</div>
                    <h1 style="color: #ffffff; font-size: 32px; margin: 0; font-weight: 700;">Achievement Unlocked!</h1>
                    <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 12px 0 0 0;">Congratulations, ${userName}!</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <!-- Achievement Card -->
                    <div style="background: ${isLegendary 
                      ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' 
                      : rarityBg}; border-radius: 16px; padding: 30px; margin: 0 0 30px 0; text-align: center; border: ${isLegendary ? '3px solid #f59e0b' : '2px solid ' + rarityColor};">
                      <span style="display: inline-block; background-color: ${rarityColor}; color: #ffffff; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;">${rarityLabel}</span>
                      <h2 style="color: #1d1d1f; font-size: 28px; margin: 0 0 12px 0; font-weight: 700;">${achievement.name}</h2>
                      <p style="color: #6e6e73; font-size: 16px; margin: 0; line-height: 1.5;">${achievement.description}</p>
                    </div>
                    
                    ${isLegendary ? `
                    <!-- Legendary Message -->
                    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 20px; margin: 30px 0; text-align: center; border: 2px solid #f59e0b;">
                      <p style="color: #92400e; font-size: 18px; font-weight: 700; margin: 0;">🏆 LEGENDARY ACHIEVEMENT 🏆</p>
                      <p style="color: #78350f; font-size: 14px; margin: 8px 0 0 0;">Only a select few have earned this badge. You're truly exceptional!</p>
                    </div>
                    ` : ''}
                    
                    <!-- Stats -->
                    <div style="background-color: #fafafa; border-radius: 12px; padding: 20px; margin: 30px 0; text-align: center;">
                      <p style="color: #6e6e73; font-size: 14px; margin: 0 0 8px 0;">Total Achievements Unlocked</p>
                      <p style="color: #1d1d1f; font-size: 36px; font-weight: 700; margin: 0;">${totalAchievements}</p>
                    </div>
                    
                    ${nextAchievement ? `
                    <!-- Next Achievement -->
                    <div style="background-color: #f5f5f7; border-radius: 12px; padding: 24px; margin: 30px 0;">
                      <p style="color: #6e6e73; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">Next Up</p>
                      <h3 style="color: #1d1d1f; font-size: 18px; margin: 0 0 8px 0;">${nextAchievement.name}</h3>
                      <p style="color: #6e6e73; font-size: 14px; margin: 0 0 16px 0;">${nextAchievement.description}</p>
                      <div style="background-color: #e5e5e7; border-radius: 8px; height: 8px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, ${rarityColor} 0%, ${rarityColor}dd 100%); height: 100%; width: ${(nextAchievement.progress / nextAchievement.total) * 100}%; border-radius: 8px;"></div>
                      </div>
                      <p style="color: #6e6e73; font-size: 12px; margin: 8px 0 0 0; text-align: right;">${nextAchievement.progress} / ${nextAchievement.total}</p>
                    </div>
                    ` : ''}
                    
                    <!-- Share -->
                    <div style="text-align: center; margin: 40px 0;">
                      <p style="color: #6e6e73; font-size: 14px; margin: 0 0 16px 0;">Share your achievement!</p>
                      <a href="https://twitter.com/intent/tweet?text=I just unlocked the ${encodeURIComponent(achievement.name)} achievement on RAG Academy! ${achievement.icon}&url=https://rag-academy.com" style="display: inline-block; background-color: #1da1f2; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 0 4px;">Share on X</a>
                      <a href="https://www.linkedin.com/sharing/share-offsite/?url=https://rag-academy.com" style="display: inline-block; background-color: #0a66c2; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 0 4px;">Share on LinkedIn</a>
                    </div>
                    
                    <!-- CTA -->
                    <div style="text-align: center; margin: 40px 0;">
                      <a href="https://rag-academy.com/profile" style="display: inline-block; background-color: ${rarityColor}; color: #ffffff; padding: 16px 40px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px;">View Your Profile →</a>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px; background-color: #f5f5f7; text-align: center; border-top: 1px solid #e5e5e7;">
                    <p style="color: #6e6e73; font-size: 14px; margin: 0 0 8px 0;">Keep unlocking achievements!</p>
                    <p style="color: #1d1d1f; font-size: 14px; font-weight: 600; margin: 0;">The RAG Academy Team</p>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #d1d1d6;">
                      <p style="color: #8e8e93; font-size: 12px; margin: 0;">
                        <a href="https://rag-academy.com/settings/email" style="color: #8e8e93; text-decoration: underline;">Manage email preferences</a> • 
                        <a href="https://rag-academy.com/unsubscribe?type=achievements" style="color: #8e8e93; text-decoration: underline;">Unsubscribe from achievement notifications</a>
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
    text: `${isLegendary ? '🏆 LEGENDARY ' : '🏅 '}Achievement Unlocked: ${achievement.name}

Congratulations, ${userName}!

You've unlocked a new achievement:

${achievement.icon} ${achievement.name}
Rarity: ${rarityLabel}
${achievement.description}

${isLegendary ? '🏆 LEGENDARY ACHIEVEMENT 🏆\nOnly a select few have earned this badge. You\'re truly exceptional!\n\n' : ''}Total Achievements Unlocked: ${totalAchievements}

${nextAchievement ? `Next Achievement: ${nextAchievement.name}
${nextAchievement.description}
Progress: ${nextAchievement.progress} / ${nextAchievement.total}

` : ''}View Your Profile: https://rag-academy.com/profile

Share your achievement:
Twitter: https://twitter.com/intent/tweet?text=I just unlocked the ${encodeURIComponent(achievement.name)} achievement on RAG Academy! ${achievement.icon}

Keep unlocking achievements!
The RAG Academy Team

Manage email preferences: https://rag-academy.com/settings/email
Unsubscribe from achievement notifications: https://rag-academy.com/unsubscribe?type=achievements
    `,
  };
}
