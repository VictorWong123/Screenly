import React, { useRef } from 'react';

const Toolbar = ({
  dateRange,
  setDateRange,
  compareMode,
  setCompareMode,
  onExport
}) => {
  const fileInputRef = useRef(null);

  const handleExport = () => {
    onExport();
  };

  return (
    <div className="flex items-center justify-between mb-6">
      {/* Left side - Brand */}
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-zinc-100">ScreenTime</h1>
      </div>

      {/* Center - Controls */}
      <div className="flex items-center gap-4">
        {/* Range Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-400">Range:</span>
          <div className="flex bg-zinc-700/50 rounded-lg p-1 border border-zinc-600/50">
            {['day', 'week', 'month'].map((rangeOption) => (
              <button
                key={rangeOption}
                onClick={() => setDateRange(rangeOption)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${dateRange === rangeOption
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-300 hover:text-zinc-100'
                  }`}
              >
                {rangeOption === 'day' ? 'Today' :
                  rangeOption === 'week' ? 'Week' : 'Month'}
              </button>
            ))}
          </div>
        </div>

        {/* Compare Toggle */}
        <button
          onClick={() => setCompareMode(compareMode === 'previous' ? 'none' : 'previous')}
          className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${compareMode === 'previous'
            ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
            : 'bg-zinc-700/50 text-zinc-300 hover:text-zinc-100 border border-zinc-600/50'
            }`}
        >
          Compare vs previous
        </button>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleExport}
          className="px-3 py-1 text-sm font-medium text-zinc-300 hover:text-zinc-100 border border-zinc-600/50 rounded-lg hover:bg-zinc-700/50 transition-colors"
        >
          Export JSON
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
