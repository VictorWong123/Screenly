import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import {
    AverageDailyTimeChart,
    MostUsedTimeChart,
    BestPerformancesChart,
    ProgressChart,
    DonutChart
} from '../components/charts';

const UserProfilePage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user, supabase } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profileUser, setProfileUser] = useState(null);
    const [activities, setActivities] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [summary, setSummary] = useState(null);
    const [dateRange, setDateRange] = useState('week');

    useEffect(() => {
        if (userId && supabase) {
            loadUserProfile();
        }
    }, [userId, supabase]);

    const loadUserProfile = async () => {
        try {
            setLoading(true);

            // Get user profile
            const { data: userData, error: userError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (userError) throw userError;
            setProfileUser(userData);

            // Load user's activities
            const { data: activitiesData, error: activitiesError } = await supabase
                .from('activities')
                .select('*')
                .eq('user_id', userId)
                .order('name');

            if (activitiesError) throw activitiesError;
            setActivities(activitiesData || []);

            // Load user's sessions
            await loadSessions(dateRange);
        } catch (error) {
            console.error('Error loading user profile:', error);
            navigate('/leaderboard');
        } finally {
            setLoading(false);
        }
    };

    const loadSessions = async (range) => {
        try {
            const { data, error } = await supabase
                .from('timer_sessions')
                .select(`
          *,
          activities!inner(name, category, color)
        `)
                .eq('user_id', userId)
                .gte('started_at', getDateRange(range).start)
                .lte('started_at', getDateRange(range).end)
                .order('started_at', { ascending: false });

            if (error) throw error;
            setSessions(data || []);

            // Build summary
            const summaryData = buildSummary(data || []);
            setSummary(summaryData);
        } catch (error) {
            console.error('Error loading sessions:', error);
            setSessions([]);
            setSummary(null);
        }
    };

    const getDateRange = (range) => {
        const now = new Date();
        const start = new Date();

        switch (range) {
            case 'day':
                start.setHours(0, 0, 0, 0);
                break;
            case 'week':
                start.setDate(now.getDate() - 7);
                break;
            case 'month':
                start.setMonth(now.getMonth() - 1);
                break;
            default:
                start.setDate(now.getDate() - 7);
        }

        return { start: start.toISOString(), end: now.toISOString() };
    };

    const buildSummary = (sessionsData) => {
        const totalMinutes = sessionsData.reduce((sum, session) => sum + session.duration_minutes, 0);
        const sessionCount = sessionsData.length;
        const avgSessionLength = sessionCount > 0 ? Math.round(totalMinutes / sessionCount) : 0;

        return {
            totalMinutes,
            sessionCount,
            avgSessionLength,
            totalHours: Math.round(totalMinutes / 60 * 10) / 10
        };
    };

    // Transform sessions data for AverageDailyTimeChart
    const transformSessionsForAverageDailyTime = (sessionsData) => {
        if (!sessionsData || sessionsData.length === 0) {
            return {
                week: [0, 0, 0, 0, 0, 0, 0],
                month: Array.from({ length: 30 }, () => 0),
                year: Array.from({ length: 12 }, () => 0)
            };
        }

        // Group sessions by day
        const sessionsByDay = {};
        sessionsData.forEach(session => {
            const date = new Date(session.started_at).toDateString();
            if (!sessionsByDay[date]) {
                sessionsByDay[date] = 0;
            }
            sessionsByDay[date] += session.duration_minutes / 60; // Convert to hours
        });

        // Create week data (last 7 days)
        const weekData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayKey = date.toDateString();
            weekData.push(sessionsByDay[dayKey] || 0);
        }

        // Create month data (last 30 days)
        const monthData = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayKey = date.toDateString();
            monthData.push(sessionsByDay[dayKey] || 0);
        }

        // Create year data (last 12 months)
        const yearData = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = date.getFullYear() + '-' + (date.getMonth() + 1);
            const monthSessions = sessionsData.filter(session => {
                const sessionDate = new Date(session.started_at);
                return sessionDate.getFullYear() === date.getFullYear() &&
                    sessionDate.getMonth() === date.getMonth();
            });
            const monthHours = monthSessions.reduce((sum, session) => sum + session.duration_minutes / 60, 0);
            yearData.push(monthHours);
        }

        return {
            week: weekData,
            month: monthData,
            year: yearData
        };
    };

    // Transform sessions data for MostUsedTimeChart
    const transformSessionsForMostUsedTime = (sessionsData) => {
        if (!sessionsData || sessionsData.length === 0) {
            return {
                midnight: 0.1,
                fourAM: 0.1,
                eightAM: 0.1,
                noon: 0.1,
                fourPM: 0.1,
                eightPM: 0.1
            };
        }

        const timeSlots = {
            midnight: 0,
            fourAM: 0,
            eightAM: 0,
            noon: 0,
            fourPM: 0,
            eightPM: 0
        };

        sessionsData.forEach(session => {
            const hour = new Date(session.started_at).getHours();
            const duration = session.duration_minutes / 60; // Convert to hours

            if (hour >= 0 && hour < 4) timeSlots.midnight += duration;
            else if (hour >= 4 && hour < 8) timeSlots.fourAM += duration;
            else if (hour >= 8 && hour < 12) timeSlots.eightAM += duration;
            else if (hour >= 12 && hour < 16) timeSlots.noon += duration;
            else if (hour >= 16 && hour < 20) timeSlots.fourPM += duration;
            else if (hour >= 20 && hour < 24) timeSlots.eightPM += duration;
        });

        return timeSlots;
    };

    // Transform sessions data for ProgressChart
    const transformSessionsForProgress = (sessionsData) => {
        if (!sessionsData || sessionsData.length === 0) {
            return {
                subOneHourDays: { current: 0, target: 50 },
                daysUnderAverage: { current: 0, target: 100 },
                daysTracked: { current: 0, target: 365 }
            };
        }

        const totalDays = sessionsData.length;
        const subOneHourDays = sessionsData.filter(session => session.duration_minutes < 60).length;
        const avgDuration = sessionsData.reduce((sum, session) => sum + session.duration_minutes, 0) / totalDays;
        const daysUnderAverage = sessionsData.filter(session => session.duration_minutes < avgDuration).length;

        return {
            subOneHourDays: { current: subOneHourDays, target: 50 },
            daysUnderAverage: { current: daysUnderAverage, target: 100 },
            daysTracked: { current: totalDays, target: 365 }
        };
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-zinc-300">Loading profile...</div>
                </div>
            </Layout>
        );
    }

    if (!profileUser) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-zinc-300">User not found</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="px-0 py-0">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-zinc-100 mb-2">
                                {profileUser.username}'s Dashboard
                            </h1>
                            <p className="text-zinc-400">Productivity analytics and insights</p>
                        </div>
                        <button
                            onClick={() => navigate('/leaderboard')}
                            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 rounded-lg font-medium transition-colors"
                        >
                            Back to Leaderboard
                        </button>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Average Daily Time</h3>
                        <AverageDailyTimeChart data={transformSessionsForAverageDailyTime(sessions)} currentRange={dateRange} onRangeChange={setDateRange} />
                    </div>
                    <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Most Used Time</h3>
                        <MostUsedTimeChart data={transformSessionsForMostUsedTime(sessions)} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Best Performances</h3>
                        <BestPerformancesChart activities={activities} sessions={sessions} />
                    </div>
                    <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Activity Breakdown</h3>
                        <DonutChart activities={activities} sessions={sessions} />
                    </div>
                </div>

                <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-zinc-100 mb-4">Progress Tracking</h3>
                    <ProgressChart data={transformSessionsForProgress(sessions)} />
                </div>
            </div>
        </Layout>
    );
};

export default UserProfilePage;
