import React, { createContext, useState, useEffect } from 'react';
import { apiFetch } from '../utils/apiHelper';
import { isAuthenticated as checkAuthStatus } from '../utils/auth';

// Create AuthContext
export const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (checkAuthStatus()) {
        try {
          const token = localStorage.getItem('token');
          const res = await apiFetch('/users/profile', {
            headers: {
              'x-auth-token': token
            }
          });
          
          if (res.ok) {
            const userData = await res.json();
            setUser({ 
              id: userData._id, 
              name: userData.name,
              role: userData.role 
            });
          } else {
            setUser(null);
            localStorage.removeItem('token');
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setUser(null);
          localStorage.removeItem('token');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (token) => {
    localStorage.setItem('token', token);
    
    try {
      const res = await apiFetch('/users/profile', {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (res.ok) {
        const userData = await res.json();
        setUser({ 
          id: userData._id, 
          name: userData.name,
          role: userData.role 
        });
        return true;
      } else {
        setUser(null);
        localStorage.removeItem('token');
        return false;
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setUser(null);
      localStorage.removeItem('token');
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Context value
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};