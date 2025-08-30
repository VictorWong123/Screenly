import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NavigationHeader from '../components/NavigationHeader';
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

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-900 text-zinc-100">
                <NavigationHeader />
                <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
                    <div className="text-xl">Loading profile...</div>
                </div>
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="min-h-screen bg-zinc-900 text-zinc-100">
                <NavigationHeader />
                <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
                    <div className="text-xl">User not found</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-900 text-zinc-100">
            <NavigationHeader />

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-zinc-100 mb-2">
                                {profileUser.username}'s Profile
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

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6">
                            <h3 className="text-sm font-medium text-zinc-400 mb-2">Total Time</h3>
                            <p className="text-2xl font-bold text-zinc-100">{summary.totalHours}h</p>
                        </div>
                        <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6">
                            <h3 className="text-sm font-medium text-zinc-400 mb-2">Sessions</h3>
                            <p className="text-2xl font-bold text-zinc-100">{summary.sessionCount}</p>
                        </div>
                        <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6">
                            <h3 className="text-sm font-medium text-zinc-400 mb-2">Avg Session</h3>
                            <p className="text-2xl font-bold text-zinc-100">{summary.avgSessionLength}m</p>
                        </div>
                        <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6">
                            <h3 className="text-sm font-medium text-zinc-400 mb-2">Activities</h3>
                            <p className="text-2xl font-bold text-zinc-100">{activities.length}</p>
                        </div>
                    </div>
                )}

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Average Daily Time</h3>
                        <AverageDailyTimeChart sessions={sessions} />
                    </div>
                    <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Most Used Time</h3>
                        <MostUsedTimeChart sessions={sessions} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Best Performances</h3>
                        <BestPerformancesChart sessions={sessions} />
                    </div>
                    <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Activity Breakdown</h3>
                        <DonutChart sessions={sessions} />
                    </div>
                </div>

                <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-zinc-100 mb-4">Progress Tracking</h3>
                    <ProgressChart sessions={sessions} />
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;
