/**
 * LocalStorage adapter for Chronica time tracker
 * Handles all CRUD operations for sessions, projects, and categories
 */

const STORAGE_KEY = 'chronica_v1';

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 */

/**
 * @typedef {Object} Session
 * @property {string} id
 * @property {string} start - ISO string
 * @property {string} [end] - ISO string, undefined while running
 * @property {string} [projectId]
 * @property {string} [category]
 * @property {string} [note]
 */

/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} name
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

export class LocalStorageAdapter {
    constructor() {
        this.defaultCategories = [
            { id: 'work', name: 'Work' },
            { id: 'study', name: 'Study' },
            { id: 'exercise', name: 'Exercise' },
            { id: 'personal', name: 'Personal' },
            { id: 'other', name: 'Other' }
        ];
        this.initializeStorage();
    }

    /**
     * Initialize storage with default data if empty
     */
    initializeStorage() {
        const data = this.getStorageData();
        if (!data.projects || data.projects.length === 0) {
            data.projects = [
                { id: 'default', name: 'Default Project' }
            ];
        }
        if (!data.categories || data.categories.length === 0) {
            data.categories = this.defaultCategories;
        }
        if (!data.sessions) {
            data.sessions = [];
        }
        this.setStorageData(data);
    }

    /**
     * Get all data from localStorage
     * @returns {Object} Storage data
     */
    getStorageData() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return {};
        }
    }

    /**
     * Save all data to localStorage
     * @param {Object} data - Data to store
     */
    setStorageData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    }

    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Get date range for filtering
     * @param {string} range - 'today', '7d', '30d'
     * @returns {Object} { start: Date, end: Date }
     */
    getDateRange(range) {
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const start = new Date();
        if (range === '7d') {
            start.setDate(start.getDate() - 7);
        } else if (range === '30d') {
            start.setDate(start.getDate() - 30);
        } else {
            // Today
            start.setHours(0, 0, 0, 0);
        }

        return { start, end };
    }

    /**
     * Get previous period range
     * @param {Object} currentRange - { start: Date, end: Date }
     * @returns {Object} { start: Date, end: Date }
     */
    getPreviousPeriodRange(currentRange) {
        const duration = currentRange.end.getTime() - currentRange.start.getTime();
        const start = new Date(currentRange.start.getTime() - duration);
        const end = new Date(currentRange.start.getTime() - 1);

        return { start, end };
    }

    // SESSION METHODS

    /**
     * List sessions within date range
     * @param {string} range - 'today', '7d', '30d'
     * @returns {Promise<Session[]>} Sessions in range
     */
    async listSessions(range = 'today') {
        const data = this.getStorageData();
        const { start, end } = this.getDateRange(range);

        return data.sessions.filter(session => {
            const sessionStart = new Date(session.start);
            return sessionStart >= start && sessionStart <= end;
        }).sort((a, b) => new Date(b.start) - new Date(a.start));
    }

    /**
     * Add a new session
     * @param {Session} session - Session to add
     * @returns {Promise<Session>} Added session with ID
     */
    async addSession(session) {
        const data = this.getStorageData();
        const newSession = {
            ...session,
            id: session.id || this.generateId()
        };

        data.sessions.push(newSession);
        this.setStorageData(data);
        return newSession;
    }

    /**
     * Update an existing session
     * @param {string} id - Session ID
     * @param {Partial<Session>} updates - Updates to apply
     * @returns {Promise<Session>} Updated session
     */
    async updateSession(id, updates) {
        const data = this.getStorageData();
        const index = data.sessions.findIndex(s => s.id === id);

        if (index === -1) {
            throw new Error('Session not found');
        }

        data.sessions[index] = { ...data.sessions[index], ...updates };
        this.setStorageData(data);
        return data.sessions[index];
    }

    /**
     * Delete a session
     * @param {string} id - Session ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteSession(id) {
        const data = this.getStorageData();
        const index = data.sessions.findIndex(s => s.id === id);

        if (index === -1) {
            return false;
        }

        data.sessions.splice(index, 1);
        this.setStorageData(data);
        return true;
    }

    // PROJECT METHODS

    /**
     * List all projects
     * @returns {Promise<Project[]>} All projects
     */
    async listProjects() {
        const data = this.getStorageData();
        return data.projects || [];
    }

    /**
     * Add or update a project
     * @param {Project} project - Project to upsert
     * @returns {Promise<Project>} Upserted project
     */
    async upsertProject(project) {
        const data = this.getStorageData();
        const index = data.projects.findIndex(p => p.id === project.id);

        const projectData = {
            ...project,
            id: project.id || this.generateId()
        };

        if (index === -1) {
            data.projects.push(projectData);
        } else {
            data.projects[index] = projectData;
        }

        this.setStorageData(data);
        return projectData;
    }

    /**
     * Delete a project
     * @param {string} id - Project ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteProject(id) {
        const data = this.getStorageData();
        const index = data.projects.findIndex(p => p.id === id);

        if (index === -1) {
            return false;
        }

        // Remove project from sessions
        data.sessions.forEach(session => {
            if (session.projectId === id) {
                session.projectId = undefined;
            }
        });

        data.projects.splice(index, 1);
        this.setStorageData(data);
        return true;
    }

    // CATEGORY METHODS

    /**
     * List all categories
     * @returns {Promise<Category[]>} All categories
     */
    async listCategories() {
        const data = this.getStorageData();
        return data.categories || this.defaultCategories;
    }

    /**
     * Add or update a category
     * @param {Category} category - Category to upsert
     * @returns {Promise<Category>} Upserted category
     */
    async upsertCategory(category) {
        const data = this.getStorageData();
        const index = data.categories.findIndex(c => c.id === category.id);

        const categoryData = {
            ...category,
            id: category.id || this.generateId()
        };

        if (index === -1) {
            data.categories.push(categoryData);
        } else {
            data.categories[index] = categoryData;
        }

        this.setStorageData(data);
        return categoryData;
    }

    /**
     * Delete a category
     * @param {string} id - Category ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteCategory(id) {
        const data = this.getStorageData();
        const index = data.categories.findIndex(c => c.id === id);

        if (index === -1) {
            return false;
        }

        // Remove category from sessions
        data.sessions.forEach(session => {
            if (session.category === id) {
                session.category = undefined;
            }
        });

        data.categories.splice(index, 1);
        this.setStorageData(data);
        return true;
    }

    // UTILITY METHODS

    /**
     * Export all data as JSON
     * @returns {Promise<Object>} All data
     */
    async exportAll() {
        return this.getStorageData();
    }

    /**
     * Import data from JSON (replaces all data)
     * @param {Object} data - Data to import
     * @returns {Promise<boolean>} Success status
     */
    async importAll(data) {
        try {
            // Validate data structure
            if (!data.sessions || !Array.isArray(data.sessions)) {
                throw new Error('Invalid data: sessions array required');
            }
            if (!data.projects || !Array.isArray(data.projects)) {
                throw new Error('Invalid data: projects array required');
            }
            if (!data.categories || !Array.isArray(data.categories)) {
                throw new Error('Invalid data: categories array required');
            }

            this.setStorageData(data);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    /**
     * Build summary for given range
     * @param {string} range - 'today', '7d', '30d'
     * @param {boolean} includePrevious - Include previous period data
     * @returns {Promise<Summary>} Summary data
     */
    async buildSummary(range = 'today', includePrevious = false) {
        const sessions = await this.listSessions(range);
        const { start, end } = this.getDateRange(range);
        const projects = await this.listProjects();
        const categories = await this.listCategories();

        // Create day aggregates
        const days = [];
        const dayMap = new Map();

        // Initialize all days in range
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dayKey = d.toISOString().split('T')[0];
            dayMap.set(dayKey, {
                day: dayKey,
                totalMinutes: 0,
                byCategory: {}
            });
        }

        // Aggregate sessions by day and category
        sessions.forEach(session => {
            if (!session.end) return; // Skip running sessions

            const sessionStart = new Date(session.start);
            const sessionEnd = new Date(session.end);
            const durationMs = sessionEnd.getTime() - sessionStart.getTime();
            const durationMinutes = Math.round(durationMs / (1000 * 60));

            const dayKey = sessionStart.toISOString().split('T')[0];
            const dayData = dayMap.get(dayKey);

            if (dayData) {
                dayData.totalMinutes += durationMinutes;

                const category = session.category || 'Other';
                dayData.byCategory[category] = (dayData.byCategory[category] || 0) + durationMinutes;
            }
        });

        // Convert to array and sort
        days.push(...Array.from(dayMap.values()).sort((a, b) => a.day.localeCompare(b.day)));

        // Calculate totals
        const totals = {
            minutes: days.reduce((sum, day) => sum + day.totalMinutes, 0),
            byCategory: {}
        };

        categories.forEach(cat => {
            totals.byCategory[cat.name] = days.reduce((sum, day) => sum + (day.byCategory[cat.name] || 0), 0);
        });

        // Find top project
        const projectMinutes = {};
        sessions.forEach(session => {
            if (session.end && session.projectId) {
                const durationMs = new Date(session.end).getTime() - new Date(session.start).getTime();
                const durationMinutes = Math.round(durationMs / (1000 * 60));
                projectMinutes[session.projectId] = (projectMinutes[session.projectId] || 0) + durationMinutes;
            }
        });

        const topProjectEntry = Object.entries(projectMinutes).sort(([, a], [, b]) => b - a)[0];
        const topProject = topProjectEntry ? {
            projectId: topProjectEntry[0],
            minutes: topProjectEntry[1]
        } : undefined;

        // Calculate streak
        const streakDays = this.calculateStreak(days);

        const summary = {
            range: { start: start.toISOString(), end: end.toISOString() },
            sessions,
            days,
            totals,
            topProject,
            streakDays
        };

        // Add previous period if requested
        if (includePrevious) {
            const previousRange = this.getPreviousPeriodRange({ start, end });
            const previousSessions = sessions.filter(session => {
                const sessionStart = new Date(session.start);
                return sessionStart >= previousRange.start && sessionStart <= previousRange.end;
            });

            // Build previous period summary (simplified)
            summary.previousPeriod = {
                range: { start: previousRange.start.toISOString(), end: previousRange.end.toISOString() },
                sessions: previousSessions,
                totals: {
                    minutes: previousSessions.reduce((sum, session) => {
                        if (!session.end) return sum;
                        const durationMs = new Date(session.end).getTime() - new Date(session.start).getTime();
                        return sum + Math.round(durationMs / (1000 * 60));
                    }, 0),
                    byCategory: {}
                }
            };
        }

        return summary;
    }

    /**
     * Calculate consecutive days streak
     * @param {DayAggregate[]} days - Days with activity
     * @returns {number} Streak days
     */
    calculateStreak(days) {
        if (days.length === 0) return 0;

        let streak = 0;
        const today = new Date();

        for (let i = 0; i < days.length; i++) {
            const dayDate = new Date(days[i].day);
            const expectedDate = new Date(today);
            expectedDate.setDate(today.getDate() - i);

            if (days[i].day === expectedDate.toISOString().split('T')[0] && days[i].totalMinutes > 0) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }
}
