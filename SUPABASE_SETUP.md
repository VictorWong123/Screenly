# 🚀 Supabase Setup Guide for ScreenTime

This guide will help you set up Supabase for authentication and data storage in your ScreenTime app.

## 📋 Prerequisites

- A Supabase account (free at [supabase.com](https://supabase.com))
- Your ScreenTime project ready

## 🏗️ Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Choose your organization
4. Enter project details:
   - **Name**: `screen-time` (or whatever you prefer)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to you
5. Click **"Create new project"**
6. Wait for the project to be ready (2-3 minutes)

## 🗄️ Step 2: Set Up Database Schema

Go to your Supabase project dashboard → **SQL Editor** and run this complete schema:

```sql
-- Create user profiles table
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create screen time aggregates table
CREATE TABLE public.screen_time_aggregates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  day_key TEXT NOT NULL,
  total_minutes INTEGER NOT NULL,
  by_category JSONB NOT NULL,
  by_domain_top JSONB NOT NULL,
  focus_ratio DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, day_key)
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screen_time_aggregates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for screen_time_aggregates
CREATE POLICY "Users can view own aggregates" ON public.screen_time_aggregates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own aggregates" ON public.screen_time_aggregates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own aggregates" ON public.screen_time_aggregates
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX idx_aggregates_user_day ON public.screen_time_aggregates(user_id, day_key);
CREATE INDEX idx_aggregates_day_key ON public.screen_time_aggregates(day_key);

-- Create leaderboard view
CREATE VIEW public.leaderboard AS
SELECT 
  up.username,
  up.display_name,
  up.avatar_url,
  COALESCE(SUM(sta.total_minutes), 0) as total_minutes,
  COALESCE(AVG(sta.focus_ratio), 0) as avg_focus_ratio,
  COUNT(DISTINCT sta.day_key) as active_days
FROM public.user_profiles up
LEFT JOIN public.screen_time_aggregates sta ON up.id = sta.user_id
WHERE sta.day_key >= TO_CHAR(CURRENT_DATE - INTERVAL '30 days', 'YYYY-MM-DD') OR sta.day_key IS NULL
GROUP BY up.id, up.username, up.display_name, up.avatar_url
ORDER BY total_minutes DESC;
```

## 🔑 Step 3: Enable Authentication

1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. **Enable Email Authentication**:
   - Go to **Auth** → **Providers** → **Email**
   - Make sure **Enable email confirmations** is turned ON
   - Set **Site URL** to `http://localhost:3000` (for development)
3. **Optional**: Enable other providers (Google, GitHub, etc.) if you want

## 🔑 Step 4: Get Your API Keys

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these values:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## 📝 Step 5: Create Environment File

Create a `.env` file in your project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional
VITE_APP_NAME=ScreenTime
NODE_ENV=development
```

## 📦 Step 6: Install Supabase Client

Run this command in your project root:

```bash
npm install @supabase/supabase-js
```

## 🧪 Step 7: Test Your Setup

### Test 1: Database Schema
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'screen_time_aggregates', 'leaderboard');
```

### Test 2: Authentication
1. Go to your Supabase dashboard → **Authentication** → **Users**
2. Try creating a test user manually
3. Check that the user appears in both `auth.users` and `public.user_profiles`

### Test 3: RLS Policies
```sql
-- Test that RLS is working (should return empty for non-authenticated users)
SELECT * FROM public.user_profiles;
SELECT * FROM public.screen_time_aggregates;
```

## 🆘 Troubleshooting

### Common SQL Errors

- **"must be owner of table users"**: Don't modify `auth.users` table - it's managed by Supabase
- **"relation does not exist"**: Make sure you're in the correct schema (public)
- **"permission denied"**: Check that you're running SQL as the postgres user
- **"leaderboard is not a table"**: Run the SQL in the correct order (tables first, then views)

### Other Issues

- **Connection Issues**: Check your Supabase URL and keys
- **RLS Errors**: Verify your database policies are correct
- **Auth Problems**: Ensure your auth settings are configured
- **CORS Issues**: Check your Supabase project settings

## 🎯 Next Steps

Once your Supabase setup is complete:

1. **Update your React app** to use Supabase authentication
2. **Connect your Chrome extension** to sync data with Supabase
3. **Implement real-time features** using Supabase subscriptions
4. **Add user profiles** and leaderboards

---

**Need Help?** Check the [Supabase Documentation](https://supabase.com/docs) or open an issue in your repository.
