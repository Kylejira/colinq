import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PaywallModal.css';

const PaywallModal = ({ 
  isOpen, 
  onClose, 
  title = 'Upgrade to Continue',
  message,
  feature,
  currentUsage,
  limit
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    navigate('/subscription');
    onClose();
  };

  return (
    <div className="paywall-overlay" onClick={onClose}>
      <div className="paywall-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        
        <div className="paywall-icon">🔒</div>
        
        <h2>{title}</h2>
        
        {message && <p className="paywall-message">{message}</p>}
        
        {currentUsage !== undefined && limit !== undefined && (
          <div className="usage-indicator">
            <div className="usage-bar">
              <div 
                className="usage-fill" 
                style={{ width: `${Math.min((currentUsage / limit) * 100, 100)}%` }}
              />
            </div>
            <span className="usage-text">{currentUsage} / {limit} used</span>
          </div>
        )}

        <div className="paywall-benefits">
          <h4>Upgrade to Pro and get:</h4>
          <ul>
            <li>✓ Unlimited profile views</li>
            <li>✓ Unlimited messages</li>
            <li>✓ Advanced search filters</li>
            <li>✓ Analytics dashboard</li>
            <li>✓ Verified creator badge</li>
          </ul>
        </div>

        <div className="paywall-actions">
          <button className="upgrade-btn" onClick={handleUpgrade}>
            Upgrade to Pro — $25/mo
          </button>
          <button className="later-btn" onClick={onClose}>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;



