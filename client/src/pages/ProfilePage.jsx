import { useNavigate } from 'react-router-dom';
import DemoUserButton from '../components/auth/DemoUserButton';
import { useAuthContext } from '../context/AuthContext';
import ProfileForm from '../components/profile/ProfileForm';
import YouTubeConnect from '../components/profile/YouTubeConnect';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, isLoaded } = useAuthContext();
  const navigate = useNavigate();

  if (!isLoaded) {
    return (
      <div className="profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Your Profile</h1>
        <DemoUserButton afterSignOutUrl="/" />
      </header>

      <main className="profile-main">
        <div className="profile-section">
          <ProfileForm />
        </div>

        <div className="profile-section">
          <h2>Connected Platforms</h2>
          <YouTubeConnect />
        </div>

        {user && (
          <div className="profile-section stats-section">
            <h2>Account Status</h2>
            <div className="status-grid">
              <div className="status-item">
                <span className="status-label">Verification</span>
                <span className={`status-value ${user.verification_status}`}>
                  {user.verification_status === 'verified' && '✓ Verified'}
                  {user.verification_status === 'pending' && '⏳ Pending'}
                  {user.verification_status === 'rejected' && '✗ Rejected'}
                  {!user.verification_status && 'Not submitted'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Subscription</span>
                <span className="status-value">
                  {user.subscription_tier?.charAt(0).toUpperCase() + user.subscription_tier?.slice(1) || 'Free'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Member Since</span>
                <span className="status-value">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;

