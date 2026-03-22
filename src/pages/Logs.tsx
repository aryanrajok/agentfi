import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWalletStore } from '../stores/stores';
import { Wallet, FileText, ExternalLink, RefreshCw } from 'lucide-react';
import { getActivityByOwner, type DbActivityLog } from '../data/supabaseService';
import { isSupabaseConfigured } from '../data/supabaseClient';
import { getExplorerUrl } from '../data/wallet';
import './Logs.css';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const ACTION_COLORS: Record<string, string> = {
  register: 'var(--green)',
  commit: 'var(--amber)',
  reveal: 'var(--cyan)',
  claim: 'var(--gold)',
};

const ACTION_LABELS: Record<string, string> = {
  register: 'REGISTER',
  commit: 'COMMIT',
  reveal: 'REVEAL',
  claim: 'CLAIM',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function Logs() {
  const { connected, address } = useWalletStore();
  const [activities, setActivities] = useState<DbActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(20);

  const supabaseReady = isSupabaseConfigured();

  useEffect(() => {
    if (!connected || !address || !supabaseReady) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await getActivityByOwner(address, limit);
        setActivities(data);
      } catch (err) {
        console.error('Failed to load activity logs:', err);
      }
      setLoading(false);
    };

    load();
  }, [connected, address, supabaseReady, limit]);

  const handleRefresh = async () => {
    if (!connected || !address) return;
    setLoading(true);
    try {
      const data = await getActivityByOwner(address, limit);
      setActivities(data);
    } catch (err) {
      console.error('Failed to refresh activity logs:', err);
    }
    setLoading(false);
  };

  if (!connected) {
    return (
      <motion.div className="logs-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="page-title font-display">Activity Log</h1>
        <div className="empty-state-card card">
          <Wallet size={40} strokeWidth={1} />
          <h3 style={{ marginTop: 12 }}>Connect your wallet</h3>
          <p className="text-secondary" style={{ fontSize: 13, maxWidth: 360, textAlign: 'center' }}>
            Connect your wallet to view your onchain activity log.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="logs-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="logs-header">
        <div>
          <h1 className="page-title font-display">Activity Log</h1>
          <p className="text-secondary" style={{ marginBottom: 0 }}>
            All actions performed by your agents are recorded here.
          </p>
        </div>
        <button
          className="btn-ghost"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px' }}
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {!supabaseReady && (
        <div style={{
          background: 'var(--amber-dim)',
          border: '1px solid rgba(255,184,0,0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          marginBottom: 16,
          fontSize: 13,
          color: 'var(--amber)',
        }}>
          ⚠ Supabase not configured. Activity logs require Supabase to be set up.
        </div>
      )}

      {loading && activities.length === 0 ? (
        <div className="empty-state-card card">
          <RefreshCw size={32} strokeWidth={1} className="spin" />
          <p className="text-tertiary" style={{ marginTop: 12, fontSize: 13 }}>Loading activity...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="empty-state-card card">
          <FileText size={40} strokeWidth={1} />
          <h3 style={{ marginTop: 12 }}>No Activity Yet</h3>
          <p className="text-secondary" style={{ fontSize: 13, maxWidth: 400, textAlign: 'center' }}>
            Your activity log is empty. Register an agent and submit your first commit-reveal action to see entries here.
          </p>
        </div>
      ) : (
        <motion.div className="logs-list" initial="hidden" animate="visible" variants={stagger}>
          {activities.map((activity, i) => (
            <motion.div
              key={activity.id || i}
              className="log-entry card"
              variants={fadeUp}
            >
              <div className="log-entry-left">
                <span
                  className="log-type-badge"
                  style={{
                    background: ACTION_COLORS[activity.action_type] || 'var(--text-tertiary)',
                    color: 'var(--bg-primary)',
                  }}
                >
                  {ACTION_LABELS[activity.action_type] || activity.action_type.toUpperCase()}
                </span>
                <div className="log-entry-info">
                  <span className="log-description">{activity.description}</span>
                  {activity.created_at && (
                    <span className="log-time text-tertiary">{timeAgo(activity.created_at)}</span>
                  )}
                </div>
              </div>
              {activity.tx_hash && (
                <a
                  href={getExplorerUrl(activity.tx_hash, 'tx')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="log-tx-link text-cyan"
                  title="View on BscScan"
                >
                  {activity.tx_hash.slice(0, 8)}...{activity.tx_hash.slice(-4)}
                  <ExternalLink size={10} />
                </a>
              )}
            </motion.div>
          ))}

          {activities.length >= limit && (
            <button
              className="btn-ghost"
              style={{ width: '100%', marginTop: 12 }}
              onClick={() => setLimit(prev => prev + 20)}
            >
              Load More
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
