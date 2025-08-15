// types/models.ts
export interface SensorReading {
  id: string;
  timestamp: string;
  temperature: number;
  phLevel: number;
  dissolvedOxygen: number;
  turbidity: number;
  eColi: number;
  totalColiform: number;
  bacteriaAtp: number;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  isAnomaly?: boolean;
}

export interface Prediction {
  id: string;
  timestamp: string;
  temperature: number;
  phLevel: number;
  dissolvedOxygen: number;
  turbidity: number;
  isAnomaly: boolean;
}

export interface Report {
  id: string;
  userId?: string;
  timestamp: string;
  title: string;
  description: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  status: 'submitted' | 'reviewing' | 'resolved' | 'closed';
  verifications?: Verification[];
  reactions?: Reaction[];
}

export interface Verification {
  id: string;
  userId: string;
  username: string;
  isAccurate: boolean;
  notes?: string;
  timestamp: string;
}

export interface Reaction {
  id: string;
  userId: string;
  username: string;
  type: 'helpful' | 'concerning' | 'thankful' | 'verified';
  timestamp: string;
}

export interface Profile {
  id: string;
  username: string;
  avatarEmoji: string;
  region: string;
  points: number;
  streakDays: number;
  badges: Badge[];
  alertPreferences: AlertPreferences;
  featureFlags: FeatureFlags;
  createdAt: string;
  updatedAt: string;
}

export interface Badge {
  code: string;
  title: string;
  emoji: string;
  description: string;
  earnedAt: string;
}

export interface AlertPreferences {
  phMin: number;
  phMax: number;
  turbidityMax: number;
  dissolvedOxygenMin: number;
  alertRadius: number;
}

export interface FeatureFlags {
  gamification: boolean;
  community: boolean;
  animatedCharts: boolean;
  heatmap: boolean;
  crazyDemo: boolean;
  useCloudBackend: boolean;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  date: string;
  correct: number;
  total: number;
  questionsAnswered: number[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatarEmoji: string;
  points: number;
  badges: Badge[];
  rank: number;
  isCurrentUser?: boolean;
}

// Database row types (snake_case) - These match Supabase exactly
export interface SensorReadingRow {
  id: string;
  timestamp: string;
  temperature: number;
  ph_level: number;
  dissolved_oxygen: number;
  turbidity: number;
  e_coli: number;
  total_coliform: number;
  bacteria_atp: number;
  latitude: number | null; // Changed from undefined to null
  longitude: number | null; // Changed from undefined to null  
  location_name: string | null; // Changed from undefined to null
  is_anomaly: boolean | null; // Changed from undefined to null
  created_at: string;
}

export interface ProfileRow {
  id: string;
  username: string;
  avatar_emoji: string;
  region: string;
  points: number;
  streak_days: number;
  badges: Badge[]; // Keep as typed array for internal use
  alert_preferences: AlertPreferences; // Keep as typed object for internal use
  feature_flags: FeatureFlags; // Keep as typed object for internal use
  created_at: string;
  updated_at: string;
}

export interface ReportRow {
  id: string;
  user_id: string | null; // Changed from undefined to null
  timestamp: string;
  title: string;
  description: string;
  location: string | null; // Changed from undefined to null
  latitude: number | null; // Changed from undefined to null
  longitude: number | null; // Changed from undefined to null
  images: string[] | null; // Changed from undefined to null
  status: string;
  verifications: Verification[] | null; // Changed from undefined to null
  reactions: Reaction[] | null; // Changed from undefined to null
  created_at: string;
  updated_at: string;
}

export interface QuizAttemptRow {
  id: string;
  user_id: string;
  date: string;
  correct: number;
  total: number;
  questions_answered: number[];
  created_at: string;
}