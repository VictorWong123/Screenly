import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NavigationHeader from '../components/NavigationHeader';
import TimerPanel from '../components/TimerPanel';

const TimerPage = () => {
  const navigate = useNavigate();
  const { user, supabase } = useAuth();
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [user, supabase]);

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
  };

  // Timer functions
  const handleStart = () => {
    const newSession = {
      start: new Date().toISOString(),
      projectId: '',
      projectName: '',
      category: '',
      note: ''
    };
    setCurrentSession(newSession);
    setIsRunning(true);
  };

  const handleStop = () => {
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        end: new Date().toISOString()
      };
      setCurrentSession(updatedSession);
      setIsRunning(false);
    }
  };

  const handleDiscard = () => {
    setCurrentSession(null);
    setIsRunning(false);
  };

  const handleSave = async () => {
    if (currentSession && currentSession.end) {
      try {
        // If user is authenticated and Supabase is configured, save to Supabase
        if (user && supabase) {
          // If a new project name was entered, create the project first
          if (currentSession.projectName && !currentSession.projectId) {
            const newProject = await createProject(currentSession.projectName);
            currentSession.projectId = newProject.id;
          }

          await saveSession(currentSession);
          alert('Session saved successfully!');
        } else {
          // Store locally or show message
          alert('Session completed! (Not saved - sign in to sync with cloud)');
        }
        
        setCurrentSession(null);
      } catch (error) {
        console.error('Error saving session:', error);
        alert('Error saving session. Please try again.');
      }
    }
  };

  const createProject = async (name) => {
    if (!supabase || !user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('projects')
      .insert([{ name, user_id: user.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const saveSession = async (session) => {
    if (!supabase || !user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('sessions')
      .insert([{
        start_time: session.start,
        end_time: session.end,
        project_id: session.projectId,
        category: session.category,
        note: session.note,
        user_id: user.id
      }]);
    
    if (error) throw error;
  };

  const handleProjectChange = (projectId) => {
    if (currentSession) {
      setCurrentSession({ ...currentSession, projectId, projectName: '' });
    }
  };

  const handleProjectNameChange = (projectName) => {
    if (currentSession) {
      setCurrentSession({ ...currentSession, projectName, projectId: '' });
    }
  };

  const handleCategoryChange = (category) => {
    if (currentSession) {
      setCurrentSession({ ...currentSession, category });
    }
  };

  const handleNoteChange = (note) => {
    if (currentSession) {
      setCurrentSession({ ...currentSession, note });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <NavigationHeader />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto mb-4"></div>
            <p className="text-zinc-600">Loading Timer...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <NavigationHeader />
      <div className="max-w-[800px] mx-auto p-6">
        {/* Timer Panel */}
        <TimerPanel
          isRunning={isRunning}
          onStart={handleStart}
          onStop={handleStop}
          onDiscard={handleDiscard}
          onSave={handleSave}
          currentSession={currentSession}
          projects={projects}
          categories={categories}
          onProjectChange={handleProjectChange}
          onProjectNameChange={handleProjectNameChange}
          onCategoryChange={handleCategoryChange}
          onNoteChange={handleNoteChange}
        />
      </div>
    </div>
  );
};

export default TimerPage;


