import React, { useRef } from 'react';

const Toolbar = ({ 
  range, 
  onRangeChange, 
  compareMode, 
  onCompareToggle, 
  onExport, 
  onImport 
}) => {
  const fileInputRef = useRef(null);

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImport(file);
    }
    // Reset input
    event.target.value = '';
  };

  const handleExport = () => {
    onExport();
  };

  return (
    <div className="flex items-center justify-between mb-6">
      {/* Left side - Brand */}
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-zinc-800">Chronica</h1>
      </div>

      {/* Center - Controls */}
      <div className="flex items-center gap-4">
        {/* Range Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-600">Range:</span>
          <div className="flex bg-zinc-100 rounded-lg p-1">
            {['today', '7d', '30d'].map((rangeOption) => (
              <button
                key={rangeOption}
                onClick={() => onRangeChange(rangeOption)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  range === rangeOption
                    ? 'bg-white text-zinc-800 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-800'
                }`}
              >
                {rangeOption === 'today' ? 'Today' : 
                 rangeOption === '7d' ? '7 days' : '30 days'}
              </button>
            ))}
          </div>
        </div>

        {/* Compare Toggle */}
        <button
          onClick={onCompareToggle}
          className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
            compareMode
              ? 'bg-blue-100 text-blue-800 border border-blue-200'
              : 'bg-zinc-100 text-zinc-600 hover:text-zinc-800'
          }`}
        >
          Compare vs previous
        </button>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleExport}
          className="px-3 py-1 text-sm font-medium text-zinc-600 hover:text-zinc-800 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
        >
          Export JSON
        </button>
        
        <button
          onClick={handleImport}
          className="px-3 py-1 text-sm font-medium text-zinc-600 hover:text-zinc-800 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
        >
          Import JSON
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default Toolbar;
