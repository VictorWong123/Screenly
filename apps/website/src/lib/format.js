/**
 * Utility functions for formatting data
 */

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
 * Format percentage with one decimal place
 * @param {number} value - Value to format
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value) {
  return `${Math.round(value * 10) / 10}%`;
}

/**
 * Format date to short format (e.g., "Mon 15")
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export function formatShortDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    day: 'numeric' 
  });
}

/**
 * Get category color for consistent theming
 * @param {string} category - Category name
 * @returns {string} CSS color value
 */
export function getCategoryColor(category) {
  const colors = {
    Work: '#3b82f6',      // blue-500
    Social: '#ec4899',    // pink-500
    Entertainment: '#f59e0b', // amber-500
    Utilities: '#10b981', // emerald-500
    Other: '#6b7280'      // gray-500
  };
  
  return colors[category] || colors.Other;
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

/**
 * Format percentage change with sign and arrow
 * @param {number} change - Percentage change
 * @returns {string} Formatted change with arrow
 */
export function formatPercentageChange(change) {
  if (change === 0) return '0%';
  
  const sign = change > 0 ? '+' : '';
  const arrow = change > 0 ? '↗' : '↘';
  return `${arrow} ${sign}${Math.round(change)}%`;
}
