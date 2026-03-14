import { supabase, isSupabaseConfigured } from './supabaseClient';

// ─── Types ───

export interface DbAgent {
  id?: string;
  agent_id: string;           // onchain agent ID (bytes32 hex)
  owner_address: string;      // wallet address of owner
  name: string;
  strategy: string;
  max_position_size: number;
  public_key: string;
  status: 'active' | 'idle';
  reputation: number;
  earnings: number;
  actions_count: number;
  tx_hash?: string;           // registration transaction hash
  created_at?: string;
}

export interface DbCommitAction {
  id?: string;
  agent_id: string;
  commit_id: string;          // onchain commit ID (bytes32 hex)
  commit_hash: string;
  action: string;
  protocol: string;
  amount: number;
  salt: string;
  status: 'committed' | 'revealed' | 'executed';
  commit_tx_hash?: string;
  reveal_tx_hash?: string;
  commit_block?: number;
  owner_address: string;
  created_at?: string;
}

export interface DbRewardClaim {
  id?: string;
  owner_address: string;
  amount: string;
  tx_hash: string;
  created_at?: string;
}

export interface DbActivityLog {
  id?: string;
  owner_address: string;
  action_type: string;        // 'register' | 'commit' | 'reveal' | 'claim'
  description: string;
  tx_hash?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

// ─── Agents ───

export async function saveAgent(agent: DbAgent): Promise<DbAgent | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('agents')
    .upsert(agent, { onConflict: 'agent_id' })
    .select()
    .single();
  if (error) {
    console.error('[Supabase] saveAgent error:', error.message);
    return null;
  }
  return data;
}

export async function getAgentsByOwner(ownerAddress: string): Promise<DbAgent[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('owner_address', ownerAddress.toLowerCase())
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[Supabase] getAgentsByOwner error:', error.message);
    return [];
  }
  return data || [];
}

export async function getAllAgents(): Promise<DbAgent[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) {
    console.error('[Supabase] getAllAgents error:', error.message);
    return [];
  }
  return data || [];
}

export async function updateAgentStatus(agentId: string, status: 'active' | 'idle'): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase
    .from('agents')
    .update({ status })
    .eq('agent_id', agentId);
  if (error) {
    console.error('[Supabase] updateAgentStatus error:', error.message);
    return false;
  }
  return true;
}

// ─── Commit Actions ───

export async function saveCommitAction(commit: DbCommitAction): Promise<DbCommitAction | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('commit_actions')
    .upsert(commit, { onConflict: 'commit_id' })
    .select()
    .single();
  if (error) {
    console.error('[Supabase] saveCommitAction error:', error.message);
    return null;
  }
  return data;
}

export async function updateCommitStatus(
  commitId: string,
  status: 'revealed' | 'executed',
  revealTxHash?: string,
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const update: Record<string, unknown> = { status };
  if (revealTxHash) update.reveal_tx_hash = revealTxHash;
  const { error } = await supabase
    .from('commit_actions')
    .update(update)
    .eq('commit_id', commitId);
  if (error) {
    console.error('[Supabase] updateCommitStatus error:', error.message);
    return false;
  }
  return true;
}

export async function getCommitsByOwner(ownerAddress: string): Promise<DbCommitAction[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('commit_actions')
    .select('*')
    .eq('owner_address', ownerAddress.toLowerCase())
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) {
    console.error('[Supabase] getCommitsByOwner error:', error.message);
    return [];
  }
  return data || [];
}

// ─── Reward Claims ───

export async function saveRewardClaim(claim: DbRewardClaim): Promise<DbRewardClaim | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('reward_claims')
    .insert(claim)
    .select()
    .single();
  if (error) {
    console.error('[Supabase] saveRewardClaim error:', error.message);
    return null;
  }
  return data;
}

export async function getClaimsByOwner(ownerAddress: string): Promise<DbRewardClaim[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('reward_claims')
    .select('*')
    .eq('owner_address', ownerAddress.toLowerCase())
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[Supabase] getClaimsByOwner error:', error.message);
    return [];
  }
  return data || [];
}

// ─── Activity Logs ───

export async function logActivity(log: DbActivityLog): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from('activity_logs')
    .insert({ ...log, owner_address: log.owner_address.toLowerCase() });
  if (error) {
    console.error('[Supabase] logActivity error:', error.message);
  }
}

export async function getActivityByOwner(ownerAddress: string, limit = 20): Promise<DbActivityLog[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('owner_address', ownerAddress.toLowerCase())
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('[Supabase] getActivityByOwner error:', error.message);
    return [];
  }
  return data || [];
}

export async function getRecentActivity(limit = 20): Promise<DbActivityLog[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('[Supabase] getRecentActivity error:', error.message);
    return [];
  }
  return data || [];
}

// ─── Stats ───

export async function getGlobalStats(): Promise<{
  totalAgents: number;
  totalCommits: number;
  totalReveals: number;
  totalClaims: number;
}> {
  if (!isSupabaseConfigured()) {
    return { totalAgents: 0, totalCommits: 0, totalReveals: 0, totalClaims: 0 };
  }

  const [agents, commits, reveals, claims] = await Promise.all([
    supabase.from('agents').select('*', { count: 'exact', head: true }),
    supabase.from('commit_actions').select('*', { count: 'exact', head: true }),
    supabase.from('commit_actions').select('*', { count: 'exact', head: true }).eq('status', 'revealed'),
    supabase.from('reward_claims').select('*', { count: 'exact', head: true }),
  ]);

  return {
    totalAgents: agents.count || 0,
    totalCommits: commits.count || 0,
    totalReveals: reveals.count || 0,
    totalClaims: claims.count || 0,
  };
}
