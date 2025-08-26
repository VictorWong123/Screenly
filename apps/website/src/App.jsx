import React, { useState, useEffect } from 'react';
import Toolbar from './components/Toolbar';
import KpiCard from './components/KpiCard';
import StackedBarsByDay from './components/StackedBarsByDay';
import DonutByCategory from './components/DonutByCategory';
import AuthForm from './components/AuthForm';
import { getDateRange, getPreviousPeriodRange } from '../../../packages/shared/index.js';

const App = () => {
  const [summary, setSummary] = useState(null);
  const [range, setRange] = useState('7d');
  const [compareMode, setCompareMode] = useState(false);
  const [lastImportTime, setLastImportTime] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Supabase and check auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if Supabase is configured
        if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(
            import.meta.env.VITE_SUPABASE_URL,
            import.meta.env.VITE_SUPABASE_ANON_KEY
          );

          // Check current session
          const { data: { session } } = await supabase.auth.getSession();
          setUser(session?.user || null);

          // Listen for auth changes
          supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
          });
        }
      } catch (error) {
        console.log('Supabase not configured, using local mode');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Load sample data on mount (only if not authenticated)
  useEffect(() => {
    if (!loading && !user) {
      import('./data/sampleSummary.json').then(data => {
        setSummary(data);
        setLastImportTime(new Date().toISOString());
      });
    }
  }, [loading, user]);

  const handleDataImport = (data) => {
    setSummary(data);
    setLastImportTime(new Date().toISOString());
  };

  const handleRangeChange = (newRange) => {
    setRange(newRange);
  };

  const handleLogin = async (email, password) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleSignup = async (email, password, username) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleLogout = async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleCompareToggle = () => {
    setCompareMode(!compareMode);
  };

  // Mock comparison data for demo
  const getComparisonData = () => {
    if (!summary || !compareMode) return null;

    const { startDate, endDate } = getDateRange(range);
    const { startDate: prevStart, endDate: prevEnd } = getPreviousPeriodRange(startDate, endDate);

    // Generate mock comparison data
    const days = [];
    const currentDate = new Date(prevStart);
    while (currentDate <= prevEnd) {
      days.push({
        dayKey: currentDate.toISOString().split('T')[0],
        totalMinutes: Math.floor(Math.random() * 480) + 120, // 2-8 hours
        byCategory: {
          Work: Math.floor(Math.random() * 200) + 100,
          Social: Math.floor(Math.random() * 100) + 50,
          Entertainment: Math.floor(Math.random() * 150) + 75,
          Utilities: Math.floor(Math.random() * 50) + 25,
          Other: Math.floor(Math.random() * 30) + 10
        }
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading ScreenTime...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-zinc-900 mb-6 text-center">ScreenTime</h1>
          <AuthForm onLogin={handleLogin} onSignup={handleSignup} />
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading data...</p>
        </div>
      </div>
    );
  }

  const categories = ['Work', 'Social', 'Entertainment', 'Utilities', 'Other'];
  const comparisonData = getComparisonData();

  // Prepare sparkline data for KPIs
  const totalMinutesData = summary.days.map(d => d.totalMinutes);
  const focusRatioData = summary.days.map(d => (d.totalMinutes / (24 * 60)) * 100);
  const streakData = Array(summary.days.length).fill(summary.streakDays);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-[1200px] mx-auto p-6">
        {/* Toolbar */}
        <Toolbar
          range={range}
          onRangeChange={handleRangeChange}
          compareMode={compareMode}
          onCompareToggle={handleCompareToggle}
          onDataImport={handleDataImport}
          lastImportTime={lastImportTime}
          user={user}
          onLogout={handleLogout}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KpiCard
            title="Total Time"
            value={summary.totals.minutes}
            subtitle="Active minutes tracked"
            sparklineData={totalMinutesData}
            previousValue={compareMode && comparisonData ?
              comparisonData.reduce((sum, day) => sum + day.totalMinutes, 0) : undefined}
            showChange={compareMode}
          />

          <KpiCard
            title="Streak"
            value={summary.streakDays}
            subtitle="Consecutive days"
            sparklineData={streakData}
          />

          <KpiCard
            title="Focus Ratio"
            value={`${summary.focusRatio.toFixed(1)}%`}
            subtitle="Productive time"
            sparklineData={focusRatioData}
            previousValue={compareMode && comparisonData ?
              (comparisonData.reduce((sum, day) => sum + day.totalMinutes, 0) / (comparisonData.length * 24 * 60)) * 100 : undefined}
            showChange={compareMode}
          />

          <KpiCard
            title="Top Domain"
            value={summary.topDomain}
            subtitle="Most visited"
            sparklineData={totalMinutesData}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4">Daily Activity</h3>
            <StackedBarsByDay
              data={summary.days}
              comparisonData={comparisonData}
              showComparison={compareMode}
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4">Time by Category</h3>
            <DonutByCategory data={summary.totals.byCategory} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;