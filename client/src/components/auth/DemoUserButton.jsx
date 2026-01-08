import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { useAuthContext } from '../../context/AuthContext';
import './DemoUserButton.css';

const DemoUserButton = ({ afterSignOutUrl = '/' }) => {
  const { isDemo, user } = useAuthContext();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // If not in demo mode, use the real Clerk UserButton
  if (!isDemo) {
    return <UserButton afterSignOutUrl={afterSignOutUrl} />;
  }

  // Demo mode - show a mock user button
  return (
    <div className="demo-user-button" ref={menuRef}>
      <button 
        className="demo-avatar-btn"
        onClick={() => setShowMenu(!showMenu)}
      >
        <img 
          src={user?.profile_photo_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'} 
          alt={user?.display_name || 'Demo User'}
          className="demo-avatar"
        />
      </button>
      
      {showMenu && (
        <div className="demo-user-menu">
          <div className="demo-user-info">
            <img 
              src={user?.profile_photo_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face'} 
              alt={user?.display_name || 'Demo User'}
              className="demo-avatar-large"
            />
            <div className="demo-user-details">
              <span className="demo-user-name">{user?.display_name || 'Demo Creator'}</span>
              <span className="demo-user-email">{user?.email || 'demo@example.com'}</span>
            </div>
          </div>
          <div className="demo-menu-divider"></div>
          <button 
            className="demo-menu-item"
            onClick={() => {
              navigate('/profile');
              setShowMenu(false);
            }}
          >
            👤 Manage account
          </button>
          <div className="demo-menu-divider"></div>
          <button 
            className="demo-menu-item demo-signout"
            onClick={() => {
              navigate(afterSignOutUrl);
              setShowMenu(false);
            }}
          >
            🚪 Sign out (demo)
          </button>
          <div className="demo-badge">
            <span>🎮 Demo Mode</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoUserButton;

