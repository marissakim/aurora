import { useState } from 'react';
import { Sun, Activity, Target, MapPin, DollarSign, ClipboardList } from 'lucide-react';
import { colors, gradients } from '../theme';
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

export default function Dashboard({ profile }) {
  const [activeTab, setActiveTab] = useState('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <MyIndex profile={profile} onNavigate={setActiveTab} />;
      case 'markers': return <Biomarkers />;
      case 'pathways': return <Pathways profile={profile} />;
      case 'clinics': return <FindClinics profile={profile} />;
      case 'costs': return <Costs />;
      case 'plan': return <MyPlan />;
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: 'Arial, sans-serif' }}>
      {/* Top nav */}
      <div style={{
        background: '#fff',
        borderBottom: `1px solid ${colors.border}`,
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sun size={24} color={colors.gold} />
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: 1.5, color: colors.plum, textTransform: 'uppercase' }}>
            AURORA
          </span>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: gradients.purpleRose,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 14, fontWeight: 700,
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
              onClick={() => setActiveTab(tab.id)}
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
                fontFamily: 'Arial, sans-serif',
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
