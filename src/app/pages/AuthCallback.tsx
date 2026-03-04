import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔐 Processing Google OAuth callback...');
        console.log('Current URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        
        const supabase = createClient(
          `https://${projectId}.supabase.co`,
          publicAnonKey
        );

        // Supabase puts the auth data in the URL hash after OAuth redirect
        // We need to exchange the hash for a session
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        console.log('Hash params:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken 
        });

        let session;
        let supabaseUser;

        if (accessToken && refreshToken) {
          // Set the session using the tokens from the hash
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            setErrorMessage('Failed to authenticate with Google. Please try again.');
            setIsProcessing(false);
            return;
          }

          session = data.session;
          supabaseUser = data.user;
        } else {
          // Fallback: try to get existing session
          const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            console.error('Session error:', sessionError);
            setErrorMessage('Failed to authenticate with Google. Please try again.');
            setIsProcessing(false);
            return;
          }

          session = existingSession;
          supabaseUser = existingSession?.user;
        }

        if (!session || !supabaseUser) {
          console.error('No session or user found');
          console.log('Session:', session);
          console.log('User:', supabaseUser);
          setErrorMessage('No authentication session found. Please try again.');
          setIsProcessing(false);
          return;
        }

        console.log('✅ Google session retrieved:', { 
          userId: supabaseUser.id, 
          email: supabaseUser.email 
        });

        // Register the user in our system
        console.log('📝 Registering Google user in our system...');
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3e3b490b/auth/google-signup`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: supabaseUser.email,
              name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Google User',
              googleId: supabaseUser.id,
              avatar: supabaseUser.user_metadata?.avatar_url,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Backend registration error:', errorData);
          
          // If user already exists, try to login instead
          if (response.status === 409 || errorData.message?.includes('already exists')) {
            console.log('User already exists, fetching existing user data...');
            
            const loginResponse = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-3e3b490b/auth/google-login`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${publicAnonKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: supabaseUser.email,
                  googleId: supabaseUser.id,
                }),
              }
            );

            if (loginResponse.ok) {
              const { user } = await loginResponse.json();
              console.log('✅ Existing Google user logged in:', user);
              login(user);
              toast.success(`Welcome back, ${user.name}!`);
              navigate('/dashboard');
              return;
            }
          }
          
          throw new Error(errorData.message || 'Failed to register user');
        }

        const { user } = await response.json();
        console.log('✅ Google user registered successfully:', user);

        // Log the user in
        login(user);
        toast.success(`Welcome, ${user.name}!`);
        navigate('/dashboard');

      } catch (error) {
        console.error('💥 OAuth callback error:', error);
        setErrorMessage('An error occurred during authentication. Please try signing in again.');
        setIsProcessing(false);
        
        // Redirect to auth page after 3 seconds
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate, login]);

  if (!isProcessing && errorMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <button
            onClick={() => navigate('/auth')}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
        <Loader2 className="w-16 h-16 text-green-600 animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Completing Sign In</h2>
        <p className="text-gray-600">Please wait while we set up your account...</p>
      </div>
    </div>
  );
};