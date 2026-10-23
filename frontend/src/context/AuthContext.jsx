import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        const userData = await api.getCurrentUser();
        setUser(userData);
        if (userData.role === 'ROLE_STUDENT') {
          const profileData = await api.getMyProfile();
          setProfile(profileData);
        }
      }
    } catch (err) {
      console.error('Failed to restore session:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res);

    if (res.role === 'ROLE_STUDENT') {
      try {
        const profileData = await api.getMyProfile();
        setProfile(profileData);
      } catch (e) {
        console.error('Failed to load profile on login', e);
      }
    } else {
      setProfile(null);
    }
    return res;
  };

  const register = async (formData) => {
    const res = await api.register(formData);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res);

    if (res.role === 'ROLE_STUDENT') {
      try {
        const profileData = await api.getMyProfile();
        setProfile(profileData);
      } catch (e) {
        console.error('Failed to load profile on register', e);
      }
    }
    return res;
  };

  const demoLogin = async (email, password = 'password123') => {
    // If admin
    const pass = email === 'admin@projectpartner.com' ? 'admin123' : password;
    return login(email, pass);
  };

  const refreshProfile = async () => {
    if (user && user.role === 'ROLE_STUDENT') {
      const profileData = await api.getMyProfile();
      setProfile(profileData);
      return profileData;
    }
    return null;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      profile,
      loading,
      login,
      register,
      demoLogin,
      refreshProfile,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ROLE_ADMIN'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
