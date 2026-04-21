import { useState } from 'react';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import BiomarkerIntake from './components/BiomarkerIntake';
import Dashboard from './components/Dashboard';
import { useLocalStorage, clearAllEveStorage } from './hooks/useLocalStorage';

// Derive the starting view from what's already persisted. A returning user
// with a completed profile should land on the dashboard, not start over.
function getInitialView() {
  if (typeof window === 'undefined') return 'landing';
  try {
    const stored = window.localStorage.getItem('eve:profile');
    if (!stored) return 'landing';
    const parsed = JSON.parse(stored);
    if (parsed && Object.keys(parsed).length > 0) return 'dashboard';
  } catch {
    /* fall through */
  }
  return 'landing';
}

export default function App() {
  // landing → onboarding → biomarkers → dashboard
  const [view, setView] = useState(getInitialView);
  const [profile, setProfile] = useLocalStorage('eve:profile', {});
  const [biomarkers, setBiomarkers] = useLocalStorage('eve:biomarkers', []);
  // When a user came in via "Browse virtual testing" from intake, deep-link
  // them straight to the Virtual Care filter on the dashboard.
  const [deepLinkClinicsToVirtualCare, setDeepLinkClinicsToVirtualCare] = useState(false);

  function handleGetStarted() {
    setView('onboarding');
  }

  function handleOnboardingComplete(answers) {
    setProfile(answers);
    setView('biomarkers');
  }

  function handleBiomarkerIntakeComplete(entered) {
    setBiomarkers(entered);
    setView('dashboard');
  }

  function handleGetTestedFromIntake() {
    setBiomarkers([]); // explicitly empty
    setDeepLinkClinicsToVirtualCare(true);
    setView('dashboard');
  }

  // Wipe every persisted Eve key and reload the page. Reloading avoids
  // any staleness from useLocalStorage's re-syncing of in-flight setState
  // calls and guarantees a clean slate for the next user.
  function handleStartOver() {
    clearAllEveStorage();
    window.location.reload();
  }

  switch (view) {
    case 'landing':
      return <LandingPage onGetStarted={handleGetStarted} />;
    case 'onboarding':
      return <Onboarding onComplete={handleOnboardingComplete} />;
    case 'biomarkers':
      return (
        <BiomarkerIntake
          profile={profile}
          onComplete={handleBiomarkerIntakeComplete}
          onGetTested={handleGetTestedFromIntake}
        />
      );
    case 'dashboard':
      return (
        <Dashboard
          profile={profile}
          biomarkers={biomarkers}
          onUpdateBiomarkers={setBiomarkers}
          onStartOver={handleStartOver}
          initialDeepLink={deepLinkClinicsToVirtualCare ? { tab: 'clinics', filter: 'Virtual Care' } : null}
        />
      );
    default:
      return null;
  }
}
