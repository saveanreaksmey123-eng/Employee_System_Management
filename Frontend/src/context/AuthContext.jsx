import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ems_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [employee, setEmployee] = useState(() => {
    const saved = localStorage.getItem('ems_employee');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('ems_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('ems_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          setEmployee(res.data.employee);
          localStorage.setItem('ems_user', JSON.stringify(res.data.user));
          if (res.data.employee) {
            localStorage.setItem('ems_employee', JSON.stringify(res.data.employee));
          }
        } catch (err) {
          console.error('Failed to verify session:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user, employee } = res.data;

    setToken(token);
    setUser(user);
    setEmployee(employee);

    localStorage.setItem('ems_token', token);
    localStorage.setItem('ems_user', JSON.stringify(user));
    if (employee) {
      localStorage.setItem('ems_employee', JSON.stringify(employee));
    }

    return { user, employee };
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (err) {
      console.warn('Logout request completed with warning:', err);
    } finally {
      setToken(null);
      setUser(null);
      setEmployee(null);
      localStorage.removeItem('ems_token');
      localStorage.removeItem('ems_user');
      localStorage.removeItem('ems_employee');
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      setEmployee(res.data.employee);
      localStorage.setItem('ems_user', JSON.stringify(res.data.user));
      if (res.data.employee) {
        localStorage.setItem('ems_employee', JSON.stringify(res.data.employee));
      }
      return res.data;
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';

  return (
    <AuthContext.Provider
      value={{
        user,
        employee,
        token,
        loading,
        login,
        logout,
        refreshProfile,
        isAdmin,
        isStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
