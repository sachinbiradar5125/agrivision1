import React from 'react';
import { ViewState, Language, FarmerProfile } from '../types';
import { useOnlineStatus } from '../utils/pwa';

interface HeaderProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  profile: FarmerProfile;
  onToggleLanguage: () => void;
  onToggleTheme?: () => void;
  unreadAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  profile,
  onToggleLanguage,
  onToggleTheme,
  unreadAlertsCount,
}) => {
  const { isOnline } = useOnlineStatus();
  const isBackView = ['scan', 'analyzing', 'results', 'field-details', 'language', 'onboarding', 'login'].includes(currentView);

  const getTitle = () => {
    switch (currentView) {
      case 'scan':
        return 'Scan';
      case 'analyzing':
        return 'Analyzing Leaf';
      case 'results':
        return 'Scan Results';
      case 'field-details':
        return 'Field Details';
      case 'crops':
        return 'Crops';
      case 'assistant':
        return 'AgriAI Assistant';
      case 'profile':
        return 'Profile & Settings';
      case 'alerts':
        return 'Alerts';
      case 'language':
        return 'Choose Language';
      case 'onboarding':
        return 'Welcome';
      case 'login':
        return 'Phone Login';
      default:
        return 'AgriVision AI';
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 glass shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
      <div className="h-16 px-margin-mobile flex items-center justify-between">
        {/* Left Side: Back or Brand Logo */}
        <div className="flex items-center gap-3">
          {isBackView ? (
            <button
              onClick={() => {
                if (currentView === 'analyzing') onNavigate('scan');
                else if (currentView === 'results') onNavigate('home');
                else if (currentView === 'field-details') onNavigate('crops');
                else onNavigate('home');
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-on-surface/5 active:scale-95 transition-all text-primary"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
            </button>
          ) : (
            <div
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 cursor-pointer active:scale-98 transition-transform"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-secondary-fixed shadow-sm">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  eco
                </span>
              </div>
              <span className="font-title-md text-title-md text-primary tracking-tight">
                AgriVision <span className="text-secondary font-semibold">AI</span>
              </span>
            </div>
          )}

          {isBackView && (
            <h1 className="font-title-md text-title-md text-on-surface ml-1">{getTitle()}</h1>
          )}
        </div>

        {/* Right Side: Offline Badge, Alerts, Language Toggle & Profile Avatar */}
        <div className="flex items-center gap-2">
          {!isOnline && (
            <div
              className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-700 px-2.5 py-1 rounded-full animate-fade-in"
              title="PWA Offline Mode Active - Serving cached field data"
            >
              <span className="material-symbols-outlined text-[14px]">wifi_off</span>
              <span className="font-label-sm text-[10.5px] font-bold">Offline</span>
            </div>
          )}

          {/* Language Toggle Badge */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 bg-surface-container-high hover:bg-surface-container-highest rounded-full px-2.5 py-1.5 active:scale-95 transition-all"
            title="Change Language"
          >
            <span className={`font-label-sm text-[12px] ${profile.language === 'English' ? 'text-primary font-bold' : 'text-on-surface-variant opacity-60'}`}>
              EN
            </span>
            <span className="w-[2px] h-3 bg-outline-variant rounded-full"></span>
            <span className={`font-label-sm text-[12px] ${profile.language !== 'English' ? 'text-primary font-bold' : 'text-on-surface-variant opacity-60'}`}>
              {profile.language === 'Kannada' ? 'ಕ' : profile.language === 'Hindi' ? 'हि' : profile.language.slice(0, 2)}
            </span>
          </button>

          {/* Theme Toggle Button (Light/Dark Mode) */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface active:scale-95 transition-all border border-outline-variant/30 shadow-2xs"
              title={profile.darkMode ? 'Switch to Sunlight Outdoor Mode (Light)' : 'Switch to Dark Mode'}
              aria-label="Toggle Light and Dark Theme"
            >
              <span className={`material-symbols-outlined text-[20px] ${profile.darkMode ? 'text-amber-400' : 'text-primary'}`}>
                {profile.darkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          )}

          {/* Alerts Bell */}
          <button
            onClick={() => onNavigate('alerts')}
            className="relative w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant active:scale-95 transition-all"
            aria-label="Alerts"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-4 px-1 rounded-full bg-error text-on-error font-label-sm text-[10px] flex items-center justify-center font-bold shadow-sm">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Farmer Individual Profile Avatar */}
          <button
            onClick={() => onNavigate(profile.isLoggedIn ? 'profile' : 'login')}
            className="relative w-9 h-9 rounded-full overflow-hidden border border-outline-variant shadow-sm active:scale-95 transition-transform bg-primary/10 flex items-center justify-center text-primary"
            aria-label="Profile"
            title={profile.isLoggedIn ? `Profile (${profile.name})` : 'Sign In / Create Account'}
          >
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name || 'User Profile'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="material-symbols-outlined text-[20px]">person</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
