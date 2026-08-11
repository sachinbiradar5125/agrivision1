import React from 'react';
import { ViewState, Language, FarmerProfile } from '../types';
import { TRANSLATIONS } from '../data';

interface LanguageViewProps {
  onNavigate: (view: ViewState) => void;
  profile: FarmerProfile;
  onUpdateProfile: (updates: Partial<FarmerProfile>) => void;
}

export const LanguageView: React.FC<LanguageViewProps> = ({
  onNavigate,
  profile,
  onUpdateProfile,
}) => {
  const languages: { name: Language; label: string; flag: string }[] = [
    { name: 'English', label: 'English', flag: '🇬🇧' },
    { name: 'Kannada', label: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
    { name: 'Hindi', label: 'हिंदी (Hindi)', flag: '🇮🇳' },
    { name: 'Telugu', label: 'తెలుగు (Telugu)', flag: '🇮🇳' },
    { name: 'Tamil', label: 'தமிழ் (Tamil)', flag: '🇮🇳' },
    { name: 'Marathi', label: 'मराठी (Marathi)', flag: '🇮🇳' },
  ];

  const t = TRANSLATIONS[profile.language] || TRANSLATIONS.English;

  return (
    <div className="flex flex-col w-full px-margin-mobile pt-4 pb-32 gap-6 relative max-w-md mx-auto animate-fade-in">
      <div>
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">
          {t.chooseLanguage}
        </h2>
        <p className="font-body-md text-on-surface-variant text-[14px] mt-1">
          {t.languageSub}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {languages.map((item) => {
          const isSelected = profile.language === item.name;
          return (
            <div
              key={item.name}
              onClick={() => onUpdateProfile({ language: item.name })}
              className={`p-4 rounded-[22px] flex items-center justify-between cursor-pointer border transition-all active:scale-[0.98] ${
                isSelected
                  ? 'bg-primary-container/20 border-primary shadow-xs'
                  : 'bg-surface-container-low hover:bg-surface-container border-outline-variant/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.flag}</span>
                <span className="font-title-md text-on-surface font-semibold text-[16px]">
                  {item.label}
                </span>
              </div>

              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isSelected
                    ? 'bg-primary text-on-primary'
                    : 'border-2 border-outline-variant'
                }`}
              >
                {isSelected && (
                  <span className="material-symbols-outlined text-[16px]">check</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => onNavigate('home')}
        className="w-full bg-primary hover:bg-primary-container text-on-primary font-title-md py-4 rounded-full shadow-md active:scale-98 transition-all mt-4 text-[16px] font-semibold"
      >
        {t.continue}
      </button>
    </div>
  );
};
