// Screenly - Shared Utilities
// Common functions for domain categorization, time formatting, and date calculations

/**
 * Categorize a domain into productivity categories
 * @param {string} domain - The domain to categorize
 * @returns {string} The category (Work, Social, Entertainment, Utilities, Other)
 */
export function categorizeDomain(domain) {
    const workDomains = ['github.com', 'stackoverflow.com', 'figma.com', 'notion.so', 'slack.com', 'linear.app'];
    const socialDomains = ['twitter.com', 'x.com', 'instagram.com', 'tiktok.com', 'reddit.com', 'facebook.com'];
    const entertainmentDomains = ['youtube.com', 'netflix.com', 'twitch.tv', 'spotify.com'];
    const utilityDomains = ['gmail.com', 'google.com', 'calendar.google.com', 'docs.google.com'];

    if (workDomains.some(d => domain.includes(d))) return 'Work';
    if (socialDomains.some(d => domain.includes(d))) return 'Social';
    if (entertainmentDomains.some(d => domain.includes(d))) return 'Entertainment';
    if (utilityDomains.some(d => domain.includes(d))) return 'Utilities';

    return 'Other';
}

/**
 * Format minutes into human-readable time
 * @param {number} minutes - Total minutes
 * @returns {string} Formatted time string (e.g., "2h 30m")
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
 * Extract domain from URL
 * @param {string} url - The URL to extract domain from
 * @returns {string} The domain
 */
export function getDomainFromUrl(url) {
    try {
        return new URL(url).hostname;
    } catch {
        return url;
    }
}

/**
 * Get day key in YYYY-MM-DD format
 * @param {Date} date - The date to format
 * @returns {string} Day key string
 */
export function getDayKey(date) {
    return date.toISOString().slice(0, 10);
}

/**
 * Get date range for specified period
 * @param {string} range - The range (day, week, month)
 * @returns {Object} Object with start and end dates
 */
export function getDateRange(range) {
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
}

/**
 * Get previous period range for comparison
 * @param {string} range - The current range
 * @returns {Object} Object with start and end dates for previous period
 */
export function getPreviousPeriodRange(range) {
    const currentRange = getDateRange(range);
    const start = new Date(currentRange.start);
    const end = new Date(currentRange.end);
    const duration = end.getTime() - start.getTime();

    const previousStart = new Date(start.getTime() - duration);
    const previousEnd = new Date(start.getTime());

    return { start: previousStart.toISOString(), end: previousEnd.toISOString() };
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
