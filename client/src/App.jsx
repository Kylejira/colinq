import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { AuthProvider } from './context/AuthContext';
import { DemoAuthProvider } from './context/DemoAuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import HomePage from './pages/HomePage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import OnboardingPage from './pages/OnboardingPage';
import ProfilePage from './pages/ProfilePage';
import DiscoverPage from './pages/DiscoverPage';
import MatchesPage from './pages/MatchesPage';
import MessagesPage from './pages/MessagesPage';
import ConversationPage from './pages/ConversationPage';
// import SubscriptionPage from './pages/SubscriptionPage'; // Temporarily disabled
import CollaborationsListPage from './pages/CollaborationsListPage';
import CollaborationPage from './pages/CollaborationPage';
import SavedPage from './pages/SavedPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import VerificationQueue from './pages/admin/VerificationQueue';
import UserManagement from './pages/admin/UserManagement';
import ModerationPage from './pages/admin/ModerationPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Check if we have a valid Clerk key (not placeholder, not undefined)
const hasValidClerkKey = clerkPubKey && !clerkPubKey.includes('placeholder');
const isDemoMode = !hasValidClerkKey;

if (isDemoMode) {
  console.log('%c🎮 DEMO MODE ACTIVE', 'background: #6366f1; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold;');
  console.log('To use real authentication, add your Clerk publishable key to .env');
}

// Demo banner component
const DemoBanner = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: 'white',
    padding: '8px 16px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: 500,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  }}>
    <span>🎮</span>
    <span>Demo Mode — Previewing with mock data</span>
    <span style={{ opacity: 0.8, marginLeft: '8px' }}>|</span>
    <span style={{ opacity: 0.8 }}>Add Clerk credentials to .env for real auth</span>
  </div>
);

// App routes component (shared between demo and real modes)
const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<HomePage />} />
    <Route path="/sign-in/*" element={<SignInPage />} />
    <Route path="/sign-up/*" element={<SignUpPage />} />
    <Route path="/terms" element={<TermsPage />} />
    <Route path="/privacy" element={<PrivacyPage />} />
    
    {/* Protected routes */}
    <Route 
      path="/onboarding" 
      element={
        <ProtectedRoute>
          <OnboardingPage />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/profile/connect" 
      element={
        <ProtectedRoute>
          <OnboardingPage />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/profile" 
      element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/discover" 
      element={
        <ProtectedRoute>
          <DiscoverPage />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/matches" 
      element={
        <ProtectedRoute>
          <MatchesPage />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/saved" 
      element={
        <ProtectedRoute>
          <SavedPage />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/messages" 
      element={
        <ProtectedRoute>
          <MessagesPage />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/messages/:matchId" 
      element={
        <ProtectedRoute>
          <ConversationPage />
        </ProtectedRoute>
      } 
    />
    {/* Subscription page temporarily disabled - uncomment when ready to add pricing
    <Route 
      path="/subscription" 
      element={
        <ProtectedRoute>
          <SubscriptionPage />
        </ProtectedRoute>
      } 
    />
    */}
    <Route 
      path="/collaborations" 
      element={
        <ProtectedRoute>
          <CollaborationsListPage />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/collaborations/:id" 
      element={
        <ProtectedRoute>
          <CollaborationPage />
        </ProtectedRoute>
      } 
    />

    {/* Admin routes */}
    <Route 
      path="/admin" 
      element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<AdminDashboard />} />
      <Route path="verifications" element={<VerificationQueue />} />
      <Route path="users" element={<UserManagement />} />
      <Route path="moderation" element={<ModerationPage />} />
      <Route path="analytics" element={<AnalyticsPage />} />
    </Route>
  </Routes>
);

// Demo mode app (no Clerk)
const DemoApp = () => (
  <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <DemoAuthProvider>
      <DemoBanner />
      <div className="app" style={{ paddingTop: '40px' }}>
        <AppRoutes />
      </div>
    </DemoAuthProvider>
  </Router>
);

// Real app with Clerk
const RealApp = () => (
  <ClerkProvider publishableKey={clerkPubKey}>
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <div className="app">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  </ClerkProvider>
);

function App() {
  return (
    <ErrorBoundary>
      {isDemoMode ? <DemoApp /> : <RealApp />}
    </ErrorBoundary>
  );
}

export default App;
