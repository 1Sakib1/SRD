import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate, useSearchParams } from 'react-router';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { loginUserFixed, loginAdminFixed, registerUserFixed } from '../utils/authFix';
import { Shield, User, Mail, Lock, UserPlus, LogIn, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

type AuthTab = 'login' | 'register' | 'forgot' | 'reset';

// Google SVG Icon Component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);

export const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, loginAsGuest } = useAuth();
  
  const [activeTab, setActiveTab] = useState<AuthTab>(
    (searchParams.get('tab') as AuthTab) || 'login'
  );

  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Forgot password states
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        toast.error(authError.message);
        setIsSubmitting(false);
        return;
      }
      if (authData.user) {
        const { data: userProfile, error: profileError } = await supabase.from('users').select('*').eq('email', email.toLowerCase().trim()).single();
        let userData = userProfile;
        const ADMIN_EMAILS = ['adminsrd1@srd.com.au', 'adminsrd2@srd.com.au', 'adminsrd3@srd.com.au', 'adminsrd4@srd.com.au'];
        if (profileError && ADMIN_EMAILS.includes(email.toLowerCase().trim())) {
          userData = { id: authData.user.id, email: email.toLowerCase().trim(), name: 'Admin', role: 'admin', eco_points: 0, credits: 0 };
        } else if (profileError) {
          toast.error('Failed to load user profile');
          setIsSubmitting(false);
          return;
        }
        const finalUser = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: ADMIN_EMAILS.includes(email.toLowerCase().trim()) ? 'admin' : userData.role,
          ecoPoints: userData.eco_points || userData.ecoPoints || 0,
          credits: userData.credits || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        login(finalUser as any);
        if (finalUser.role === 'admin') {
          toast.success('Welcome back, Admin!');
          navigate('/admin');
        } else {
          toast.success('Welcome back!');
          const redirect = searchParams.get('redirect') || '/dashboard';
          navigate(redirect);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      console.log('🔐 Starting Google OAuth flow...');
      
      // Safety checks
      if (!projectId || !publicAnonKey) {
        console.error('❌ Missing Supabase credentials:', { projectId, publicAnonKey });
        toast.error('Configuration error: Missing Supabase credentials');
        return;
      }
      
      console.log('Project ID:', projectId);
      console.log('Public Anon Key:', publicAnonKey?.substring(0, 20) + '...');
      console.log('Redirect URL:', `${window.location.origin}/auth/callback`);
      console.log('Supabase URL:', `https://${projectId}.supabase.co`);
      
      setIsSubmitting(true);
      
      console.log('Creating Supabase client...');
      const supabase = createClient(
        `https://${projectId}.supabase.co`,
        publicAnonKey
      );
      
      if (!supabase) {
        console.error('❌ Failed to create Supabase client');
        toast.error('Failed to initialize authentication');
        setIsSubmitting(false);
        return;
      }
      
      console.log('✅ Supabase client created');
      console.log('Calling signInWithOAuth with provider: google...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      console.log('📦 OAuth response received');
      console.log('Data:', data);
      console.log('Error:', error);

      if (error) {
        console.error('❌ Google OAuth error object:', JSON.stringify(error, null, 2));
        
        // Check for specific error types
        if (error.message?.includes('not enabled') || error.message?.includes('provider')) {
          toast.error(
            'Google Sign-In is not configured. Please enable it in Supabase: Authentication → Providers → Google',
            { duration: 6000 }
          );
        } else {
          toast.error(`Google login failed: ${error.message}`);
        }
        setIsSubmitting(false);
        return;
      }

      if (data?.url) {
        console.log('✅ Redirecting to Google OAuth URL:', data.url);
        toast.success('Redirecting to Google...', { duration: 2000 });
        // Wait a moment for the toast to show, then redirect
        setTimeout(() => {
          window.location.href = data.url;
        }, 500);
      } else {
        console.error('⚠️ No redirect URL received from Supabase');
        console.log('Full data object:', JSON.stringify(data, null, 2));
        toast.error('Failed to initiate Google login. No redirect URL was provided.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('💥 Google login exception:', error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      toast.error(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsSubmitting(false);
    }
  };

  const handleGuestMode = () => {
    console.log('👥 Continuing as guest');
    loginAsGuest();
    toast.success('Welcome! You\'re browsing as a guest');
    const redirect = searchParams.get('redirect') || '/dashboard';
    navigate(redirect);
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 handleRegister called', { email, name });
    
    if (!email || !password || !name || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    console.log('✅ Form validation passed, setting isSubmitting=true');
    setIsSubmitting(true);
    
    try {
      console.log('📝 Calling registerUserFixed...');
      const result = await registerUserFixed(email, password, name);
      console.log('📝 registerUserFixed returned:', result);
      
      const { user, error } = result;
      if (error) {
        console.error('❌ Registration error:', error);
        toast.error(error.message);
        setIsSubmitting(false);
      } else if (user) {
        console.log('✅ Registration successful, user:', user);
        login(user);
        toast.success('Account created successfully!');
        const redirect = searchParams.get('redirect') || '/dashboard';
        navigate(redirect);
      } else {
        console.error('⚠️ No user and no error returned');
        toast.error('Registration failed - no response');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('💥 Registration exception in Auth component:', error);
      toast.error('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };
  
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3e3b490b/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.error || 'Failed to generate reset code');
        setIsSubmitting(false);
        return;
      }
      
      // Store the code and show it to the user
      setCodeSent(true);
      setActiveTab('reset');
      toast.success('If an account exists with this email, you will receive a password reset code shortly.', { duration: 6000 });
      setIsSubmitting(false);
    } catch (error) {
      console.error('💥 Forgot password error:', error);
      toast.error('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetCode || !newPassword || !confirmNewPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3e3b490b/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ 
          email,
          resetCode,
          newPassword
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.error || 'Failed to reset password');
        setIsSubmitting(false);
        return;
      }
      
      toast.success('Password reset successfully!');
      // Clear form and go to login
      setResetCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      setCodeSent(false);
      setActiveTab('login');
      setIsSubmitting(false);
    } catch (error) {
      console.error('💥 Reset password error:', error);
      toast.error('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Header variant="landing" />
      
      <div className="max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-4 px-4 text-sm sm:text-base font-medium transition-colors min-h-[52px] ${
                activeTab === 'login'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-4 px-4 text-sm sm:text-base font-medium transition-colors min-h-[52px] ${
                activeTab === 'register'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>Register</span>
              </div>
            </button>
          </div>
          
          {/* Form Container with proper padding */}
          <div className="p-6 sm:p-8">
            {activeTab === 'login' ? (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome Back</h2>
                

                
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        required
                        minLength={6}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  {/* Forgot Password Link */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setActiveTab('forgot')}
                      className="text-sm text-green-600 hover:text-green-700 hover:underline font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-lg font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing In...
                      </span>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 border border-gray-300 bg-white rounded-lg font-medium text-gray-700 hover:bg-gray-50 hover:shadow-sm shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <GoogleIcon />
                  Sign in with Google
                </button>

                {/* Continue as Guest */}
                <button
                  type="button"
                  onClick={handleGuestMode}
                  disabled={isSubmitting}
                  className="w-full mt-3 py-3 px-4 border-2 border-green-300 rounded-lg font-medium text-green-700 hover:bg-green-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserCheck className="w-5 h-5" />
                  Continue as Guest
                </button>
              </div>
            ) : activeTab === 'forgot' ? (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Forgot Password</h2>
                <p className="text-gray-600 mb-6">Enter your email address and we'll send you a reset code.</p>
                
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div>
                    <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="forgot-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Generating Code...' : 'Get Reset Code'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="w-full py-3 text-gray-700 hover:text-gray-900 font-medium"
                  >
                    ← Back to Login
                  </button>
                </form>
              </div>
            ) : activeTab === 'reset' ? (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Reset Password</h2>
                <p className="text-gray-600 mb-6">
                  Check your email for the 6-digit reset code. The code expires in 15 minutes.
                </p>
                
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label htmlFor="reset-code" className="block text-sm font-medium text-gray-700 mb-2">
                      Reset Code
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="reset-code"
                        type="text"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        required
                        minLength={6}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="confirm-new-password"
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        required
                        minLength={6}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="w-full py-3 text-gray-700 hover:text-gray-900 font-medium"
                  >
                    ← Back to Login
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Account</h2>
                
                <form onSubmit={handleRegister} className="space-y-5">
                  <div>
                    <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="register-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Smith"
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        required
                        minLength={2}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="register-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="register-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        required
                        minLength={6}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="register-confirm" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="register-confirm"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        required
                        minLength={6}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Account...
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or</span>
                  </div>
                </div>

                {/* Google Sign In for Registration */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 border border-gray-300 bg-white rounded-lg font-medium text-gray-700 hover:bg-gray-50 hover:shadow-sm shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <GoogleIcon />
                  Sign up with Google
                </button>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-center text-sm text-gray-600 mt-6">
          {activeTab === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setActiveTab('register')}
                className="text-green-600 font-medium hover:text-green-700 hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setActiveTab('login')}
                className="text-green-600 font-medium hover:text-green-700 hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

