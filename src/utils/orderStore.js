// src/utils/orderStore.js
// Central order store — single source of truth for all order data
// All components read/write through here so changes reflect everywhere instantly

const KEY = 'vakif_orders';
const LISTENERS = new Set();

function read() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

function write(orders) {
  localStorage.setItem(KEY, JSON.stringify(orders));
  LISTENERS.forEach(fn => fn([...orders])); // notify all subscribers
}

export const orderStore = {
  getAll() { return read(); },

  add(order) {
    const all = read();
    all.unshift(order);
    write(all.slice(0, 200));
    return order;
  },

  updateStatus(orderId, status) {
    const all = read();
    const idx = all.findIndex(o => o.order_id === orderId);
    if (idx >= 0) {
      all[idx] = { ...all[idx], status, updated_at: new Date().toISOString() };
      write(all);
      return all[idx];
    }
    return null;
  },

  updateOrder(orderId, patch) {
    const all = read();
    const idx = all.findIndex(o => o.order_id === orderId);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...patch, updated_at: new Date().toISOString() };
      write(all);
      return all[idx];
    }
    return null;
  },

  delete(orderId) {
    write(read().filter(o => o.order_id !== orderId));
  },

  // Subscribe to any change — returns unsubscribe fn
  subscribe(fn) {
    LISTENERS.add(fn);
    return () => LISTENERS.delete(fn);
  },

  // React hook — auto-updates when orders change
  useOrders() {
    const { useState, useEffect } = require('react');
    const [orders, setOrders] = useState(read());
    useEffect(() => {
      setOrders(read());
      return orderStore.subscribe(setOrders);
    }, []);
    return orders;
  },
};
