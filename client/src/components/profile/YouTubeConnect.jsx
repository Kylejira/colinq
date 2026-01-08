import { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { authApi } from '../../services/api';
import './YouTubeConnect.css';

const YouTubeConnect = ({ onConnected }) => {
  const { user, getToken } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const youtubeConnected = user?.platforms?.some(p => p.platform_name === 'youtube');
  const youtubePlatform = user?.platforms?.find(p => p.platform_name === 'youtube');

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      const { authUrl } = await authApi.getYouTubeAuthUrl(getToken);
      window.location.href = authUrl;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (youtubeConnected && youtubePlatform) {
    return (
      <div className="youtube-connect connected">
        <div className="connected-header">
          <div className="youtube-icon">▶</div>
          <div className="connected-info">
            <h3>YouTube Connected</h3>
            <p>{youtubePlatform.follower_count?.toLocaleString()} subscribers</p>
          </div>
          <span className="connected-badge">✓ Connected</span>
        </div>

        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{youtubePlatform.follower_count?.toLocaleString() || '0'}</span>
            <span className="stat-label">Subscribers</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{youtubePlatform.engagement_rate || '0'}%</span>
            <span className="stat-label">Engagement</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{youtubePlatform.niche || 'N/A'}</span>
            <span className="stat-label">Niche</span>
          </div>
        </div>

        {youtubePlatform.recent_content && youtubePlatform.recent_content.length > 0 && (
          <div className="recent-content">
            <h4>Recent Videos</h4>
            <div className="video-list">
              {youtubePlatform.recent_content.slice(0, 3).map(video => (
                <div key={video.id} className="video-item">
                  {video.thumbnail && (
                    <img src={video.thumbnail} alt={video.title} className="video-thumb" />
                  )}
                  <div className="video-info">
                    <p className="video-title">{video.title}</p>
                    <span className="video-views">{video.views?.toLocaleString()} views</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {onConnected && (
          <button className="continue-btn" onClick={onConnected}>
            Continue
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="youtube-connect">
      <div className="connect-header">
        <div className="youtube-icon">▶</div>
        <h3>Connect Your YouTube Channel</h3>
        <p>We'll pull your stats automatically to help you find the perfect collaborators.</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <ul className="benefits-list">
        <li>Auto-import subscriber count & engagement rate</li>
        <li>Showcase your recent videos</li>
        <li>Get matched with similar creators</li>
        <li>Build trust with verified stats</li>
      </ul>

      <button 
        className="connect-btn" 
        onClick={handleConnect}
        disabled={loading}
      >
        {loading ? 'Connecting...' : 'Connect YouTube Channel'}
      </button>

      <p className="privacy-note">
        We only read your public channel data. We never post on your behalf.
      </p>

      {onConnected && (
        <button 
          className="skip-btn" 
          onClick={onConnected}
          type="button"
        >
          Skip for now →
        </button>
      )}
    </div>
  );
};

export default YouTubeConnect;

