// src/components/Header.jsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { CATEGORIES } from '../data/products';

export default function Header({ page, setPage, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, isAdmin, onAdminClick }) {
  const { cartCount, setIsCartOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="main-header">
      <div className="header-inner">
        {/* Left — menu + categories */}
        <div className="header-left">
          <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="menu-icon">
              <span /><span /><span />
            </span>
          </button>
          <nav className={`cat-nav ${menuOpen ? 'open' : ''}`}>
            {CATEGORIES.filter(c => c !== 'All').map(cat => (
              <button
                key={cat}
                className={`cat-nav-item ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(cat);
                  setPage('home');
                  setMenuOpen(false);
                }}
              >
                {cat}
              </button>
            ))}
          </nav>
        </div>

        {/* Center — Logo */}
        <div className="header-center">
          <button className="logo-btn" onClick={() => { setPage('home'); setSelectedCategory('All'); }}>
            <div className="header-logo">
              <span className="logo-v">V</span>
              <span className="logo-akif">AAKIF</span>
            </div>
            <div className="logo-subtitle">JEWELLERY</div>
          </button>
        </div>

        {/* Right — search, lang, cart, profile */}
        <div className="header-right">
          <div className="search-wrap">
            <img
              src="https://cdn-icons-png.flaticon.com/32/954/954591.png"
              alt="search"
              className="search-icon-img"
            />
            <input
              className="search-input"
              placeholder="Search jewelry, orders..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') setPage('home'); }}
            />
          </div>

          <button className="icon-btn cart-btn" onClick={() => setIsCartOpen(true)}>
            <img src="https://cdn-icons-png.flaticon.com/32/3144/3144456.png" alt="cart" style={{ width: 22, filter: 'invert(1)' }} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          <button
            className="icon-btn profile-btn"
            onClick={onAdminClick}
            title={isAdmin ? 'Admin Panel' : 'Admin Login'}
          >
            <img
              src={isAdmin
                ? 'https://cdn-icons-png.flaticon.com/32/3135/3135715.png'
                : 'https://cdn-icons-png.flaticon.com/32/1077/1077012.png'}
              alt="profile"
              style={{ width: 22, filter: 'invert(1)' }}
            />
            {isAdmin && <span className="admin-dot" />}
          </button>

          <button
            className="orders-btn"
            onClick={() => setPage('orders')}
          >
            My Orders
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="mobile-search">
        <img src="https://cdn-icons-png.flaticon.com/32/954/954591.png" alt="search" className="search-icon-img" />
        <input
          className="search-input"
          placeholder="Search jewellery..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
    </header>
  );
}
