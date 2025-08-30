-- Create Dummy Users for Leaderboard Testing (FIXED VERSION)
-- This script permanently removes the foreign key constraint to allow dummy users

-- Step 1: Permanently remove the foreign key constraint
-- This allows us to create dummy users without auth.users references
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- Step 2: Create 50 dummy users
INSERT INTO user_profiles (id, username, email)
SELECT 
  gen_random_uuid() as id,
  username,
  username || '@example.com' as email
FROM (
  SELECT unnest(ARRAY[
    'alex_dev', 'sarah_coder', 'mike_tech', 'jess_web', 'dave_ai', 'lisa_data',
    'tom_cloud', 'anna_ux', 'chris_mobile', 'emma_fullstack', 'ryan_backend',
    'sophia_frontend', 'jake_devops', 'maya_qa', 'kevin_architect', 'nina_lead',
    'pete_senior', 'zoe_junior', 'sam_consultant', 'lucy_freelance', 'max_startup',
    'ava_corp', 'leo_agency', 'mia_indie', 'noah_remote', 'isla_contractor',
    'felix_entrepreneur', 'luna_creator', 'axel_hacker', 'nova_designer',
    'kai_engineer', 'skye_analyst', 'river_consultant', 'storm_developer',
    'blaze_coder', 'frost_architect', 'thunder_lead', 'lightning_senior',
    'rain_developer', 'snow_engineer', 'fire_coder', 'ice_analyst',
    'wind_designer', 'earth_consultant', 'water_developer', 'sun_architect',
    'moon_engineer', 'star_coder', 'galaxy_analyst', 'cosmos_designer',
    'tech_wizard', 'code_ninja', 'data_guru', 'cloud_master', 'ai_expert'
  ]) AS username
) AS usernames
ORDER BY random() 
LIMIT 50
ON CONFLICT (id) DO NOTHING;

-- Step 3: Create activities for all users
INSERT INTO activities (id, name, category, color, user_id)
SELECT 
  gen_random_uuid() as id,
  name,
  CASE 
    WHEN name = 'Work' THEN 'Productivity'
    WHEN name = 'Study' THEN 'Learning'
    WHEN name = 'Exercise' THEN 'Health'
    WHEN name = 'Personal' THEN 'Personal'
    WHEN name = 'Coding' THEN 'Development'
    WHEN name = 'Reading' THEN 'Learning'
    WHEN name = 'Gaming' THEN 'Entertainment'
    WHEN name = 'Social Media' THEN 'Communication'
  END as category,
  CASE 
    WHEN name = 'Work' THEN '#3B82F6'
    WHEN name = 'Study' THEN '#10B981'
    WHEN name = 'Exercise' THEN '#F59E0B'
    WHEN name = 'Personal' THEN '#8B5CF6'
    WHEN name = 'Coding' THEN '#EF4444'
    WHEN name = 'Reading' THEN '#06B6D4'
    WHEN name = 'Gaming' THEN '#84CC16'
    WHEN name = 'Social Media' THEN '#F97316'
  END as color,
  up.id as user_id
FROM (
  SELECT unnest(ARRAY[
    'Work', 'Study', 'Exercise', 'Personal', 'Coding', 'Reading', 'Gaming', 'Social Media'
  ]) AS name
) AS sample_activities
CROSS JOIN user_profiles up
ON CONFLICT DO NOTHING;

-- Step 4: Generate timer sessions for all users
DO $$
DECLARE
    user_record RECORD;
    activity_id UUID;
    session_date DATE;
    session_hour INTEGER;
    session_minute INTEGER;
    duration_minutes INTEGER;
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    session_count INTEGER;
BEGIN
    -- Loop through each user
    FOR user_record IN SELECT id FROM user_profiles LOOP
        -- Generate 1-4 sessions per day for the last 7 days
        FOR session_date IN SELECT generate_series(
            CURRENT_DATE - INTERVAL '6 days', 
            CURRENT_DATE, 
            '1 day'::interval
        )::date LOOP
            
            session_count := floor(random() * 4) + 1; -- 1-4 sessions per day
            
            FOR i IN 1..session_count LOOP
                -- Random activity for this user
                SELECT id INTO activity_id 
                FROM activities 
                WHERE user_id = user_record.id 
                ORDER BY random() 
                LIMIT 1;
                
                -- If no activities exist for this user, skip
                IF activity_id IS NULL THEN
                    CONTINUE;
                END IF;
                
                -- Random duration between 15 minutes and 4 hours
                duration_minutes := floor(random() * 225) + 15;
                
                -- Random start time during the day (6 AM to 6 PM)
                session_hour := floor(random() * 12) + 6;
                session_minute := floor(random() * 60);
                
                start_time := session_date + (session_hour || ' hours ' || session_minute || ' minutes')::interval;
                end_time := start_time + (duration_minutes || ' minutes')::interval;
                
                -- Insert the session
                INSERT INTO timer_sessions (
                    user_id, 
                    activity_id, 
                    started_at, 
                    ended_at, 
                    duration_minutes
                ) VALUES (
                    user_record.id,
                    activity_id,
                    start_time,
                    end_time,
                    duration_minutes
                );
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- Step 5: Show final statistics
SELECT 
    'Dummy Users Created Successfully!' as status,
    (SELECT COUNT(*) FROM user_profiles) as total_users,
    (SELECT COUNT(*) FROM activities) as total_activities,
    (SELECT COUNT(*) FROM timer_sessions) as total_sessions,
    (SELECT ROUND(AVG(duration_minutes) / 60, 2) FROM timer_sessions) as avg_session_hours,
    (SELECT ROUND(SUM(duration_minutes) / 60, 2) FROM timer_sessions) as total_hours_tracked;

-- Step 6: Show sample of created users
SELECT 
    username,
    email,
    (SELECT COUNT(*) FROM timer_sessions WHERE user_id = up.id) as session_count,
    (SELECT ROUND(SUM(duration_minutes) / 60, 2) FROM timer_sessions WHERE user_id = up.id) as total_hours
FROM user_profiles up
ORDER BY username
LIMIT 10;

-- NOTE: The foreign key constraint has been permanently removed
-- This allows you to create dummy users for testing purposes
-- If you want to restore it later, run:
-- ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id);
