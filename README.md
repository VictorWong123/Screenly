# Screenly - Smart Productivity Tracking

A comprehensive productivity tracking solution with manual time tracking and beautiful analytics dashboard.

## 🚀 Features

- **Manual Timer System**: Start/stop timers for custom activities and projects
- **React Dashboard**: Beautiful dark-themed interface with D3.js charts and analytics
- **Supabase Integration**: User authentication and data persistence
- **Real-time Analytics**: Daily, weekly, and monthly productivity insights
- **Activity Management**: Organize activities by categories with search and grouping

## 🏗️ Architecture

```
screenly/
├── apps/
│   └── website/           # React + Vite + Tailwind + D3 dashboard
└── packages/
    └── shared/            # Shared utilities and types
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
- **Charts not loading**: Check browser console for errors
- **Authentication issues**: Verify Supabase settings

### Debug Mode
Enable console logging in browser dev tools to see detailed information.

## 📈 Roadmap

- [ ] Team collaboration features
- [ ] Mobile app companion
- [ ] Advanced analytics and insights
- [ ] Integration with productivity tools
- [ ] API for third-party integrations
- [ ] Time blocking and scheduling
- [ ] Goal setting and tracking

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