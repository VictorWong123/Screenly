# 🚀 Supabase Setup Guide for Time Tracker

This guide will help you set up Supabase for data storage in your Time Tracker app.

## 📋 Prerequisites

- A Supabase account (free at [supabase.com](https://supabase.com))
- Your Time Tracker project ready

## 🏗️ Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Choose your organization
4. Enter project details:
   - **Name**: `time-tracker` (or whatever you prefer)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to you
5. Click **"Create new project"**
6. Wait for the project to be ready (2-3 minutes)

## 🗄️ Step 2: Set Up Database Schema

Go to your Supabase project dashboard → **SQL Editor** and run the complete schema from `database-schema.sql`:

```sql
-- Create projects table
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#6B7280',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  category TEXT,
  note TEXT,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for now - you can add authentication later)
CREATE POLICY "Allow all operations on projects" ON public.projects
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on categories" ON public.categories
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on sessions" ON public.sessions
  FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_sessions_start_time ON public.sessions(start_time);
CREATE INDEX idx_sessions_project_id ON public.sessions(project_id);
CREATE INDEX idx_sessions_category ON public.sessions(category);

-- Insert default categories
INSERT INTO public.categories (name, color) VALUES
  ('Work', '#3B82F6'),
  ('Personal', '#10B981'),
  ('Learning', '#F59E0B'),
  ('Exercise', '#EF4444'),
  ('Other', '#6B7280');

-- Insert some sample projects
INSERT INTO public.projects (name, description, color) VALUES
  ('Website Development', 'Building and maintaining websites', '#3B82F6'),
  ('Mobile App', 'iOS and Android app development', '#10B981'),
  ('Data Analysis', 'Analyzing data and creating reports', '#F59E0B'),
  ('Meeting', 'Team meetings and discussions', '#8B5CF6'),
  ('Research', 'Research and documentation', '#06B6D4');
```

## 🔑 Step 3: Get Your API Keys

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these values:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## 📝 Step 4: Create Environment File

Create a `.env` file in your `apps/website` directory:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional
VITE_APP_NAME=TimeTracker
NODE_ENV=development
```

## 🧪 Step 5: Test Your Setup

### Test 1: Database Schema
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('projects', 'categories', 'sessions');
```

### Test 2: Sample Data
```sql
-- Check if default data was inserted
SELECT * FROM public.categories;
SELECT * FROM public.projects;
```

## 🎯 Next Steps

Once your Supabase setup is complete:

1. **Start the development server**: `npm run dev`
2. **Navigate to the timer page**: The app will redirect to `/timer` by default
3. **Create a new project**: Use the "Or create new project" field in the timer
4. **Start tracking time**: Select a project/category and start the timer
5. **View your dashboard**: Click "View Dashboard" to see your time tracking data

## 🆘 Troubleshooting

### Common Issues

- **"Supabase not configured"**: Make sure your `.env` file is in the correct location and has the right variable names
- **Connection Issues**: Check your Supabase URL and keys
- **Database Errors**: Verify your database schema was created correctly
- **CORS Issues**: Check your Supabase project settings

### Environment Variables

Make sure your `.env` file is in the `apps/website` directory and contains:
- `VITE_SUPABASE_URL` (not `SUPABASE_URL`)
- `VITE_SUPABASE_ANON_KEY` (not `SUPABASE_ANON_KEY`)

The `VITE_` prefix is required for Vite to expose these variables to the client-side code.

---

**Need Help?** Check the [Supabase Documentation](https://supabase.com/docs) or open an issue in your repository.


