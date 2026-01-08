import './SwipeActions.css';

const SwipeActions = ({ onSwipe, disabled }) => {
  return (
    <div className="swipe-actions">
      <button 
        className="action-btn pass" 
        onClick={() => onSwipe('pass')}
        disabled={disabled}
        title="Pass"
      >
        ✕
      </button>
      
      <button 
        className="action-btn save" 
        onClick={() => onSwipe('save')}
        disabled={disabled}
        title="Save for Later"
      >
        🔖
      </button>
      
      <button 
        className="action-btn like" 
        onClick={() => onSwipe('like')}
        disabled={disabled}
        title="Like"
      >
        ♥
      </button>
    </div>
  );
};

export default SwipeActions;

