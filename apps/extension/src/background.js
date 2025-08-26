import { categorizeDomain, getDomainFromUrl, getDayKey } from '../../../packages/shared/index.js';

// State tracking
let isWindowFocused = true;
let isTabVisible = true;
let isUserActive = true;
let currentTabUrl = '';
let currentTabDomain = '';

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('ScreenTime extension installed');
  
  // Set up idle detection (60 second intervals)
  chrome.idle.setDetectionInterval(60);
  
  // Set up 1-minute tracking alarm
  chrome.alarms.create('trackMinute', { delayInMinutes: 1, periodInMinutes: 1 });
  
  // Set up nightly rollup at 2:00 AM
  chrome.alarms.create('nightlyRollup', { 
    when: getNextRollupTime(),
    periodInMinutes: 24 * 60 // 24 hours
  });
});

// Get next 2:00 AM time
function getNextRollupTime() {
  const now = new Date();
  const rollupTime = new Date(now);
  rollupTime.setHours(2, 0, 0, 0);
  
  if (rollupTime <= now) {
    rollupTime.setDate(rollupTime.getDate() + 1);
  }
  
  return rollupTime.getTime();
}

// Window focus tracking
chrome.windows.onFocusChanged.addListener((windowId) => {
  isWindowFocused = windowId !== chrome.windows.WINDOW_ID_NONE;
  console.log('Window focus changed:', isWindowFocused);
});

// Tab activation tracking
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    currentTabUrl = tab.url || '';
    currentTabDomain = getDomainFromUrl(currentTabUrl);
    console.log('Tab activated:', currentTabDomain);
  } catch (error) {
    console.error('Error getting active tab:', error);
  }
});

// Tab update tracking
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    currentTabUrl = tab.url || '';
    currentTabDomain = getDomainFromUrl(currentTabUrl);
    console.log('Tab updated:', currentTabDomain);
  }
});

// Idle state tracking
chrome.idle.onStateChanged.addListener((state) => {
  isUserActive = state === 'active';
  console.log('Idle state changed:', state, 'User active:', isUserActive);
});

// Content script message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'VISIBILITY_CHANGE') {
    isTabVisible = message.visible;
    console.log('Tab visibility changed:', isTabVisible);
    sendResponse({ success: true });
  }
});

// Minute tracking alarm
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'trackMinute') {
    await trackMinute();
  } else if (alarm.name === 'nightlyRollup') {
    await performNightlyRollup();
    // Set next rollup time
    chrome.alarms.create('nightlyRollup', { 
      when: getNextRollupTime(),
      periodInMinutes: 24 * 60
    });
  }
});

// Track one minute if conditions are met
async function trackMinute() {
  if (!isWindowFocused || !isTabVisible || !isUserActive || !currentTabUrl) {
    return;
  }
  
  const now = new Date();
  const dayKey = getDayKey(now);
  const tsMinute = now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
  const category = categorizeDomain(currentTabDomain);
  
  const minuteEvent = {
    tsMinute,
    url: currentTabUrl,
    domain: currentTabDomain,
    category,
    minutes: 1
  };
  
  try {
    // Get existing events for today
    const result = await chrome.storage.local.get(['events']);
    const events = result.events || {};
    
    if (!events[dayKey]) {
      events[dayKey] = [];
    }
    
    // Add new minute event
    events[dayKey].push(minuteEvent);
    
    // Store updated events
    await chrome.storage.local.set({ events });
    
    console.log('Tracked minute for:', currentTabDomain, 'category:', category);
  } catch (error) {
    console.error('Error tracking minute:', error);
  }
}

// Nightly rollup - aggregate daily data and prune old events
async function performNightlyRollup() {
  try {
    const result = await chrome.storage.local.get(['events', 'aggregates']);
    const events = result.events || {};
    const aggregates = result.aggregates || {};
    
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Process each day's events
    for (const [dayKey, dayEvents] of Object.entries(events)) {
      if (!aggregates[dayKey]) {
        // Create daily aggregate
        const dailyAggregate = createDailyAggregate(dayKey, dayEvents);
        aggregates[dayKey] = dailyAggregate;
      }
      
      // Prune events older than 30 days
      const dayDate = new Date(dayKey);
      if (dayDate < thirtyDaysAgo) {
        delete events[dayKey];
      }
    }
    
    // Store updated data
    await chrome.storage.local.set({ events, aggregates });
    
    console.log('Nightly rollup completed');
  } catch (error) {
    console.error('Error in nightly rollup:', error);
  }
}

// Create daily aggregate from minute events
function createDailyAggregate(dayKey, dayEvents) {
  const byCategory = {
    Work: 0,
    Social: 0,
    Entertainment: 0,
    Utilities: 0,
    Other: 0
  };
  
  const byDomain = {};
  
  // Aggregate events
  dayEvents.forEach(event => {
    byCategory[event.category] += event.minutes;
    
    if (!byDomain[event.domain]) {
      byDomain[event.domain] = 0;
    }
    byDomain[event.domain] += event.minutes;
  });
  
  // Get top domain
  const topDomain = Object.entries(byDomain)
    .sort(([,a], [,b]) => b - a)[0] || { domain: 'none', minutes: 0 };
  
  const totalMinutes = Object.values(byCategory).reduce((sum, minutes) => sum + minutes, 0);
  
  return {
    day: dayKey,
    totalMinutes,
    byCategory,
    byDomainTop: Object.entries(byDomain)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([domain, minutes]) => ({ domain, minutes }))
  };
}

// Handle GET_SUMMARY request
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'GET_SUMMARY') {
    try {
      const summary = await buildSummary(message.range);
      sendResponse({ success: true, summary });
    } catch (error) {
      console.error('Error building summary:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // Keep message channel open for async response
  }
});

// Build summary for given range
async function buildSummary(range) {
  const result = await chrome.storage.local.get(['events', 'aggregates']);
  const events = result.events || {};
  const aggregates = result.aggregates || {};
  
  const { start, end } = getDateRange(range);
  const days = [];
  let totalMinutes = 0;
  const byCategory = {
    Work: 0,
    Social: 0,
    Entertainment: 0,
    Utilities: 0,
    Other: 0
  };
  
  // Process each day in range
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayKey = getDayKey(d);
    
    let dailyAggregate = aggregates[dayKey];
    
    // If today, aggregate on the fly
    if (dayKey === getDayKey(new Date()) && events[dayKey]) {
      dailyAggregate = createDailyAggregate(dayKey, events[dayKey]);
    }
    
    if (dailyAggregate) {
      days.push(dailyAggregate);
      totalMinutes += dailyAggregate.totalMinutes;
      
      Object.entries(dailyAggregate.byCategory).forEach(([category, minutes]) => {
        byCategory[category] += minutes;
      });
    }
  }
  
  // Calculate focus ratio (active minutes / considered minutes)
  const consideredMinutes = days.length * 24 * 60; // 24 hours per day
  const focusRatio = consideredMinutes > 0 ? (totalMinutes / consideredMinutes) * 100 : 0;
  
  // Calculate streak
  const streakDays = calculateStreak(days);
  
  // Get top domain
  const topDomain = days.length > 0 ? days[0].byDomainTop[0] : null;
  
  // Build summary
  const summary = {
    range: { start: start.toISOString(), end: end.toISOString() },
    days,
    totals: { minutes: totalMinutes, byCategory },
    topDomain,
    focusRatio: Math.round(focusRatio * 100) / 100,
    streakDays
  };
  
  return summary;
}

// Get date range helper
function getDateRange(range) {
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

// Calculate consecutive days streak
function calculateStreak(days) {
  if (days.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < days.length; i++) {
    const dayDate = new Date(days[i].day);
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    
    if (getDayKey(dayDate) === getDayKey(expectedDate) && days[i].totalMinutes > 0) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}
