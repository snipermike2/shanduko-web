'use client';

import { useEffect, useState } from 'react';
import { MetricCard } from '@/components/MetricCard';
import { Chart } from '@/components/Chart';
import { AnomalyBanner } from '@/components/AnomalyBanner';
import { PointsHUD } from '@/components/PointsHUD';
import { getLatestReadings, getHistory, getPredictions, getAlertPreferences } from '@/lib/api';
import type { SensorReading, Prediction, AlertPreferences } from '@/types/models';

export default function DashboardPage() {
  const [latestReadings, setLatestReadings] = useState<SensorReading[]>([]);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [alertPreferences, setAlertPreferences] = useState<AlertPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [latest, hist, pred, prefs] = await Promise.all([
          getLatestReadings(),
          getHistory(24),
          getPredictions(24),
          getAlertPreferences(),
        ]);
        
        setLatestReadings(latest);
        setHistory(hist);
        setPredictions(pred);
        setAlertPreferences(prefs);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const latestReading = latestReadings[0];
  
  // Check for anomalies
  const hasAnomaly = latestReading && alertPreferences && (
    latestReading.phLevel < alertPreferences.phMin ||
    latestReading.phLevel > alertPreferences.phMax ||
    latestReading.turbidity > alertPreferences.turbidityMax ||
    latestReading.dissolvedOxygen < alertPreferences.dissolvedOxygenMin ||
    latestReading.isAnomaly
  );

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
        
        <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <PointsHUD />
      </div>

      {hasAnomaly && latestReading && (
        <AnomalyBanner reading={latestReading} preferences={alertPreferences!} />
      )}

      {latestReading && (
        <>
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Current Water Quality</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="Temperature"
                value={latestReading.temperature.toFixed(1)}
                unit="°C"
                color="blue"
                isAnomaly={false}
              />
              <MetricCard
                title="pH Level"
                value={latestReading.phLevel.toFixed(1)}
                unit=""
                color="green"
                isAnomaly={alertPreferences ? (
                  latestReading.phLevel < alertPreferences.phMin ||
                  latestReading.phLevel > alertPreferences.phMax
                ) : false}
              />
              <MetricCard
                title="Dissolved O₂"
                value={latestReading.dissolvedOxygen.toFixed(1)}
                unit="mg/L"
                color="orange"
                isAnomaly={alertPreferences ? latestReading.dissolvedOxygen < alertPreferences.dissolvedOxygenMin : false}
              />
              <MetricCard
                title="Turbidity"
                value={latestReading.turbidity.toFixed(1)}
                unit="NTU"
                color="purple"
                isAnomaly={alertPreferences ? latestReading.turbidity > alertPreferences.turbidityMax : false}
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">24-Hour Trends</h2>
            <Chart 
              data={history}
              predictions={predictions}
              metric="temperature"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Location</h2>
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{latestReading.locationName || 'Lake Chivero'}</span>
              </div>
              {latestReading.latitude && latestReading.longitude && (
                <div className="mt-2 text-sm text-gray-500">
                  {latestReading.latitude.toFixed(4)}, {latestReading.longitude.toFixed(4)}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}