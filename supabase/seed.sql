-- 数据库种子数据（演示用）
-- 注意：此脚本需要在 Supabase 控制台 SQL 编辑器中执行

-- 创建演示用户（需要在 Supabase Auth 中手动创建或使用 API）
-- 这里假设用户 ID 为 'demo-user-001'

-- profiles 表数据
INSERT INTO profiles (id, full_name, avatar_url, default_llm) VALUES
  ('demo-user-001', '演示用户', 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo', 'openai');

-- meetings 表数据
INSERT INTO meetings (id, user_id, title, meeting_type, scheduled_at, duration_min, location, attendees, status, tags) VALUES
  ('meeting-001', 'demo-user-001', 'Q2 产品路线图评审', 'project_review', '2026-05-20 14:00:00+08', 120, 'https://zoom.us/j/1234567890', ARRAY['张三', '李四', '王五'], 'upcoming', ARRAY['产品', '季度规划']),
  ('meeting-002', 'demo-user-001', '客户需求沟通 - 华润集团', 'client_visit', '2026-05-18 10:00:00+08', 90, '华润大厦 A座 28层', ARRAY['赵六', '孙七', '客户代表'], 'upcoming', ARRAY['客户', '需求']),
  ('meeting-003', 'demo-user-001', '技术团队周例会', 'weekly_standup', '2026-05-19 09:30:00+08', 60, 'https://meet.google.com/abc-defg-hij', ARRAY['技术团队全体成员'], 'upcoming', ARRAY['周会', '技术']),
  ('meeting-004', 'demo-user-001', 'AI 功能技术方案评审', 'project_review', '2026-05-15 15:00:00+08', 120, '会议室 302', ARRAY['技术负责人', '产品经理', '架构师'], 'completed', ARRAY['AI', '技术方案']),
  ('meeting-005', 'demo-user-001', '与字节跳动商务洽谈', 'client_visit', '2026-05-10 14:00:00+08', 90, '字节跳动总部', ARRAY['商务总监', '销售经理'], 'completed', ARRAY['商务', '大客户']),
  ('meeting-006', 'demo-user-001', '设计团队周例会', 'weekly_standup', '2026-05-12 10:00:00+08', 45, '设计区讨论室', ARRAY['UI设计师', 'UX研究员'], 'completed', ARRAY['设计', '周会']);

-- agenda_items 表数据
INSERT INTO agenda_items (meeting_id, content, sort_order, suggested_by_ai) VALUES
  ('meeting-001', 'Q1 回顾与数据总结', 1, false),
  ('meeting-001', 'Q2 核心功能规划讨论', 2, true),
  ('meeting-001', '资源分配与排期确认', 3, true),
  ('meeting-001', '风险评估与应对策略', 4, true),
  ('meeting-002', '客户现有系统调研', 1, false),
  ('meeting-002', '核心需求梳理与确认', 2, true),
  ('meeting-002', '技术方案初步沟通', 3, true),
  ('meeting-002', '商务条款与报价讨论', 4, false),
  ('meeting-003', '上周任务完成情况', 1, false),
  ('meeting-003', '本周工作计划', 2, false),
  ('meeting-003', '技术难点与阻塞项', 3, true),
  ('meeting-003', '代码审查规范更新', 4, true);

-- materials 表数据
INSERT INTO materials (meeting_id, file_name, file_url, file_type, file_size, version) VALUES
  ('meeting-001', 'Q2_产品路线图_v1.pdf', 'https://placeholder.supabase.co/storage/v1/object/public/materials/Q2_roadmap_v1.pdf', 'application/pdf', 2048000, 1),
  ('meeting-001', 'Q2_产品路线图_v2.pdf', 'https://placeholder.supabase.co/storage/v1/object/public/materials/Q2_roadmap_v2.pdf', 'application/pdf', 2150000, 2),
  ('meeting-001', '竞品分析报告.pptx', 'https://placeholder.supabase.co/storage/v1/object/public/materials/competitor_analysis.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 5120000, 1),
  ('meeting-002', '华润集团_需求文档_v1.docx', 'https://placeholder.supabase.co/storage/v1/object/public/materials/huarun_requirements_v1.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 1536000, 1),
  ('meeting-004', 'AI_技术方案_初稿.pdf', 'https://placeholder.supabase.co/storage/v1/object/public/materials/ai_tech_proposal_v1.pdf', 'application/pdf', 3072000, 1);

-- minutes 表数据
INSERT INTO minutes (meeting_id, raw_transcript, structured_content, generated_by_ai) VALUES
  ('meeting-004', '今天我们讨论了AI功能的技术实现方案...', 
   '{"summary": "本次会议确定了AI功能的技术实现路线，决定采用OpenAI GPT-4o作为核心模型，Whisper API用于语音转文字。", "decisions": ["采用GPT-4o作为核心AI模型", "使用Whisper API进行语音转录", "优先开发会议纪要生成功能"], "todos": [{"task": "完成OpenAI API集成", "assignee": "后端负责人", "deadline": "2026-05-22"}, {"task": "设计AI交互界面", "assignee": "UI设计师", "deadline": "2026-05-25"}], "issues": ["API调用成本需要评估", "数据隐私合规需要法务审核"]}'::jsonb, 
   true),
  ('meeting-005', '与字节跳动的商务洽谈进展顺利...',
   '{"summary": "与字节跳动就企业版合作达成初步意向，对方对我们的AI会议纪要功能表示浓厚兴趣。", "decisions": ["提供企业版试用账号", "定制开发部分功能", "签订年度合作协议"], "todos": [{"task": "准备企业版演示环境", "assignee": "销售经理", "deadline": "2026-05-17"}, {"task": "起草合作协议", "assignee": "法务", "deadline": "2026-05-20"}], "issues": ["定制化开发周期需要评估", "价格体系需要重新制定"]}'::jsonb,
   true);

-- todos 表数据
INSERT INTO todos (meeting_id, content, assignee, due_date, priority, status) VALUES
  ('meeting-004', '完成OpenAI API集成开发', '后端负责人', '2026-05-22', 'high', 'in_progress'),
  ('meeting-004', '设计AI交互界面原型', 'UI设计师', '2026-05-25', 'high', 'pending'),
  ('meeting-004', '评估API调用成本并制定预算', '项目经理', '2026-05-20', 'medium', 'pending'),
  ('meeting-005', '准备企业版演示环境', '销售经理', '2026-05-17', 'high', 'done'),
  ('meeting-005', '起草年度合作协议', '法务', '2026-05-20', 'medium', 'in_progress'),
  ('meeting-005', '制定企业版价格体系', '商务总监', '2026-05-18', 'high', 'pending'),
  ('meeting-001', '更新Q2产品路线图', '产品经理', '2026-05-19', 'high', 'pending'),
  ('meeting-001', '确认开发资源分配', '项目经理', '2026-05-19', 'medium', 'pending');
