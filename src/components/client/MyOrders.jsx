// src/components/client/MyOrders.jsx
import React, { useState, useEffect } from 'react';
import { orderStore } from '../../utils/orderStore';
import { generateInvoicePDF } from '../../utils/pdf';

const SC = { pending:'#EAB308',confirmed:'#3B82F6',processing:'#F97316',shipped:'#8B5CF6',delivered:'#22C55E',cancelled:'#EF4444' };

export default function MyOrders({ setPage }) {
  // Reactive — shows latest status even if admin changed it
  const [allOrders, setAllOrders] = useState(orderStore.getAll());
  useEffect(() => orderStore.subscribe(setAllOrders), []);

  const [email, setEmail]       = useState('');
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState(null);
  const [trackId, setTrackId]   = useState('');
  const [trackPhone, setTrackPhone] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError]   = useState('');

  const filteredOrders = searched
    ? allOrders.filter(o => o.customer_email?.toLowerCase() === email.toLowerCase())
    : [];

  const handleSearch = () => {
    if (!email) return;
    setSearched(true);
    setSelected(null);
  };

  const handleTrack = () => {
    setTrackError('');
    setTrackResult(null);
    const found = allOrders.find(o =>
      o.order_id?.toUpperCase() === trackId.toUpperCase() &&
      (o.customer_phone || '').replace(/\D/g,'').endsWith(trackPhone.replace(/\D/g,'').slice(-10))
    );
    if (found) setTrackResult(found);
    else setTrackError('Order not found. Check Order ID and phone number.');
  };

  // Keep selected in sync with latest order data
  useEffect(() => {
    if (selected) {
      const fresh = allOrders.find(o => o.order_id === selected.order_id);
      if (fresh) setSelected(fresh);
    }
  }, [allOrders]);

  return (
    <div className="my-orders-page">
      <div className="page-header">
        <button className="back-link" onClick={() => setPage('home')}>← Back to Shop</button>
        <h1 className="page-title">My Orders</h1>
        <p className="page-sub">Track your orders &amp; download invoices</p>
      </div>

      {/* Lookup cards */}
      <div className="orders-lookup">
        <div className="lookup-card">
          <h3>Find Orders by Email</h3>
          <div className="lookup-row">
            <input className="lookup-input" type="email" placeholder="Enter your email address"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            <button className="btn-primary" onClick={handleSearch}>Search</button>
          </div>
        </div>

        <div className="lookup-card">
          <h3>Track an Order</h3>
          <div className="lookup-row">
            <input className="lookup-input" placeholder="Order ID (e.g. VAK1ABC23)" value={trackId} onChange={e => setTrackId(e.target.value)} />
            <input className="lookup-input" placeholder="Phone Number" value={trackPhone} onChange={e => setTrackPhone(e.target.value)} />
            <button className="btn-secondary" onClick={handleTrack}>Track</button>
          </div>
          {trackResult && (
            <div className="track-result">
              <span style={{ fontWeight:700, color: SC[trackResult.status]||'#D4AF37' }}>
                {(trackResult.status||'pending').toUpperCase()}
              </span>
              <span style={{ color:'#888', fontSize:13 }}> · {trackResult.order_id} · ₹{trackResult.grand_total}</span>
            </div>
          )}
          {trackError && <p className="track-error">{trackError}</p>}
        </div>
      </div>

      {/* Search results */}
      {searched && filteredOrders.length === 0 && (
        <div className="empty-state">
          <p>No orders found for <strong>{email}</strong>.</p>
          <p style={{ fontSize:13, color:'#666', marginTop:8 }}>Make sure you use the same email you entered when placing the order.</p>
        </div>
      )}

      {!selected && filteredOrders.length > 0 && (
        <div className="orders-grid">
          {filteredOrders.map(order => (
            <div key={order.order_id} className="order-card">
              <div className="order-card-header">
                <span className="order-id">{order.order_id}</span>
                <span className="order-status" style={{ background:`${SC[order.status||'pending']}22`, color:SC[order.status||'pending']||'#D4AF37', border:`1px solid ${SC[order.status||'pending']||'#D4AF37'}` }}>
                  {order.status||'pending'}
                </span>
              </div>
              <div className="order-thumbs">
                {(Array.isArray(order.items)?order.items:[]).slice(0,3).map((item,i) => (
                  <img key={i} src={item.image||''} alt={item.name} className="order-thumb"
                    onError={e => e.target.style.display='none'} />
                ))}
              </div>
              <div className="order-card-info">
                <p className="order-date">{new Date(order.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
                <p className="order-items-count">{(Array.isArray(order.items)?order.items:[]).length} item(s)</p>
                <p className="order-total">₹{order.grand_total}</p>
              </div>
              <div className="order-card-actions">
                <button className="btn-outline-gold small" onClick={() => setSelected(order)}>View Details</button>
                <button className="btn-outline-gold small" onClick={() => generateInvoicePDF(order)}>Download Invoice</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <OrderDetail order={selected} onBack={() => setSelected(null)} />
      )}
    </div>
  );
}

function OrderDetail({ order, onBack }) {
  const items = Array.isArray(order.items) ? order.items : [];
  const statusColor = SC[order.status||'pending'] || '#D4AF37';
  return (
    <div className="order-detail">
      <button className="back-link" onClick={onBack}>← All Orders</button>
      <div className="detail-header">
        <div>
          <h2 className="detail-order-id">{order.order_id}</h2>
          <p className="detail-invoice">{order.invoice_number}</p>
          <span style={{ display:'inline-block', marginTop:8, padding:'4px 12px', borderRadius:100, fontSize:12, fontWeight:700, background:statusColor+'22', color:statusColor, border:`1px solid ${statusColor}` }}>
            {(order.status||'pending').toUpperCase()}
          </span>
        </div>
        <button className="btn-primary" onClick={() => generateInvoicePDF(order)}>
          Download PDF Invoice
        </button>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <h4>Your Details</h4>
          <p><strong>Name:</strong> {order.customer_name}</p>
          <p><strong>Phone:</strong> {order.customer_phone}</p>
          <p><strong>Email:</strong> {order.customer_email||'N/A'}</p>
          <p><strong>Address:</strong> {order.delivery_address}</p>
          {order.special_instructions && <p><strong>Notes:</strong> {order.special_instructions}</p>}
        </div>
        <div className="detail-card">
          <h4>Order Info</h4>
          <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString('en-IN')}</p>
          <p><strong>Status:</strong> <span style={{ color:statusColor, fontWeight:700 }}>{order.status||'pending'}</span></p>
          <p><strong>Payment:</strong> {order.payment_method||'COD'}</p>
          <p><strong>Delivery:</strong> {Number(order.delivery_charge||0)===0 ? 'FREE' : `₹${order.delivery_charge}`}</p>
          <p><strong>Grand Total:</strong> <span style={{ color:'#D4AF37', fontWeight:700 }}>₹{order.grand_total}</span></p>
        </div>
      </div>

      <div className="detail-items">
        <h4>Items Ordered</h4>
        <table className="items-table">
          <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
          <tbody>
            {items.map((item,i) => (
              <tr key={i}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>₹{item.price}</td>
                <td>₹{Number(item.price)*Number(item.quantity)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{ textAlign:'right' }}><strong>Grand Total</strong></td>
              <td><strong style={{ color:'#D4AF37' }}>₹{order.grand_total}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style={{ marginTop:24, display:'flex', gap:12, flexWrap:'wrap' }}>
        <a className="btn-whatsapp"
          href={`https://wa.me/919898937895?text=Hi! My order ${order.order_id} on Vaakif Jewellery. Please update me.`}
          target="_blank" rel="noreferrer">
          Chat on WhatsApp
        </a>
        <button className="btn-secondary" onClick={() => generateInvoicePDF(order)}>
          Download PDF Invoice
        </button>
      </div>
    </div>
  );
}
