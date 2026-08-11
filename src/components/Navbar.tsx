import React from 'react';
import { ViewState } from '../types';

interface NavbarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  // Hide bottom navbar on full-bleed camera scan or onboarding
  if (currentView === 'scan' || currentView === 'onboarding') {
    return null;
  }

  const isHome = currentView === 'home';
  const isCrops = currentView === 'crops' || currentView === 'field-details';
  const isAssistant = currentView === 'assistant';
  const isProfile = currentView === 'profile' || currentView === 'language';

  return (
    <nav className="fixed bottom-4 inset-x-margin-mobile max-w-md mx-auto z-50 pb-safe">
      <div className="bg-surface/90 backdrop-blur-xl rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/40 px-4 flex justify-between items-center h-20 relative">
        {/* Home */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-2xl transition-all duration-300 ${
            isHome
              ? 'text-secondary font-bold bg-secondary-container/40 scale-105 shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">home</span>
          <span className="font-label-sm text-[10px]">Home</span>
        </button>

        {/* Crops */}
        <button
          onClick={() => onNavigate('crops')}
          className={`flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-2xl transition-all duration-300 ${
            isCrops
              ? 'text-secondary font-bold bg-secondary-container/40 scale-105 shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">potted_plant</span>
          <span className="font-label-sm text-[10px]">Crops</span>
        </button>

        {/* Center Camera Scan FAB */}
        <div className="-mt-10 flex justify-center">
          <button
            onClick={() => onNavigate('scan')}
            className="w-16 h-16 rounded-full bg-primary hover:bg-primary-container text-on-primary shadow-lg shadow-primary/30 flex items-center justify-center transition-all duration-300 active:scale-90 group"
            aria-label="Scan Crop"
          >
            <span className="material-symbols-outlined text-[32px] group-hover:rotate-12 transition-transform">
              photo_camera
            </span>
          </button>
        </div>

        {/* AI Assistant */}
        <button
          onClick={() => onNavigate('assistant')}
          className={`flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-2xl transition-all duration-300 ${
            isAssistant
              ? 'text-secondary font-bold bg-secondary-container/40 scale-105 shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">smart_toy</span>
          <span className="font-label-sm text-[10px]">AI</span>
        </button>

        {/* Me / Profile */}
        <button
          onClick={() => onNavigate('profile')}
          className={`flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-2xl transition-all duration-300 ${
            isProfile
              ? 'text-secondary font-bold bg-secondary-container/40 scale-105 shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">person</span>
          <span className="font-label-sm text-[10px]">Me</span>
        </button>
      </div>
    </nav>
  );
};
