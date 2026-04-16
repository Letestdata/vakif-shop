// src/components/CartModal.jsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { orderStore } from '../utils/orderStore';
import { sendOrderConfirmation } from '../utils/email';

export default function CartModal({ onOrderSuccess }) {
  const {
    cart, removeFromCart, updateQuantity, clearCart,
    cartCount, cartSubtotal, deliveryCharge, cartTotal,
    isCartOpen, setIsCartOpen,
  } = useCart();

  const [view, setView]         = useState('cart');
  const [loading, setLoading]   = useState(false);
  const [emailStatus, setEmailStatus] = useState('');
  const [form, setForm]         = useState({
    customer_name: '', customer_email: '', customer_phone: '',
    delivery_address: '', special_instructions: '',
  });
  const [orderData, setOrderData] = useState(null);

  if (!isCartOpen) return null;

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.customer_phone || !form.delivery_address || !form.customer_email) {
      alert('Please fill in all required fields including email.');
      return;
    }
    if (cart.length === 0) { alert('Cart is empty'); return; }

    setLoading(true);

    const items = cart.map(i => ({
      id: i.id, name: i.name, price: i.price, quantity: i.quantity, category: i.category, image: i.image,
    }));

    const orderId  = 'VAK' + Date.now().toString(36).toUpperCase().slice(-6);
    const invoiceN = 'INV-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + orderId.slice(3);

    const order = {
      order_id:             orderId,
      invoice_number:       invoiceN,
      ...form,
      items,
      subtotal:             cartSubtotal,
      delivery_charge:      deliveryCharge,
      grand_total:          cartTotal,
      status:               'pending',
      payment_method:       'COD',
      payment_status:       'unpaid',
      created_at:           new Date().toISOString(),
    };

    // 1. Save to store immediately
    orderStore.add(order);

    // 2. Try PHP backend (fire & forget)
    fetch('/vakif-api/orders.php?action=create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    }).catch(() => {});

    // 3. Send email (non-blocking — don't wait)
    sendOrderConfirmation(order).then(result => {
      if (result.ok) {
        setEmailStatus('✅ Confirmation email sent!');
      } else if (result.reason === 'template_to_empty') {
        setEmailStatus('⚠️ Email not sent — fix EmailJS template "To Email" field in Admin → Email Settings');
      } else if (result.reason === 'emailjs_not_configured') {
        setEmailStatus('⚠️ Configure EmailJS in Admin → Email Settings to send customer emails');
      }
    });

    clearCart();
    setOrderData(order);
    setView('success');
    setLoading(false);
    if (onOrderSuccess) onOrderSuccess();
  };

  return (
    <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
      <div className="cart-modal" onClick={e => e.stopPropagation()}>

        <div className="cart-header">
          <h2 className="cart-title">
            {view === 'cart' ? `Cart (${cartCount})` : view === 'checkout' ? 'Checkout' : 'Order Placed!'}
          </h2>
          <button className="cart-close" onClick={() => { setIsCartOpen(false); setView('cart'); setEmailStatus(''); }}>✕</button>
        </div>

        {/* CART */}
        {view === 'cart' && (
          <div className="cart-body">
            {cart.length === 0 ? (
              <div className="cart-empty">
                <img src="https://cdn-icons-png.flaticon.com/64/2038/2038854.png" alt="empty" style={{ width: 64, opacity: 0.4 }} />
                <p>Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <img src={item.image} alt={item.name} className="cart-item-img" onError={e => e.target.style.display = 'none'} />
                      <div className="cart-item-info">
                        <p className="cart-item-name">{item.name}</p>
                        <p className="cart-item-cat">{item.category}</p>
                        <div className="cart-item-price-row">
                          <span className="cart-item-price">₹{item.price}</span>
                          <span className="cart-item-sub">× {item.quantity} = ₹{item.price * item.quantity}</span>
                        </div>
                      </div>
                      <div className="cart-item-controls">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                        <button className="remove-btn" onClick={() => removeFromCart(item.id)}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-totals">
                  <div className="total-row"><span>Subtotal</span><span>₹{cartSubtotal}</span></div>
                  <div className="total-row">
                    <span>Delivery</span>
                    <span>{deliveryCharge === 0 ? <span className="free-tag">FREE</span> : `₹${deliveryCharge}`}</span>
                  </div>
                  {deliveryCharge > 0 && <div className="free-hint">Add ₹{999 - cartSubtotal} more for free delivery</div>}
                  <div className="total-row grand"><span>Total</span><span>₹{cartTotal}</span></div>
                </div>
                <button className="btn-primary full" onClick={() => setView('checkout')}>
                  Proceed to Checkout →
                </button>
              </>
            )}
          </div>
        )}

        {/* CHECKOUT */}
        {view === 'checkout' && (
          <div className="cart-body">
            <button className="back-btn" onClick={() => setView('cart')}>← Back to Cart</button>
            <form className="checkout-form" onSubmit={handlePlaceOrder}>
              <div className="form-group">
                <label>Full Name <span className="req">*</span></label>
                <input name="customer_name" placeholder="Your full name" value={form.customer_name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email Address <span className="req">*</span></label>
                <input name="customer_email" type="email" placeholder="you@gmail.com" value={form.customer_email} onChange={handleChange} required />
                <small style={{ color: '#888', fontSize: 11 }}>Order confirmation will be sent here</small>
              </div>
              <div className="form-group">
                <label>Phone Number <span className="req">*</span></label>
                <input name="customer_phone" placeholder="+91 XXXXX XXXXX" value={form.customer_phone} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Delivery Address <span className="req">*</span></label>
                <textarea name="delivery_address" rows={3} placeholder="House/Flat, Street, City, Pincode" value={form.delivery_address} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Special Instructions</label>
                <textarea name="special_instructions" rows={2} placeholder="Any special notes..." value={form.special_instructions} onChange={handleChange} />
              </div>
              <div className="order-summary-mini">
                <strong>Order Summary</strong>
                {cart.map(i => (
                  <div key={i.id} className="mini-item">
                    <span>{i.name} × {i.quantity}</span><span>₹{i.price * i.quantity}</span>
                  </div>
                ))}
                <div className="mini-total"><span>Grand Total</span><span>₹{cartTotal}</span></div>
              </div>
              <button type="submit" className="btn-primary full" disabled={loading}>
                {loading ? 'Placing Order…' : `Place Order — ₹${cartTotal}`}
              </button>
              <p className="checkout-note">Cash on Delivery · Confirmation email sent to your inbox</p>
            </form>
          </div>
        )}

        {/* SUCCESS */}
        {view === 'success' && orderData && (
          <div className="cart-body success-view">
            <div style={{ fontSize: 56, lineHeight: 1 }}>✅</div>
            <h3 className="success-title">Order Placed!</h3>
            <p className="success-msg">
              Order <strong>{orderData.order_id}</strong> confirmed.
              {' '}<span style={{ color: '#888' }}>Confirmation sending to <strong>{orderData.customer_email}</strong></span>
            </p>
            {emailStatus && (
              <div style={{
                padding: '10px 14px', borderRadius: 8, fontSize: 13,
                background: emailStatus.startsWith('✅') ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
                border: `1px solid ${emailStatus.startsWith('✅') ? '#22C55E' : '#EAB308'}`,
                color: emailStatus.startsWith('✅') ? '#22C55E' : '#EAB308',
                width: '100%', textAlign: 'center',
              }}>
                {emailStatus}
              </div>
            )}
            <div className="order-confirm-details">
              <div><span>Invoice</span><span>{orderData.invoice_number}</span></div>
              <div><span>Total</span><span>₹{orderData.grand_total}</span></div>
              <div>
                <span>Address</span>
                <span style={{ maxWidth: 180, textAlign: 'right', wordBreak: 'break-word' }}>
                  {(orderData.delivery_address || '').slice(0, 50)}{(orderData.delivery_address || '').length > 50 ? '…' : ''}
                </span>
              </div>
            </div>
            <a className="btn-whatsapp" style={{ width: '100%', justifyContent: 'center' }}
              href={`https://wa.me/919898937895?text=Hi! My order ${orderData.order_id} placed on Vakif Jewellery. Please confirm.`}
              target="_blank" rel="noreferrer">
              Chat on WhatsApp to Confirm
            </a>
            <button className="btn-secondary" style={{ marginTop: 10, width: '100%' }}
              onClick={() => { setIsCartOpen(false); setView('cart'); setEmailStatus(''); }}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
