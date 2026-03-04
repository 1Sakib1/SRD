import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import * as auth from "./auth.tsx";
import { Resend } from "npm:resend";

const app = new Hono();
const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Rate limiting helper
async function checkRateLimit(key: string, maxAttempts: number, windowMinutes: number): Promise<{ allowed: boolean; remainingAttempts: number }> {
  const rateLimitKey = `ratelimit:${key}`;
  const rateLimitData = await kv.get(rateLimitKey);
  
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;
  
  if (!rateLimitData) {
    // First attempt
    await kv.set(rateLimitKey, {
      attempts: 1,
      firstAttemptAt: now,
      expiresAt: now + windowMs
    });
    return { allowed: true, remainingAttempts: maxAttempts - 1 };
  }
  
  // Check if window has expired
  if (now > rateLimitData.expiresAt) {
    // Reset the window
    await kv.set(rateLimitKey, {
      attempts: 1,
      firstAttemptAt: now,
      expiresAt: now + windowMs
    });
    return { allowed: true, remainingAttempts: maxAttempts - 1 };
  }
  
  // Check if limit exceeded
  if (rateLimitData.attempts >= maxAttempts) {
    return { allowed: false, remainingAttempts: 0 };
  }
  
  // Increment attempts
  await kv.set(rateLimitKey, {
    ...rateLimitData,
    attempts: rateLimitData.attempts + 1
  });
  
  return { allowed: true, remainingAttempts: maxAttempts - rateLimitData.attempts - 1 };
}

// Email helper function
async function sendPasswordResetEmail(email: string, resetCode: string, userName: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Debug: Check if API key is loaded
    const apiKey = Deno.env.get('RESEND_API_KEY');
    console.log('🔑 Resend API Key status:', {
      exists: !!apiKey,
      length: apiKey?.length,
      prefix: apiKey?.substring(0, 5)
    });
    
    if (!apiKey) {
      console.error('❌ RESEND_API_KEY environment variable is not set!');
      return { success: false, error: 'Email service not configured' };
    }
    
    console.log('📧 Attempting to send email to:', email);
    console.log('📧 From address: Smart Rubbish Detection <onboarding@resend.dev>');
    
    const { data, error } = await resend.emails.send({
      from: 'Smart Rubbish Detection <onboarding@resend.dev>',
      to: [email],
      subject: 'Reset Your Password - Smart Rubbish Detection System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">🌱 Smart Rubbish Detection</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 20px; font-weight: 600;">Reset Your Password</h2>
                      
                      <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.5;">
                        Hi ${userName || 'there'},
                      </p>
                      
                      <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.5;">
                        We received a request to reset your password. Use the verification code below to continue:
                      </p>
                      
                      <!-- Reset Code Box -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                        <tr>
                          <td align="center" style="padding: 20px; background-color: #f9fafb; border: 2px dashed #10b981; border-radius: 8px;">
                            <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #10b981; font-family: 'Courier New', monospace;">
                              ${resetCode}
                            </div>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.5;">
                        This code will expire in <strong style="color: #dc2626;">15 minutes</strong>.
                      </p>
                      
                      <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.5;">
                        If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
                      </p>
                      
                      <!-- Security Notice -->
                      <div style="margin-top: 30px; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                        <p style="margin: 0; color: #92400e; font-size: 14px;">
                          <strong>🔒 Security Tip:</strong> Never share this code with anyone. Our team will never ask for your verification code.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                      <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                        Victoria University Sydney IT Capstone Project 2026
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        Building a cleaner, greener future together 🌍
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Resend email error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Password reset email sent successfully:', data);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return { success: false, error: String(error) };
  }
}

// Initialize demo user on server startup
(async () => {
  try {
    console.log('🚀 Initializing server...');
    
    // Check if demo user exists
    const demoEmail = 'demo@sydney.com';
    const demoUserKey = `user:${demoEmail}`;
    const existingDemoUser = await kv.get(demoUserKey);
    
    if (!existingDemoUser) {
      console.log('📝 Creating demo user account...');
      await auth.registerUser(demoEmail, 'Demo@123', 'Demo User');
      console.log('✅ Demo user created successfully!');
      console.log('   Email: demo@sydney.com');
      console.log('   Password: Demo@123');
    } else {
      console.log('✅ Demo user already exists');
    }
  } catch (error) {
    console.error('❌ Failed to initialize demo user:', error);
  }
})();

// Health check endpoint
app.get("/make-server-3e3b490b/health", (c) => {
  return c.json({ status: "ok" });
});

// Debug endpoint - check if user exists
app.post("/make-server-3e3b490b/auth/check-user", async (c) => {
  try {
    const { email } = await c.req.json();
    console.log('🔍 Check user request:', { email });
    
    const sanitizedEmail = email.toLowerCase().trim();
    const userKey = `user:${sanitizedEmail}`;
    const user = await kv.get(userKey);
    
    return c.json({ 
      exists: !!user,
      email: sanitizedEmail,
      userKey: userKey
    }, 200);
  } catch (error) {
    console.error('Check user error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Debug endpoint - list all users in KV store
app.get("/make-server-3e3b490b/auth/list-users", async (c) => {
  try {
    console.log('📋 Listing all users from KV store');
    
    // Get all keys with user: prefix
    const userKeys = await kv.getByPrefix('user:');
    console.log('Found user keys:', userKeys?.length || 0);
    
    return c.json({ 
      count: userKeys?.length || 0,
      users: userKeys || []
    }, 200);
  } catch (error) {
    console.error('List users error:', error);
    return c.json({ error: 'Internal server error', details: String(error) }, 500);
  }
});

// Google OAuth signup endpoint
app.post("/make-server-3e3b490b/auth/google-signup", async (c) => {
  try {
    const { email, name, googleId, avatar } = await c.req.json();
    console.log('🔐 Google signup request:', { email, name, googleId });

    if (!email || !googleId) {
      return c.json({ error: 'Email and Google ID are required' }, 400);
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const userKey = `user:${sanitizedEmail}`;
    
    // Check if user already exists
    const existingUser = await kv.get(userKey);
    if (existingUser) {
      console.log('User already exists, returning existing user');
      return c.json({ user: existingUser }, 200);
    }

    // Create new user
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newUser = {
      id: userId,
      email: sanitizedEmail,
      name: name || 'Google User',
      role: 'user',
      googleId: googleId,
      avatar: avatar || null,
      ecoPoints: 0,
      credits: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(userKey, newUser);
    await kv.set(`user_by_id:${userId}`, newUser);
    await kv.set(`user_by_google:${googleId}`, newUser);

    console.log('✅ Google user created successfully:', userId);
    return c.json({ user: newUser }, 201);
  } catch (error) {
    console.error('Google signup error:', error);
    return c.json({ error: 'Internal server error', message: String(error) }, 500);
  }
});

// Google OAuth login endpoint
app.post("/make-server-3e3b490b/auth/google-login", async (c) => {
  try {
    const { email, googleId } = await c.req.json();
    console.log('🔐 Google login request:', { email, googleId });

    if (!email || !googleId) {
      return c.json({ error: 'Email and Google ID are required' }, 400);
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const userKey = `user:${sanitizedEmail}`;
    
    // Try to find user by email
    let user = await kv.get(userKey);
    
    // If not found by email, try by Google ID
    if (!user) {
      user = await kv.get(`user_by_google:${googleId}`);
    }

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Update last login time
    user.updatedAt = new Date().toISOString();
    await kv.set(userKey, user);

    console.log('✅ Google login successful:', user.id);
    return c.json({ user }, 200);
  } catch (error) {
    console.error('Google login error:', error);
    return c.json({ error: 'Internal server error', message: String(error) }, 500);
  }
});

// Report endpoints
app.post("/make-server-3e3b490b/reports/submit", async (c) => {
  try {
    const { userId, type, description, photo, location } = await c.req.json();
    console.log('📝 Submit report request:', { userId, type, location });

    // Validate required fields
    if (!userId || !type || !description || !location) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Generate report ID
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const report = {
      id: reportId,
      userId,
      type,
      description,
      photo: photo || null,
      location: {
        lat: location.lat,
        lng: location.lng,
        address: location.address || '',
      },
      timestamp: now,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    // Save report to KV store
    const reportKey = `report:${reportId}`;
    await kv.set(reportKey, report);

    // Award eco points to user - find user by ID
    // The userId is the actual user ID, so we need to find the user by searching all users
    const allUsers = await kv.getByPrefix('user:');
    const userToUpdate = allUsers?.find((u: any) => u.id === userId);
    
    if (userToUpdate && userToUpdate.email) {
      const userKey = `user:${userToUpdate.email}`;
      const updatedUser = {
        ...userToUpdate,
        ecoPoints: (userToUpdate.ecoPoints || 0) + 10,
        credits: Math.floor(((userToUpdate.ecoPoints || 0) + 10) / 100),
        updatedAt: now,
      };
      await kv.set(userKey, updatedUser);
      console.log('✅ Awarded 10 eco points to user:', userToUpdate.email);
    } else {
      console.warn('⚠️ User not found for eco points:', userId);
    }

    console.log('✅ Report saved successfully:', reportId);
    return c.json({ report }, 200);
  } catch (error) {
    console.error('Submit report error:', error);
    return c.json({ error: 'Internal server error', details: String(error) }, 500);
  }
});

app.get("/make-server-3e3b490b/reports/list", async (c) => {
  try {
    console.log('📋 Listing all reports from KV store');
    
    const reports = await kv.getByPrefix('report:');
    console.log('Found reports:', reports?.length || 0);
    
    return c.json({ 
      count: reports?.length || 0,
      reports: reports || []
    }, 200);
  } catch (error) {
    console.error('List reports error:', error);
    return c.json({ error: 'Internal server error', details: String(error) }, 500);
  }
});

app.get("/make-server-3e3b490b/reports/user/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log('📋 Listing reports for user:', userId);
    
    const allReports = await kv.getByPrefix('report:');
    const userReports = allReports?.filter((report: any) => report.userId === userId) || [];
    
    console.log('Found user reports:', userReports.length);
    
    return c.json({ 
      count: userReports.length,
      reports: userReports
    }, 200);
  } catch (error) {
    console.error('List user reports error:', error);
    return c.json({ error: 'Internal server error', details: String(error) }, 500);
  }
});

// Get user data by ID
app.get("/make-server-3e3b490b/users/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log('👤 Getting user data:', userId);
    
    // Find user by ID across all users
    const allUsers = await kv.getByPrefix('user:');
    const user = allUsers?.find((u: any) => u.id === userId);
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    console.log('✅ User data retrieved:', userWithoutPassword.email);
    return c.json({ user: userWithoutPassword }, 200);
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: 'Internal server error', details: String(error) }, 500);
  }
});

// Update report status
app.put("/make-server-3e3b490b/reports/:reportId/status", async (c) => {
  try {
    const reportId = c.req.param('reportId');
    const { status } = await c.req.json();
    console.log('🔄 Updating report status:', { reportId, status });
    
    // Validate status
    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }

    // Get the report
    const reportKey = `report:${reportId}`;
    const report = await kv.get(reportKey);
    
    if (!report) {
      return c.json({ error: 'Report not found' }, 404);
    }

    // Update status
    const updatedReport = {
      ...report,
      status,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(reportKey, updatedReport);
    console.log('✅ Report status updated:', reportId);
    
    return c.json({ report: updatedReport }, 200);
  } catch (error) {
    console.error('Update report status error:', error);
    return c.json({ error: 'Internal server error', details: String(error) }, 500);
  }
});

// Authentication endpoints
app.post("/make-server-3e3b490b/auth/register", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    console.log('📝 Registration request:', { email, name });
    
    const result = await auth.registerUser(email, password, name);
    
    if (result.error) {
      return c.json({ error: result.error }, 400);
    }
    
    return c.json({ user: result.user }, 200);
  } catch (error) {
    console.error('Registration endpoint error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post("/make-server-3e3b490b/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    console.log('🔐 Login request:', { email });
    
    const result = await auth.loginUser(email, password);
    
    if (result.error) {
      return c.json({ error: result.error }, 400);
    }
    
    return c.json({ user: result.user }, 200);
  } catch (error) {
    console.error('Login endpoint error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post("/make-server-3e3b490b/auth/admin-login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    console.log('👑 Admin login request:', { email });
    
    const result = await auth.loginAdmin(email, password);
    
    if (result.error) {
      return c.json({ error: result.error }, 400);
    }
    
    return c.json({ user: result.user }, 200);
  } catch (error) {
    console.error('Admin login endpoint error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Forgot Password endpoint
app.post("/make-server-3e3b490b/auth/forgot-password", async (c) => {
  try {
    const { email } = await c.req.json();
    console.log('🔑 Forgot password request:', { email });

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    const sanitizedEmail = email.toLowerCase().trim();
    
    // Rate limiting - 3 attempts per 15 minutes per email
    const rateLimitResult = await checkRateLimit(`forgot-password:${sanitizedEmail}`, 3, 15);
    if (!rateLimitResult.allowed) {
      console.warn('⚠️ Rate limit exceeded for:', sanitizedEmail);
      return c.json({ 
        error: 'Too many password reset attempts. Please try again in 15 minutes.' 
      }, 429);
    }

    const userKey = `user:${sanitizedEmail}`;
    
    // Check if user exists
    const user = await kv.get(userKey);
    
    // Security: Don't reveal if user exists or not (always return success)
    // This prevents email enumeration attacks
    if (!user) {
      console.log('⚠️ User not found, but returning success to prevent enumeration:', sanitizedEmail);
      // Still return success to prevent attackers from knowing if email exists
      return c.json({ 
        message: 'If an account exists with this email, you will receive a password reset code shortly.' 
      }, 200);
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetKey = `reset:${sanitizedEmail}`;
    
    // Store reset code with 15 minute expiry and attempt tracking
    const resetData = {
      code: resetCode,
      email: sanitizedEmail,
      attempts: 0,
      maxAttempts: 3,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      createdAt: new Date().toISOString()
    };
    
    await kv.set(resetKey, resetData);
    
    // Send email with reset code
    const emailResult = await sendPasswordResetEmail(sanitizedEmail, resetCode, user.name);
    
    if (!emailResult.success) {
      console.error('❌ Failed to send reset email:', emailResult.error);
      return c.json({ 
        error: 'Failed to send reset email. Please try again later.' 
      }, 500);
    }
    
    console.log('✅ Reset code generated and email sent to:', sanitizedEmail);
    console.log(`   Remaining attempts: ${rateLimitResult.remainingAttempts}`);
    
    return c.json({ 
      message: 'If an account exists with this email, you will receive a password reset code shortly.',
      remainingAttempts: rateLimitResult.remainingAttempts
    }, 200);
  } catch (error) {
    console.error('Forgot password error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Reset Password endpoint
app.post("/make-server-3e3b490b/auth/reset-password", async (c) => {
  try {
    const { email, resetCode, newPassword } = await c.req.json();
    console.log('🔄 Reset password request:', { email });

    if (!email || !resetCode || !newPassword) {
      return c.json({ error: 'Email, reset code, and new password are required' }, 400);
    }

    if (newPassword.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const resetKey = `reset:${sanitizedEmail}`;
    
    // Get reset data
    const resetData = await kv.get(resetKey);
    if (!resetData) {
      return c.json({ error: 'Invalid or expired reset code' }, 400);
    }

    // Check if code is expired
    const expiresAt = new Date(resetData.expiresAt);
    if (expiresAt < new Date()) {
      await kv.del(resetKey); // Clean up expired code
      return c.json({ error: 'Reset code has expired. Please request a new one.' }, 400);
    }

    // Check attempts limit
    if (resetData.attempts >= resetData.maxAttempts) {
      await kv.del(resetKey); // Lock out after max attempts
      console.warn('⚠️ Max reset attempts exceeded for:', sanitizedEmail);
      return c.json({ 
        error: 'Too many failed attempts. Please request a new reset code.' 
      }, 400);
    }

    // Check if code matches
    if (resetData.code !== resetCode) {
      // Increment failed attempts
      const updatedResetData = {
        ...resetData,
        attempts: resetData.attempts + 1
      };
      await kv.set(resetKey, updatedResetData);
      
      const remainingAttempts = resetData.maxAttempts - resetData.attempts - 1;
      console.warn(`⚠️ Invalid reset code attempt for: ${sanitizedEmail}. Remaining: ${remainingAttempts}`);
      
      return c.json({ 
        error: `Invalid reset code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.` 
      }, 400);
    }

    // Update user password
    const userKey = `user:${sanitizedEmail}`;
    const user = await kv.get(userKey);
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Hash the new password
    const bcrypt = await import("https://deno.land/x/bcrypt@v0.4.1/mod.ts");
    const hashedPassword = await bcrypt.hash(newPassword);

    // Update user
    const updatedUser = {
      ...user,
      password: hashedPassword,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(userKey, updatedUser);
    
    // Delete reset code after successful reset
    await kv.del(resetKey);
    
    // Clear rate limit for this email
    await kv.del(`ratelimit:forgot-password:${sanitizedEmail}`);
    
    console.log('✅ Password reset successfully for:', sanitizedEmail);
    return c.json({ message: 'Password reset successfully. You can now login with your new password.' }, 200);
  } catch (error) {
    console.error('Reset password error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

Deno.serve(app.fetch);