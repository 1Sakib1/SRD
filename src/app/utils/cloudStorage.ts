/**
 * Cloud Storage with Supabase
 * Replaces LocalStorage with cloud-based database storage
 * Data is accessible from anywhere with proper authentication
 */

import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'guest';
  ecoPoints: number;
  credits: number;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  userId: string;
  type: string;
  description: string;
  photo?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  timestamp: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'report_reviewed' | 'report_resolved';
  title: string;
  message: string;
  reportId: string;
  read: boolean;
  createdAt: string;
}

interface StorageError {
  code: string;
  message: string;
}

// Fixed admin accounts
const ADMIN_EMAILS = [
  'adminsrd1@srd.com.au',
  'adminsrd2@srd.com.au',
  'adminsrd3@srd.com.au',
  'adminsrd4@srd.com.au',
];

const ADMIN_PASSWORD = 'Admin@123';

// Validation helpers
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const sanitizeString = (input: string): string => {
  return input.replace(/<[^>]*>/g, '').trim();
};

const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

const isValidName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 100;
};

const isValidCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

const createError = (code: string, message: string): StorageError => {
  return { code, message };
};

/**
 * Register a new community user using KV store
 */
export const registerUser = async (
  email: string,
  password: string,
  name: string
): Promise<{ user: User | null; error: StorageError | null }> => {
  try {
    // Validate inputs
    if (!isValidEmail(email)) {
      return { user: null, error: createError('INVALID_EMAIL', 'Please enter a valid email address') };
    }

    if (!isValidPassword(password)) {
      return { user: null, error: createError('INVALID_PASSWORD', 'Password must be at least 6 characters') };
    }

    if (!isValidName(name)) {
      return { user: null, error: createError('INVALID_NAME', 'Name must be between 2 and 100 characters') };
    }

    const sanitizedEmail = sanitizeString(email.toLowerCase());
    const sanitizedName = sanitizeString(name);

    // Check if user already exists in KV store
    const existingUserKey = `user:${sanitizedEmail}`;
    const { data: existingUser } = await supabase
      .from('kv_store_3e3b490b')
      .select('*')
      .eq('key', existingUserKey)
      .maybeSingle();

    if (existingUser) {
      return { user: null, error: createError('USER_EXISTS', 'An account with this email already exists') };
    }

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password,
      options: {
        data: {
          name: sanitizedName,
          role: 'user',
        },
        emailRedirectTo: undefined,
      },
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      return { user: null, error: createError('AUTH_ERROR', authError.message) };
    }

    if (!authData.user) {
      return { user: null, error: createError('AUTH_ERROR', 'Failed to create user') };
    }

    // Create user profile in KV store
    const now = new Date().toISOString();
    const user: User = {
      id: authData.user.id,
      email: sanitizedEmail,
      name: sanitizedName,
      role: 'user',
      ecoPoints: 0,
      credits: 0,
      createdAt: now,
      updatedAt: now,
    };

    const { error: kvError } = await supabase
      .from('kv_store_3e3b490b')
      .insert({
        key: existingUserKey,
        value: user,
      });

    if (kvError) {
      console.error('KV store error:', kvError);
      // Try to clean up auth user if KV insert fails
      await supabase.auth.admin.deleteUser(authData.user.id).catch(() => {});
      return { user: null, error: createError('DB_ERROR', 'Failed to create user profile') };
    }

    return { user, error: null };
  } catch (error) {
    console.error('Registration error:', error);
    return { user: null, error: createError('REGISTER_ERROR', 'An unexpected error occurred during registration') };
  }
};

/**
 * Login a user using KV store
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: User | null; error: StorageError | null }> => {
  try {
    if (!isValidEmail(email)) {
      return { user: null, error: createError('INVALID_CREDENTIALS', 'Invalid email or password') };
    }

    const sanitizedEmail = sanitizeString(email.toLowerCase());

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password,
    });

    if (authError) {
      console.error('Auth login error:', authError);
      return { user: null, error: createError('INVALID_CREDENTIALS', 'Invalid email or password') };
    }

    if (!authData.user) {
      return { user: null, error: createError('AUTH_ERROR', 'Failed to authenticate') };
    }

    // Get user profile from KV store
    const userKey = `user:${sanitizedEmail}`;
    const { data: kvData, error: kvError } = await supabase
      .from('kv_store_3e3b490b')
      .select('value')
      .eq('key', userKey)
      .maybeSingle();

    if (kvError || !kvData) {
      console.error('KV fetch error:', kvError);
      return { user: null, error: createError('DB_ERROR', 'Failed to fetch user profile') };
    }

    const user: User = kvData.value as User;
    return { user, error: null };
  } catch (error) {
    console.error('Login error:', error);
    return { user: null, error: createError('LOGIN_ERROR', 'An unexpected error occurred during login') };
  }
};

/**
 * Login as admin
 * Admins use fixed accounts and Supabase Auth
 */
export const loginAdmin = async (
  email: string,
  password: string
): Promise<{ user: User | null; error: StorageError | null }> => {
  try {
    const sanitizedEmail = sanitizeString(email.toLowerCase());

    // Check if it's a valid admin email
    if (!ADMIN_EMAILS.includes(sanitizedEmail)) {
      return { user: null, error: createError('INVALID_CREDENTIALS', 'Invalid admin credentials') };
    }

    // Verify admin password
    if (password !== ADMIN_PASSWORD) {
      return { user: null, error: createError('INVALID_CREDENTIALS', 'Invalid admin credentials') };
    }

    // Check if admin user exists in Supabase
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('*')
      .eq('email', sanitizedEmail)
      .single();

    if (existingAdmin) {
      // Admin exists, sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      if (authError) {
        return { user: null, error: createError('INVALID_CREDENTIALS', 'Invalid admin credentials') };
      }

      const user: User = {
        id: existingAdmin.id,
        email: existingAdmin.email,
        name: existingAdmin.name,
        role: 'admin',
        ecoPoints: existingAdmin.eco_points,
        credits: existingAdmin.credits,
        createdAt: existingAdmin.created_at,
        updatedAt: existingAdmin.updated_at,
      };

      return { user, error: null };
    } else {
      // Admin doesn't exist, create it
      const adminName = sanitizedEmail.split('@')[0].replace(/\d+/, ' ').trim();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          data: {
            name: adminName,
            role: 'admin',
          },
        },
      });

      if (authError || !authData.user) {
        return { user: null, error: createError('AUTH_ERROR', 'Failed to create admin account') };
      }

      // Create admin profile
      const { data: userData, error: dbError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: sanitizedEmail,
          name: adminName,
          role: 'admin',
          eco_points: 0,
          credits: 0,
        })
        .select()
        .single();

      if (dbError || !userData) {
        return { user: null, error: createError('DB_ERROR', 'Failed to create admin profile') };
      }

      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: 'admin',
        ecoPoints: userData.eco_points,
        credits: userData.credits,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
      };

      return { user, error: null };
    }
  } catch (error) {
    console.error('Admin login error:', error);
    return { user: null, error: createError('ADMIN_LOGIN_ERROR', 'An unexpected error occurred during admin login') };
  }
};

/**
 * Logout user
 */
export const logoutUser = async (): Promise<{ error: StorageError | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: createError('LOGOUT_ERROR', error.message) };
    }
    return { error: null };
  } catch (error) {
    console.error('Logout error:', error);
    return { error: createError('LOGOUT_ERROR', 'An unexpected error occurred during logout') };
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentAuthUser = async (): Promise<User | null> => {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      return null;
    }

    // Get user profile
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error || !userData) {
      return null;
    }

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role as 'user' | 'admin',
      ecoPoints: userData.eco_points,
      credits: Math.floor(userData.eco_points / 100),
      createdAt: userData.created_at,
      updatedAt: userData.updated_at,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

/**
 * Save a new report to Supabase
 */
export const saveReport = async (
  report: Omit<Report, 'id' | 'timestamp' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<{ report: Report | null; error: StorageError | null }> => {
  try {
    // Validate inputs
    if (!report.userId || typeof report.userId !== 'string') {
      return { report: null, error: createError('INVALID_USER', 'Invalid user ID') };
    }

    if (!report.type || report.type.trim().length === 0) {
      return { report: null, error: createError('INVALID_TYPE', 'Report type is required') };
    }

    if (!report.description || report.description.trim().length < 10) {
      return { report: null, error: createError('INVALID_DESCRIPTION', 'Description must be at least 10 characters') };
    }

    if (!isValidCoordinates(report.location.lat, report.location.lng)) {
      return { report: null, error: createError('INVALID_LOCATION', 'Invalid location coordinates') };
    }

    // Sanitize inputs
    const sanitizedType = sanitizeString(report.type);
    const sanitizedDescription = sanitizeString(report.description);
    const sanitizedAddress = sanitizeString(report.location.address);

    // Insert report
    const { data: reportData, error: dbError } = await supabase
      .from('reports')
      .insert({
        user_id: report.userId,
        type: sanitizedType,
        description: sanitizedDescription,
        photo: report.photo || null,
        location_lat: report.location.lat,
        location_lng: report.location.lng,
        location_address: sanitizedAddress,
        status: 'pending',
      })
      .select()
      .single();

    if (dbError) {
      return { report: null, error: createError('DB_ERROR', dbError.message) };
    }

    // Award eco points
    const { error: pointsError } = await supabase.rpc('award_eco_points', {
      user_id: report.userId,
      points: 10,
    });

    if (pointsError) {
      console.error('Failed to award points:', pointsError);
    }

    const newReport: Report = {
      id: reportData.id,
      userId: reportData.user_id,
      type: reportData.type,
      description: reportData.description,
      photo: reportData.photo || undefined,
      location: {
        lat: reportData.location_lat,
        lng: reportData.location_lng,
        address: reportData.location_address,
      },
      timestamp: reportData.created_at,
      status: reportData.status as 'pending' | 'reviewed' | 'resolved',
      createdAt: reportData.created_at,
      updatedAt: reportData.updated_at,
    };

    return { report: newReport, error: null };
  } catch (error) {
    console.error('Save report error:', error);
    return { report: null, error: createError('SAVE_REPORT_ERROR', 'An unexpected error occurred while saving the report') };
  }
};

/**
 * Get all reports
 */
export const getReports = async (): Promise<Report[]> => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get reports error:', error);
      return [];
    }

    return (data || []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      type: r.type,
      description: r.description,
      photo: r.photo || undefined,
      location: {
        lat: r.location_lat,
        lng: r.location_lng,
        address: r.location_address,
      },
      timestamp: r.created_at,
      status: r.status as 'pending' | 'reviewed' | 'resolved',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  } catch (error) {
    console.error('Get reports error:', error);
    return [];
  }
};

/**
 * Update report status
 */
export const updateReportStatus = async (
  reportId: string,
  status: 'pending' | 'reviewed' | 'resolved'
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('reports')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', reportId);

    if (error) {
      console.error('Update report status error:', error);
    }
  } catch (error) {
    console.error('Update report status error:', error);
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async () => {
  try {
    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: reportsCount } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true });

    return {
      totalMembers: (usersCount || 0) + 5000,
      totalReports: (reportsCount || 0) + 25000,
      satisfaction: 90,
    };
  } catch (error) {
    console.error('Get user stats error:', error);
    return {
      totalMembers: 5000,
      totalReports: 25000,
      satisfaction: 90,
    };
  }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get users error:', error);
      return [];
    }

    return (data || []).map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role as 'user' | 'admin',
      ecoPoints: u.eco_points,
      credits: Math.floor(u.eco_points / 100),
      createdAt: u.created_at,
      updatedAt: u.updated_at,
    }));
  } catch (error) {
    console.error('Get users error:', error);
    return [];
  }
};

/**
 * Get current user data (refreshed from DB)
 */
export const getCurrentUser = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role as 'user' | 'admin',
      ecoPoints: data.eco_points,
      credits: Math.floor(data.eco_points / 100),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

/**
 * Create a notification
 */
export const createNotification = async (
  userId: string,
  reportId: string,
  type: 'report_reviewed' | 'report_resolved',
  reportDetails: { type: string; address: string }
): Promise<Notification | null> => {
  try {
    const titles = {
      report_reviewed: '✅ Report Reviewed',
      report_resolved: '🎉 Report Resolved',
    };

    const messages = {
      report_reviewed: `Your report about "${reportDetails.type}" at ${reportDetails.address} has been reviewed by our team.`,
      report_resolved: `Great news! Your report about "${reportDetails.type}" at ${reportDetails.address} has been resolved. Thank you for helping keep Sydney clean!`,
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title: titles[type],
        message: messages[type],
        report_id: reportId,
        read: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Create notification error:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      type: data.type as 'report_reviewed' | 'report_resolved',
      title: data.title,
      message: data.message,
      reportId: data.report_id,
      read: data.read,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};

/**
 * Get user notifications
 */
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get notifications error:', error);
      return [];
    }

    return (data || []).map((n) => ({
      id: n.id,
      userId: n.user_id,
      type: n.type as 'report_reviewed' | 'report_resolved',
      title: n.title,
      message: n.message,
      reportId: n.report_id,
      read: n.read,
      createdAt: n.created_at,
    }));
  } catch (error) {
    console.error('Get notifications error:', error);
    return [];
  }
};

/**
 * Get unread notification count
 */
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Get unread count error:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Get unread count error:', error);
    return 0;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Mark as read error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Mark as read error:', error);
    return false;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Mark all as read error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Mark all as read error:', error);
    return false;
  }
};