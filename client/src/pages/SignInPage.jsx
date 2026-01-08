import { SignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import './AuthPages.css';

const SignInPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/" className="back-link">← Back to Home</Link>
        <SignIn 
          routing="path" 
          path="/sign-in" 
          signUpUrl="/sign-up"
          afterSignInUrl="/onboarding"
        />
      </div>
    </div>
  );
};

export default SignInPage;



