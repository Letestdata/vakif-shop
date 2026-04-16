// src/utils/email.js
// Sends order confirmation emails via EmailJS
// Falls back to Formspree (shop owner only) if EmailJS not configured

const FORMSPREE = 'https://formspree.io/f/xdapznrw';

function getConfig() {
  try { return JSON.parse(localStorage.getItem('vakif_emailjs_config') || '{}'); }
  catch { return {}; }
}

// Load EmailJS SDK from CDN once
let ejsLoading = null;
async function loadEJS(publicKey) {
  if (!ejsLoading) {
    ejsLoading = new Promise((resolve, reject) => {
      if (window.emailjs) { resolve(); return; }
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
      s.onload = resolve;
      s.onerror = () => reject(new Error('Could not load EmailJS'));
      document.head.appendChild(s);
    });
  }
  await ejsLoading;
  window.emailjs.init(publicKey);
}

// Build flat template params from an order object
function buildParams(order) {
  const items = Array.isArray(order.items) ? order.items : [];
  const itemsText = items.length
    ? items.map(i => `${i.name}  x${i.quantity}  =  Rs.${Number(i.price) * Number(i.quantity)}`).join('\n')
    : 'No items';

  const delivery = Number(order.delivery_charge || 0);

  return {
    // ── recipient — BOTH field names so any template works ──
    to_email:             order.customer_email,
    customer_email:       order.customer_email,
    reply_to:             order.customer_email,

    // ── order info ──
    order_id:             order.order_id        || '',
    invoice_number:       order.invoice_number  || '',
    order_items:          itemsText,
    subtotal:             `Rs.${Number(order.subtotal    || order.grand_total || 0)}`,
    delivery_charge:      delivery === 0 ? 'FREE' : `Rs.${delivery}`,
    grand_total:          `Rs.${Number(order.grand_total || 0)}`,

    // ── customer info ──
    customer_name:        order.customer_name        || '',
    customer_phone:       order.customer_phone       || '',
    delivery_address:     order.delivery_address     || '',
    special_instructions: order.special_instructions || 'None',

    // ── shop info ──
    shop_email:           getConfig().shopEmail || 'vakif@gmail.com',
    shop_name:            'Vakif Jewellery',
    shop_phone:           '+91 98989 37895',
    shop_address:         'Supur, Idar, Gujarat — 383430',
    whatsapp_link:        'https://wa.me/919898937895',
  };
}

// ── Main export — send order confirmation ────────────────────────
export async function sendOrderConfirmation(order) {
  if (!order.customer_email) {
    console.warn('sendOrderConfirmation: no customer_email, skipping');
    return { ok: false, reason: 'no_email' };
  }

  const cfg = getConfig();

  // ── Try EmailJS ──────────────────────────────────────────────
  if (cfg.serviceId && cfg.templateId && cfg.publicKey) {
    try {
      await loadEJS(cfg.publicKey);
      const params = buildParams(order);

      // 1. Send to customer
      await window.emailjs.send(cfg.serviceId, cfg.templateId, params);

      // 2. CC shop owner (swap recipient only)
      const shopParams = {
        ...params,
        to_email:       cfg.shopEmail || 'vakif@gmail.com',
        customer_email: cfg.shopEmail || 'vakif@gmail.com',
        customer_name:  `[SHOP COPY] New order from ${order.customer_name}`,
      };
      await window.emailjs.send(cfg.serviceId, cfg.templateId, shopParams);

      console.log('✅ EmailJS: sent to', order.customer_email, '+ shop owner');
      return { ok: true, method: 'emailjs' };

    } catch (err) {
      const raw = err?.text || err?.message || String(err);
      console.warn('EmailJS failed:', raw);

      // Surface a helpful error to callers
      if (raw.includes('recipients') || raw.includes('empty')) {
        return { ok: false, method: 'emailjs', reason: 'template_to_empty', raw };
      }
      return { ok: false, method: 'emailjs', reason: raw, raw };
    }
  }

  // ── Formspree fallback (shop owner only) ─────────────────────
  try {
    const items = Array.isArray(order.items) ? order.items : [];
    const res = await fetch(FORMSPREE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject:  `New Order ${order.order_id} — ${order.customer_name}`,
        _replyto:  order.customer_email,
        order_id:  order.order_id,
        customer:  `${order.customer_name} | ${order.customer_phone} | ${order.customer_email}`,
        address:   order.delivery_address,
        items:     items.map(i => `${i.name} x${i.quantity} = Rs.${Number(i.price) * Number(i.quantity)}`).join(' | '),
        total:     `Rs.${order.grand_total}`,
        note:      '⚠️ Customer did NOT receive this email. Configure EmailJS in Admin → Email Settings.',
      }),
    });
    console.log('Formspree:', res.ok ? 'shop notified (no customer email)' : 'also failed');
    return { ok: false, method: 'formspree', reason: 'emailjs_not_configured' };
  } catch (err) {
    console.warn('Formspree also failed:', err.message);
    return { ok: false, method: 'none' };
  }
}

// ── Test send from admin ─────────────────────────────────────────
export async function sendTestEmail(toEmail) {
  const cfg = getConfig();
  if (!cfg.serviceId || !cfg.templateId || !cfg.publicKey) {
    throw new Error('EmailJS not configured. Fill in Service ID, Template ID, and Public Key.');
  }
  if (!toEmail) throw new Error('Enter a test email address.');

  await loadEJS(cfg.publicKey);

  const testOrder = {
    customer_email:       toEmail,
    order_id:             'TEST-001',
    invoice_number:       'INV-TEST-001',
    customer_name:        'Test Customer',
    customer_phone:       '+91 98989 37895',
    delivery_address:     'Supur, Idar, Gujarat — 383430',
    special_instructions: 'This is a test email from Vakif Admin Panel',
    items: [
      { name: 'Royal Kundan Necklace Set', quantity: 1, price: 899 },
      { name: 'Pearl Drop Earrings',       quantity: 2, price: 349 },
    ],
    subtotal:        1597,
    delivery_charge: 0,
    grand_total:     1597,
  };

  const params = buildParams(testOrder);
  const res = await window.emailjs.send(cfg.serviceId, cfg.templateId, params);

  if (res.status !== 200) throw new Error(`EmailJS returned status ${res.status}`);
  return res;
}

export { getConfig as getEmailConfig };
export { loadEJS as loadEmailJS };
