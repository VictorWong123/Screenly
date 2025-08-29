// Screenly Extension - Content Script
// Monitors page visibility and sends updates to background script

// Listen for visibility changes
document.addEventListener('visibilitychange', () => {
    const visible = !document.hidden;
    console.log('Page visibility changed:', visible);

    // Send message to background script
    chrome.runtime.sendMessage({
        type: 'VISIBILITY_CHANGE',
        visible: visible
    });
});

// Listen for page show/hide events (for better compatibility)
window.addEventListener('pageshow', () => {
    console.log('Page shown');
    chrome.runtime.sendMessage({
        type: 'VISIBILITY_CHANGE',
        visible: true
    });
});

window.addEventListener('pagehide', () => {
    console.log('Page hidden');
    chrome.runtime.sendMessage({
        type: 'VISIBILITY_CHANGE',
        visible: false
    });
});

console.log('Screenly content script loaded');
