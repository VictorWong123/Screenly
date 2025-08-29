import React, { useState } from 'react';

const AverageDailyTimeChart = ({ data, currentRange, onRangeChange }) => {
    const ranges = [
        { key: 'week', label: 'WEEK' },
        { key: 'month', label: 'MONTH' },
        { key: 'year', label: 'YEAR' }
    ];

    // Sample data structure - you can replace with real data
    const chartData = data || {
        week: [4.5, 5.5, 3.5, 2, 4, 5, 4.5],
        month: [4.2, 3.8, 4.5, 3.9, 4.1, 4.3, 4.0, 3.7, 4.2, 4.4, 3.9, 4.1, 4.3, 4.0, 3.8, 4.2, 4.1, 3.9, 4.3, 4.0, 4.2, 3.8, 4.1, 4.3, 4.0, 3.9, 4.2, 4.1, 3.8, 4.0],
        year: [3.8, 4.1, 4.3, 4.0, 3.9, 4.2, 4.1, 3.8, 4.0, 4.3, 4.1, 3.9]
    };

    const getLabels = (range) => {
        switch (range) {
            case 'week':
                return ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
            case 'month':
                return Array.from({ length: 30 }, (_, i) => (i + 1).toString());
            case 'year':
                return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            default:
                return [];
        }
    };

    const getAverageTime = (range) => {
        const values = chartData[range] || [];
        const total = values.reduce((sum, val) => sum + val, 0);
        const avg = total / values.length;
        const hours = Math.floor(avg);
        const minutes = Math.round((avg - hours) * 60);
        return `${hours}h ${minutes}m`;
    };

    const maxValue = Math.max(...(chartData[currentRange] || []));
    const labels = getLabels(currentRange);
    const values = chartData[currentRange] || [];

    return (
        <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-zinc-700/50">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-zinc-100">AVG DAILY TIME</h3>
                    <p className="text-3xl font-bold text-purple-400">{getAverageTime(currentRange)}</p>
                </div>
                <div className="flex space-x-1 bg-zinc-700/50 rounded-lg p-1 border border-zinc-600/50">
                    {ranges.map((range) => (
                        <button
                            key={range.key}
                            onClick={() => onRangeChange(range.key)}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${currentRange === range.key
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'text-zinc-300 hover:text-zinc-100'
                                }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Line Chart */}
            <div className="relative h-48">
                <svg width="100%" height="100%" viewBox="0 0 400 200" className="absolute inset-0">
                    {/* Grid Lines */}
                    {Array.from({ length: 4 }, (_, i) => {
                        const gridValue = Math.round(maxValue - (i * maxValue / 3));
                        const gridY = 200 - ((gridValue / maxValue) * 150 + 25);
                        return (
                            <line
                                key={i}
                                x1="0"
                                y1={gridY}
                                x2="400"
                                y2={gridY}
                                stroke="#4B5563"
                                strokeWidth="1"
                                strokeDasharray="5,5"
                            />
                        );
                    })}

                    {/* Y-axis labels */}
                    {Array.from({ length: 4 }, (_, i) => {
                        const gridValue = Math.round(maxValue - (i * maxValue / 3));
                        const gridY = 200 - ((gridValue / maxValue) * 150 + 25);
                        return (
                            <text
                                key={i}
                                x="0"
                                y={gridY}
                                textAnchor="end"
                                dominantBaseline="middle"
                                style={{ fontSize: '12px', fill: '#ffffff' }}
                                dx="-8"
                            >
                                {gridValue}h
                            </text>
                        );
                    })}

                    {/* Line Chart */}
                    <path
                        d={values.map((value, index) => {
                            const x = (index / (values.length - 1)) * 400;
                            // Fix scaling: map value to proper Y coordinate
                            const y = 200 - ((value / maxValue) * 150 + 25);
                            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ')}
                        stroke="#A855F7"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Data Points */}
                    {values.map((value, index) => {
                        const x = (index / (values.length - 1)) * 400;
                        // Fix scaling: map value to proper Y coordinate
                        const y = 200 - ((value / maxValue) * 150 + 25);
                        return (
                            <circle
                                key={index}
                                cx={x}
                                cy={y}
                                r="4"
                                fill="#A855F7"
                                className="hover:r-6 transition-all duration-200"
                            />
                        );
                    })}

                    {/* X-axis labels */}
                    {labels.map((label, index) => {
                        const x = (index / (values.length - 1)) * 400;
                        return (
                            <text
                                key={index}
                                x={x}
                                y="195"
                                textAnchor="middle"
                                style={{ fontSize: '12px', fill: '#ffffff' }}
                            >
                                {label}
                            </text>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
};

export default AverageDailyTimeChart;
