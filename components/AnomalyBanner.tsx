'use client';

import { useState } from 'react';
import type { SensorReading, AlertPreferences } from '@/types/models';

interface AnomalyBannerProps {
  reading: SensorReading;
  preferences: AlertPreferences;
}

export function AnomalyBanner({ reading, preferences }: AnomalyBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const issues: string[] = [];
  
  if (reading.phLevel < preferences.phMin || reading.phLevel > preferences.phMax) {
    issues.push(`pH: ${reading.phLevel.toFixed(1)} (normal: ${preferences.phMin}-${preferences.phMax})`);
  }
  
  if (reading.turbidity > preferences.turbidityMax) {
    issues.push(`Turbidity: ${reading.turbidity.toFixed(1)} NTU (max: ${preferences.turbidityMax})`);
  }
  
  if (reading.dissolvedOxygen < preferences.dissolvedOxygenMin) {
    issues.push(`Low oxygen: ${reading.dissolvedOxygen.toFixed(1)} mg/L (min: ${preferences.dissolvedOxygenMin})`);
  }

  if (issues.length === 0 && !reading.isAnomaly) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Water Quality Alert
          </h3>
          
          <div className="mt-2 text-sm text-red-700">
            {issues.length > 0 ? (
              <p>Parameters outside normal range: {issues.join(', ')}</p>
            ) : (
              <p>Anomaly detected in water quality readings</p>
            )}
          </div>
          
          <div className="mt-2 text-xs text-red-600">
            Detected at {reading.locationName || 'Lake Chivero'} • {new Date(reading.timestamp).toLocaleTimeString()}
          </div>
        </div>
        
        <div className="ml-auto pl-3">
          <button
            onClick={() => setDismissed(true)}
            className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}