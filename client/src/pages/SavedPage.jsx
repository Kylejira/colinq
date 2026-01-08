import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { swipesApi } from '../services/api';
import DemoUserButton from '../components/auth/DemoUserButton';
import './SavedPage.css';

const SavedPage = () => {
  const { getToken } = useAuthContext();
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadSavedProfiles();
  }, []);

  const loadSavedProfiles = async () => {
    try {
      const data = await swipesApi.getSavedProfiles(getToken);
      setSavedProfiles(data);
    } catch (err) {
      console.error('Error loading saved profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (profileId, action) => {
    setActionLoading(profileId);
    try {
      await swipesApi.createSwipe({ targetId: profileId, action }, getToken);
      // Remove from saved list after action
      setSavedProfiles(prev => prev.filter(p => p.id !== profileId));
    } catch (err) {
      console.error('Error performing action:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const formatFollowers = (count) => {
    if (!count) return '0';
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  if (loading) {
    return (
      <div className="saved-page">
        <div className="loading">Loading saved profiles...</div>
      </div>
    );
  }

  return (
    <div className="saved-page">
      <header className="saved-header">
        <Link to="/discover" className="back-btn">← Back</Link>
        <h1>Saved Profiles</h1>
        <DemoUserButton />
      </header>

      {savedProfiles.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🔖</span>
          <h2>No saved profiles yet</h2>
          <p>When you save a profile for later, it will appear here.</p>
          <Link to="/discover" className="discover-btn">Start Discovering</Link>
        </div>
      ) : (
        <div className="saved-grid">
          {savedProfiles.map(profile => {
            const youtube = profile.platforms?.find(p => p.platform_name === 'youtube');
            const isLoading = actionLoading === profile.id;
            
            return (
              <div key={profile.id} className="saved-card">
                <div className="saved-card-image">
                  <img 
                    src={profile.profile_photo_url || 'https://via.placeholder.com/300x300?text=No+Photo'} 
                    alt={profile.display_name}
                  />
                  {profile.is_verified && <span className="verified-badge">✓</span>}
                </div>
                
                <div className="saved-card-content">
                  <h3>{profile.display_name}</h3>
                  {profile.location && <p className="location">📍 {profile.location}</p>}
                  
                  {profile.niche && (
                    <span className="niche-tag">{profile.niche}</span>
                  )}
                  
                  <div className="social-stats">
                    {youtube && (
                      <span className="stat youtube">▶️ {formatFollowers(youtube.follower_count)}</span>
                    )}
                    {profile.tiktok_followers && (
                      <span className="stat tiktok">🎵 {formatFollowers(profile.tiktok_followers)}</span>
                    )}
                    {profile.instagram_followers && (
                      <span className="stat instagram">📸 {formatFollowers(profile.instagram_followers)}</span>
                    )}
                  </div>
                  
                  <p className="bio">{profile.bio?.slice(0, 100)}{profile.bio?.length > 100 ? '...' : ''}</p>
                  
                  <div className="saved-actions">
                    <button 
                      className="action-btn pass"
                      onClick={() => handleAction(profile.id, 'pass')}
                      disabled={isLoading}
                    >
                      ✕ Pass
                    </button>
                    <button 
                      className="action-btn like"
                      onClick={() => handleAction(profile.id, 'like')}
                      disabled={isLoading}
                    >
                      ♥ Like
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedPage;

