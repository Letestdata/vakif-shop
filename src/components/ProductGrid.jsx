// src/components/ProductGrid.jsx
import React from 'react';
import ProductCard from './ProductCard';
import { CATEGORIES, products as allProducts } from '../data/products';

export default function ProductGrid({ selectedCategory, setSelectedCategory, searchQuery }) {
  const filtered = allProducts.filter(p => {
    const catOk = selectedCategory === 'All' || p.category === selectedCategory;
    const srchOk = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return catOk && srchOk;
  });

  return (
    <section className="products-section">
      {/* Category Pills */}
      <div className="category-bar">
        <div className="category-bar-inner">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {catIcon(cat)} {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Section title */}
      <div className="section-title-row">
        <div>
          <h2 className="section-title">
            {selectedCategory === 'All' ? 'Our Collection' : selectedCategory}
          </h2>
          <div className="title-underline" />
        </div>
        <span className="result-count">{filtered.length} items</span>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="products-grid">
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="empty-state">
          <img src="https://cdn-icons-png.flaticon.com/64/6478/6478174.png" alt="empty" style={{ width: 64, opacity: 0.4 }} />
          <p>No products found</p>
          <button className="btn-primary small" onClick={() => setSelectedCategory('All')}>View All</button>
        </div>
      )}

      {/* Free delivery notice */}
      <div className="delivery-notice">
        <img src="https://cdn-icons-png.flaticon.com/32/2830/2830284.png" alt="delivery" style={{ width: 20, filter: 'invert(0.5)' }} />
        Free delivery on orders above ₹999 &nbsp;|&nbsp; Cash on Delivery available
      </div>
    </section>
  );
}

function catIcon(cat) {
  const icons = {
    All: '💎', Necklaces: '📿', Earrings: '✨', Bracelets: '💫',
    Rings: '💍', Bangles: '🔮', Anklets: '🌟', 'Hair Accessories': '👑',
  };
  return icons[cat] || '✦';
}
