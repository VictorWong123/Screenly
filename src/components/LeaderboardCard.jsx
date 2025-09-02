import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LeaderboardCard = ({ heatNumber, title, subtitle, users, formatTime, getInitials }) => {
    const [showAll, setShowAll] = useState(false);
    const maxVisibleUsers = 5;
    const visibleUsers = showAll ? users : users.slice(0, maxVisibleUsers);
    const navigate = useNavigate();

    const calculateProjectedTime = (user) => {
        // Simple projection based on current average and trend
        // In a real app, this would be more sophisticated
        const trend = Math.random() > 0.5 ? 1.1 : 0.9; // Random trend
        return Math.round(user.averageMinutes * trend);
    };

    return (
        <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl shadow-lg">
            {/* Header */}
            <div className="p-6 border-b border-zinc-700/50">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-zinc-100 mb-1">{title}</h3>
                        <p className="text-sm text-zinc-400">{subtitle}</p>
                    </div>
                    <span className="text-sm font-medium text-purple-400 bg-purple-400/10 px-3 py-1 rounded-full">
                        Heat {heatNumber}
                    </span>
                </div>
            </div>

            {/* Leaderboard Table */}
            <div className="p-6">
                {visibleUsers.length > 0 ? (
                    <>
                        {/* Table Headers */}
                        <div className="grid grid-cols-12 gap-4 mb-4 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                            <div className="col-span-1">#</div>
                            <div className="col-span-5">User</div>
                            <div className="col-span-3">So Far</div>
                            <div className="col-span-3">Proj</div>
                        </div>

                        {/* User Rows */}
                        <div className="space-y-3">
                            {visibleUsers.map((user, index) => {
                                const projectedMinutes = calculateProjectedTime(user);
                                const isProjectedBetter = projectedMinutes >= user.averageMinutes;

                                return (
                                    <div key={user.id} className="grid grid-cols-12 gap-4 items-center py-2">
                                        {/* Rank */}
                                        <div className="col-span-1 text-sm font-medium text-zinc-300">
                                            {index + 1}
                                        </div>

                                        {/* User */}
                                        <div className="col-span-5 flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                                                <span className="text-xs font-medium text-zinc-300">
                                                    {getInitials(user.username)}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/profile/${user.id}`)}
                                                className="text-sm text-zinc-200 hover:text-purple-400 truncate transition-colors"
                                            >
                                                {user.username}
                                            </button>
                                        </div>

                                        {/* So Far */}
                                        <div className="col-span-3 text-sm text-zinc-200">
                                            {formatTime(user.averageMinutes)}
                                        </div>

                                        {/* Projected */}
                                        <div className={`col-span-3 text-sm font-medium ${isProjectedBetter ? 'text-green-400' : 'text-blue-400'
                                            }`}>
                                            {formatTime(projectedMinutes)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <div className="text-zinc-400 text-sm">No users in this heat yet</div>
                    </div>
                )}

                {/* Show All Button */}
                {users.length > maxVisibleUsers && (
                    <div className="mt-4 pt-4 border-t border-zinc-700/50">
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            {showAll ? 'Show less' : `Show all (${users.length})`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaderboardCard;
