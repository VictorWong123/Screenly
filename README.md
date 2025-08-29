# Screenly - Smart Screen Time Tracking

A comprehensive productivity tracking solution with a Chrome extension for active screen time monitoring and a React dashboard for insights and analytics.

## 🚀 Features

- **Chrome Extension (MV3)**: Tracks active screen time per domain with intelligent focus detection
- **React Dashboard**: Beautiful dark-themed interface with D3.js charts and analytics
- **Supabase Integration**: User authentication and data persistence
- **Timer System**: Manual time tracking for activities and projects
- **Real-time Analytics**: Daily, weekly, and monthly productivity insights

## 🏗️ Architecture

```
screenly/
├── apps/
│   ├── extension/          # Chrome MV3 extension
│   └── website/           # React + Vite + Tailwind + D3 dashboard
└── packages/
    └── shared/            # Shared utilities and types
```

## 🛠️ Tech Stack

- **Extension**: Chrome MV3, Vanilla JavaScript
- **Website**: React 18, Vite, Tailwind CSS, D3.js
- **Backend**: Supabase (Auth, Database)
- **Database**: PostgreSQL with Row Level Security
- **Styling**: Dark theme with purple accents

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- Chrome browser
- Supabase account

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd screenly
npm install
```

### 2. Environment Setup
Create `.env` file in `apps/website/`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase Setup
1. Create a new Supabase project
2. Run the SQL schema from `SUPABASE_SETUP.md`
3. Enable authentication in Supabase dashboard
4. Copy your project URL and anon key to `.env`

### 4. Build Extension
```bash
npm run build:extension
```

### 5. Load Extension in Chrome
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `apps/extension/dist/`

## 🚀 Development

### Start Website
```bash
npm run dev:website
# or
npm run dev
```

### Build for Production
```bash
npm run build:website
npm run build:extension
```

## 📊 How It Works

### Extension Tracking
- **Active Detection**: Only tracks when Chrome is focused, tab is visible, and user is not idle
- **Minute Granularity**: Records time in 1-minute intervals
- **Domain Categorization**: Automatically categorizes websites (Work, Social, Entertainment, etc.)
- **Privacy First**: All data stored locally, no external tracking

### Dashboard Features
- **Authentication**: Secure login/signup with Supabase
- **Timer Management**: Start/stop timers for custom activities
- **Analytics**: Four main chart types:
  - Average Daily Time (line chart)
  - Most Used Time (radar chart) 
  - Best Performances (metric cards)
  - Progress Tracking (progress bars)
- **Data Export/Import**: JSON backup and restore

## 🔐 Privacy & Security

- **Local Storage**: Extension data stored locally in Chrome
- **Row Level Security**: Database access restricted to authenticated users
- **No External Tracking**: All analytics computed from local data
- **User Control**: Full control over data export and deletion

## 📱 Usage

### Extension
1. Install and enable the extension
2. Browse normally - tracking happens automatically
3. Use options page to export data ranges (Today/7d/30d)

### Dashboard
1. Sign up/login with email
2. Create activities and start timers
3. View analytics and productivity insights
4. Export/import your data

## 🎨 Customization

### Themes
- Dark theme with purple accent colors
- Responsive design (1440x900 optimized)
- Smooth animations and transitions

### Charts
- Custom D3.js implementations
- Responsive SVG graphics
- Interactive hover effects

## 🐛 Troubleshooting

### Common Issues
- **"Supabase not configured"**: Check `.env` file and restart dev server
- **Extension not tracking**: Ensure permissions are granted in Chrome
- **Charts not loading**: Check browser console for errors

### Debug Mode
Enable console logging in browser dev tools to see detailed tracking information.

## 📈 Roadmap

- [ ] Team leaderboards and comparisons
- [ ] Mobile app companion
- [ ] Advanced analytics and insights
- [ ] Integration with productivity tools
- [ ] API for third-party integrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Supabase setup documentation
3. Open an issue on GitHub

---

**Screenly** - Track smarter, work better. 🚀