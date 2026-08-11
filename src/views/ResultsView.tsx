import React, { useState } from 'react';
import { ViewState, DiagnosticResult } from '../types';

interface ResultsViewProps {
  onNavigate: (view: ViewState) => void;
  result: DiagnosticResult;
  onAskAssistant: (prompt: string) => void;
  onSaveToLog: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  onNavigate,
  result,
  onAskAssistant,
  onSaveToLog,
}) => {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    onSaveToLog();
  };

  const handleAsk = () => {
    onAskAssistant(`How do I treat ${result.disease} on my ${result.cropName}?`);
    onNavigate('assistant');
  };

  return (
    <div className="flex flex-col w-full px-margin-mobile py-4 gap-6 relative max-w-md mx-auto animate-fade-in pb-32">
      {/* Top Title & Diagnosis Status Tag */}
      <div className="flex flex-col gap-1 items-center justify-center pt-2">
        <div className="bg-surface-container px-3.5 py-1 rounded-full flex items-center gap-2 shadow-xs mb-1 border border-outline-variant/30">
          <span className="material-symbols-outlined text-primary text-[16px]">psychology</span>
          <span className="font-label-sm text-primary font-bold text-[11px] tracking-wide uppercase">
            AI DIAGNOSIS COMPLETE
          </span>
        </div>
        <h2 className="font-headline-lg-mobile text-on-surface text-center font-bold">
          {result.identifiedCrop || result.cropName}
        </h2>
        {result.identifiedCrop && (
          <div className="text-[12px] font-semibold text-secondary flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[14px]">psychology</span>
            Identified by AI
          </div>
        )}
        <p className="text-body-md text-on-surface-variant text-center text-[13px]">
          Scan completed at {result.scanTime}
        </p>
      </div>

      {/* Main Glassmorphic Result Card */}
      <div className="relative bg-surface-container-lowest rounded-[28px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-outline-variant/30 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-error-container/30 via-transparent to-surface-container-low opacity-70 pointer-events-none"></div>

        {/* Accent Red Line for disease detected */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-error rounded-l-[28px]"></div>

        <div className="relative p-6 flex flex-col items-center gap-5">
          {/* Disease Title */}
          <div className="text-center">
            <p className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[11px] mb-1 font-semibold">
              Possible Disease Detected
            </p>
            <h3 className="font-headline-lg-mobile text-error font-bold text-[26px]">
              {result.disease}
            </h3>
            <p className="text-body-sm text-on-surface-variant italic mt-0.5 text-[14px]">
              ({result.scientificName})
            </p>
          </div>

          {/* Circular Confidence Gauge */}
          <div className="relative w-40 h-40 flex items-center justify-center my-1">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Track */}
              <circle
                className="text-surface-container-high"
                cx="50"
                cy="50"
                fill="none"
                r="44"
                stroke="currentColor"
                strokeWidth="8"
              />
              {/* Progress */}
              <circle
                className="text-error drop-shadow-[0_2px_8px_rgba(186,26,26,0.3)] transition-all duration-1000 ease-out"
                cx="50"
                cy="50"
                fill="none"
                r="44"
                stroke="currentColor"
                strokeDasharray="276.4"
                strokeDashoffset={276.4 - (276.4 * result.confidence) / 100}
                strokeLinecap="round"
                strokeWidth="8"
              />
            </svg>

            {/* Gauge Inner Info */}
            <div className="flex flex-col items-center justify-center bg-surface w-[112px] h-[110px] rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.06)] z-10 border border-outline-variant/20">
              <span className="font-display-lg text-on-surface leading-none text-[38px]">
                {result.confidence}<span className="text-title-md font-bold text-[20px]">%</span>
              </span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">
                Confidence
              </span>
            </div>
          </div>

          {/* Severity Level Pill */}
          <div className="flex items-center gap-3 bg-surface-container-high/80 rounded-2xl px-4 py-3 w-full border border-outline-variant/20">
            <div className="w-10 h-10 rounded-full bg-[#fde047]/25 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#ca8a04]" style={{ fontVariationSettings: "'FILL' 1" }}>
                warning
              </span>
            </div>
            <div className="flex flex-col flex-1">
              <span className="font-label-sm text-on-surface-variant uppercase text-[10px] font-bold">
                Severity Level
              </span>
              <span className="font-title-md text-[#ca8a04] font-semibold text-[16px]">
                {result.severity}
              </span>
            </div>

            {/* Visual Scale */}
            <div className="flex gap-1.5 h-3">
              <div className="w-3.5 bg-primary rounded-full"></div>
              <div className="w-3.5 bg-[#fde047] rounded-full animate-pulse shadow-[0_0_8px_rgba(253,224,71,0.6)]"></div>
              <div className="w-3.5 bg-surface-container-highest rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Symptoms Analysis Bento Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Scanned Image Preview */}
        <div className="col-span-1 rounded-[22px] overflow-hidden shadow-xs relative h-36 border border-outline-variant/30">
          <div
            className="bg-cover bg-center w-full h-full"
            style={{ backgroundImage: `url('${result.image}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-white text-[14px]">center_focus_strong</span>
            <span className="text-[11px] text-white font-medium">Scanned Image</span>
          </div>
        </div>

        {/* Health / Vitality Score */}
        <div className="col-span-1 bg-primary-container rounded-[22px] p-4 flex flex-col justify-between shadow-xs relative overflow-hidden text-on-primary-container">
          <div className="absolute -right-3 -top-3 opacity-15 pointer-events-none">
            <span className="material-symbols-outlined text-[88px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              eco
            </span>
          </div>
          <div>
            <span className="font-label-sm text-on-primary-container/80 uppercase text-[10px] tracking-wider font-bold">
              Plant Vitality
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-headline-lg-mobile text-on-primary-container font-bold text-[28px]">
                {result.plantVitality}
              </span>
              <span className="text-body-sm text-on-primary-container/70 font-medium">/100</span>
            </div>
          </div>
          <div className="w-full bg-on-primary-container/20 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-on-primary-container h-full rounded-full transition-all duration-700"
              style={{ width: `${result.plantVitality}%` }}
            ></div>
          </div>
        </div>

        {/* Symptoms List */}
        <div className="col-span-2 bg-surface-container-low rounded-[22px] p-5 shadow-xs border border-outline-variant/20">
          <h4 className="font-title-md text-on-surface text-[16px] mb-3 flex items-center gap-2 font-semibold">
            <span className="material-symbols-outlined text-primary text-[20px]">troubleshoot</span>
            Detected Symptoms
          </h4>
          <ul className="flex flex-col gap-3">
            {result.symptoms.map((symptom, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div
                  className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    symptom.type === 'error'
                      ? 'bg-error-container'
                      : symptom.type === 'warning'
                      ? 'bg-[#fef08a]'
                      : 'bg-primary-container'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      symptom.type === 'error'
                        ? 'bg-error'
                        : symptom.type === 'warning'
                        ? 'bg-[#ca8a04]'
                        : 'bg-primary'
                    }`}
                  ></div>
                </div>
                <div>
                  <span className="font-title-md text-on-surface text-[14px] font-semibold block leading-tight">
                    {symptom.title}
                  </span>
                  <span className="text-[13px] text-on-surface-variant leading-snug block mt-0.5">
                    {symptom.description}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Immediate Action Plan */}
      <div className="bg-surface-container-lowest rounded-[24px] shadow-xs border border-outline-variant/30 p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
        <h4 className="font-title-md text-on-surface text-[17px] mb-4 flex items-center gap-2 font-semibold">
          <span className="material-symbols-outlined text-primary">healing</span>
          Immediate Action Plan
        </h4>

        <div className="flex flex-col gap-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container-high">
          {result.actionPlan.map((action) => (
            <div key={action.step} className="flex gap-3.5 relative z-10 items-start">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-xs font-bold text-xs ${
                  action.step === 1
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-high text-on-surface border border-outline-variant/40'
                }`}
              >
                {action.step}
              </div>
              <div className="pt-0.5">
                <span className="font-title-md text-on-surface text-[15px] font-semibold block mb-0.5">
                  {action.title}
                </span>
                <p className="text-[13px] text-on-surface-variant leading-relaxed">
                  {action.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-3 mt-1">
        <button
          onClick={handleAsk}
          className="w-full bg-primary hover:bg-primary-container text-on-primary font-title-md py-4 rounded-full shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-[16px] font-semibold"
        >
          <span className="material-symbols-outlined">forum</span>
          Ask AgriAI Assistant
        </button>

        <button
          onClick={handleSave}
          disabled={saved}
          className={`w-full py-4 rounded-full font-title-md transition-all flex items-center justify-center gap-2 text-[15px] border ${
            saved
              ? 'bg-secondary-container text-on-secondary-container border-secondary/30'
              : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/30 text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined">
            {saved ? 'check_circle' : 'bookmark_add'}
          </span>
          {saved ? 'Saved to Farm Log!' : 'Save to Farm Log'}
        </button>
      </div>
    </div>
  );
};
