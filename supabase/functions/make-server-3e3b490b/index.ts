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
    console.log('📧 From address: LitterPin <noreply@admin.litterpin.org>');
    
    const { data, error } = await resend.emails.send({
      from: 'LitterPin <noreply@admin.litterpin.org>',
      to: [email],
      subject: 'Reset Your Password - Smart Rubbish Detection System',
              html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); margin-top: 40px; margin-bottom: 40px; }
              .header { text-align: center; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; margin-bottom: 30px; }
              .logo { max-height: 60px; }
              .title { color: #10b981; font-size: 24px; font-weight: bold; margin-top: 20px; margin-bottom: 5px; }
              .content { color: #374151; font-size: 16px; line-height: 1.6; }
              .reward-box { background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center; }
              .reward-title { margin: 0; color: #166534; font-size: 18px; font-weight: bold; }
              .reward-text { margin: 10px 0 0 0; color: #15803d; }
              .btn { display: inline-block; background-color: #00B150; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 20px; }
              .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #6b7280; line-height: 1.5; }
              .footer a { color: #00B150; text-decoration: none; margin: 0 5px; }
              .footer a:hover { text-decoration: underline; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="https://litterpin.org/litterpin-logo-transparent.png" alt="LitterPin Logo" class="logo" />
                <div class="title">Report Submitted Successfully</div>
              </div>
              <div class="content">
                <p>Hello ${name || 'there'},</p>
                <p>Thank you for submitting a new environmental report to LitterPin. Your submission has been securely received and is currently marked as pending review by our AI categorization system.</p>
                <p>Your effort plays a vital role in mapping and managing waste across the globe. By actively participating, you are directly contributing to a cleaner, safer environment.</p>
                
                <div class="reward-box">
                  <p class="reward-title">🌱 Reward Earned</p>
                  <p class="reward-text">You have automatically been credited with <strong>10 eco-points ($0.01)</strong> for your contribution!</p>
                </div>
                
                <div style="text-align: center;">
                  <a href="https://litterpin.org/map" class="target-blank btn">View Community Map</a>
                </div>
              </div>
              <div class="footer">
                <p>This is an automated message generated by LitterPin. Please do not reply directly to this email. If you need assistance, contact us at <a href="mailto:litterpin.org@gmail.com">litterpin.org@gmail.com</a>.</p>
                <p>
                  <a href="https://litterpin.org/privacy">Privacy Policy</a> | 
                  <a href="https://litterpin.org/terms">Terms of Service</a> | 
                  <a href="https://litterpin.org">Visit LitterPin.org</a>
                </p>
                <p>&copy; ${new Date().getFullYear()} LitterPin. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      });

    if (error) throw error;
    return c.json({ success: true, data }, 200);
  } catch (err) {
    console.error('Email send failed:', err);
    return c.json({ error: err.message || JSON.stringify(err) }, 500);
  }
});

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

      // Save report to Postgres
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
        
        if (supabaseUrl && supabaseKey) {
          const { createClient } = await import("npm:@supabase/supabase-js");
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          // Ensure user_id is a valid UUID to satisfy foreign key constraints.
            // If the KV store userId is used (e.g. 'user-1234...'), we fall back to a known admin UUID.
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const validUserId = uuidRegex.test(userId) ? userId : '04ecb874-e192-4c85-bdcd-ef0d150a4957';
            
            const { error: pgError } = await supabase.from('reports').insert([{
              user_id: validUserId,
              type: type,
              description: description,
              photo: photo || null,
              location_lat: location.lat,
              location_lng: location.lng,
              location_address: location.address || '',
              status: 'pending',
              created_at: now,
              updated_at: now
            }]);
          
          if (pgError) {
            console.error('Error saving to Postgres reports table:', pgError);
          } else {
            console.log('Successfully saved to Postgres reports table');
          }
        } else {
          console.error('Missing Supabase env vars, cannot save to Postgres');
        }
      } catch (pgInsertError) {
        console.error('Exception saving to Postgres:', pgInsertError);
      }

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
app.post("/make-server-3e3b490b/auth/anonymous-login", async (c) => {
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
