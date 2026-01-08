import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const { isSignedIn, isLoaded } = useAuthContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="header-content">
          <Link to="/" className="logo">
            <span className="logo-icon">✦</span>
            <span className="logo-text">Colinq</span>
          </Link>
          
          <nav className="nav-desktop">
            <Link to="/discover" className="nav-link">Discover</Link>
          </nav>

          <div className="header-actions">
            {isLoaded && (
              isSignedIn ? (
                <Link to="/discover" className="btn btn-primary">Go to Dashboard</Link>
              ) : (
                <>
                  <Link to="/sign-in" className="btn btn-ghost">Log in</Link>
                  <Link to="/sign-up" className="btn btn-primary">Sign up</Link>
                </>
              )
            )}
          </div>

          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`nav-mobile ${mobileMenuOpen ? 'open' : ''}`}>
          <Link to="/discover" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Discover</Link>
          <div className="mobile-actions">
            {isLoaded && (
              isSignedIn ? (
                <Link to="/discover" className="btn btn-primary btn-block" onClick={() => setMobileMenuOpen(false)}>Go to Dashboard</Link>
              ) : (
                <>
                  <Link to="/sign-in" className="btn btn-secondary btn-block" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                  <Link to="/sign-up" className="btn btn-primary btn-block" onClick={() => setMobileMenuOpen(false)}>Sign up</Link>
                </>
              )
            )}
          </div>
        </div>
      </header>

      <main className="home-main">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              The creator collaboration platform
            </div>
            <h1 className="hero-title">
              A new way to<br />collaborate
            </h1>
            <p className="hero-subtitle">
              Discover, connect, and work with the world's best content creators. 
              Find your perfect collaboration partner.
            </p>
            
            <div className="hero-cta">
              <div className="search-box">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                <input 
                  type="text" 
                  placeholder="What type of creator are you looking for?"
                  className="search-input"
                />
                <Link to="/discover" className="btn btn-primary search-btn">
                  Browse Creators
                </Link>
              </div>
            </div>

            {/* Trending Categories */}
            <div className="trending-section">
              <span className="trending-label">TRENDING NICHES</span>
              <div className="trending-tags">
                <Link to="/discover?niche=tech" className="trending-tag">
                  <span className="tag-icon">#</span>
                  <span>Tech Reviews</span>
                  <span className="tag-arrow">→</span>
                </Link>
                <Link to="/discover?niche=lifestyle" className="trending-tag">
                  <span className="tag-icon">#</span>
                  <span>Lifestyle</span>
                  <span className="tag-arrow">→</span>
                </Link>
                <Link to="/discover?niche=gaming" className="trending-tag">
                  <span className="tag-icon">#</span>
                  <span>Gaming</span>
                  <span className="tag-arrow">→</span>
                </Link>
                <Link to="/discover?niche=fitness" className="trending-tag">
                  <span className="tag-icon">#</span>
                  <span>Fitness</span>
                  <span className="tag-arrow">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="hero-decoration">
            <div className="decoration-grid"></div>
          </div>
        </section>


        {/* How It Works Section */}
        <section className="how-section">
          <div className="how-content">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              Three simple steps to find your perfect collaboration partner
            </p>

            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">01</div>
                <h3>Create Your Profile</h3>
                <p>Connect your YouTube channel and let us pull your real stats. Build a profile that showcases your best work.</p>
              </div>
              <div className="step-card">
                <div className="step-number">02</div>
                <h3>Discover & Match</h3>
                <p>Browse creator profiles tailored to your niche. Swipe right on potential partners and start conversations.</p>
              </div>
              <div className="step-card">
                <div className="step-number">03</div>
                <h3>Collaborate</h3>
                <p>Grow your audience together. Cross-promote to new viewers and create content that neither of you could make alone.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="features-content">
            <div className="features-header">
              <h2 className="section-title">Everything you need</h2>
              <p className="section-subtitle">
                Built-in tools to make collaborations seamless
              </p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </div>
                <h4>Verified Creators</h4>
                <p>Video verification ensures you're connecting with real, active creators.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <h4>Real Analytics</h4>
                <p>YouTube integration pulls actual engagement rates—no inflated numbers.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <h4>Built-in Contracts</h4>
                <p>Professional collaboration agreements with e-signatures, built right in.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                </div>
                <h4>Direct Messaging</h4>
                <p>Connect directly with creators. No middlemen, no delays.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-content">
            <h2>Ready to find your next collaboration?</h2>
            <p>Join thousands of creators already finding their perfect partners.</p>
            <Link to="/sign-up" className="btn btn-primary btn-lg">
              Get started — it's free
            </Link>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-icon">✦</span>
            <span>Colinq</span>
          </div>
          <nav className="footer-links">
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </nav>
          <p className="footer-copy">© {new Date().getFullYear()} Colinq. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
