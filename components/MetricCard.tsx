'use client';

import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  unit: string;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  isAnomaly?: boolean;
}

const colorClasses = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  orange: 'text-orange-600',
  purple: 'text-purple-600',
  red: 'text-red-600',
};

export function MetricCard({ title, value, unit, color, isAnomaly = false }: MetricCardProps) {
  return (
    <div className={cn(
      'bg-white rounded-lg border p-4 transition-all duration-200',
      isAnomaly 
        ? 'border-red-300 bg-red-50 shadow-md' 
        : 'border-gray-200 hover:shadow-sm'
    )}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {isAnomaly && (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      
      <div className="flex items-baseline space-x-1">
        <span className={cn(
          'text-2xl font-bold',
          isAnomaly ? 'text-red-600' : colorClasses[color]
        )}>
          {value}
        </span>
        {unit && (
          <span className={cn(
            'text-sm font-medium',
            isAnomaly ? 'text-red-500' : colorClasses[color]
          )}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}