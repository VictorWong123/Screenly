import React from 'react';

const BestPerformancesChart = ({ data }) => {
    // Sample data structure - you can replace with real data
    const chartData = data || {
        bestTime: 30,
        bestWeekAvg: 45,
        yearAvg: 222, // in minutes
        subOneHour: 12
    };

    // Helper function to format time in an intuitive way
    const formatTimeIntuitive = (minutes) => {
        if (minutes < 60) {
            return `${minutes}m`;
        } else if (minutes < 1440) { // Less than 24 hours
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            if (remainingMinutes === 0) {
                return `${hours}h`;
            }
            return `${hours}h ${remainingMinutes}m`;
        } else {
            const days = Math.floor(minutes / 1440);
            const remainingHours = Math.floor((minutes % 1440) / 60);
            if (remainingHours === 0) {
                return `${days}d`;
            }
            return `${days}d ${remainingHours}h`;
        }
    };

    const metrics = [
        {
            key: 'bestTime',
            label: 'BEST TIME',
            value: formatTimeIntuitive(chartData.bestTime),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            color: 'text-yellow-400'
        },
        {
            key: 'bestWeekAvg',
            label: 'BEST WEEK AVG',
            value: formatTimeIntuitive(chartData.bestWeekAvg),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'text-green-400'
        },
        {
            key: 'yearAvg',
            label: 'YEAR AVG',
            value: formatTimeIntuitive(chartData.yearAvg),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'text-blue-400'
        },
        {
            key: 'subOneHour',
            label: 'SUB 1-HOUR',
            value: chartData.subOneHour.toString(),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            color: 'text-purple-400'
        }
    ];

    return (
        <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-zinc-700/50">
            <h3 className="text-lg font-semibold text-zinc-100 mb-6">BEST PERFORMANCES</h3>

            <div className="grid grid-cols-2 gap-4">
                {metrics.map((metric) => (
                    <div key={metric.key} className="flex items-center space-x-3 p-3 bg-zinc-700/30 rounded-lg border border-zinc-600/30">
                        <div className={`${metric.color} bg-zinc-800/50 p-2 rounded-lg shadow-sm`}>
                            {metric.icon}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400">{metric.label}</p>
                            <p className="text-lg font-bold text-zinc-100">{metric.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BestPerformancesChart;
