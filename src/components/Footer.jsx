// src/components/Footer.jsx
import React from 'react';

export default function Footer({ setPage }) {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="logo-v">V</span><span className="logo-akif">AAKIF</span>
          </div>
          <p className="footer-tagline">Luxury Artificial Jewellery</p>
          <p className="footer-about">
            Crafting elegance since 2020. Discover our exquisite collection of
            necklaces, earrings, bangles &amp; more — designed for every occasion.
          </p>
          <div className="footer-social">
            <a href="https://wa.me/919898937895" target="_blank" rel="noreferrer" className="social-btn whatsapp">
              <img src="https://cdn-icons-png.flaticon.com/32/733/733585.png" alt="WhatsApp" style={{ width: 18, filter: 'contrast(1)' }} />
            </a>
            <a href="https://www.amazon.in/b?ie=UTF8&node=27943762031&me=A21JP2DQLC3LTM" target="_blank" rel="noreferrer" className="social-btn">
              <img src="https://i.ibb.co/gM95Y8gH/amazon-logo-amazon-icon-free-free-vector.jpg" alt="Amazon" style={{ width: 18, filter: 'contrast(1)' }} />
            </a>
            <a href="https://www.meesho.com/VAAKIFENTERPRISE?_ms=3.0.1" target="_blank" rel="noreferrer" className="social-btn">
              <img src="https://cdn-icons-png.flaticon.com/32/732/732200.png" alt="Meesho" style={{ width: 18, filter: 'contrast(1)' }} />
            </a>
          </div>
        </div>

        <div className="footer-links-col">
          <h4>Shop</h4>
          <ul>
            <li><button onClick={() => setPage('home')}>All Jewellery</button></li>
            <li><button>Necklaces</button></li>
            <li><button>Earrings</button></li>
            <li><button>Bangles</button></li>
            <li><button>Rings</button></li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4>My Account</h4>
          <ul>
            <li><button onClick={() => setPage('orders')}>My Orders</button></li>
            <li><button onClick={() => setPage('orders')}>Track Order</button></li>
            <li><button onClick={() => setPage('orders')}>Download Invoice</button></li>
            <li><button onClick={() => setPage('admin')}>Admin Panel</button></li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4>Contact</h4>
          <ul>
            <li>
              <img src="https://cdn-icons-png.flaticon.com/32/535/535239.png" alt="" style={{ width: 14, filter: 'invert(0.5)', marginRight: 6 }} />
              Supur, Idar, Gujarat — 383430
            </li>
            <li>
              <img src="https://cdn-icons-png.flaticon.com/32/455/455705.png" alt="" style={{ width: 14, filter: 'invert(0.5)', marginRight: 6 }} />
              <a href="tel:+919898937895">+91 98989 37895</a>
            </li>
            <li>
              <img src="https://cdn-icons-png.flaticon.com/32/561/561127.png" alt="" style={{ width: 14, filter: 'invert(0.5)', marginRight: 6 }} />
              <a href="mailto:vaakif@gmail.com">vakif@gmail.com</a>
            </li>
            <li>
              <a href="https://wa.me/919898937895" target="_blank" rel="noreferrer" className="wa-link">
                Chat on WhatsApp →
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Vaakif Jewellery. All rights reserved. | Supur, Idar, Gujarat</p>
        <div className="footer-bottom-links">
          <a href="https://www.amazon.in/b?ie=UTF8&node=27943762031&me=A21JP2DQLC3LTM" target="_blank" rel="noreferrer">Amazon Store</a>
          <a href="https://www.meesho.com/VAAKIFENTERPRISE?_ms=3.0.1" target="_blank" rel="noreferrer">Meesho Store</a>
          <a href="https://wa.me/919898937895" target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
      </div>
    </footer>
  );
}
