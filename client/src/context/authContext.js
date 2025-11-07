import React, { createContext, useState, useEffect } from 'react';
import { apiFetch } from '../utils/apiHelper';

// Create AuthContext
export const AuthContext = createContext();

// Simplified AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in when app loads
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
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
          } else {
            localStorage.removeItem('token');
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          localStorage.removeItem('token');
        }
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
        localStorage.removeItem('token');
        return false;
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
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