import re

with open('supabase/functions/make-server-3e3b490b/index.ts', 'r', encoding='utf-8') as f:
    code = f.read()

new_route = """app.post("/make-server-3e3b490b/auth/anonymous-login", async (c) => {
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

app.post("/make-server-3e3b490b/auth/register","""

code = code.replace('app.post("/make-server-3e3b490b/auth/register",', new_route)

with open('supabase/functions/make-server-3e3b490b/index.ts', 'w', encoding='utf-8') as f:
    f.write(code)

print("index.ts patched.")
