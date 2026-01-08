import { SignUp } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import './AuthPages.css';

const SignUpPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/" className="back-link">← Back to Home</Link>
        <SignUp 
          routing="path" 
          path="/sign-up" 
          signInUrl="/sign-in"
          afterSignUpUrl="/onboarding"
        />
      </div>
    </div>
  );
};

export default SignUpPage;



