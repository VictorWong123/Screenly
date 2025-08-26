import React, { useState, useRef } from 'react';
import { LocalAdapter } from '../data/adapters/localAdapter';

const Toolbar = ({
  range,
  onRangeChange,
  compareMode,
  onCompareToggle,
  onDataImport,
  lastImportTime,
  user,
  onLogout
}) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef();
  const localAdapter = new LocalAdapter();

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const data = await localAdapter.importData(file);
      onDataImport(data);
      setShowImportModal(false);
      setImportError('');
    } catch (error) {
      setImportError('Invalid JSON file. Please export from the ScreenTime extension.');
    }
  };

  const handleTextImport = async () => {
    if (!importText.trim()) return;

    try {
      const data = await localAdapter.importFromText(importText);
      onDataImport(data);
      setShowImportModal(false);
      setImportText('');
      setImportError('');
    } catch (error) {
      setImportError('Invalid JSON text. Please check your data.');
    }
  };

  const loadSampleData = () => {
    import('../data/sampleSummary.json').then(data => {
      onDataImport(data);
    });
  };

  return (
    <div className="flex items-center justify-between mb-6">
      {/* Left side - Wordmark and controls */}
      <div className="flex items-center space-x-6">
        <h1 className="text-2xl font-bold text-zinc-900">ScreenTime</h1>

        {/* Range selector */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onRangeChange('today')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${range === 'today'
                ? 'bg-zinc-900 text-white'
                : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50'
              }`}
          >
            Today
          </button>
          <button
            onClick={() => onRangeChange('7d')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${range === '7d'
                ? 'bg-zinc-900 text-white'
                : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50'
              }`}
          >
            7 days
          </button>
          <button
            onClick={() => onRangeChange('30d')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${range === '30d'
                ? 'bg-zinc-900 text-white'
                : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50'
              }`}
          >
            30 days
          </button>
        </div>

        {/* Compare toggle */}
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={compareMode}
            onChange={onCompareToggle}
            className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-500"
          />
          <span className="text-sm text-zinc-700">vs previous period</span>
        </label>
      </div>

      {/* Right side - User info, Import and status */}
      <div className="flex items-center space-x-4">
        {/* User info */}
        {user && (
          <div className="flex items-center space-x-3">
            <div className="text-sm text-zinc-600">
              {user.user_metadata?.username || user.email}
            </div>
            <button
              onClick={onLogout}
              className="text-sm text-zinc-500 hover:text-zinc-700"
            >
              Logout
            </button>
          </div>
        )}

        {/* Import button */}
        <button
          onClick={() => setShowImportModal(true)}
          className="btn-primary"
        >
          Import Data
        </button>

        {/* Sample data button */}
        <button
          onClick={loadSampleData}
          className="btn-secondary"
        >
          Load Sample
        </button>

        {/* Share button (stub) */}
        <button
          disabled
          className="btn-secondary opacity-50 cursor-not-allowed"
          title="Coming soon with Supabase integration"
        >
          Share
        </button>

        {/* Extension status */}
        <div className="text-sm text-zinc-500">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Connected (manual import)</span>
          </div>
          {lastImportTime && (
            <div className="text-xs">
              Last import: {new Date(lastImportTime).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4">
              Import ScreenTime Data
            </h3>

            <div className="space-y-4">
              {/* File upload */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Upload JSON file
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
              </div>

              {/* Or paste JSON */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Or paste JSON data
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste your exported JSON data here..."
                  rows={4}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 resize-none"
                />
              </div>

              {importError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {importError}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={handleTextImport}
                  disabled={!importText.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import
                </button>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbar;
