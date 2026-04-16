// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('vakif_admin_token') || null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError]   = useState('');

  const isAdmin = !!adminToken;

  const adminLogin = async (username, password) => {
    setAdminLoading(true);
    setAdminError('');
    try {
      const res = await fetch('/vakif-api/admin.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminToken(data.token);
        localStorage.setItem('vakif_admin_token', data.token);
        return true;
      }
      setAdminError(data.error || 'Login failed');
      return false;
    } catch {
      // Fallback: local admin check (for demo without PHP)
      if (username === 'admin' && password === 'vakif@admin123') {
        const token = 'demo_admin_' + Date.now();
        setAdminToken(token);
        localStorage.setItem('vakif_admin_token', token);
        return true;
      }
      setAdminError('Cannot connect to server. Check XAMPP is running.');
      return false;
    } finally {
      setAdminLoading(false);
    }
  };

  const adminLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('vakif_admin_token');
  };

  return (
    <AuthContext.Provider value={{ isAdmin, adminToken, adminLogin, adminLogout, adminLoading, adminError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
