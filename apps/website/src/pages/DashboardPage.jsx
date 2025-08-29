import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import NavigationHeader from '../components/NavigationHeader';
import AverageDailyTimeChart from '../components/AverageDailyTimeChart';
import MostUsedTimeChart from '../components/MostUsedTimeChart';
import BestPerformancesChart from '../components/BestPerformancesChart';
import ProgressChart from '../components/ProgressChart';
import SessionsTable from '../components/SessionsTable';
import Toolbar from '../components/Toolbar';

const DashboardPage = () => {
  const { user, supabase } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [dateRange, setDateRange] = useState('week');
  const [compareMode, setCompareMode] = useState('previous');
  const [chartRange, setChartRange] = useState('week');

  useEffect(() => {
    if (user && supabase) {
      loadData();
    } else {
      setDefaultData();
    }
  }, [user, supabase, dateRange, compareMode]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadActivities(),
        loadSessions(dateRange)
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setDefaultData();
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
      setActivities([]);
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
        .eq('user_id', user.id)
        .gte('started_at', getDateRange(range).start)
        .lte('started_at', getDateRange(range).end)
        .order('started_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);

      // Build summary
      const summaryData = await buildSummary(range, compareMode, data || []);
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

  const buildSummary = async (range, compareMode, sessionsData) => {
    try {
      const compareRange = getDateRange(range);
      let compareStart = new Date(compareRange.start);

      if (compareMode === 'previous') {
        const duration = compareStart.getTime() - new Date(compareRange.end).getTime();
        compareStart = new Date(compareStart.getTime() + duration);
      }

      const compareEnd = new Date(compareStart.getTime() + (new Date(compareRange.end) - new Date(compareRange.start)));

      const { data: compareSessions } = await supabase
        .from('timer_sessions')
        .select('duration_minutes')
        .eq('user_id', user.id)
        .gte('started_at', compareStart.toISOString())
        .lte('started_at', compareEnd.toISOString());

      const currentTotal = sessionsData.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
      const compareTotal = (compareSessions || []).reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

      return {
        current: currentTotal,
        previous: compareTotal,
        change: compareTotal > 0 ? ((currentTotal - compareTotal) / compareTotal) * 100 : 0
      };
    } catch (error) {
      console.error('Error building summary:', error);
      return { current: 0, previous: 0, change: 0 };
    }
  };

  const handleEditSession = async (sessionId, updates) => {
    try {
      const { error } = await supabase
        .from('timer_sessions')
        .update(updates)
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Reload sessions
      await loadSessions(dateRange);
    } catch (error) {
      console.error('Error updating session:', error);
      alert('Failed to update session');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      const { error } = await supabase
        .from('timer_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Reload sessions
      await loadSessions(dateRange);
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session');
    }
  };

  const updateSession = async (sessionId, updates) => {
    try {
      const { error } = await supabase
        .from('timer_sessions')
        .update(updates)
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating session:', error);
      return false;
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      const { error } = await supabase
        .from('timer_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  };

  const exportAll = async () => {
    try {
      const { data: activitiesData } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id);

      const { data: sessionsData } = await supabase
        .from('timer_sessions')
        .select('*')
        .eq('user_id', user.id);

      return {
        activities: activitiesData || [],
        sessions: sessionsData || [],
        exportDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  };

  const importAll = async (data) => {
    try {
      if (data.activities && data.activities.length > 0) {
        const { error: activitiesError } = await supabase
          .from('activities')
          .upsert(data.activities.map(a => ({ ...a, user_id: user.id })));

        if (activitiesError) throw activitiesError;
      }

      if (data.sessions && data.sessions.length > 0) {
        const { error: sessionsError } = await supabase
          .from('timer_sessions')
          .upsert(data.sessions.map(s => ({ ...s, user_id: user.id })));

        if (sessionsError) throw sessionsError;
      }
    } catch (error) {
      console.error('Import error:', error);
      throw error;
    }
  };

  const setDefaultData = () => {
    setActivities([
      { id: '1', name: 'Work', category: 'Productivity', color: '#3B82F6' },
      { id: '2', name: 'Study', category: 'Learning', color: '#10B981' },
      { id: '3', name: 'Personal', category: 'Health', color: '#8B5CF6' }
    ]);
    setSessions([
      {
        id: '1',
        activity_id: '1',
        started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        ended_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 60
      }
    ]);
    setSummary({ current: 60, previous: 45, change: 33.3 });
    setLoading(false);
  };

  const handleExport = async () => {
    try {
      const data = await exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `screentime-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handleImport = async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importAll(data);
      await loadData();
      alert('Import successful!');
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed. Please check your file and try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-100 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-900 text-zinc-100">
        <NavigationHeader />
        <div className="max-w-4xl mx-auto p-6 pt-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-zinc-100 mb-4">Please sign in</h1>
            <p className="text-zinc-400">You need to be signed in to view the dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  // Generate sample data for charts (replace with real data from your sessions)
  const generateChartData = () => {
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    const avgDailyMinutes = totalMinutes / Math.max(dateRange === 'day' ? 1 : dateRange === 'week' ? 7 : 30, 1);

    return {
      averageDailyTime: {
        week: [4.5, 5.5, 3.5, 2, 4, 5, 4.5],
        month: Array.from({ length: 30 }, () => Math.random() * 3 + 2),
        year: Array.from({ length: 12 }, () => Math.random() * 2 + 3)
      },
      mostUsedTime: {
        midnight: 0.7,
        fourAM: 0.2,
        eightAM: 0.3,
        noon: 0.4,
        fourPM: 0.6,
        eightPM: 0.9
      },
      bestPerformances: {
        bestTime: Math.round(avgDailyMinutes * 0.8),
        bestWeekAvg: Math.round(avgDailyMinutes * 1.2),
        yearAvg: Math.round(avgDailyMinutes * 365),
        subOneHour: Math.round(sessions.length * 0.3)
      },
      progress: {
        subOneHourDays: { current: Math.round(sessions.length * 0.3), target: 50 },
        daysUnderAverage: { current: Math.round(sessions.length * 0.7), target: 100 },
        daysTracked: { current: sessions.length, target: 365 }
      }
    };
  };

  const chartData = generateChartData();

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <NavigationHeader />
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Screenly Dashboard</h1>
          <p className="text-zinc-400">Track your productivity and time management</p>
        </div>

        {/* Toolbar */}
        <Toolbar
          dateRange={dateRange}
          setDateRange={setDateRange}
          compareMode={compareMode}
          setCompareMode={setCompareMode}
          onExport={handleExport}
          onImport={handleImport}
        />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AverageDailyTimeChart
            data={chartData.averageDailyTime}
            currentRange={chartRange}
            onRangeChange={setChartRange}
          />
          <MostUsedTimeChart data={chartData.mostUsedTime} />
          <BestPerformancesChart data={chartData.bestPerformances} />
          <ProgressChart data={chartData.progress} />
        </div>

        {/* Sessions Table */}
        <div className="bg-zinc-800/50 rounded-lg border border-zinc-700/50">
          <div className="p-6 border-b border-zinc-700/50">
            <h3 className="text-lg font-semibold text-zinc-100">Recent Sessions</h3>
          </div>
          <SessionsTable
            sessions={sessions}
            activities={activities}
            onEdit={handleEditSession}
            onDelete={handleDeleteSession}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;


