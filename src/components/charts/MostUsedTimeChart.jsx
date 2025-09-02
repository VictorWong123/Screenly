import React from 'react';

const MostUsedTimeChart = ({ data }) => {
    // Sample data structure - you can replace with real data
    const chartData = data || {
        midnight: 0.7,
        fourAM: 0.2,
        eightAM: 0.3,
        noon: 0.4,
        fourPM: 0.6,
        eightPM: 0.9
    };

    const timeLabels = [
        { key: 'midnight', label: 'Midnight', angle: 0 },
        { key: 'fourAM', label: '4 AM', angle: 60 },
        { key: 'eightAM', label: '8 AM', angle: 120 },
        { key: 'noon', label: 'Noon', angle: 180 },
        { key: 'fourPM', label: '4 PM', angle: 240 },
        { key: 'eightPM', label: '8 PM', angle: 300 }
    ];

    const centerX = 200 / 2;
    const centerY = 200 / 2;
    const radius = 60;
    const maxValue = Math.max(...Object.values(chartData));

    // Find the most used time
    const mostUsedTime = Object.entries(chartData).reduce((a, b) =>
        chartData[a[0]] > chartData[b[0]] ? a : b
    );

    const getMostUsedTimeLabel = () => {
        const timeMap = {
            midnight: 'Midnight',
            fourAM: '4 AM',
            eightAM: '8 AM',
            noon: 'Noon',
            fourPM: '4 PM',
            eightPM: '8 PM'
        };
        return timeMap[mostUsedTime[0]] || 'Evening';
    };

    const polarToCartesian = (angle, distance) => {
        const radian = (angle - 90) * (Math.PI / 180);
        return {
            x: centerX + distance * Math.cos(radian),
            y: centerY + distance * Math.sin(radian)
        };
    };

    const createPolygonPath = (values) => {
        const points = timeLabels.map(({ angle }) => {
            const value = values[timeLabels.find(t => t.angle === angle)?.key] || 0;
            const distance = (value / maxValue) * radius;
            return polarToCartesian(angle, distance);
        });

        return points.map((point, index) =>
            `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
        ).join(' ') + 'Z';
    };

    return (
        <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-zinc-700/50">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-zinc-100">MOST USED TIME</h3>
                <p className="text-3xl font-bold text-purple-400">{getMostUsedTimeLabel()}</p>
            </div>

            {/* Radar Chart */}
            <div className="relative h-48 flex items-center justify-center">
                <svg width="200" height="200" viewBox="0 0 200 200" className="absolute inset-0">
                    {/* Grid Lines */}
                    {Array.from({ length: 4 }, (_, i) => {
                        const gridRadius = (radius / 3) * (i + 1);
                        const points = timeLabels.map(({ angle }) => polarToCartesian(angle, gridRadius));
                        const path = points.map((point, index) =>
                            `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
                        ).join(' ') + 'Z';

                        return (
                            <path
                                key={i}
                                d={path}
                                fill="none"
                                stroke="#4B5563"
                                strokeWidth="1"
                                strokeDasharray="5,5"
                            />
                        );
                    })}

                    {/* Axis Lines */}
                    {timeLabels.map(({ angle }) => {
                        const endPoint = polarToCartesian(angle, radius);
                        return (
                            <line
                                key={angle}
                                x1={centerX}
                                y1={centerY}
                                x2={endPoint.x}
                                y2={endPoint.y}
                                stroke="#4B5563"
                                strokeWidth="1"
                            />
                        );
                    })}

                    {/* Data Polygon */}
                    <path
                        d={createPolygonPath(chartData)}
                        fill="#A855F7"
                        fillOpacity="0.3"
                        stroke="#A855F7"
                        strokeWidth="2"
                    />

                    {/* Data Points */}
                    {timeLabels.map(({ key, angle }) => {
                        const value = chartData[key] || 0;
                        const distance = (value / maxValue) * radius;
                        const point = polarToCartesian(angle, distance);

                        return (
                            <circle
                                key={key}
                                cx={point.x}
                                cy={point.y}
                                r="3"
                                fill="#A855F7"
                                className="hover:r-5 transition-all duration-200"
                            />
                        );
                    })}

                    {/* Time Labels */}
                    {timeLabels.map(({ key, angle, label }) => {
                        const labelRadius = radius + 15;
                        const point = polarToCartesian(angle, labelRadius);

                        return (
                            <text
                                key={key}
                                x={point.x}
                                y={point.y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                style={{ fontSize: '12px', fill: '#ffffff', fontWeight: '500' }}
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

export default MostUsedTimeChart;
