-- ============================================
-- Row Level Security (RLS) 策略完善
-- 用户只能访问自己的数据
-- ============================================

-- 确保所有表已启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE minutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- profiles 表 RLS 策略
-- ============================================

-- 删除已有策略（如果存在）
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- 用户只能查看自己的 profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 用户只能更新自己的 profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 用户只能插入自己的 profile（通常由触发器处理，但保留以防手动插入）
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- meetings 表 RLS 策略
-- ============================================

DROP POLICY IF EXISTS "Users can view own meetings" ON meetings;
DROP POLICY IF EXISTS "Users can create own meetings" ON meetings;
DROP POLICY IF EXISTS "Users can update own meetings" ON meetings;
DROP POLICY IF EXISTS "Users can delete own meetings" ON meetings;

-- 用户只能查看自己创建的会议
CREATE POLICY "Users can view own meetings"
  ON meetings FOR SELECT
  USING (auth.uid() = user_id);

-- 用户只能创建以自己为 user_id 的会议
CREATE POLICY "Users can create own meetings"
  ON meetings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己创建的会议
CREATE POLICY "Users can update own meetings"
  ON meetings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 用户只能删除自己创建的会议
CREATE POLICY "Users can delete own meetings"
  ON meetings FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- materials 表 RLS 策略
-- 通过关联的 meetings 表进行权限控制
-- ============================================

DROP POLICY IF EXISTS "Users can view meeting materials" ON materials;
DROP POLICY IF EXISTS "Users can create meeting materials" ON materials;
DROP POLICY IF EXISTS "Users can update meeting materials" ON materials;
DROP POLICY IF EXISTS "Users can delete meeting materials" ON materials;

-- 用户只能查看属于自己会议的材料
CREATE POLICY "Users can view meeting materials"
  ON materials FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = materials.meeting_id
        AND meetings.user_id = auth.uid()
    )
  );

-- 用户只能为属于自己的会议创建材料
CREATE POLICY "Users can create meeting materials"
  ON materials FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = materials.meeting_id
        AND meetings.user_id = auth.uid()
    )
  );

-- 用户只能更新属于自己会议的材料
CREATE POLICY "Users can update meeting materials"
  ON materials FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = materials.meeting_id
        AND meetings.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = materials.meeting_id
        AND meetings.user_id = auth.uid()
    )
  );

-- 用户只能删除属于自己会议的材料
CREATE POLICY "Users can delete meeting materials"
  ON materials FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = materials.meeting_id
        AND meetings.user_id = auth.uid()
    )
  );

-- ============================================
-- agenda_items 表 RLS 策略
-- 通过关联的 meetings 表进行权限控制
-- ============================================

DROP POLICY IF EXISTS "Users can view agenda items" ON agenda_items;
DROP POLICY IF EXISTS "Users can create agenda items" ON agenda_items;
DROP POLICY IF EXISTS "Users can update agenda items" ON agenda_items;
DROP POLICY IF EXISTS "Users can delete agenda items" ON agenda_items;

-- 查看
CREATE POLICY "Users can view agenda items"
  ON agenda_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = agenda_items.meeting_id
        AND meetings.user_id = auth.uid()
    )
  );

-- 创建
CREATE POLICY "Users can create agenda items"
  ON agenda_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = agenda_items.meeting_id
        AND meetings.user_id = auth.uid()
    )
  );

-- 更新
CREATE POLICY "Users can update agenda items"
  ON agenda_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = agenda_items.meeting_id
        AND meetings.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = agenda_items.meeting_id
        AND meetings.user_id = auth.uid()
    )
  );

-- 删除
CREATE POLICY "Users can delete agenda items"
  ON agenda_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = agenda_items.meeting_id
        AND meetings.user_id = auth.uid()
    )
  );

-- ============================================
-- minutes 表 RLS 策略
-- 通过关联的 meetings 表进行权限控制
-- ============================================

DROP POLICY IF EXISTS "Users can view minutes" ON minutes;
DROP POLICY IF EXISTS "Users can create minutes" ON minutes;
DROP POLICY IF EXISTS "Users can update minutes" ON minutes;
DROP POLICY IF EXISTS "Users can delete minutes" ON minutes;

-- 查看
CREATE POLICY "Users can view minutes"
  ON minutes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = minutes.meeting_id
        AND meetings.user_id = auth.uid()
    )
  );

-- 创建
CREATE POLICY "Users can create minutes"
  ON minutes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = minutes.meeting_id
        AND meetings.user_id = auth.uid()
    )
  );

-- 更新
CREATE POLICY "Users can update minutes"
  ON minutes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = minutes.meeting_id
        AND meetings.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = minutes.meeting_id
        AND meetings.user_id = auth.uid()
    )
  );

-- 删除
CREATE POLICY "Users can delete minutes"
  ON minutes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = minutes.meeting_id
        AND meetings.user_id = auth.uid()
    )
  );

-- ============================================
-- todos 表 RLS 策略
-- 通过关联的 meetings 表进行权限控制
-- ============================================

DROP POLICY IF EXISTS "Users can view todos" ON todos;
DROP POLICY IF EXISTS "Users can create todos" ON todos;
DROP POLICY IF EXISTS "Users can update todos" ON todos;
DROP POLICY IF EXISTS "Users can delete todos" ON todos;

-- 查看
CREATE POLICY "Users can view todos"
  ON todos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = todos.meeting_id
        AND meetings.user_id = auth.uid()
    )
  );

-- 创建
CREATE POLICY "Users can create todos"
  ON todos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = todos.meeting_id
        AND meetings.user_id = auth.uid()
    )
  );

-- 更新
CREATE POLICY "Users can update todos"
  ON todos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = todos.meeting_id
        AND meetings.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = todos.meeting_id
        AND meetings.user_id = auth.uid()
    )
  );

-- 删除
CREATE POLICY "Users can delete todos"
  ON todos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = todos.meeting_id
        AND meetings.user_id = auth.uid()
    )
  );

-- ============================================
-- 说明：
-- 1. 所有策略基于 auth.uid()（当前登录用户的 JWT 中的用户ID）
-- 2. meetings 表直接通过 user_id 字段控制
-- 3. materials/agenda_items/minutes/todos 通过关联 meetings 表的 user_id 间接控制
-- 4. 每个表都有独立的 SELECT/INSERT/UPDATE/DELETE 策略，遵循最小权限原则
-- 5. 使用 EXISTS 子查询比 IN 子查询性能更好，且语义更清晰
-- ============================================
