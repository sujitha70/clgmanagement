import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext();

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load session from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('cr_token');
        const savedUser = localStorage.getItem('cr_user');

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));

          // Verify with backend
          fetch(`${API_BASE}/api/auth/me`, {
            headers: { Authorization: `Bearer ${savedToken}` }
          })
            .then(res => res.json())
            .then(data => {
              if (data.success && data.user) {
                setUser(data.user);
                localStorage.setItem('cr_user', JSON.stringify(data.user));
              }
            })
            .catch(() => {
              // offline mode preserves cached user
            });
        }
      } catch (err) {
        console.error('Failed to parse local auth state:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Login failed');
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('cr_token', data.token);
    localStorage.setItem('cr_user', JSON.stringify(data.user));

    redirectByRole(data.user.role);
    return data.user;
  };

  const register = async (formData) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Registration failed');
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('cr_token', data.token);
    localStorage.setItem('cr_user', JSON.stringify(data.user));

    router.push('/student');
    return data.user;
  };

  const demoLogin = async (role = 'student') => {
    const res = await fetch(`${API_BASE}/api/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Demo login failed');
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('cr_token', data.token);
    localStorage.setItem('cr_user', JSON.stringify(data.user));

    redirectByRole(data.user.role);
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('cr_token');
    localStorage.removeItem('cr_user');
    router.push('/login');
  };

  const redirectByRole = (role) => {
    if (role === 'admin' || role === 'superadmin') {
      router.push('/admin');
    } else if (role === 'staff') {
      router.push('/staff');
    } else {
      router.push('/student');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        demoLogin,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
        isStaff: user?.role === 'staff',
        isStudent: user?.role === 'student'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
