// src/components/TopNav.jsx
import React from 'react';

const LINKS = [
  { label: 'Best Sellers', icon: '⭐' },
  { label: 'Gift Ideas',   icon: '🎁' },
  { label: 'New Arrivals', icon: '✨' },
  { label: "Today's Deals",icon: '🔥' },
  { label: 'Customer Service', icon: '💬', href: `https://wa.me/919898937895` },
];

export default function TopNav({ onFilterBadge }) {
  return (
    <div className="top-nav">
      <div className="top-nav-inner">
        {LINKS.map(l => (
          <button
            key={l.label}
            className="top-nav-link"
            onClick={() => l.href ? window.open(l.href,'_blank') : onFilterBadge && onFilterBadge(l.label)}
          >
            <img
              src={badgeIcon(l.label)}
              alt=""
              style={{ width: 14, height: 14, marginRight: 4, filter: 'invert(1)' }}
              onError={e => { e.target.style.display = 'none'; }}
            />
            {l.label}
          </button>
        ))}
        <div className="top-nav-right">
          <a
            className="top-nav-link platform-link"
            href="https://www.amazon.in/b?ie=UTF8&node=27943762031&me=A21JP2DQLC3LTM"
            target="_blank" rel="noreferrer"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
              alt="Amazon"
              style={{ height: 14, filter: 'invert(1)', opacity: 0.8 }}
            />
          </a>
          <a
            className="top-nav-link platform-link"
            href="https://www.meesho.com/VAAKIFENTERPRISE?_ms=3.0.1"
            target="_blank" rel="noreferrer"
          >
            <img
              src="https://i.ibb.co/cc1KMv3w/Meesho-682x435.avif"
              alt="Meesho"
              style={{ height: 14, opacity: 0.8, filter: 'contrast(1)' }}
            />
          </a>
        </div>
      </div>
    </div>
  );
}

function badgeIcon(label) {
  const map = {
    'Best Sellers': 'https://cdn-icons-png.flaticon.com/32/1828/1828884.png',
    'Gift Ideas':   'https://cdn-icons-png.flaticon.com/32/3113/3113347.png',
    'New Arrivals': 'https://cdn-icons-png.flaticon.com/32/1295/1295218.png',
    "Today's Deals":'https://cdn-icons-png.flaticon.com/32/595/595067.png',
    'Customer Service':'https://cdn-icons-png.flaticon.com/32/724/724715.png',
  };
  return map[label] || '';
}
