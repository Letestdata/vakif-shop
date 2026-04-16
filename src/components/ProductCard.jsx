// src/components/ProductCard.jsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const STAR = '★';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="product-card">
      {/* Badge */}
      {product.badge && (
        <div className={`product-badge badge-${product.badge.replace(/[^a-z]/gi,'').toLowerCase()}`}>
          {product.badge}
        </div>
      )}

      {/* Discount tag */}
      {discount && <div className="discount-tag">{discount}% OFF</div>}

      {/* Image */}
      <div className="product-img-wrap">
        <img
          src={imgErr ? 'https://via.placeholder.com/300x300/1a1a1a/D4AF37?text=VAKIF' : product.image}
          alt={product.name}
          className="product-img"
          loading="lazy"
          onError={() => setImgErr(true)}
        />
        {/* <div className="product-img-overlay">
          <span className="overlay-text">View Details</span>
        </div> */}
      </div>

      {/* Info */}
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>

        {/* Rating */}
        <div className="product-rating">
          <span className="stars">
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{ color: i < Math.round(product.rating) ? '#D4AF37' : '#333' }}>
                {STAR}
              </span>
            ))}
          </span>
          <span className="rating-num">{product.rating}</span>
          <span className="rating-count">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="product-price-row">
          <span className="product-price">₹{product.price}</span>
          {product.originalPrice && (
            <span className="product-original">₹{product.originalPrice}</span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          className={`add-to-cart-btn ${added ? 'added' : ''}`}
          onClick={handleAdd}
        >
          {added ? (
            <>
              <img src="https://cdn-icons-png.flaticon.com/32/190/190411.png" alt="added" style={{ width: 16, filter: 'invert(1)', marginRight: 6 }} />
              Added!
            </>
          ) : (
            <>
              <img src="https://cdn-icons-png.flaticon.com/32/3144/3144456.png" alt="cart" style={{ width: 16, filter: 'invert(1)', marginRight: 6 }} />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
