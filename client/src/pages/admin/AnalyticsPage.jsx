import { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { adminApi } from '../../services/api';
import './AnalyticsPage.css';

const AnalyticsPage = () => {
  const { getToken } = useAuthContext();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const data = await adminApi.getAnalytics(period, getToken);
        setAnalytics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [period, getToken]);

  const getMaxValue = (data) => {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map(d => d.count), 1);
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-empty">
          <div className="admin-empty-icon">⚠️</div>
          <h3>Failed to load analytics</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Analytics</h1>
          <p>Platform growth and engagement metrics</p>
        </div>
        <select
          className="admin-select"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      <div className="analytics-grid">
        {/* User Signups Chart */}
        <div className="analytics-card">
          <h3>New User Signups</h3>
          <div className="chart-container">
            {analytics?.signups?.length > 0 ? (
              <div className="bar-chart">
                {analytics.signups.map((item, index) => (
                  <div key={index} className="chart-bar-wrapper">
                    <div
                      className="chart-bar signups"
                      style={{
                        height: `${(item.count / getMaxValue(analytics.signups)) * 100}%`
                      }}
                      title={`${item.count} signups`}
                    >
                      <span className="bar-value">{item.count}</span>
                    </div>
                    <span className="bar-label">
                      {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="chart-empty">No signup data available</div>
            )}
          </div>
          <div className="chart-total">
            Total: {analytics?.signups?.reduce((sum, d) => sum + parseInt(d.count), 0) || 0}
          </div>
        </div>

        {/* Matches Chart */}
        <div className="analytics-card">
          <h3>Matches Created</h3>
          <div className="chart-container">
            {analytics?.matches?.length > 0 ? (
              <div className="bar-chart">
                {analytics.matches.map((item, index) => (
                  <div key={index} className="chart-bar-wrapper">
                    <div
                      className="chart-bar matches"
                      style={{
                        height: `${(item.count / getMaxValue(analytics.matches)) * 100}%`
                      }}
                      title={`${item.count} matches`}
                    >
                      <span className="bar-value">{item.count}</span>
                    </div>
                    <span className="bar-label">
                      {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="chart-empty">No match data available</div>
            )}
          </div>
          <div className="chart-total">
            Total: {analytics?.matches?.reduce((sum, d) => sum + parseInt(d.count), 0) || 0}
          </div>
        </div>

        {/* Messages Chart */}
        <div className="analytics-card">
          <h3>Messages Sent</h3>
          <div className="chart-container">
            {analytics?.messages?.length > 0 ? (
              <div className="bar-chart">
                {analytics.messages.map((item, index) => (
                  <div key={index} className="chart-bar-wrapper">
                    <div
                      className="chart-bar messages"
                      style={{
                        height: `${(item.count / getMaxValue(analytics.messages)) * 100}%`
                      }}
                      title={`${item.count} messages`}
                    >
                      <span className="bar-value">{item.count}</span>
                    </div>
                    <span className="bar-label">
                      {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="chart-empty">No message data available</div>
            )}
          </div>
          <div className="chart-total">
            Total: {analytics?.messages?.reduce((sum, d) => sum + parseInt(d.count), 0) || 0}
          </div>
        </div>

        {/* Top Niches */}
        <div className="analytics-card">
          <h3>Top Niches</h3>
          <div className="niches-list">
            {analytics?.topNiches?.length > 0 ? (
              analytics.topNiches.map((niche, index) => (
                <div key={index} className="niche-item">
                  <span className="niche-rank">{index + 1}</span>
                  <span className="niche-name">{niche.niche || 'Uncategorized'}</span>
                  <span className="niche-count">{niche.count} creators</span>
                </div>
              ))
            ) : (
              <div className="chart-empty">No niche data available</div>
            )}
          </div>
        </div>

        {/* Verification Stats */}
        <div className="analytics-card wide">
          <h3>Verification Status Breakdown</h3>
          <div className="verification-breakdown">
            {analytics?.verificationStats?.map((stat, index) => {
              const total = analytics.verificationStats.reduce((sum, s) => sum + parseInt(s.count), 0);
              const percentage = total > 0 ? (stat.count / total) * 100 : 0;
              
              return (
                <div key={index} className="verification-stat">
                  <div className="stat-header">
                    <span className={`status-dot ${stat.verification_status}`}></span>
                    <span className="status-name">{stat.verification_status}</span>
                    <span className="status-count">{stat.count}</span>
                  </div>
                  <div className="status-bar">
                    <div
                      className={`status-fill ${stat.verification_status}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="status-percentage">{percentage.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

