import { createClient } from '@supabase/supabase-js';

/**
 * Supabase adapter for time tracking app
 * Implements the same interface as LocalStorageAdapter
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {string} [color]
 */

/**
 * @typedef {Object} Session
 * @property {string} id
 * @property {string} start - ISO string
 * @property {string} [end] - ISO string, undefined while running
 * @property {string} [projectId]
 * @property {string} [category]
 * @property {string} [note]
 * @property {number} [duration_minutes]
 */

/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} name
 * @property {string} [color]
 */

/**
 * @typedef {Object} DayAggregate
 * @property {string} day - "YYYY-MM-DD"
 * @property {number} totalMinutes
 * @property {Record<string, number>} byCategory
 */

/**
 * @typedef {Object} Summary
 * @property {Object} range - { start: ISO date, end: ISO date }
 * @property {Session[]} sessions
 * @property {DayAggregate[]} days
 * @property {Object} totals - { minutes: number, byCategory: Record<string, number> }
 * @property {Object} [topProject] - { projectId: string, minutes: number }
 * @property {number} streakDays
 * @property {Summary} [previousPeriod]
 */

export class SupabaseAdapter {
  constructor() {
    this.isConfigured = false;
    this.supabase = null;
    this.checkConfiguration();
  }

  /**
   * Check if Supabase is configured and initialize client
   */
  checkConfiguration() {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (url && key) {
      this.supabase = createClient(url, key);
      this.isConfigured = true;
    } else {
      console.warn('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
    }
  }

  /**
   * Generate unique ID
   * @returns {string} Unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // SESSION METHODS

  /**
   * List sessions within date range
   * @param {string} range - 'today', '7d', '30d'
   * @returns {Promise<Session[]>} Sessions in range
   */
  async listSessions(range = 'today') {
    if (!this.isConfigured) {
      throw new Error('Supabase not configured');
    }

    const { startDate, endDate } = this.getDateRange(range);
    
    const { data, error } = await this.supabase
      .from('sessions')
      .select(`
        id,
        start_time,
        end_time,
        project_id,
        category,
        note,
        duration_minutes,
        projects (
          id,
          name,
          color
        )
      `)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString())
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }

    return data.map(session => ({
      id: session.id,
      start: session.start_time,
      end: session.end_time,
      projectId: session.project_id,
      category: session.category,
      note: session.note,
      duration_minutes: session.duration_minutes
    }));
  }

  /**
   * Add a new session
   * @param {Session} session - Session to add
   * @returns {Promise<Session>} Added session with ID
   */
  async addSession(session) {
    if (!this.isConfigured) {
      throw new Error('Supabase not configured');
    }

    // Calculate duration if end time is provided
    let duration_minutes = null;
    if (session.end) {
      const start = new Date(session.start);
      const end = new Date(session.end);
      duration_minutes = Math.round((end - start) / (1000 * 60));
    }

    const { data, error } = await this.supabase
      .from('sessions')
      .insert({
        start_time: session.start,
        end_time: session.end,
        project_id: session.projectId || null,
        category: session.category || null,
        note: session.note || null,
        duration_minutes
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding session:', error);
      throw error;
    }

    return {
      id: data.id,
      start: data.start_time,
      end: data.end_time,
      projectId: data.project_id,
      category: data.category,
      note: data.note,
      duration_minutes: data.duration_minutes
    };
  }

  /**
   * Update an existing session
   * @param {string} id - Session ID
   * @param {Partial<Session>} updates - Updates to apply
   * @returns {Promise<Session>} Updated session
   */
  async updateSession(id, updates) {
    if (!this.isConfigured) {
      throw new Error('Supabase not configured');
    }

    // Calculate duration if both start and end are provided
    let duration_minutes = updates.duration_minutes;
    if (updates.start && updates.end) {
      const start = new Date(updates.start);
      const end = new Date(updates.end);
      duration_minutes = Math.round((end - start) / (1000 * 60));
    }

    const updateData = {
      ...(updates.start && { start_time: updates.start }),
      ...(updates.end && { end_time: updates.end }),
      ...(updates.projectId !== undefined && { project_id: updates.projectId || null }),
      ...(updates.category !== undefined && { category: updates.category || null }),
      ...(updates.note !== undefined && { note: updates.note || null }),
      ...(duration_minutes !== undefined && { duration_minutes })
    };

    const { data, error } = await this.supabase
      .from('sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating session:', error);
      throw error;
    }

    return {
      id: data.id,
      start: data.start_time,
      end: data.end_time,
      projectId: data.project_id,
      category: data.category,
      note: data.note,
      duration_minutes: data.duration_minutes
    };
  }

  /**
   * Delete a session
   * @param {string} id - Session ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteSession(id) {
    if (!this.isConfigured) {
      throw new Error('Supabase not configured');
    }

    const { error } = await this.supabase
      .from('sessions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting session:', error);
      throw error;
    }

    return true;
  }

  // PROJECT METHODS

  /**
   * List all projects
   * @returns {Promise<Project[]>} All projects
   */
  async listProjects() {
    if (!this.isConfigured) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }

    return data.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      color: project.color
    }));
  }

  /**
   * Add or update a project
   * @param {Project} project - Project to upsert
   * @returns {Promise<Project>} Upserted project
   */
  async upsertProject(project) {
    if (!this.isConfigured) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await this.supabase
      .from('projects')
      .upsert({
        id: project.id || undefined,
        name: project.name,
        description: project.description || null,
        color: project.color || '#3B82F6'
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting project:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      color: data.color
    };
  }

  /**
   * Delete a project
   * @param {string} id - Project ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteProject(id) {
    if (!this.isConfigured) {
      throw new Error('Supabase not configured');
    }

    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }

    return true;
  }

  // CATEGORY METHODS

  /**
   * List all categories
   * @returns {Promise<Category[]>} All categories
   */
  async listCategories() {
    if (!this.isConfigured) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return data.map(category => ({
      id: category.id,
      name: category.name,
      color: category.color
    }));
  }

  /**
   * Add or update a category
   * @param {Category} category - Category to upsert
   * @returns {Promise<Category>} Upserted category
   */
  async upsertCategory(category) {
    if (!this.isConfigured) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await this.supabase
      .from('categories')
      .upsert({
        id: category.id || undefined,
        name: category.name,
        color: category.color || '#6B7280'
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting category:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      color: data.color
    };
  }

  /**
   * Delete a category
   * @param {string} id - Category ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteCategory(id) {
    if (!this.isConfigured) {
      throw new Error('Supabase not configured');
    }

    const { error } = await this.supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }

    return true;
  }

  // UTILITY METHODS

  /**
   * Get date range for a given period
   * @param {string} range - 'today', '7d', '30d'
   * @returns {Object} Start and end dates
   */
  getDateRange(range) {
    const now = new Date();
    const startDate = new Date();
    
    switch (range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);
    
    return { startDate, endDate };
  }

  /**
   * Export all data as JSON
   * @returns {Promise<Object>} All data
   */
  async exportAll() {
    if (!this.isConfigured) {
      throw new Error('Supabase not configured');
    }

    try {
      const [projects, categories, sessions] = await Promise.all([
        this.listProjects(),
        this.listCategories(),
        this.listSessions('30d') // Export last 30 days
      ]);

      return {
        projects,
        categories,
        sessions,
        exportDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  /**
   * Import data from JSON (replaces all data)
   * @param {Object} data - Data to import
   * @returns {Promise<boolean>} Success status
   */
  async importAll(data) {
    if (!this.isConfigured) {
      throw new Error('Supabase not configured');
    }

    try {
      // Import projects
      if (data.projects && Array.isArray(data.projects)) {
        for (const project of data.projects) {
          await this.upsertProject(project);
        }
      }

      // Import categories
      if (data.categories && Array.isArray(data.categories)) {
        for (const category of data.categories) {
          await this.upsertCategory(category);
        }
      }

      // Import sessions
      if (data.sessions && Array.isArray(data.sessions)) {
        for (const session of data.sessions) {
          await this.addSession(session);
        }
      }

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  /**
   * Build summary for given range
   * @param {string} range - 'today', '7d', '30d'
   * @param {boolean} includePrevious - Include previous period data
   * @returns {Promise<Summary>} Summary data
   */
  async buildSummary(range = 'today', includePrevious = false) {
    if (!this.isConfigured) {
      throw new Error('Supabase not configured');
    }

    try {
      const { startDate, endDate } = this.getDateRange(range);
      const sessions = await this.listSessions(range);
      
      // Calculate totals
      const totals = { minutes: 0, byCategory: {} };
      const projectMinutes = {};
      
      sessions.forEach(session => {
        if (session.end && session.duration_minutes) {
          totals.minutes += session.duration_minutes;
          
          if (session.category) {
            totals.byCategory[session.category] = (totals.byCategory[session.category] || 0) + session.duration_minutes;
          }
          
          if (session.projectId) {
            projectMinutes[session.projectId] = (projectMinutes[session.projectId] || 0) + session.duration_minutes;
          }
        }
      });

      // Find top project
      const topProject = Object.entries(projectMinutes).sort(([, a], [, b]) => b - a)[0];
      
      // Build daily aggregates
      const days = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dayKey = currentDate.toISOString().split('T')[0];
        const daySessions = sessions.filter(s => s.start.startsWith(dayKey));
        
        let dayMinutes = 0;
        const dayByCategory = {};
        
        daySessions.forEach(session => {
          if (session.end && session.duration_minutes) {
            dayMinutes += session.duration_minutes;
            if (session.category) {
              dayByCategory[session.category] = (dayByCategory[session.category] || 0) + session.duration_minutes;
            }
          }
        });
        
        days.push({
          day: dayKey,
          totalMinutes: dayMinutes,
          byCategory: dayByCategory
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Calculate streak
      let streakDays = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dayKey = checkDate.toISOString().split('T')[0];
        
        const hasSession = sessions.some(s => s.start.startsWith(dayKey) && s.end);
        if (hasSession) {
          streakDays++;
        } else if (i > 0) { // Don't break on first day if it's today
          break;
        }
      }

      const summary = {
        range: { start: startDate.toISOString(), end: endDate.toISOString() },
        sessions,
        days,
        totals,
        topProject: topProject ? { projectId: topProject[0], minutes: topProject[1] } : null,
        streakDays
      };

      // Add previous period if requested
      if (includePrevious) {
        const previousRange = this.getPreviousRange(range);
        summary.previousPeriod = await this.buildSummary(previousRange, false);
      }

      return summary;
    } catch (error) {
      console.error('Error building summary:', error);
      throw error;
    }
  }

  /**
   * Get previous period range
   * @param {string} range - Current range
   * @returns {string} Previous range
   */
  getPreviousRange(range) {
    switch (range) {
      case 'today':
        return 'today'; // Previous day would be yesterday
      case '7d':
        return '7d'; // Previous 7 days
      case '30d':
        return '30d'; // Previous 30 days
      default:
        return '7d';
    }
  }
}
