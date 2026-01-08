import { createContext, useContext, useState } from 'react';

const DemoAuthContext = createContext(null);

// Mock demo user data
const demoUser = {
  id: 'demo-user-123',
  clerk_id: 'demo_clerk_123',
  email: 'demo@colinq.com',
  display_name: 'Demo Creator',
  bio: 'Tech reviewer and lifestyle vlogger with a passion for helping creators grow their audience.',
  profile_photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
  niche: 'Technology',
  audience_size: 125000,
  engagement_rate: 4.8,
  location: 'Los Angeles, CA',
  collaboration_interests: ['Guest Appearances', 'Joint Videos', 'Cross-Promotion'],
  is_verified: true,
  is_admin: true, // Demo user has admin access
  subscription_tier: 'pro',
  created_at: '2024-01-15T00:00:00Z',
  platforms: [
    {
      platform_type: 'youtube',
      platform_username: 'DemoCreator',
      follower_count: 125000,
      engagement_rate: 4.8,
      profile_url: 'https://youtube.com/@democreator',
      is_verified: true,
    }
  ]
};

const demoClerkUser = {
  id: 'demo_clerk_123',
  fullName: 'Demo Creator',
  username: 'democreator',
  imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
  primaryEmailAddress: {
    emailAddress: 'demo@colinq.com'
  }
};

export const DemoAuthProvider = ({ children }) => {
  const [user] = useState(demoUser);

  const value = {
    user,
    clerkUser: demoClerkUser,
    isLoaded: true,
    isSignedIn: true,
    loading: false,
    error: null,
    refreshUser: async () => {},
    getToken: async () => 'demo-token',
    isDemo: true,
  };

  return (
    <DemoAuthContext.Provider value={value}>
      {children}
    </DemoAuthContext.Provider>
  );
};

export const useDemoAuthContext = () => {
  const context = useContext(DemoAuthContext);
  if (!context) {
    throw new Error('useDemoAuthContext must be used within a DemoAuthProvider');
  }
  return context;
};

export { DemoAuthContext };

