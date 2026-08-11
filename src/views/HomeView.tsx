import React from 'react';
import { ViewState, FarmerProfile, FertilizerTask, Crop } from '../types';
import { TRANSLATIONS } from '../data';
import { WeatherMap } from '../components/WeatherMap';

interface HomeViewProps {
  onNavigate: (view: ViewState, cropId?: string) => void;
  profile: FarmerProfile;
  onSelectLanguage: () => void;
  tasks?: FertilizerTask[];
  onToggleTask?: (taskId: string) => void;
  crops?: Crop[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  profile,
  onSelectLanguage,
  tasks = [],
  onToggleTask,
  crops = [],
}) => {
  const t = TRANSLATIONS[profile.language] || TRANSLATIONS.English;

  return (
    <div className="flex flex-col w-full gap-6 px-margin-mobile pt-4 pb-32 animate-fade-in max-w-container-max mx-auto">
      {/* Header Greeting Area */}
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            {t.today}
          </span>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
            {t.greeting}
          </h2>
        </div>

        {/* Quick Language Toggle Pill */}
        <button
          onClick={onSelectLanguage}
          className="flex items-center gap-2 bg-surface-container-high hover:bg-surface-container-highest rounded-full px-3.5 py-1.5 active:scale-95 transition-transform shadow-xs"
        >
          <span className="font-label-sm text-label-sm text-primary font-bold">
            {profile.language === 'Kannada' ? 'ಕನ್ನಡ' : profile.language}
          </span>
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
            expand_more
          </span>
        </button>
      </div>

      {/* Interactive Weather Map Component */}
      <WeatherMap crops={crops} onSelectCropField={(cropId) => onNavigate('field-details', cropId)} />

      {/* Contextual Crop Tip */}
      <div className="flex items-start gap-3 bg-surface-container rounded-2xl p-4 relative z-10 border border-outline-variant/30 shadow-2xs">
        <span className="material-symbols-outlined text-tertiary mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
          eco
        </span>
        <p className="font-body-md text-label-sm text-on-surface leading-relaxed">
          <strong className="font-title-md text-label-sm text-tertiary mr-1">{t.cropTipTitle}</strong>
          {t.cropTipText}
        </p>
      </div>

      {/* AI Scan Hero Card */}
      <div
        onClick={() => onNavigate('scan')}
        className="relative w-full h-[280px] rounded-[24px] overflow-hidden shadow-[0_12px_40px_rgba(0,69,50,0.12)] active:scale-[0.99] transition-all cursor-pointer group border border-primary/10"
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuC39_pE7NiFiggJVUQd4I23rU4CjGfeU5WiVDlNt9qApJ1KO0bYHw1-iJTkksy9F_JUrJNLl79c1bOHmXyCQAipAxfo3PlSMhjQ_pbbDQ44BqVeeGEWwH8Pp3RlbC33nz4F6t0vU86jybABKawXSMXy0CoUqJ8IUGJvTinjI72bFo1fa0DJiJzkSdwPNstz05qxCyHQQAhcSDO4PsXqdkvHd_NaSMSIOfY9MnRQEX-9a4-tmK33qWAt')`,
          }}
        />

        {/* Gradient overlays for depth & text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-transparent to-transparent"></div>

        {/* Animated Scanning Line */}
        <div className="absolute left-0 right-0 h-1 bg-secondary-fixed shadow-[0_0_15px_rgba(111,251,190,0.9)] z-10 animate-scan-motion"></div>

        {/* Hero Card Content */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end z-20">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-secondary-fixed text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              psychiatry
            </span>
            <span className="font-label-sm text-label-sm text-secondary-fixed tracking-wider uppercase font-semibold">
              AI Diagnostics
            </span>
          </div>
          <h3 className="font-title-md text-headline-lg-mobile text-on-primary mb-1">
            {t.isCropHealthy}
          </h3>
          <p className="font-body-md text-body-md text-primary-fixed mb-4 line-clamp-1 opacity-90">
            {t.takePhotoSub}
          </p>
          <button className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-on-secondary py-3.5 px-6 rounded-full font-title-md text-title-md w-full sm:w-auto shadow-lg shadow-secondary/20 active:scale-95 transition-all">
            <span className="material-symbols-outlined">photo_camera</span>
            {t.scanCropNow}
          </button>
        </div>
      </div>

      {/* Stage Fertilizer Application Reminders Card */}
      <div className="bg-surface-container-lowest rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30 flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[18px]">water_drop</span>
            </div>
            <h3 className="font-title-md text-[15.5px] font-bold text-on-surface">
              Stage Fertilizer Schedule
            </h3>
          </div>
          <button
            onClick={() => onNavigate('field-details')}
            className="font-label-sm text-[12px] font-bold text-primary hover:underline flex items-center gap-0.5"
          >
            Manage <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        {tasks.filter((t) => !t.completed).length === 0 ? (
          <div className="p-3 bg-surface-container-low rounded-xl text-center text-on-surface-variant font-body-md text-[12px]">
            All field fertilizer applications are up to date! 🎉
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tasks
              .filter((t) => !t.completed)
              .slice(0, 3)
              .map((task) => (
                <div
                  key={task.id}
                  className="bg-surface-container-low p-3 rounded-2xl border border-outline-variant/20 flex items-center justify-between gap-3 hover:border-outline-variant/40 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => onToggleTask && onToggleTask(task.id)}
                      className="w-5 h-5 rounded-md border-2 border-outline hover:border-primary shrink-0 flex items-center justify-center text-transparent hover:text-primary transition-all"
                    >
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-title-md text-[13px] font-bold text-on-surface truncate">
                          {task.fertilizerName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-[10px] font-bold shrink-0">
                          {task.cropName}
                        </span>
                      </div>
                      <span className="font-body-md text-[11px] text-on-surface-variant block truncate">
                        {task.growthStage} stage • {task.dosage} via {task.applicationMethod}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-1 rounded-full bg-tertiary-container/30 text-tertiary font-label-sm text-[10.5px] font-bold shrink-0">
                    {task.dueDate}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4 pb-4">
        {/* Action 1: Scan Disease */}
        <button
          onClick={() => onNavigate('scan')}
          className="flex flex-col items-center justify-center gap-3 p-5 bg-surface-container-lowest rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/20 active:scale-95 transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-center w-14 h-14 bg-error-container text-on-error-container rounded-full mb-1 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              coronavirus
            </span>
          </div>
          <span className="font-title-md text-label-sm text-on-surface font-semibold">{t.scanDisease}</span>
        </button>

        {/* Action 2: My Crops */}
        <button
          onClick={() => onNavigate('crops')}
          className="flex flex-col items-center justify-center gap-3 p-5 bg-surface-container-lowest rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/20 active:scale-95 transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-center w-14 h-14 bg-secondary-container text-on-secondary-container rounded-full mb-1 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              potted_plant
            </span>
          </div>
          <span className="font-title-md text-label-sm text-on-surface font-semibold">{t.myCrops}</span>
        </button>

        {/* Action 3: Ask AI */}
        <button
          onClick={() => onNavigate('assistant')}
          className="flex flex-col items-center justify-center gap-3 p-5 bg-surface-container-lowest rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/20 active:scale-95 transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-center w-14 h-14 bg-inverse-primary text-on-primary-fixed rounded-full mb-1 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              smart_toy
            </span>
          </div>
          <span className="font-title-md text-label-sm text-on-surface font-semibold">{t.askAi}</span>
        </button>

        {/* Action 4: Crop Health */}
        <button
          onClick={() => onNavigate('field-details')}
          className="flex flex-col items-center justify-center gap-3 p-5 bg-surface-container-lowest rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/20 active:scale-95 transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-center w-14 h-14 bg-tertiary-container text-on-tertiary-container rounded-full mb-1 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              monitor_heart
            </span>
          </div>
          <span className="font-title-md text-label-sm text-on-surface font-semibold">{t.cropHealth}</span>
        </button>
      </div>
    </div>
  );
};
