/**
 * Shared utilities for ScreenTime extension and website
 */

/**
 * Domain to category mapping
 * @param {string} domain - Domain name (e.g., "youtube.com")
 * @returns {string} Category - "Work" | "Social" | "Entertainment" | "Utilities" | "Other"
 */
export function categorizeDomain(domain) {
  const domainLower = domain.toLowerCase();
  
  // Entertainment
  if (['youtube.com', 'netflix.com', 'twitch.tv', 'hulu.com', 'disneyplus.com', 'hbomax.com'].some(d => domainLower.includes(d))) {
    return 'Entertainment';
  }
  
  // Social
  if (['twitter.com', 'x.com', 'instagram.com', 'tiktok.com', 'reddit.com', 'facebook.com', 'linkedin.com', 'discord.com'].some(d => domainLower.includes(d))) {
    return 'Social';
  }
  
  // Work
  if (['figma.com', 'notion.so', 'slack.com', 'linear.app', 'github.com', 'stackoverflow.com', 'jira.com', 'confluence.com', 'zoom.us', 'teams.microsoft.com'].some(d => domainLower.includes(d))) {
    return 'Work';
  }
  
  // Utilities
  if (['google.com', 'gmail.com', 'docs.google.com', 'calendar.google.com', 'drive.google.com', 'maps.google.com', 'weather.com', 'wikipedia.org'].some(d => domainLower.includes(d))) {
    return 'Utilities';
  }
  
  return 'Other';
}

/**
 * Format minutes to human readable time
 * @param {number} minutes - Total minutes
 * @returns {string} Formatted time (e.g., "2h 30m")
 */
export function formatMinutes(minutes) {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format minutes to HH:MM format
 * @param {number} minutes - Total minutes
 * @returns {string} Formatted time (e.g., "02:30")
 */
export function formatMinutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Get domain from URL
 * @param {string} url - Full URL
 * @returns {string} Domain name
 */
export function getDomainFromUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return 'unknown';
  }
}

/**
 * Get ISO date string for a given date
 * @param {Date} date - Date object
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
export function getDayKey(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Get date range for comparison
 * @param {string} range - Range type ("7d", "30d")
 * @returns {Object} { start: Date, end: Date }
 */
export function getDateRange(range) {
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
 * @param {Object} currentRange - Current range { start: Date, end: Date }
 * @returns {Object} Previous range { start: Date, end: Date }
 */
export function getPreviousPeriodRange(currentRange) {
  const duration = currentRange.end.getTime() - currentRange.start.getTime();
  const start = new Date(currentRange.start.getTime() - duration);
  const end = new Date(currentRange.start.getTime() - 1);
  
  return { start, end };
}

/**
 * Calculate percentage change between two values
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} Percentage change
 */
export function calculatePercentageChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}
