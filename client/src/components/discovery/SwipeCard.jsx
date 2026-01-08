import './SwipeCard.css';

const SwipeCard = ({ profile, onSwipe }) => {
  const youtube = profile.platforms?.find(p => p.platform_name === 'youtube');
  
  const formatFollowers = (count) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  // Check if user has any social platforms
  const hasTikTok = profile.tiktok_handle && profile.tiktok_followers;
  const hasInstagram = profile.instagram_handle && profile.instagram_followers;
  const hasYouTube = youtube && youtube.follower_count;

  return (
    <div className="swipe-card">
      <div className="card-image">
        {profile.profile_photo_url ? (
          <img src={profile.profile_photo_url} alt={profile.display_name} />
        ) : (
          <div className="placeholder-image">
            {profile.display_name?.charAt(0) || '?'}
          </div>
        )}
        {profile.verification_status === 'verified' && (
          <span className="verified-badge" title="Verified Creator">✓</span>
        )}
      </div>

      <div className="card-content">
        <div className="card-header">
          <h2>{profile.display_name}</h2>
          {profile.location && <span className="location">📍 {profile.location}</span>}
        </div>

        {/* Niche Tag */}
        {(profile.niche || youtube?.niche) && (
          <div className="niche-tag">
            {profile.niche || youtube?.niche}
          </div>
        )}

        {/* Social Platforms Row */}
        <div className="social-platforms-row">
          {hasYouTube && (
            <a 
              href={`https://youtube.com/channel/${youtube.platform_user_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="social-platform-badge youtube"
              title="View YouTube Channel"
            >
              <span className="platform-emoji">▶️</span>
              <span className="platform-count">{formatFollowers(youtube.follower_count)}</span>
            </a>
          )}
          
          {hasTikTok && (
            <a 
              href={`https://tiktok.com/@${profile.tiktok_handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="social-platform-badge tiktok"
              title={`@${profile.tiktok_handle} on TikTok`}
            >
              <span className="platform-emoji">🎵</span>
              <span className="platform-count">{formatFollowers(profile.tiktok_followers)}</span>
            </a>
          )}
          
          {hasInstagram && (
            <a 
              href={`https://instagram.com/${profile.instagram_handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="social-platform-badge instagram"
              title={`@${profile.instagram_handle} on Instagram`}
            >
              <span className="platform-emoji">📸</span>
              <span className="platform-count">{formatFollowers(profile.instagram_followers)}</span>
            </a>
          )}
        </div>

        {/* Engagement Rate (if YouTube connected) */}
        {youtube && youtube.engagement_rate && (
          <div className="engagement-row">
            <span className="engagement-label">Engagement Rate:</span>
            <span className="engagement-value">{youtube.engagement_rate}%</span>
          </div>
        )}

        <p className="bio">{profile.bio}</p>

        {profile.collaboration_interests?.length > 0 && (
          <div className="interests">
            <span className="interests-label">Open to:</span>
            <div className="interest-tags">
              {profile.collaboration_interests.slice(0, 3).map(interest => (
                <span key={interest} className="interest-tag">{interest}</span>
              ))}
            </div>
          </div>
        )}

        {profile.match_reasons?.length > 0 && (
          <div className="match-reasons">
            <span className="reasons-label">Why you might match:</span>
            <ul>
              {profile.match_reasons.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {youtube?.recent_content?.length > 0 && (
          <div className="recent-videos">
            <span className="videos-label">Recent Content</span>
            <div className="video-previews">
              {youtube.recent_content.slice(0, 3).map(video => (
                <div key={video.id} className="video-preview">
                  {video.thumbnail && (
                    <img src={video.thumbnail} alt={video.title} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwipeCard;

