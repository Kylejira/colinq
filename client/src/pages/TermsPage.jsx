import { Link } from 'react-router-dom';
import './LegalPage.css';

const TermsPage = () => {
  return (
    <div className="legal-page">
      <header className="legal-header">
        <Link to="/" className="logo">Colinq</Link>
      </header>

      <main className="legal-content">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last updated: January 8, 2026</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Colinq ("the Service"), you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use the Service.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            Colinq is a platform that connects content creators for collaboration opportunities. 
            We provide tools to discover potential collaboration partners, communicate, and manage projects together.
          </p>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <p>
            To use certain features of the Service, you must create an account. You are responsible for:
          </p>
          <ul>
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Providing accurate and complete information</li>
            <li>Notifying us immediately of any unauthorized use</li>
          </ul>
        </section>

        <section>
          <h2>4. User Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any illegal purpose</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Post false, misleading, or fraudulent content</li>
            <li>Impersonate any person or entity</li>
            <li>Spam or send unsolicited messages</li>
            <li>Attempt to gain unauthorized access to the Service</li>
            <li>Use automated systems to access the Service without permission</li>
          </ul>
        </section>

        <section>
          <h2>5. Content</h2>
          <p>
            You retain ownership of content you post on Colinq. By posting content, you grant us a 
            non-exclusive, worldwide, royalty-free license to use, display, and distribute your content 
            in connection with the Service.
          </p>
          <p>
            You are solely responsible for the content you post and must have the rights to share it.
          </p>
        </section>

        <section>
          <h2>6. Collaborations</h2>
          <p>
            Colinq facilitates connections between creators but is not a party to any collaboration 
            agreements made between users. Users are responsible for negotiating and fulfilling their 
            own collaboration terms.
          </p>
        </section>

        <section>
          <h2>7. Intellectual Property</h2>
          <p>
            The Service and its original content (excluding user content) are owned by Colinq and 
            protected by copyright, trademark, and other laws.
          </p>
        </section>

        <section>
          <h2>8. Termination</h2>
          <p>
            We may terminate or suspend your account at any time for violations of these Terms. 
            You may also delete your account at any time through your account settings.
          </p>
        </section>

        <section>
          <h2>9. Disclaimers</h2>
          <p>
            The Service is provided "as is" without warranties of any kind. We do not guarantee 
            the accuracy of user profiles or the success of any collaborations.
          </p>
        </section>

        <section>
          <h2>10. Limitation of Liability</h2>
          <p>
            Colinq shall not be liable for any indirect, incidental, special, or consequential 
            damages arising from your use of the Service.
          </p>
        </section>

        <section>
          <h2>11. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify users of 
            significant changes via email or through the Service.
          </p>
        </section>

        <section>
          <h2>12. Contact</h2>
          <p>
            If you have questions about these Terms, please contact us at{' '}
            <a href="mailto:support@colinq.com">support@colinq.com</a>.
          </p>
        </section>
      </main>

      <footer className="legal-footer">
        <p>© {new Date().getFullYear()} Colinq. All rights reserved.</p>
        <nav>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
        </nav>
      </footer>
    </div>
  );
};

export default TermsPage;



