import { useState } from 'react';
import './CollabTypeSelector.css';

const COLLAB_TYPES = [
  { id: 'joint_video', label: 'Joint Video', icon: '🎬', description: 'Create content together' },
  { id: 'guest_swap', label: 'Guest Swap', icon: '🔄', description: 'Appear on each other\'s channels' },
  { id: 'takeover', label: 'Channel Takeover', icon: '📺', description: 'Take over their channel for a day' },
  { id: 'podcast', label: 'Podcast Interview', icon: '🎙️', description: 'Be a guest on their podcast' },
  { id: 'livestream', label: 'Live Stream', icon: '🔴', description: 'Go live together' },
  { id: 'challenge', label: 'Challenge/Series', icon: '🏆', description: 'Do a challenge or series together' },
];

const CollabTypeSelector = ({ selectedType, onSelect, onClose }) => {
  const [selected, setSelected] = useState(selectedType);

  const handleConfirm = () => {
    onSelect(selected);
    onClose();
  };

  return (
    <div className="collab-selector-overlay" onClick={onClose}>
      <div className="collab-selector" onClick={e => e.stopPropagation()}>
        <div className="collab-selector-header">
          <h3>Propose a Collaboration</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="collab-options">
          {COLLAB_TYPES.map(type => (
            <button
              key={type.id}
              className={`collab-option ${selected === type.id ? 'selected' : ''}`}
              onClick={() => setSelected(type.id)}
            >
              <span className="collab-icon">{type.icon}</span>
              <div className="collab-info">
                <span className="collab-label">{type.label}</span>
                <span className="collab-desc">{type.description}</span>
              </div>
              {selected === type.id && <span className="check">✓</span>}
            </button>
          ))}
        </div>

        <div className="collab-selector-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button 
            className="confirm-btn" 
            onClick={handleConfirm}
            disabled={!selected}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollabTypeSelector;

