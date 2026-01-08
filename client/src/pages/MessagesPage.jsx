import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DemoUserButton from '../components/auth/DemoUserButton';
import { useAuthContext } from '../context/AuthContext';
import { messagesApi } from '../services/api';
import './MessagesPage.css';

const MessagesPage = () => {
  const { user, getToken } = useAuthContext();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await messagesApi.getConversations(getToken);
        setConversations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [getToken]);

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleConversationClick = (matchId) => {
    navigate(`/messages/${matchId}`);
  };

  return (
    <div className="messages-page">
      <header className="messages-header">
        <Link to="/" className="logo">Colinq</Link>
        <nav className="messages-nav">
          <Link to="/discover" className="nav-link">Discover</Link>
          <Link to="/matches" className="nav-link">Matches</Link>
          <Link to="/profile" className="nav-link">Profile</Link>
          <DemoUserButton afterSignOutUrl="/" />
        </nav>
      </header>

      <main className="messages-main">
        <h1>Messages</h1>

        {loading ? (
          <div className="messages-loading">
            <div className="loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="messages-error">
            <p>{error}</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="messages-empty">
            <div className="empty-icon">💬</div>
            <h2>No Messages Yet</h2>
            <p>When you match with someone, you can start a conversation here.</p>
            <Link to="/discover" className="discover-btn">
              Find Creators
            </Link>
          </div>
        ) : (
          <div className="conversations-list">
            {conversations.map(convo => {
              const isUnread = convo.unread_count > 0;
              const lastMessageIsMine = convo.last_message?.sender_id !== convo.other_user_id;

              return (
                <div
                  key={convo.match_id}
                  className={`conversation-item ${isUnread ? 'unread' : ''}`}
                  onClick={() => handleConversationClick(convo.match_id)}
                >
                  <div className="convo-avatar">
                    {convo.profile_photo_url ? (
                      <img src={convo.profile_photo_url} alt={convo.display_name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {convo.display_name?.charAt(0) || '?'}
                      </div>
                    )}
                    {convo.verification_status === 'verified' && (
                      <span className="verified-badge">✓</span>
                    )}
                  </div>

                  <div className="convo-content">
                    <div className="convo-header">
                      <h3>{convo.display_name}</h3>
                      {convo.last_message && (
                        <span className="convo-time">
                          {formatTime(convo.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    <div className="convo-preview">
                      {convo.last_message ? (
                        <p>
                          {lastMessageIsMine && <span className="you-prefix">You: </span>}
                          {convo.last_message.content.substring(0, 50)}
                          {convo.last_message.content.length > 50 && '...'}
                        </p>
                      ) : (
                        <p className="no-messages">No messages yet — say hi!</p>
                      )}
                      {isUnread && (
                        <span className="unread-badge">{convo.unread_count}</span>
                      )}
                    </div>
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

export default MessagesPage;

