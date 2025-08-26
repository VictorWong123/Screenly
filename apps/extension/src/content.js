/**
 * Content script for ScreenTime extension
 * Monitors tab visibility and communicates with background script
 */

// Listen for visibility changes
document.addEventListener('visibilitychange', () => {
  const isVisible = !document.hidden;
  
  // Send visibility state to background script
  chrome.runtime.sendMessage({
    type: 'VISIBILITY_CHANGE',
    visible: isVisible
  });
});

// Also listen for page show/hide events (for some edge cases)
window.addEventListener('pageshow', () => {
  chrome.runtime.sendMessage({
    type: 'VISIBILITY_CHANGE',
    visible: true
  });
});

window.addEventListener('pagehide', () => {
  chrome.runtime.sendMessage({
    type: 'VISIBILITY_CHANGE',
    visible: false
  });
});

console.log('ScreenTime content script loaded');
