// lib/api.ts
import { supabase, getUser, isSupabaseConfigured } from './supabaseClient';
import { generateDemoData, getDemoData, storeDemoData } from './demoData';
import type {
  SensorReading,
  SensorReadingRow,
  Prediction,
  Report,
  ReportRow,
  Profile,
  ProfileRow,
  LeaderboardEntry,
  QuizAttempt,
  QuizAttemptRow,
  AlertPreferences,
  FeatureFlags,
  Badge,
} from '@/types/models';
import type { Database } from '@/types/database';

// Feature flags check
const useCloudBackend = () => {
  if (typeof window === 'undefined') return false;
  const settings = localStorage.getItem('shanduko_settings');
  if (!settings) return isSupabaseConfigured();
  const parsed = JSON.parse(settings);
  return parsed.useCloudBackend && isSupabaseConfigured();
};

// Helper functions for null/undefined conversion
const nullToUndefined = <T>(value: T | null): T | undefined => {
  return value === null ? undefined : value;
};

// Data transformation helpers
const transformSensorReading = (row: Database['public']['Tables']['sensor_readings']['Row']): SensorReading => ({
  id: row.id,
  timestamp: row.timestamp,
  temperature: row.temperature,
  phLevel: row.ph_level,
  dissolvedOxygen: row.dissolved_oxygen,
  turbidity: row.turbidity,
  eColi: row.e_coli,
  totalColiform: row.total_coliform,
  bacteriaAtp: row.bacteria_atp,
  latitude: nullToUndefined(row.latitude),
  longitude: nullToUndefined(row.longitude),
  locationName: nullToUndefined(row.location_name),
  isAnomaly: nullToUndefined(row.is_anomaly),
});

// Type guard helpers for safe Json conversion
const isBadgeArray = (value: any): value is Badge[] => {
  return Array.isArray(value) && value.every(item => 
    typeof item === 'object' && 
    typeof item.code === 'string' &&
    typeof item.title === 'string' &&
    typeof item.emoji === 'string'
  );
};

const isAlertPreferences = (value: any): value is AlertPreferences => {
  return value && 
    typeof value === 'object' &&
    typeof value.phMin === 'number' &&
    typeof value.phMax === 'number' &&
    typeof value.turbidityMax === 'number' &&
    typeof value.dissolvedOxygenMin === 'number' &&
    typeof value.alertRadius === 'number';
};

const isFeatureFlags = (value: any): value is FeatureFlags => {
  return value && 
    typeof value === 'object' &&
    typeof value.gamification === 'boolean' &&
    typeof value.community === 'boolean' &&
    typeof value.animatedCharts === 'boolean' &&
    typeof value.heatmap === 'boolean' &&
    typeof value.crazyDemo === 'boolean' &&
    typeof value.useCloudBackend === 'boolean';
};

const transformProfile = (row: Database['public']['Tables']['profiles']['Row']): Profile => ({
  id: row.id,
  username: row.username,
  avatarEmoji: row.avatar_emoji,
  region: row.region,
  points: row.points,
  streakDays: row.streak_days,
  badges: isBadgeArray(row.badges) ? row.badges : [],
  alertPreferences: isAlertPreferences(row.alert_preferences) ? row.alert_preferences : {
    phMin: 6.5,
    phMax: 8.5,
    turbidityMax: 5.0,
    dissolvedOxygenMin: 5.0,
    alertRadius: 5.0,
  },
  featureFlags: isFeatureFlags(row.feature_flags) ? row.feature_flags : {
    gamification: true,
    community: true,
    animatedCharts: true,
    heatmap: true,
    crazyDemo: false,
    useCloudBackend: isSupabaseConfigured(),
  },
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const transformReport = (row: Database['public']['Tables']['reports']['Row']): Report => ({
  id: row.id,
  userId: nullToUndefined(row.user_id),
  timestamp: row.timestamp,
  title: row.title,
  description: row.description,
  location: nullToUndefined(row.location),
  latitude: nullToUndefined(row.latitude),
  longitude: nullToUndefined(row.longitude),
  images: Array.isArray(row.images) ? row.images as string[] : [],
  status: row.status as any,
  verifications: Array.isArray(row.verifications) ? row.verifications as any[] : [],
  reactions: Array.isArray(row.reactions) ? row.reactions as any[] : [],
});

// Sensor readings API
export const getLatestReadings = async (): Promise<SensorReading[]> => {
  if (!useCloudBackend()) {
    return getDemoData('sensor-readings').slice(0, 5);
  }

  const { data, error } = await supabase!
    .from('sensor_readings')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(5);

  if (error) throw error;
  return data.map(transformSensorReading);
};

export const getHistory = async (hours: number = 24): Promise<SensorReading[]> => {
  if (!useCloudBackend()) {
    const demoData = getDemoData('sensor-readings');
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    return demoData.filter(reading => reading.timestamp >= cutoff);
  }

  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase!
    .from('sensor_readings')
    .select('*')
    .gte('timestamp', cutoff)
    .order('timestamp', { ascending: true });

  if (error) throw error;
  return data.map(transformSensorReading);
};

export const getPredictions = async (hours: number = 24): Promise<Prediction[]> => {
  // Predictions are always generated locally for now
  return getDemoData('predictions').slice(0, hours);
};

// Reports API
export const listReports = async (): Promise<Report[]> => {
  if (!useCloudBackend()) {
    return getDemoData('reports');
  }

  const { data, error } = await supabase!
    .from('reports')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data.map(transformReport);
};

export const createReport = async (report: Omit<Report, 'id' | 'timestamp'>): Promise<Report> => {
  if (!useCloudBackend()) {
    const newReport: Report = {
      ...report,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
    };
    const reports = getDemoData('reports');
    reports.unshift(newReport);
    storeDemoData('reports', reports);
    return newReport;
  }

  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase!
    .from('reports')
    .insert({
      user_id: user.id,
      timestamp: new Date().toISOString(), // Add missing timestamp
      title: report.title,
      description: report.description,
      location: report.location || null,
      latitude: report.latitude || null,
      longitude: report.longitude || null,
      images: (report.images || []) as unknown as Database['public']['Tables']['reports']['Insert']['images'],
      status: report.status,
    })
    .select()
    .single();

  if (error) throw error;
  return transformReport(data);
};

export const verifyReport = async (reportId: string, isAccurate: boolean, notes?: string): Promise<void> => {
  if (!useCloudBackend()) {
    const reports = getDemoData('reports');
    const reportIndex = reports.findIndex(r => r.id === reportId);
    if (reportIndex === -1) return;

    const verification = {
      id: Math.random().toString(36).substring(7),
      userId: 'demo-user',
      username: 'Demo User',
      isAccurate,
      notes,
      timestamp: new Date().toISOString(),
    };

    if (!reports[reportIndex].verifications) {
      reports[reportIndex].verifications = [];
    }
    reports[reportIndex].verifications!.push(verification);
    storeDemoData('reports', reports);
    return;
  }

  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  // In a real implementation, you'd add the verification to the report
  // For now, we'll simulate this by updating the report
  const { error } = await supabase!
    .from('reports')
    .update({
      updated_at: new Date().toISOString(),
    })
    .eq('id', reportId);

  if (error) throw error;
};

export const reactToReport = async (reportId: string, type: string): Promise<void> => {
  if (!useCloudBackend()) {
    const reports = getDemoData('reports');
    const reportIndex = reports.findIndex(r => r.id === reportId);
    if (reportIndex === -1) return;

    const reaction = {
      id: Math.random().toString(36).substring(7),
      userId: 'demo-user',
      username: 'Demo User',
      type,
      timestamp: new Date().toISOString(),
    };

    if (!reports[reportIndex].reactions) {
      reports[reportIndex].reactions = [];
    }
    
    // Check if user already reacted with this type - if so, remove it (toggle)
    const existingReactionIndex = reports[reportIndex].reactions!.findIndex(
      (r: any) => r.userId === 'demo-user' && r.type === type
    );

    if (existingReactionIndex !== -1) {
      // Remove existing reaction (toggle off)
      reports[reportIndex].reactions!.splice(existingReactionIndex, 1);
    } else {
      // Add new reaction
      reports[reportIndex].reactions!.push(reaction);
    }
    
    storeDemoData('reports', reports);
    return;
  }

  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  // Get current report to read existing reactions
  const { data: report, error: fetchError } = await supabase!
    .from('reports')
    .select('reactions')
    .eq('id', reportId)
    .single();

  if (fetchError) throw fetchError;

  const reactions = Array.isArray(report.reactions) ? report.reactions as any[] : [];
  
  // Check if user already reacted with this type - if so, remove it (toggle)
  const existingReactionIndex = reactions.findIndex(
    (r: any) => r.userId === user.id && r.type === type
  );

  if (existingReactionIndex !== -1) {
    // Remove existing reaction (toggle off)
    reactions.splice(existingReactionIndex, 1);
  } else {
    // Add new reaction
    reactions.push({
      id: Math.random().toString(36).substring(7),
      userId: user.id,
      username: user.email?.split('@')[0] || 'Anonymous',
      type,
      timestamp: new Date().toISOString(),
    });
  }

  const { error } = await supabase!
    .from('reports')
    .update({ reactions: reactions as any })
    .eq('id', reportId);

  if (error) throw error;
};

// User management API
export const getProfile = async (): Promise<Profile | null> => {
  if (!useCloudBackend()) {
    return getDemoData('profiles')[0] || null;
  }

  const user = await getUser();
  if (!user) return null;

  const { data, error } = await supabase!
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows returned
    throw error;
  }

  return transformProfile(data);
};

export const createProfile = async (username: string, avatarEmoji: string = '👤'): Promise<Profile> => {
  if (!useCloudBackend()) {
    const newProfile: Profile = {
      id: 'demo-user',
      username,
      avatarEmoji,
      region: 'ZW',
      points: 0,
      streakDays: 0,
      badges: [],
      alertPreferences: {
        phMin: 6.5,
        phMax: 8.5,
        turbidityMax: 5.0,
        dissolvedOxygenMin: 5.0,
        alertRadius: 5.0,
      },
      featureFlags: {
        gamification: true,
        community: true,
        animatedCharts: true,
        heatmap: true,
        crazyDemo: false,
        useCloudBackend: isSupabaseConfigured(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const profiles = getDemoData('profiles');
    profiles[0] = newProfile;
    storeDemoData('profiles', profiles);
    return newProfile;
  }

  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase!
    .from('profiles')
    .insert({
      id: user.id,
      username,
      avatar_emoji: avatarEmoji,
    })
    .select()
    .single();

  if (error) throw error;
  return transformProfile(data);
};

export const updateProfile = async (updates: Partial<Profile>): Promise<Profile> => {
  if (!useCloudBackend()) {
    const profiles = getDemoData('profiles');
    const currentProfile = profiles[0];
    const updatedProfile = { ...currentProfile, ...updates };
    profiles[0] = updatedProfile;
    storeDemoData('profiles', profiles);
    return updatedProfile;
  }

  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase!
    .from('profiles')
    .update({
      username: updates.username,
      avatar_emoji: updates.avatarEmoji,
      region: updates.region,
      points: updates.points,
      streak_days: updates.streakDays,
      badges: updates.badges ? updates.badges as unknown as Database['public']['Tables']['profiles']['Update']['badges'] : undefined,
      alert_preferences: updates.alertPreferences ? updates.alertPreferences as unknown as Database['public']['Tables']['profiles']['Update']['alert_preferences'] : undefined,
      feature_flags: updates.featureFlags ? updates.featureFlags as unknown as Database['public']['Tables']['profiles']['Update']['feature_flags'] : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return transformProfile(data);
};

export const awardXP = async (amount: number, reason: string): Promise<void> => {
  const profile = await getProfile();
  if (!profile) return;

  const newPoints = profile.points + amount;
  await updateProfile({ points: newPoints });
  
  // Show toast notification
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: `+${amount} XP: ${reason}`, type: 'success' }
    }));
  }
};

// Leaderboard API
export const getLeaderboard = async (period: 'monthly' | 'all-time'): Promise<LeaderboardEntry[]> => {
  if (!useCloudBackend()) {
    const profiles = getDemoData('profiles');
    return profiles
      .sort((a, b) => b.points - a.points)
      .map((profile, index) => ({
        id: profile.id,
        username: profile.username,
        avatarEmoji: profile.avatarEmoji,
        points: profile.points,
        badges: profile.badges,
        rank: index + 1,
        isCurrentUser: index === 0, // Demo user is always first
      }));
  }

  const { data, error } = await supabase!
    .from('profiles')
    .select('*')
    .order('points', { ascending: false })
    .limit(50);

  if (error) throw error;

  const currentUser = await getUser();
  return data.map((profile, index) => ({
    id: profile.id,
    username: profile.username,
    avatarEmoji: profile.avatar_emoji,
    points: profile.points,
    badges: isBadgeArray(profile.badges) ? profile.badges : [],
    rank: index + 1,
    isCurrentUser: currentUser?.id === profile.id,
  }));
};

// Quiz API
export const getTodaysQuizAttempt = async (): Promise<QuizAttempt | null> => {
  if (!useCloudBackend()) {
    const attempts = getDemoData('quiz-attempts') || [];
    const today = new Date().toISOString().split('T')[0];
    return attempts.find(attempt => attempt.date === today) || null;
  }

  const user = await getUser();
  if (!user) return null;

  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase!
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    date: data.date,
    correct: data.correct,
    total: data.total,
    questionsAnswered: Array.isArray(data.questions_answered) ? data.questions_answered as number[] : [],
  };
};

export const saveQuizAttempt = async (correct: number, total: number, questionsAnswered: number[]): Promise<void> => {
  const today = new Date().toISOString().split('T')[0];
  
  if (!useCloudBackend()) {
    const attempts = getDemoData('quiz-attempts') || [];
    const newAttempt: QuizAttempt = {
      id: Math.random().toString(36).substring(7),
      userId: 'demo-user',
      date: today,
      correct,
      total,
      questionsAnswered,
    };
    attempts.push(newAttempt);
    storeDemoData('quiz-attempts', attempts);
    return;
  }

  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase!
    .from('quiz_attempts')
    .insert({
      user_id: user.id,
      date: today,
      correct,
      total,
      questions_answered: questionsAnswered as unknown as Database['public']['Tables']['quiz_attempts']['Insert']['questions_answered'],
    });

  if (error) throw error;
};

// Alert preferences
export const getAlertPreferences = async (): Promise<AlertPreferences> => {
  const profile = await getProfile();
  return profile?.alertPreferences || {
    phMin: 6.5,
    phMax: 8.5,
    turbidityMax: 5.0,
    dissolvedOxygenMin: 5.0,
    alertRadius: 5.0,
  };
};

export const saveAlertPreferences = async (preferences: AlertPreferences): Promise<void> => {
  await updateProfile({ alertPreferences: preferences });
};

// Feature flags
export const getFeatureFlags = async (): Promise<FeatureFlags> => {
  const profile = await getProfile();
  return profile?.featureFlags || {
    gamification: true,
    community: true,
    animatedCharts: true,
    heatmap: true,
    crazyDemo: false,
    useCloudBackend: isSupabaseConfigured(),
  };
};

export const saveFeatureFlags = async (flags: FeatureFlags): Promise<void> => {
  await updateProfile({ featureFlags: flags });
  
  // Also save to localStorage for immediate use
  if (typeof window !== 'undefined') {
    localStorage.setItem('shanduko_settings', JSON.stringify(flags));
  }
};