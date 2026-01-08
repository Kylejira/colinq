// Google Analytics 4 utility functions

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Initialize Google Analytics
export const initGA = () => {
  if (!GA_MEASUREMENT_ID) {
    console.log('Google Analytics not configured - add VITE_GA_MEASUREMENT_ID to .env');
    return;
  }

  // Add gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

// Track page views
export const trackPageView = (pagePath, pageTitle) => {
  if (!window.gtag) return;
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: pagePath,
    page_title: pageTitle,
  });
};

// Track custom events
export const trackEvent = (eventName, params = {}) => {
  if (!window.gtag) return;
  
  window.gtag('event', eventName, params);
};

// Pre-defined events for Colinq
export const analytics = {
  // Auth events
  signUp: (method = 'email') => {
    trackEvent('sign_up', { method });
  },
  
  signIn: (method = 'email') => {
    trackEvent('login', { method });
  },
  
  signOut: () => {
    trackEvent('logout');
  },

  // Onboarding events
  onboardingStarted: () => {
    trackEvent('onboarding_started');
  },
  
  onboardingCompleted: () => {
    trackEvent('onboarding_completed');
  },
  
  youtubeConnected: () => {
    trackEvent('youtube_connected');
  },
  
  youtubeSkipped: () => {
    trackEvent('youtube_skipped');
  },

  // Discovery events
  profileViewed: (creatorId) => {
    trackEvent('profile_viewed', { creator_id: creatorId });
  },
  
  profileLiked: (creatorId) => {
    trackEvent('profile_liked', { creator_id: creatorId });
  },
  
  profilePassed: (creatorId) => {
    trackEvent('profile_passed', { creator_id: creatorId });
  },
  
  profileSaved: (creatorId) => {
    trackEvent('profile_saved', { creator_id: creatorId });
  },

  // Match events
  matchCreated: (matchId) => {
    trackEvent('match_created', { match_id: matchId });
  },

  // Message events
  messageSent: () => {
    trackEvent('message_sent');
  },
  
  conversationStarted: (matchId) => {
    trackEvent('conversation_started', { match_id: matchId });
  },

  // Collaboration events
  collaborationStarted: (collaborationId) => {
    trackEvent('collaboration_started', { collaboration_id: collaborationId });
  },
  
  collaborationCompleted: (collaborationId) => {
    trackEvent('collaboration_completed', { collaboration_id: collaborationId });
  },
};

export default analytics;

