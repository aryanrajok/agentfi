import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWalletStore } from '../stores/stores';
import { useAgentRegistry } from '../stores/agentRegistry';
import { Bot, Plus, Wallet, Trash2, RefreshCw, ExternalLink } from 'lucide-react';
import { getAgentsByOwner, type DbAgent } from '../data/supabaseService';
import { isSupabaseConfigured } from '../data/supabaseClient';
import { getExplorerUrl } from '../data/wallet';
import './Agents.css';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function Agents() {
  const { connected, address } = useWalletStore();
  const { agents, removeAgent } = useAgentRegistry();
  const [dbAgents, setDbAgents] = useState<DbAgent[]>([]);
  const [loading, setLoading] = useState(false);

  const supabaseReady = isSupabaseConfigured();

  // Filter agents owned by current wallet (from localStorage)
  const localAgents = connected
    ? agents.filter(a => a.ownerAddress.toLowerCase() === address.toLowerCase())
    : [];

  // Fetch Supabase agents
  useEffect(() => {
    if (!connected || !address || !supabaseReady) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await getAgentsByOwner(address);
        setDbAgents(data);
      } catch (err) {
        console.error('Failed to load agents from Supabase:', err);
      }
      setLoading(false);
    };

    load();
  }, [connected, address, supabaseReady]);

  // Merge: use local agents as base, enrich with Supabase data
  const mergedAgents = localAgents.map(local => {
    const dbMatch = dbAgents.find(
      db => db.agent_id === local.id || db.name === local.name
    );
    return {
      ...local,
      txHash: dbMatch?.tx_hash || '',
      dbReputation: dbMatch?.reputation ?? local.reputation,
      dbEarnings: dbMatch?.earnings ?? 0,
      dbActionsCount: dbMatch?.actions_count ?? local.actionsCount,
      dbStatus: dbMatch?.status || local.status,
    };
  });

  // Also add any Supabase agents that are NOT in localStorage
  const localIds = new Set(localAgents.map(a => a.id));
  const localNames = new Set(localAgents.map(a => a.name));
  const supabaseOnly = dbAgents.filter(
    db => !localIds.has(db.agent_id) && !localNames.has(db.name)
  );

  const handleRefresh = async () => {
    if (!connected || !address) return;
    setLoading(true);
    try {
      const data = await getAgentsByOwner(address);
      setDbAgents(data);
    } catch (err) {
      console.error('Failed to refresh agents:', err);
    }
    setLoading(false);
  };

  return (
    <motion.div className="agents-page" initial="hidden" animate="visible" variants={stagger}>
      <div className="agents-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h1 className="page-title font-display" style={{ marginBottom: 0 }}>My Agents</h1>
          {connected && supabaseReady && (
            <button
              className="btn-ghost"
              style={{ padding: '4px 8px', fontSize: 11 }}
              onClick={handleRefresh}
              disabled={loading}
              title="Refresh from database"
            >
              <RefreshCw size={12} className={loading ? 'spin' : ''} />
            </button>
          )}
        </div>
        {connected && (
          <Link to="/register" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> Register New Agent
          </Link>
        )}
      </div>

      {!connected ? (
        <motion.div className="empty-state-card card" variants={fadeUp}>
          <Wallet size={40} strokeWidth={1} />
          <h3 style={{ marginTop: 12 }}>Connect your wallet</h3>
          <p className="text-secondary" style={{ fontSize: 13, maxWidth: 360, textAlign: 'center' }}>
            Connect your MetaMask wallet to view and manage your registered agents.
          </p>
        </motion.div>
      ) : mergedAgents.length === 0 && supabaseOnly.length === 0 ? (
        <motion.div className="empty-state-card card" variants={fadeUp}>
          <Bot size={40} strokeWidth={1} />
          <h3 style={{ marginTop: 12 }}>No Agents Registered</h3>
          <p className="text-secondary" style={{ fontSize: 13, maxWidth: 360, textAlign: 'center' }}>
            You haven't registered any agents yet. Register your first agent to start autonomous DeFi actions.
          </p>
          <Link to="/register" className="btn-primary" style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> Register Your First Agent
          </Link>
        </motion.div>
      ) : (
        <motion.div className="agents-grid" variants={stagger}>
          {/* Local + enriched agents */}
          {mergedAgents.map((agent) => (
            <motion.div key={agent.id} variants={fadeUp}>
              <div className="agent-card card">
                <div className="agent-card-header">
                  <div>
                    <h3 className="agent-card-name">{agent.name}</h3>
                    <span className="agent-card-id font-data text-cyan">{agent.id.slice(0, 10)}...{agent.id.slice(-4)}</span>
                  </div>
                  <span className={`badge badge-${agent.dbStatus === 'active' ? 'active' : 'idle'}`}>
                    {agent.dbStatus === 'active' ? '● ACTIVE' : '○ IDLE'}
                  </span>
                </div>
                <div className="agent-card-metrics">
                  <div className="agent-metric">
                    <span className="agent-metric-label text-tertiary">Strategy</span>
                    <span className="agent-metric-value font-data" style={{ fontSize: 12 }}>{agent.strategy.split('(')[0].trim()}</span>
                  </div>
                  <div className="agent-metric">
                    <span className="agent-metric-label text-tertiary">Max Position</span>
                    <span className="agent-metric-value font-data">${agent.maxPositionSize.toLocaleString()}</span>
                  </div>
                  <div className="agent-metric">
                    <span className="agent-metric-label text-tertiary">Reputation</span>
                    <span className="agent-metric-value font-data" style={{ color: 'var(--amber)' }}>{agent.dbReputation}</span>
                  </div>
                  <div className="agent-metric">
                    <span className="agent-metric-label text-tertiary">Actions</span>
                    <span className="agent-metric-value font-data">{agent.dbActionsCount}</span>
                  </div>
                </div>
                <div className="agent-card-footer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="text-tertiary" style={{ fontSize: 12 }}>
                      Created: {new Date(agent.createdAt).toLocaleDateString()}
                    </span>
                    {agent.txHash && (
                      <a
                        href={getExplorerUrl(agent.txHash, 'tx')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan"
                        style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}
                        title="View registration tx"
                      >
                        <ExternalLink size={10} /> Tx
                      </a>
                    )}
                  </div>
                  <button
                    className="btn-ghost"
                    style={{ padding: '4px 10px', fontSize: 11, color: 'var(--red)' }}
                    onClick={() => {
                      const confirmed = window.confirm(
                        `Remove "${agent.name}" from your dashboard?\n\n` +
                        (agent.txHash
                          ? '⚠️ This only removes it from your local dashboard. The agent still exists on the blockchain and cannot be deleted from there.'
                          : 'This will remove the agent from your local storage.')
                      );
                      if (confirmed) removeAgent(agent.id);
                    }}
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Supabase-only agents (not in localStorage) */}
          {supabaseOnly.map((agent) => (
            <motion.div key={agent.agent_id} variants={fadeUp}>
              <div className="agent-card card" style={{ borderLeft: '2px solid var(--cyan)' }}>
                <div className="agent-card-header">
                  <div>
                    <h3 className="agent-card-name">{agent.name}</h3>
                    <span className="agent-card-id font-data text-cyan">{agent.agent_id.slice(0, 10)}...{agent.agent_id.slice(-4)}</span>
                  </div>
                  <span className={`badge badge-${agent.status === 'active' ? 'active' : 'idle'}`}>
                    {agent.status === 'active' ? '● ACTIVE' : '○ IDLE'}
                  </span>
                </div>
                <div className="agent-card-metrics">
                  <div className="agent-metric">
                    <span className="agent-metric-label text-tertiary">Strategy</span>
                    <span className="agent-metric-value font-data" style={{ fontSize: 12 }}>{agent.strategy}</span>
                  </div>
                  <div className="agent-metric">
                    <span className="agent-metric-label text-tertiary">Max Position</span>
                    <span className="agent-metric-value font-data">${agent.max_position_size.toLocaleString()}</span>
                  </div>
                  <div className="agent-metric">
                    <span className="agent-metric-label text-tertiary">Reputation</span>
                    <span className="agent-metric-value font-data" style={{ color: 'var(--amber)' }}>{agent.reputation}</span>
                  </div>
                  <div className="agent-metric">
                    <span className="agent-metric-label text-tertiary">Actions</span>
                    <span className="agent-metric-value font-data">{agent.actions_count}</span>
                  </div>
                </div>
                <div className="agent-card-footer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="text-tertiary" style={{ fontSize: 12 }}>
                      {agent.created_at ? `Created: ${new Date(agent.created_at).toLocaleDateString()}` : 'From database'}
                    </span>
                    {agent.tx_hash && (
                      <a
                        href={getExplorerUrl(agent.tx_hash, 'tx')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan"
                        style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}
                        title="View registration tx"
                      >
                        <ExternalLink size={10} /> Tx
                      </a>
                    )}
                  </div>
                  <span className="text-tertiary" style={{ fontSize: 10 }}>
                    ☁ Synced from DB
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
