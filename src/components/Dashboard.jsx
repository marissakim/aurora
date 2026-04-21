import { useEffect, useRef, useState } from 'react';
import { Activity, Target, MapPin, DollarSign, ClipboardList, LogOut } from 'lucide-react';
import { colors, gradients, fonts } from '../theme';
import EveLogo from './ui/EveLogo';
import { useLocalStorage } from '../hooks/useLocalStorage';
import MyIndex from './tabs/MyIndex';
import Biomarkers from './tabs/Biomarkers';
import Pathways from './tabs/Pathways';
import FindClinics from './tabs/FindClinics';
import Costs from './tabs/Costs';
import MyPlan from './tabs/MyPlan';

const tabs = [
  { id: 'overview', label: 'My Index', icon: Activity },
  { id: 'markers', label: 'Biomarkers', icon: Target },
  { id: 'pathways', label: 'Pathways', icon: Target },
  { id: 'clinics', label: 'Find Clinics', icon: MapPin },
  { id: 'costs', label: 'Costs', icon: DollarSign },
  { id: 'plan', label: 'My Plan', icon: ClipboardList },
];

export default function Dashboard({ profile, biomarkers = [], onUpdateBiomarkers, orderedKit, onKitOrdered, onStartOver, initialDeepLink }) {
  const [activeTab, setActiveTab] = useState(initialDeepLink?.tab || 'overview');
  const [clinicsFilter, setClinicsFilter] = useState(initialDeepLink?.filter || null);
  // Tracks which pathway the user has committed to. Persisted so refreshing
  // the tab doesn't un-commit them from a donor program they already opted into.
  const [selectedPathway, setSelectedPathway] = useLocalStorage('eve:selectedPathway', null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close the avatar menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [showMenu]);

  function handleStartOverClick() {
    const confirmed = window.confirm(
      'Start over? This clears your profile, biomarkers, and plan progress.',
    );
    if (confirmed) {
      onStartOver?.();
    }
    setShowMenu(false);
  }

  // Honor deep-link prop on mount (e.g., from BiomarkerIntake "Browse virtual testing")
  useEffect(() => {
    if (initialDeepLink?.tab) setActiveTab(initialDeepLink.tab);
    if (initialDeepLink?.filter) setClinicsFilter(initialDeepLink.filter);
    // Intentionally only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Navigate to a tab, optionally with a pre-selected filter (e.g., deep-link
  // from the My Index "Start Here" card to Find Clinics > Virtual Care)
  const navigate = (tab, opts = {}) => {
    setActiveTab(tab);
    if (tab === 'clinics' && opts.filter) setClinicsFilter(opts.filter);
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <MyIndex profile={profile} biomarkers={biomarkers} onNavigate={navigate} />;
      case 'markers': return <Biomarkers profile={profile} biomarkers={biomarkers} onUpdateBiomarkers={onUpdateBiomarkers} onKitOrdered={onKitOrdered} onNavigate={navigate} />;
      case 'pathways': return <Pathways profile={profile} onPathwaySelected={setSelectedPathway} onNavigate={navigate} />;
      case 'clinics': return <FindClinics profile={profile} initialFilter={clinicsFilter} />;
      case 'costs': return <Costs />;
      case 'plan': return <MyPlan profile={profile} biomarkers={biomarkers} selectedPathway={selectedPathway} orderedKit={orderedKit} onNavigate={navigate} />;
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: fonts.family }}>
      {/* Top nav */}
      <div style={{
        background: '#fff',
        borderBottom: `1px solid ${colors.border}`,
        padding: '14px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ color: colors.sage, lineHeight: 0 }}>
            <EveLogo size={22} strokeWidth={1.75} />
          </div>
          <span style={{
            fontSize: 22,
            fontFamily: fonts.serif,
            fontWeight: 400,
            letterSpacing: -0.3,
            color: colors.plum,
          }}>
            Eve
          </span>
        </div>
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(s => !s)}
            aria-label="Account menu"
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: gradients.spice,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 14, fontWeight: 700,
              boxShadow: '0 2px 8px rgba(122, 66, 50, 0.2)',
              border: 'none', cursor: 'pointer', padding: 0,
              fontFamily: fonts.family,
            }}
          >
            {(profile.age || 'U')[0]}
          </button>
          {showMenu && (
            <div style={{
              position: 'absolute', top: 44, right: 0,
              background: '#fff',
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              minWidth: 180,
              overflow: 'hidden',
              zIndex: 200,
            }}>
              <button
                onClick={handleStartOverClick}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px',
                  background: 'none', border: 'none',
                  cursor: 'pointer',
                  fontSize: 14, color: colors.text,
                  fontFamily: fonts.family,
                  textAlign: 'left',
                }}
                onMouseEnter={e => e.currentTarget.style.background = colors.bg}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={15} color={colors.textLight} />
                Start over
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        background: '#fff',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        overflowX: 'auto',
        padding: '0 16px',
        position: 'sticky',
        top: 61,
        zIndex: 99,
      }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setClinicsFilter(null); }}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${isActive ? colors.plum : 'transparent'}`,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                color: isActive ? colors.plum : colors.textLight,
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
                fontFamily: fonts.family,
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px' }}>
        {renderTab()}
      </div>
    </div>
  );
}
