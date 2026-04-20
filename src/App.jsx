import { useState } from 'react';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import BiomarkerIntake from './components/BiomarkerIntake';
import Dashboard from './components/Dashboard';

export default function App() {
  // landing → onboarding → biomarkers → dashboard
  const [view, setView] = useState('landing');
  const [profile, setProfile] = useState({});
  const [biomarkers, setBiomarkers] = useState([]); // empty until user enters or imports
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
          initialDeepLink={deepLinkClinicsToVirtualCare ? { tab: 'clinics', filter: 'Virtual Care' } : null}
        />
      );
    default:
      return null;
  }
}
