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

interface YieldEstimationModuleProps {
  crop?: Crop | null;
  onSaveYieldEstimate?: (yieldVal: number, totalHarvest: number) => void;
}

interface HistoricalYieldPoint {
  year: string;
  actualYield: number | null;
  expectedYield: number | null;
  regionalBenchmark: number;
  aiPotential: number;
}

export const YieldEstimationModule: React.FC<YieldEstimationModuleProps> = ({
  crop,
  onSaveYieldEstimate,
}) => {
  const cropName = crop?.name || 'Roma Tomato';
  const defaultArea = crop?.area ? parseFloat(crop.area) || 3.5 : 3.5;

  // Base values per crop default
  const isGrain = cropName.toLowerCase().includes('rice') || cropName.toLowerCase().includes('wheat');
  const unitLabel = isGrain ? 'Quintals/Acre' : 'Tons/Acre';
  const baseHistoricalAvg = isGrain ? 24.5 : 4.8;
  const baseRegionalAvg = isGrain ? 22.0 : 4.2;
  const baseAiPotential = isGrain ? 28.0 : 5.8;

  // State for user inputs
  const [expectedYield, setExpectedYield] = useState<number>(baseAiPotential - 0.2);
  const [fieldArea, setFieldArea] = useState<number>(defaultArea);
  const [marketPrice, setMarketPrice] = useState<number>(isGrain ? 2400 : 28000); // e.g. currency per unit
  const [selectedPreset, setSelectedPreset] = useState<'conservative' | 'realistic' | 'optimistic'>('realistic');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Apply confidence level presets
  const handlePresetSelect = (preset: 'conservative' | 'realistic' | 'optimistic') => {
    setSelectedPreset(preset);
    if (preset === 'conservative') {
      setExpectedYield(Number((baseHistoricalAvg * 1.02).toFixed(1)));
    } else if (preset === 'realistic') {
      setExpectedYield(Number((baseHistoricalAvg * 1.15).toFixed(1)));
    } else {
      setExpectedYield(Number((baseAiPotential).toFixed(1)));
    }
  };

  // Calculations
  const totalHarvest = Number((expectedYield * fieldArea).toFixed(1));
  const totalRevenue = totalHarvest * marketPrice;
  const historicalTotalAvg = Number((baseHistoricalAvg * fieldArea).toFixed(1));
  const yieldDifference = Number((expectedYield - baseHistoricalAvg).toFixed(1));
  const percentageVariance = Number((((expectedYield - baseHistoricalAvg) / baseHistoricalAvg) * 100).toFixed(1));

  // Dynamic Chart Data with 5-Year Historical Averages and 2026 User Target
  const chartData: HistoricalYieldPoint[] = [
    {
      year: '2021',
      actualYield: Number((baseHistoricalAvg * 0.88).toFixed(1)),
      expectedYield: null,
      regionalBenchmark: Number((baseRegionalAvg * 0.9).toFixed(1)),
      aiPotential: Number((baseAiPotential * 0.85).toFixed(1)),
    },
    {
      year: '2022',
      actualYield: Number((baseHistoricalAvg * 0.94).toFixed(1)),
      expectedYield: null,
      regionalBenchmark: Number((baseRegionalAvg * 0.95).toFixed(1)),
      aiPotential: Number((baseAiPotential * 0.9).toFixed(1)),
    },
    {
      year: '2023',
      actualYield: Number((baseHistoricalAvg * 0.98).toFixed(1)),
      expectedYield: null,
      regionalBenchmark: Number((baseRegionalAvg * 0.98).toFixed(1)),
      aiPotential: Number((baseAiPotential * 0.94).toFixed(1)),
    },
    {
      year: '2024',
      actualYield: Number((baseHistoricalAvg * 1.04).toFixed(1)),
      expectedYield: null,
      regionalBenchmark: Number((baseRegionalAvg * 1.02).toFixed(1)),
      aiPotential: Number((baseAiPotential * 0.97).toFixed(1)),
    },
    {
      year: '2025',
      actualYield: Number((baseHistoricalAvg * 1.08).toFixed(1)),
      expectedYield: Number((baseHistoricalAvg * 1.08).toFixed(1)),
      regionalBenchmark: baseRegionalAvg,
      aiPotential: baseAiPotential,
    },
    {
      year: '2026 (Target)',
      actualYield: null,
      expectedYield: expectedYield,
      regionalBenchmark: baseRegionalAvg,
      aiPotential: baseAiPotential,
    },
  ];

  const handleSave = () => {
    if (onSaveYieldEstimate) {
      onSaveYieldEstimate(expectedYield, totalHarvest);
    }
    setSavedSuccessMsg(`Updated yield target: ${expectedYield} ${unitLabel} (${totalHarvest} total)`);
    setTimeout(() => setSavedSuccessMsg(null), 3000);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl text-[12px] border border-slate-700 backdrop-blur-md">
          <p className="font-bold text-amber-300 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => {
            if (entry.value === null || entry.value === undefined) return null;
            return (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
                <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                  {entry.name}:
                </span>
                <span className="font-bold">{entry.value} {unitLabel}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface-container-lowest rounded-[24px] p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30 flex flex-col gap-5">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <span className="material-symbols-outlined text-[24px]">analytics</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-title-md text-on-surface font-bold text-[17px]">
                Yield Estimation & Benchmarking
              </h2>
              <span className="bg-primary/10 text-primary text-[11px] font-bold px-2 py-0.5 rounded-full border border-primary/20">
                Interactive
              </span>
            </div>
            <p className="font-body-md text-on-surface-variant text-[12px]">
              Estimate harvest yield for {cropName} and compare with 5-year field history
            </p>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/30 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handlePresetSelect('conservative')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              selectedPreset === 'conservative'
                ? 'bg-surface text-on-surface shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Conservative
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('realistic')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              selectedPreset === 'realistic'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Realistic
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('optimistic')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              selectedPreset === 'optimistic'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            AI Optimal
          </button>
        </div>
      </div>

      {/* Interactive Input Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Input 1: Expected Yield Per Acre */}
        <div className="bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/20 flex flex-col gap-1.5">
          <label className="font-label-sm text-[11px] font-bold text-on-surface-variant flex items-center justify-between">
            <span>Expected Yield ({unitLabel})</span>
            <span className="text-primary font-bold">Target</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              min="0.5"
              max="100"
              value={expectedYield}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setExpectedYield(isNaN(val) ? 0 : val);
              }}
              className="w-full bg-surface border border-outline-variant/40 rounded-xl px-3 py-2 text-[15px] font-bold text-on-surface focus:outline-none focus:border-primary transition-all shadow-2xs"
            />
            <span className="text-[12px] font-semibold text-on-surface-variant shrink-0">
              {unitLabel.split('/')[0]}
            </span>
          </div>
          <span className="text-[10px] text-on-surface-variant/80">
            5-Yr Field Avg: {baseHistoricalAvg} {unitLabel}
          </span>
        </div>

        {/* Input 2: Field Area */}
        <div className="bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/20 flex flex-col gap-1.5">
          <label className="font-label-sm text-[11px] font-bold text-on-surface-variant flex items-center justify-between">
            <span>Field Area</span>
            <span className="text-on-surface-variant font-semibold">Acres</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="500"
              value={fieldArea}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setFieldArea(isNaN(val) ? 1 : val);
              }}
              className="w-full bg-surface border border-outline-variant/40 rounded-xl px-3 py-2 text-[15px] font-bold text-on-surface focus:outline-none focus:border-primary transition-all shadow-2xs"
            />
            <span className="text-[12px] font-semibold text-on-surface-variant shrink-0">
              Acres
            </span>
          </div>
          <span className="text-[10px] text-on-surface-variant/80">
            Field Location: {crop?.location || 'Block A'}
          </span>
        </div>

        {/* Input 3: Market Price per Unit */}
        <div className="bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/20 flex flex-col gap-1.5">
          <label className="font-label-sm text-[11px] font-bold text-on-surface-variant flex items-center justify-between">
            <span>Est. Market Price</span>
            <span className="text-emerald-600 font-bold">Rate</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="50"
              min="10"
              value={marketPrice}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setMarketPrice(isNaN(val) ? 0 : val);
              }}
              className="w-full bg-surface border border-outline-variant/40 rounded-xl px-3 py-2 text-[15px] font-bold text-on-surface focus:outline-none focus:border-primary transition-all shadow-2xs"
            />
            <span className="text-[12px] font-semibold text-on-surface-variant shrink-0">
              ₹/{unitLabel.split('/')[0]}
            </span>
          </div>
          <span className="text-[10px] text-on-surface-variant/80">
            Est. Gross Revenue: ₹{totalRevenue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Highlights & Variance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-surface p-3 rounded-2xl border border-outline-variant/25 flex flex-col">
          <span className="text-[11px] font-medium text-on-surface-variant">Est. Total Harvest</span>
          <span className="text-[18px] font-extrabold text-on-surface mt-0.5">
            {totalHarvest} <span className="text-[12px] font-bold text-on-surface-variant">{unitLabel.split('/')[0]}</span>
          </span>
          <span className="text-[10px] text-on-surface-variant mt-1">
            vs {historicalTotalAvg} {unitLabel.split('/')[0]} 5-yr avg
          </span>
        </div>

        <div className="bg-surface p-3 rounded-2xl border border-outline-variant/25 flex flex-col">
          <span className="text-[11px] font-medium text-on-surface-variant">Yield Variance</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span
              className={`text-[18px] font-extrabold ${
                percentageVariance >= 0 ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {percentageVariance >= 0 ? `+${percentageVariance}%` : `${percentageVariance}%`}
            </span>
            <span className="material-symbols-outlined text-[18px] font-bold text-emerald-600">
              {percentageVariance >= 0 ? 'trending_up' : 'trending_down'}
            </span>
          </div>
          <span className="text-[10px] text-on-surface-variant mt-1">
            {yieldDifference >= 0 ? `+${yieldDifference}` : yieldDifference} {unitLabel}/acre
          </span>
        </div>

        <div className="bg-surface p-3 rounded-2xl border border-outline-variant/25 flex flex-col">
          <span className="text-[11px] font-medium text-on-surface-variant">Gross Revenue Est.</span>
          <span className="text-[18px] font-extrabold text-emerald-600 mt-0.5">
            ₹{(totalRevenue / 1000).toFixed(1)}k
          </span>
          <span className="text-[10px] text-on-surface-variant mt-1">
            ₹{totalRevenue.toLocaleString()} total
          </span>
        </div>

        <div className="bg-surface p-3 rounded-2xl border border-outline-variant/25 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-medium text-on-surface-variant">AI Potential Gap</span>
            <span className="text-[15px] font-bold text-amber-600 block mt-0.5">
              {(baseAiPotential - expectedYield).toFixed(1)} {unitLabel.split('/')[0]} left
            </span>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="mt-1 w-full py-1.5 px-2 bg-primary text-on-primary rounded-xl font-title-md text-[11px] font-bold hover:bg-primary-container transition-all active:scale-95 flex items-center justify-center gap-1 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[14px]">save</span>
            <span>Save Target</span>
          </button>
        </div>
      </div>

      {/* Toast feedback if saved */}
      {savedSuccessMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 px-3.5 py-2 rounded-xl text-[12px] font-bold flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* Recharts Line Chart comparing Historical Averages and User Target */}
      <div className="bg-surface p-4 rounded-2xl border border-outline-variant/20 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-title-md text-[14px] font-bold text-on-surface flex items-center gap-2">
              <span>Historical Crop Yield vs. 2026 Target Trend</span>
              <span className="font-normal text-[11px] text-on-surface-variant">({unitLabel})</span>
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-medium text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Actual Yield
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 2026 Target
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-slate-400"></span> Regional Avg
            </span>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" opacity={0.3} />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11, fill: 'var(--color-on-surface-variant)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--color-on-surface-variant)' }}
                axisLine={false}
                tickLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

              {/* Regional 5-Yr Benchmark Line */}
              <ReferenceLine
                y={baseRegionalAvg}
                stroke="#94a3b8"
                strokeDasharray="4 4"
                label={{
                  value: `Regional Avg: ${baseRegionalAvg}`,
                  fill: '#64748b',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />

              {/* Historical Actual Yield Line */}
              <Line
                type="monotone"
                dataKey="actualYield"
                name={`Historical Yield (${unitLabel.split('/')[0]})`}
                stroke="#059669"
                strokeWidth={3}
                dot={{ r: 4, fill: '#059669', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 6 }}
                connectNulls={false}
              />

              {/* User 2026 Target Yield Line */}
              <Line
                type="monotone"
                dataKey="expectedYield"
                name={`2026 Target Yield (${unitLabel.split('/')[0]})`}
                stroke="#d97706"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 5, fill: '#d97706', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 7 }}
                connectNulls={true}
              />

              {/* AI Potential Upper Bound Line */}
              <Line
                type="monotone"
                dataKey="aiPotential"
                name={`AI Max Potential (${unitLabel.split('/')[0]})`}
                stroke="#8b5cf6"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agronomist Advice & Insights */}
      <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 font-bold mt-0.5">
          <span className="material-symbols-outlined text-[18px]">psychology</span>
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="font-title-md text-[13px] font-bold text-on-surface">
            Agronomy Recommendation for {expectedYield} {unitLabel} Target
          </h4>
          <p className="font-body-md text-[12px] text-on-surface-variant leading-relaxed">
            {expectedYield > baseAiPotential - 0.1 ? (
              <>
                Targeting an ambitious <strong>{expectedYield} {unitLabel}</strong> requires optimizing potassium (SOP) top-dressing during fruiting and maintaining soil moisture strictly between 45-55% VWC.
              </>
            ) : expectedYield >= baseHistoricalAvg ? (
              <>
                Your target of <strong>{expectedYield} {unitLabel}</strong> is realistic and achievable (+{percentageVariance}% vs 5-year average). Standard NPK 19-19-19 fertigation at current growth stage will secure this yield.
              </>
            ) : (
              <>
                Your target is below field potential ({baseHistoricalAvg} {unitLabel}). Check soil nitrogen and ensure zero fungal pressure to safely boost production target.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
