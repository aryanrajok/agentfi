import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Bot, Waves, GitBranch, Star, FileText, Settings, LogOut, Bell, X, Trash2 } from 'lucide-react';
import { useWalletStore } from '../stores/stores';
import { useNotificationStore } from '../stores/notificationStore';
import './DashboardLayout.css';

export default function DashboardLayout() {
  const { address, displayAddress, balance, chainId, connected, disconnect } = useWalletStore();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const { notifications, unreadCount, markAllRead, clearAll } = useNotificationStore();

  // Auto-reconnect wallet on page load / refresh
  const checkConnection = useWalletStore((s) => s.checkConnection);
  useEffect(() => {
    if (!connected) {
      checkConnection();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDisconnect = () => {
    disconnect();
    navigate('/');
  };

  const chainLabel = chainId === 56 ? 'BNB Mainnet' : chainId === 97 ? 'BNB Testnet' : connected ? `Chain ${chainId}` : 'Not connected';
  const currencySymbol = chainId === 56 ? 'BNB' : chainId === 97 ? 'tBNB' : 'ETH';

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <span className="logo-icon">■</span>
            <span className="logo-text">AgentFi</span>
          </div>
          {connected ? (
            <div className="sidebar-wallet">
              <span className="live-dot" />
              <span className="sidebar-wallet-addr font-data">{displayAddress}</span>
            </div>
          ) : (
            <div className="sidebar-wallet" style={{ borderColor: 'rgba(255,184,0,0.3)' }}>
              <span className="text-amber" style={{ fontSize: 12 }}>⚠ Not connected</span>
            </div>
          )}
          <span className="sidebar-agent-count text-tertiary">
            {connected ? `${chainLabel} · ${balance} ${currencySymbol}` : 'Connect wallet to continue'}
          </span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" end className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}>
            <LayoutDashboard size={16} />
            <span>Overview</span>
          </NavLink>
          <NavLink to="/dashboard/agents" className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}>
            <Bot size={16} />
            <span>My Agents</span>
          </NavLink>
          <NavLink to="/dashboard/pools" className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}>
            <Waves size={16} />
            <span>DeFi Pools</span>
          </NavLink>
          <NavLink to="/dashboard/commit" className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}>
            <GitBranch size={16} />
            <span>Agent Automation</span>
          </NavLink>
          <NavLink to="/dashboard/rewards" className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}>
            <Star size={16} />
            <span>Rewards</span>
          </NavLink>
          <NavLink to="/dashboard/logs" className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}>
            <FileText size={16} />
            <span>Activity Log</span>
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <NavLink to="/dashboard/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}>
            <Settings size={16} />
            <span>Settings</span>
          </NavLink>
          {connected && (
            <div className="sidebar-token">
              <span className="font-data text-gold">{parseFloat(balance).toFixed(4)} {currencySymbol}</span>
            </div>
          )}
          <button className="sidebar-disconnect" onClick={handleDisconnect}>
            <LogOut size={14} />
            <span>Disconnect</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <header className="top-bar">
          <span className="topbar-title font-display">Dashboard</span>
          <div className="topbar-search">
            <input className="input-field" placeholder="Search agents, transactions..." />
          </div>
          <div className="topbar-right">
            {/* Notification Bell - functional dropdown */}
            <div className="topbar-notify" onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs && unreadCount > 0) markAllRead(); }} style={{ cursor: 'pointer', position: 'relative' }}>
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  background: 'var(--red)', color: '#fff',
                  fontSize: 9, fontWeight: 700,
                  width: 16, height: 16, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
              {showNotifs && (
                <div className="notif-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="notif-dropdown-header">
                    <span className="font-display" style={{ fontSize: 14 }}>Notifications</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {notifications.length > 0 && (
                        <button onClick={() => clearAll()} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', gap: 3 }} title="Clear all">
                          <Trash2 size={10} /> Clear
                        </button>
                      )}
                      <button onClick={() => setShowNotifs(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="notif-dropdown-body" style={{ maxHeight: 320, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <p className="text-tertiary" style={{ fontSize: 12, textAlign: 'center', padding: '24px 0' }}>
                        {connected ? 'No notifications yet. Actions you perform will appear here.' : 'Connect your wallet to receive notifications.'}
                      </p>
                    ) : (
                      notifications.slice(0, 15).map((notif) => (
                        <div key={notif.id} style={{
                          padding: '10px 0',
                          borderBottom: '1px solid var(--bg-border)',
                          display: 'flex', gap: 8, alignItems: 'flex-start',
                        }}>
                          <span style={{
                            width: 6, height: 6, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                            background: notif.type === 'register' ? 'var(--green)' :
                              notif.type === 'commit' ? 'var(--amber)' :
                              notif.type === 'reveal' ? 'var(--cyan)' :
                              notif.type === 'claim' ? 'var(--gold)' : 'var(--text-tertiary)',
                          }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: 12, fontWeight: 500, display: 'block', color: 'var(--text-primary)' }}>{notif.title}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginTop: 2 }}>{notif.message}</span>
                            <span className="text-tertiary" style={{ fontSize: 10, marginTop: 3, display: 'block' }}>
                              {new Date(notif.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {connected && (
              <a
                href={`https://${chainId === 97 ? 'testnet.' : ''}bscscan.com/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="topbar-block font-data text-tertiary"
                style={{ textDecoration: 'none' }}
                title="View your wallet on BscScan"
              >
                {chainLabel}
              </a>
            )}
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
