// src/emailConfig.js
// ═══════════════════════════════════════════════════════
//  STEP 1: Go to https://emailjs.com → Sign up FREE
//  STEP 2: Add Email Service → Choose Gmail → Connect vakif@gmail.com
//  STEP 3: Note your SERVICE ID (looks like: service_abc123)
//  STEP 4: Create Email Template (use the template in README.md)
//  STEP 5: Note your TEMPLATE ID (looks like: template_abc123)
//  STEP 6: Go to Account → API Keys → note PUBLIC KEY
//  STEP 7: Paste all 3 values below and save
// ═══════════════════════════════════════════════════════

const EMAIL_CONFIG = {
  serviceId:   'service_XXXXXXX',   // ← REPLACE with your EmailJS Service ID
  templateId:  'template_XXXXXXX',  // ← REPLACE with your EmailJS Template ID
  publicKey:   'XXXXXXXXXXXXXXXXXXXX', // ← REPLACE with your EmailJS Public Key

  shopEmail:   'vakif@gmail.com',   // Shop owner — always gets a copy
  shopName:    'Vakif Jewellery',
  shopPhone:   '+91 98989 37895',
  shopAddress: 'Supur, Idar, Gujarat',
  whatsapp:    '919898937895',

  formspreeId: 'xdapznrw',          // Fallback only — shop owner copy
};

export default EMAIL_CONFIG;
