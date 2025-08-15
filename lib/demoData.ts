import type { SensorReading, Prediction, Report, Profile, QuizAttempt } from '@/types/models';

// Demo data generators
export const generateDemoData = () => {
  const now = new Date();
  
  // Generate sensor readings for last 24 hours
  const sensorReadings: SensorReading[] = [];
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const isAnomaly = Math.random() < 0.1; // 10% chance of anomaly
    
    sensorReadings.push({
      id: `reading-${i}`,
      timestamp: timestamp.toISOString(),
      temperature: isAnomaly ? 15 + Math.random() * 30 : 22 + Math.random() * 6,
      phLevel: isAnomaly ? 4 + Math.random() * 6 : 6.5 + Math.random() * 2,
      dissolvedOxygen: isAnomaly ? 2 + Math.random() * 3 : 6 + Math.random() * 3,
      turbidity: isAnomaly ? 8 + Math.random() * 12 : 1 + Math.random() * 4,
      eColi: Math.floor(5 + Math.random() * 20),
      totalColiform: Math.floor(40 + Math.random() * 80),
      bacteriaAtp: Math.floor(250 + Math.random() * 500),
      latitude: -17.8292 + (Math.random() - 0.5) * 0.1,
      longitude: 31.0522 + (Math.random() - 0.5) * 0.1,
      locationName: 'Lake Chivero',
      isAnomaly,
    });
  }

  // Generate predictions for next 24 hours
  const predictions: Prediction[] = [];
  for (let i = 1; i <= 24; i++) {
    const timestamp = new Date(now.getTime() + i * 60 * 60 * 1000);
    const isAnomaly = Math.random() < 0.05; // 5% chance for predictions
    
    predictions.push({
      id: `prediction-${i}`,
      timestamp: timestamp.toISOString(),
      temperature: 23 + Math.random() * 4,
      phLevel: 6.8 + Math.random() * 1,
      dissolvedOxygen: 7 + Math.random() * 2,
      turbidity: 2 + Math.random() * 3,
      isAnomaly,
    });
  }

  // Generate sample reports
  const reports: Report[] = [
    {
      id: 'report-1',
      userId: 'demo-user',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      title: 'Unusual water color observed',
      description: 'Water appears more brown than usual near the eastern shore. Possible sediment disturbance.',
      location: 'Eastern Shore, Lake Chivero',
      latitude: -17.8295,
      longitude: 31.0535,
      images: [],
      status: 'submitted',
      verifications: [],
      reactions: [],
    },
    {
      id: 'report-2',
      userId: 'other-user',
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      title: 'Fish kill event',
      description: 'Found several dead fish floating near the dam. Water quality may be compromised.',
      location: 'Near Dam Wall',
      latitude: -17.8280,
      longitude: 31.0510,
      images: [],
      status: 'reviewing',
      verifications: [
        {
          id: 'verify-1',
          userId: 'verifier-1',
          username: 'WaterGuardian',
          isAccurate: true,
          notes: 'Confirmed similar observations in the area',
          timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        }
      ],
      reactions: [
        {
          id: 'react-1',
          userId: 'reactor-1',
          username: 'EcoWatcher',
          type: 'concerning',
          timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
        }
      ],
    },
  ];

  // Generate demo profiles
  const profiles: Profile[] = [
    {
      id: 'demo-user',
      username: 'Demo User',
      avatarEmoji: '🌊',
      region: 'ZW',
      points: 450,
      streakDays: 7,
      badges: [
        {
          code: 'ecoStarter',
          title: 'Eco Starter',
          emoji: '🌱',
          description: 'Submitted your first report',
          earnedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          code: 'waterGuardian',
          title: 'Water Guardian',
          emoji: '🛡️',
          description: 'Maintained a 7-day streak',
          earnedAt: new Date().toISOString(),
        }
      ],
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
        useCloudBackend: false,
      },
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'user-2',
      username: 'AquaExpert',
      avatarEmoji: '🔬',
      region: 'ZW',
      points: 820,
      streakDays: 15,
      badges: [
        {
          code: 'ecoStarter',
          title: 'Eco Starter',
          emoji: '🌱',
          description: 'Submitted your first report',
          earnedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          code: 'waveWatcher',
          title: 'Wave Watcher',
          emoji: '👁️',
          description: 'Verified 10 reports',
          earnedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          code: 'waterGuardian',
          title: 'Water Guardian',
          emoji: '🛡️',
          description: 'Maintained a 15-day streak',
          earnedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ],
      alertPreferences: {
        phMin: 6.5,
        phMax: 8.5,
        turbidityMax: 5.0,
        dissolvedOxygenMin: 5.0,
        alertRadius: 10.0,
      },
      featureFlags: {
        gamification: true,
        community: true,
        animatedCharts: true,
        heatmap: true,
        crazyDemo: false,
        useCloudBackend: false,
      },
      createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  return {
    'sensor-readings': sensorReadings,
    'predictions': predictions,
    'reports': reports,
    'profiles': profiles,
    'quiz-attempts': [] as QuizAttempt[],
  };
};

// Storage helpers
export const getDemoData = (key: string): any[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(`shanduko_demo_${key}`);
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Generate and store initial data
  const allData = generateDemoData();
  const data = allData[key as keyof typeof allData] || [];
  localStorage.setItem(`shanduko_demo_${key}`, JSON.stringify(data));
  return data;
};

export const storeDemoData = (key: string, data: any[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`shanduko_demo_${key}`, JSON.stringify(data));
};