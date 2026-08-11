import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Crop } from '../types';

interface SoilHealthTrackerProps {
  crop?: Crop | null;
  onExportCSV?: () => void;
}

type SoilChartMetric = 'moisture_ph' | 'npk_nutrients' | 'ec_organic';

const SOIL_HISTORY_DATA = [
  { week: 'W1', date: 'Jul 01', moisture: 38, ph: 6.1, nitrogen: 28, phosphorus: 18, potassium: 140, ec: 1.1, organicMatter: 2.8 },
  { week: 'W2', date: 'Jul 08', moisture: 42, ph: 6.2, nitrogen: 34, phosphorus: 22, potassium: 155, ec: 1.2, organicMatter: 2.9 },
  { week: 'W3', date: 'Jul 15', moisture: 55, ph: 6.3, nitrogen: 48, phosphorus: 26, potassium: 170, ec: 1.4, organicMatter: 3.0 },
  { week: 'W4', date: 'Jul 22', moisture: 46, ph: 6.4, nitrogen: 42, phosphorus: 25, potassium: 165, ec: 1.3, organicMatter: 3.1 },
  { week: 'W5', date: 'Jul 29', moisture: 41, ph: 6.3, nitrogen: 38, phosphorus: 24, potassium: 160, ec: 1.2, organicMatter: 3.1 },
  { week: 'W6', date: 'Aug 05', moisture: 52, ph: 6.4, nitrogen: 46, phosphorus: 28, potassium: 180, ec: 1.5, organicMatter: 3.2 },
  { week: 'W7 (Now)', date: 'Aug 11', moisture: 48, ph: 6.5, nitrogen: 45, phosphorus: 29, potassium: 182, ec: 1.4, organicMatter: 3.2 },
];

export const SoilHealthTracker: React.FC<SoilHealthTrackerProps> = ({ crop, onExportCSV }) => {
  const [activeTab, setActiveTab] = useState<SoilChartMetric>('moisture_ph');

  const cropName = crop?.name || 'Roma Tomato';
  const currentSoil = SOIL_HISTORY_DATA[SOIL_HISTORY_DATA.length - 1];

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface/95 backdrop-blur-md p-3 rounded-xl border border-outline-variant/30 shadow-lg text-[12px] space-y-1 z-30">
          <p className="font-title-md font-bold text-on-surface">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-on-surface-variant">{entry.name}:</span>
              <span className="font-bold text-on-surface">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface-container-lowest rounded-[24px] p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30 flex flex-col gap-5">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              landslide
            </span>
          </div>
          <div>
            <h2 className="font-title-md text-on-surface font-bold text-[17px]">
              Soil Health & Nutrient Intelligence
            </h2>
            <p className="font-body-md text-on-surface-variant text-[12px]">
              Continuous soil moisture, pH & NPK nutrient telemetry for {cropName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {onExportCSV && (
            <button
              onClick={onExportCSV}
              type="button"
              className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-full font-label-sm text-[12px] font-bold border border-primary/20 transition-all active:scale-95"
              title="Export Soil & Fertilizer History as CSV"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Export CSV Report</span>
            </button>
          )}

          {/* Overall Health Index */}
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 px-3 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
            <span className="font-label-sm text-[12px] font-bold">Soil Score: 94/100 (Optimal)</span>
          </div>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Soil Moisture */}
        <div className="bg-surface-container p-3.5 rounded-2xl border border-outline-variant/20 flex flex-col gap-1">
          <div className="flex items-center justify-between text-primary">
            <div className="flex items-center gap-1 font-label-sm text-[11px] font-bold">
              <span className="material-symbols-outlined text-[16px]">water_drop</span>
              Moisture
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">Target: 45-60%</span>
          </div>
          <span className="font-display-lg text-[20px] font-bold text-on-surface mt-1">
            {currentSoil.moisture}% VWC
          </span>
          <span className="font-label-sm text-[10.5px] text-on-surface-variant">Adequate Root Hydration</span>
        </div>

        {/* Soil pH */}
        <div className="bg-surface-container p-3.5 rounded-2xl border border-outline-variant/20 flex flex-col gap-1">
          <div className="flex items-center justify-between text-tertiary">
            <div className="flex items-center gap-1 font-label-sm text-[11px] font-bold">
              <span className="material-symbols-outlined text-[16px]">science</span>
              pH Balance
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-tertiary/15 text-tertiary">Ideal: 6.2-6.8</span>
          </div>
          <span className="font-display-lg text-[20px] font-bold text-on-surface mt-1">
            {currentSoil.ph} pH
          </span>
          <span className="font-label-sm text-[10.5px] text-on-surface-variant">Slightly Acidic (Perfect)</span>
        </div>

        {/* Nitrogen (N) */}
        <div className="bg-surface-container p-3.5 rounded-2xl border border-outline-variant/20 flex flex-col gap-1">
          <div className="flex items-center justify-between text-secondary">
            <div className="flex items-center gap-1 font-label-sm text-[11px] font-bold">
              <span className="material-symbols-outlined text-[16px]">eco</span>
              Nitrogen (N)
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-secondary/15 text-secondary">Optimal</span>
          </div>
          <span className="font-display-lg text-[20px] font-bold text-on-surface mt-1">
            {currentSoil.nitrogen} ppm
          </span>
          <span className="font-label-sm text-[10.5px] text-on-surface-variant">Vegetative Growth Support</span>
        </div>

        {/* Organic Matter */}
        <div className="bg-surface-container p-3.5 rounded-2xl border border-outline-variant/20 flex flex-col gap-1">
          <div className="flex items-center justify-between text-amber-700">
            <div className="flex items-center gap-1 font-label-sm text-[11px] font-bold">
              <span className="material-symbols-outlined text-[16px]">compost</span>
              Organic Matter
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800">+0.4% YoY</span>
          </div>
          <span className="font-display-lg text-[20px] font-bold text-on-surface mt-1">
            {currentSoil.organicMatter}%
          </span>
          <span className="font-label-sm text-[10.5px] text-on-surface-variant">Rich Microbial Biome</span>
        </div>
      </div>

      {/* Chart Metric Switcher Tabs */}
      <div className="grid grid-cols-3 p-1 bg-surface-container-low rounded-2xl border border-outline-variant/20">
        <button
          onClick={() => setActiveTab('moisture_ph')}
          className={`py-2 px-2.5 rounded-xl font-label-sm text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'moisture_ph'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">water_drop</span>
          Moisture & pH History
        </button>

        <button
          onClick={() => setActiveTab('npk_nutrients')}
          className={`py-2 px-2.5 rounded-xl font-label-sm text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'npk_nutrients'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">nutrition</span>
          NPK Nutrients (ppm)
        </button>

        <button
          onClick={() => setActiveTab('ec_organic')}
          className={`py-2 px-2.5 rounded-xl font-label-sm text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'ec_organic'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">electric_bolt</span>
          EC & Organic Matter
        </button>
      </div>

      {/* Recharts Soil History Line Chart */}
      <div className="w-full h-64 pt-2 pr-1">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'moisture_ph' ? (
            <LineChart data={SOIL_HISTORY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#0284c7' }} unit="%" domain={[20, 70]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#d97706' }} domain={[5.0, 7.5]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11.5px', paddingTop: '8px' }} />
              {/* Target Moisture Reference Threshold */}
              <ReferenceLine yAxisId="left" y={50} stroke="#0284c7" strokeDasharray="3 3" label={{ value: 'Target Moisture (50%)', fill: '#0284c7', fontSize: 10, position: 'top' }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="moisture"
                name="Soil Moisture (% VWC)"
                stroke="#0284c7"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#0284c7' }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="ph"
                name="Soil pH Level"
                stroke="#d97706"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#d97706' }}
              />
            </LineChart>
          ) : activeTab === 'npk_nutrients' ? (
            <LineChart data={SOIL_HISTORY_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit=" ppm" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11.5px', paddingTop: '8px' }} />
              <Line
                type="monotone"
                dataKey="nitrogen"
                name="Nitrogen (N ppm)"
                stroke="#166534"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#166534' }}
              />
              <Line
                type="monotone"
                dataKey="phosphorus"
                name="Phosphorus (P ppm)"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#2563eb' }}
              />
              <Line
                type="monotone"
                dataKey="potassium"
                name="Potassium (K ppm)"
                stroke="#9333ea"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#9333ea' }}
              />
            </LineChart>
          ) : (
            <LineChart data={SOIL_HISTORY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#0d9488' }} unit=" dS/m" domain={[0, 3]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#854d0e' }} unit="%" domain={[0, 5]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11.5px', paddingTop: '8px' }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="ec"
                name="Electrical Cond. (EC dS/m)"
                stroke="#0d9488"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#0d9488' }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="organicMatter"
                name="Organic Matter (%)"
                stroke="#854d0e"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#854d0e' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* AI Agronomist Soil Advice */}
      <div className="bg-surface-container p-4 rounded-2xl border border-outline-variant/20 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">psychology</span>
          <h4 className="font-title-md text-[13.5px] font-bold text-on-surface">
            AI Agronomist Soil Diagnostic Recommendation
          </h4>
        </div>
        <p className="font-body-md text-[12px] text-on-surface-variant leading-relaxed">
          Soil pH is optimal at <strong>6.5</strong> for nutrient bioavailability. Soil moisture is at{' '}
          <strong>48% VWC</strong>, indicating no immediate irrigation stress. Potassium levels (182 ppm) have stabilized after the top-dressing application in Week 5.
        </p>
      </div>
    </div>
  );
};
