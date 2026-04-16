// src/components/admin/InvoiceManager.jsx
import React, { useState, useEffect } from 'react';
import { orderStore } from '../../utils/orderStore';
import { generateInvoicePDF } from '../../utils/pdf';
import { sendOrderConfirmation } from '../../utils/email';

const SC = { pending:'#EAB308',confirmed:'#3B82F6',processing:'#F97316',shipped:'#8B5CF6',delivered:'#22C55E',cancelled:'#EF4444' };

export default function InvoiceManager() {
  const [orders, setOrders] = useState(orderStore.getAll());
  useEffect(() => orderStore.subscribe(setOrders), []);

  const [toast, setToast] = useState('');
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  const sendEmail = async (order) => {
    if (!order.customer_email) { showToast('❌ No customer email on this order'); return; }
    showToast('Sending…');
    const result = await sendOrderConfirmation(order);
    if (result.ok) {
      showToast(`✅ Invoice sent to ${order.customer_email}`);
    } else if (result.reason === 'template_to_empty') {
      showToast('❌ EmailJS template "To Email" field is empty.\nFix it in Admin → Email Settings.');
    } else if (result.reason === 'emailjs_not_configured') {
      showToast('❌ EmailJS not configured — go to Email Settings tab');
    } else {
      showToast(`❌ Failed: ${String(result.reason).slice(0,80)}`);
    }
  };

  return (
    <div className="invoice-manager">
      {toast && <div className="update-toast" style={{ whiteSpace:'pre-wrap' }}>{toast}</div>}

      <div className="inv-header-row">
        <h3>All Invoices ({orders.length})</h3>
        <button className="btn-primary small"
          onClick={() => { if (window.confirm(`Download ${orders.length} PDFs?`)) orders.forEach(o => generateInvoicePDF(o)); }}>
          Bulk Download All PDFs
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state"><p>No orders yet. Place a test order from the shop.</p></div>
      ) : (
        <div className="invoice-grid">
          {orders.map(order => {
            const items = Array.isArray(order.items) ? order.items : [];
            return (
              <div key={order.order_id} className="invoice-card">
                <div className="inv-card-header">
                  <div>
                    <div className="inv-number">{order.invoice_number || 'INV-'+order.order_id}</div>
                    <div className="inv-order-id">{order.order_id}</div>
                  </div>
                  <div className="inv-status" style={{ background:`${SC[order.status]||'#D4AF37'}22`, color:SC[order.status]||'#D4AF37', border:`1px solid ${SC[order.status]||'#D4AF37'}` }}>
                    {order.status||'pending'}
                  </div>
                </div>
                <div className="inv-customer">
                  <p><b>{order.customer_name}</b></p>
                  <p style={{ fontSize:13, color:'#888' }}>{order.customer_phone}</p>
                  <p style={{ fontSize:12, color: order.customer_email ? '#888' : '#EF4444' }}>
                    {order.customer_email || '⚠️ No email'}
                  </p>
                </div>
                <div className="inv-summary">
                  <span className="inv-items-count">{items.length} item(s)</span>
                  <span className="inv-total">₹{Number(order.grand_total||0).toFixed(2)}</span>
                </div>
                <div className="inv-date">
                  {new Date(order.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                </div>
                <div className="inv-actions">
                  <button className="btn-primary small" onClick={() => generateInvoicePDF(order)}>Download PDF</button>
                  <button className="btn-outline-gold small" onClick={() => sendEmail(order)}
                    disabled={!order.customer_email}
                    title={!order.customer_email ? 'No email on this order' : 'Send invoice email'}>
                    Send Email
                  </button>
                </div>
                <details className="inv-preview-details">
                  <summary>Preview Items</summary>
                  <div className="inv-items-list">
                    {items.map((item, i) => (
                      <div key={i} className="inv-item-row">
                        <span>{item.name}</span><span>×{item.quantity}</span>
                        <span>₹{Number(item.price)*Number(item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
