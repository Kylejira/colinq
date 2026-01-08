import { Link } from 'react-router-dom';
import './LegalPage.css';

const PrivacyPage = () => {
  return (
    <div className="legal-page">
      <header className="legal-header">
        <Link to="/" className="logo">Colinq</Link>
      </header>

      <main className="legal-content">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: January 8, 2026</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Colinq ("we," "our," or "us") respects your privacy. This Privacy Policy explains 
            how we collect, use, and protect your personal information when you use our service.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          
          <h3>Information You Provide</h3>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, profile photo</li>
            <li><strong>Profile Data:</strong> Bio, niche, collaboration preferences, social media handles</li>
            <li><strong>Social Media Data:</strong> When you connect YouTube, TikTok, or Instagram, we may access public profile information and follower counts</li>
            <li><strong>Communications:</strong> Messages sent through our platform</li>
          </ul>

          <h3>Information Collected Automatically</h3>
          <ul>
            <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the Service</li>
            <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
            <li><strong>Cookies:</strong> We use cookies for authentication and analytics</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide and improve the Service</li>
            <li>Match you with potential collaboration partners</li>
            <li>Enable communication between users</li>
            <li>Send important updates about your account</li>
            <li>Analyze usage patterns to improve features</li>
            <li>Prevent fraud and ensure platform security</li>
          </ul>
        </section>

        <section>
          <h2>4. Information Sharing</h2>
          <p>We do not sell your personal information. We may share information:</p>
          <ul>
            <li><strong>With Other Users:</strong> Your profile information is visible to other users on the platform</li>
            <li><strong>With Service Providers:</strong> Third parties that help us operate the Service (hosting, analytics, authentication)</li>
            <li><strong>For Legal Reasons:</strong> When required by law or to protect our rights</li>
          </ul>
        </section>

        <section>
          <h2>5. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li><strong>Clerk:</strong> Authentication and user management</li>
            <li><strong>Google/YouTube:</strong> OAuth login and channel data</li>
            <li><strong>Vercel:</strong> Website hosting</li>
            <li><strong>Railway:</strong> Backend hosting</li>
            <li><strong>Neon:</strong> Database hosting</li>
          </ul>
          <p>These services have their own privacy policies governing their use of your data.</p>
        </section>

        <section>
          <h2>6. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your information, including 
            encryption, secure servers, and access controls. However, no method of transmission 
            over the Internet is 100% secure.
          </p>
        </section>

        <section>
          <h2>7. Data Retention</h2>
          <p>
            We retain your information for as long as your account is active or as needed to 
            provide services. You can request deletion of your account and associated data at any time.
          </p>
        </section>

        <section>
          <h2>8. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and data</li>
            <li>Export your data</li>
            <li>Opt out of marketing communications</li>
          </ul>
        </section>

        <section>
          <h2>9. Children's Privacy</h2>
          <p>
            Colinq is not intended for users under 13 years of age. We do not knowingly collect 
            information from children under 13.
          </p>
        </section>

        <section>
          <h2>10. International Users</h2>
          <p>
            If you are accessing the Service from outside the United States, please be aware that 
            your information may be transferred to and processed in the United States.
          </p>
        </section>

        <section>
          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant 
            changes via email or through the Service.
          </p>
        </section>

        <section>
          <h2>12. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:privacy@colinq.com">privacy@colinq.com</a>.
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

export default PrivacyPage;



