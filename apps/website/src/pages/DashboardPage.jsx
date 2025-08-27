import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NavigationHeader from '../components/NavigationHeader';
import Toolbar from '../components/Toolbar';
import KpiCard from '../components/KpiCard';
import StackedBarsByDay from '../components/StackedBarsByDay';
import DonutByCategory from '../components/DonutByCategory';
import SessionsTable from '../components/SessionsTable';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, supabase } = useAuth();
  const [summary, setSummary] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [range, setRange] = useState('7d');
  const [compareMode, setCompareMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [user, supabase]);

  // Reload data when range changes
  useEffect(() => {
    if (!loading) {
      loadData();
    }
  }, [range, compareMode]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Only try to load from Supabase if user is authenticated and Supabase is configured
      if (user && supabase) {
        try {
          // Load projects and categories
          const [projectsData, categoriesData] = await Promise.all([
            loadProjects(),
            loadCategories()
          ]);

          setProjects(projectsData);
          setCategories(categoriesData);

          // Load sessions and build summary
          const sessionsData = await loadSessions(range);
          setSessions(sessionsData);

          const summaryData = await buildSummary(range, compareMode, sessionsData);
          setSummary(summaryData);
        } catch (error) {
          console.warn('Failed to load data from Supabase, using defaults:', error);
          setDefaultData();
        }
      } else {
        // Use default data when not authenticated or Supabase not configured
        setDefaultData();
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setDefaultData();
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('name');
    
    if (error) throw error;
    return data || [];
  };

  const loadCategories = async () => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name');
    
    if (error) throw error;
    return data || [];
  };

  const loadSessions = async (range) => {
    if (!supabase) return [];
    
    const { startDate, endDate } = getDateRange(range);
    
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString())
      .order('start_time', { ascending: false });
    
    if (error) throw error;
    return data || [];
  };

  const getDateRange = (range) => {
    const end = new Date();
    const start = new Date();
    
    switch (range) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      default:
        start.setDate(start.getDate() - 7);
    }
    
    return { startDate: start, endDate: end };
  };

  const buildSummary = async (range, compareMode, sessionsData) => {
    // Simple summary building logic
    const totalMinutes = sessionsData.reduce((sum, session) => {
      if (session.end_time) {
        const duration = new Date(session.end_time) - new Date(session.start_time);
        return sum + Math.round(duration / (1000 * 60));
      }
      return sum;
    }, 0);

    const byCategory = sessionsData.reduce((acc, session) => {
      if (session.category) {
        acc[session.category] = (acc[session.category] || 0) + 1;
      }
      return acc;
    }, {});

    return {
      range: getDateRange(range),
      sessions: sessionsData,
      days: [], // Simplified for now
      totals: { minutes: totalMinutes, byCategory },
      streakDays: 0,
      previousPeriod: null
    };
  };

  const setDefaultData = () => {
    // Set default projects and categories
    setProjects([
      { id: 'default-1', name: 'Work' },
      { id: 'default-2', name: 'Study' },
      { id: 'default-3', name: 'Exercise' },
      { id: 'default-4', name: 'Personal' }
    ]);
    
    setCategories([
      { id: 'cat-1', name: 'Work' },
      { id: 'cat-2', name: 'Study' },
      { id: 'cat-3', name: 'Exercise' },
      { id: 'cat-4', name: 'Personal' },
      { id: 'cat-5', name: 'Other' }
    ]);

    // Set empty sessions and summary
    setSessions([]);
    setSummary({
      range: { start: new Date(), end: new Date() },
      sessions: [],
      days: [],
      totals: { minutes: 0, byCategory: {} },
      streakDays: 0,
      previousPeriod: null
    });
  };

  // CRUD functions
  const handleEditSession = async (sessionId, updates) => {
    try {
      if (user && supabase) {
        await updateSession(sessionId, updates);
        loadData();
      } else {
        alert('Please sign in to edit sessions');
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      if (user && supabase) {
        await deleteSession(sessionId);
        loadData();
      } else {
        alert('Please sign in to delete sessions');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const updateSession = async (sessionId, updates) => {
    if (!supabase || !user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', sessionId)
      .eq('user_id', user.id);
    
    if (error) throw error;
  };

  const deleteSession = async (sessionId) => {
    if (!supabase || !user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id);
    
    if (error) throw error;
  };

  // Export/Import functions
  const handleExport = async () => {
    try {
      if (user && supabase) {
        const data = await exportAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chronica-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert('Please sign in to export data');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleImport = async (file) => {
    try {
      if (user && supabase) {
        const text = await file.text();
        const data = JSON.parse(text);
        await importAll(data);
        loadData();
        alert('Data imported successfully!');
      } else {
        alert('Please sign in to import data');
      }
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Error importing data. Please check the file format.');
    }
  };

  const exportAll = async () => {
    if (!supabase || !user) throw new Error('Not authenticated');
    
    const [sessions, projects, categories] = await Promise.all([
      supabase.from('sessions').select('*').eq('user_id', user.id),
      supabase.from('projects').select('*').eq('user_id', user.id),
      supabase.from('categories').select('*').eq('user_id', user.id)
    ]);
    
    return { sessions: sessions.data || [], projects: projects.data || [], categories: categories.data || [] };
  };

  const importAll = async (data) => {
    if (!supabase || !user) throw new Error('Not authenticated');
    
    // Clear existing data
    await supabase.from('sessions').delete().eq('user_id', user.id);
    await supabase.from('projects').delete().eq('user_id', user.id);
    await supabase.from('categories').delete().eq('user_id', user.id);
    
    // Import new data
    if (data.projects?.length) {
      await supabase.from('projects').insert(data.projects.map(p => ({ ...p, user_id: user.id })));
    }
    if (data.categories?.length) {
      await supabase.from('categories').insert(data.categories.map(c => ({ ...c, user_id: user.id })));
    }
    if (data.sessions?.length) {
      await supabase.from('sessions').insert(data.sessions.map(s => ({ ...s, user_id: user.id })));
    }
  };

  const handleRangeChange = (newRange) => {
    setRange(newRange);
  };

  const handleCompareToggle = () => {
    setCompareMode(!compareMode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <NavigationHeader />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto mb-4"></div>
            <p className="text-zinc-600">Loading Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const categoriesList = categories.map(cat => cat.name);
  const totalMinutesData = summary.days.map(d => d.totalMinutes);
  const sessionsCountData = summary.days.map(d => d.sessions?.length || 0);
  const streakData = Array(summary.days.length).fill(summary.streakDays);
  const topProjectData = summary.days.map(d => d.topProject?.minutes || 0);

  // Comparison data
  const previousTotalMinutes = compareMode && summary.previousPeriod ?
    summary.previousPeriod.totals.minutes : undefined;
  const previousPeriodData = compareMode && summary.previousPeriod ?
    summary.previousPeriod.days : undefined;
  const previousSessionsCount = compareMode && summary.previousPeriod ?
    summary.previousPeriod.sessions.length : undefined;

  return (
    <div className="min-h-screen bg-zinc-50">
      <NavigationHeader />
      <div className="max-w-[1200px] mx-auto p-6 grid gap-6">
        {/* Toolbar */}
        <Toolbar
          range={range}
          onRangeChange={handleRangeChange}
          compareMode={compareMode}
          onCompareToggle={handleCompareToggle}
          onExport={handleExport}
          onImport={handleImport}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Total Time"
            value={`${Math.floor(summary.totals.minutes / 60)}h ${summary.totals.minutes % 60}m`}
            subtitle="Active time tracked"
            sparklineData={totalMinutesData}
            previousValue={previousTotalMinutes}
            showChange={compareMode}
          />

          <KpiCard
            title="Sessions"
            value={sessions.length}
            subtitle="Total sessions"
            sparklineData={sessionsCountData}
            previousValue={previousSessionsCount}
            showChange={compareMode}
          />

          <KpiCard
            title="Streak"
            value={`${summary.streakDays} days`}
            subtitle="Consecutive days"
            sparklineData={streakData}
          />

          <KpiCard
            title="Top Project"
            value={summary.topProject ?
              projects.find(p => p.id === summary.topProject.projectId)?.name || 'Unknown' :
              'None'
            }
            subtitle={`${summary.topProject ? summary.topProject.minutes : 0} min`}
            list={topProjectData}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StackedBarsByDay
            data={summary.days}
            categories={categoriesList}
            showCompare={compareMode}
            ghostData={previousPeriodData}
            width={500}
            height={300}
          />

          <DonutByCategory
            data={summary.totals.byCategory}
            width={300}
            height={300}
          />
        </div>

        {/* Sessions Table */}
        {!user ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Welcome to ScreenTime!</h3>
            <p className="text-blue-700 mb-4">
              Sign in to start tracking your time and view your analytics dashboard.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Sign In
            </button>
          </div>
        ) : (
          <SessionsTable
            sessions={sessions}
            projects={projects}
            categories={categories}
            onEdit={handleEditSession}
            onDelete={handleDeleteSession}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;


