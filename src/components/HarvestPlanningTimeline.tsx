import React, { useState } from 'react';
import { Crop } from '../types';

interface HarvestPlanningTimelineProps {
  crop: Crop | null;
}

interface ClimateScenario {
  id: string;
  label: string;
  gddModifier: number; // Heat unit rate shift
  rainForecast: 'Low' | 'Moderate' | 'Heavy Monsoon';
  desc: string;
}

const CLIMATE_SCENARIOS: ClimateScenario[] = [
  {
    id: 'normal',
    label: 'Standard Seasonal Climate',
    gddModifier: 1.0,
    rainForecast: 'Low',
    desc: 'Normal temperatures and dry conditions. Ideal steady ripening.',
  },
  {
    id: 'heatwave',
    label: 'Heatwave (+3°C Avg)',
    gddModifier: 1.2,
    rainForecast: 'Low',
    desc: 'Accelerates maturity by 4-6 days. Early harvesting recommended to prevent softness.',
  },
  {
    id: 'rain_risk',
    label: 'Late Season Rain Risk',
    gddModifier: 0.95,
    rainForecast: 'Heavy Monsoon',
    desc: 'High rain forecast in 12 days. Harvest early before rain causes fruit splitting.',
  },
];

export const HarvestPlanningTimeline: React.FC<HarvestPlanningTimelineProps> = ({ crop }) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('normal');
  const [selectedWindow, setSelectedWindow] = useState<'early' | 'optimal' | 'extended'>('optimal');

  const cropName = crop?.name || 'Roma Tomato';
  const plantedDaysAgo = crop?.plantedDaysAgo || 42;

  // Calculate planting date from plantedDaysAgo
  const plantingDate = new Date();
  plantingDate.setDate(plantingDate.getDate() - plantedDaysAgo);

  const scenario = CLIMATE_SCENARIOS.find((s) => s.id === selectedScenarioId) || CLIMATE_SCENARIOS[0];

  // Base maturity days for crop types
  const getBaseMaturityDays = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('wheat')) return 110;
    if (lower.includes('soybean')) return 95;
    if (lower.includes('maize') || lower.includes('corn')) return 100;
    return 75; // Tomato & veggies
  };

  const baseDaysToHarvest = getBaseMaturityDays(cropName);
  const adjustedMaturityDays = Math.round(baseDaysToHarvest / scenario.gddModifier);

  // Key date calculations
  const optimalStartDate = new Date(plantingDate);
  optimalStartDate.setDate(plantingDate.getDate() + adjustedMaturityDays - 5);

  const optimalPeakDate = new Date(plantingDate);
  optimalPeakDate.setDate(plantingDate.getDate() + adjustedMaturityDays);

  const optimalEndDate = new Date(plantingDate);
  optimalEndDate.setDate(plantingDate.getDate() + adjustedMaturityDays + 7);

  const daysUntilOptimalStart = Math.max(0, adjustedMaturityDays - 5 - plantedDaysAgo);
  const daysUntilOptimalPeak = adjustedMaturityDays - plantedDaysAgo;

  // Formatting dates
  const formatDateStr = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Maturity Progress percentage
  const progressPercent = Math.min(100, Math.round((plantedDaysAgo / adjustedMaturityDays) * 100));

  return (
    <div className="bg-surface-container-lowest rounded-[24px] p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-tertiary/10 text-tertiary flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              agriculture
            </span>
          </div>
          <div>
            <h2 className="font-title-md text-on-surface font-bold text-[17px]">
              Harvest Window Planner & Timeline
            </h2>
            <p className="font-body-md text-on-surface-variant text-[12px]">
              AI climate-driven optimal maturity window for {cropName}
            </p>
          </div>
        </div>

        {/* Target Harvest Countdown Tag */}
        <div className="flex items-center gap-2 bg-tertiary-container/20 border border-tertiary-container/40 text-on-tertiary-container px-3 py-1.5 rounded-full shrink-0">
          <span className="material-symbols-outlined text-[16px] text-tertiary">event_upcoming</span>
          <span className="font-label-sm text-[12px] font-bold">
            {daysUntilOptimalPeak > 0
              ? `Harvest in ~${daysUntilOptimalPeak} Days`
              : 'Harvest Window Active Now!'}
          </span>
        </div>
      </div>

      {/* Climate Model Selector */}
      <div className="bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/20 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-[11.5px] font-bold text-on-surface flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-primary">thermostat_auto</span>
            Regional Climate Scenario Simulator
          </span>
          <span className="font-label-sm text-[10.5px] text-on-surface-variant">
            GDD Heat Factor: x{scenario.gddModifier}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {CLIMATE_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => setSelectedScenarioId(sc.id)}
              className={`p-2.5 rounded-xl text-left font-label-sm transition-all border flex flex-col gap-1 ${
                selectedScenarioId === sc.id
                  ? 'bg-primary text-on-primary border-primary shadow-xs'
                  : 'bg-surface text-on-surface border-outline-variant/30 hover:bg-surface-container-high'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-[12px]">{sc.label}</span>
                {selectedScenarioId === sc.id && (
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                )}
              </div>
              <span
                className={`text-[10.5px] line-clamp-2 ${
                  selectedScenarioId === sc.id ? 'text-on-primary/90' : 'text-on-surface-variant'
                }`}
              >
                {sc.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Season Timeline Visual Bar */}
      <div className="flex flex-col gap-2 bg-surface-container p-4 rounded-2xl border border-outline-variant/20">
        <div className="flex items-center justify-between font-label-sm text-[12px]">
          <span className="text-on-surface-variant font-medium">
            Planted: <strong>{formatDateStr(plantingDate)}</strong> ({plantedDaysAgo} days ago)
          </span>
          <span className="text-primary font-bold">
            Season Maturity: {progressPercent}%
          </span>
        </div>

        {/* Progress Tracker Bar */}
        <div className="relative w-full h-5 bg-surface-container-highest rounded-full overflow-hidden p-0.5 flex">
          {/* Vegetative Phase */}
          <div className="h-full bg-emerald-500/30 text-[9.5px] font-bold text-emerald-800 flex items-center justify-center rounded-l-full" style={{ width: '45%' }}>
            Vegetative
          </div>
          {/* Maturation Phase */}
          <div className="h-full bg-amber-500/30 text-[9.5px] font-bold text-amber-800 flex items-center justify-center" style={{ width: '25%' }}>
            Ripening
          </div>
          {/* Optimal Harvest Window */}
          <div className="h-full bg-primary text-[9.5px] font-bold text-on-primary flex items-center justify-center animate-pulse" style={{ width: '20%' }}>
            Peak Window
          </div>
          {/* Late Harvest */}
          <div className="h-full bg-rose-500/30 text-[9.5px] font-bold text-rose-800 flex items-center justify-center rounded-r-full" style={{ width: '10%' }}>
            Late
          </div>

          {/* Current Day Pin */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-slate-900 z-20 shadow-md"
            style={{ left: `${Math.min(98, Math.max(2, progressPercent))}%` }}
          >
            <div className="absolute -top-6 -translate-x-1/2 bg-slate-900 text-white font-label-sm text-[9.5px] px-1.5 py-0.5 rounded shadow-sm font-bold whitespace-nowrap">
              Today (Day {plantedDaysAgo})
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Harvest Window Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Early Harvest Card */}
        <div
          onClick={() => setSelectedWindow('early')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col gap-2 ${
            selectedWindow === 'early'
              ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20'
              : 'bg-surface-container-low border-outline-variant/20 hover:bg-surface-container'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-800 rounded-full font-label-sm text-[10.5px] font-bold">
              Early Harvest
            </span>
            <span className="font-label-sm text-[11px] text-on-surface-variant">
              Days {adjustedMaturityDays - 10} - {adjustedMaturityDays - 5}
            </span>
          </div>
          <h4 className="font-title-md text-[14px] font-bold text-on-surface">
            {formatDateStr(new Date(plantingDate.getTime() + (adjustedMaturityDays - 10) * 86400000))}
          </h4>
          <ul className="text-[11.5px] text-on-surface-variant space-y-1">
            <li className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-amber-600">check</span>
              High firm firmness, long transit shelf-life
            </li>
            <li className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-amber-600">check</span>
              Best for distant export markets
            </li>
          </ul>
        </div>

        {/* Optimal Harvest Card */}
        <div
          onClick={() => setSelectedWindow('optimal')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col gap-2 ${
            selectedWindow === 'optimal'
              ? 'bg-primary/10 border-primary ring-2 ring-primary/20'
              : 'bg-surface-container-low border-outline-variant/20 hover:bg-surface-container'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 bg-primary text-on-primary rounded-full font-label-sm text-[10.5px] font-bold">
              Peak Optimal Window
            </span>
            <span className="font-label-sm text-[11px] text-primary font-bold">
              Days {adjustedMaturityDays - 4} - {adjustedMaturityDays + 5}
            </span>
          </div>
          <h4 className="font-title-md text-[14px] font-bold text-on-surface">
            {formatDateStr(optimalStartDate)} – {formatDateStr(optimalEndDate)}
          </h4>
          <ul className="text-[11.5px] text-on-surface-variant space-y-1">
            <li className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-primary">verified</span>
              Maximum sugar Brix levels & color grade
            </li>
            <li className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-primary">verified</span>
              Highest market value per ton
            </li>
          </ul>
        </div>

        {/* Extended / Late Harvest Card */}
        <div
          onClick={() => setSelectedWindow('extended')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col gap-2 ${
            selectedWindow === 'extended'
              ? 'bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/20'
              : 'bg-surface-container-low border-outline-variant/20 hover:bg-surface-container'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 bg-rose-500/20 text-rose-800 rounded-full font-label-sm text-[10.5px] font-bold">
              Late Harvest Risk
            </span>
            <span className="font-label-sm text-[11px] text-on-surface-variant">
              Days {adjustedMaturityDays + 6}+
            </span>
          </div>
          <h4 className="font-title-md text-[14px] font-bold text-on-surface">
            After {formatDateStr(optimalEndDate)}
          </h4>
          <ul className="text-[11.5px] text-on-surface-variant space-y-1">
            <li className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-rose-600">warning</span>
              Increased fruit softening & split risks
            </li>
            <li className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-rose-600">warning</span>
              Processing market lower price tier
            </li>
          </ul>
        </div>
      </div>

      {/* Actionable Harvest Recommendations */}
      <div className="bg-surface-container p-4 rounded-2xl border border-outline-variant/20 flex flex-col gap-3">
        <h3 className="font-title-md text-[14px] font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">checklist</span>
          Preparation & Logistics Recommendations ({selectedWindow.toUpperCase()} WINDOW)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="bg-surface p-3 rounded-xl border border-outline-variant/20 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-tertiary text-[20px]">groups</span>
            <div>
              <p className="font-label-sm text-[12px] font-bold text-on-surface">Labor Crew Booking</p>
              <p className="font-body-md text-[11.5px] text-on-surface-variant">
                Schedule 6-8 field harvesters starting {formatDateStr(optimalStartDate)}.
              </p>
            </div>
          </div>

          <div className="bg-surface p-3 rounded-xl border border-outline-variant/20 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-secondary text-[20px]">local_shipping</span>
            <div>
              <p className="font-label-sm text-[12px] font-bold text-on-surface">Cold Chain & Crate Prep</p>
              <p className="font-body-md text-[11.5px] text-on-surface-variant">
                Prepare 150 ventilated plastic crates. Reserve cold storage room at 12°C.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
