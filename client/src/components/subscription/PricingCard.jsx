import './PricingCard.css';

const PricingCard = ({ 
  tier, 
  name, 
  price, 
  period = '/month',
  features, 
  highlighted,
  current,
  onSelect,
  loading 
}) => {
  return (
    <div className={`pricing-card ${highlighted ? 'highlighted' : ''} ${current ? 'current' : ''}`}>
      {highlighted && <div className="popular-badge">Most Popular</div>}
      {current && <div className="current-badge">Current Plan</div>}
      
      <div className="card-header">
        <h3>{name}</h3>
        <div className="price">
          {price === 0 ? (
            <span className="amount">Free</span>
          ) : (
            <>
              <span className="currency">$</span>
              <span className="amount">{price}</span>
              <span className="period">{period}</span>
            </>
          )}
        </div>
      </div>

      <ul className="features-list">
        {features.map((feature, index) => (
          <li key={index} className={feature.included ? 'included' : 'excluded'}>
            <span className="feature-icon">{feature.included ? '✓' : '—'}</span>
            <span className="feature-text">{feature.text}</span>
          </li>
        ))}
      </ul>

      <button 
        className={`select-btn ${current ? 'current' : ''}`}
        onClick={() => onSelect(tier)}
        disabled={loading || current}
      >
        {loading ? 'Loading...' : current ? 'Current Plan' : price === 0 ? 'Get Started' : 'Upgrade Now'}
      </button>
    </div>
  );
};

export default PricingCard;



