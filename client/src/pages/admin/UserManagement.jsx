import { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { adminApi } from '../../services/api';
import './UserManagement.css';

const UserManagement = () => {
  const { getToken } = useAuthContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers({
        search,
        status: statusFilter,
        tier: tierFilter,
        limit,
        offset: page * limit,
      }, getToken);
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, statusFilter, tierFilter, page, getToken]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    loadUsers();
  };

  const handleUserAction = async (userId, action) => {
    const reason = prompt(`Reason for ${action} (optional):`);
    setActionLoading(true);
    try {
      await adminApi.updateUserStatus(userId, action, reason, getToken);
      loadUsers(); // Refresh list
      if (selectedUser?.id === userId) {
        const updated = await adminApi.getUserDetails(userId, getToken);
        setSelectedUser(updated);
      }
    } catch (err) {
      alert('Failed to update user: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const viewUserDetails = async (userId) => {
    try {
      const data = await adminApi.getUserDetails(userId, getToken);
      setSelectedUser(data);
    } catch (err) {
      alert('Failed to load user details: ' + err.message);
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
        <h1>User Management</h1>
        <p>Search, view, and manage platform users</p>
      </div>

      <div className="admin-table-container">
        <div className="admin-filters">
          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '400px' }}>
            <input
              type="text"
              className="admin-search"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%' }}
            />
          </form>
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            className="admin-select"
            value={tierFilter}
            onChange={(e) => { setTierFilter(e.target.value); setPage(0); }}
          >
            <option value="">All Tiers</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="premium">Premium</option>
          </select>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : error ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">⚠️</div>
            <h3>Failed to load users</h3>
            <p>{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">👥</div>
            <h3>No users found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Status</th>
                  <th>Tier</th>
                  <th>Followers</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-row-info">
                        <img
                          src={user.profile_photo_url || 'https://via.placeholder.com/40'}
                          alt={user.display_name}
                          className="user-row-avatar"
                        />
                        <div>
                          <div className="user-row-name">
                            {user.display_name}
                            {user.is_admin && <span className="admin-indicator">👑</span>}
                          </div>
                          <div className="user-row-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {user.is_banned ? (
                        <span className="admin-badge banned">Banned</span>
                      ) : (
                        <span className={`admin-badge ${user.verification_status}`}>
                          {user.verification_status}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`tier-badge-sm ${user.subscription_tier}`}>
                        {user.subscription_tier}
                      </span>
                    </td>
                    <td>{formatFollowers(user.follower_count)}</td>
                    <td>{formatDate(user.created_at)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="admin-btn admin-btn-outline admin-btn-sm"
                          onClick={() => viewUserDetails(user.id)}
                        >
                          View
                        </button>
                        {user.is_banned ? (
                          <button
                            className="admin-btn admin-btn-success admin-btn-sm"
                            onClick={() => handleUserAction(user.id, 'unban')}
                            disabled={actionLoading}
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            className="admin-btn admin-btn-danger admin-btn-sm"
                            onClick={() => handleUserAction(user.id, 'ban')}
                            disabled={actionLoading}
                          >
                            Ban
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="admin-pagination">
              <span className="pagination-info">
                Showing {page * limit + 1} - {Math.min((page + 1) * limit, total)} of {total}
              </span>
              <div className="pagination-buttons">
                <button
                  className="admin-btn admin-btn-outline"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 0}
                >
                  Previous
                </button>
                <button
                  className="admin-btn admin-btn-outline"
                  onClick={() => setPage(p => p + 1)}
                  disabled={(page + 1) * limit >= total}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="user-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button className="modal-close" onClick={() => setSelectedUser(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="user-detail-header">
                <img
                  src={selectedUser.user.profile_photo_url || 'https://via.placeholder.com/80'}
                  alt={selectedUser.user.display_name}
                  className="user-detail-avatar"
                />
                <div className="user-detail-info">
                  <h3>{selectedUser.user.display_name}</h3>
                  <p>{selectedUser.user.email}</p>
                  <div className="user-badges">
                    <span className={`admin-badge ${selectedUser.user.verification_status}`}>
                      {selectedUser.user.verification_status}
                    </span>
                    <span className={`tier-badge-sm ${selectedUser.user.subscription_tier}`}>
                      {selectedUser.user.subscription_tier}
                    </span>
                    {selectedUser.user.is_banned && (
                      <span className="admin-badge banned">Banned</span>
                    )}
                    {selectedUser.user.is_admin && (
                      <span className="admin-badge active">Admin</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="user-stats-grid">
                <div className="user-stat">
                  <span className="stat-value">{selectedUser.user.match_count || 0}</span>
                  <span className="stat-label">Matches</span>
                </div>
                <div className="user-stat">
                  <span className="stat-value">{selectedUser.user.message_count || 0}</span>
                  <span className="stat-label">Messages</span>
                </div>
                <div className="user-stat">
                  <span className="stat-value">{selectedUser.user.collab_count || 0}</span>
                  <span className="stat-label">Collabs</span>
                </div>
                <div className="user-stat">
                  <span className="stat-value">{selectedUser.user.report_count || 0}</span>
                  <span className="stat-label">Reports</span>
                </div>
              </div>

              {selectedUser.user.bio && (
                <div className="user-bio">
                  <h4>Bio</h4>
                  <p>{selectedUser.user.bio}</p>
                </div>
              )}

              {selectedUser.platforms?.length > 0 && (
                <div className="user-platforms">
                  <h4>Connected Platforms</h4>
                  {selectedUser.platforms.map(platform => (
                    <div key={platform.id} className="platform-card">
                      <span className="platform-name">{platform.platform_name}</span>
                      <span>{formatFollowers(platform.follower_count)} followers</span>
                      <span>{platform.engagement_rate?.toFixed(1)}% engagement</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedUser.reports?.length > 0 && (
                <div className="user-reports">
                  <h4>Recent Reports ({selectedUser.reports.length})</h4>
                  {selectedUser.reports.map(report => (
                    <div key={report.id} className="report-item">
                      <span className="report-type">{report.report_type}</span>
                      <span className="report-by">by {report.reporter_name}</span>
                      <span className={`admin-badge ${report.status}`}>{report.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              {selectedUser.user.is_banned ? (
                <button
                  className="admin-btn admin-btn-success"
                  onClick={() => handleUserAction(selectedUser.user.id, 'unban')}
                  disabled={actionLoading}
                >
                  Unban User
                </button>
              ) : (
                <button
                  className="admin-btn admin-btn-danger"
                  onClick={() => handleUserAction(selectedUser.user.id, 'ban')}
                  disabled={actionLoading}
                >
                  Ban User
                </button>
              )}
              {!selectedUser.user.is_admin ? (
                <button
                  className="admin-btn admin-btn-primary"
                  onClick={() => handleUserAction(selectedUser.user.id, 'make_admin')}
                  disabled={actionLoading}
                >
                  Make Admin
                </button>
              ) : (
                <button
                  className="admin-btn admin-btn-outline"
                  onClick={() => handleUserAction(selectedUser.user.id, 'remove_admin')}
                  disabled={actionLoading}
                >
                  Remove Admin
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;



