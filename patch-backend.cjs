const fs = require('fs');

// Patch auth.tsx
let authCode = fs.readFileSync('supabase/functions/make-server-3e3b490b/auth.tsx', 'utf8');
const authNewFunc = `
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

    const userKey = \`user:\${sanitizedEmail}\`;
    const existingUser = await kv.get(userKey);

    if (existingUser) {
      // Just return the existing user
      return { user: existingUser as User };
    }

    // Create a new anonymous user
    const now = new Date().toISOString();
    const user: User = {
      id: \`anon-\${Date.now()}\`,
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

export const registerUser`;

authCode = authCode.replace('export const registerUser', authNewFunc);
fs.writeFileSync('supabase/functions/make-server-3e3b490b/auth.tsx', authCode);


// Patch index.ts
let indexCode = fs.readFileSync('supabase/functions/make-server-3e3b490b/index.ts', 'utf8');
const indexNewRoute = `app.post("/make-server-3e3b490b/auth/anonymous-login", async (c) => {
  try {
    const { email, name } = await c.req.json();
    console.log('dY"? Anonymous login request:', { email, name });
    
    const result = await auth.createOrGetAnonymousUser(email, name || 'Anonymous Reporter');
    
    if (result.error) {
      return c.json({ error: result.error }, 400);
    }
    
    return c.json({ user: result.user }, 200);
  } catch (error) {
    console.error('Anonymous login endpoint error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post("/make-server-3e3b490b/auth/register",`;

indexCode = indexCode.replace('app.post("/make-server-3e3b490b/auth/register",', indexNewRoute);
fs.writeFileSync('supabase/functions/make-server-3e3b490b/index.ts', indexCode);

console.log("Edge functions patched.");
