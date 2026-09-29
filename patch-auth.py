import re

with open('supabase/functions/make-server-3e3b490b/auth.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

new_func = """
/**
 * Create or get an anonymous user by email
 */
export const createOrGetAnonymousUser = async (
  email: string,
  name: string
): Promise<{ user?: User; error?: string }> => {
  try {
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedName = name.trim() || 'Anonymous Reporter';

    if (!sanitizedEmail) {
      return { error: 'Email is required' };
    }

    const userKey = `user:${sanitizedEmail}`;
    const existingUser = await kv.get(userKey);

    if (existingUser) {
      // Just return the existing user
      return { user: existingUser as User };
    }

    // Create a new anonymous user
    const now = new Date().toISOString();
    const user: User = {
      id: `anon-${Date.now()}`,
      email: sanitizedEmail,
      password: crypto.randomUUID(), // Unusable random password
      name: sanitizedName,
      role: 'guest',
      ecoPoints: 0,
      credits: 0,
      createdAt: now,
      updatedAt: now,
    };

    await kv.set(userKey, user);
    console.log('Created anonymous user:', sanitizedEmail);
    return { user };
  } catch (error) {
    console.error('Anonymous user creation error:', error);
    return { error: 'Failed to create anonymous account' };
  }
};

export const registerUser"""

code = code.replace("export const registerUser", new_func)

with open('supabase/functions/make-server-3e3b490b/auth.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("auth.tsx patched.")
