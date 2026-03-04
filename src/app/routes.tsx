import { createBrowserRouter, Outlet } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { AuthCallback } from './pages/AuthCallback';
import { Dashboard } from './pages/Dashboard';
import { ReportRubbish } from './pages/ReportRubbish';
import { AdminDashboard } from './pages/AdminDashboard';
import { Awareness } from './pages/Awareness';
import { AboutUs } from './pages/AboutUs';
import { NotFound } from './pages/NotFound';
import { DebugUsers } from './pages/DebugUsers';
import { ProtectedRoute } from './components/ProtectedRoute';

// Root layout component that provides auth context
const RootLayout = () => {
  return (
    <AuthProvider>
      <Outlet />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
};

// Error boundary component that doesn't require auth
const ErrorBoundary = () => {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl font-bold text-red-600">!</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-8">
            We're sorry, but something unexpected happened. Please try refreshing the page.
          </p>
          
          <button
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    </AuthProvider>
  );
};

// Protected route wrappers with explicit component definitions
const ProtectedDashboard = () => {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
};

const ProtectedReport = () => {
  return (
    <ProtectedRoute>
      <ReportRubbish />
    </ProtectedRoute>
  );
};

const ProtectedAdmin = () => {
  return (
    <ProtectedRoute adminOnly>
      <AdminDashboard />
    </ProtectedRoute>
  );
};

const ProtectedDebugUsers = () => {
  return (
    <ProtectedRoute adminOnly>
      <DebugUsers />
    </ProtectedRoute>
  );
};

export const router = createBrowserRouter([
  {
    id: 'root',
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: '/',
        element: <Landing />,
      },
      {
        path: '/auth',
        element: <Auth />,
      },
      {
        path: '/auth/callback',
        element: <AuthCallback />,
      },
      {
        path: '/dashboard',
        element: <ProtectedDashboard />,
      },
      {
        path: '/report',
        element: <ProtectedReport />,
      },
      {
        path: '/awareness',
        element: <Awareness />,
      },
      {
        path: '/admin',
        element: <ProtectedAdmin />,
      },
      {
        path: '/about-us',
        element: <AboutUs />,
      },
      {
        path: '/debug-users',
        element: <ProtectedDebugUsers />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
], {
  basename: import.meta.env.BASE_URL,
});