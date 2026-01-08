import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DemoUserButton from '../components/auth/DemoUserButton';
import { useAuthContext } from '../context/AuthContext';
import { matchesApi } from '../services/api';
import './MatchesPage.css';

const MatchesPage = () => {
  const { getToken } = useAuthContext();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const data = await matchesApi.getMatches(getToken);
        setMatches(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [getToken]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const formatFollowers = (count) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleMatchClick = (matchId) => {
    navigate(`/messages/${matchId}`);
  };

  return (
    <div className="matches-page">
      <header className="matches-header">
        <Link to="/" className="logo">Colinq</Link>
        <nav className="matches-nav">
          <Link to="/discover" className="nav-link">Discover</Link>
          <Link to="/profile" className="nav-link">Profile</Link>
          <Link to="/messages" className="nav-link">Messages</Link>
          <DemoUserButton afterSignOutUrl="/" />
        </nav>
      </header>

      <main className="matches-main">
        <h1>Your Matches</h1>

        {loading ? (
          <div className="matches-loading">
            <div className="loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="matches-error">
            <p>{error}</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="matches-empty">
            <div className="empty-icon">💜</div>
            <h2>No Matches Yet</h2>
            <p>Start swiping to find your perfect collaboration partner!</p>
            <Link to="/discover" className="discover-btn">
              Start Discovering
            </Link>
          </div>
        ) : (
          <div className="matches-grid">
            {matches.map(match => {
              // Handle both direct user data and nested other_user structure
              const user = match.other_user || match;
              const youtube = user.platforms?.find(p => p.platform_type === 'youtube' || p.platform_name === 'youtube');
              
              return (
                <div 
                  key={match.id} 
                  className="match-card"
                  onClick={() => handleMatchClick(match.id)}
                >
                  <div className="match-avatar">
                    {user.profile_photo_url ? (
                      <img src={user.profile_photo_url} alt={user.display_name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.display_name?.charAt(0) || '?'}
                      </div>
                    )}
                    {(user.verification_status === 'verified' || user.is_verified) && (
                      <span className="verified-badge">✓</span>
                    )}
                  </div>

                  <div className="match-info">
                    <h3>{user.display_name}</h3>
                    {youtube && (
                      <p className="match-stats">
                        {formatFollowers(youtube.follower_count)} subscribers • {user.niche}
                      </p>
                    )}
                    {match.last_message ? (
                      <p className="last-message">
                        {match.last_message.content.substring(0, 50)}
                        {match.last_message.content.length > 50 && '...'}
                      </p>
                    ) : (
                      <p className="no-message">No messages yet — say hi!</p>
                    )}
                  </div>

                  <div className="match-meta">
                    <span className="match-date">{formatDate(match.created_at)}</span>
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

export default MatchesPage;

