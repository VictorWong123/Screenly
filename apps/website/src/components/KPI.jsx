import React from 'react';

const KPI = ({ title, value, change, trend }) => {
    const getTrendIcon = () => {
        if (trend === 'up') return '↗';
        if (trend === 'down') return '↘';
        return '→';
    };

    const getTrendColor = () => {
        if (trend === 'up') return 'text-green-400';
        if (trend === 'down') return 'text-red-400';
        return 'text-zinc-400';
    };

    const getChangeColor = () => {
        if (change > 0) return 'text-green-400';
        if (change < 0) return 'text-red-400';
        return 'text-zinc-400';
    };

    return (
        <div className="bg-zinc-800/50 backdrop-blur-sm rounded-lg border border-zinc-700/50 p-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
                <span className={`text-lg ${getTrendColor()}`}>{getTrendIcon()}</span>
            </div>
            <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-bold text-zinc-100">{value}</p>
                {change !== 0 && (
                    <span className={`text-sm font-medium ${getChangeColor()}`}>
                        {change > 0 ? '+' : ''}{change.toFixed(1)}%
                    </span>
                )}
            </div>
        </div>
    );
};

export default KPI;
