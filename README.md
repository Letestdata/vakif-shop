<<<<<<< HEAD
# VAKIF JEWELLERY — Full-Stack React + PHP + MySQL Website

## 🏗️ Project Structure
```
vakif-shop/
├── public/index.html          ← HTML entry (Google Fonts, loading screen)
├── src/
│   ├── index.js               ← React entry point
│   ├── App.jsx                ← Main router + providers
│   ├── App.css                ← ALL styles (luxury gold/black theme)
│   ├── data/products.js       ← 12 artificial jewellery products
│   ├── context/
│   │   ├── CartContext.jsx    ← Cart state (localStorage)
│   │   └── AuthContext.jsx    ← Admin auth state
│   ├── components/
│   │   ├── TopNav.jsx         ← Dark strip navigation
│   │   ├── Header.jsx         ← Logo, search, cart, profile
│   │   ├── Hero.jsx           ← 3D rotating logo + CTA
│   │   ├── ProductGrid.jsx    ← Category filter + product listing
│   │   ├── ProductCard.jsx    ← Individual product card
│   │   ├── CartModal.jsx      ← Cart slide-over + checkout form
│   │   ├── Footer.jsx         ← Links, social, WhatsApp
│   │   ├── admin/
│   │   │   ├── AdminPanel.jsx ← Admin login + layout
│   │   │   ├── Dashboard.jsx  ← Stats, charts, recent orders
│   │   │   ├── OrdersManager.jsx ← Full CRUD order management
│   │   │   └── InvoiceManager.jsx ← PDF & email invoices
│   │   └── client/
│   │       └── MyOrders.jsx   ← Track orders, view & download invoices
│   └── utils/
│       └── pdf.js             ← jsPDF invoice generator
├── api/
│   ├── config.php             ← DB connection + helpers
│   ├── orders.php             ← Customer order endpoints
│   └── admin.php              ← Admin CRUD + email
├── vakifshop.sql              ← MySQL schema
└── package.json
```

---

## 🚀 Setup Instructions

### Step 1 — Database (XAMPP)
1. Start **XAMPP** → Start **Apache** + **MySQL**
2. Open `http://localhost/phpmyadmin`
3. Click **Import** → Upload `vakifshop.sql`
4. Or run: `mysql -u root < vakifshop.sql`

### Step 2 — PHP API
1. Copy the `api/` folder to:
   `C:\xampp\htdocs\vakif-api\`
2. Edit `api/config.php` if your MySQL password differs from default (empty)
3. Test: `http://localhost/vakif-api/orders.php?action=list`

### Step 3 — React App
```bash
cd vakif-shop
npm install
npm start
```
The app runs at `http://localhost:3000` and proxies API calls to `http://localhost/vakif-api`

### Step 4 — Production Build
```bash
npm run build
# Copy the build/ folder to C:\xampp\htdocs\vakif\
```
Then visit `http://localhost/vakif/`

---

## 🔑 Admin Access
- URL: Click the 👤 profile icon → redirects to Admin Panel
- Username: `admin`
- Password: `vakif@admin123`

> ⚠️ Change the password in `api/config.php` → `ADMIN_PASS` constant

---

## 📧 Email Setup
Orders are sent via:
1. **Formspree** (fallback, no server needed): `https://formspree.io/f/xdapznrw`
2. **PHP mail()** via XAMPP (when server is running)

For SMTP email, configure in `api/config.php`:
```php
define('SMTP_FROM', 'noreply@vakifshop.com');
```

---

## 📄 PDF Invoices
- Uses **jsPDF + jspdf-autotable**
- Auto-generated on order placement
- Downloadable by customer (My Orders page)
- Downloadable by admin (Admin → Invoices)
- Branded with Vakif gold/black theme

---

## 🛒 Features
- ✅ 12 artificial jewellery products across 7 categories
- ✅ Category filters + search
- ✅ Cart with localStorage persistence
- ✅ Checkout form (Formspree + PHP backend)
- ✅ Order email to customer + shop owner
- ✅ PDF invoice generation (jsPDF)
- ✅ Admin panel (dashboard, orders, invoices)
- ✅ Order status management
- ✅ My Orders page (track by email/phone)
- ✅ 3D rotating VAKIF logo in hero
- ✅ WhatsApp floating button
- ✅ Amazon + Meesho store links
- ✅ Mobile-responsive
- ✅ Free delivery on orders ₹999+

---

## 🎨 Design
- **Theme:** Luxury gold (#D4AF37) × black (#0a0a0a)
- **Fonts:** Cinzel (headings) + Cormorant Garamond (body)
- **3D Hero:** CSS perspective cube with rotating VAKIF logo
- **Animations:** Particle rain, floating images, hover effects

---

## 📞 Shop Info
- **Shop:** Vakif Jewellery
- **Location:** Supur, Idar, Gujarat — 383430
- **Phone:** +91 98989 37895
- **Email:** vakif@gmail.com
- **WhatsApp:** wa.me/919898937895
- **Amazon:** https://www.amazon.in/b?ie=UTF8&node=27943762031&me=A21JP2DQLC3LTM
- **Meesho:** https://www.meesho.com/VAAKIFENTERPRISE?_ms=3.0.1

---

## ✉ EmailJS Setup — REQUIRED for customer emails

### Why EmailJS?
- Formspree only emails the **shop owner**
- EmailJS sends email through **your own Gmail** → lands in inbox, not spam
- Free plan: 200 emails/month

### Step-by-step (5 minutes)

**1.** Go to **https://emailjs.com** → Sign up free

**2.** Email Services → **Add Service** → choose **Gmail** → connect `vakif@gmail.com`
- Note your **Service ID** (e.g. `service_abc1234`)

**3.** Email Templates → **Create New Template**
- Set **To Email** field = `{{to_email}}`
- Set **Reply To** field = `{{reply_to}}`
- Paste this as the template body:

```
Subject: Order {{order_id}} Confirmed — Vakif Jewellery

Dear {{customer_name}},

Thank you for shopping at Vakif Jewellery! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order ID   : {{order_id}}
Invoice No : {{invoice_number}}

ITEMS ORDERED:
{{order_items}}

Subtotal       : {{subtotal}}
Delivery       : {{delivery_charge}}
Grand Total    : {{grand_total}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DELIVERY ADDRESS
{{delivery_address}}

Phone          : {{customer_phone}}
Special Notes  : {{special_instructions}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

We will contact you on WhatsApp to confirm availability and delivery.

WhatsApp: https://wa.me/919898937895

Thank you for choosing Vakif Jewellery!

— {{shop_name}}
   {{shop_address}}
   {{shop_phone}}
   {{shop_email}}
```

- Note your **Template ID** (e.g. `template_xyz9876`)

**4.** Go to **Account → General** → copy your **Public Key**

**5.** Open `src/emailConfig.js` and replace the 3 values:

```js
serviceId:  'service_abc1234',    // your Service ID
templateId: 'template_xyz9876',   // your Template ID
publicKey:  'your_public_key',    // your Public Key
```

**6.** Save and restart: `npm start` — emails will now work!

### How to verify
Open browser DevTools (F12) → Console tab → place a test order.
You will see either:
- `[Email] EmailJS: sent ✓` — working correctly
- `[Email] EmailJS failed` — check your keys in emailConfig.js
=======
# vakif-shop
>>>>>>> ce62a53c541de25d9f5f156def2bcbeb87f92888
