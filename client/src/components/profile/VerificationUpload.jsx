import { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { usersApi } from '../../services/api';
import './VerificationUpload.css';

const VerificationUpload = ({ onComplete }) => {
  const { user, getToken, refreshUser } = useAuthContext();
  const [videoUrl, setVideoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const verificationStatus = user?.verification_status;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!videoUrl.trim()) {
      setError('Please enter a video URL');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await usersApi.uploadVerificationVideo({ verificationVideoUrl: videoUrl }, getToken);
      await refreshUser();
      if (onComplete) onComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (verificationStatus === 'verified') {
    return (
      <div className="verification-upload verified">
        <div className="verified-badge">✓</div>
        <h3>You're Verified!</h3>
        <p>Your account has been verified. Other creators will see your verified badge.</p>
        {onComplete && (
          <button className="continue-btn" onClick={onComplete}>
            Continue
          </button>
        )}
      </div>
    );
  }

  if (verificationStatus === 'pending') {
    return (
      <div className="verification-upload pending">
        <div className="pending-icon">⏳</div>
        <h3>Verification Pending</h3>
        <p>We're reviewing your verification video. This usually takes 24-48 hours.</p>
        {onComplete && (
          <button className="continue-btn" onClick={onComplete}>
            Continue to App
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="verification-upload">
      <h3>Verify Your Account</h3>
      <p>Upload a short video to verify you're a real creator. This helps build trust in our community.</p>

      <div className="instructions">
        <h4>Video Requirements:</h4>
        <ul>
          <li>Show your face clearly</li>
          <li>Say your username and today's date</li>
          <li>Mention "Colinq"</li>
          <li>Keep it under 30 seconds</li>
        </ul>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="videoUrl">Video URL</label>
          <input
            type="url"
            id="videoUrl"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Paste a link to your verification video"
            required
          />
          <p className="help-text">
            Upload to YouTube (unlisted), Google Drive, or Dropbox and paste the link here.
          </p>
        </div>

        <button type="submit" className="submit-btn" disabled={uploading}>
          {uploading ? 'Submitting...' : 'Submit for Verification'}
        </button>
      </form>

      {onComplete && (
        <button className="skip-btn" onClick={onComplete}>
          Skip for now
        </button>
      )}
    </div>
  );
};

export default VerificationUpload;

