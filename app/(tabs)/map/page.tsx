'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { getHistory, getAlertPreferences } from '@/lib/api';
import type { SensorReading, AlertPreferences } from '@/types/models';

// Dynamically import map to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-4rem)] bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
});

export default function MapPage() {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [preferences, setPreferences] = useState<AlertPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    metric: 'all',
    timeRange: '24h',
    showAnomaliesOnly: false,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const hours = filters.timeRange === '24h' ? 24 : filters.timeRange === '7d' ? 168 : 720; // 30d
        const [readingsData, prefsData] = await Promise.all([
          getHistory(hours),
          getAlertPreferences(),
        ]);
        
        setReadings(readingsData);
        setPreferences(prefsData);
      } catch (error) {
        console.error('Failed to load map data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters.timeRange]);

  const filteredReadings = readings.filter(reading => {
    if (filters.showAnomaliesOnly && !reading.isAnomaly) {
      return false;
    }
    return true;
  });

  return (
    <div className="h-[calc(100vh-4rem)] relative">
      {/* Filters */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time Range
          </label>
          <select
            value={filters.timeRange}
            onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
            className="block w-full rounded-md border-gray-300 shadow-sm text-sm"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Metric Focus
          </label>
          <select
            value={filters.metric}
            onChange={(e) => setFilters(prev => ({ ...prev, metric: e.target.value }))}
            className="block w-full rounded-md border-gray-300 shadow-sm text-sm"
          >
            <option value="all">All Metrics</option>
            <option value="temperature">Temperature</option>
            <option value="ph">pH Level</option>
            <option value="oxygen">Dissolved Oxygen</option>
            <option value="turbidity">Turbidity</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            id="anomalies-only"
            type="checkbox"
            checked={filters.showAnomaliesOnly}
            onChange={(e) => setFilters(prev => ({ ...prev, showAnomaliesOnly: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="anomalies-only" className="ml-2 block text-sm text-gray-700">
            Anomalies only
          </label>
        </div>
      </div>

      {/* Stats */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {filteredReadings.length}
          </div>
          <div className="text-sm text-gray-600">
            Data Points
          </div>
          {filters.showAnomaliesOnly && (
            <div className="text-xs text-red-600 mt-1">
              Anomalies only
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      {!loading && (
        <Map 
          readings={filteredReadings}
          preferences={preferences}
          selectedMetric={filters.metric}
        />
      )}
    </div>
  );
}