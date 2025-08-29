// Screenly Extension - Background Service Worker
// Tracks active screen time per domain with intelligent focus detection

// State tracking
let isWindowFocused = true;
let isTabVisible = true;
let isUserActive = true;

// Initialize tracking
chrome.runtime.onStartup.addListener(() => {
    console.log('Screenly extension started');
    setupTracking();
});

chrome.runtime.onInstalled.addListener(() => {
    console.log('Screenly extension installed');
    setupTracking();
});

function setupTracking() {
    // Set up alarms for tracking and nightly rollup
    chrome.alarms.create('trackMinute', { periodInMinutes: 1 });
    chrome.alarms.create('nightlyRollup', { when: getNextMidnight() });

    // Initialize storage
    initializeStorage();
}

function initializeStorage() {
    chrome.storage.local.get(['events', 'aggregates'], (result) => {
        if (!result.events) {
            chrome.storage.local.set({ events: {} });
        }
        if (!result.aggregates) {
            chrome.storage.local.set({ aggregates: {} });
        }
    });
}

// Window focus tracking
chrome.windows.onFocusChanged.addListener((windowId) => {
    isWindowFocused = windowId !== chrome.windows.WINDOW_ID_NONE;
    console.log('Window focus changed:', isWindowFocused);
});

// Tab visibility tracking
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        isTabVisible = tab && !tab.url.startsWith('chrome://');
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) {
        isTabVisible = tab && !tab.url.startsWith('chrome://');
    }
});

// User idle detection
chrome.idle.setDetectionInterval(60);
chrome.idle.onStateChanged.addListener((state) => {
    isUserActive = state === 'active';
    console.log('User idle state:', state);
});

// Message handling for content script visibility updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'VISIBILITY_CHANGE') {
        isTabVisible = message.visible;
        console.log('Tab visibility changed:', isTabVisible);
    }

    if (message.action === 'GET_SUMMARY') {
        handleGetSummary(message.range, sendResponse);
        return true; // Keep message channel open for async response
    }
});

// Minute tracking alarm
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'trackMinute') {
        trackMinute();
    } else if (alarm.name === 'nightlyRollup') {
        nightlyRollup();
        // Set next midnight alarm
        chrome.alarms.create('nightlyRollup', { when: getNextMidnight() });
    }
});

async function trackMinute() {
    if (!isWindowFocused || !isTabVisible || !isUserActive) {
        return; // Don't track if conditions aren't met
    }

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.url) return;

        const url = new URL(tab.url);
        const domain = url.hostname;
        const category = categorizeDomain(domain);
        const dayKey = getDayKey(new Date());

        // Store minute event
        const minuteEvent = {
            tsMinute: new Date().toISOString().slice(0, 16) + ':00Z',
            url: tab.url,
            domain: domain,
            category: category,
            minutes: 1
        };

        // Add to storage
        chrome.storage.local.get(['events'], (result) => {
            const events = result.events || {};
            if (!events[dayKey]) {
                events[dayKey] = [];
            }
            events[dayKey].push(minuteEvent);

            chrome.storage.local.set({ events: events }, () => {
                console.log('Minute tracked:', minuteEvent);
            });
        });

    } catch (error) {
        console.error('Error tracking minute:', error);
    }
}

async function nightlyRollup() {
    console.log('Running nightly rollup...');

    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dayKey = getDayKey(yesterday);

        // Get events for yesterday
        chrome.storage.local.get(['events'], (result) => {
            const events = result.events || {};
            const dayEvents = events[dayKey] || [];

            if (dayEvents.length > 0) {
                // Calculate daily aggregate
                const aggregate = buildDailyAggregate(dayEvents);

                // Store aggregate
                chrome.storage.local.get(['aggregates'], (result) => {
                    const aggregates = result.aggregates || {};
                    aggregates[dayKey] = aggregate;

                    chrome.storage.local.set({ aggregates: aggregates }, () => {
                        console.log('Daily aggregate stored:', aggregate);
                    });
                });

                // Prune old events (keep last 30 days)
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - 30);
                const cutoffKey = getDayKey(cutoffDate);

                Object.keys(events).forEach(key => {
                    if (key < cutoffKey) {
                        delete events[key];
                    }
                });

                chrome.storage.local.set({ events: events });
            }
        });

    } catch (error) {
        console.error('Error in nightly rollup:', error);
    }
}

async function handleGetSummary(range, sendResponse) {
    try {
        const summary = await buildSummary(range);
        sendResponse({ success: true, data: summary });
    } catch (error) {
        console.error('Error building summary:', error);
        sendResponse({ success: false, error: error.message });
    }
}

async function buildSummary(range) {
    const now = new Date();
    const startDate = new Date();

    switch (range) {
        case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
        case 'month':
            startDate.setDate(now.getDate() - 30);
            break;
        default:
            startDate.setDate(now.getDate() - 7);
    }

    // Get aggregates and events
    const result = await chrome.storage.local.get(['aggregates', 'events']);
    const aggregates = result.aggregates || {};
    const events = result.events || {};

    const days = [];
    const totals = { minutes: 0, byCategory: {} };
    let topDomain = null;

    // Process each day in range
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
        const dayKey = getDayKey(d);
        let dayData = aggregates[dayKey];

        // If no aggregate exists, build from events
        if (!dayData && events[dayKey]) {
            dayData = buildDailyAggregate(events[dayKey]);
        }

        if (dayData) {
            days.push(dayData);

            // Accumulate totals
            totals.minutes += dayData.totalMinutes;
            Object.entries(dayData.byCategory).forEach(([category, minutes]) => {
                totals.byCategory[category] = (totals.byCategory[category] || 0) + minutes;
            });

            // Track top domain
            if (dayData.byDomainTop && dayData.byDomainTop.length > 0) {
                const domainMinutes = dayData.byDomainTop[0].minutes;
                if (!topDomain || domainMinutes > topDomain.minutes) {
                    topDomain = dayData.byDomainTop[0];
                }
            }
        }
    }

    return {
        range: { start: startDate.toISOString(), end: now.toISOString() },
        days: days,
        totals: totals,
        topDomain: topDomain,
        focusRatio: calculateFocusRatio(days),
        streakDays: calculateStreakDays(days)
    };
}

function buildDailyAggregate(events) {
    const byCategory = {};
    const byDomain = {};
    let totalMinutes = 0;

    events.forEach(event => {
        totalMinutes += event.minutes;

        // Category aggregation
        byCategory[event.category] = (byCategory[event.category] || 0) + event.minutes;

        // Domain aggregation
        byDomain[event.domain] = (byDomain[event.domain] || 0) + event.minutes;
    });

    // Convert to top domains array
    const byDomainTop = Object.entries(byDomain)
        .map(([domain, minutes]) => ({ domain, minutes }))
        .sort((a, b) => b.minutes - a.minutes)
        .slice(0, 10);

    return {
        day: getDayKey(new Date(events[0]?.tsMinute)),
        totalMinutes: totalMinutes,
        byCategory: byCategory,
        byDomainTop: byDomainTop,
        focusRatio: 1.0 // Assuming all tracked minutes are focused
    };
}

function categorizeDomain(domain) {
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

function getDayKey(date) {
    return date.toISOString().slice(0, 10);
}

function getNextMidnight() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(2, 0, 0, 0); // 2 AM to avoid midnight edge cases
    return tomorrow.getTime();
}

function calculateFocusRatio(days) {
    if (days.length === 0) return 0;
    const totalMinutes = days.reduce((sum, day) => sum + day.totalMinutes, 0);
    const totalConsidered = days.length * 16 * 60; // Assume 16 hours per day
    return totalConsidered > 0 ? (totalMinutes / totalConsidered) * 100 : 0;
}

function calculateStreakDays(days) {
    if (days.length === 0) return 0;

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dayKey = getDayKey(checkDate);

        const dayData = days.find(d => d.day === dayKey);
        if (dayData && dayData.totalMinutes > 0) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}
