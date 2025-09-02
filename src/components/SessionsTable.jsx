import React, { useState } from 'react';

const SessionsTable = ({
    sessions = [],
    activities = [],
    onEdit,
    onDelete
}) => {
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDuration = (minutes) => {
        if (!minutes) return '0m';

        if (minutes < 60) {
            return `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (remainingMinutes === 0) {
            return `${hours}h`;
        }
        return `${hours}h ${remainingMinutes}m`;
    };

    const getActivityName = (activityId) => {
        const activity = activities.find(a => a.id === activityId);
        return activity ? activity.name : 'Unknown Activity';
    };

    const getActivityCategory = (activityId) => {
        const activity = activities.find(a => a.id === activityId);
        return activity ? activity.category : 'No category';
    };

    const handleEdit = (session) => {
        setEditingId(session.id);
        setEditData({
            started_at: session.started_at,
            ended_at: session.ended_at,
            activity_id: session.activity_id
        });
    };

    const handleSave = (sessionId) => {
        if (!onEdit) return;
        onEdit(sessionId, editData);
        setEditingId(null);
        setEditData({});
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditData({});
    };

    const handleDelete = (sessionId) => {
        if (!onDelete) return;
        if (window.confirm('Are you sure you want to delete this session?')) {
            onDelete(sessionId);
        }
    };

    if (sessions.length === 0) {
        return (
            <div className="p-6">
                <div className="text-center py-8 text-zinc-400">
                    <p>No sessions found for this period.</p>
                    <p className="text-sm mt-1">Start a timer to create your first session.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-zinc-700/50">
                            <th className="text-left py-3 px-2 font-medium text-zinc-400">Start</th>
                            <th className="text-left py-3 px-2 font-medium text-zinc-400">End</th>
                            <th className="text-left py-3 px-2 font-medium text-zinc-400">Duration</th>
                            <th className="text-left py-3 px-2 font-medium text-zinc-400">Activity</th>
                            <th className="text-left py-3 px-2 font-medium text-zinc-400">Category</th>
                            {onEdit || onDelete ? (
                                <th className="text-left py-3 px-2 font-medium text-zinc-400">Actions</th>
                            ) : null}
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map((session) => (
                            <tr key={session.id} className="border-b border-zinc-700/30">
                                <td className="py-3 px-2">
                                    {editingId === session.id ? (
                                        <input
                                            type="datetime-local"
                                            value={editData.started_at ? editData.started_at.slice(0, 16) : ''}
                                            onChange={(e) => setEditData({ ...editData, started_at: e.target.value })}
                                            className="bg-zinc-700/50 border border-zinc-600/50 rounded px-2 py-1 text-zinc-100 text-sm w-40"
                                        />
                                    ) : (
                                        <div>
                                            <div className="font-medium text-zinc-100">{formatTime(session.started_at)}</div>
                                            <div className="text-xs text-zinc-400">{formatDate(session.started_at)}</div>
                                        </div>
                                    )}
                                </td>
                                <td className="py-3 px-2">
                                    {editingId === session.id ? (
                                        <input
                                            type="datetime-local"
                                            value={editData.ended_at ? editData.ended_at.slice(0, 16) : ''}
                                            onChange={(e) => setEditData({ ...editData, ended_at: e.target.value })}
                                            className="bg-zinc-700/50 border border-zinc-600/50 rounded px-2 py-1 text-zinc-100 text-sm w-40"
                                        />
                                    ) : (
                                        <div>
                                            <div className="font-medium text-zinc-100">{formatTime(session.ended_at)}</div>
                                            <div className="text-xs text-zinc-400">{formatDate(session.ended_at)}</div>
                                        </div>
                                    )}
                                </td>
                                <td className="py-3 px-2">
                                    <div className="text-zinc-300">
                                        {formatDuration(session.duration_minutes)}
                                    </div>
                                </td>
                                <td className="py-3 px-2">
                                    {editingId === session.id ? (
                                        <select
                                            value={editData.activity_id || session.activity_id || ''}
                                            onChange={(e) => setEditData({ ...editData, activity_id: e.target.value })}
                                            className="bg-zinc-700/50 border border-zinc-600/50 rounded px-2 py-1 text-zinc-100 text-sm"
                                        >
                                            <option value="">Select activity</option>
                                            {activities.map(activity => (
                                                <option key={activity.id} value={activity.id}>
                                                    {activity.name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="text-zinc-300">
                                            {getActivityName(session.activity_id)}
                                        </div>
                                    )}
                                </td>
                                <td className="py-3 px-2">
                                    <div className="text-zinc-300">
                                        {getActivityCategory(session.activity_id)}
                                    </div>
                                </td>
                                {onEdit || onDelete ? (
                                    <td className="py-3 px-2">
                                        {editingId === session.id ? (
                                            <div className="flex space-x-2">
                                                {onEdit ? (
                                                    <button
                                                        onClick={() => handleSave(session.id)}
                                                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                                    >
                                                        Save
                                                    </button>
                                                ) : null}
                                                <button
                                                    onClick={handleCancel}
                                                    className="px-2 py-1 bg-zinc-600 text-white text-xs rounded hover:bg-zinc-700 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex space-x-2">
                                                {onEdit ? (
                                                    <button
                                                        onClick={() => handleEdit(session)}
                                                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                ) : null}
                                                {onDelete ? (
                                                    <button
                                                        onClick={() => handleDelete(session.id)}
                                                        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                ) : null}
                                            </div>
                                        )}
                                    </td>
                                ) : null}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SessionsTable;
