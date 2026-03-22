import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletStore } from '../stores/stores';
import { useAgentRegistry } from '../stores/agentRegistry';
import { Wallet, TrendingUp, Shield, AlertTriangle, ExternalLink, RefreshCw, X } from 'lucide-react';
import {
  fetchBscPools,
  getProtocolInfo,
  filterByStrategy,
  formatTvl,
  formatApy,
  type DeFiPool,
} from '../data/defiService';
import './Pools.css';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

type FilterTab = 'all' | 'stablecoin' | 'single' | 'lp';

export default function Pools() {
  const { connected, address } = useWalletStore();
  const { agents } = useAgentRegistry();
  const [pools, setPools] = useState<DeFiPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [strategyFilter, setStrategyFilter] = useState('all');
  const [selectedPool, setSelectedPool] = useState<DeFiPool | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const myAgents = connected
    ? agents.filter(a => a.ownerAddress.toLowerCase() === address.toLowerCase())
    : [];

  const loadPools = async (forceRefresh = false) => {
    if (forceRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await fetchBscPools(forceRefresh);
      setPools(data);
    } catch {
      // Error handled in service
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadPools();
  }, []);

  // Filter pools
  let filteredPools = [...pools];

  // Tab filter
  if (activeTab === 'stablecoin') filteredPools = filteredPools.filter(p => p.stablecoin);
  else if (activeTab === 'single') filteredPools = filteredPools.filter(p => p.exposure === 'single' && !p.stablecoin);
  else if (activeTab === 'lp') filteredPools = filteredPools.filter(p => p.exposure === 'multi');

  // Strategy filter
  if (strategyFilter !== 'all') {
    filteredPools = filterByStrategy(filteredPools, strategyFilter);
  }

  if (!connected) {
    return (
      <motion.div className="pools-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="page-title font-display">DeFi Pools</h1>
        <p className="text-secondary" style={{ marginBottom: 24 }}>
          Browse and interact with supported lending and yield protocols on BNB Chain.
        </p>
        <div className="empty-state-card card">
          <Wallet size={40} strokeWidth={1} />
          <h3 style={{ marginTop: 12 }}>Connect your wallet</h3>
          <p className="text-secondary" style={{ fontSize: 13, maxWidth: 360, textAlign: 'center' }}>
            Connect your wallet to browse available DeFi pools and protocols.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="pools-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <h1 className="page-title font-display">DeFi Pools</h1>
          <p className="text-secondary" style={{ marginBottom: 0 }}>
            Live yield data from {pools.length} pools across BNB Chain protocols.
          </p>
        </div>
        <button
          className="btn-ghost"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
          onClick={() => loadPools(true)}
          disabled={refreshing}
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Strategy filter */}
      {myAgents.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <span className="text-tertiary" style={{ fontSize: 11, marginRight: 8 }}>Strategy filter:</span>
          {['all', 'Conservative', 'Balanced', 'Aggressive'].map(s => (
            <button
              key={s}
              className={`pool-tab ${strategyFilter === s ? 'pool-tab-active' : ''}`}
              onClick={() => setStrategyFilter(s)}
              style={{ marginRight: 6 }}
            >
              {s === 'all' ? 'All Pools' : s}
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="pool-tabs">
        {([
          ['all', 'All'],
          ['stablecoin', 'Stablecoins'],
          ['single', 'Single Asset'],
          ['lp', 'LP Pools'],
        ] as [FilterTab, string][]).map(([key, label]) => (
          <button
            key={key}
            className={`pool-tab ${activeTab === key ? 'pool-tab-active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="empty-state-card card">
          <RefreshCw size={32} className="spin" strokeWidth={1} style={{ color: 'var(--gold)' }} />
          <h3 style={{ marginTop: 12 }}>Loading pools...</h3>
          <p className="text-secondary" style={{ fontSize: 13 }}>Fetching live yield data from BNB Chain.</p>
        </div>
      )}

      {/* Pool grid */}
      {!loading && (
        <motion.div className="pools-grid" variants={fadeUp} initial="hidden" animate="visible">
          {filteredPools.length === 0 ? (
            <div className="empty-state-card card" style={{ gridColumn: '1 / -1' }}>
              <h3>No pools match this filter</h3>
              <p className="text-secondary" style={{ fontSize: 13 }}>Try a different tab or strategy filter.</p>
            </div>
          ) : (
            filteredPools.map((pool) => {
              const info = getProtocolInfo(pool.project);
              return (
                <motion.div
                  key={pool.id}
                  className="pool-card card"
                  whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
                  onClick={() => setSelectedPool(pool)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="pool-card-header">
                    <div>
                      <span
                        className="pool-protocol-badge"
                        style={{ background: info.color + '22', color: info.color, borderColor: info.color + '44' }}
                      >
                        {info.name}
                      </span>
                      {pool.stablecoin && (
                        <span className="pool-stable-badge">Stable</span>
                      )}
                    </div>
                    <div className="pool-risk-indicator">
                      {info.riskLevel === 'Low' && <Shield size={14} style={{ color: 'var(--green)' }} />}
                      {info.riskLevel === 'Medium' && <TrendingUp size={14} style={{ color: 'var(--amber)' }} />}
                      {info.riskLevel === 'High' && <AlertTriangle size={14} style={{ color: 'var(--red)' }} />}
                      <span className="text-tertiary" style={{ fontSize: 10 }}>{info.riskLevel}</span>
                    </div>
                  </div>

                  <h4 className="pool-symbol font-data">{pool.symbol}</h4>

                  <div className="pool-stats">
                    <div className="pool-stat">
                      <span className="text-tertiary" style={{ fontSize: 10 }}>APY</span>
                      <span className="font-data pool-apy" style={{
                        color: pool.apy >= 5 ? 'var(--green)' : pool.apy >= 1 ? 'var(--gold)' : 'var(--text-primary)',
                        fontSize: 18,
                      }}>
                        {formatApy(pool.apy)}
                      </span>
                    </div>
                    <div className="pool-stat">
                      <span className="text-tertiary" style={{ fontSize: 10 }}>TVL</span>
                      <span className="font-data" style={{ fontSize: 14 }}>{formatTvl(pool.tvlUsd)}</span>
                    </div>
                  </div>

                  {pool.predictions.predictedClass && (
                    <div className="pool-prediction">
                      <span style={{
                        fontSize: 10,
                        color: pool.predictions.predictedClass.includes('Up') ? 'var(--green)' : 'var(--red)',
                      }}>
                        {pool.predictions.predictedClass.includes('Up') ? '↑' : '↓'} {pool.predictions.predictedClass}
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </motion.div>
      )}

      {/* Drawer */}
      <AnimatePresence>
        {selectedPool && (
          <motion.div
            className="drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPool(null)}
          >
            <motion.div
              className="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="drawer-header">
                <h3 className="font-display">{selectedPool.symbol}</h3>
                <button className="drawer-close" onClick={() => setSelectedPool(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="drawer-content">
                {(() => {
                  const info = getProtocolInfo(selectedPool.project);
                  return (
                    <>
                      <div
                        className="pool-protocol-badge"
                        style={{
                          background: info.color + '22',
                          color: info.color,
                          borderColor: info.color + '44',
                          alignSelf: 'flex-start',
                        }}
                      >
                        {info.name}
                      </div>

                      <div className="drawer-stat">
                        <span className="text-tertiary">Total APY</span>
                        <span className="font-data text-green" style={{ fontSize: 20 }}>
                          {formatApy(selectedPool.apy)}
                        </span>
                      </div>
                      {selectedPool.apyBase != null && (
                        <div className="drawer-stat">
                          <span className="text-tertiary">Base APY</span>
                          <span className="font-data">{formatApy(selectedPool.apyBase)}</span>
                        </div>
                      )}
                      {selectedPool.apyReward != null && selectedPool.apyReward > 0 && (
                        <div className="drawer-stat">
                          <span className="text-tertiary">Reward APY</span>
                          <span className="font-data text-gold">{formatApy(selectedPool.apyReward)}</span>
                        </div>
                      )}
                      <div className="drawer-stat">
                        <span className="text-tertiary">TVL</span>
                        <span className="font-data">{formatTvl(selectedPool.tvlUsd)}</span>
                      </div>
                      <div className="drawer-stat">
                        <span className="text-tertiary">Risk Level</span>
                        <span className="font-data" style={{
                          color: info.riskLevel === 'Low' ? 'var(--green)' : info.riskLevel === 'Medium' ? 'var(--amber)' : 'var(--red)',
                        }}>
                          {info.riskLevel}
                        </span>
                      </div>
                      <div className="drawer-stat">
                        <span className="text-tertiary">IL Risk</span>
                        <span className="font-data">{selectedPool.ilRisk === 'yes' ? '⚠ Yes' : '✓ No'}</span>
                      </div>
                      <div className="drawer-stat">
                        <span className="text-tertiary">Type</span>
                        <span className="font-data">
                          {selectedPool.stablecoin ? '🪙 Stablecoin' : selectedPool.exposure === 'single' ? '◉ Single Asset' : '◎ LP Pool'}
                        </span>
                      </div>
                      {selectedPool.predictions.predictedClass && (
                        <div className="drawer-stat">
                          <span className="text-tertiary">Prediction</span>
                          <span className="font-data" style={{
                            color: selectedPool.predictions.predictedClass.includes('Up') ? 'var(--green)' : 'var(--red)',
                          }}>
                            {selectedPool.predictions.predictedClass}
                            {selectedPool.predictions.predictedProbability != null && ` (${selectedPool.predictions.predictedProbability.toFixed(0)}%)`}
                          </span>
                        </div>
                      )}
                      {selectedPool.poolMeta && (
                        <div className="drawer-stat">
                          <span className="text-tertiary">Details</span>
                          <span className="font-data" style={{ fontSize: 11 }}>{selectedPool.poolMeta}</span>
                        </div>
                      )}

                      <a
                        href={`https://defillama.com/yields/pool/${selectedPool.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 }}
                      >
                        View on DeFiLlama <ExternalLink size={12} />
                      </a>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
