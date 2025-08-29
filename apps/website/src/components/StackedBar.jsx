import React from 'react';

const StackedBar = ({ data, categories, colors }) => {
    const maxValue = Math.max(...data.map(d =>
        categories.reduce((sum, cat) => sum + (d[cat] || 0), 0)
    ));

    const getBarHeight = (value) => {
        return (value / maxValue) * 200;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-end space-x-2 h-52">
                {data.map((day, index) => {
                    const total = categories.reduce((sum, cat) => sum + (day[cat] || 0), 0);
                    const height = getBarHeight(total);

                    return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                            <div className="w-full bg-zinc-700/50 rounded-t" style={{ height: `${height}px` }}>
                                {categories.map((cat, catIndex) => {
                                    const catValue = day[cat] || 0;
                                    const catHeight = getBarHeight(catValue);

                                    return catValue > 0 ? (
                                        <div
                                            key={catIndex}
                                            className="w-full"
                                            style={{
                                                height: `${catHeight}px`,
                                                backgroundColor: colors[catIndex % colors.length]
                                            }}
                                        />
                                    ) : null;
                                })}
                            </div>
                            <span className="text-xs text-zinc-400 mt-2">{day.day}</span>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-center space-x-6">
                {categories.map((cat, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <span className="text-sm text-zinc-300 capitalize">{cat}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StackedBar;
