import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../utils/cloudStorage';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  loginAsGuest: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isGuest: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'rubbish_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Load user from localStorage on mount
    const initAuth = () => {
      try {
        console.log('AuthContext: Initializing authentication');
        const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('AuthContext: Loaded user from localStorage', parsedUser);
          setUser(parsedUser);
        } else {
          console.log('AuthContext: No stored user found');
        }
      } catch (error) {
        console.error('AuthContext: Error loading user from localStorage', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        console.log('AuthContext: Initialization complete, setting isLoading=false');
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);
  
  const login = (user: User) => {
    console.log('AuthContext: Logging in user', user);
    setUser(user);
    // Persist to localStorage
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  };
  
  const logout = () => {
    console.log('AuthContext: Logging out user');
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const loginAsGuest = () => {
    console.log('AuthContext: Logging in as guest');
    const guestUser: User = {
      id: 'guest-' + Date.now(),
      name: 'Guest User',
      email: 'guest@temporary.local',
      role: 'guest',
      ecoPoints: 0,
      credits: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(guestUser);
    // Persist to localStorage
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(guestUser));
  };

  const refreshUser = async () => {
    console.log('AuthContext: Refreshing user data from server');
    
    if (!user) {
      console.log('AuthContext: No user to refresh');
      return;
    }

    // Skip refresh for guest users
    if (user.role === 'guest') {
      console.log('AuthContext: Skipping refresh for guest user');
      return;
    }

    try {
      // Fetch fresh user data from server
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3e3b490b/users/${user.id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const { user: freshUser } = await response.json();
        console.log('AuthContext: Fresh user data received', freshUser);
        
        // Update both state and localStorage
        setUser(freshUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(freshUser));
      } else {
        console.error('AuthContext: Failed to refresh user data - Status:', response.status);
        // Don't show error to user, just log it
      }
    } catch (error) {
      console.error('AuthContext: Error refreshing user from server', error);
      // Don't show error to user, just log it
    }
  };
  
  console.log('AuthContext: Rendering', { 
    hasUser: !!user, 
    isLoading, 
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  });
  
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loginAsGuest,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isGuest: user?.role === 'guest',
        isLoading,
        refreshUser,
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