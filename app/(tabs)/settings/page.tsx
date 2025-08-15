'use client';

import { useEffect, useState } from 'react';
import { getProfile, updateProfile, getAlertPreferences, saveAlertPreferences, getFeatureFlags, saveFeatureFlags } from '@/lib/api';
import type { Profile, AlertPreferences, FeatureFlags } from '@/types/models';

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<AlertPreferences | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileData, prefsData, flagsData] = await Promise.all([
          getProfile(),
          getAlertPreferences(),
          getFeatureFlags(),
        ]);
        setProfile(profileData);
        setPreferences(prefsData);
        setFeatureFlags(flagsData);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSavePreferences = async () => {
    if (!preferences) return;
    
    setSaving(true);
    try {
      await saveAlertPreferences(preferences);
      // Show success message
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Alert preferences saved', type: 'success' }
      }));
    } catch (error) {
      console.error('Failed to save preferences:', error);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Failed to save preferences', type: 'error' }
      }));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFeatureFlags = async () => {
    if (!featureFlags) return;
    
    setSaving(true);
    try {
      await saveFeatureFlags(featureFlags);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Settings saved', type: 'success' }
      }));
    } catch (error) {
      console.error('Failed to save feature flags:', error);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Failed to save settings', type: 'error' }
      }));
    } finally {
      setSaving(false);
    }
  };

  const handleProfileUpdate = async (updates: Partial<Profile>) => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const updatedProfile = await updateProfile(updates);
      setProfile(updatedProfile);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Profile updated', type: 'success' }
      }));
    } catch (error) {
      console.error('Failed to update profile:', error);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Failed to update profile', type: 'error' }
      }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Customize your Shanduko experience</p>
      </div>

      {/* Profile Section */}
      {profile && (
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={profile.username}
                onChange={(e) => handleProfileUpdate({ username: e.target.value })}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avatar Emoji
              </label>
              <div className="flex space-x-2">
                {['🌊', '🔬', '🛡️', '🌱', '🐟', '💧', '🏞️', '🌍'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleProfileUpdate({ avatarEmoji: emoji })}
                    className={`w-12 h-12 text-2xl rounded-lg border-2 transition-colors ${
                      profile.avatarEmoji === emoji
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{profile.points}</div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{profile.streakDays}</div>
                  <div className="text-sm text-gray-600">Day Streak</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{profile.badges.length}</div>
                  <div className="text-sm text-gray-600">Badges</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Preferences */}
      {preferences && (
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Alert Thresholds</h2>
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  pH Min
                </label>
                <input
                  type="number"
                  min="0"
                  max="14"
                  step="0.1"
                  value={preferences.phMin}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    phMin: parseFloat(e.target.value)
                  })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  pH Max
                </label>
                <input
                  type="number"
                  min="0"
                  max="14"
                  step="0.1"
                  value={preferences.phMax}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    phMax: parseFloat(e.target.value)
                  })}
                  className="input-field"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Turbidity Max (NTU)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={preferences.turbidityMax}
                onChange={(e) => setPreferences({
                  ...preferences,
                  turbidityMax: parseFloat(e.target.value)
                })}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dissolved Oxygen Min (mg/L)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={preferences.dissolvedOxygenMin}
                onChange={(e) => setPreferences({
                  ...preferences,
                  dissolvedOxygenMin: parseFloat(e.target.value)
                })}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alert Radius (km)
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={preferences.alertRadius}
                onChange={(e) => setPreferences({
                  ...preferences,
                  alertRadius: parseFloat(e.target.value)
                })}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">
                {preferences.alertRadius} km
              </div>
            </div>
            
            <button
              onClick={handleSavePreferences}
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Alert Preferences'}
            </button>
          </div>
        </div>
      )}

      {/* Feature Flags */}
      {featureFlags && (
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Features</h2>
          
          <div className="space-y-4">
            <ToggleOption
              label="Gamification"
              description="Enable points, badges, and leaderboards"
              checked={featureFlags.gamification}
              onChange={(checked) => setFeatureFlags({
                ...featureFlags,
                gamification: checked
              })}
            />
            
            <ToggleOption
              label="Community Features"
              description="Enable report verification and reactions"
              checked={featureFlags.community}
              onChange={(checked) => setFeatureFlags({
                ...featureFlags,
                community: checked
              })}
            />
            
            <ToggleOption
              label="Animated Charts"
              description="Enable smooth chart animations"
              checked={featureFlags.animatedCharts}
              onChange={(checked) => setFeatureFlags({
                ...featureFlags,
                animatedCharts: checked
              })}
            />
            
            <ToggleOption
              label="Map Heatmap"
              description="Show heatmap overlay on the map"
              checked={featureFlags.heatmap}
              onChange={(checked) => setFeatureFlags({
                ...featureFlags,
                heatmap: checked
              })}
            />
            
            <ToggleOption
              label="Crazy Demo Mode"
              description="Generate extreme data for demonstration"
              checked={featureFlags.crazyDemo}
              onChange={(checked) => setFeatureFlags({
                ...featureFlags,
                crazyDemo: checked
              })}
            />
            
            <ToggleOption
              label="Use Cloud Backend"
              description="Sync data with Supabase (requires configuration)"
              checked={featureFlags.useCloudBackend}
              onChange={(checked) => setFeatureFlags({
                ...featureFlags,
                useCloudBackend: checked
              })}
            />
            
            <button
              onClick={handleSaveFeatureFlags}
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}

      {/* About */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
        
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Version</span>
            <span>2.0.0 (Web PWA)</span>
          </div>
          <div className="flex justify-between">
            <span>Made In</span>
            <span>Africa</span>
          </div>
          <div className="flex justify-between">
            <span>Target Lake</span>
            <span>Lake Chivero</span>
          </div>
          <div className="flex justify-between">
            <span>Tech Stack</span>
            <span>Next.js + Supabase</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ToggleOptionProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleOption({ label, description, checked, onChange }: ToggleOptionProps) {
  return (
    <div className="flex items-start justify-between py-2">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{label}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer ml-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );
}