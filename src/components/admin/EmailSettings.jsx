// src/components/admin/EmailSettings.jsx
import React, { useState, useEffect } from 'react';
import { sendTestEmail, getEmailConfig } from '../../utils/email';

const STORAGE_KEY = 'vakif_emailjs_config';

export { getEmailConfig };

export default function EmailSettings() {
  const [cfg, setCfg]         = useState({ serviceId:'', templateId:'', publicKey:'', shopEmail:'vakif@gmail.com' });
  const [saved, setSaved]     = useState(false);
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState('');
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    const stored = getEmailConfig();
    if (stored.serviceId) setCfg(c => ({ ...c, ...stored }));
  }, []);

  const isConfigured = !!(cfg.serviceId && cfg.templateId && cfg.publicKey);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleTest = async () => {
    if (!testEmail) { setTestMsg('❌ Enter a test email address first'); return; }
    setTesting(true);
    setTestMsg('Sending test email…');
    try {
      await sendTestEmail(testEmail);
      setTestMsg(`✅ Test email sent to ${testEmail}!\nCheck your inbox (also check Spam folder once).`);
    } catch (err) {
      const msg = err?.text || err?.message || String(err);
      if (msg.includes('recipients') || msg.includes('empty')) {
        setTestMsg(`❌ "recipients address is empty"\n\nFix: In EmailJS → Email Templates → Edit your template\n→ Set the "To Email" field to: {{customer_email}}\n→ Save the template, then retry.`);
      } else if (msg.includes('not configured')) {
        setTestMsg('❌ Save your EmailJS keys first, then retry.');
      } else if (msg.includes('service') || msg.includes('404')) {
        setTestMsg(`❌ Service ID not found.\nCheck: EmailJS → Email Services → copy correct ID.`);
      } else if (msg.includes('template')) {
        setTestMsg(`❌ Template not found.\nCheck: EmailJS → Email Templates → copy correct ID.`);
      } else if (msg.includes('401') || msg.includes('key')) {
        setTestMsg(`❌ Invalid Public Key.\nGet it from: EmailJS → Account (top right) → API Keys.`);
      } else {
        setTestMsg(`❌ ${msg}`);
      }
    }
    setTesting(false);
  };

  return (
    <div className="email-settings">
      <div className={`email-status-banner ${isConfigured ? 'configured' : 'not-configured'}`}>
        <div className="email-status-icon">{isConfigured ? '✅' : '⚠️'}</div>
        <div>
          <strong>{isConfigured ? 'EmailJS configured — customers receive order emails' : 'Email not configured — customers won\'t get confirmation emails'}</strong>
          <p>{isConfigured ? `Service: ${cfg.serviceId} · Template: ${cfg.templateId}` : 'Follow the 5-step guide below to fix this.'}</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Left: guide */}
        <div className="settings-guide">
          <h3 className="dash-card-title">EmailJS Setup Guide (Free · 200 emails/month)</h3>

          {[
            { n:1, title:'Create free EmailJS account',
              body: <><a href="https://emailjs.com" target="_blank" rel="noreferrer">emailjs.com</a> → Sign Up free (no credit card needed)</> },
            { n:2, title:'Connect your Gmail',
              body: <>Dashboard → <b>Email Services</b> → <b>Add Service</b> → <b>Gmail</b> → Connect <code>vakif@gmail.com</code> → <b>Create Service</b> → copy the <b>Service ID</b></> },
            { n:3, title:'Create email template',
              body: <><b>Email Templates</b> → <b>Create New Template</b><br/><br/>
                ✅ <b>To Email</b> field → type: <code>{'{{customer_email}}'}</code> ← Most important!<br/>
                ✅ <b>Subject</b> → <code>{'Order {{order_id}} Confirmed — Vakif Jewellery'}</code><br/>
                ✅ <b>Content</b> → paste the template body from below<br/><br/>
                Click <b>Save</b> → copy the <b>Template ID</b></> },
            { n:4, title:'Get your Public Key',
              body: <>Click your avatar/name (top-right of EmailJS) → <b>Account</b> → under <b>API Keys</b> → copy <b>Public Key</b></> },
            { n:5, title:'Paste all 3 keys here and test',
              body: <>Fill the form → <b>Save Configuration</b> → enter your email → <b>Send Test Email</b></> },
          ].map(s => (
            <div key={s.n} className="guide-step">
              <div className="step-num">{s.n}</div>
              <div className="step-body"><strong>{s.title}</strong><p>{s.body}</p></div>
            </div>
          ))}

          <div className="dash-card" style={{ marginTop:20, border:'1px solid #D4AF3744' }}>
            <h3 className="dash-card-title">⚠️ Most Common Error — "recipients address is empty"</h3>
            <p style={{ fontSize:13, color:'#aaa', lineHeight:1.9 }}>
              1. Go to <b>EmailJS → Email Templates</b><br/>
              2. Click your template → <b>Edit</b><br/>
              3. Find <b>"To Email"</b> field at the top<br/>
              4. Type exactly: <code style={{ background:'#1a1a1a', padding:'2px 6px', borderRadius:4, color:'#F0D060' }}>{'{{customer_email}}'}</code><br/>
              5. Click <b>Save</b> → retry test below
            </p>
          </div>

          <div className="dash-card" style={{ marginTop:16 }}>
            <h3 className="dash-card-title">Email Template Content — copy this</h3>
            <pre className="template-preview">{TEMPLATE}</pre>
            <button className="btn-outline-gold small" style={{ marginTop:10 }}
              onClick={() => { navigator.clipboard?.writeText(TEMPLATE); alert('Copied to clipboard!'); }}>
              Copy Template
            </button>
          </div>
        </div>

        {/* Right: form */}
        <div className="settings-form-col">
          <div className="dash-card">
            <h3 className="dash-card-title">Your EmailJS Keys</h3>
            {[
              { key:'serviceId',  label:'Service ID',   ph:'service_xxxxxxx',   hint:'EmailJS → Email Services' },
              { key:'templateId', label:'Template ID',  ph:'template_xxxxxxx',  hint:'EmailJS → Email Templates' },
              { key:'publicKey',  label:'Public Key',   ph:'AbCdEfGhIjK12345',  hint:'EmailJS → Account → API Keys' },
              { key:'shopEmail',  label:'Shop Email',   ph:'vakif@gmail.com',   hint:'Gets a copy of every order' },
            ].map(f => (
              <div key={f.key} className="form-group">
                <label>{f.label} {f.key!=='shopEmail'&&<span className="req">*</span>}</label>
                <input className="admin-input" placeholder={f.ph}
                  value={cfg[f.key]||''}
                  onChange={e => setCfg(c => ({ ...c, [f.key]: e.target.value.trim() }))} />
                <small>{f.hint}</small>
              </div>
            ))}
            <button className="btn-primary full" onClick={handleSave}>
              {saved ? '✅ Saved!' : 'Save Configuration'}
            </button>
          </div>

          <div className="dash-card" style={{ marginTop:16 }}>
            <h3 className="dash-card-title">Send Test Email</h3>
            <div className="form-group">
              <label>Your Gmail to test</label>
              <input className="admin-input" type="email" placeholder="yourname@gmail.com"
                value={testEmail} onChange={e => setTestEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleTest()} />
            </div>
            <button className="btn-secondary full" onClick={handleTest} disabled={testing}>
              {testing ? 'Sending…' : 'Send Test Email'}
            </button>
            {testMsg && (
              <div className={`test-result ${testMsg.startsWith('✅') ? 'success' : 'error'}`}
                style={{ whiteSpace:'pre-wrap', marginTop:12 }}>
                {testMsg}
              </div>
            )}
          </div>

          <div className="dash-card" style={{ marginTop:16 }}>
            <h3 className="dash-card-title">What emails are sent</h3>
            <ul className="email-features-list">
              {[
                'Customer gets order confirmation in Gmail inbox',
                'Shop owner (vakif@gmail.com) gets a copy',
                'Emails come from your own Gmail — not spam',
                'Order ID, invoice number, full items list',
                'Grand total and delivery address',
                'WhatsApp link to confirm order',
              ].map(f => <li key={f}><span className="check">✓</span> {f}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const TEMPLATE = `Dear {{customer_name}},

Thank you for your order at Vakif Jewellery!

ORDER ID   : {{order_id}}
INVOICE NO : {{invoice_number}}

ITEMS ORDERED:
{{order_items}}

Subtotal    : {{subtotal}}
Delivery    : {{delivery_charge}}
GRAND TOTAL : {{grand_total}}

DELIVERY ADDRESS:
{{delivery_address}}

Phone : {{customer_phone}}
Notes : {{special_instructions}}

We will contact you on WhatsApp to confirm.
WhatsApp: wa.me/919898937895

Thank you for shopping with Vakif Jewellery!
Supur, Idar, Gujarat — 383430
vakif@gmail.com | +91 98989 37895`;
