// components/gamification/GamificationProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getFeatureFlags } from '@/lib/api';
import type { FeatureFlags } from '@/types/models';

interface GamificationContextType {
  enabled: boolean;
  featureFlags: FeatureFlags | null;
}

const GamificationContext = createContext<GamificationContextType>({
  enabled: false,
  featureFlags: null,
});

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags | null>(null);

  useEffect(() => {
    const loadFeatureFlags = async () => {
      try {
        const flags = await getFeatureFlags();
        setFeatureFlags(flags);
      } catch (error) {
        console.error('Failed to load feature flags:', error);
      }
    };

    loadFeatureFlags();
  }, []);

  const enabled = featureFlags?.gamification ?? false;

  return (
    <GamificationContext.Provider value={{ enabled, featureFlags }}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamificationContext() {
  return useContext(GamificationContext);
}