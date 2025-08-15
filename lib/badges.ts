// lib/badges.ts
import type { Badge } from '@/types/models';

export interface Achievement {
  code: string;
  title: string;
  description: string;
  emoji: string;
  category: 'reporting' | 'learning' | 'engagement' | 'expert' | 'community';
  xpReward: number;
  condition: (profile: any, context?: any) => boolean;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export const ACHIEVEMENTS: Achievement[] = [
  // Reporting Achievements
  {
    code: 'first_report',
    title: 'First Reporter',
    description: 'Submit your first water quality report',
    emoji: '📝',
    category: 'reporting',
    xpReward: 25,
    rarity: 'common',
    condition: (profile, context) => context?.reportsCount >= 1,
  },
  {
    code: 'reporter_5',
    title: 'Active Reporter',
    description: 'Submit 5 water quality reports',
    emoji: '📊',
    category: 'reporting',
    xpReward: 50,
    rarity: 'uncommon',
    condition: (profile, context) => context?.reportsCount >= 5,
  },
  {
    code: 'reporter_10',
    title: 'Dedicated Reporter',
    description: 'Submit 10 water quality reports',
    emoji: '🏆',
    category: 'reporting',
    xpReward: 100,
    rarity: 'rare',
    condition: (profile, context) => context?.reportsCount >= 10,
  },
  {
    code: 'anomaly_finder',
    title: 'Anomaly Detector',
    description: 'Report a confirmed water quality anomaly',
    emoji: '🔍',
    category: 'reporting',
    xpReward: 75,
    rarity: 'uncommon',
    condition: (profile, context) => context?.anomaliesReported >= 1,
  },
  
  // Learning Achievements
  {
    code: 'first_quiz',
    title: 'Knowledge Seeker',
    description: 'Complete your first daily quiz',
    emoji: '🧠',
    category: 'learning',
    xpReward: 20,
    rarity: 'common',
    condition: (profile, context) => context?.quizzesCompleted >= 1,
  },
  {
    code: 'perfect_quiz',
    title: 'Perfect Score',
    description: 'Get 100% on a daily quiz',
    emoji: '🎯',
    category: 'learning',
    xpReward: 50,
    rarity: 'uncommon',
    condition: (profile, context) => context?.hasPerfectQuiz === true,
  },
  {
    code: 'quiz_streak_7',
    title: 'Learning Streak',
    description: 'Complete 7 daily quizzes in a row',
    emoji: '🔥',
    category: 'learning',
    xpReward: 100,
    rarity: 'rare',
    condition: (profile) => profile.streakDays >= 7,
  },
  {
    code: 'quiz_streak_30',
    title: 'Knowledge Master',
    description: 'Complete 30 daily quizzes in a row',
    emoji: '🌟',
    category: 'learning',
    xpReward: 300,
    rarity: 'epic',
    condition: (profile) => profile.streakDays >= 30,
  },
  
  // Engagement Achievements
  {
    code: 'points_100',
    title: 'Rising Star',
    description: 'Earn your first 100 points',
    emoji: '⭐',
    category: 'engagement',
    xpReward: 25,
    rarity: 'common',
    condition: (profile) => profile.points >= 100,
  },
  {
    code: 'points_500',
    title: 'Community Champion',
    description: 'Earn 500 points',
    emoji: '🏅',
    category: 'engagement',
    xpReward: 75,
    rarity: 'uncommon',
    condition: (profile) => profile.points >= 500,
  },
  {
    code: 'points_1000',
    title: 'Lake Guardian',
    description: 'Earn 1000 points',
    emoji: '🛡️',
    category: 'engagement',
    xpReward: 150,
    rarity: 'rare',
    condition: (profile) => profile.points >= 1000,
  },
  {
    code: 'early_adopter',
    title: 'Early Adopter',
    description: 'Join the Shanduko community',
    emoji: '🚀',
    category: 'engagement',
    xpReward: 10,
    rarity: 'common',
    condition: () => true, // Awarded to all users
  },
  
  // Expert Achievements
  {
    code: 'water_expert',
    title: 'Water Quality Expert',
    description: 'Score 90%+ on 5 different quizzes',
    emoji: '💧',
    category: 'expert',
    xpReward: 200,
    rarity: 'epic',
    condition: (profile, context) => context?.highScoreQuizzes >= 5,
  },
  {
    code: 'data_analyst',
    title: 'Data Analyst',
    description: 'View the dashboard 10 times',
    emoji: '📈',
    category: 'expert',
    xpReward: 50,
    rarity: 'uncommon',
    condition: (profile, context) => context?.dashboardViews >= 10,
  },
  {
    code: 'map_explorer',
    title: 'Map Explorer',
    description: 'Explore the water quality map 5 times',
    emoji: '🗺️',
    category: 'expert',
    xpReward: 30,
    rarity: 'common',
    condition: (profile, context) => context?.mapViews >= 5,
  },
  
  // Community Achievements
  {
    code: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Share a report with the community',
    emoji: '🦋',
    category: 'community',
    xpReward: 40,
    rarity: 'uncommon',
    condition: (profile, context) => context?.sharedReports >= 1,
  },
  {
    code: 'helpful_citizen',
    title: 'Helpful Citizen',
    description: 'Enable location sharing for reports',
    emoji: '📍',
    category: 'community',
    xpReward: 20,
    rarity: 'common',
    condition: (profile, context) => context?.hasLocationReports === true,
  },
];

export const BADGE_CATEGORIES = {
  reporting: { name: 'Reporting', color: 'blue' },
  learning: { name: 'Learning', color: 'green' },
  engagement: { name: 'Engagement', color: 'purple' },
  expert: { name: 'Expert', color: 'orange' },
  community: { name: 'Community', color: 'pink' },
} as const;

export const RARITY_STYLES = {
  common: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' },
  uncommon: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  rare: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  epic: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  legendary: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
} as const;

export function checkAchievements(profile: any, context: any = {}): Achievement[] {
  const currentBadgeCodes = profile.badges?.map((b: Badge) => b.code) || [];
  
  return ACHIEVEMENTS.filter(achievement => {
    // Don't award if already earned
    if (currentBadgeCodes.includes(achievement.code)) {
      return false;
    }
    
    // Check if condition is met
    return achievement.condition(profile, context);
  });
}

export function getAchievementByCode(code: string): Achievement | undefined {
  return ACHIEVEMENTS.find(achievement => achievement.code === code);
}

export function formatAchievementProgress(achievement: Achievement, profile: any, context: any = {}): {
  current: number;
  target: number;
  percentage: number;
} {
  // Extract progress based on achievement code
  switch (achievement.code) {
    case 'reporter_5':
      return {
        current: Math.min(context.reportsCount || 0, 5),
        target: 5,
        percentage: Math.min(((context.reportsCount || 0) / 5) * 100, 100),
      };
    case 'reporter_10':
      return {
        current: Math.min(context.reportsCount || 0, 10),
        target: 10,
        percentage: Math.min(((context.reportsCount || 0) / 10) * 100, 100),
      };
    case 'quiz_streak_7':
      return {
        current: Math.min(profile.streakDays || 0, 7),
        target: 7,
        percentage: Math.min(((profile.streakDays || 0) / 7) * 100, 100),
      };
    case 'quiz_streak_30':
      return {
        current: Math.min(profile.streakDays || 0, 30),
        target: 30,
        percentage: Math.min(((profile.streakDays || 0) / 30) * 100, 100),
      };
    case 'points_100':
      return {
        current: Math.min(profile.points || 0, 100),
        target: 100,
        percentage: Math.min(((profile.points || 0) / 100) * 100, 100),
      };
    case 'points_500':
      return {
        current: Math.min(profile.points || 0, 500),
        target: 500,
        percentage: Math.min(((profile.points || 0) / 500) * 100, 100),
      };
    case 'points_1000':
      return {
        current: Math.min(profile.points || 0, 1000),
        target: 1000,
        percentage: Math.min(((profile.points || 0) / 1000) * 100, 100),
      };
    default:
      return { current: 0, target: 1, percentage: 0 };
  }
}