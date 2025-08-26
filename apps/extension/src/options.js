/**
 * Options page JavaScript for ScreenTime extension
 */

document.addEventListener('DOMContentLoaded', () => {
  updateLastSync();
  setupEventListeners();
});

function setupEventListeners() {
  const exportBtn = document.getElementById('exportBtn');
  const exportRange = document.getElementById('exportRange');
  
  exportBtn.addEventListener('click', () => {
    exportData(exportRange.value);
  });
}

async function updateLastSync() {
  const lastSyncElement = document.getElementById('lastSync');
  
  try {
    // Get last sync time from storage
    const result = await chrome.storage.local.get(['lastSync']);
    const lastSync = result.lastSync;
    
    if (lastSync) {
      const date = new Date(lastSync);
      lastSyncElement.textContent = date.toLocaleString();
    } else {
      lastSyncElement.textContent = 'Never';
    }
  } catch (error) {
    console.error('Error getting last sync:', error);
    lastSyncElement.textContent = 'Error';
  }
}

async function exportData(range) {
  const exportBtn = document.getElementById('exportBtn');
  const originalText = exportBtn.textContent;
  
  try {
    exportBtn.textContent = 'Exporting...';
    exportBtn.disabled = true;
    
    // Request summary from background script
    const response = await chrome.runtime.sendMessage({
      type: 'GET_SUMMARY',
      range: range
    });
    
    if (response.success && response.summary) {
      // Create and download JSON file
      const dataStr = JSON.stringify(response.summary, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `screentime-${range}-${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      // Update last sync time
      await chrome.storage.local.set({ lastSync: new Date().toISOString() });
      updateLastSync();
      
      showMessage('Export successful!', 'success');
    } else {
      throw new Error(response.error || 'Failed to get summary');
    }
  } catch (error) {
    console.error('Export error:', error);
    showMessage('Export failed: ' + error.message, 'error');
  } finally {
    exportBtn.textContent = originalText;
    exportBtn.disabled = false;
  }
}

function showMessage(message, type) {
  // Remove existing message
  const existingMessage = document.querySelector('.message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  // Create new message
  const messageElement = document.createElement('div');
  messageElement.className = `message fixed top-4 right-4 px-4 py-2 rounded-md text-white text-sm ${
    type === 'success' ? 'bg-green-600' : 'bg-red-600'
  }`;
  messageElement.textContent = message;
  
  document.body.appendChild(messageElement);
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (messageElement.parentNode) {
      messageElement.remove();
    }
  }, 3000);
}
