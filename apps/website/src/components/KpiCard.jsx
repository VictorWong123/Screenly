import React from 'react';
import Sparkline from './Sparkline';
import { formatMinutes, formatPercentage, formatPercentageChange } from '../lib/format';

const KpiCard = ({ title, value, subtitle, sparklineData, previousValue, showChange = false }) => {
  const change = showChange && previousValue !== undefined 
    ? ((value - previousValue) / previousValue) * 100 
    : null;

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wide">
            {title}
          </h3>
          <div className="mt-1">
            <p className="text-2xl font-bold text-zinc-900">
              {typeof value === 'number' && title.toLowerCase().includes('time') 
                ? formatMinutes(value)
                : typeof value === 'number' && title.toLowerCase().includes('ratio')
                ? formatPercentage(value)
                : value}
            </p>
            {subtitle && (
              <p className="text-sm text-zinc-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {sparklineData && (
          <div className="flex-shrink-0">
            <Sparkline 
              data={sparklineData} 
              width={60} 
              height={20}
              color={title.toLowerCase().includes('time') ? '#3b82f6' : '#6b7280'}
            />
          </div>
        )}
      </div>
      
      {showChange && change !== null && (
        <div className="flex items-center text-sm">
          <span className={`font-medium ${
            change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-zinc-500'
          }`}>
            {formatPercentageChange(change)}
          </span>
          <span className="text-zinc-400 ml-1">vs previous period</span>
        </div>
      )}
    </div>
  );
};

export default KpiCard;
