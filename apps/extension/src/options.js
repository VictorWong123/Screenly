// Screenly Extension Options
document.addEventListener('DOMContentLoaded', function () {
    // Export buttons
    document.getElementById('exportToday').addEventListener('click', () => exportData('today'));
    document.getElementById('exportWeek').addEventListener('click', () => exportData('week'));
    document.getElementById('exportMonth').addEventListener('click', () => exportData('month'));

    // Load last sync time
    loadLastSyncTime();
});

async function exportData(range) {
    try {
        // Request summary from background script
        const response = await chrome.runtime.sendMessage({
            action: 'GET_SUMMARY',
            range: range
        });

        if (response.success && response.data) {
            // Create and download file
            const filename = `screenly-export-${range}-${new Date().toISOString().split('T')[0]}.json`;
            downloadJSON(response.data, filename);

            // Update last sync time
            updateLastSyncTime();
        } else {
            console.error('Failed to get summary:', response.error);
            alert('Failed to export data. Please try again.');
        }
    } catch (error) {
        console.error('Export error:', error);
        alert('Export failed. Please try again.');
    }
}

function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

function updateLastSyncTime() {
    const now = new Date();
    const timeString = now.toLocaleString();

    // Store in local storage
    localStorage.setItem('screenly_last_export', timeString);

    // Update display
    document.getElementById('lastSync').textContent = `Last export: ${timeString}`;
}

function loadLastSyncTime() {
    const lastExport = localStorage.getItem('screenly_last_export');
    if (lastExport) {
        document.getElementById('lastSync').textContent = `Last export: ${lastExport}`;
    }
}
