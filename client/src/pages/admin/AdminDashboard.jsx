import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { adminApi } from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { getToken } = useAuthContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await adminApi.getDashboardStats(getToken);
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [getToken]);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-empty">
          <div className="admin-empty-icon">⚠️</div>
          <h3>Failed to load dashboard</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p>Overview of your platform</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon blue">👥</div>
          </div>
          <div className="stat-value">{stats?.totalUsers?.toLocaleString() || 0}</div>
          <div className="stat-label">Total Users</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon green">✨</div>
          </div>
          <div className="stat-value">{stats?.activeUsers?.toLocaleString() || 0}</div>
          <div className="stat-label">Active This Week</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon purple">💜</div>
          </div>
          <div className="stat-value">{stats?.totalMatches?.toLocaleString() || 0}</div>
          <div className="stat-label">Total Matches</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon orange">🆕</div>
          </div>
          <div className="stat-value">{stats?.recentSignups?.toLocaleString() || 0}</div>
          <div className="stat-label">New This Week</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Action Items</h2>
          </div>
          <div className="action-items">
            <Link to="/admin/verifications" className="action-item">
              <div className="action-icon pending">✓</div>
              <div className="action-content">
                <span className="action-count">{stats?.pendingVerifications || 0}</span>
                <span className="action-label">Pending Verifications</span>
              </div>
              <span className="action-arrow">→</span>
            </Link>
            <Link to="/admin/moderation" className="action-item">
              <div className="action-icon warning">🛡️</div>
              <div className="action-content">
                <span className="action-count">{stats?.pendingReports || 0}</span>
                <span className="action-label">Reports to Review</span>
              </div>
              <span className="action-arrow">→</span>
            </Link>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Subscriptions</h2>
          </div>
          <div className="subscription-breakdown">
            <div className="subscription-tier">
              <div className="tier-info">
                <span className="tier-badge free">Free</span>
                <span className="tier-label">Free Tier</span>
              </div>
              <span className="tier-count">{stats?.subscriptionBreakdown?.free || 0}</span>
            </div>
            <div className="subscription-tier">
              <div className="tier-info">
                <span className="tier-badge pro">Pro</span>
                <span className="tier-label">Pro Members</span>
              </div>
              <span className="tier-count">{stats?.subscriptionBreakdown?.pro || 0}</span>
            </div>
            <div className="subscription-tier">
              <div className="tier-info">
                <span className="tier-badge premium">Premium</span>
                <span className="tier-label">Premium Members</span>
              </div>
              <span className="tier-count">{stats?.subscriptionBreakdown?.premium || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-section full-width">
        <div className="section-header">
          <h2>Quick Links</h2>
        </div>
        <div className="quick-links">
          <Link to="/admin/users" className="quick-link">
            <span className="quick-link-icon">👥</span>
            <span>Manage Users</span>
          </Link>
          <Link to="/admin/analytics" className="quick-link">
            <span className="quick-link-icon">📈</span>
            <span>View Analytics</span>
          </Link>
          <Link to="/discover" className="quick-link">
            <span className="quick-link-icon">🎯</span>
            <span>Preview App</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

