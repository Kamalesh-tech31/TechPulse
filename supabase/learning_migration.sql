-- 1. Create table for lesson completion
CREATE TABLE IF NOT EXISTS lesson_completion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id VARCHAR(50) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, lesson_id)
);

-- 2. Create table for quiz results
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id INTEGER NOT NULL,
  highest_score INTEGER NOT NULL,
  passed BOOLEAN DEFAULT FALSE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, module_id)
);

-- 3. Create table for overall learning progress
CREATE TABLE IF NOT EXISTS user_learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_lessons INTEGER DEFAULT 0 NOT NULL,
  progress_percentage INTEGER DEFAULT 0 NOT NULL,
  final_assessment_passed BOOLEAN DEFAULT FALSE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Alter table user_learning_progress to add new columns if they do not exist
ALTER TABLE user_learning_progress ADD COLUMN IF NOT EXISTS completed_lessons INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE user_learning_progress ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0 NOT NULL;