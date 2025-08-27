import React, { useState } from 'react';

const SessionsTable = ({
    sessions = [],
    projects = [],
    categories = [],
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

    const formatDuration = (start, end) => {
        if (!end) return 'Running...';
        const durationMs = new Date(end).getTime() - new Date(start).getTime();
        const minutes = Math.round(durationMs / (1000 * 60));

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

    const getProjectName = (projectId) => {
        const project = projects.find(p => p.id === projectId);
        return project ? project.name : 'No project';
    };

    const handleEdit = (session) => {
        setEditingId(session.id);
        setEditData({
            projectId: session.projectId || '',
            category: session.category || '',
            note: session.note || ''
        });
    };

    const handleSave = (sessionId) => {
        onEdit(sessionId, editData);
        setEditingId(null);
        setEditData({});
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditData({});
    };

    const handleDelete = (sessionId) => {
        if (window.confirm('Are you sure you want to delete this session?')) {
            onDelete(sessionId);
        }
    };

    if (sessions.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-zinc-800 mb-4">Sessions</h3>
                <div className="text-center py-8 text-zinc-500">
                    <p>No sessions found for this period.</p>
                    <p className="text-sm mt-1">Start a timer to create your first session.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-zinc-800 mb-4">Sessions</h3>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-zinc-200">
                            <th className="text-left py-3 px-2 font-medium text-zinc-600">Start</th>
                            <th className="text-left py-3 px-2 font-medium text-zinc-600">End</th>
                            <th className="text-left py-3 px-2 font-medium text-zinc-600">Duration</th>
                            <th className="text-left py-3 px-2 font-medium text-zinc-600">Project</th>
                            <th className="text-left py-3 px-2 font-medium text-zinc-600">Category</th>
                            <th className="text-left py-3 px-2 font-medium text-zinc-600">Note</th>
                            <th className="text-right py-3 px-2 font-medium text-zinc-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map((session) => (
                            <tr key={session.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                                <td className="py-3 px-2 text-zinc-800">
                                    <div className="font-medium">{formatTime(session.start)}</div>
                                    <div className="text-xs text-zinc-500">{formatDate(session.start)}</div>
                                </td>
                                <td className="py-3 px-2 text-zinc-800">
                                    {session.end ? (
                                        <>
                                            <div className="font-medium">{formatTime(session.end)}</div>
                                            <div className="text-xs text-zinc-500">{formatDate(session.end)}</div>
                                        </>
                                    ) : (
                                        <span className="text-zinc-500 italic">Running...</span>
                                    )}
                                </td>
                                <td className="py-3 px-2 text-zinc-800 font-medium">
                                    {formatDuration(session.start, session.end)}
                                </td>
                                <td className="py-3 px-2 text-zinc-800">
                                    {editingId === session.id ? (
                                        <select
                                            value={editData.projectId}
                                            onChange={(e) => setEditData({ ...editData, projectId: e.target.value })}
                                            className="w-full px-2 py-1 border border-zinc-300 rounded text-xs"
                                        >
                                            <option value="">No project</option>
                                            {projects.map(project => (
                                                <option key={project.id} value={project.id}>
                                                    {project.name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        getProjectName(session.projectId)
                                    )}
                                </td>
                                <td className="py-3 px-2 text-zinc-800">
                                    {editingId === session.id ? (
                                        <select
                                            value={editData.category}
                                            onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                                            className="w-full px-2 py-1 border border-zinc-300 rounded text-xs"
                                        >
                                            <option value="">No category</option>
                                            {categories.map(category => (
                                                <option key={category.id} value={category.name}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        session.category || 'No category'
                                    )}
                                </td>
                                <td className="py-3 px-2 text-zinc-800">
                                    {editingId === session.id ? (
                                        <input
                                            type="text"
                                            value={editData.note}
                                            onChange={(e) => setEditData({ ...editData, note: e.target.value })}
                                            className="w-full px-2 py-1 border border-zinc-300 rounded text-xs"
                                            placeholder="Add note..."
                                        />
                                    ) : (
                                        session.note || '-'
                                    )}
                                </td>
                                <td className="py-3 px-2 text-right">
                                    {editingId === session.id ? (
                                        <div className="flex gap-1 justify-end">
                                            <button
                                                onClick={() => handleSave(session.id)}
                                                className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="px-2 py-1 bg-zinc-500 text-white rounded text-xs hover:bg-zinc-600"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-1 justify-end">
                                            <button
                                                onClick={() => handleEdit(session)}
                                                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(session.id)}
                                                className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SessionsTable;
