import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DemoUserButton from '../components/auth/DemoUserButton';
import { useAuthContext } from '../context/AuthContext';
import { collaborationsApi } from '../services/api';
import './CollaborationsListPage.css';

const CollaborationsListPage = () => {
  const { getToken } = useAuthContext();
  const navigate = useNavigate();
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadCollaborations = async () => {
      try {
        const data = await collaborationsApi.getCollaborations(getToken);
        setCollaborations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCollaborations();
  }, [getToken]);

  const filteredCollabs = collaborations.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'proposed': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#666';
    }
  };

  const getContractStatus = (contractStatus) => {
    switch (contractStatus) {
      case 'signed': return { text: 'Contract Signed', color: '#10b981' };
      case 'pending_signatures': return { text: 'Awaiting Signatures', color: '#f59e0b' };
      case 'draft': return { text: 'Contract Draft', color: '#666' };
      default: return { text: 'No Contract', color: '#999' };
    }
  };

  return (
    <div className="collaborations-list-page">
      <header className="collabs-header">
        <Link to="/" className="logo">Colinq</Link>
        <nav className="collabs-nav">
          <Link to="/discover" className="nav-link">Discover</Link>
          <Link to="/matches" className="nav-link">Matches</Link>
          <Link to="/messages" className="nav-link">Messages</Link>
          <DemoUserButton afterSignOutUrl="/" />
        </nav>
      </header>

      <main className="collabs-main">
        <div className="collabs-header-section">
          <h1>Your Collaborations</h1>
          <div className="filter-tabs">
            {['all', 'proposed', 'in_progress', 'completed'].map(f => (
              <button
                key={f}
                className={filter === f ? 'active' : ''}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="collabs-loading">
            <div className="loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="collabs-error">
            <p>{error}</p>
          </div>
        ) : filteredCollabs.length === 0 ? (
          <div className="collabs-empty">
            <div className="empty-icon">🤝</div>
            <h2>No Collaborations Yet</h2>
            <p>Start a collaboration from one of your matches!</p>
            <Link to="/matches" className="matches-btn">
              View Matches
            </Link>
          </div>
        ) : (
          <div className="collabs-grid">
            {filteredCollabs.map(collab => {
              const contractInfo = getContractStatus(collab.contract_status);
              
              return (
                <div
                  key={collab.id}
                  className="collab-card"
                  onClick={() => navigate(`/collaborations/${collab.id}`)}
                >
                  <div className="collab-card-header">
                    <div className="partner-avatar">
                      {collab.partner_photo ? (
                        <img src={collab.partner_photo} alt={collab.partner_name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {collab.partner_name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="collab-info">
                      <h3>{collab.title}</h3>
                      <p className="partner-name">with {collab.partner_name}</p>
                    </div>
                    <span 
                      className="status-badge"
                      style={{ background: getStatusColor(collab.status) }}
                    >
                      {collab.status?.replace('_', ' ')}
                    </span>
                  </div>
                  
                  {collab.description && (
                    <p className="collab-description">
                      {collab.description.substring(0, 100)}
                      {collab.description.length > 100 && '...'}
                    </p>
                  )}
                  
                  <div className="collab-card-footer">
                    <span 
                      className="contract-status"
                      style={{ color: contractInfo.color }}
                    >
                      {contractInfo.text}
                    </span>
                    <span className="collab-date">
                      {new Date(collab.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default CollaborationsListPage;

