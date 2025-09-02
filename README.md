# Screenly - Smart Productivity Tracking

A comprehensive productivity tracking solution with manual time tracking and beautiful analytics dashboard.

## 🚀 Features

- **Manual Timer System**: Start/stop timers for custom activities and projects
- **React Dashboard**: Beautiful dark-themed interface with D3.js charts and analytics
- **Leaderboard System**: Compare productivity with other users across different time-based heats
- **Supabase Integration**: User authentication and data persistence
- **Real-time Analytics**: Daily, weekly, and monthly productivity insights
- **Activity Management**: Organize activities by categories with search and grouping

## 🏗️ Architecture

```
screenly/
├── src/
│   ├── components/
│   │   ├── charts/     # D3.js chart components
│   │   └── ...         # Other UI components
│   ├── pages/          # Page components
│   └── contexts/       # React contexts
├── dist/               # Build output
└── package.json        # Dependencies and scripts
```

## 🛠️ Tech Stack

- **Website**: React 18, Vite, Tailwind CSS, D3.js
- **Backend**: Supabase (Auth, Database)
- **Database**: PostgreSQL with Row Level Security
- **Styling**: Dark theme with purple accents

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- Supabase account

### 1. Clone and Install
```bash
git clone https://github.com/VictorWong123/Screenly.git
cd screenly
npm install
```

### 2. Environment Setup
Create `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase Setup
1. Create a new Supabase project
2. Run the SQL schema from `SUPABASE_SETUP.md`
3. Enable authentication in Supabase dashboard
4. Copy your project URL and anon key to `.env`

## 🚀 Development

### Start Website
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Populate Database with Test Data

**SQL Script:**
1. Copy the contents of `create_dummy_users_fixed.sql`
2. Paste it into your Supabase SQL editor
3. Run the script to create 50 users with realistic data
4. Run the RLS fix script to allow leaderboard access

## 📊 How It Works

### Timer System
- **Manual Tracking**: Start/stop timers for any activity
- **Category Organization**: Group activities by work, study, exercise, etc.
- **Search Functionality**: Quickly find specific activities
- **Time Continuation**: Resume timers from where you left off
- **Daily/Weekly Tracking**: Monitor time spent per activity over time

### Dashboard Features
- **Authentication**: Secure login/signup with Supabase
- **Analytics**: Four main chart types:
  - Average Daily Time (line chart)
  - Most Used Time (radar chart) 
  - Best Performances (metric cards)
  - Progress Tracking (progress bars)
- **Data Export/Import**: JSON backup and restore

## 🔐 Privacy & Security

- **User Authentication**: Secure login with Supabase
- **Row Level Security**: Database access restricted to authenticated users
- **Data Ownership**: Users only access their own data
- **User Control**: Full control over data export and deletion

## 📱 Usage

### Getting Started
1. Sign up/login with email
2. Create activities and organize them by category
3. Start timers when you begin working on tasks
4. Stop timers when you're done
5. View analytics and productivity insights

### Timer Management
- **Start Timer**: Click "Start Timer" for any activity
- **Stop Timer**: Click "Stop Timer" to end the session
- **Continue Timer**: Resume previous sessions with "Continue"
- **Search Activities**: Use the search bar to find specific activities
- **Category Groups**: Click category headers to expand/collapse groups

### Dashboard Analytics
- **Time Overview**: See total time spent on activities
- **Performance Metrics**: Track productivity trends
- **Category Breakdown**: Understand time distribution
- **Progress Tracking**: Monitor goals and achievements

### Leaderboard Features
- **Heat-based Rankings**: Users are grouped into time-based heats (Sub 2h, 2-3h, 3-4h, etc.)
- **7-day Averages**: Compare productivity based on weekly averages
- **Projected Performance**: See projected vs actual time tracking
- **User Comparison**: View rankings with user initials and performance metrics
- **Grid/List Views**: Toggle between different viewing modes

## 🐛 Troubleshooting

### Common Issues
- **"Supabase not configured"**: Check `.env` file and restart dev server
- **Charts not loading**: Check browser console for errors
- **Authentication issues**: Verify Supabase settings

### Debug Mode
Enable console logging in browser dev tools to see detailed information.



## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Supabase setup documentation
3. Open an issue on GitHub

---

**Screenly** - Track smarter, work better. 🚀