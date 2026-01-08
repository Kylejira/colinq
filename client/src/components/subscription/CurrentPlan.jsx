import './CurrentPlan.css';

const CurrentPlan = ({ subscription, usage, onManage, onUpgrade }) => {
  const tierNames = {
    free: 'Free',
    pro: 'Pro',
    premium: 'Premium',
  };

  const tierColors = {
    free: '#666',
    pro: '#6366f1',
    premium: '#8b5cf6',
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="current-plan">
      <div className="plan-header">
        <div className="plan-info">
          <span 
            className="plan-badge"
            style={{ background: tierColors[subscription?.tier] || tierColors.free }}
          >
            {tierNames[subscription?.tier] || 'Free'}
          </span>
          <h3>Current Plan</h3>
        </div>
        {subscription?.tier !== 'free' && (
          <button className="manage-btn" onClick={onManage}>
            Manage Subscription
          </button>
        )}
      </div>

      {subscription?.currentPeriodEnd && subscription?.tier !== 'free' && (
        <p className="renewal-date">
          {subscription?.status === 'cancelled' 
            ? `Access until ${formatDate(subscription.currentPeriodEnd)}`
            : `Renews on ${formatDate(subscription.currentPeriodEnd)}`
          }
        </p>
      )}

      {usage && (
        <div className="usage-section">
          <h4>This Period's Usage</h4>
          
          <div className="usage-items">
            <div className="usage-item">
              <div className="usage-label">
                <span>Profile Views Today</span>
                <span className="usage-count">
                  {usage.profileViews.unlimited 
                    ? '∞' 
                    : `${usage.profileViews.used} / ${usage.profileViews.limit}`
                  }
                </span>
              </div>
              {!usage.profileViews.unlimited && (
                <div className="usage-bar">
                  <div 
                    className="usage-fill"
                    style={{ 
                      width: `${Math.min((usage.profileViews.used / usage.profileViews.limit) * 100, 100)}%`,
                      background: usage.profileViews.used >= usage.profileViews.limit ? '#ef4444' : '#6366f1'
                    }}
                  />
                </div>
              )}
            </div>

            <div className="usage-item">
              <div className="usage-label">
                <span>Messages This Month</span>
                <span className="usage-count">
                  {usage.messages.unlimited 
                    ? '∞' 
                    : `${usage.messages.used} / ${usage.messages.limit}`
                  }
                </span>
              </div>
              {!usage.messages.unlimited && (
                <div className="usage-bar">
                  <div 
                    className="usage-fill"
                    style={{ 
                      width: `${Math.min((usage.messages.used / usage.messages.limit) * 100, 100)}%`,
                      background: usage.messages.used >= usage.messages.limit ? '#ef4444' : '#6366f1'
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {subscription?.tier === 'free' && (
        <div className="upgrade-prompt">
          <p>Upgrade to unlock unlimited access and premium features</p>
          <button className="upgrade-btn" onClick={onUpgrade}>
            View Plans
          </button>
        </div>
      )}
    </div>
  );
};

export default CurrentPlan;



