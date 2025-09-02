import React, { useState } from 'react';
import SessionsTable from './SessionsTable';

const RecentActivities = ({ user, supabase, sessions, activities, onRefresh, dateRange }) => {
    const [busy, setBusy] = useState(false);


    return (
        <div className="bg-zinc-800/50 rounded-lg border border-zinc-700/50">
            <div className="p-6 border-b border-zinc-700/50 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-100">Recent Sessions</h3>
                {busy && (
                    <div className="text-xs text-zinc-400">Saving...</div>
                )}
            </div>
            <SessionsTable
                sessions={sessions}
                activities={activities}
            />
        </div>
    );
};

export default RecentActivities;
