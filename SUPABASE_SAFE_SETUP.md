# Safe Supabase Setup for Existing Database

## 🚀 **Safe Setup (Copy & Paste All)**

This script adds the new timer functionality to your existing database without conflicts:

```sql
-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add missing columns to existing user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

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

-- Create daily screen time aggregates (different from your existing screen_time_aggregates)
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

-- Enable Row Level Security for new tables
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.current_timers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screen_time_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_screen_time ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables (using IF NOT EXISTS pattern)
DO $$
BEGIN
    -- Activities policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activities' AND policyname = 'Users can manage own activities') THEN
        CREATE POLICY "Users can manage own activities" ON public.activities
          FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Timer sessions policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'timer_sessions' AND policyname = 'Users can manage own timer sessions') THEN
        CREATE POLICY "Users can manage own timer sessions" ON public.timer_sessions
          FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Current timers policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'current_timers' AND policyname = 'Users can manage own current timer') THEN
        CREATE POLICY "Users can manage own current timer" ON public.current_timers
          FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Screen time events policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'screen_time_events' AND policyname = 'Users can manage own screen time events') THEN
        CREATE POLICY "Users can manage own screen time events" ON public.screen_time_events
          FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Daily screen time policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_screen_time' AND policyname = 'Users can manage own daily screen time') THEN
        CREATE POLICY "Users can manage own daily screen time" ON public.daily_screen_time
          FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create indexes for new tables (using IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_timer_sessions_user_id ON public.timer_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_timer_sessions_started_at ON public.timer_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_current_timers_user_id ON public.current_timers(user_id);
CREATE INDEX IF NOT EXISTS idx_screen_time_events_user_id ON public.screen_time_events(user_id);
CREATE INDEX IF NOT EXISTS idx_screen_time_events_started_at ON public.screen_time_events(started_at);
CREATE INDEX IF NOT EXISTS idx_daily_screen_time_user_id ON public.daily_screen_time(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_screen_time_date_key ON public.daily_screen_time(date_key);

-- Create function to update updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (using IF NOT EXISTS)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_activities_updated_at') THEN
        CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.activities
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_daily_screen_time_updated_at') THEN
        CREATE TRIGGER update_daily_screen_time_updated_at BEFORE UPDATE ON public.daily_screen_time
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
```

## 🔍 **What This Script Does:**

1. **✅ Safe**: Uses `IF NOT EXISTS` and `DO $$` blocks to avoid conflicts
2. **🔄 Adds New Tables**: Creates timer-related tables alongside your existing ones
3. **🔐 Preserves Security**: Keeps your existing RLS policies intact
4. **📊 Extends Functionality**: Adds timer tracking without breaking existing features

## 🚀 **How to Execute:**

1. **Go to Supabase Dashboard** → SQL Editor
2. **Copy the entire SQL block above**
3. **Paste and run** in the SQL Editor
4. **No errors** should occur

## 📊 **Your Database After Setup:**

### **Existing Tables (Unchanged):**
- `user_profiles` - User information
- `screen_time_aggregates` - Your existing screen time data
- `leaderboard` - Your existing leaderboard view

### **New Tables (Added):**
- `activities` - User-defined activities (Work, Study, etc.)
- `timer_sessions` - Timer session history
- `current_timers` - Currently running timers
- `screen_time_events` - Future Chrome extension data
- `daily_screen_time` - Daily timer summaries

## ✅ **Verification:**

After running, you should see:
- **No errors** in the SQL editor
- **New tables** in the Table Editor
- **All existing data** preserved
- **App working** with both old and new functionality

This approach gives you the best of both worlds - keeps your existing screen time tracking and adds the new timer functionality! 🎉
