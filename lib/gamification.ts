// lib/gamification.ts
import { getProfile, updateProfile, awardXP } from './api';
import { checkAchievements, getAchievementByCode, Achievement } from './badges';
import { triggerXPConfetti, triggerStreakConfetti, triggerReportConfetti, triggerFireworkConfetti } from './confetti';
import type { Profile, Badge } from '@/types/models';

export interface GamificationContext {
  reportsCount?: number;
  quizzesCompleted?: number;
  anomaliesReported?: number;
  hasPerfectQuiz?: boolean;
  highScoreQuizzes?: number;
  dashboardViews?: number;
  mapViews?: number;
  sharedReports?: number;
  hasLocationReports?: boolean;
}

// Main gamification manager class
export class GamificationManager {
  private static instance: GamificationManager;
  private achievementQueue: Achievement[] = [];
  private isProcessingAchievements = false;

  static getInstance(): GamificationManager {
    if (!GamificationManager.instance) {
      GamificationManager.instance = new GamificationManager();
    }
    return GamificationManager.instance;
  }

  // Award XP and trigger visual feedback
  async awardXP(amount: number, reason: string, showConfetti = true): Promise<void> {
    try {
      await awardXP(amount, reason);
      
      // Dispatch custom event for XP gain
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('xp-gained', {
          detail: { amount, reason }
        }));
        
        // Show confetti for XP gains
        if (showConfetti) {
          triggerXPConfetti(amount);
        }
      }
    } catch (error) {
      console.error('Failed to award XP:', error);
    }
  }

  // Check and award achievements
  async checkAchievements(context: GamificationContext = {}): Promise<Achievement[]> {
    try {
      const profile = await getProfile();
      if (!profile) return [];

      const newAchievements = checkAchievements(profile, context);
      
      if (newAchievements.length > 0) {
        // Add new badges to profile
        const now = new Date().toISOString();
        const newBadges: Badge[] = newAchievements.map(achievement => ({
          code: achievement.code,
          title: achievement.title,
          emoji: achievement.emoji,
          description: achievement.description,
          earnedAt: now,
        }));

        const updatedBadges = [...profile.badges, ...newBadges];
        
        // Calculate total XP from achievements
        const totalXP = newAchievements.reduce((sum, achievement) => sum + achievement.xpReward, 0);
        
        // Update profile with new badges and XP
        await updateProfile({
          badges: updatedBadges,
          points: profile.points + totalXP,
        });

        // Queue achievements for display
        this.achievementQueue.push(...newAchievements);
        
        // Process achievement notifications
        if (!this.isProcessingAchievements) {
          this.processAchievementQueue();
        }

        return newAchievements;
      }

      return [];
    } catch (error) {
      console.error('Failed to check achievements:', error);
      return [];
    }
  }

  // Process queued achievements for display
  private async processAchievementQueue(): Promise<void> {
    this.isProcessingAchievements = true;

    while (this.achievementQueue.length > 0) {
      const achievement = this.achievementQueue.shift()!;
      
      // Show achievement modal/notification
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('achievement-earned', {
          detail: { achievement }
        }));
        
        // Trigger appropriate confetti based on achievement rarity
        switch (achievement.rarity) {
          case 'legendary':
            triggerFireworkConfetti();
            break;
          case 'epic':
            triggerReportConfetti();
            break;
          case 'rare':
            // Get current profile to get streak days for streak confetti
            const profile = await getProfile();
            const streakDays = profile?.streakDays || 1;
            triggerStreakConfetti(streakDays);
            break;
          default:
            triggerXPConfetti(achievement.xpReward);
        }
      }
      
      // Wait between achievements to avoid overwhelming the user
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    this.isProcessingAchievements = false;
  }

  // Convenience methods for common gamification triggers
  async onReportSubmitted(isAnomaly = false): Promise<Achievement[]> {
    const context: GamificationContext = {
      reportsCount: 1, // This should be the actual count from the user's profile
      anomaliesReported: isAnomaly ? 1 : 0,
    };
    
    // Award XP for report submission
    await this.awardXP(isAnomaly ? 50 : 25, isAnomaly ? 'Anomaly Report' : 'Water Quality Report');
    
    return this.checkAchievements(context);
  }

  async onQuizCompleted(score: number, perfectScore = false): Promise<Achievement[]> {
    const context: GamificationContext = {
      quizzesCompleted: 1,
      hasPerfectQuiz: perfectScore,
      highScoreQuizzes: score >= 0.9 ? 1 : 0,
    };
    
    // Award XP based on quiz performance
    const xpAmount = perfectScore ? 30 : Math.round(score * 20);
    await this.awardXP(xpAmount, 'Quiz Completion');
    
    return this.checkAchievements(context);
  }

  async onDashboardVisit(): Promise<Achievement[]> {
    const context: GamificationContext = {
      dashboardViews: 1,
    };
    
    return this.checkAchievements(context);
  }

  async onMapVisit(): Promise<Achievement[]> {
    const context: GamificationContext = {
      mapViews: 1,
    };
    
    return this.checkAchievements(context);
  }

  async onReportShared(): Promise<Achievement[]> {
    const context: GamificationContext = {
      sharedReports: 1,
    };
    
    // Award XP for community engagement
    await this.awardXP(15, 'Report Shared');
    
    return this.checkAchievements(context);
  }

  async onLocationEnabled(): Promise<Achievement[]> {
    const context: GamificationContext = {
      hasLocationReports: true,
    };
    
    return this.checkAchievements(context);
  }
}

// Export singleton instance
export const gamificationManager = GamificationManager.getInstance();

// Helper functions for quick access
export const awardXPQuick = (amount: number, reason: string, showConfetti = true) => {
  return gamificationManager.awardXP(amount, reason, showConfetti);
};

export const checkAchievementsQuick = (context: GamificationContext = {}) => {
  return gamificationManager.checkAchievements(context);
};

// Event types for TypeScript
declare global {
  interface WindowEventMap {
    'xp-gained': CustomEvent<{ amount: number; reason: string }>;
    'achievement-earned': CustomEvent<{ achievement: Achievement }>;
  }
}