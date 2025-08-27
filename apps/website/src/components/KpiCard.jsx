import React from 'react';
import Sparkline from './Sparkline';

const KpiCard = ({ title, value, subtitle, sparklineData, previousValue, showChange }) => {
  const calculateChange = () => {
    if (!showChange || !previousValue || previousValue === 0) return null;
    const change = ((value - previousValue) / previousValue) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0
    };
  };

  const change = calculateChange();

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wide">
          {title}
        </h3>
        {sparklineData && sparklineData.length > 0 && (
          <Sparkline
            data={sparklineData}
            width={60}
            height={20}
            color="#6b7280"
          />
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-2xl font-semibold text-zinc-800">
            {value}
          </p>
          <p className="text-sm text-zinc-500 mt-1">
            {subtitle}
          </p>
        </div>

        {change && (
          <div className={`text-sm font-medium ${change.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
            {change.isPositive ? '+' : '-'}{change.value}%
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;