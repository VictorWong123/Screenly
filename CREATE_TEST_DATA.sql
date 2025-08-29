-- Create Test User and Sample Data
-- This will let you test the app immediately without waiting

-- 1. Create a test user in auth.users (you'll need to do this manually in Supabase Auth)
-- Go to Authentication > Users > Add User
-- Email: test@gmail.com
-- Password: password
-- Set email_confirmed_at to NOW() to make them confirmed

-- 2. Insert user profile (run this after creating the auth user)
INSERT INTO public.user_profiles (id, username, email, display_name, avatar_url, created_at, updated_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'test@gmail.com'),
  'testuser',
  'test@gmail.com',
  'Test User',
  'https://ui-avatars.com/api/?name=Test+User&background=3B82F6&color=fff',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  email = EXCLUDED.email,
  display_name = EXCLUDED.display_name,
  avatar_url = EXCLUDED.avatar_url,
  updated_at = NOW();

-- 3. Create sample activities
INSERT INTO public.activities (user_id, name, category, color, created_at, updated_at)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'test@gmail.com'),
  name,
  category,
  color,
  NOW(),
  NOW()
FROM (VALUES
  ('Work', 'Productivity', '#3B82F6'),
  ('Study', 'Learning', '#10B981'),
  ('Exercise', 'Health', '#F59E0B'),
  ('Personal', 'Personal', '#8B5CF6'),
  ('Reading', 'Learning', '#EF4444'),
  ('Coding', 'Productivity', '#06B6D4')
) AS v(name, category, color)
ON CONFLICT (user_id, name) DO NOTHING;

-- 4. Create sample timer sessions for the last 7 days
-- This will populate your dashboard with realistic data

-- Get the user ID and activity IDs
DO $$
DECLARE
    test_user_id UUID;
    work_activity_id UUID;
    study_activity_id UUID;
    exercise_activity_id UUID;
    personal_activity_id UUID;
    reading_activity_id UUID;
    coding_activity_id UUID;
    session_date DATE;
    session_start TIMESTAMP WITH TIME ZONE;
    session_end TIMESTAMP WITH TIME ZONE;
    duration_minutes INTEGER;
BEGIN
    -- Get user ID
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'test@gmail.com';
    
    -- Get activity IDs
    SELECT id INTO work_activity_id FROM public.activities WHERE user_id = test_user_id AND name = 'Work';
    SELECT id INTO study_activity_id FROM public.activities WHERE user_id = test_user_id AND name = 'Study';
    SELECT id INTO exercise_activity_id FROM public.activities WHERE user_id = test_user_id AND name = 'Exercise';
    SELECT id INTO personal_activity_id FROM public.activities WHERE user_id = test_user_id AND name = 'Personal';
    SELECT id INTO reading_activity_id FROM public.activities WHERE user_id = test_user_id AND name = 'Reading';
    SELECT id INTO coding_activity_id FROM public.activities WHERE user_id = test_user_id AND name = 'Coding';
    
    -- Generate sessions for the last 7 days
    FOR i IN 0..6 LOOP
        session_date := CURRENT_DATE - i;
        
        -- Work session (morning)
        session_start := session_date + INTERVAL '9 hours';
        session_end := session_start + INTERVAL '4 hours';
        duration_minutes := 240;
        
        INSERT INTO public.timer_sessions (user_id, activity_id, started_at, ended_at, duration_minutes, created_at)
        VALUES (test_user_id, work_activity_id, session_start, session_end, duration_minutes, NOW());
        
        -- Study session (afternoon)
        session_start := session_date + INTERVAL '14 hours';
        session_end := session_start + INTERVAL '2 hours';
        duration_minutes := 120;
        
        INSERT INTO public.timer_sessions (user_id, activity_id, started_at, ended_at, duration_minutes, created_at)
        VALUES (test_user_id, study_activity_id, session_start, session_end, duration_minutes, NOW());
        
        -- Exercise session (evening)
        session_start := session_date + INTERVAL '18 hours';
        session_end := session_start + INTERVAL '1 hour';
        duration_minutes := 60;
        
        INSERT INTO public.timer_sessions (user_id, activity_id, started_at, ended_at, duration_minutes, created_at)
        VALUES (test_user_id, exercise_activity_id, session_start, session_end, duration_minutes, NOW());
        
        -- Personal time (random)
        session_start := session_date + INTERVAL '20 hours';
        session_end := session_start + INTERVAL '30 minutes';
        duration_minutes := 30;
        
        INSERT INTO public.timer_sessions (user_id, activity_id, started_at, ended_at, duration_minutes, created_at)
        VALUES (test_user_id, personal_activity_id, session_start, session_end, duration_minutes, NOW());
        
        -- Add some variety - coding on weekdays, reading on weekends
        IF EXTRACT(DOW FROM session_date) < 6 THEN
            -- Weekday: Coding session
            session_start := session_date + INTERVAL '16 hours';
            session_end := session_start + INTERVAL '1.5 hours';
            duration_minutes := 90;
            
            INSERT INTO public.timer_sessions (user_id, activity_id, started_at, ended_at, duration_minutes, created_at)
            VALUES (test_user_id, coding_activity_id, session_start, session_end, duration_minutes, NOW());
        ELSE
            -- Weekend: Reading session
            session_start := session_date + INTERVAL '15 hours';
            session_end := session_start + INTERVAL '2 hours';
            duration_minutes := 120;
            
            INSERT INTO public.timer_sessions (user_id, activity_id, started_at, ended_at, duration_minutes, created_at)
            VALUES (test_user_id, reading_activity_id, session_start, session_end, duration_minutes, NOW());
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Test data created successfully for user %', test_user_id;
END $$;

-- 5. Verify the data was created
SELECT 
    'Activities' as table_name,
    COUNT(*) as record_count
FROM public.activities 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@gmail.com')

UNION ALL

SELECT 
    'Timer Sessions' as table_name,
    COUNT(*) as record_count
FROM public.timer_sessions 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@gmail.com')

UNION ALL

SELECT 
    'User Profile' as table_name,
    COUNT(*) as record_count
FROM public.user_profiles 
WHERE email = 'test@gmail.com';
