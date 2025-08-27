# 🚀 ScreenTime - Time Tracking & Analytics

A comprehensive time tracking application with Chrome extension integration and beautiful analytics dashboard.

## ✨ Features

- **Chrome Extension (MV3)**: Track active screen time per domain
- **Web Dashboard**: Beautiful analytics with D3.js visualizations
- **User Authentication**: Secure login/signup with Supabase
- **Real-time Tracking**: Monitor focus time and productivity
- **Data Export**: Export your data in JSON format
- **Responsive Design**: Works on all devices

## 🏗️ Architecture

```
screenTime/
├── apps/
│   ├── extension/          # Chrome MV3 extension
│   └── website/           # React + Vite dashboard
├── packages/
│   └── shared/            # Shared utilities and types
└── SUPABASE_SETUP.md      # Supabase configuration guide
```

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd screenTime
npm install
```

### 2. Set Up Supabase

1. **Follow the complete setup guide**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
2. **Create your environment file**:
   ```bash
   cp env.example .env
   # Edit .env with your Supabase credentials
   ```

### 3. Run the Application

```bash
# Development mode
npm run dev

# Build for production
npm run build
```

## 🔐 Authentication Flow

- **Unauthenticated users**: Can access the timer page
- **Authenticated users**: Full access to dashboard and analytics
- **Login/Signup**: Email + password authentication via Supabase
- **Protected Routes**: Dashboard requires authentication

## 📱 Usage

### For Unauthenticated Users
1. Visit `/timer` to use the time tracker
2. Click "Sign Up" to create an account
3. Or click "Sign In" if you already have an account

### For Authenticated Users
1. **Dashboard** (`/dashboard`): View analytics and manage sessions
2. **Timer** (`/timer`): Track new time sessions
3. **Navigation**: Use the header to switch between pages
4. **Logout**: Click "Sign Out" in the header

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Chrome browser (for extension testing)

### Available Scripts

```bash
# Root level
npm run dev          # Start website in development mode
npm run build        # Build website for production
npm run dev:ext      # Build extension in watch mode

# Extension specific
cd apps/extension
npm run build        # Build extension
npm run watch        # Watch mode for development

# Website specific
cd apps/website
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Environment Variables

Create a `.env` file in the project root:

```bash
# Required for Supabase authentication
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional
VITE_APP_NAME=ScreenTime
NODE_ENV=development
```

## 🔧 Configuration

### Supabase Setup
Detailed instructions are in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

### Extension Configuration
- Update `apps/extension/manifest.json` for extension metadata
- Modify `apps/extension/src/background.js` for tracking logic
- Customize `apps/extension/options.html` for settings

### Website Configuration
- Update `apps/website/vite.config.js` for build settings
- Modify `apps/website/tailwind.config.js` for styling
- Customize components in `apps/website/src/components/`

## 📊 Data Structure

### Screen Time Events
```typescript
interface MinuteEvent {
  timestamp: string;
  domain: string;
  url: string;
  category: string;
}
```

### Daily Aggregates
```typescript
interface DailyAggregate {
  dayKey: string;
  totalMinutes: number;
  byCategory: Record<string, number>;
  byDomainTop: Array<{domain: string, minutes: number}>;
  focusRatio: number;
}
```

## 🎨 UI Components

- **KpiCard**: Display key metrics with sparklines
- **StackedBarsByDay**: Daily activity visualization
- **DonutByCategory**: Category breakdown chart
- **NavigationHeader**: User navigation and authentication
- **TimerPanel**: Time tracking interface

## 🔒 Security

- **Row Level Security (RLS)** enabled on all tables
- **User isolation**: Users can only access their own data
- **Secure authentication** via Supabase Auth
- **Environment variables** for sensitive configuration

## 🚀 Deployment

### Website
```bash
npm run build
# Deploy dist/ folder to your hosting provider
```

### Extension
```bash
cd apps/extension
npm run build
# Load dist/ folder as unpacked extension in Chrome
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup
- **Issues**: Open an issue on GitHub
- **Questions**: Check the documentation or open a discussion

---

**Happy Time Tracking! ⏰**