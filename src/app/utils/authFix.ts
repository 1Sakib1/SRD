/**
 * AUTHENTICATION FIX - Server-side authentication
 * Calls server API instead of directly accessing KV store
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';
import type { User } from './cloudStorage';

interface StorageError {
  code: string;
  message: string;
}

const createError = (code: string, message: string): StorageError => ({ code, message });

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-3e3b490b`;

/**
 * Register user via server
 */
export const registerUserFixed = async (
  email: string,
  password: string,
  name: string
): Promise<{ user: User | null; error: StorageError | null }> => {
  try {
    console.log('📝 Calling server registration API for:', email);
    
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();
    console.log('📝 Server response:', data);

    if (!response.ok) {
      return { user: null, error: createError('REGISTER_ERROR', data.error || 'Registration failed') };
    }

    return { user: data.user, error: null };
  } catch (error) {
    console.error('💥 Registration exception:', error);
    return { user: null, error: createError('NETWORK_ERROR', 'Network error occurred') };
  }
};

/**
 * Login user via server
 */
export const loginUserFixed = async (
  email: string,
  password: string
): Promise<{ user: User | null; error: StorageError | null }> => {
  try {
    console.log('🔐 Calling server login API for:', email);
    
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log('🔐 Server response:', data);

    if (!response.ok) {
      // Provide more helpful error messages
      let errorMessage = data.error || 'Login failed';
      if (errorMessage === 'Invalid email or password') {
        errorMessage = 'Invalid email or password. If you don\'t have an account, please register first.';
      }
      return { user: null, error: createError('LOGIN_ERROR', errorMessage) };
    }

    return { user: data.user, error: null };
  } catch (error) {
    console.error('💥 Login exception:', error);
    return { user: null, error: createError('NETWORK_ERROR', 'Network error occurred. Please check your internet connection.') };
  }
};

/**
 * Login admin via server
 */
export const loginAdminFixed = async (
  email: string,
  password: string
): Promise<{ user: User | null; error: StorageError | null }> => {
  try {
    console.log('👑 Calling server admin login API for:', email);
    
    const response = await fetch(`${API_BASE}/auth/admin-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log('👑 Server response:', data);

    if (!response.ok) {
      return { user: null, error: createError('ADMIN_LOGIN_ERROR', data.error || 'Admin login failed') };
    }

    return { user: data.user, error: null };
  } catch (error) {
    console.error('💥 Admin login exception:', error);
    return { user: null, error: createError('NETWORK_ERROR', 'Network error occurred') };
  }
};