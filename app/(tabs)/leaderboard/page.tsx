'use client';

import { useEffect, useState } from 'react';
import { getLeaderboard, getProfile } from '@/lib/api';
import type { LeaderboardEntry, Profile } from '@/types/models';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [period, setPeriod] = useState<'monthly' | 'all-time'>('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [leaderboardData, profileData] = await Promise.all([
          getLeaderboard(period),
          getProfile(),
        ]);
        setLeaderboard(leaderboardData);
        setProfile(profileData);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [period]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentUserRank = leaderboard.find(entry => entry.isCurrentUser)?.rank || null;

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Leaderboard</h1>
        <p className="text-gray-600">See how you rank among water quality guardians</p>
      </div>

      {/* Period selector */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'monthly', label: 'This Month' },
          { key: 'all-time', label: 'All Time' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setPeriod(tab.key as any)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              period === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Current user stats */}
      {profile && currentUserRank && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Your Ranking</h3>
              <p className="text-blue-700 text-sm">
                You're #{currentUserRank} out of {leaderboard.length} participants
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{profile.points}</div>
              <div className="text-blue-700 text-sm">points</div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">
            {period === 'monthly' ? 'Monthly' : 'All-Time'} Rankings
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {leaderboard.map((entry, index) => (
            <LeaderboardRow
              key={entry.id}
              entry={entry}
              position={index + 1}
              isCurrentUser={entry.isCurrentUser}
            />
          ))}
        </div>
      </div>

      {/* Points info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">How to Earn Points</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Daily login</span>
            <span className="font-medium">+10 XP</span>
          </div>
          <div className="flex justify-between">
            <span>Submit water quality report</span>
            <span className="font-medium">+50 XP</span>
          </div>
          <div className="flex justify-between">
            <span>Verify community report</span>
            <span className="font-medium">+15 XP</span>
          </div>
          <div className="flex justify-between">
            <span>Complete daily quiz</span>
            <span className="font-medium">+10-50 XP</span>
          </div>
          <div className="flex justify-between">
            <span>Anomaly detection</span>
            <span className="font-medium">+25 XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  position: number;
  isCurrentUser?: boolean;
}

function LeaderboardRow({ entry, position, isCurrentUser }: LeaderboardRowProps) {
  const getRankIcon = () => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  const getRankColor = () => {
    switch (position) {
      case 1: return 'text-yellow-600';
      case 2: return 'text-gray-500';
      case 3: return 'text-orange-600';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={`px-4 py-4 flex items-center space-x-4 ${isCurrentUser ? 'bg-blue-50' : ''}`}>
      {/* Rank */}
      <div className="flex items-center justify-center w-8">
        {getRankIcon() ? (
          <span className="text-2xl">{getRankIcon()}</span>
        ) : (
          <span className={`text-lg font-bold ${getRankColor()}`}>#{position}</span>
        )}
      </div>

      {/* Avatar and info */}
      <div className="flex-1 flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-lg">
          {entry.avatarEmoji}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className={`font-semibold ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
              {entry.username}
            </h3>
            {isCurrentUser && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                You
              </span>
            )}
          </div>
          
          {/* Badges */}
          {entry.badges.length > 0 && (
            <div className="flex items-center space-x-1 mt-1">
              {entry.badges.slice(0, 3).map((badge, index) => (
                <span key={index} className="text-xs" title={badge.title}>
                  {badge.emoji}
                </span>
              ))}
              {entry.badges.length > 3 && (
                <span className="text-xs text-gray-500">+{entry.badges.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Points */}
      <div className="text-right">
        <div className={`text-lg font-bold ${isCurrentUser ? 'text-blue-600' : 'text-gray-900'}`}>
          {entry.points.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500">points</div>
      </div>
    </div>
  );
}