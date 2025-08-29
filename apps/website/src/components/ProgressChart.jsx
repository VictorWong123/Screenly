import React from 'react';

const ProgressChart = ({ data }) => {
    // Sample data structure - you can replace with real data
    const chartData = data || {
        subOneHourDays: { current: 12, target: 50 },
        daysUnderAverage: { current: 199, target: 100 },
        daysTracked: { current: 357, target: 365 }
    };

    const progressItems = [
        {
            key: 'subOneHourDays',
            label: 'Sub 1-hour days',
            current: chartData.subOneHourDays.current,
            target: chartData.subOneHourDays.target,
            color: 'bg-blue-600'
        },
        {
            key: 'daysUnderAverage',
            label: 'Days under average',
            current: chartData.daysUnderAverage.current,
            target: chartData.daysUnderAverage.target,
            color: 'bg-green-600'
        },
        {
            key: 'daysTracked',
            label: 'Days Tracked',
            current: chartData.daysTracked.current,
            target: chartData.daysTracked.target,
            color: 'bg-purple-600'
        }
    ];

    const calculateProgress = (current, target) => {
        const percentage = Math.min((current / target) * 100, 100);
        return Math.min(percentage, 100); // Cap at 100% for display
    };

    const formatProgress = (current, target) => {
        if (current > target) {
            return `${target}/${target} (${current})`;
        }
        return `${current}/${target}`;
    };

    return (
        <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-zinc-700/50">
            <h3 className="text-lg font-semibold text-zinc-100 mb-6">PROGRESS</h3>

            <div className="space-y-6">
                {progressItems.map((item) => {
                    const progress = calculateProgress(item.current, item.target);
                    const isOverTarget = item.current > item.target;

                    return (
                        <div key={item.key}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-zinc-400">{item.label}</span>
                                <span className="text-sm font-semibold text-zinc-100">
                                    {formatProgress(item.current, item.target)}
                                </span>
                            </div>

                            <div className="w-full bg-zinc-700/50 rounded-full h-3 overflow-hidden">
                                <div
                                    className={`h-full ${item.color} rounded-full transition-all duration-500 ease-out ${isOverTarget ? 'animate-pulse' : ''
                                        }`}
                                    style={{
                                        width: `${Math.min(progress, 100)}%`,
                                        maxWidth: '100%'
                                    }}
                                />
                            </div>

                            {isOverTarget && (
                                <div className="mt-1 text-xs text-green-400 font-medium">
                                    🎉 Exceeded target by {item.current - item.target}!
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProgressChart;
