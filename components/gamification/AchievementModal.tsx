// components/gamification/AchievementModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { Achievement, RARITY_STYLES } from '@/lib/badges';
import { triggerBadgeConfetti } from '@/lib/confetti';

interface AchievementModalProps {
  achievement: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementModal({ achievement, isOpen, onClose }: AchievementModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen && achievement) {
      setVisible(true);
      // Trigger confetti after a short delay
      setTimeout(() => {
        triggerBadgeConfetti(achievement.rarity);
      }, 300);
      
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [isOpen, achievement]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300); // Allow animation to complete
  };

  if (!achievement || !isOpen) return null;

  const rarityStyle = RARITY_STYLES[achievement.rarity];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          visible ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
        visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Header */}
        <div className="text-center pt-8 pb-4">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🎉 Achievement Unlocked!
            </h2>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${rarityStyle.bg} ${rarityStyle.border} ${rarityStyle.text} border`}>
              {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
            </div>
          </div>
          
          {/* Achievement Badge */}
          <div className={`mx-auto w-24 h-24 rounded-full ${rarityStyle.bg} ${rarityStyle.border} border-2 flex items-center justify-center mb-4 shadow-lg`}>
            <span className="text-4xl">{achievement.emoji}</span>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {achievement.title}
          </h3>
          
          <p className="text-gray-600 mb-4 px-6">
            {achievement.description}
          </p>
          
          {/* XP Reward */}
          <div className="inline-flex items-center space-x-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-full border border-yellow-200">
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-medium">+{achievement.xpReward} XP</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="p-6 pt-0">
          <button
            onClick={handleClose}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Awesome!
          </button>
        </div>
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Badge Grid Component for displaying earned badges
interface BadgeGridProps {
  badges: { code: string; title: string; emoji: string }[];
  achievements: Achievement[];
  className?: string;
}

export function BadgeGrid({ badges, achievements, className = '' }: BadgeGridProps) {
  return (
    <div className={`grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 ${className}`}>
      {badges.map((badge) => {
        const achievement = achievements.find(a => a.code === badge.code);
        const rarity = achievement?.rarity || 'common';
        const rarityStyle = RARITY_STYLES[rarity];
        
        return (
          <div
            key={badge.code}
            className={`aspect-square rounded-lg ${rarityStyle.bg} ${rarityStyle.border} border flex items-center justify-center text-2xl transition-transform hover:scale-105 shadow-sm`}
            title={badge.title}
          >
            {badge.emoji}
          </div>
        );
      })}
    </div>
  );
}

// Progress indicators for achievements
interface AchievementProgressProps {
  achievement: Achievement;
  current: number;
  target: number;
  className?: string;
}

export function AchievementProgress({ achievement, current, target, className = '' }: AchievementProgressProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const rarityStyle = RARITY_STYLES[achievement.rarity];
  
  return (
    <div className={`${rarityStyle.bg} ${rarityStyle.border} border rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-3 mb-3">
        <div className={`w-12 h-12 rounded-lg ${rarityStyle.bg} ${rarityStyle.border} border flex items-center justify-center text-xl`}>
          {achievement.emoji}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{achievement.title}</h4>
          <p className="text-sm text-gray-600">{achievement.description}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className={`font-medium ${rarityStyle.text}`}>
            {current}/{target}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              achievement.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
              achievement.rarity === 'epic' ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
              achievement.rarity === 'rare' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
              achievement.rarity === 'uncommon' ? 'bg-gradient-to-r from-green-400 to-green-600' :
              'bg-gray-400'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {percentage === 100 && (
          <div className="text-center">
            <span className="inline-flex items-center space-x-1 text-green-600 text-sm font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Complete!</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}