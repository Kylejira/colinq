import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { messagesApi, matchesApi } from '../services/api';
import MessageThread from '../components/messaging/MessageThread';
import MessageInput from '../components/messaging/MessageInput';
import MessageTemplates from '../components/messaging/MessageTemplates';
import CollabTypeSelector from '../components/messaging/CollabTypeSelector';
import analytics from '../utils/analytics';
import './ConversationPage.css';

const ConversationPage = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user, getToken } = useAuthContext();
  
  const [match, setMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendError, setSendError] = useState(null);
  
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCollabSelector, setShowCollabSelector] = useState(false);
  const [selectedCollabType, setSelectedCollabType] = useState(null);
  const [draftMessage, setDraftMessage] = useState('');

  const loadMessages = useCallback(async () => {
    try {
      const data = await messagesApi.getMessages(matchId, {}, getToken);
      setMessages(data);
      // Mark as read
      await messagesApi.markAsRead(matchId, getToken);
    } catch (err) {
      console.error('Load messages error:', err);
    }
  }, [matchId, getToken]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [matchData, messagesData] = await Promise.all([
          matchesApi.getMatchById(matchId, getToken),
          messagesApi.getMessages(matchId, {}, getToken),
        ]);
        setMatch(matchData);
        setMessages(messagesData);
        
        // Mark as read
        await messagesApi.markAsRead(matchId, getToken);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [matchId, getToken]);

  // Poll for new messages every 10 seconds
  useEffect(() => {
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  const handleSendMessage = async (content) => {
    setSendError(null);
    try {
      const newMessage = await messagesApi.sendMessage(
        matchId,
        { content, collabType: selectedCollabType },
        getToken
      );
      setMessages(prev => [...prev, newMessage]);
      setSelectedCollabType(null);
      
      // Track message sent
      analytics.messageSent();
      if (messages.length === 0) {
        analytics.conversationStarted(matchId);
      }
    } catch (err) {
      if (err.message.includes('Monthly message limit')) {
        setSendError({
          type: 'limit',
          message: 'You\'ve reached your monthly message limit (3 messages).',
          action: 'Upgrade to Pro for unlimited messaging!'
        });
      } else {
        setSendError({ type: 'error', message: err.message });
      }
      throw err; // Re-throw to prevent clearing input
    }
  };

  const handleTemplateSelect = (text) => {
    setDraftMessage(text);
    setShowTemplates(false);
  };

  const handleCollabSelect = (collabType) => {
    setSelectedCollabType(collabType);
  };

  if (loading) {
    return (
      <div className="conversation-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="conversation-page">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => navigate('/messages')}>Back to Messages</button>
        </div>
      </div>
    );
  }

  return (
    <div className="conversation-page">
      <header className="conversation-header">
        <button className="back-btn" onClick={() => navigate('/messages')}>
          ←
        </button>
        
        <div className="convo-user" onClick={() => navigate(`/user/${match?.user_id}`)}>
          {match?.profile_photo_url ? (
            <img src={match.profile_photo_url} alt={match.display_name} className="user-avatar" />
          ) : (
            <div className="avatar-placeholder">
              {match?.display_name?.charAt(0) || '?'}
            </div>
          )}
          <div className="user-info">
            <h2>{match?.display_name}</h2>
            {match?.verification_status === 'verified' && (
              <span className="verified-inline">✓ Verified</span>
            )}
          </div>
        </div>

        <button className="menu-btn">⋮</button>
      </header>

      {sendError && (
        <div className="send-error">
          <p>{sendError.message}</p>
          <button className="dismiss-btn" onClick={() => setSendError(null)}>✕</button>
        </div>
      )}

      <MessageThread messages={messages} currentUserId={user?.id} />

      <div className="message-actions">
        {messages.length === 0 && (
          <button 
            className="action-chip"
            onClick={() => setShowTemplates(true)}
          >
            💬 Templates
          </button>
        )}
        <button 
          className={`action-chip ${selectedCollabType ? 'active' : ''}`}
          onClick={() => setShowCollabSelector(true)}
        >
          🤝 {selectedCollabType ? `Proposing: ${selectedCollabType}` : 'Propose Collab'}
        </button>
      </div>

      <MessageInput
        onSend={handleSendMessage}
        disabled={!!sendError?.type === 'limit'}
        placeholder={selectedCollabType ? `Describe your ${selectedCollabType} idea...` : 'Type a message...'}
      />

      {showTemplates && (
        <MessageTemplates
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      )}

      {showCollabSelector && (
        <CollabTypeSelector
          selectedType={selectedCollabType}
          onSelect={handleCollabSelect}
          onClose={() => setShowCollabSelector(false)}
        />
      )}
    </div>
  );
};

export default ConversationPage;

