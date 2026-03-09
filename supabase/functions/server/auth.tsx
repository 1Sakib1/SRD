/**
 * Server-side authentication module
 * Handles user registration, login, and admin authentication and all
 */

import * as kv from "./kv_store.tsx";

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  ecoPoints: number;
  credits: number;
  createdAt: string;
  updatedAt: string;
}

const ADMIN_EMAILS = [
  'adminsrd1@srd.com.au',
  'adminsrd2@srd.com.au',
  'adminsrd3@srd.com.au',
  'adminsrd4@srd.com.au',
];

const ADMIN_PASSWORD = 'Admin@123';

/**
 * Simple password hashing
 */
const hashPassword = (password: string): string => {
  // In production, use a proper hashing library
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt_sydney_rubbish_2026');
  return btoa(String.fromCharCode(...data));
};

/**
 * Generate unique user ID
 */
const generateId = (): string => {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

/**
 * Register a new user
 */
export const registerUser = async (
  email: string,
  password: string,
  name: string
): Promise<{ user?: User; error?: string }> => {
  try {
    console.log('📝 Server: Registering user:', email);
    
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedName = name.trim();

    // Validate inputs
    if (!sanitizedEmail || !password || !sanitizedName) {
      return { error: 'All fields are required' };
    }

    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters' };
    }

    // Check if user already exists
    const userKey = `user:${sanitizedEmail}`;
    const existingUser = await kv.get(userKey);

    if (existingUser) {
      console.log('❌ User already exists:', sanitizedEmail);
      return { error: 'Account already exists' };
    }

    // Create user
    const now = new Date().toISOString();
    const userId = generateId();
    const passwordHash = hashPassword(password);

    const user: User = {
      id: userId,
      email: sanitizedEmail,
      name: sanitizedName,
      role: 'user',
      ecoPoints: 0,
      credits: 0,
      createdAt: now,
      updatedAt: now,
    };

    // Store user profile
    await kv.set(userKey, user);

    // Store password hash
    const passwordKey = `password:${sanitizedEmail}`;
    await kv.set(passwordKey, { hash: passwordHash });

    console.log('✅ User registered successfully:', sanitizedEmail);
    return { user };
  } catch (error) {
    console.error('💥 Registration error:', error);
    return { error: 'Failed to create account' };
  }
};

/**
 * Login user
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<{ user?: User; error?: string }> => {
  try {
    console.log('🔐 Server: Login attempt for:', email);
    
    const sanitizedEmail = email.toLowerCase().trim();

    if (!sanitizedEmail || !password) {
      return { error: 'Email and password required' };
    }

    // Get user
    const userKey = `user:${sanitizedEmail}`;
    console.log('🔍 Server: Looking up user with key:', userKey);
    const user = await kv.get(userKey) as User | null;

    if (!user) {
      console.log('❌ User not found:', sanitizedEmail);
      console.log('💡 Tip: User needs to register first OR might be an admin');
      return { error: 'Invalid email or password' };
    }

    console.log('✅ User found:', sanitizedEmail, 'Role:', user.role);

    // Get password hash
    const passwordKey = `password:${sanitizedEmail}`;
    console.log('🔍 Server: Looking up password with key:', passwordKey);
    const passData = await kv.get(passwordKey) as { hash: string } | null;

    if (!passData) {
      console.log('❌ Password not found for:', sanitizedEmail);
      return { error: 'Invalid email or password' };
    }

    console.log('✅ Password hash found');

    // Verify password
    const passwordHash = hashPassword(password);
    console.log('🔐 Comparing hashes...');
    console.log('  Stored hash:', passData.hash.substring(0, 20) + '...');
    console.log('  Input hash:', passwordHash.substring(0, 20) + '...');
    
    if (passwordHash !== passData.hash) {
      console.log('❌ Invalid password for:', sanitizedEmail);
      return { error: 'Invalid email or password' };
    }

    console.log('✅ Login successful:', sanitizedEmail);
    return { user };
  } catch (error) {
    console.error('💥 Login error:', error);
    return { error: 'Login failed' };
  }
};

/**
 * Login admin
 */
export const loginAdmin = async (
  email: string,
  password: string
): Promise<{ user?: User; error?: string }> => {
  try {
    console.log('👑 Server: Admin login attempt for:', email);
    
    const sanitizedEmail = email.toLowerCase().trim();

    // Validate admin credentials
    if (!ADMIN_EMAILS.includes(sanitizedEmail)) {
      console.log('❌ Not a valid admin email:', sanitizedEmail);
      return { error: 'Invalid admin credentials' };
    }

    if (password !== ADMIN_PASSWORD) {
      console.log('❌ Invalid admin password');
      return { error: 'Invalid admin credentials' };
    }

    // Check if admin profile exists
    const adminKey = `user:${sanitizedEmail}`;
    let admin = await kv.get(adminKey) as User | null;

    if (admin) {
      console.log('✅ Admin found:', sanitizedEmail);
      return { user: admin };
    }

    // Create admin profile
    console.log('🆕 Creating admin profile:', sanitizedEmail);
    const now = new Date().toISOString();
    const userId = generateId();
    const passwordHash = hashPassword(password);
    
    // Extract admin number from email (adminsrd1, adminsrd2, etc.)
    const adminMatch = sanitizedEmail.match(/adminsrd(\d+)/);
    const adminNumber = adminMatch ? adminMatch[1] : '1';
    const adminNames = ['Admin SRD One', 'Admin SRD Two', 'Admin SRD Three', 'Admin SRD Four'];
    const adminName = adminNames[parseInt(adminNumber) - 1] || `Admin SRD ${adminNumber}`;

    admin = {
      id: userId,
      email: sanitizedEmail,
      name: adminName,
      role: 'admin',
      ecoPoints: 0,
      credits: 0,
      createdAt: now,
      updatedAt: now,
    };

    // Store admin profile
    await kv.set(adminKey, admin);

    // Store admin password
    const passwordKey = `password:${sanitizedEmail}`;
    await kv.set(passwordKey, { hash: passwordHash });

    console.log('✅ Admin created successfully:', sanitizedEmail);
    return { user: admin };
  } catch (error) {
    console.error('💥 Admin login error:', error);
    return { error: 'Admin login failed' };
  }
};
