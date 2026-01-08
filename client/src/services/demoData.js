// Demo mock data for preview mode

export const demoProfiles = [
  {
    id: 'demo-1',
    display_name: 'Sarah Chen',
    bio: 'Tech reviewer and lifestyle vlogger. I help people make smart tech decisions with honest, in-depth reviews.',
    profile_photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    niche: 'Technology',
    audience_size: 245000,
    engagement_rate: 5.2,
    location: 'San Francisco, CA',
    collaboration_interests: ['Product Reviews', 'Tech Comparisons', 'Guest Appearances'],
    is_verified: true,
    tiktok_handle: 'sarahchentech',
    tiktok_followers: 89000,
    instagram_handle: 'sarahchen.tech',
    instagram_followers: 125000,
    platforms: [
      { platform_name: 'youtube', platform_user_id: 'UC123456', follower_count: 245000, engagement_rate: 5.2, niche: 'Technology' }
    ]
  },
  {
    id: 'demo-2',
    display_name: 'Marcus Johnson',
    bio: 'Fitness coach & nutrition expert. Transforming lives one workout at a time. Let\'s create something that inspires!',
    profile_photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    niche: 'Fitness',
    audience_size: 189000,
    engagement_rate: 6.8,
    location: 'Austin, TX',
    collaboration_interests: ['Workout Challenges', 'Nutrition Tips', 'Brand Partnerships'],
    is_verified: true,
    tiktok_handle: 'marcusfitness',
    tiktok_followers: 340000,
    instagram_handle: 'marcus.fitness',
    instagram_followers: 210000,
    platforms: [
      { platform_name: 'youtube', platform_user_id: 'UC234567', follower_count: 189000, engagement_rate: 6.8, niche: 'Fitness' }
    ]
  },
  {
    id: 'demo-3',
    display_name: 'Emma Martinez',
    bio: 'Beauty & skincare enthusiast sharing my journey to healthy skin. Love trying new products and honest reviews!',
    profile_photo_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    niche: 'Beauty',
    audience_size: 312000,
    engagement_rate: 4.5,
    location: 'Los Angeles, CA',
    collaboration_interests: ['Product Reviews', 'Skincare Routines', 'Brand Collabs'],
    is_verified: true,
    tiktok_handle: 'emmabeauty',
    tiktok_followers: 520000,
    instagram_handle: 'emma.glowup',
    instagram_followers: 445000,
    platforms: [
      { platform_name: 'youtube', platform_user_id: 'UC345678', follower_count: 312000, engagement_rate: 4.5, niche: 'Beauty' }
    ]
  },
  {
    id: 'demo-4',
    display_name: 'Alex Rivera',
    bio: 'Gaming content creator & esports commentator. From casual streams to competitive analysis - I cover it all!',
    profile_photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    niche: 'Gaming',
    audience_size: 520000,
    engagement_rate: 7.1,
    location: 'Seattle, WA',
    collaboration_interests: ['Gaming Collabs', 'Esports Coverage', 'Stream Crossovers'],
    is_verified: true,
    tiktok_handle: 'alexgamingpro',
    tiktok_followers: 180000,
    instagram_handle: null,
    instagram_followers: null,
    platforms: [
      { platform_name: 'youtube', platform_user_id: 'UC456789', follower_count: 520000, engagement_rate: 7.1, niche: 'Gaming' }
    ]
  },
  {
    id: 'demo-5',
    display_name: 'Priya Patel',
    bio: 'Food blogger & home chef. Sharing easy recipes from around the world. Let\'s make cooking fun together!',
    profile_photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
    niche: 'Food',
    audience_size: 156000,
    engagement_rate: 5.9,
    location: 'Chicago, IL',
    collaboration_interests: ['Recipe Videos', 'Cooking Challenges', 'Food Reviews'],
    is_verified: false,
    tiktok_handle: 'priyacooks',
    tiktok_followers: 275000,
    instagram_handle: 'priya.eats',
    instagram_followers: 98000,
    platforms: [
      { platform_name: 'youtube', platform_user_id: 'UC567890', follower_count: 156000, engagement_rate: 5.9, niche: 'Food' }
    ]
  },
];

export const demoMatches = [
  {
    id: 'match-1',
    status: 'active',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    other_user: demoProfiles[0],
    last_message: {
      content: 'Hey! I love your content, would love to collab on a tech review!',
      sent_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    unread_count: 2,
  },
  {
    id: 'match-2',
    status: 'active',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    other_user: demoProfiles[1],
    last_message: {
      content: 'That sounds great! When were you thinking?',
      sent_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    unread_count: 0,
  },
  {
    id: 'match-3',
    status: 'active',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    other_user: demoProfiles[3],
    last_message: null,
    unread_count: 0,
  },
];

export const demoMessages = {
  'match-1': [
    {
      id: 'msg-1',
      sender_id: 'demo-1',
      content: 'Hey! I saw your channel and I think we\'d make great collab partners!',
      sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60000).toISOString(),
    },
    {
      id: 'msg-2',
      sender_id: 'demo-user-123',
      content: 'Thanks Sarah! I\'ve been following your tech reviews for a while. Would love to work together!',
      sent_at: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
      read_at: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000 + 60000).toISOString(),
    },
    {
      id: 'msg-3',
      sender_id: 'demo-1',
      content: 'I was thinking we could do a comparison video - maybe the latest flagship phones?',
      sent_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      read_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 60000).toISOString(),
    },
    {
      id: 'msg-4',
      sender_id: 'demo-1',
      content: 'Hey! I love your content, would love to collab on a tech review!',
      sent_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      read_at: null,
    },
  ],
  'match-2': [
    {
      id: 'msg-5',
      sender_id: 'demo-user-123',
      content: 'Hey Marcus! Love your fitness content. Any interest in a crossover video?',
      sent_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      read_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 60000).toISOString(),
    },
    {
      id: 'msg-6',
      sender_id: 'demo-2',
      content: 'Absolutely! I think a tech + fitness angle could be really cool. Like reviewing fitness gadgets?',
      sent_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      read_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 60000).toISOString(),
    },
    {
      id: 'msg-7',
      sender_id: 'demo-user-123',
      content: 'Perfect! I\'ve got some smartwatches I\'ve been wanting to test in real workouts.',
      sent_at: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000).toISOString(),
      read_at: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000 + 60000).toISOString(),
    },
    {
      id: 'msg-8',
      sender_id: 'demo-2',
      content: 'That sounds great! When were you thinking?',
      sent_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      read_at: new Date(Date.now() - 3 * 60 * 60 * 1000 + 60000).toISOString(),
    },
  ],
};

export const demoCollaborations = [
  {
    id: 'collab-1',
    match_id: 'match-1',
    title: 'Flagship Phone Showdown 2024',
    collaboration_type: 'joint_video',
    status: 'in_progress',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    partner: demoProfiles[0],
    checklist: [
      { id: '1', text: 'Finalize video concept', completed: true },
      { id: '2', text: 'Script first draft', completed: true },
      { id: '3', text: 'Film individual segments', completed: false },
      { id: '4', text: 'Edit and combine footage', completed: false },
      { id: '5', text: 'Review and approve final cut', completed: false },
    ],
    contract: {
      id: 'contract-1',
      status: 'signed',
      template_name: 'Joint Video Collaboration',
      created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      signatures: [
        { user_id: 'demo-user-123', signed_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
        { user_id: 'demo-1', signed_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 3600000).toISOString() },
      ]
    }
  },
  {
    id: 'collab-2',
    match_id: 'match-2',
    title: 'Fitness Tech Review Series',
    collaboration_type: 'content_series',
    status: 'planning',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    partner: demoProfiles[1],
    checklist: [
      { id: '1', text: 'Define series scope', completed: false },
      { id: '2', text: 'List products to review', completed: false },
    ],
    contract: null
  },
];

export const demoSubscription = {
  tier: 'pro',
  status: 'active',
  currentPeriodEnd: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
  features: {
    unlimitedSwipes: true,
    unlimitedMessages: true,
    advancedFilters: true,
    analytics: true,
    verifiedBadge: true,
    prioritySupport: false,
    featuredPlacement: false,
    revenueTracking: false,
  }
};

export const demoUsage = {
  profileViews: { used: 45, limit: null, unlimited: true },
  messages: { used: 23, limit: null, unlimited: true },
  superLikes: { used: 3, limit: 10, unlimited: false },
};

export const demoContractTemplates = [
  {
    id: 'template-1',
    name: 'Joint Video Collaboration',
    description: 'Standard agreement for creating collaborative video content together.',
    fields: ['video_title', 'publish_date', 'revenue_split', 'editing_responsibility'],
  },
  {
    id: 'template-2',
    name: 'Guest Appearance',
    description: 'Agreement for appearing as a guest on another creator\'s channel.',
    fields: ['episode_title', 'recording_date', 'promotion_requirements'],
  },
  {
    id: 'template-3',
    name: 'Cross-Promotion',
    description: 'Mutual promotion agreement between two creators.',
    fields: ['promotion_type', 'duration', 'deliverables'],
  },
];

// Admin Demo Data
export const demoAdminStats = {
  totalUsers: 1247,
  activeUsers: 423,
  pendingVerifications: 12,
  pendingReports: 5,
  totalMatches: 3421,
  recentSignups: 87,
  subscriptionBreakdown: {
    free: 892,
    pro: 298,
    premium: 57,
  },
};

export const demoAdminAnalytics = {
  signups: [
    { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), count: 12 },
    { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), count: 18 },
    { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), count: 8 },
    { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), count: 22 },
    { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), count: 15 },
    { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), count: 19 },
    { date: new Date().toISOString(), count: 7 },
  ],
  matches: [
    { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), count: 34 },
    { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), count: 45 },
    { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), count: 28 },
    { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), count: 52 },
    { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), count: 41 },
    { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), count: 38 },
    { date: new Date().toISOString(), count: 15 },
  ],
  messages: [
    { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), count: 156 },
    { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), count: 203 },
    { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), count: 178 },
    { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), count: 245 },
    { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), count: 198 },
    { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), count: 221 },
    { date: new Date().toISOString(), count: 89 },
  ],
  topNiches: [
    { niche: 'Technology', count: 312 },
    { niche: 'Gaming', count: 287 },
    { niche: 'Lifestyle', count: 234 },
    { niche: 'Beauty', count: 198 },
    { niche: 'Fitness', count: 176 },
    { niche: 'Food', count: 143 },
    { niche: 'Travel', count: 121 },
    { niche: 'Finance', count: 98 },
  ],
  verificationStats: [
    { verification_status: 'verified', count: 847 },
    { verification_status: 'pending', count: 312 },
    { verification_status: 'rejected', count: 88 },
  ],
};

export const demoVerificationQueue = [
  {
    id: 'verify-1',
    display_name: 'Jake Thompson',
    email: 'jake@example.com',
    profile_photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
    verification_video_url: 'https://example.com/video1.mp4',
    verification_status: 'pending',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    follower_count: 45000,
    engagement_rate: 4.2,
    niche: 'Gaming',
  },
  {
    id: 'verify-2',
    display_name: 'Maria Garcia',
    email: 'maria@example.com',
    profile_photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
    verification_video_url: 'https://example.com/video2.mp4',
    verification_status: 'pending',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    follower_count: 128000,
    engagement_rate: 5.8,
    niche: 'Beauty',
  },
  {
    id: 'verify-3',
    display_name: 'Chris Wilson',
    email: 'chris@example.com',
    profile_photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    verification_video_url: 'https://example.com/video3.mp4',
    verification_status: 'pending',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    follower_count: 67000,
    engagement_rate: 3.9,
    niche: 'Fitness',
  },
];

export const demoAdminUsers = [
  ...demoProfiles.map((p, i) => ({
    ...p,
    is_banned: false,
    is_admin: i === 0,
    subscription_tier: i === 0 ? 'premium' : i === 1 ? 'pro' : 'free',
    created_at: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  })),
  {
    id: 'banned-user',
    display_name: 'Suspended User',
    email: 'suspended@example.com',
    profile_photo_url: null,
    verification_status: 'rejected',
    subscription_tier: 'free',
    is_banned: true,
    is_admin: false,
    follower_count: 0,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const demoReports = [
  {
    id: 'report-1',
    reporter_id: 'demo-2',
    reporter_name: 'Marcus Johnson',
    reporter_email: 'marcus@example.com',
    reported_user_id: 'banned-user',
    reported_user_name: 'Suspended User',
    reported_user_email: 'suspended@example.com',
    reported_user_photo: null,
    report_type: 'spam',
    description: 'This user keeps sending promotional messages without any intent to collaborate.',
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'report-2',
    reporter_id: 'demo-1',
    reporter_name: 'Sarah Chen',
    reporter_email: 'sarah@example.com',
    reported_user_id: 'demo-5',
    reported_user_name: 'Priya Patel',
    reported_user_email: 'priya@example.com',
    reported_user_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
    report_type: 'fake_profile',
    description: 'I believe this profile is using photos that don\'t belong to them.',
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'report-3',
    reporter_id: 'demo-3',
    reporter_name: 'Emma Martinez',
    reporter_email: 'emma@example.com',
    reported_user_id: 'demo-4',
    reported_user_name: 'Alex Rivera',
    reported_user_email: 'alex@example.com',
    reported_user_photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    report_type: 'harassment',
    description: 'Received inappropriate messages after declining collaboration.',
    message_content: 'You\'re missing out! Your loss!',
    status: 'reviewing',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

