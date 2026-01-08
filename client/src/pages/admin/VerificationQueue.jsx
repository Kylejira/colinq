import { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { adminApi } from '../../services/api';
import './VerificationQueue.css';

const VerificationQueue = () => {
  const { getToken } = useAuthContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('pending');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getVerificationQueue(filter, getToken);
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filter, getToken]);

  const handleVerification = async (userId, status, reason = '') => {
    setActionLoading(true);
    try {
      await adminApi.updateVerificationStatus(userId, status, reason, getToken);
      setUsers(users.filter(u => u.id !== userId));
      setSelectedUser(null);
    } catch (err) {
      alert('Failed to update verification: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatFollowers = (count) => {
    if (!count) return 'N/A';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Verification Queue</h1>
        <p>Review and approve creator verification requests</p>
      </div>

      <div className="verification-filters">
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button
          className={`filter-btn ${filter === 'verified' ? 'active' : ''}`}
          onClick={() => setFilter('verified')}
        >
          Verified
        </button>
        <button
          className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="spinner"></div>
          <p>Loading verification queue...</p>
        </div>
      ) : error ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">⚠️</div>
          <h3>Failed to load queue</h3>
          <p>{error}</p>
        </div>
      ) : users.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">✓</div>
          <h3>All caught up!</h3>
          <p>No {filter} verifications to review.</p>
        </div>
      ) : (
        <div className="verification-grid">
          {users.map(user => (
            <div key={user.id} className="verification-card">
              <div className="verification-card-header">
                <img
                  src={user.profile_photo_url || 'https://via.placeholder.com/60'}
                  alt={user.display_name}
                  className="verification-avatar"
                />
                <div className="verification-info">
                  <h3>{user.display_name}</h3>
                  <p>{user.email}</p>
                  <span className={`admin-badge ${user.verification_status}`}>
                    {user.verification_status}
                  </span>
                </div>
              </div>

              <div className="verification-stats">
                <div className="stat">
                  <span className="stat-value">{formatFollowers(user.follower_count)}</span>
                  <span className="stat-label">Followers</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{user.engagement_rate?.toFixed(1) || 'N/A'}%</span>
                  <span className="stat-label">Engagement</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{user.niche || 'N/A'}</span>
                  <span className="stat-label">Niche</span>
                </div>
              </div>

              <div className="verification-meta">
                <span>Joined {formatDate(user.created_at)}</span>
              </div>

              {user.verification_video_url && (
                <div className="verification-video">
                  <button
                    className="video-btn"
                    onClick={() => setSelectedUser(user)}
                  >
                    🎥 Review Verification Video
                  </button>
                </div>
              )}

              {filter === 'pending' && (
                <div className="verification-actions">
                  <button
                    className="admin-btn admin-btn-success"
                    onClick={() => handleVerification(user.id, 'verified')}
                    disabled={actionLoading}
                  >
                    ✓ Approve
                  </button>
                  <button
                    className="admin-btn admin-btn-danger"
                    onClick={() => {
                      const reason = prompt('Reason for rejection (optional):');
                      handleVerification(user.id, 'rejected', reason);
                    }}
                    disabled={actionLoading}
                  >
                    ✕ Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Video Preview Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Verification Video</h2>
              <button className="modal-close" onClick={() => setSelectedUser(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="video-container">
                <video
                  src={selectedUser.verification_video_url}
                  controls
                  autoPlay
                  className="verification-video-player"
                >
                  Your browser does not support video playback.
                </video>
              </div>
              <div className="video-user-info">
                <img
                  src={selectedUser.profile_photo_url || 'https://via.placeholder.com/40'}
                  alt={selectedUser.display_name}
                />
                <div>
                  <h3>{selectedUser.display_name}</h3>
                  <p>{selectedUser.email}</p>
                </div>
              </div>
            </div>
            {filter === 'pending' && (
              <div className="modal-footer">
                <button
                  className="admin-btn admin-btn-success"
                  onClick={() => handleVerification(selectedUser.id, 'verified')}
                  disabled={actionLoading}
                >
                  ✓ Approve
                </button>
                <button
                  className="admin-btn admin-btn-danger"
                  onClick={() => {
                    const reason = prompt('Reason for rejection (optional):');
                    handleVerification(selectedUser.id, 'rejected', reason);
                  }}
                  disabled={actionLoading}
                >
                  ✕ Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationQueue;



