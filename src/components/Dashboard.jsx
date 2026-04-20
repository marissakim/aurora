import { useEffect, useState } from 'react';
import { Activity, Target, MapPin, DollarSign, ClipboardList } from 'lucide-react';
import { colors, gradients, fonts } from '../theme';
import EveLogo from './ui/EveLogo';
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

export default function Dashboard({ profile, biomarkers = [], onUpdateBiomarkers, initialDeepLink }) {
  const [activeTab, setActiveTab] = useState(initialDeepLink?.tab || 'overview');
  const [clinicsFilter, setClinicsFilter] = useState(initialDeepLink?.filter || null);
  // Tracks which pathway the user has committed to. Set when they complete
  // the donor-funded eligibility intake; personalizes My Plan accordingly.
  const [selectedPathway, setSelectedPathway] = useState(null);

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
      case 'markers': return <Biomarkers biomarkers={biomarkers} onUpdateBiomarkers={onUpdateBiomarkers} onNavigate={navigate} />;
      case 'pathways': return <Pathways profile={profile} onPathwaySelected={setSelectedPathway} />;
      case 'clinics': return <FindClinics profile={profile} initialFilter={clinicsFilter} />;
      case 'costs': return <Costs />;
      case 'plan': return <MyPlan profile={profile} selectedPathway={selectedPathway} onNavigate={navigate} />;
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
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: gradients.spice,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 14, fontWeight: 700,
          boxShadow: '0 2px 8px rgba(122, 66, 50, 0.2)',
        }}>
          {(profile.age || 'U')[0]}
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
