// src/components/admin/AdminPanel.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Dashboard      from './Dashboard';
import OrdersManager  from './OrdersManager';
import InvoiceManager from './InvoiceManager';
import EmailSettings  from './EmailSettings';
import { getEmailConfig } from './EmailSettings';

const NAV = [
  { key: 'dashboard', label: 'Dashboard',      icon: 'https://cdn-icons-png.flaticon.com/32/1828/1828791.png' },
  { key: 'orders',    label: 'Orders',          icon: 'https://cdn-icons-png.flaticon.com/32/1554/1554401.png' },
  { key: 'invoices',  label: 'Invoices',        icon: 'https://cdn-icons-png.flaticon.com/32/2991/2991106.png' },
  { key: 'email',     label: 'Email Settings',  icon: 'https://cdn-icons-png.flaticon.com/32/561/561127.png' },
];

export default function AdminPanel({ setPage }) {
  const { isAdmin, adminLogin, adminLogout, adminLoading, adminError } = useAuth();
  const [tab, setTab]   = useState('dashboard');
  const [user, setUser] = useState('admin');
  const [pass, setPass] = useState('');

  const emailCfg = getEmailConfig();
  const emailOk  = !!(emailCfg.serviceId && emailCfg.templateId && emailCfg.publicKey);

  if (!isAdmin) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <div className="admin-login-logo">
            <span className="logo-v">V</span><span className="logo-akif">AAKIF</span>
          </div>
          <p className="admin-login-sub">Admin Portal</p>
          {adminError && <div className="admin-error">{adminError}</div>}
          <div className="form-group">
            <label>Username</label>
            <input value={user} onChange={e => setUser(e.target.value)} placeholder="admin" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)}
              placeholder="vaakif@admin123"
              onKeyDown={e => e.key === 'Enter' && adminLogin(user, pass)} />
          </div>
          <button className="btn-primary full" disabled={adminLoading} onClick={() => adminLogin(user, pass)}>
            {adminLoading ? 'Signing in…' : 'Sign In'}
          </button>
          <button className="back-link" style={{ marginTop: 16 }} onClick={() => setPage('home')}>← Back to Shop</button>
          <p className="admin-hint">Default: admin / vakif@admin123</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <span className="logo-v">V</span><span className="logo-akif">AAKIF</span>
          <span className="sidebar-admin-tag">ADMIN</span>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <button
              key={n.key}
              className={`sidebar-nav-item ${tab === n.key ? 'active' : ''}`}
              onClick={() => setTab(n.key)}
            >
              <img src={n.icon} alt={n.label} style={{ width: 18, filter: 'invert(0.7)' }} />
              <span>{n.label}</span>
              {/* Red dot if email not configured */}
              {n.key === 'email' && !emailOk && (
                <span style={{
                  marginLeft: 'auto', width: 8, height: 8,
                  borderRadius: '50%', background: '#EF4444',
                  display: 'inline-block', flexShrink: 0,
                }} />
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-nav-item" onClick={() => setPage('home')}>
            <img src="https://cdn-icons-png.flaticon.com/32/1946/1946436.png" alt="shop" style={{ width: 18, filter: 'invert(0.7)' }} />
            <span>View Shop</span>
          </button>
          <button className="sidebar-nav-item logout" onClick={adminLogout}>
            <img src="https://cdn-icons-png.flaticon.com/32/1828/1828427.png" alt="logout" style={{ width: 18, filter: 'invert(0.7)' }} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 className="admin-topbar-title">{NAV.find(n => n.key === tab)?.label}</h2>
            {/* Email warning in topbar */}
            {!emailOk && tab !== 'email' && (
              <button
                onClick={() => setTab('email')}
                style={{
                  background: 'rgba(239,68,68,0.15)', border: '1px solid #EF4444',
                  color: '#EF4444', borderRadius: 6, padding: '4px 10px',
                  fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                ⚠️ Email not set up — customers won't get confirmation emails
              </button>
            )}
          </div>
          <div className="admin-topbar-right">
            <span className="admin-greeting">Welcome, Admin</span>
            <div className="admin-avatar">A</div>
          </div>
        </div>

        <div className="admin-content">
          {tab === 'dashboard' && <Dashboard />}
          {tab === 'orders'    && <OrdersManager />}
          {tab === 'invoices'  && <InvoiceManager />}
          {tab === 'email'     && <EmailSettings />}
        </div>
      </main>
    </div>
  );
}
