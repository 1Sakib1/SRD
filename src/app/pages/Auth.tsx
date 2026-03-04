import { useState, useEffect } from 'react';
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
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, loginAsGuest } = useAuth();
  
  const [activeTab, setActiveTab] = useState<AuthTab>(
    (searchParams.get('tab') as AuthTab) || 'login'
  );
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user');
  
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
    
    console.log('🚀 handleLogin called', { email, loginType });
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    console.log('✅ Form validation passed, setting isSubmitting=true');
    setIsSubmitting(true);
    
    try {
      if (loginType === 'admin') {
        console.log('👑 Calling loginAdminFixed...');
        const result = await loginAdminFixed(email, password);
        console.log('👑 loginAdminFixed returned:', result);
        
        const { user, error } = result;
        if (error) {
          console.error('❌ Admin login error:', error);
          toast.error(error.message);
          setIsSubmitting(false);
        } else if (user) {
          console.log('✅ Admin login successful, user:', user);
          login(user);
          toast.success('Welcome back, Admin!');
          navigate('/admin');
        } else {
          console.error('⚠️ No user and no error returned');
          toast.error('Login failed - no response');
          setIsSubmitting(false);
        }
      } else {
        console.log('👤 Calling loginUserFixed...');
        const result = await loginUserFixed(email, password);
        console.log('👤 loginUserFixed returned:', result);
        
        const { user, error } = result;
        if (error) {
          console.error('❌ User login error:', error);
          toast.error(error.message);
          setIsSubmitting(false);
        } else if (user) {
          console.log('✅ User login successful, user:', user);
          login(user);
          toast.success('Welcome back!');
          navigate('/dashboard');
        } else {
          console.error('⚠️ No user and no error returned');
          toast.error('Login failed - no response');
          setIsSubmitting(false);
        }
      }
    } catch (error) {
      console.error('💥 Login exception in Auth component:', error);
      toast.error('An unexpected error occurred');
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
    navigate('/dashboard');
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
        navigate('/dashboard');
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
                
                {/* Login Type Selector - Only show for non-guest users */}
                {loginType !== 'guest' && (
                  <div className="flex gap-2 mb-6">
                    <button
                      type="button"
                      onClick={() => setLoginType('user')}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                        loginType === 'user'
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <User className="w-5 h-5" />
                        <span className="font-medium">User</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginType('admin')}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                        loginType === 'admin'
                          ? 'border-gray-700 bg-gray-50 text-gray-900'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Shield className="w-5 h-5" />
                        <span className="font-medium">Admin</span>
                      </div>
                    </button>
                  </div>
                )}
                
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
                  
                  {/* Forgot Password Link - Only for users */}
                  {loginType === 'user' && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setActiveTab('forgot')}
                        className="text-sm text-green-600 hover:text-green-700 hover:underline font-medium"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-lg font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                      loginType === 'user'
                        ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200'
                        : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-300'
                    }`}
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

                {/* Google Sign In - Only for users */}
                {loginType === 'user' && (
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <GoogleIcon />
                    Sign in with Google
                  </button>
                )}

                {/* Continue as Guest - Only for users */}
                {loginType === 'user' && (
                  <button
                    type="button"
                    onClick={handleGuestMode}
                    disabled={isSubmitting}
                    className="w-full mt-3 py-3 px-4 border-2 border-green-300 rounded-lg font-medium text-green-700 hover:bg-green-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserCheck className="w-5 h-5" />
                    Continue as Guest
                  </button>
                )}
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
                  className="w-full py-3 px-4 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
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