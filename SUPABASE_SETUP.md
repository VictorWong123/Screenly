# Supabase Setup for ScreenTime App

## 🚀 **Quick Setup (Copy & Paste All)**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table for user-defined activities
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create timer sessions table to track time spent on activities
CREATE TABLE IF NOT EXISTS public.timer_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create current timer table to track which activity is currently running
CREATE TABLE IF NOT EXISTS public.current_timers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create screen time tracking table (for future Chrome extension integration)
CREATE TABLE IF NOT EXISTS public.screen_time_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  domain TEXT,
  url TEXT,
  title TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  activity_id UUID REFERENCES public.activities(id), -- Optional link to user activity
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily screen time aggregates
CREATE TABLE IF NOT EXISTS public.daily_screen_time (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  date_key TEXT NOT NULL, -- Format: YYYY-MM-DD
  total_minutes INTEGER DEFAULT 0,
  domains JSONB, -- Store domain breakdown
  activities JSONB, -- Store activity breakdown
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date_key)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.current_timers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screen_time_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_screen_time ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own activities" ON public.activities
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own timer sessions" ON public.timer_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own current timer" ON public.current_timers
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own screen time events" ON public.screen_time_events
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own daily screen time" ON public.daily_screen_time
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_timer_sessions_user_id ON public.timer_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_timer_sessions_started_at ON public.timer_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_current_timers_user_id ON public.current_timers(user_id);
CREATE INDEX IF NOT EXISTS idx_screen_time_events_user_id ON public.screen_time_events(user_id);
CREATE INDEX IF NOT EXISTS idx_screen_time_events_started_at ON public.screen_time_events(started_at);
CREATE INDEX IF NOT EXISTS idx_daily_screen_time_user_id ON public.daily_screen_time(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_screen_time_date_key ON public.daily_screen_time(date_key);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_screen_time_updated_at BEFORE UPDATE ON public.daily_screen_time
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 🔧 **Environment Variables**

Make sure your `.env` file in `apps/website/` contains:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📊 **Data Structure Explanation**

### **Timer Sessions** (`timer_sessions`)
- **started_at**: When the timer started (timestamp)
- **ended_at**: When the timer ended (timestamp)
- **duration_minutes**: Total time spent (calculated)
- **activity_id**: Links to user's custom activity

### **Screen Time Events** (`screen_time_events`)
- **started_at**: When screen time started (timestamp)
- **ended_at**: When screen time ended (timestamp)
- **duration_minutes**: Time spent on that domain/URL
- **domain**: Website domain (e.g., "github.com")
- **url**: Full URL
- **title**: Page title
- **activity_id**: Optional link to user activity

### **Daily Aggregates** (`daily_screen_time`)
- **date_key**: Date in YYYY-MM-DD format
- **total_minutes**: Total screen time for the day
- **domains**: JSON breakdown by domain
- **activities**: JSON breakdown by activity

## 🚀 **How to Execute**

1. **Go to Supabase Dashboard** → SQL Editor
2. **Copy the entire SQL block above**
3. **Paste and run** in the SQL Editor
4. **Verify tables** are created in the Table Editor

## ✅ **Verification Queries**

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'activities', 'timer_sessions', 'current_timers', 'screen_time_events', 'daily_screen_time');

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

## 🔗 **Next Steps**

After running this SQL:
1. The app will automatically create user profiles on signup
2. Timer data will be stored in Supabase
3. Dashboard will show real data from your database
4. Ready for Chrome extension integration
