import { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { usersApi } from '../../services/api';
import './ProfileForm.css';

const COLLABORATION_TYPES = [
  'Joint Video',
  'Guest Appearance',
  'Channel Takeover',
  'Podcast Interview',
  'Live Stream',
  'Challenge/Collab Series',
  'Product Review',
  'Giveaway',
];

const NICHES = [
  'Gaming',
  'Technology',
  'Beauty & Fashion',
  'Fitness & Health',
  'Food & Cooking',
  'Travel',
  'Music',
  'Comedy',
  'Education',
  'Lifestyle',
  'Business',
  'Entertainment',
  'Sports',
  'Art & Design',
  'Other',
];

const ProfileForm = ({ onComplete }) => {
  const { user, getToken, refreshUser } = useAuthContext();
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    location: '',
    niche: '',
    collaborationInterests: [],
    tiktokHandle: '',
    tiktokFollowers: '',
    instagramHandle: '',
    instagramFollowers: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.display_name || '',
        bio: user.bio || '',
        location: user.location || '',
        niche: user.niche || '',
        collaborationInterests: user.collaboration_interests || [],
        tiktokHandle: user.tiktok_handle || '',
        tiktokFollowers: user.tiktok_followers || '',
        instagramHandle: user.instagram_handle || '',
        instagramFollowers: user.instagram_followers || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCollabToggle = (collab) => {
    setFormData(prev => ({
      ...prev,
      collaborationInterests: prev.collaborationInterests.includes(collab)
        ? prev.collaborationInterests.filter(c => c !== collab)
        : [...prev.collaborationInterests, collab],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await usersApi.updateProfile(formData, getToken);
      await refreshUser();
      if (onComplete) onComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <h2>Complete Your Profile</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="displayName">Display Name *</label>
        <input
          type="text"
          id="displayName"
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
          required
          placeholder="Your creator name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="bio">Bio *</label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          required
          placeholder="Tell other creators about yourself and your content..."
          rows={4}
        />
      </div>

      <div className="form-group">
        <label htmlFor="location">Location</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="City, Country"
        />
      </div>

      <div className="form-group">
        <label htmlFor="niche">Content Niche *</label>
        <select
          id="niche"
          name="niche"
          value={formData.niche}
          onChange={handleChange}
          required
        >
          <option value="">Select your niche</option>
          {NICHES.map(niche => (
            <option key={niche} value={niche}>{niche}</option>
          ))}
        </select>
      </div>

      {/* Social Media Section */}
      <div className="social-section">
        <h3>📱 Social Media Stats</h3>
        <p className="section-hint">Add your other platforms so creators can see your full reach</p>
        
        {/* TikTok */}
        <div className="social-platform">
          <div className="platform-header">
            <span className="platform-icon">🎵</span>
            <span className="platform-name">TikTok</span>
          </div>
          <div className="platform-inputs">
            <div className="form-group">
              <label htmlFor="tiktokHandle">Username</label>
              <div className="input-with-prefix">
                <span className="input-prefix">@</span>
                <input
                  type="text"
                  id="tiktokHandle"
                  name="tiktokHandle"
                  value={formData.tiktokHandle}
                  onChange={handleChange}
                  placeholder="username"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="tiktokFollowers">Followers</label>
              <input
                type="number"
                id="tiktokFollowers"
                name="tiktokFollowers"
                value={formData.tiktokFollowers}
                onChange={handleChange}
                placeholder="e.g. 50000"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Instagram */}
        <div className="social-platform">
          <div className="platform-header">
            <span className="platform-icon">📸</span>
            <span className="platform-name">Instagram</span>
          </div>
          <div className="platform-inputs">
            <div className="form-group">
              <label htmlFor="instagramHandle">Username</label>
              <div className="input-with-prefix">
                <span className="input-prefix">@</span>
                <input
                  type="text"
                  id="instagramHandle"
                  name="instagramHandle"
                  value={formData.instagramHandle}
                  onChange={handleChange}
                  placeholder="username"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="instagramFollowers">Followers</label>
              <input
                type="number"
                id="instagramFollowers"
                name="instagramFollowers"
                value={formData.instagramFollowers}
                onChange={handleChange}
                placeholder="e.g. 25000"
                min="0"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Collaboration Interests</label>
        <div className="collab-grid">
          {COLLABORATION_TYPES.map(collab => (
            <button
              key={collab}
              type="button"
              className={`collab-chip ${formData.collaborationInterests.includes(collab) ? 'selected' : ''}`}
              onClick={() => handleCollabToggle(collab)}
            >
              {collab}
            </button>
          ))}
        </div>
      </div>

      <button type="submit" className="submit-btn" disabled={saving}>
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
};

export default ProfileForm;

