// src/components/admin/OrdersManager.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { orderStore } from '../../utils/orderStore';
import { generateInvoicePDF } from '../../utils/pdf';
import { sendOrderConfirmation, getEmailConfig, loadEmailJS } from '../../utils/email';

const STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled'];
const SC = { pending:'#EAB308',confirmed:'#3B82F6',processing:'#F97316',shipped:'#8B5CF6',delivered:'#22C55E',cancelled:'#EF4444' };

export default function OrdersManager() {
  // Reactive — auto-updates when any order changes anywhere
  const [allOrders, setAllOrders] = useState(orderStore.getAll());
  useEffect(() => orderStore.subscribe(setAllOrders), []);

  const [search, setSearch]   = useState('');
  const [statusF, setStatusF] = useState('');
  const [page, setPage]       = useState(1);
  const [selected, setSelected] = useState(null);
  const [toast, setToast]     = useState('');
  const LIMIT = 20;

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  // Filter + paginate in memory — instant, no network needed
  const filtered = useMemo(() => allOrders.filter(o => {
    const ms = statusF ? (o.status||'pending') === statusF : true;
    const q  = search.toLowerCase();
    return ms && (!q || (o.order_id+o.customer_name+o.customer_phone+(o.customer_email||'')).toLowerCase().includes(q));
  }), [allOrders, search, statusF]);

  const pages      = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const pageOrders = filtered.slice((page-1)*LIMIT, page*LIMIT);

  // Keep selected order in sync when orders update
  useEffect(() => {
    if (selected) {
      const fresh = allOrders.find(o => o.order_id === selected.order_id);
      if (fresh) setSelected(fresh);
    }
  }, [allOrders]);

  const updateStatus = (orderId, status) => {
    // Instant local update — triggers reactive re-render everywhere
    orderStore.updateStatus(orderId, status);
    // Background PHP sync
    const token = localStorage.getItem('vakif_admin_token') || '';
    fetch(`/vakif-api/admin.php?action=order_update&order_id=${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    }).catch(() => {});
    showToast(`✅ Status updated → ${status}`);
  };

  const deleteOrder = (orderId) => {
    if (!window.confirm(`Delete order ${orderId}? Cannot be undone.`)) return;
    orderStore.delete(orderId);
    fetch(`/vakif-api/admin.php?action=order_delete&order_id=${orderId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('vakif_admin_token')||''}` },
    }).catch(() => {});
    if (selected?.order_id === orderId) setSelected(null);
    showToast('Order deleted');
  };

  const sendInvoiceEmail = async (order) => {
    if (!order.customer_email) { showToast('❌ No customer email on this order'); return; }
    showToast('Sending email…');
    const result = await sendOrderConfirmation(order);
    if (result.ok) {
      showToast(`✅ Invoice email sent to ${order.customer_email}`);
    } else if (result.reason === 'template_to_empty') {
      showToast('❌ EmailJS template "To Email" field is empty.\nGo to Email Settings tab for fix instructions.');
    } else if (result.reason === 'emailjs_not_configured') {
      showToast('❌ EmailJS not configured. Go to Email Settings tab.');
    } else {
      showToast(`❌ Email failed: ${String(result.reason).slice(0,80)}`);
    }
  };

  return (
    <div className="orders-manager">
      {toast && (
        <div className="update-toast" style={{ whiteSpace: 'pre-wrap', maxWidth: 400 }}>{toast}</div>
      )}

      {/* Toolbar */}
      <div className="orders-toolbar">
        <input className="search-input dark" placeholder="Search by name, order ID, phone, email…"
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select className="filter-select" value={statusF}
          onChange={e => { setStatusF(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="orders-count">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="orders-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Order ID</th><th>Customer</th><th>Phone</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {pageOrders.length === 0
              ? <tr><td colSpan={7} className="empty-text">No orders found.</td></tr>
              : pageOrders.map(o => (
              <tr key={o.order_id} className={selected?.order_id === o.order_id ? 'selected-row' : ''}>
                <td className="order-id-cell">{o.order_id}</td>
                <td>{o.customer_name}</td>
                <td>{o.customer_phone}</td>
                <td>₹{Number(o.grand_total||0).toFixed(0)}</td>
                <td>
                  {/* Status dropdown — changes instantly everywhere */}
                  <select
                    className="status-select"
                    value={o.status || 'pending'}
                    style={{ color: SC[o.status||'pending'] || '#D4AF37', fontWeight: 600 }}
                    onChange={e => updateStatus(o.order_id, e.target.value)}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td style={{ fontSize: 12, color: '#888' }}>
                  {new Date(o.created_at).toLocaleDateString('en-IN')}
                </td>
                <td>
                  <div className="action-btns">
                    <button title="View details" className="icon-action" 
                      onClick={() => setSelected(selected?.order_id === o.order_id ? null : o)}>
                        <img src="https://i.ibb.co/KxXTK6zS/eye.png" alt="👁" />
                      </button>
                    <button title="Download PDF invoice" className="icon-action"
                      onClick={() => generateInvoicePDF(o)}>
                        <img src="https://i.ibb.co/TxDPM4TW/receipt.png" alt="📄" />
                      </button>
                    <button title="Send invoice email to customer" className="icon-action"
                      onClick={() => sendInvoiceEmail(o)}>
                      <img src="https://i.ibb.co/7Nn4PjNV/email.png" alt="📧" /></button>
                    <button title="Delete order" className="icon-action danger"
                      onClick={() => deleteOrder(o.order_id)}>
                      <img src="https://i.ibb.co/TQTMnHG/bin.png" alt="🗑" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p-1)}>←</button>
          <span>{page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => p+1)}>→</button>
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <OrderDetailPanel
          order={selected}
          onClose={() => setSelected(null)}
          onStatusChange={s => updateStatus(selected.order_id, s)}
          onDownload={() => generateInvoicePDF(selected)}
          onEmail={() => sendInvoiceEmail(selected)}
        />
      )}
    </div>
  );
}

function OrderDetailPanel({ order, onClose, onStatusChange, onDownload, onEmail }) {
  const items = Array.isArray(order.items) ? order.items : [];
  return (
    <div className="order-detail-panel" style={{ marginTop: 20 }}>
      <div className="panel-header">
        <h3>📦 {order.order_id}</h3>
        <button className="cart-close" onClick={onClose}>✕</button>
      </div>
      <div className="panel-body">
        <div className="panel-section">
          <h4>Customer Details</h4>
          <p><b>Name:</b> {order.customer_name}</p>
          <p><b>Phone:</b> {order.customer_phone}</p>
          <p><b>Email:</b> {order.customer_email || <span style={{color:'#EF4444'}}>Not provided</span>}</p>
          <p><b>Address:</b> {order.delivery_address}</p>
          {order.special_instructions && <p><b>Notes:</b> {order.special_instructions}</p>}
        </div>
        <div className="panel-section">
          <h4>Items Ordered</h4>
          {items.map((item, i) => (
            <div key={i} className="panel-item">
              <span style={{ flex:1 }}>{item.name}</span>
              <span style={{ color:'#888' }}>×{item.quantity}</span>
              <span>₹{Number(item.price) * Number(item.quantity)}</span>
            </div>
          ))}
          <div className="panel-total" style={{ marginTop: 8 }}>
            Grand Total: ₹{order.grand_total}
          </div>
        </div>
        <div className="panel-section">
          <h4>Order Status</h4>
          <select className="status-select" value={order.status || 'pending'}
            style={{ color: SC[order.status||'pending']||'#D4AF37', fontWeight:600, fontSize: 14, padding: '8px 12px' }}
            onChange={e => onStatusChange(e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
        </div>
        <div className="panel-actions">
          <button className="btn-primary small" onClick={onDownload}>Download PDF</button>
          <button className="btn-secondary small" onClick={onEmail}>Send Invoice Email</button>
          <a className="btn-whatsapp small"
            href={`https://wa.me/${(order.customer_phone||'').replace(/\D/g,'')}`}
            target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
      </div>
    </div>
  );
}
