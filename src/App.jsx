import { useState } from 'react';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';

export default function App() {
  const [view, setView] = useState('landing');
  const [profile, setProfile] = useState({});

  function handleGetStarted() {
    setView('onboarding');
  }

  function handleOnboardingComplete(answers) {
    setProfile(answers);
    setView('dashboard');
  }

  switch (view) {
    case 'landing':
      return <LandingPage onGetStarted={handleGetStarted} />;
    case 'onboarding':
      return <Onboarding onComplete={handleOnboardingComplete} />;
    case 'dashboard':
      return <Dashboard profile={profile} />;
    default:
      return null;
  }
}
