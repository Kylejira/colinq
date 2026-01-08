import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊', exact: true },
    { path: '/admin/verifications', label: 'Verifications', icon: '✓' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/moderation', label: 'Moderation', icon: '🛡️' },
    { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-logo">
          <span className="logo-icon">⚙️</span>
          Admin Panel
        </h1>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="link-icon">{item.icon}</span>
            <span className="link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="admin-info">
          <img 
            src={user?.profile_photo_url || 'https://via.placeholder.com/40'} 
            alt={user?.display_name}
            className="admin-avatar"
          />
          <div className="admin-details">
            <span className="admin-name">{user?.display_name}</span>
            <span className="admin-role">Administrator</span>
          </div>
        </div>
        <button 
          className="back-to-app-btn"
          onClick={() => navigate('/discover')}
        >
          ← Back to App
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;



