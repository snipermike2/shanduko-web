'use client';

import { useEffect, useState } from 'react';
import { getProfile, getFeatureFlags } from '@/lib/api';
import type { Profile, FeatureFlags } from '@/types/models';

export function PointsHUD() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags | null>(null);

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

  // Listen for XP updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      getProfile().then(setProfile);
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('profile-updated', handleProfileUpdate);
  }, []);

  if (!featureFlags?.gamification || !profile) {
    return null;
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span className="text-sm font-medium">{profile.points}</span>
      </div>
      
      {profile.streakDays > 0 && (
        <div className="flex items-center space-x-1 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full">
          <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">{profile.streakDays}</span>
        </div>
      )}

      <div className="flex items-center space-x-1">
        <span className="text-lg">{profile.avatarEmoji}</span>
        <span className="text-sm font-medium text-gray-700">{profile.username}</span>
      </div>
    </div>
  );
}