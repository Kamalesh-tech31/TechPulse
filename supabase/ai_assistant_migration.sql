CREATE TABLE IF NOT EXISTS ai_assistant_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id VARCHAR(100) NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  referenced_stocks TEXT[] DEFAULT '{}',
  portfolio_snapshot JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for querying per-user chat sessions quickly
CREATE INDEX IF NOT EXISTS idx_ai_records_user_session ON ai_assistant_records (user_id, conversation_id);

-- Enable RLS
ALTER TABLE ai_assistant_records ENABLE ROW LEVEL SECURITY;

-- SELECT policy
CREATE POLICY select_own_ai_records ON ai_assistant_records
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- INSERT policy
CREATE POLICY insert_own_ai_records ON ai_assistant_records
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE policy
CREATE POLICY update_own_ai_records ON ai_assistant_records
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- DELETE policy
CREATE POLICY delete_own_ai_records ON ai_assistant_records
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);