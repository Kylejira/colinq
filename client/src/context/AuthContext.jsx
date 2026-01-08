import { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { authApi } from '../services/api';
import { DemoAuthContext } from './DemoAuthContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync user to database when Clerk user is loaded
  useEffect(() => {
    const syncUser = async () => {
      if (!clerkLoaded) return;
      
      if (!isSignedIn) {
        setDbUser(null);
        setLoading(false);
        return;
      }

      try {
        // First sync user data to our database
        await authApi.syncUser({
          email: clerkUser.primaryEmailAddress?.emailAddress,
          displayName: clerkUser.fullName || clerkUser.username || 'Creator',
          profilePhotoUrl: clerkUser.imageUrl,
        }, getToken);

        // Then fetch full user data with platforms
        const userData = await authApi.getCurrentUser(getToken);
        setDbUser(userData);
        setError(null);
      } catch (err) {
        console.error('Error syncing user:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    syncUser();
  }, [clerkLoaded, isSignedIn, clerkUser, getToken]);

  // Refresh user data
  const refreshUser = async () => {
    if (!isSignedIn) return;
    
    try {
      const userData = await authApi.getCurrentUser(getToken);
      setDbUser(userData);
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  };

  const value = {
    user: dbUser,
    clerkUser,
    isLoaded: clerkLoaded && !loading,
    isSignedIn,
    loading,
    error,
    refreshUser,
    getToken,
    isDemo: false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook that works with both real and demo auth contexts
export const useAuthContext = () => {
  const realContext = useContext(AuthContext);
  const demoContext = useContext(DemoAuthContext);
  
  // If we have demo context with a user, use that
  if (demoContext?.isDemo) {
    return demoContext;
  }
  
  // Otherwise use real context
  if (realContext) {
    return realContext;
  }
  
  throw new Error('useAuthContext must be used within an AuthProvider or DemoAuthProvider');
};

