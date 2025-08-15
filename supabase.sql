-- Enable RLS
ALTER DATABASE postgres SET timezone TO 'UTC';

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_emoji TEXT DEFAULT '👤',
  region TEXT DEFAULT 'ZW',
  points INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::JSONB,
  alert_preferences JSONB DEFAULT '{
    "ph_min": 6.5,
    "ph_max": 8.5,
    "turbidity_max": 5.0,
    "dissolved_oxygen_min": 5.0,
    "alert_radius": 5.0
  }'::JSONB,
  feature_flags JSONB DEFAULT '{
    "gamification": true,
    "community": true,
    "animated_charts": true,
    "heatmap": true,
    "crazy_demo": false,
    "use_cloud_backend": true
  }'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sensor_readings table
CREATE TABLE IF NOT EXISTS sensor_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  temperature DECIMAL(4,1) NOT NULL,
  ph_level DECIMAL(3,1) NOT NULL,
  dissolved_oxygen DECIMAL(4,1) NOT NULL,
  turbidity DECIMAL(5,2) NOT NULL,
  e_coli INTEGER DEFAULT 0,
  total_coliform INTEGER DEFAULT 0,
  bacteria_atp INTEGER DEFAULT 0,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  location_name TEXT DEFAULT 'Lake Chivero',
  is_anomaly BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  images JSON DEFAULT '[]'::JSON,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'resolved', 'closed')),
  verifications JSONB DEFAULT '[]'::JSONB,
  reactions JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  correct INTEGER NOT NULL,
  total INTEGER NOT NULL,
  questions_answered JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create storage bucket for report images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('reports', 'reports', true)
ON CONFLICT DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read/update only their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Sensor readings: Public read access
CREATE POLICY "Public read access" ON sensor_readings
  FOR SELECT USING (true);

-- Reports: Public read, authenticated users can create
CREATE POLICY "Public read access" ON reports
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reports" ON reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports" ON reports
  FOR UPDATE USING (auth.uid() = user_id);

-- Quiz attempts: Users can read/write their own attempts
CREATE POLICY "Users can manage own quiz attempts" ON quiz_attempts
  FOR ALL USING (auth.uid() = user_id);

-- Storage policies for report images
CREATE POLICY "Public read access" ON storage.objects FOR SELECT
  USING (bucket_id = 'reports');

CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'reports');

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed data for development
INSERT INTO sensor_readings (timestamp, temperature, ph_level, dissolved_oxygen, turbidity, latitude, longitude, location_name, is_anomaly) VALUES
  (NOW() - INTERVAL '1 hour', 24.5, 7.2, 8.1, 3.2, -17.8292, 31.0522, 'Lake Chivero', false),
  (NOW() - INTERVAL '2 hours', 25.1, 7.0, 7.8, 3.8, -17.8295, 31.0525, 'Lake Chivero', false),
  (NOW() - INTERVAL '3 hours', 26.2, 6.8, 7.5, 4.1, -17.8288, 31.0519, 'Lake Chivero', false),
  (NOW() - INTERVAL '4 hours', 23.8, 7.5, 8.2, 2.9, -17.8290, 31.0520, 'Lake Chivero', false),
  (NOW() - INTERVAL '5 hours', 22.1, 6.2, 6.8, 7.2, -17.8298, 31.0528, 'Lake Chivero', true),
  (NOW() - INTERVAL '6 hours', 24.8, 7.1, 8.0, 3.5, -17.8285, 31.0515, 'Lake Chivero', false),
  (NOW() - INTERVAL '12 hours', 26.5, 7.3, 7.9, 3.1, -17.8294, 31.0523, 'Lake Chivero', false),
  (NOW() - INTERVAL '24 hours', 25.3, 7.0, 8.1, 3.7, -17.8291, 31.0521, 'Lake Chivero', false)
ON CONFLICT DO NOTHING;