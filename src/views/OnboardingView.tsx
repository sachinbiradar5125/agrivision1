import React from 'react';
import { ViewState, Language, FarmerProfile } from '../types';

interface OnboardingViewProps {
  onNavigate: (view: ViewState) => void;
  profile: FarmerProfile;
  onUpdateProfile: (updates: Partial<FarmerProfile>) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  onNavigate,
  profile,
  onUpdateProfile,
}) => {
  const languages: Language[] = ['English', 'Kannada', 'Hindi', 'Telugu', 'Tamil', 'Marathi'];

  return (
    <div className="flex flex-col w-full min-h-screen bg-background relative overflow-hidden px-margin-mobile pt-10 pb-12 max-w-md mx-auto justify-between animate-fade-in">
      {/* Top Graphic Background */}
      <div className="absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent pointer-events-none"></div>

      {/* Brand Hero Heading */}
      <div className="relative z-10 flex flex-col items-center text-center mt-6">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-secondary-fixed shadow-xl mb-4">
          <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            eco
          </span>
        </div>
        <h1 className="font-display-lg text-headline-lg font-bold text-on-surface">
          AgriVision <span className="text-secondary font-semibold">AI</span>
        </h1>
        <p className="font-body-md text-on-surface-variant text-[15px] max-w-xs mt-2 leading-relaxed">
          Smart AI crop diagnosis, pest alerts, and digital agronomy in your native language.
        </p>
      </div>

      {/* Language Selection Grid */}
      <div className="relative z-10 bg-surface-container-lowest rounded-[28px] p-6 shadow-xl border border-outline-variant/30 my-8">
        <h3 className="font-title-md text-on-surface font-semibold text-[17px] mb-1 text-center">
          Select Preferred Language
        </h3>
        <p className="font-body-md text-on-surface-variant text-[13px] text-center mb-5">
          Get AI disease advice in your regional dialect.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {languages.map((lang) => {
            const isSelected = profile.language === lang;
            return (
              <button
                key={lang}
                onClick={() => onUpdateProfile({ language: lang })}
                className={`py-3.5 px-4 rounded-2xl font-title-md text-[15px] flex items-center justify-between border transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-primary text-on-primary border-primary shadow-md font-bold'
                    : 'bg-surface-container-low text-on-surface border-outline-variant/30 hover:bg-surface-container'
                }`}
              >
                <span>{lang}</span>
                {isSelected && (
                  <span className="material-symbols-outlined text-[20px] text-secondary-fixed">
                    check_circle
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Get Started & Login Buttons */}
      <div className="relative z-10 flex flex-col gap-2.5">
        <button
          onClick={() => onNavigate('home')}
          className="w-full bg-primary hover:bg-primary-container text-on-primary font-title-md py-4 rounded-full shadow-lg shadow-primary/25 active:scale-98 transition-all flex items-center justify-center gap-2 text-[17px] font-bold"
        >
          <span>Get Started</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>

        <button
          onClick={() => onNavigate('login')}
          className="w-full bg-surface-container-low hover:bg-surface-container text-on-surface font-title-md py-3 rounded-full border border-outline-variant/40 active:scale-98 transition-all flex items-center justify-center gap-2 text-[15px] font-semibold"
        >
          <span className="material-symbols-outlined text-[20px] text-primary">phone_iphone</span>
          <span>Sign In with Phone Number</span>
        </button>
      </div>
    </div>
  );
};
