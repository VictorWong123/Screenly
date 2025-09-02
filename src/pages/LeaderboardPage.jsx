import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import NavigationHeader from '../components/NavigationHeader';
import LeaderboardCard from '../components/LeaderboardCard';

const LeaderboardPage = () => {
    const { user, supabase } = useAuth();
    const [loading, setLoading] = useState(true);
    const [leaderboardData, setLeaderboardData] = useState({});
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    useEffect(() => {
        if (user && supabase) {
            loadLeaderboardData();
        } else {
            setDefaultData();
        }
    }, [user, supabase]);

    const loadLeaderboardData = async () => {
        try {
            setLoading(true);

            // Get all users with their 7-day average screen time
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            // First, get all user profiles
            const { data: allUsers, error: usersError } = await supabase
                .from('user_profiles')
                .select('id, username, email');

            if (usersError) throw usersError;

            // Then get all sessions from the last 7 days
            const { data: sessions, error: sessionsError } = await supabase
                .from('timer_sessions')
                .select(`
                    user_id,
                    duration_minutes,
                    started_at
                `)
                .gte('started_at', sevenDaysAgo.toISOString());

            if (sessionsError) throw sessionsError;

            // Process data to calculate 7-day averages and group by heats
            const userStats = processUserStats(allUsers || [], sessions || []);
            const heats = groupUsersIntoHeats(userStats);

            setLeaderboardData(heats);
        } catch (error) {
            console.error('Error loading leaderboard data:', error);
            setDefaultData();
        } finally {
            setLoading(false);
        }
    };

    const processUserStats = (allUsers, sessions) => {
        const userStats = {};

        // Initialize all users with 0 minutes
        allUsers.forEach(user => {
            userStats[user.id] = {
                id: user.id,
                username: user.username,
                email: user.email,
                totalMinutes: 0,
                sessionCount: 0,
                averageMinutes: 0
            };
        });

        // Add up session data
        sessions.forEach(session => {
            const userId = session.user_id;
            if (userStats[userId]) {
                userStats[userId].totalMinutes += session.duration_minutes;
                userStats[userId].sessionCount += 1;
            }
        });

        // Calculate 7-day average for all users
        Object.values(userStats).forEach(user => {
            user.averageMinutes = Math.round(user.totalMinutes / 7);
        });

        return Object.values(userStats);
    };

    const groupUsersIntoHeats = (userStats) => {
        const heats = {
            'Sub 2h': { title: 'Sub 2h', subtitle: '7-day average', users: [] },
            '2-3h': { title: '2-3h', subtitle: '7-day average', users: [] },
            '3-4h': { title: '3-4h', subtitle: '7-day average', users: [] },
            '4-5h': { title: '4-5h', subtitle: '7-day average', users: [] },
            '5-6h': { title: '5-6h', subtitle: '7-day average', users: [] },
            '>6h': { title: '>6h', subtitle: '7-day average', users: [] }
        };

        userStats.forEach(user => {
            const avgHours = user.averageMinutes / 60;

            if (avgHours < 2) {
                heats['Sub 2h'].users.push(user);
            } else if (avgHours >= 2 && avgHours < 3) {
                heats['2-3h'].users.push(user);
            } else if (avgHours >= 3 && avgHours < 4) {
                heats['3-4h'].users.push(user);
            } else if (avgHours >= 4 && avgHours < 5) {
                heats['4-5h'].users.push(user);
            } else if (avgHours >= 5 && avgHours < 6) {
                heats['5-6h'].users.push(user);
            } else {
                heats['>6h'].users.push(user);
            }
        });

        // Sort users within each heat by average minutes (descending)
        Object.values(heats).forEach(heat => {
            heat.users.sort((a, b) => b.averageMinutes - a.averageMinutes);
        });

        return heats;
    };

    const setDefaultData = () => {
        const mockUsers = [
            { id: '1', username: 'ez113', email: 'ez@example.com', averageMinutes: 15, projectedMinutes: 20 },
            { id: '2', username: 'sushi_di', email: 'sushi@example.com', averageMinutes: 45, projectedMinutes: 45 },
            { id: '3', username: 'conway', email: 'conway@example.com', averageMinutes: 135, projectedMinutes: 120 },
            { id: '4', username: 'alexwilh', email: 'alex@example.com', averageMinutes: 82, projectedMinutes: 122 },
            { id: '5', username: 'onepiece', email: 'onepiece@example.com', averageMinutes: 135, projectedMinutes: 120 },
            { id: '6', username: 'kai', email: 'kai@example.com', averageMinutes: 45, projectedMinutes: 74 },
            { id: '7', username: 'daltonc', email: 'dalton@example.com', averageMinutes: 60, projectedMinutes: 98 }
        ];

        const heats = {
            'Sub 2h': { title: 'Sub 2h', subtitle: '7-day average', users: mockUsers.slice(0, 2) },
            '2-3h': { title: '2-3h', subtitle: '7-day average', users: mockUsers.slice(2, 4) },
            '3-4h': { title: '3-4h', subtitle: '7-day average', users: mockUsers.slice(4, 5) },
            '4-5h': { title: '4-5h', subtitle: '7-day average', users: mockUsers.slice(5, 6) },
            '5-6h': { title: '5-6h', subtitle: '7-day average', users: [] },
            '>6h': { title: '>6h', subtitle: '7-day average', users: mockUsers.slice(6, 7) }
        };

        setLeaderboardData(heats);
        setLoading(false);
    };

    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    const getInitials = (username) => {
        return username
            .split('_')
            .map(word => word.charAt(0).toUpperCase())
            .join('')
            .slice(0, 2);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-900 text-zinc-100">
                <NavigationHeader />
                <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
                    <div className="text-xl">Loading leaderboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-900 text-zinc-100">
            <NavigationHeader />

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Leaderboard</h1>
                        <p className="text-zinc-400">Compare your productivity with other users</p>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center space-x-2 bg-zinc-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                                ? 'bg-purple-600 text-white'
                                : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                                ? 'bg-purple-600 text-white'
                                : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Leaderboard Grid */}
                <div className={`grid gap-6 ${viewMode === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                    }`}>
                    {Object.entries(leaderboardData).map(([heatKey, heatData], index) => (
                        <LeaderboardCard
                            key={heatKey}
                            heatNumber={index + 1}
                            title={heatData.title}
                            subtitle={heatData.subtitle}
                            users={heatData.users}
                            formatTime={formatTime}
                            getInitials={getInitials}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPage;
