// src/App.jsx — Root component + page routing
import React, { useState } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import TopNav      from './components/TopNav';
import Header      from './components/Header';
import Hero        from './components/Hero';
import ProductGrid from './components/ProductGrid';
import CartModal   from './components/CartModal';
import Footer      from './components/Footer';
import MyOrders    from './components/client/MyOrders';
import AdminPanel  from './components/admin/AdminPanel';

/* Floating cart FAB (mobile / sticky) */
function CartFAB() {
  const { cartCount, setIsCartOpen } = useCart();
  if (cartCount === 0) return null;
  return (
    <button className="cart-fab" onClick={() => setIsCartOpen(true)} aria-label="Open cart">
      <img
        src="https://cdn-icons-png.flaticon.com/32/3144/3144456.png"
        alt="cart"
        style={{ width: 22, filter: 'invert(1)' }}
      />
      <span className="cart-fab-count">{cartCount}</span>
    </button>
  );
}

/* Inner app — has access to all contexts */
function AppInner() {
  const [page, setPage]                         = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery]           = useState('');
  const { isAdmin }                             = useAuth();

  const goTo = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (page === 'admin') {
    return <AdminPanel setPage={goTo} />;
  }

  return (
    <>
      <TopNav onFilterBadge={() => { setSelectedCategory('All'); goTo('home'); }} />

      <Header
        page={page}
        setPage={goTo}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        isAdmin={isAdmin}
        onAdminClick={() => goTo('admin')}
      />

      <main className="main-content">
        {page === 'home' && (
          <>
            <Hero setPage={goTo} />
            <ProductGrid
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchQuery={searchQuery}
            />
          </>
        )}
        {page === 'orders' && <MyOrders setPage={goTo} />}
      </main>

      <Footer setPage={goTo} />
      <CartModal onOrderSuccess={() => {}} />

      {/* Floating WhatsApp */}
      <a
        className="whatsapp-float"
        href="https://wa.me/919898937895?text=Hi! I have a question about Vakif Jewellery."
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <img src="https://cdn-icons-png.flaticon.com/64/733/733585.png" alt="WhatsApp" />
      </a>

      <CartFAB />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppInner />
      </CartProvider>
    </AuthProvider>
  );
}
