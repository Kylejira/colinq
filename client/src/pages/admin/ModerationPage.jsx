import { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { adminApi } from '../../services/api';
import './ModerationPage.css';

const ModerationPage = () => {
  const { getToken } = useAuthContext();
  const [reports, setReports] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, reviewing: 0, resolved: 0, dismissed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getReports(filter, getToken);
      setReports(data.reports);
      setCounts(data.counts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [filter, getToken]);

  const handleReportAction = async (reportId, status, banUser = false) => {
    const resolutionNotes = prompt('Resolution notes (optional):');
    setActionLoading(true);
    try {
      await adminApi.updateReportStatus(reportId, status, resolutionNotes, banUser, getToken);
      loadReports();
      setSelectedReport(null);
    } catch (err) {
      alert('Failed to update report: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const reportTypeIcons = {
    spam: '🗑️',
    harassment: '😠',
    inappropriate: '🚫',
    fake_profile: '🎭',
    scam: '⚠️',
    other: '📝',
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Content Moderation</h1>
        <p>Review and resolve user reports</p>
      </div>

      <div className="moderation-tabs">
        {Object.entries(counts).map(([status, count]) => (
          <button
            key={status}
            className={`mod-tab ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            <span className="tab-label">{status}</span>
            <span className={`tab-count ${status}`}>{count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="spinner"></div>
          <p>Loading reports...</p>
        </div>
      ) : error ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">⚠️</div>
          <h3>Failed to load reports</h3>
          <p>{error}</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">🛡️</div>
          <h3>No {filter} reports</h3>
          <p>All clear in this category!</p>
        </div>
      ) : (
        <div className="reports-list">
          {reports.map(report => (
            <div key={report.id} className="report-card">
              <div className="report-header">
                <div className="report-type-badge">
                  <span className="report-icon">{reportTypeIcons[report.report_type]}</span>
                  <span className="report-type">{report.report_type.replace('_', ' ')}</span>
                </div>
                <span className="report-date">{formatDate(report.created_at)}</span>
              </div>

              <div className="report-parties">
                <div className="report-party reporter">
                  <span className="party-label">Reported by</span>
                  <div className="party-info">
                    <span className="party-name">{report.reporter_name}</span>
                    <span className="party-email">{report.reporter_email}</span>
                  </div>
                </div>
                <span className="party-arrow">→</span>
                <div className="report-party reported">
                  <span className="party-label">Reported user</span>
                  <div className="party-info">
                    {report.reported_user_photo && (
                      <img src={report.reported_user_photo} alt="" className="party-avatar" />
                    )}
                    <div>
                      <span className="party-name">{report.reported_user_name || 'N/A'}</span>
                      <span className="party-email">{report.reported_user_email || ''}</span>
                    </div>
                  </div>
                </div>
              </div>

              {report.description && (
                <div className="report-description">
                  <p>{report.description}</p>
                </div>
              )}

              {report.message_content && (
                <div className="reported-message">
                  <span className="message-label">Reported message:</span>
                  <p className="message-content">"{report.message_content}"</p>
                </div>
              )}

              {filter === 'pending' && (
                <div className="report-actions">
                  <button
                    className="admin-btn admin-btn-primary"
                    onClick={() => handleReportAction(report.id, 'reviewing')}
                    disabled={actionLoading}
                  >
                    Start Review
                  </button>
                  <button
                    className="admin-btn admin-btn-outline"
                    onClick={() => handleReportAction(report.id, 'dismissed')}
                    disabled={actionLoading}
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {filter === 'reviewing' && (
                <div className="report-actions">
                  <button
                    className="admin-btn admin-btn-success"
                    onClick={() => handleReportAction(report.id, 'resolved')}
                    disabled={actionLoading}
                  >
                    Resolve
                  </button>
                  <button
                    className="admin-btn admin-btn-danger"
                    onClick={() => {
                      if (confirm('Ban user and resolve report?')) {
                        handleReportAction(report.id, 'resolved', true);
                      }
                    }}
                    disabled={actionLoading}
                  >
                    Ban User & Resolve
                  </button>
                  <button
                    className="admin-btn admin-btn-outline"
                    onClick={() => handleReportAction(report.id, 'dismissed')}
                    disabled={actionLoading}
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {(filter === 'resolved' || filter === 'dismissed') && report.resolution_notes && (
                <div className="report-resolution">
                  <span className="resolution-label">Resolution:</span>
                  <p>{report.resolution_notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModerationPage;

