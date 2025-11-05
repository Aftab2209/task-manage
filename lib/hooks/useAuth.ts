// hooks/useAuth.ts
"use client"

import { useState, useEffect } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to read user from localStorage
  const loadUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (error) {
        console.error('Error parsing user:', error);
        localStorage.removeItem('user');
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // Initial load
    loadUser();
    setIsLoading(false);

    // Listen for custom storage event (for same-tab updates)
    const handleStorageChange = (e: CustomEvent) => {
      console.log('Custom storage event detected');
      loadUser();
    };

    // Listen for storage events (for cross-tab updates)
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'user') {
        console.log('Storage event detected');
        loadUser();
      }
    };

    window.addEventListener('storage-update' as any, handleStorageChange as any);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener('storage-update' as any, handleStorageChange as any);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  const login = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('storage-update', { detail: { key: 'user' } }));
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('storage-update', { detail: { key: 'user' } }));
    window.location.href = '/'; // Redirect to home, which will show login
  };

  return { 
    user, 
    login, 
    logout, 
    isLoading,
    isAuthenticated: !!user 
  };
}