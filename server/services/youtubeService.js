const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI
);

// Generate OAuth URL for YouTube
const getAuthUrl = (state) => {
  const scopes = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: state,
    prompt: 'consent',
  });
};

// Exchange authorization code for tokens
const getTokensFromCode = async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

// Get YouTube channel stats
const getChannelStats = async (accessToken) => {
  oauth2Client.setCredentials({ access_token: accessToken });
  
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  
  // Get channel info
  const channelResponse = await youtube.channels.list({
    part: 'snippet,statistics,brandingSettings',
    mine: true,
  });

  if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
    throw new Error('No YouTube channel found');
  }

  const channel = channelResponse.data.items[0];
  
  // Get recent videos for engagement calculation
  const videosResponse = await youtube.search.list({
    part: 'id',
    channelId: channel.id,
    maxResults: 10,
    order: 'date',
    type: 'video',
  });

  let engagementRate = 0;
  let recentContent = [];

  if (videosResponse.data.items && videosResponse.data.items.length > 0) {
    const videoIds = videosResponse.data.items.map(item => item.id.videoId).join(',');
    
    const videoStatsResponse = await youtube.videos.list({
      part: 'snippet,statistics',
      id: videoIds,
    });

    const videos = videoStatsResponse.data.items || [];
    const subscriberCount = parseInt(channel.statistics.subscriberCount) || 1;
    
    // Calculate average engagement rate
    let totalEngagement = 0;
    videos.forEach(video => {
      const views = parseInt(video.statistics.viewCount) || 0;
      const likes = parseInt(video.statistics.likeCount) || 0;
      const comments = parseInt(video.statistics.commentCount) || 0;
      
      if (views > 0) {
        totalEngagement += ((likes + comments) / views) * 100;
      }
    });
    
    engagementRate = videos.length > 0 ? (totalEngagement / videos.length).toFixed(2) : 0;

    // Format recent content
    recentContent = videos.slice(0, 5).map(video => ({
      id: video.id,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.medium?.url,
      publishedAt: video.snippet.publishedAt,
      views: parseInt(video.statistics.viewCount) || 0,
    }));
  }

  // Determine niche from channel keywords/description
  const keywords = channel.brandingSettings?.channel?.keywords || '';
  const description = channel.snippet.description || '';
  
  return {
    platformUserId: channel.id,
    channelTitle: channel.snippet.title,
    channelDescription: channel.snippet.description,
    thumbnailUrl: channel.snippet.thumbnails.high?.url,
    followerCount: parseInt(channel.statistics.subscriberCount) || 0,
    videoCount: parseInt(channel.statistics.videoCount) || 0,
    viewCount: parseInt(channel.statistics.viewCount) || 0,
    engagementRate: parseFloat(engagementRate),
    recentContent,
    niche: extractNiche(keywords, description),
    stats: {
      subscriberCount: channel.statistics.subscriberCount,
      videoCount: channel.statistics.videoCount,
      viewCount: channel.statistics.viewCount,
    },
  };
};

// Simple niche extraction from keywords/description
const extractNiche = (keywords, description) => {
  const niches = [
    'gaming', 'tech', 'beauty', 'fashion', 'fitness', 'food', 'travel',
    'music', 'comedy', 'education', 'lifestyle', 'vlog', 'news', 'sports',
    'entertainment', 'art', 'science', 'business', 'finance', 'health',
  ];
  
  const text = (keywords + ' ' + description).toLowerCase();
  
  for (const niche of niches) {
    if (text.includes(niche)) {
      return niche;
    }
  }
  
  return 'other';
};

// Refresh access token
const refreshAccessToken = async (refreshToken) => {
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials;
};

module.exports = {
  getAuthUrl,
  getTokensFromCode,
  getChannelStats,
  refreshAccessToken,
};



