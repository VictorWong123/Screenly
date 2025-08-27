import React from 'react';

const DebugInfo = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h4 className="font-bold mb-2">🔍 Debug Info</h4>
      <div className="space-y-1">
        <div>URL: {supabaseUrl ? '✅ Set' : '❌ Missing'}</div>
        <div>Key: {supabaseKey ? '✅ Set' : '❌ Missing'}</div>
        <div>Key Length: {supabaseKey?.length || 0}</div>
        <div>Key Start: {supabaseKey?.substring(0, 20)}...</div>
        <div>Key End: ...{supabaseKey?.substring(supabaseKey?.length - 20)}</div>
      </div>
    </div>
  );
};

export default DebugInfo;
