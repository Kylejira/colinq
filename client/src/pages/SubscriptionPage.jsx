import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DemoUserButton from '../components/auth/DemoUserButton';
import useSubscription from '../hooks/useSubscription';
import PricingCard from '../components/subscription/PricingCard';
import CurrentPlan from '../components/subscription/CurrentPlan';
import './SubscriptionPage.css';

const PRICING_TIERS = [
  {
    tier: 'free',
    name: 'Free',
    price: 0,
    features: [
      { text: '10 profile views per day', included: true },
      { text: '3 messages per month', included: true },
      { text: 'Basic contract templates', included: true },
      { text: 'Standard matching', included: true },
      { text: 'Advanced filters', included: false },
      { text: 'Analytics dashboard', included: false },
      { text: 'Verified badge', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: 25,
    highlighted: true,
    features: [
      { text: 'Unlimited profile views', included: true },
      { text: 'Unlimited messages', included: true },
      { text: 'All contract templates', included: true },
      { text: 'Priority matching', included: true },
      { text: 'Advanced filters', included: true },
      { text: 'Analytics dashboard', included: true },
      { text: 'Verified badge', included: true },
      { text: 'Priority support', included: false },
    ],
  },
  {
    tier: 'premium',
    name: 'Premium',
    price: 60,
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Revenue tracking', included: true },
      { text: 'Featured placement', included: true },
      { text: 'Priority support', included: true },
      { text: 'Early access to features', included: true },
      { text: 'Custom contract templates', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'API access', included: true },
    ],
  },
];

const SubscriptionPage = () => {
  const [searchParams] = useSearchParams();
  const { subscription, usage, loading, startCheckout, openPortal, refresh } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setNotification({ type: 'success', message: 'Subscription activated! Welcome to Pro.' });
      refresh();
    } else if (searchParams.get('canceled') === 'true') {
      setNotification({ type: 'info', message: 'Checkout canceled. No charges were made.' });
    }
  }, [searchParams, refresh]);

  const handleSelectTier = async (tier) => {
    if (tier === 'free' || tier === subscription?.tier) return;

    setCheckoutLoading(tier);
    try {
      await startCheckout(tier);
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
      setCheckoutLoading(null);
    }
  };

  const handleManage = async () => {
    try {
      await openPortal();
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="subscription-page">
      <header className="subscription-header">
        <Link to="/" className="logo">Colinq</Link>
        <nav className="subscription-nav">
          <Link to="/discover" className="nav-link">Discover</Link>
          <Link to="/matches" className="nav-link">Matches</Link>
          <Link to="/messages" className="nav-link">Messages</Link>
          <DemoUserButton afterSignOutUrl="/" />
        </nav>
      </header>

      <main className="subscription-main">
        {notification && (
          <div className={`notification ${notification.type}`}>
            <p>{notification.message}</p>
            <button onClick={() => setNotification(null)}>✕</button>
          </div>
        )}

        <section className="current-plan-section">
          <CurrentPlan 
            subscription={subscription}
            usage={usage}
            onManage={handleManage}
            onUpgrade={scrollToPricing}
          />
        </section>

        <section id="pricing" className="pricing-section">
          <div className="pricing-header">
            <h1>Choose Your Plan</h1>
            <p>Unlock more features and find your perfect collaboration partner</p>
          </div>

          {loading ? (
            <div className="pricing-loading">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <div className="pricing-grid">
              {PRICING_TIERS.map(tier => (
                <PricingCard
                  key={tier.tier}
                  {...tier}
                  current={subscription?.tier === tier.tier}
                  onSelect={handleSelectTier}
                  loading={checkoutLoading === tier.tier}
                />
              ))}
            </div>
          )}
        </section>

        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          
          <div className="faq-grid">
            <div className="faq-item">
              <h4>Can I cancel anytime?</h4>
              <p>Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
            </div>
            <div className="faq-item">
              <h4>What payment methods do you accept?</h4>
              <p>We accept all major credit cards through Stripe. Your payment information is securely processed.</p>
            </div>
            <div className="faq-item">
              <h4>Can I upgrade or downgrade?</h4>
              <p>Absolutely! You can change your plan at any time. Upgrades take effect immediately, and downgrades apply at the next billing cycle.</p>
            </div>
            <div className="faq-item">
              <h4>Is there a free trial?</h4>
              <p>Our Free tier lets you explore the platform with limited features. Upgrade when you're ready to unlock more.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SubscriptionPage;

