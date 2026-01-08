import {
  demoProfiles,
  demoMatches,
  demoMessages,
  demoCollaborations,
  demoSubscription,
  demoUsage,
  demoContractTemplates,
  demoAdminStats,
  demoAdminAnalytics,
  demoVerificationQueue,
  demoAdminUsers,
  demoReports,
} from './demoData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Check if we're in demo mode (token is 'demo-token')
const isDemoMode = async (getToken) => {
  try {
    const token = await getToken();
    return token === 'demo-token';
  } catch {
    return true;
  }
};

// Simulate network delay for demo mode
const demoDelay = () => new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));

// Helper to make authenticated requests
const authFetch = async (endpoint, options = {}, getToken) => {
  // Check for demo mode
  if (await isDemoMode(getToken)) {
    return handleDemoRequest(endpoint, options);
  }

  const token = await getToken();
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }

  return response.json();
};

// Demo mode request handler
const handleDemoRequest = async (endpoint, options = {}) => {
  await demoDelay();
  
  // Parse endpoint
  const [path, query] = endpoint.split('?');
  const method = options.method || 'GET';
  
  // Discover profiles
  if (path === '/swipes/discover' && method === 'GET') {
    return [...demoProfiles];
  }
  
  // Create swipe
  if (path === '/swipes' && method === 'POST') {
    const body = JSON.parse(options.body || '{}');
    const isMatch = Math.random() > 0.6; // 40% chance of match for demo
    return {
      success: true,
      match: isMatch ? {
        id: `match-new-${Date.now()}`,
        other_user: demoProfiles.find(p => p.id === body.targetId) || demoProfiles[0],
        created_at: new Date().toISOString(),
      } : null,
    };
  }
  
  // Get saved profiles
  if (path === '/swipes/saved' && method === 'GET') {
    // Return a subset of demo profiles as "saved"
    return demoProfiles.slice(0, 2).map(p => ({ ...p, saved_at: new Date().toISOString() }));
  }
  
  // Get matches
  if (path === '/matches' && method === 'GET') {
    return demoMatches;
  }
  
  // Get single match
  const matchIdMatch = path.match(/^\/matches\/(.+)$/);
  if (matchIdMatch && method === 'GET') {
    const match = demoMatches.find(m => m.id === matchIdMatch[1]);
    return match || demoMatches[0];
  }
  
  // Get conversations (same as matches for demo)
  if (path === '/messages' && method === 'GET') {
    return demoMatches;
  }
  
  // Get messages for a match
  const messagesMatch = path.match(/^\/messages\/([^/]+)$/);
  if (messagesMatch && method === 'GET') {
    const matchId = messagesMatch[1];
    return {
      messages: demoMessages[matchId] || [],
      hasMore: false,
    };
  }
  
  // Send message
  if (messagesMatch && method === 'POST') {
    const body = JSON.parse(options.body || '{}');
    return {
      id: `msg-${Date.now()}`,
      sender_id: 'demo-user-123',
      content: body.content,
      sent_at: new Date().toISOString(),
      read_at: null,
    };
  }
  
  // Mark messages as read
  const readMatch = path.match(/^\/messages\/([^/]+)\/read$/);
  if (readMatch && method === 'PATCH') {
    return { success: true };
  }
  
  // Subscription status
  if (path === '/subscriptions/status' && method === 'GET') {
    return demoSubscription;
  }
  
  // Subscription usage
  if (path === '/subscriptions/usage' && method === 'GET') {
    return demoUsage;
  }
  
  // Create checkout (demo mode just returns info)
  if (path === '/subscriptions/checkout' && method === 'POST') {
    return { 
      message: 'Demo mode - Stripe checkout disabled',
      demoMode: true 
    };
  }
  
  // Get collaborations
  if (path === '/collaborations' && method === 'GET') {
    return demoCollaborations;
  }
  
  // Get single collaboration
  const collabMatch = path.match(/^\/collaborations\/([^/]+)$/);
  if (collabMatch && method === 'GET') {
    return demoCollaborations.find(c => c.id === collabMatch[1]) || demoCollaborations[0];
  }
  
  // Create collaboration
  if (path === '/collaborations' && method === 'POST') {
    const body = JSON.parse(options.body || '{}');
    return {
      id: `collab-new-${Date.now()}`,
      ...body,
      status: 'planning',
      created_at: new Date().toISOString(),
      checklist: [],
      contract: null,
    };
  }
  
  // Contract templates
  if (path === '/collaborations/templates' && method === 'GET') {
    return demoContractTemplates;
  }
  
  // Auth sync
  if (path === '/auth/sync' && method === 'POST') {
    return { success: true };
  }
  
  // Auth me
  if (path === '/auth/me' && method === 'GET') {
    return {
      id: 'demo-user-123',
      clerk_id: 'demo_clerk_123',
      email: 'demo@colinq.com',
      display_name: 'Demo Creator',
      bio: 'Tech reviewer and lifestyle vlogger with a passion for helping creators grow.',
      profile_photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      niche: 'Technology',
      audience_size: 125000,
      engagement_rate: 4.8,
      location: 'Los Angeles, CA',
      collaboration_interests: ['Guest Appearances', 'Joint Videos', 'Cross-Promotion'],
      is_verified: true,
      is_admin: true, // Demo user is admin
      subscription_tier: 'pro',
    };
  }

  // ==================== ADMIN ENDPOINTS ====================
  
  // Admin dashboard stats
  if (path === '/admin/stats' && method === 'GET') {
    return demoAdminStats;
  }
  
  // Admin analytics
  if (path.startsWith('/admin/analytics') && method === 'GET') {
    return demoAdminAnalytics;
  }
  
  // Verification queue
  if (path.startsWith('/admin/verifications') && method === 'GET') {
    const statusParam = query?.split('status=')[1]?.split('&')[0] || 'pending';
    const filteredUsers = demoVerificationQueue.filter(u => u.verification_status === statusParam);
    return { users: filteredUsers, total: filteredUsers.length };
  }
  
  // Update verification status
  const verifyMatch = path.match(/^\/admin\/verifications\/(.+)$/);
  if (verifyMatch && method === 'PATCH') {
    return { id: verifyMatch[1], verification_status: 'verified' };
  }
  
  // Admin users list
  if (path.startsWith('/admin/users') && method === 'GET' && !path.includes('/admin/users/')) {
    return { users: demoAdminUsers, total: demoAdminUsers.length };
  }
  
  // Admin user details
  const userDetailMatch = path.match(/^\/admin\/users\/([^/]+)$/);
  if (userDetailMatch && method === 'GET') {
    const user = demoAdminUsers.find(u => u.id === userDetailMatch[1]) || demoAdminUsers[0];
    return {
      user: { ...user, match_count: 15, message_count: 47, collab_count: 3, report_count: 0 },
      platforms: user.platforms || [],
      reports: [],
    };
  }
  
  // Update user status
  const userStatusMatch = path.match(/^\/admin\/users\/([^/]+)\/status$/);
  if (userStatusMatch && method === 'PATCH') {
    return { success: true };
  }
  
  // Admin reports
  if (path.startsWith('/admin/reports') && method === 'GET') {
    const statusParam = query?.split('status=')[1]?.split('&')[0] || 'pending';
    const filteredReports = demoReports.filter(r => r.status === statusParam);
    return { 
      reports: filteredReports, 
      counts: { pending: 2, reviewing: 1, resolved: 0, dismissed: 0 } 
    };
  }
  
  // Update report status
  const reportMatch = path.match(/^\/admin\/reports\/(.+)$/);
  if (reportMatch && method === 'PATCH') {
    return { id: reportMatch[1], status: 'resolved' };
  }
  
  // Default response
  console.log('Demo API - unhandled endpoint:', path, method);
  return { success: true, demoMode: true };
};

// Auth API
export const authApi = {
  syncUser: (data, getToken) => 
    authFetch('/auth/sync', {
      method: 'POST',
      body: JSON.stringify(data),
    }, getToken),

  getCurrentUser: (getToken) => 
    authFetch('/auth/me', {}, getToken),

  getYouTubeAuthUrl: (getToken) => 
    authFetch('/auth/youtube', {}, getToken),
};

// Users API
export const usersApi = {
  getUserById: async (id) => {
    const response = await fetch(`${API_URL}/users/${id}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  updateProfile: (data, getToken) =>
    authFetch('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, getToken),

  uploadVerificationVideo: (data, getToken) =>
    authFetch('/users/verification-video', {
      method: 'POST',
      body: JSON.stringify(data),
    }, getToken),

  checkProfileStatus: (getToken) =>
    authFetch('/users/profile/status', {}, getToken),
};

// Swipes API
export const swipesApi = {
  getDiscoverProfiles: (filters, getToken) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const queryString = params.toString();
    return authFetch(`/swipes/discover${queryString ? `?${queryString}` : ''}`, {}, getToken);
  },

  createSwipe: (data, getToken) =>
    authFetch('/swipes', {
      method: 'POST',
      body: JSON.stringify(data),
    }, getToken),

  getSavedProfiles: (getToken) =>
    authFetch('/swipes/saved', {}, getToken),
};

// Matches API
export const matchesApi = {
  getMatches: (getToken) =>
    authFetch('/matches', {}, getToken),

  getMatchById: (id, getToken) =>
    authFetch(`/matches/${id}`, {}, getToken),

  updateMatchStatus: (id, status, getToken) =>
    authFetch(`/matches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, getToken),
};

// Messages API
export const messagesApi = {
  getConversations: (getToken) =>
    authFetch('/messages', {}, getToken),

  getMessages: (matchId, options = {}, getToken) => {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit);
    if (options.before) params.append('before', options.before);
    const queryString = params.toString();
    return authFetch(`/messages/${matchId}${queryString ? `?${queryString}` : ''}`, {}, getToken);
  },

  sendMessage: (matchId, data, getToken) =>
    authFetch(`/messages/${matchId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, getToken),

  markAsRead: (matchId, getToken) =>
    authFetch(`/messages/${matchId}/read`, {
      method: 'PATCH',
    }, getToken),

  getUnreadCount: (getToken) =>
    authFetch('/messages/unread', {}, getToken),
};

// Subscriptions API
export const subscriptionsApi = {
  getStatus: (getToken) =>
    authFetch('/subscriptions/status', {}, getToken),

  createCheckout: (tier, getToken) =>
    authFetch('/subscriptions/checkout', {
      method: 'POST',
      body: JSON.stringify({ tier }),
    }, getToken),

  getPortalUrl: (getToken) =>
    authFetch('/subscriptions/portal', {}, getToken),

  getUsage: (getToken) =>
    authFetch('/subscriptions/usage', {}, getToken),
};

// Collaborations API
export const collaborationsApi = {
  getCollaborations: (getToken) =>
    authFetch('/collaborations', {}, getToken),

  getCollaboration: (id, getToken) =>
    authFetch(`/collaborations/${id}`, {}, getToken),

  createCollaboration: (data, getToken) =>
    authFetch('/collaborations', {
      method: 'POST',
      body: JSON.stringify(data),
    }, getToken),

  updateStatus: (id, status, getToken) =>
    authFetch(`/collaborations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, getToken),

  updateChecklist: (id, checklist, getToken) =>
    authFetch(`/collaborations/${id}/checklist`, {
      method: 'PATCH',
      body: JSON.stringify({ checklist }),
    }, getToken),

  // Contract endpoints
  getTemplates: (getToken) =>
    authFetch('/collaborations/templates', {}, getToken),

  getTemplate: (templateId, getToken) =>
    authFetch(`/collaborations/templates/${templateId}`, {}, getToken),

  createContract: (collaborationId, data, getToken) =>
    authFetch(`/collaborations/${collaborationId}/contract`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, getToken),

  signContract: (collaborationId, signatureData, getToken) =>
    authFetch(`/collaborations/${collaborationId}/sign`, {
      method: 'POST',
      body: JSON.stringify({ signatureData }),
    }, getToken),
};

// Admin API
export const adminApi = {
  getDashboardStats: (getToken) =>
    authFetch('/admin/stats', {}, getToken),

  getAnalytics: (period, getToken) =>
    authFetch(`/admin/analytics?period=${period}`, {}, getToken),

  getVerificationQueue: (status, getToken) =>
    authFetch(`/admin/verifications?status=${status}`, {}, getToken),

  updateVerificationStatus: (userId, status, reason, getToken) =>
    authFetch(`/admin/verifications/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    }, getToken),

  getUsers: (params, getToken) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.tier) query.append('tier', params.tier);
    if (params.limit) query.append('limit', params.limit);
    if (params.offset) query.append('offset', params.offset);
    return authFetch(`/admin/users?${query.toString()}`, {}, getToken);
  },

  getUserDetails: (userId, getToken) =>
    authFetch(`/admin/users/${userId}`, {}, getToken),

  updateUserStatus: (userId, action, reason, getToken) =>
    authFetch(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ action, reason }),
    }, getToken),

  getReports: (status, getToken) =>
    authFetch(`/admin/reports?status=${status}`, {}, getToken),

  updateReportStatus: (reportId, status, resolutionNotes, banUser, getToken) =>
    authFetch(`/admin/reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolutionNotes, banUser }),
    }, getToken),

  getActivityLog: (getToken) =>
    authFetch('/admin/activity', {}, getToken),
};
