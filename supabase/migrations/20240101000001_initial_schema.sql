-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户扩展表
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  default_llm TEXT DEFAULT 'openai',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 会议表
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  meeting_type TEXT CHECK (meeting_type IN ('project_review', 'client_visit', 'weekly_standup', 'other')),
  scheduled_at TIMESTAMPTZ,
  duration_min INT DEFAULT 90,
  location TEXT,
  attendees TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 会议材料表
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT,
  file_size BIGINT,
  version INT DEFAULT 1,
  uploaded_by UUID REFERENCES auth.users,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 会议议程项表
CREATE TABLE agenda_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  duration_min INT DEFAULT 15,
  sort_order INT DEFAULT 0,
  suggested_by_ai BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 会议纪要表
CREATE TABLE minutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings UNIQUE NOT NULL,
  raw_transcript TEXT,
  structured_content JSONB DEFAULT '{}',
  audio_url TEXT,
  generated_by_ai BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 待办事项表
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  assignee TEXT,
  due_date DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done')),
  external_link TEXT,
  external_platform TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_meetings_user_id ON meetings(user_id);
CREATE INDEX idx_meetings_scheduled_at ON meetings(scheduled_at);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_type ON meetings(meeting_type);
CREATE INDEX idx_materials_meeting_id ON materials(meeting_id);
CREATE INDEX idx_agenda_items_meeting_id ON agenda_items(meeting_id);
CREATE INDEX idx_agenda_items_sort_order ON agenda_items(sort_order);
CREATE INDEX idx_todos_meeting_id ON todos(meeting_id);
CREATE INDEX idx_todos_status ON todos(status);
CREATE INDEX idx_todos_assignee ON todos(assignee);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_minutes_updated_at
  BEFORE UPDATE ON minutes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 启用 RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE minutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own meetings" ON meetings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own meetings" ON meetings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meetings" ON meetings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meetings" ON meetings
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view meeting materials" ON materials
  FOR SELECT USING (
    meeting_id IN (SELECT id FROM meetings WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage meeting materials" ON materials
  FOR ALL USING (
    meeting_id IN (SELECT id FROM meetings WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view agenda items" ON agenda_items
  FOR SELECT USING (
    meeting_id IN (SELECT id FROM meetings WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage agenda items" ON agenda_items
  FOR ALL USING (
    meeting_id IN (SELECT id FROM meetings WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view minutes" ON minutes
  FOR SELECT USING (
    meeting_id IN (SELECT id FROM meetings WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage minutes" ON minutes
  FOR ALL USING (
    meeting_id IN (SELECT id FROM meetings WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view todos" ON todos
  FOR SELECT USING (
    meeting_id IN (SELECT id FROM meetings WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage todos" ON todos
  FOR ALL USING (
    meeting_id IN (SELECT id FROM meetings WHERE user_id = auth.uid())
  );

-- 创建用户注册时自动创建 profile 的触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
