import React, { useState, useEffect } from 'react';

const TimerPanel = ({
    isRunning,
    onStart,
    onStop,
    onDiscard,
    onSave,
    currentSession,
    projects = [],
    categories = [],
    onProjectChange,
    onProjectNameChange,
    onCategoryChange,
    onNoteChange
}) => {
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        let interval;
        if (isRunning && currentSession) {
            const startTime = new Date(currentSession.start);
            interval = setInterval(() => {
                const now = new Date();
                const elapsed = Math.floor((now - startTime) / 1000);
                setElapsedTime(elapsed);
            }, 1000);
        } else {
            setElapsedTime(0);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning, currentSession]);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStart = () => {
        onStart();
    };

    const handleStop = () => {
        onStop();
    };

    const handleDiscard = () => {
        onDiscard();
    };

    const handleSave = () => {
        onSave();
    };

    return (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-zinc-800">Timer</h2>
                <div className="text-3xl font-mono font-bold text-zinc-800">
                    {formatTime(elapsedTime)}
                </div>
            </div>

            <div className="space-y-4">
                {/* Project Selection */}
                <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Project
                    </label>
                    <select
                        value={currentSession?.projectId || ''}
                        onChange={(e) => onProjectChange(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isRunning}
                    >
                        <option value="">Select a project</option>
                        {projects.map(project => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* New Project Name Input */}
                <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Or create new project
                    </label>
                    <input
                        type="text"
                        value={currentSession?.projectName || ''}
                        onChange={(e) => onProjectNameChange(e.target.value)}
                        placeholder="Enter new project name..."
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isRunning}
                    />
                </div>

                {/* Category Selection */}
                <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Category
                    </label>
                    <select
                        value={currentSession?.category || ''}
                        onChange={(e) => onCategoryChange(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isRunning}
                    >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.name}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Note Input */}
                <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Note (optional)
                    </label>
                    <input
                        type="text"
                        value={currentSession?.note || ''}
                        onChange={(e) => onNoteChange(e.target.value)}
                        placeholder="Add a note..."
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isRunning}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    {!isRunning ? (
                        <button
                            onClick={handleStart}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            Start
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleStop}
                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                            >
                                Stop
                            </button>
                            <button
                                onClick={handleDiscard}
                                className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg font-medium hover:bg-zinc-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                                Discard
                            </button>
                        </>
                    )}

                    {!isRunning && currentSession && (
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                        >
                            Save
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TimerPanel;
