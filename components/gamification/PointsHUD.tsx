// components/gamification/PointsHUD.tsx
'use client';

import { useEffect, useState } from 'react';
import { getProfile, getFeatureFlags } from '@/lib/api';
import type { Profile, FeatureFlags } from '@/types/models';

interface PointsHUDProps {
  className?: string;
  showUsername?: boolean;
  compact?: boolean;
}

export function PointsHUD({ 
  className = '', 
  showUsername = true, 
  compact = false 
}: PointsHUDProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags | null>(null);
  const [xpGain, setXpGain] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileData, flags] = await Promise.all([
          getProfile(),
          getFeatureFlags(),
        ]);
        setProfile(profileData);
        setFeatureFlags(flags);
      } catch (error) {
        console.error('Failed to load profile data:', error);
      }
    };

    loadData();
  }, []);

  // Listen for XP updates and profile changes
  useEffect(() => {
    const handleProfileUpdate = () => {
      getProfile().then(setProfile);
    };

    const handleXPGain = (event: CustomEvent) => {
      const { amount } = event.detail;
      setXpGain(amount);
      
      // Clear the XP gain indicator after animation
      setTimeout(() => setXpGain(null), 2000);
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    window.addEventListener('xp-gained', handleXPGain as EventListener);
    
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
      window.removeEventListener('xp-gained', handleXPGain as EventListener);
    };
  }, []);

  if (!featureFlags?.gamification || !profile) {
    return null;
  }

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-sm">
          <StarIcon className="w-3 h-3 text-yellow-500" />
          <span className="font-medium">{profile.points}</span>
          {xpGain && (
            <span className="text-green-600 font-bold animate-bounce">
              +{xpGain}
            </span>
          )}
        </div>
        
        {profile.streakDays > 0 && (
          <div className="flex items-center space-x-1 bg-orange-50 text-orange-700 px-2 py-1 rounded-full text-sm">
            <FireIcon className="w-3 h-3 text-orange-500" />
            <span className="font-medium">{profile.streakDays}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Points Display */}
      <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 transition-all duration-200 hover:bg-blue-100">
        <StarIcon className="w-4 h-4 text-yellow-500" />
        <span className="text-sm font-medium">{profile.points}</span>
        {xpGain && (
          <span className="text-green-600 font-bold text-xs animate-bounce">
            +{xpGain}
          </span>
        )}
      </div>
      
      {/* Streak Display */}
      {profile.streakDays > 0 && (
        <div className="flex items-center space-x-1 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full border border-orange-200 transition-all duration-200 hover:bg-orange-100">
          <FireIcon className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium">{profile.streakDays}</span>
          <span className="text-xs text-orange-600">day{profile.streakDays !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Badge Count */}
      {profile.badges.length > 0 && (
        <div className="flex items-center space-x-1 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-200 transition-all duration-200 hover:bg-purple-100">
          <TrophyIcon className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium">{profile.badges.length}</span>
        </div>
      )}

      {/* User Avatar & Name */}
      {showUsername && (
        <div className="flex items-center space-x-2 bg-gray-50 text-gray-700 px-3 py-1.5 rounded-full border border-gray-200">
          <span className="text-lg leading-none">{profile.avatarEmoji}</span>
          <span className="text-sm font-medium">{profile.username}</span>
        </div>
      )}
    </div>
  );
}

// Individual HUD components for specific use cases
export function QuickPointsDisplay({ points, className = '' }: { points: number; className?: string }) {
  return (
    <div className={`inline-flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium ${className}`}>
      <StarIcon className="w-3 h-3 text-yellow-500" />
      <span>{points}</span>
    </div>
  );
}

export function StreakDisplay({ days, className = '' }: { days: number; className?: string }) {
  if (days === 0) return null;
  
  return (
    <div className={`inline-flex items-center space-x-1 bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs font-medium ${className}`}>
      <FireIcon className="w-3 h-3 text-orange-500" />
      <span>{days}</span>
    </div>
  );
}

export function XPGainIndicator({ amount, visible }: { amount: number; visible: boolean }) {
  if (!visible) return null;
  
  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-pulse">
      <div className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg font-bold">
        +{amount} XP
      </div>
    </div>
  );
}

// Icon components for consistency
function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function FireIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}