// components/Chart.tsx
'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { SensorReading, Prediction } from '@/types/models';

interface ChartProps {
  data: SensorReading[];
  predictions?: Prediction[];
  metric: 'temperature' | 'phLevel' | 'dissolvedOxygen' | 'turbidity';
}

const metricConfig = {
  temperature: {
    label: 'Temperature',
    unit: '°C',
    color: '#3B82F6',
    domain: [15, 35],
  },
  phLevel: {
    label: 'pH Level',
    unit: '',
    color: '#10B981',
    domain: [5, 10],
  },
  dissolvedOxygen: {
    label: 'Dissolved Oxygen',
    unit: 'mg/L',
    color: '#F59E0B',
    domain: [0, 12],
  },
  turbidity: {
    label: 'Turbidity',
    unit: 'NTU',
    color: '#8B5CF6',
    domain: [0, 20],
  },
};

const metricTabs = [
  { key: 'temperature', label: 'Temp' },
  { key: 'phLevel', label: 'pH' },
  { key: 'dissolvedOxygen', label: 'DO' },
  { key: 'turbidity', label: 'Turbidity' },
] as const;

// Custom dot component for historical data
const HistoricalDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!payload || payload.type !== 'historical') {
    return <circle cx={cx} cy={cy} r={0} fill="transparent" />;
  }
  
  return (
    <circle
      cx={cx}
      cy={cy}
      r={payload.isAnomaly ? 4 : 2}
      fill={payload.isAnomaly ? '#EF4444' : props.stroke}
      stroke="white"
      strokeWidth={1}
    />
  );
};

// Custom dot component for prediction data
const PredictionDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!payload || payload.type !== 'prediction') {
    return <circle cx={cx} cy={cy} r={0} fill="transparent" />;
  }
  
  return (
    <circle
      cx={cx}
      cy={cy}
      r={payload.isAnomaly ? 4 : 2}
      fill={payload.isAnomaly ? '#EF4444' : props.stroke}
      stroke="white"
      strokeWidth={1}
      opacity={0.8}
    />
  );
};

export function Chart({ data, predictions = [], metric: initialMetric }: ChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<typeof initialMetric>(initialMetric);
  
  const config = metricConfig[selectedMetric];
  
  // Combine historical data and predictions
  const chartData = [
    ...data.map(reading => ({
      timestamp: new Date(reading.timestamp).getTime(),
      value: reading[selectedMetric],
      isAnomaly: reading.isAnomaly,
      type: 'historical' as const,
    })),
    ...predictions.map(prediction => ({
      timestamp: new Date(prediction.timestamp).getTime(),
      value: prediction[selectedMetric],
      isAnomaly: prediction.isAnomaly,
      type: 'prediction' as const,
    })),
  ].sort((a, b) => a.timestamp - b.timestamp);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.abs(now.getTime() - timestamp) / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      return 'Now';
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      {/* Metric selector tabs */}
      <div className="flex space-x-1 mb-4 p-1 bg-gray-100 rounded-lg">
        {metricTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedMetric(tab.key)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              selectedMetric === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="timestamp"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tickFormatter={formatTime}
              stroke="#6B7280"
              fontSize={12}
            />
            <YAxis 
              domain={config.domain}
              stroke="#6B7280"
              fontSize={12}
            />
            <Tooltip
              labelFormatter={(timestamp) => formatTime(timestamp as number)}
              formatter={(value, name, props) => [
                `${(value as number).toFixed(1)}${config.unit}`,
                props.payload.type === 'prediction' ? 'Predicted' : 'Actual'
              ]}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
            
            {/* Historical data line */}
            <Line
              dataKey="value"
              stroke={config.color}
              strokeWidth={2}
              dot={<HistoricalDot stroke={config.color} />}
              connectNulls={false}
            />
            
            {/* Prediction line */}
            <Line
              dataKey={(item) => item.type === 'prediction' ? item.value : null}
              stroke={config.color}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={<PredictionDot stroke={config.color} />}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-0.5" style={{ backgroundColor: config.color }} />
          <span>Historical</span>
        </div>
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-0.5 opacity-80" 
            style={{ 
              backgroundColor: config.color,
              borderTop: '2px dashed',
              borderColor: config.color 
            }} 
          />
          <span>Predicted</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <span>Anomaly</span>
        </div>
      </div>
    </div>
  );
}