import React from 'react';

const DonutChart = ({ data, colors }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    const createArc = (startAngle, endAngle, radius) => {
        const x1 = radius * Math.cos(startAngle);
        const y1 = radius * Math.sin(startAngle);
        const x2 = radius * Math.cos(endAngle);
        const y2 = radius * Math.sin(endAngle);

        const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;

        return [
            `M ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'L 0 0',
            'Z'
        ].join(' ');
    };

    return (
        <div className="flex items-center justify-center">
            <div className="relative">
                <svg width="200" height="200" viewBox="-100 -100 200 200">
                    {data.map((item, index) => {
                        const startAngle = currentAngle;
                        const endAngle = currentAngle + (item.value / total) * 2 * Math.PI;
                        const path = createArc(startAngle, endAngle, 80);

                        currentAngle = endAngle;

                        return (
                            <path
                                key={index}
                                d={path}
                                fill={colors[index % colors.length]}
                                stroke="none"
                            />
                        );
                    })}
                    <circle cx="0" cy="0" r="40" fill="transparent" stroke="#374151" strokeWidth="2" />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-zinc-100">{total.toFixed(0)}</p>
                        <p className="text-sm text-zinc-400">Total</p>
                    </div>
                </div>
            </div>

            <div className="ml-6 space-y-2">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <span className="text-sm text-zinc-300">{item.name}</span>
                        <span className="text-sm text-zinc-400">({item.value.toFixed(0)})</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DonutChart;
