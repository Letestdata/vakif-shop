// src/components/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { orderStore } from '../../utils/orderStore';

const SC = { pending:'#EAB308',confirmed:'#3B82F6',processing:'#F97316',shipped:'#8B5CF6',delivered:'#22C55E',cancelled:'#EF4444' };

function buildStats(orders) {
  const revenue     = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.grand_total || 0), 0);
  const pending     = orders.filter(o => (o.status || 'pending') === 'pending').length;
  const today       = orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length;
  const statusMap   = orders.reduce((acc, o) => { const s = o.status||'pending'; acc[s]=(acc[s]||0)+1; return acc; }, {});
  return {
    total_orders:   orders.length,
    revenue,
    pending_orders: pending,
    today_orders:   today,
    recent_orders:  orders.slice(0, 10),
    by_status:      Object.entries(statusMap).map(([status, count]) => ({ status, count })),
  };
}

export default function Dashboard() {
  // Reactive — re-renders whenever any order changes
  const orders = orderStore.useOrders ? (() => { const [o, setO] = React.useState(orderStore.getAll()); React.useEffect(() => orderStore.subscribe(setO), []); return o; })() : [];
  const stats   = buildStats(orders);

  const statCards = [
    { label: 'Total Orders',    value: stats.total_orders,   color: '#D4AF37' },
    { label: 'Revenue',         value: `₹${stats.revenue.toFixed(0)}`, color: '#22C55E' },
    { label: 'Pending Orders',  value: stats.pending_orders, color: '#EAB308' },
    { label: "Today's Orders",  value: stats.today_orders,   color: '#3B82F6' },
  ];

  return (
    <div className="dashboard">
      <div className="stat-cards">
        {statCards.map(c => (
          <div key={c.label} className="stat-card" style={{ '--accent': c.color }}>
            <div className="stat-card-icon" style={{ background: c.color + '22', width: 52, height: 52, borderRadius: 12, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize: 22 }}>
                {c.label === 'Total Orders' ? '📦' : c.label === 'Revenue' ? '💰' : c.label === 'Pending Orders' ? '⏳' : '📅'}
              </span>
            </div>
            <div>
              <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dash-card">
          <h3 className="dash-card-title">Recent Orders</h3>
          <div className="recent-orders-list">
            {stats.recent_orders.length === 0
              ? <p className="empty-text">No orders yet. Place a test order from the shop!</p>
              : stats.recent_orders.map(o => (
              <div key={o.order_id} className="recent-order-row">
                <div>
                  <span className="recent-order-id">{o.order_id}</span>
                  <span className="recent-order-name"> — {o.customer_name}</span>
                </div>
                <div className="recent-order-right">
                  <span className="recent-order-amount">₹{Number(o.grand_total||0).toFixed(0)}</span>
                  <span className="recent-order-status" style={{ color: SC[o.status||'pending']||'#D4AF37' }}>{o.status||'pending'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-card">
          <h3 className="dash-card-title">Orders by Status</h3>
          <div className="status-breakdown">
            {stats.by_status.length === 0
              ? <p className="empty-text">No data</p>
              : stats.by_status.map(s => (
              <div key={s.status} className="status-row">
                <div className="status-dot" style={{ background: SC[s.status]||'#D4AF37' }} />
                <span className="status-name">{s.status}</span>
                <div className="status-bar-wrap">
                  <div className="status-bar-fill" style={{ width:`${(s.count/(stats.total_orders||1))*100}%`, background: SC[s.status]||'#D4AF37' }} />
                </div>
                <span className="status-count">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3 className="dash-card-title">Quick Actions</h3>
        <div className="quick-action-grid">
          <button className="quick-action-btn" onClick={() => exportCSV(orders)}>
            📊 Export CSV
          </button>
          <button className="quick-action-btn" onClick={() => {
            if (window.confirm('Clear ALL local order data? This cannot be undone.')) {
              localStorage.removeItem('vakif_orders');
              window.location.reload();
            }
          }}>
            🗑 Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}

function exportCSV(orders) {
  const rows = orders.map(o => [o.order_id,o.customer_name,o.customer_phone,o.customer_email||'',o.grand_total,o.status,o.created_at].join(','));
  const a = Object.assign(document.createElement('a'), {
    href: 'data:text/csv,' + encodeURIComponent(['Order ID,Customer,Phone,Email,Total,Status,Date',...rows].join('\n')),
    download: `vakif_orders_${new Date().toISOString().slice(0,10)}.csv`,
  });
  a.click();
}
