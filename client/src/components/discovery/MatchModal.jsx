import { useNavigate } from 'react-router-dom';
import './MatchModal.css';

const MatchModal = ({ match, currentUser, onClose }) => {
  const navigate = useNavigate();

  if (!match) return null;

  const handleMessage = () => {
    navigate(`/messages/${match.id}`);
    onClose();
  };

  const handleKeepSwiping = () => {
    onClose();
  };

  return (
    <div className="match-modal-overlay" onClick={onClose}>
      <div className="match-modal" onClick={e => e.stopPropagation()}>
        <div className="match-celebration">
          <span className="confetti">🎉</span>
          <h1>It's a Match!</h1>
          <p>You and {match.matched_user?.display_name} both want to collaborate</p>
        </div>

        <div className="match-users">
          <div className="match-user">
            {currentUser?.profile_photo_url ? (
              <img src={currentUser.profile_photo_url} alt="You" />
            ) : (
              <div className="match-user-placeholder">
                {currentUser?.display_name?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <div className="match-heart">💜</div>
          <div className="match-user">
            {match.matched_user?.profile_photo_url ? (
              <img src={match.matched_user.profile_photo_url} alt={match.matched_user.display_name} />
            ) : (
              <div className="match-user-placeholder">
                {match.matched_user?.display_name?.charAt(0) || '?'}
              </div>
            )}
          </div>
        </div>

        <div className="match-actions">
          <button className="message-btn" onClick={handleMessage}>
            Send a Message
          </button>
          <button className="keep-swiping-btn" onClick={handleKeepSwiping}>
            Keep Swiping
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchModal;



