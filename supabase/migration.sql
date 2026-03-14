-- ============================================
-- AgentFi Supabase Database Schema
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard → SQL Editor
-- ============================================

-- 1. Agents Table
CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id TEXT NOT NULL UNIQUE,
  owner_address TEXT NOT NULL,
  name TEXT NOT NULL,
  strategy TEXT NOT NULL DEFAULT 'balanced',
  max_position_size NUMERIC NOT NULL DEFAULT 0,
  public_key TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'idle')),
  reputation INTEGER NOT NULL DEFAULT 500,
  earnings NUMERIC NOT NULL DEFAULT 0,
  actions_count INTEGER NOT NULL DEFAULT 0,
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agents_owner ON agents(owner_address);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);

-- 2. Commit Actions Table
CREATE TABLE IF NOT EXISTS commit_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id TEXT NOT NULL,
  commit_id TEXT NOT NULL UNIQUE,
  commit_hash TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT '',
  protocol TEXT NOT NULL DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0,
  salt TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'committed' CHECK (status IN ('committed', 'revealed', 'executed')),
  commit_tx_hash TEXT,
  reveal_tx_hash TEXT,
  commit_block INTEGER,
  owner_address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commits_owner ON commit_actions(owner_address);
CREATE INDEX IF NOT EXISTS idx_commits_agent ON commit_actions(agent_id);
CREATE INDEX IF NOT EXISTS idx_commits_status ON commit_actions(status);

-- 3. Reward Claims Table
CREATE TABLE IF NOT EXISTS reward_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_address TEXT NOT NULL,
  amount TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claims_owner ON reward_claims(owner_address);

-- 4. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_address TEXT NOT NULL,
  action_type TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  tx_hash TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_owner ON activity_logs(owner_address);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_logs(created_at DESC);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE commit_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies — allow public read/write via anon key
-- (For production, restrict writes to authenticated users only)
CREATE POLICY "Allow public read agents" ON agents FOR SELECT USING (true);
CREATE POLICY "Allow public insert agents" ON agents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update agents" ON agents FOR UPDATE USING (true);

CREATE POLICY "Allow public read commits" ON commit_actions FOR SELECT USING (true);
CREATE POLICY "Allow public insert commits" ON commit_actions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update commits" ON commit_actions FOR UPDATE USING (true);

CREATE POLICY "Allow public read claims" ON reward_claims FOR SELECT USING (true);
CREATE POLICY "Allow public insert claims" ON reward_claims FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read activity" ON activity_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert activity" ON activity_logs FOR INSERT WITH CHECK (true);
