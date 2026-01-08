import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { swipesApi } from '../services/api';
import SwipeCard from '../components/discovery/SwipeCard';
import SwipeActions from '../components/discovery/SwipeActions';
import MatchModal from '../components/discovery/MatchModal';
import FilterPanel from '../components/discovery/FilterPanel';
import DemoUserButton from '../components/auth/DemoUserButton';
import './DiscoverPage.css';

const DiscoverPage = () => {
  const { user, getToken } = useAuthContext();
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [swiping, setSwiping] = useState(false);
  const [match, setMatch] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    niche: '',
    minFollowers: '',
    maxFollowers: '',
    minEngagement: '',
    location: '',
  });

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await swipesApi.getDiscoverProfiles(filters, getToken);
      setProfiles(data);
      setCurrentIndex(0);
    } catch (err) {
      if (err.message.includes('Daily limit')) {
        setError({
          type: 'limit',
          message: 'You\'ve reached your daily limit of 10 profile views.',
          action: 'Upgrade to Pro for unlimited swiping!'
        });
      } else {
        setError({ type: 'error', message: err.message });
      }
    } finally {
      setLoading(false);
    }
  }, [filters, getToken]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const handleSwipe = async (action) => {
    if (swiping || currentIndex >= profiles.length) return;
    
    const currentProfile = profiles[currentIndex];
    setSwiping(true);

    try {
      const result = await swipesApi.createSwipe({
        targetId: currentProfile.id,
        action,
      }, getToken);

      if (result.match) {
        setMatch(result.match);
      }

      // Move to next profile
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Load more profiles
        loadProfiles();
      }
    } catch (err) {
      if (err.message.includes('Daily limit')) {
        setError({
          type: 'limit',
          message: 'You\'ve reached your daily limit of 10 profile views.',
          action: 'Upgrade to Pro for unlimited swiping!'
        });
      } else {
        console.error('Swipe error:', err);
      }
    } finally {
      setSwiping(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const currentProfile = profiles[currentIndex];

  return (
    <div className="discover-page">
      <header className="discover-header">
        <Link to="/" className="logo">Colinq</Link>
        <nav className="discover-nav">
          <Link to="/profile" className="nav-link">Profile</Link>
          <Link to="/saved" className="nav-link">Saved</Link>
          <Link to="/matches" className="nav-link">Matches</Link>
          <Link to="/messages" className="nav-link">Messages</Link>
          <DemoUserButton afterSignOutUrl="/" />
        </nav>
      </header>

      <main className="discover-main">
        <div className="discover-controls">
          <button 
            className="filter-btn"
            onClick={() => setShowFilters(true)}
          >
            ⚙️ Filters
          </button>
          <span className="profile-count">
            {profiles.length > 0 && `${currentIndex + 1} of ${profiles.length}`}
          </span>
        </div>

        {loading ? (
          <div className="discover-loading">
            <div className="loading-spinner"></div>
            <p>Finding creators for you...</p>
          </div>
        ) : error ? (
          <div className="discover-error">
            <div className="error-icon">
              {error.type === 'limit' ? '🔒' : '😕'}
            </div>
            <h2>{error.type === 'limit' ? 'Daily Limit Reached' : 'Oops!'}</h2>
            <p>{error.message}</p>
            {error.type === 'error' && (
              <button className="retry-btn" onClick={loadProfiles}>
                Try Again
              </button>
            )}
          </div>
        ) : profiles.length === 0 ? (
          <div className="discover-empty">
            <div className="empty-icon">🎯</div>
            <h2>No More Profiles</h2>
            <p>You've seen everyone matching your criteria. Try adjusting your filters or check back later!</p>
            <button className="filter-btn-large" onClick={() => setShowFilters(true)}>
              Adjust Filters
            </button>
          </div>
        ) : currentProfile ? (
          <div className="swipe-container">
            <SwipeCard profile={currentProfile} />
            <SwipeActions onSwipe={handleSwipe} disabled={swiping} />
          </div>
        ) : null}
      </main>

      {showFilters && (
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      {match && (
        <MatchModal
          match={match}
          currentUser={user}
          onClose={() => setMatch(null)}
        />
      )}
    </div>
  );
};

export default DiscoverPage;
