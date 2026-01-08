import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import ProfileForm from '../components/profile/ProfileForm';
import YouTubeConnect from '../components/profile/YouTubeConnect';
import VerificationUpload from '../components/profile/VerificationUpload';
import './OnboardingPage.css';

const STEPS = ['profile', 'youtube', 'verification'];

const OnboardingPage = () => {
  const { user, isLoaded, refreshUser } = useAuthContext();
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle YouTube OAuth callback
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    
    if (success === 'true') {
      refreshUser();
      setCurrentStep(2); // Move to verification step
    } else if (error) {
      console.error('OAuth error:', error);
    }
  }, [searchParams, refreshUser]);

  // Determine starting step based on profile completion
  useEffect(() => {
    if (isLoaded && user) {
      const hasProfile = user.display_name && user.bio;
      const hasYouTube = user.platforms?.some(p => p.platform_name === 'youtube');
      
      if (!hasProfile) {
        setCurrentStep(0);
      } else if (!hasYouTube) {
        setCurrentStep(1);
      } else {
        setCurrentStep(2);
      }
    }
  }, [isLoaded, user]);

  const handleStepComplete = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/discover');
    }
  };

  const renderStep = () => {
    switch (STEPS[currentStep]) {
      case 'profile':
        return <ProfileForm onComplete={handleStepComplete} />;
      case 'youtube':
        return <YouTubeConnect onConnected={handleStepComplete} />;
      case 'verification':
        return <VerificationUpload onComplete={handleStepComplete} />;
      default:
        return null;
    }
  };

  if (!isLoaded) {
    return (
      <div className="onboarding-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-header">
        <Link to="/" className="logo">Colinq</Link>
        <div className="progress-bar">
          {STEPS.map((step, index) => (
            <div 
              key={step}
              className={`progress-step ${index <= currentStep ? 'active' : ''}`}
            >
              <span className="step-dot">{index < currentStep ? '✓' : index + 1}</span>
              <span className="step-label">
                {step === 'profile' && 'Profile'}
                {step === 'youtube' && 'Connect'}
                {step === 'verification' && 'Verify'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="onboarding-content">
        {renderStep()}
      </div>
    </div>
  );
};

export default OnboardingPage;

