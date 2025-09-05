import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database schema setup functions
export const initializeDatabase = async () => {
  try {
    // Create users table (extends Supabase auth.users)
    const { error: usersError } = await supabase.rpc('create_users_table');
    if (usersError && !usersError.message.includes('already exists')) {
      console.error('Error creating users table:', usersError);
    }

    // Create rights_guides table
    const { error: rightsError } = await supabase.rpc('create_rights_guides_table');
    if (rightsError && !rightsError.message.includes('already exists')) {
      console.error('Error creating rights_guides table:', rightsError);
    }

    // Create scripts table
    const { error: scriptsError } = await supabase.rpc('create_scripts_table');
    if (scriptsError && !scriptsError.message.includes('already exists')) {
      console.error('Error creating scripts table:', scriptsError);
    }

    // Create recordings table
    const { error: recordingsError } = await supabase.rpc('create_recordings_table');
    if (recordingsError && !recordingsError.message.includes('already exists')) {
      console.error('Error creating recordings table:', recordingsError);
    }

    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// SQL functions for database setup (to be run in Supabase SQL editor)
export const DATABASE_SETUP_SQL = `
-- Create users profile table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  state TEXT,
  subscription_status TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rights_guides table
CREATE TABLE IF NOT EXISTS public.rights_guides (
  guide_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  state TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scripts table
CREATE TABLE IF NOT EXISTS public.scripts (
  script_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  language TEXT NOT NULL DEFAULT 'en',
  scenario TEXT NOT NULL,
  script_text TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recordings table
CREATE TABLE IF NOT EXISTS public.recordings (
  recording_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  file_path TEXT,
  ipfs_hash TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration INTEGER,
  type TEXT DEFAULT 'audio',
  metadata JSONB
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own recordings" ON public.recordings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recordings" ON public.recordings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rights_guides_state ON public.rights_guides(state);
CREATE INDEX IF NOT EXISTS idx_scripts_scenario ON public.scripts(scenario);
CREATE INDEX IF NOT EXISTS idx_recordings_user_id ON public.recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_recordings_timestamp ON public.recordings(timestamp);

-- Insert sample data
INSERT INTO public.rights_guides (state, title, content) VALUES
('California', 'California Police Interaction Rights', 
'**Your Rights in California:**
• You have the right to remain silent
• You can refuse searches of your person, car, or home without a warrant
• You have the right to record police interactions in public
• You can ask "Am I free to leave?"
• If arrested, you have the right to an attorney

**Key Points:**
• California requires consent for vehicle searches (except specific circumstances)
• You must provide ID if driving, but not as a pedestrian
• Recording police is protected under CA law when not interfering

**Relevant Statutes:**
• CA Penal Code § 148.6 (False reports)
• CA Vehicle Code § 12951 (License requirements)
• 1st Amendment protections for recording'),

('Texas', 'Texas Police Interaction Rights',
'**Your Rights in Texas:**
• You have the right to remain silent
• You can refuse searches without a warrant
• You can record police in public spaces
• You must identify yourself if lawfully arrested
• You have the right to an attorney

**Key Points:**
• Texas has "Stop and Identify" laws - must provide name if lawfully detained
• Vehicle searches require consent or probable cause
• Open carry is legal with proper licensing

**Relevant Statutes:**
• TX Penal Code § 38.02 (Failure to Identify)
• TX Code of Criminal Procedure Art. 14.03 (Arrest without warrant)
• 1st Amendment protections for recording')

ON CONFLICT (state) DO NOTHING;

INSERT INTO public.scripts (scenario, script_text, language, type) VALUES
('traffic_stop', 
'Good day, officer. I understand you''ve stopped me for a traffic matter. I want to be respectful and cooperative while exercising my constitutional rights.

I''m informing you that I will be recording this interaction for both of our protection, which is my legal right.

My hands are visible and I will move slowly. If you need me to reach for documents, please let me know when it''s safe to do so.

Am I free to leave, or am I being detained? If I''m being detained, could you please tell me the specific reason?', 
'en', 'standard'),

('pedestrian_stop',
'Hello, officer. I want to be respectful and cooperative.

I''m exercising my right to record this interaction for documentation purposes.

Could you please tell me why I''m being stopped? Am I free to leave?

I prefer to exercise my right to remain silent beyond identifying myself as required by law. I do not consent to any searches of my person or belongings.

If you''re detaining me, I''d like to know the specific reasonable suspicion or probable cause.',
'en', 'standard')

ON CONFLICT DO NOTHING;
`;
