// src/components/Hero.jsx
import React, { useEffect, useRef } from 'react';

export default function Hero({ setPage }) {
  const cubeRef = useRef(null);

  useEffect(() => {
    let angle = 0;
    let raf;
    const animate = () => {
      angle += 0.4;
      if (cubeRef.current) {
        cubeRef.current.style.transform = `rotateY(${angle}deg) rotateX(${Math.sin(angle * 0.012) * 10}deg)`;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="hero">
      {/* Animated background particles */}
      <div className="hero-bg">
        {[...Array(20)].map((_, i) => (
          <span key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${6 + Math.random() * 6}s`,
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
          }} />
        ))}
      </div>

      {/* Left: Content */}
      <div className="hero-content">
        <div className="hero-badge">
          <img src="https://cdn-icons-png.flaticon.com/32/3176/3176381.png" alt="" style={{ width: 14, filter: 'invert(1)' }} />
          Premium Artificial Jewellery
        </div>

        <h1 className="hero-title">
          <span className="hero-title-line">Crafted for</span>
          <span className="hero-title-line gold">Every Occasion</span>
        </h1>

        <p className="hero-subtitle">
          Discover exquisite artificial jewellery — necklaces, earrings, bangles &amp; more.
          Track your orders and download invoices instantly.
        </p>

        <div className="hero-ctas">
          <button className="btn-primary" onClick={() => setPage('home')}>
            <img src="https://cdn-icons-png.flaticon.com/32/3144/3144456.png" alt="" style={{ width: 16, filter: 'invert(1)', marginRight: 8 }} />
            Shop Now
          </button>
          <button className="btn-secondary" onClick={() => setPage('orders')}>
            <img src="https://cdn-icons-png.flaticon.com/32/1554/1554401.png" alt="" style={{ width: 16, filter: 'invert(0)', marginRight: 8 }} />
            View Orders
          </button>
        </div>

        <div className="hero-platforms">
          <span className="platform-text">Also available on</span>
          <a href="https://www.amazon.in/b?ie=UTF8&node=27943762031&me=A21JP2DQLC3LTM" target="_blank" rel="noreferrer" className="platform-pill amazon">
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" style={{ height: 16,  }} />
          </a>
          <a href="https://www.meesho.com/VAAKIFENTERPRISE?_ms=3.0.1" target="_blank" rel="noreferrer" className="platform-pill meesho">
            <img src="https://i.ibb.co/xSQVjG6H/Meesho-logo.png" alt="Meesho" style={{ height: 16, filter: 'contrast(1)' }} />
          </a>
        </div>

        <div className="hero-stats">
          {[['5000+', 'Happy Customers'], ['100+', 'Products'], ['4.8★', 'Rating']].map(([n, l]) => (
            <div key={l} className="hero-stat">
              <span className="hero-stat-num">{n}</span>
              <span className="hero-stat-label">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: 3D Logo Cube */}
      <div className="hero-3d-wrap">
        <div className="cube-scene">
          <div className="cube" ref={cubeRef}>
            <div className="face face-front">
              <div className="face-logo">
                <span className="cube-v">V</span>
                <span className="cube-rest">AAKIF</span>
              </div>
              <div className="face-tag">JEWELLERY</div>
            </div>
            <div className="face face-back">
              <div className="face-logo">
                <span className="cube-v">V</span>
                <span className="cube-rest">AAKIF</span>
              </div>
              <div className="face-tag">EST. 2020</div>
            </div>
            <div className="face face-right">
              <div className="face-logo side">
                <span className="cube-v">V</span>
              </div>
            </div>
            <div className="face face-left">
              <div className="face-logo side">
                <span className="cube-v"><img className='vaakif-3d' src="https://i.ibb.co/6c8Yff8s/vakif-removebg-preview.png" alt="vaakif" 
                style={{width:250, height:200 ,paddingTop:10,paddingRight:10,paddingLeft:10               }} /> </span>
              </div>
            </div>
            <div className="face face-top">
              <div className="face-top-inner" />
            </div>
            <div className="face face-bottom">
              <div className="face-top-inner" />
            </div>
          </div>
          {/* Glow ring */}
          <div className="cube-glow" />
          {/* Shadow */}
          <div className="cube-shadow" />
        </div>

        {/* Floating jewellery images */}
        <div className="float-img float-img-1">
          <img src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=100&q=80" alt="necklace" loading="lazy" />
        </div>
        <div className="float-img float-img-2">
          <img src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=100&q=80" alt="earrings" loading="lazy" />
        </div>
        <div className="float-img float-img-3">
          <img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=100&q=80" alt="ring" loading="lazy" />
        </div>
      </div>
    </section>
  );
}
