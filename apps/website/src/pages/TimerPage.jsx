import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import NavigationHeader from '../components/NavigationHeader';

const TimerPage = () => {
  const { user, supabase } = useAuth();
  const [activities, setActivities] = useState([]);
  const [currentTimer, setCurrentTimer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newActivity, setNewActivity] = useState({ name: '', category: '' });
  const [timeView, setTimeView] = useState('day'); // 'day' or 'week'
  const [activityTimes, setActivityTimes] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Load activities and current timer
  useEffect(() => {
    loadData();
  }, [user, supabase]);

  // Expand all categories by default when activities load
  useEffect(() => {
    if (activities.length > 0) {
      const categories = [...new Set(activities.map(a => a.category || 'Uncategorized'))];
      setExpandedCategories(new Set(categories));
    }
  }, [activities]);

  // Calculate activity times when timeView changes
  useEffect(() => {
    if (activities.length > 0 && !loading) {
      calculateAllActivityTimes();
    }
  }, [timeView, activities, currentTimer, loading]);

  // Group activities by category
  const groupedActivities = activities.reduce((groups, activity) => {
    const category = activity.category || 'Uncategorized';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(activity);
    return groups;
  }, {});

  // Filter activities by search query
  const filteredGroupedActivities = Object.entries(groupedActivities).reduce((filtered, [category, activitiesList]) => {
    const filteredActivities = activitiesList.filter(activity =>
      activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredActivities.length > 0) {
      filtered[category] = filteredActivities;
    }

    return filtered;
  }, {});

  // Toggle category expansion
  const toggleCategory = (category) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Update current timer every second when running
  useEffect(() => {
    let interval;
    if (currentTimer) {
      interval = setInterval(() => {
        setCurrentTimer(prev => prev ? { ...prev, currentTime: new Date() } : null);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentTimer]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (user && supabase) {
        try {
          // Load user's activities
          const { data: activitiesData, error: activitiesError } = await supabase
            .from('activities')
            .select('*')
            .eq('user_id', user.id)
            .order('name');

          if (activitiesError) throw activitiesError;

          if (activitiesData && activitiesData.length > 0) {
            setActivities(activitiesData);
          } else {
            // No activities in database, check local storage
            const localActivities = JSON.parse(localStorage.getItem('localActivities') || '[]');
            const userLocalActivities = localActivities.filter(a => a.user_id === user.id);

            if (userLocalActivities.length > 0) {
              setActivities(userLocalActivities);
            } else {
              // Use default activities
              setDefaultActivities();
            }
          }
        } catch (dbError) {
          console.error('Error loading activities from database:', dbError);
          // Fallback to local storage
          const localActivities = JSON.parse(localStorage.getItem('localActivities') || '[]');
          const userLocalActivities = localActivities.filter(a => a.user_id === user.id);

          if (userLocalActivities.length > 0) {
            setActivities(userLocalActivities);
          } else {
            setDefaultActivities();
          }
        }

        // Load current timer if any
        try {
          const { data: timerData, error: timerError } = await supabase
            .from('current_timers')
            .select(`
              *,
              activities!inner(name, category, color)
            `)
            .eq('user_id', user.id)
            .single();

          if (timerError && timerError.code !== 'PGRST116') throw timerError;
          if (timerData) {
            setCurrentTimer({
              ...timerData,
              currentTime: new Date()
            });
          } else {
            // Check local storage for current timer
            const localTimer = localStorage.getItem('currentTimer');
            if (localTimer) {
              try {
                const timer = JSON.parse(localTimer);
                // Find the activity for this timer - use current activities state
                const activity = activities.find(a => a.id === timer.activity_id);
                if (activity) {
                  setCurrentTimer({
                    ...timer,
                    activities: activity,
                    currentTime: new Date()
                  });
                }
              } catch (error) {
                console.error('Error parsing local timer:', error);
                localStorage.removeItem('currentTimer');
              }
            }
          }
        } catch (timerError) {
          console.error('Error loading current timer:', timerError);
          // Continue without current timer
        }
      } else {
        // Use default activities for unauthenticated users
        setDefaultActivities();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to defaults
      setDefaultActivities();
    } finally {
      setLoading(false);
    }
  };

  const setDefaultActivities = () => {
    const defaultActivities = [
      { id: '1', name: 'Work', category: 'Work', color: '#3B82F6' },
      { id: '2', name: 'Study', category: 'Education', color: '#10B981' },
      { id: '3', name: 'Exercise', category: 'Health', color: '#F59E0B' },
      { id: '4', name: 'Personal', category: 'Personal', color: '#8B5CF6' }
    ];
    setActivities(defaultActivities);
  };

  const startTimer = async (activity) => {
    try {
      // Stop any existing timer first
      if (currentTimer) {
        console.log('Stopping existing timer before starting new one');
        await stopTimer();
      }

      const now = new Date();
      const timerData = {
        user_id: user?.id,
        activity_id: activity.id,
        started_at: now.toISOString()
      };

      console.log('Timer data to save:', timerData);

      if (user && supabase) {
        try {
          // Save to database
          const { data, error } = await supabase
            .from('current_timers')
            .upsert(timerData, { onConflict: 'user_id' });

          if (error) {
            console.error('Error saving current timer:', error);
            // Fallback to local storage if database fails
            console.log('Falling back to local storage');
            localStorage.setItem('currentTimer', JSON.stringify(timerData));
          } else {
            console.log('Current timer saved successfully:', data);
          }
        } catch (dbError) {
          console.error('Database error, using local storage:', dbError);
          localStorage.setItem('currentTimer', JSON.stringify(timerData));
        }
      } else {
        // Store locally for unauthenticated users
        localStorage.setItem('currentTimer', JSON.stringify(timerData));
      }

      setCurrentTimer({
        ...timerData,
        activities: activity,
        currentTime: now
      });

      console.log('Timer started successfully');
    } catch (error) {
      console.error('Error starting timer:', error);
      alert('Failed to start timer. Please try again.');
    }
  };

  const continueTimer = async (activity) => {
    try {
      // Check if there's a paused timer for this activity
      if (user && supabase) {
        try {
          // Look for the most recent paused session for this activity
          const { data: pausedSession, error } = await supabase
            .from('timer_sessions')
            .select('*')
            .eq('user_id', user.id)
            .eq('activity_id', activity.id)
            .is('ended_at', null) // Session was never ended
            .order('started_at', { ascending: false })
            .limit(1)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error finding paused session:', error);
          }

          if (pausedSession) {
            // Continue from the paused time
            const now = new Date();
            const pausedStart = new Date(pausedSession.started_at);
            const pausedDuration = Math.round((now - pausedStart) / (1000 * 60));

            // Update the paused session with the current time
            const { error: updateError } = await supabase
              .from('timer_sessions')
              .update({
                ended_at: now.toISOString(),
                duration_minutes: pausedDuration
              })
              .eq('id', pausedSession.id);

            if (updateError) {
              console.error('Error updating paused session:', updateError);
            }
          }
        } catch (dbError) {
          console.error('Database error checking paused session:', dbError);
        }
      }

      // Start a new timer (this will be the continuation)
      await startTimer(activity);
    } catch (error) {
      console.error('Error continuing timer:', error);
      alert('Failed to continue timer. Please try again.');
    }
  };

  const stopTimer = async () => {
    if (!currentTimer) return;

    try {
      const now = new Date();
      const startedAt = new Date(currentTimer.started_at);
      const durationMinutes = Math.round((now - startedAt) / (1000 * 60));

      console.log('Stopping timer, duration:', durationMinutes, 'minutes');

      if (user && supabase) {
        try {
          // Save session to database
          const { error: sessionError } = await supabase
            .from('timer_sessions')
            .insert({
              user_id: user.id,
              activity_id: currentTimer.activity_id,
              started_at: currentTimer.started_at,
              ended_at: now.toISOString(),
              duration_minutes: durationMinutes
            });

          if (sessionError) {
            console.error('Error saving session to database:', sessionError);
            // Fallback to local storage
            const sessions = JSON.parse(localStorage.getItem('timerSessions') || '[]');
            sessions.push({
              id: Date.now().toString(),
              user_id: user.id,
              activity_id: currentTimer.activity_id,
              started_at: currentTimer.started_at,
              ended_at: now.toISOString(),
              duration_minutes: durationMinutes
            });
            localStorage.setItem('timerSessions', JSON.stringify(sessions));
          } else {
            console.log('Session saved to database successfully');
          }

          // Clear current timer from database
          const { error: clearError } = await supabase
            .from('current_timers')
            .delete()
            .eq('user_id', user.id);

          if (clearError) {
            console.error('Error clearing current timer:', clearError);
          }
        } catch (dbError) {
          console.error('Database error, using local storage:', dbError);
          // Fallback to local storage
          const sessions = JSON.parse(localStorage.getItem('timerSessions') || '[]');
          sessions.push({
            id: Date.now().toString(),
            user_id: user.id,
            activity_id: currentTimer.activity_id,
            started_at: currentTimer.started_at,
            ended_at: now.toISOString(),
            duration_minutes: durationMinutes
          });
          localStorage.setItem('timerSessions', JSON.stringify(sessions));
        }
      } else {
        // Store locally for unauthenticated users
        const sessions = JSON.parse(localStorage.getItem('timerSessions') || '[]');
        sessions.push({
          id: Date.now().toString(),
          user_id: user?.id || 'anonymous',
          activity_id: currentTimer.activity_id,
          started_at: currentTimer.started_at,
          ended_at: now.toISOString(),
          duration_minutes: durationMinutes
        });
        localStorage.setItem('timerSessions', JSON.stringify(sessions));
      }

      // Clear current timer from local storage
      localStorage.removeItem('currentTimer');
      setCurrentTimer(null);

      // Recalculate activity times
      await calculateAllActivityTimes();

      console.log('Timer stopped successfully');
    } catch (error) {
      console.error('Error stopping timer:', error);
      alert('Failed to stop timer. Please try again.');
    }
  };

  const addActivity = async () => {
    if (!newActivity.name.trim()) return;

    try {
      if (user && supabase) {
        try {
          const { data, error } = await supabase
            .from('activities')
            .insert({
              user_id: user.id,
              name: newActivity.name.trim(),
              category: newActivity.category.trim() || 'Other'
            })
            .select()
            .single();

          if (error) {
            console.error('Error adding activity to database:', error);
            // Fallback to local storage
            throw new Error('Database error, using local storage');
          }

          setActivities(prev => [...prev, data]);
        } catch (dbError) {
          console.log('Falling back to local storage for activity:', dbError.message);
          // Add to local storage
          const localActivities = JSON.parse(localStorage.getItem('localActivities') || '[]');
          const newLocalActivity = {
            id: `local-${Date.now()}`,
            name: newActivity.name.trim(),
            category: newActivity.category.trim() || 'Other',
            color: '#6B7280',
            user_id: user.id,
            created_at: new Date().toISOString()
          };

          localActivities.push(newLocalActivity);
          localStorage.setItem('localActivities', JSON.stringify(localActivities));

          setActivities(prev => [...prev, newLocalActivity]);
        }
      } else {
        // Add locally for unauthenticated users
        const localActivities = JSON.parse(localStorage.getItem('localActivities') || '[]');
        const newLocalActivity = {
          id: `local-${Date.now()}`,
          name: newActivity.name.trim(),
          category: newActivity.category.trim() || 'Other',
          color: '#6B7280',
          user_id: 'anonymous',
          created_at: new Date().toISOString()
        };

        localActivities.push(newLocalActivity);
        localStorage.setItem('localActivities', JSON.stringify(localActivities));

        setActivities(prev => [...prev, newLocalActivity]);
      }

      setNewActivity({ name: '', category: '' });
      setShowAddForm(false);

      // Recalculate activity times to include the new activity
      if (activities.length > 0) {
        calculateAllActivityTimes();
      }

    } catch (error) {
      console.error('Error adding activity:', error);
      alert('Failed to add activity. Please try again.');
    }
  };

  const getActivityTime = async (activityId) => {
    try {
      if (user && supabase) {
        // Get current date range based on timeView
        const now = new Date();
        let startDate = new Date();

        if (timeView === 'day') {
          startDate.setHours(0, 0, 0, 0);
        } else if (timeView === 'week') {
          startDate.setDate(now.getDate() - 7);
        }

        // Query timer_sessions table
        const { data: sessions, error } = await supabase
          .from('timer_sessions')
          .select('duration_minutes')
          .eq('user_id', user.id)
          .eq('activity_id', activityId)
          .gte('started_at', startDate.toISOString())
          .lte('started_at', now.toISOString());

        if (error) {
          console.error('Error fetching activity time from database:', error);
          // Fallback to local storage
          return getLocalActivityTime(activityId);
        }

        // Sum up all durations
        const totalMinutes = sessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0);
        return totalMinutes;
      } else {
        // Use local storage for unauthenticated users
        return getLocalActivityTime(activityId);
      }
    } catch (error) {
      console.error('Error getting activity time:', error);
      return getLocalActivityTime(activityId);
    }
  };

  const getLocalActivityTime = (activityId) => {
    try {
      const sessions = JSON.parse(localStorage.getItem('timerSessions') || '[]');
      const now = new Date();
      let startDate = new Date();

      if (timeView === 'day') {
        startDate.setHours(0, 0, 0, 0);
      } else if (timeView === 'week') {
        startDate.setDate(now.getDate() - 7);
      }

      const filteredSessions = sessions.filter(session => {
        if (session.activity_id !== activityId) return false;
        if (session.user_id !== (user?.id || 'anonymous')) return false;

        const sessionStart = new Date(session.started_at);
        return sessionStart >= startDate && sessionStart <= now;
      });

      return filteredSessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0);
    } catch (error) {
      console.error('Error getting local activity time:', error);
      return 0;
    }
  };

  const calculateAllActivityTimes = async () => {
    const newActivityTimes = {};
    for (const activity of activities) {
      newActivityTimes[activity.id] = await getActivityTime(activity.id);
    }
    setActivityTimes(newActivityTimes);
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getCurrentTimerDuration = () => {
    if (!currentTimer) return 0;
    const startedAt = new Date(currentTimer.started_at);
    const now = currentTimer.currentTime || new Date();
    return Math.round((now - startedAt) / (1000 * 60));
  };

  const getCurrentTimerDurationSeconds = () => {
    if (!currentTimer) return 0;
    const startedAt = new Date(currentTimer.started_at);
    const now = currentTimer.currentTime || new Date();
    return Math.floor((now - startedAt) / 1000);
  };

  const formatLiveTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      if (minutes === 0) {
        return `${hours}h ${remainingSeconds}s`;
      } else {
        return `${hours}h ${minutes}m ${remainingSeconds}s`;
      }
    }
  };

  const getMaxTime = () => {
    const times = Object.values(activityTimes);
    return Math.max(...times, 1); // At least 1 to avoid division by zero
  };

  const getTimeBarWidth = (minutes) => {
    const maxTime = getMaxTime();
    return Math.min((minutes / maxTime) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900">
        <NavigationHeader />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-100 mx-auto mb-4"></div>
            <p className="text-zinc-400">Loading Timer...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <NavigationHeader />

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Screenly Timer</h1>
          <p className="text-zinc-400">Track your productivity, one activity at a time</p>
        </div>

        {/* Current Timer Display - Prominent and centered */}
        {currentTimer && (
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl border border-purple-500/20 p-8 mb-8 backdrop-blur-sm transform transition-all duration-700 ease-out animate-in slide-in-from-top-8 fade-in">
            <div className="text-center">
              <div className="mb-4">
                <span className="inline-block w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3"></span>
                <span className="text-zinc-300 text-sm font-medium">Currently tracking</span>
              </div>
              <h2 className="text-2xl font-bold text-zinc-100 mb-2 transform transition-all duration-500 ease-out">
                {currentTimer.activities?.name}
              </h2>
              <p className="text-zinc-400 mb-6">{currentTimer.activities?.category}</p>

              {/* Large Timer Display */}
              <div className="bg-zinc-800/50 rounded-lg p-6 mb-6 border border-zinc-700/50 transform transition-all duration-500 ease-out hover:scale-105">
                <p className="text-5xl font-mono font-bold text-purple-400 mb-2 transition-all duration-300 ease-out">
                  {formatLiveTime(getCurrentTimerDurationSeconds())}
                </p>
                <p className="text-zinc-400 text-sm">Session time</p>
              </div>

              {/* Total Time for This Activity Today */}
              <div className="bg-zinc-800/30 rounded-lg p-4 mb-6 border border-zinc-700/30 transform transition-all duration-500 ease-out">
                <p className="text-2xl font-mono font-bold text-zinc-200 mb-1 transition-all duration-300 ease-out">
                  {formatTime(activityTimes[currentTimer.activities?.id] || 0)}
                </p>
                <p className="text-zinc-400 text-sm">Total time today</p>
              </div>

              <button
                onClick={stopTimer}
                className="px-8 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                Stop Timer
              </button>
            </div>
          </div>
        )}

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700/50">
            <h3 className="text-zinc-400 text-sm font-medium mb-2">Today</h3>
            <p className="text-2xl font-bold text-zinc-100">
              {formatTime(Object.values(activityTimes).reduce((sum, time) => sum + time, 0))}
            </p>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700/50">
            <h3 className="text-zinc-400 text-sm font-medium mb-2">This Week</h3>
            <p className="text-2xl font-bold text-zinc-100">
              {formatTime(Object.values(activityTimes).reduce((sum, time) => sum + time, 0) * 1.5)}
            </p>
          </div>
        </div>

        {/* Time View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTimeView('day')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${timeView === 'day'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-zinc-700/50 text-zinc-300 hover:bg-zinc-600/50'
                }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeView('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${timeView === 'week'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-zinc-700/50 text-zinc-300 hover:bg-zinc-600/50'
                }`}
            >
              This Week
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-zinc-700/50 border border-zinc-600/50 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 w-64"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Add Activity Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            {showAddForm ? 'Cancel' : '+ New Activity'}
          </button>
        </div>

        {/* Add Activity Form */}
        {showAddForm && (
          <div className="bg-zinc-800/50 rounded-lg border border-zinc-700/50 p-6 mb-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">Create New Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Activity Name *
                </label>
                <input
                  type="text"
                  value={newActivity.name}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-zinc-700/50 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-zinc-100 placeholder-zinc-400"
                  placeholder="e.g., Data Analysis, Design Review"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={newActivity.category}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-zinc-700/50 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-zinc-100 placeholder-zinc-400"
                  placeholder="e.g., Product, Research, Development"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={addActivity}
                disabled={!newActivity.name.trim()}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
              >
                Create Activity
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewActivity({ name: '', category: '' });
                }}
                className="bg-zinc-600 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Activity List */}
        <div className="space-y-4">
          {Object.keys(filteredGroupedActivities).length === 0 ? (
            <div className="text-center py-12">
              <div className="text-zinc-400 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-lg font-medium text-zinc-300 mb-2">No activities found</p>
                <p className="text-zinc-500">
                  {searchQuery ? `No activities match "${searchQuery}"` : 'No activities created yet'}
                </p>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-zinc-700/50 text-zinc-300 rounded-lg hover:bg-zinc-600/50 transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            Object.entries(filteredGroupedActivities).map(([category, activitiesList]) => (
              <div key={category} className="bg-zinc-800/30 backdrop-blur-sm rounded-lg border border-zinc-700/30 overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-zinc-700/30 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-zinc-100">{category}</h3>
                    <span className="text-sm text-zinc-400">({activitiesList.length} activities)</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-zinc-400 transition-transform duration-200 ${expandedCategories.has(category) ? 'rotate-180' : ''
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Activities in Category */}
                {expandedCategories.has(category) && (
                  <div className="border-t border-zinc-700/30 divide-y divide-zinc-700/30">
                    {activitiesList.map((activity) => {
                      const isRunning = currentTimer?.activity_id === activity.id;
                      const timeSpent = activityTimes[activity.id] || 0;

                      return (
                        <div
                          key={activity.id}
                          className={`p-4 transform transition-all duration-300 ease-out hover:bg-zinc-700/20 ${isRunning ? 'bg-purple-900/20 border-l-4 border-l-purple-500' : ''
                            }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: activity.color }}
                                ></div>
                                <h3 className="text-lg font-semibold text-zinc-100">{activity.name}</h3>
                                {isRunning && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 animate-pulse">
                                    <span className="w-2 h-2 bg-red-400 rounded-full mr-1"></span>
                                    Active
                                  </span>
                                )}
                              </div>

                              {/* Time Display */}
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <p className="text-xl font-bold text-zinc-100">
                                    {formatTime(timeSpent)}
                                  </p>
                                  <p className="text-zinc-400 text-sm">Today</p>
                                </div>

                                <div className="text-center">
                                  <p className="text-lg font-semibold text-zinc-200">
                                    {formatTime(Math.round(timeSpent * 1.5))}
                                  </p>
                                  <p className="text-zinc-400 text-sm">This week</p>
                                </div>
                              </div>

                              {/* Visual Time Bar */}
                              {timeSpent > 0 && (
                                <div className="mt-4">
                                  <div className="flex justify-between text-xs text-zinc-400 mb-1">
                                    <span>0m</span>
                                    <span>{formatTime(getMaxTime())}</span>
                                  </div>
                                  <div className="w-full bg-zinc-700/50 rounded-full h-2 overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500 ease-out"
                                      style={{ width: `${getTimeBarWidth(timeSpent)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              {isRunning ? (
                                <button
                                  onClick={stopTimer}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-all duration-200 ease-out transform hover:scale-105 active:scale-95"
                                >
                                  Stop Timer
                                </button>
                              ) : (
                                <button
                                  onClick={() => continueTimer(activity)}
                                  disabled={!!currentTimer}
                                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ease-out transform hover:scale-105 active:scale-95 focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 ${currentTimer
                                    ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                                    : timeSpent > 0
                                      ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                                      : 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500'
                                    }`}
                                >
                                  {timeSpent > 0 ? 'Continue' : 'Start Timer'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* No Activities Message */}
        {activities.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-zinc-400 mb-4">No activities yet. Create your first activity to start tracking time!</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Create Your First Activity
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimerPage;



