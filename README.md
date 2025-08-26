# ScreenTime

A privacy-first screen time tracking system with a Chrome extension and visualization dashboard.

## Overview

ScreenTime tracks **active** screen time per domain, only when:
- Chrome window is focused
- Current tab is visible and active  
- User is not idle for > 60 seconds

Your data stays local - nothing is sent to external servers.

## Features

### Chrome Extension (MV3)
- **Active tracking**: Only counts minutes when you're actually using the browser
- **Domain categorization**: Automatically categorizes sites (Work, Social, Entertainment, etc.)
- **Privacy-first**: All data stored locally in Chrome
- **Export data**: Download JSON summaries for any time range
- **Nightly rollup**: Automatically aggregates and prunes old data

### Website Dashboard
- **KPI cards**: Total time, streak, focus ratio, top domain with sparklines
- **Interactive charts**: Stacked bars by day, donut by category
- **Comparison mode**: Compare current period vs previous period
- **Import data**: Load exported JSON from the extension
- **Responsive design**: Optimized for 1440×900, scales to 1280×720

## Project Structure

```
screenTime/
├── package.json                 # Root workspace config
├── apps/
│   ├── extension/              # Chrome MV3 extension
│   │   ├── manifest.json       # Extension manifest
│   │   ├── src/
│   │   │   ├── background.js   # Service worker
│   │   │   ├── content.js      # Content script
│   │   │   └── options.js      # Options page logic
│   │   └── options.html        # Options page UI
│   └── website/                # React dashboard
│       ├── src/
│       │   ├── components/     # React components
│       │   ├── data/           # Data and adapters
│       │   └── lib/            # Utility functions
│       ├── index.html          # Entry point
│       └── package.json        # Website dependencies
└── packages/
    └── shared/                 # Shared utilities
        └── index.js            # Domain categorization, formatters
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Website

```bash
npm run dev:website
```

The dashboard will open at `http://localhost:3000` with sample data loaded.

### 3. Load the Chrome Extension

1. Build the extension:
   ```bash
   npm run build:extension
   ```

2. Open Chrome and go to `chrome://extensions/`

3. Enable "Developer mode" (top right)

4. Click "Load unpacked" and select the `apps/extension/dist/` folder

5. The ScreenTime extension should now appear in your extensions list

## Usage

### Extension Setup

1. **Install**: Load the extension as described above
2. **Permissions**: Grant required permissions when prompted
3. **Start tracking**: The extension automatically begins tracking active time
4. **Export data**: Right-click extension icon → Options → Export JSON

### Dashboard Usage

1. **Load sample data**: Click "Load Sample" to see demo data
2. **Import your data**: Click "Import Data" and select exported JSON from extension
3. **Explore**: Switch between time ranges (Today, 7 days, 30 days)
4. **Compare**: Toggle "vs previous period" to see changes
5. **Charts**: Hover over charts for detailed tooltips

## Data Model

### Minute Events
```javascript
{
  tsMinute: "2024-01-15T14:30", // ISO minute string
  url: "https://github.com/user/repo",
  domain: "github.com",
  category: "Work",
  minutes: 1
}
```

### Daily Aggregates
```javascript
{
  day: "2024-01-15",
  totalMinutes: 420,
  byCategory: {
    Work: 240,
    Social: 60,
    Entertainment: 90,
    Utilities: 20,
    Other: 10
  },
  byDomainTop: [
    { domain: "github.com", minutes: 180 },
    { domain: "figma.com", minutes: 60 }
  ]
}
```

### Summary
```javascript
{
  range: { start: "2024-01-15", end: "2024-01-21" },
  days: [DailyAggregate...],
  totals: { minutes: 2520, byCategory: {...} },
  topDomain: { domain: "github.com", minutes: 360 },
  focusRatio: 25.0,
  streakDays: 7
}
```

## Domain Categorization

The extension automatically categorizes domains:

- **Work**: GitHub, Figma, Notion, Slack, Linear, Jira, etc.
- **Social**: Twitter, Instagram, TikTok, Reddit, Discord, etc.
- **Entertainment**: YouTube, Netflix, Twitch, Hulu, etc.
- **Utilities**: Google services, weather, maps, Wikipedia, etc.
- **Other**: Unrecognized domains

Categories are configurable in `packages/shared/index.js`.

## Privacy & Data

- **Local storage**: All data stored in Chrome's local storage
- **No tracking**: Extension only tracks when you're actively using Chrome
- **No external calls**: Data never leaves your browser
- **Automatic cleanup**: Minute-level events pruned after 30 days
- **Aggregates kept**: Daily summaries preserved indefinitely

## Future Features (Stubbed)

The project includes adapter stubs for future Supabase integration:

- **Leaderboards**: Compare your stats with others
- **Multi-device sync**: Share data across devices  
- **Advanced analytics**: More detailed insights and trends
- **Team features**: Share and compare with team

### Supabase Integration

For leaderboards and user authentication, see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for complete setup instructions. members

## Development

### Adding New Categories

Edit `packages/shared/index.js`:

```javascript
export function categorizeDomain(domain) {
  const domainLower = domain.toLowerCase();
  
  // Add new category
  if (['newsite.com', 'another.com'].some(d => domainLower.includes(d))) {
    return 'News';
  }
  
  // ... existing categories
}
```

### Adding New Charts

1. Create component in `apps/website/src/components/`
2. Use D3 for visualization
3. Import and add to `App.jsx`
4. Follow existing chart patterns

### Extension Development

1. Make changes in `apps/extension/src/`
2. Run `npm run build:extension`
3. Reload extension in Chrome
4. Check console for debugging info

## Troubleshooting

### Extension Not Tracking

1. Check extension is enabled in `chrome://extensions/`
2. Verify permissions are granted
3. Check console for error messages
4. Ensure Chrome window is focused

### Dashboard Issues

1. Check browser console for errors
2. Verify JSON format matches expected schema
3. Try loading sample data first
4. Check network tab for failed requests

### Build Issues

1. Clear `node_modules` and reinstall
2. Check Node.js version (requires 16+)
3. Verify all dependencies are installed
4. Check for TypeScript errors

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes following existing patterns
4. Test extension and website
5. Submit pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check this README
2. Review console logs
3. Open GitHub issue with details
4. Include Chrome version and OS info
# Screenly
