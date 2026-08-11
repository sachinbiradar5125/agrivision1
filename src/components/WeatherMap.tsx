import React, { useState, useEffect } from 'react';
import { Crop } from '../types';

interface WeatherMapProps {
  crops?: Crop[];
  onSelectCropField?: (cropId: string) => void;
}

export type WeatherLayer = 'precipitation' | 'temperature' | 'wind';

interface FieldWeather {
  cropId: string;
  name: string;
  location: string;
  x: number; // percentage on map canvas
  y: number; // percentage on map canvas
  temp: number; // °C
  precipRate: number; // mm/h
  precipChance: number; // %
  windSpeed: number; // km/h
  windDir: string; // SW, W, SSW, etc.
  windDeg: number; // degrees
  humidity: number; // %
  soilMoisture: number; // %
}

const FIELD_WEATHER_DATA: FieldWeather[] = [
  {
    cropId: 'crop-1',
    name: 'Roma Tomato',
    location: 'Block A, Row 4',
    x: 42,
    y: 38,
    temp: 28,
    precipRate: 0.2,
    precipChance: 20,
    windSpeed: 12,
    windDir: 'SW',
    windDeg: 225,
    humidity: 67,
    soilMoisture: 48,
  },
  {
    cropId: 'crop-2',
    name: 'Winter Wheat',
    location: 'Field North-East',
    x: 72,
    y: 25,
    temp: 29,
    precipRate: 2.4,
    precipChance: 65,
    windSpeed: 18,
    windDir: 'W',
    windDeg: 270,
    humidity: 78,
    soilMoisture: 62,
  },
  {
    cropId: 'crop-3',
    name: 'Soybean',
    location: 'Sector B',
    x: 28,
    y: 68,
    temp: 27,
    precipRate: 0.0,
    precipChance: 10,
    windSpeed: 9,
    windDir: 'SSW',
    windDeg: 200,
    humidity: 58,
    soilMoisture: 42,
  },
  {
    cropId: 'crop-4',
    name: 'Heirloom Tomato',
    location: 'Block A, Row 1',
    x: 48,
    y: 44,
    temp: 28,
    precipRate: 0.1,
    precipChance: 15,
    windSpeed: 11,
    windDir: 'SW',
    windDeg: 220,
    humidity: 65,
    soilMoisture: 50,
  },
];

const TIME_STEPS = [
  { label: '-2h', precipMult: 0.5, tempDiff: -1.5, windMult: 0.8 },
  { label: '-1h', precipMult: 0.8, tempDiff: -0.8, windMult: 0.9 },
  { label: 'Now', precipMult: 1.0, tempDiff: 0, windMult: 1.0 },
  { label: '+1h', precipMult: 1.6, tempDiff: +0.5, windMult: 1.2 },
  { label: '+2h', precipMult: 2.1, tempDiff: +1.2, windMult: 1.4 },
  { label: '+3h', precipMult: 1.4, tempDiff: +0.8, windMult: 1.1 },
];

export const WeatherMap: React.FC<WeatherMapProps> = ({ crops = [], onSelectCropField }) => {
  const [activeLayer, setActiveLayer] = useState<WeatherLayer>('precipitation');
  const [selectedFieldId, setSelectedFieldId] = useState<string>('crop-1');
  const [timeIndex, setTimeIndex] = useState<number>(2); // 'Now'
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Auto animation playback for weather trends
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeIndex((prev) => (prev + 1) % TIME_STEPS.length);
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const selectedField =
    FIELD_WEATHER_DATA.find((f) => f.cropId === selectedFieldId) || FIELD_WEATHER_DATA[0];

  const currentTime = TIME_STEPS[timeIndex];

  // Calculated dynamic metrics based on time offset
  const currentTemp = Math.round(selectedField.temp + currentTime.tempDiff);
  const currentPrecip = Math.max(0, Number((selectedField.precipRate * currentTime.precipMult).toFixed(1)));
  const currentWind = Math.round(selectedField.windSpeed * currentTime.windMult);

  return (
    <div className="bg-surface-container-lowest rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30 flex flex-col gap-4">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              map
            </span>
          </div>
          <div>
            <h3 className="font-title-md text-[16px] font-bold text-on-surface">
              Interactive Field Weather Map
            </h3>
            <p className="font-body-md text-on-surface-variant text-[12px]">
              Micro-climate trends across registered farm blocks
            </p>
          </div>
        </div>

        {/* Play Animation Toggle */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-sm text-[11.5px] font-bold transition-all shrink-0 ${
            isPlaying
              ? 'bg-error-container text-on-error-container animate-pulse'
              : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {isPlaying ? 'pause' : 'play_arrow'}
          </span>
          {isPlaying ? 'Radar Live' : 'Animate Trend'}
        </button>
      </div>

      {/* Layer Selection Tabs */}
      <div className="grid grid-cols-3 p-1 bg-surface-container-low rounded-2xl border border-outline-variant/20">
        <button
          onClick={() => setActiveLayer('precipitation')}
          className={`py-2 px-2.5 rounded-xl font-label-sm text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeLayer === 'precipitation'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">water_drop</span>
          Rain Radar
        </button>

        <button
          onClick={() => setActiveLayer('temperature')}
          className={`py-2 px-2.5 rounded-xl font-label-sm text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeLayer === 'temperature'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">thermostat</span>
          Temperature
        </button>

        <button
          onClick={() => setActiveLayer('wind')}
          className={`py-2 px-2.5 rounded-xl font-label-sm text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeLayer === 'wind'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">air</span>
          Wind Speed
        </button>
      </div>

      {/* Interactive Map Canvas Container */}
      <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-outline-variant/30 shadow-inner group bg-slate-900 select-none">
        {/* Topographic Satellite Background Styling */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-85"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBCRaHr6QGHM78qhTdUWmmf0dgGK3K2VqeoMafqJ1bx9P8RV7MHp3_kJwbD5rbK3ZWEnItRt-iiFVMDn3ZHugY0ww0LP_9B63mRWZrF9BGLw7qhioodqlDCINl-6W_KGFSZ0hoRhRFjvaTgHw09wcm13kj381766WlRP1zvu_hxfej9SLnqekseutcbdin5DmUeIRNe_V_iFchUGExfS_v8lIbICCxBmVRIwbTPS42egSnZ2EP_Mx6n')`,
            filter: 'contrast(1.1) brightness(0.55) saturate(1.2)',
          }}
        />

        {/* Dynamic Weather Layer Overlays */}
        {activeLayer === 'precipitation' && (
          <div className="absolute inset-0 pointer-events-none transition-opacity duration-700">
            {/* Animated Radar Rainfall Blobs */}
            <svg className="w-full h-full opacity-60">
              <defs>
                <radialGradient id="rainGrad1" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="rainGrad2" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.85" />
                  <stop offset="70%" stopColor="#60a5fa" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle
                cx={`${72 + Math.sin(timeIndex) * 3}%`}
                cy={`${25 + Math.cos(timeIndex) * 2}%`}
                r={currentTime.precipMult * 45}
                fill="url(#rainGrad2)"
                className="animate-pulse"
              />
              <circle
                cx={`${42 + Math.cos(timeIndex) * 2}%`}
                cy={`${38 + Math.sin(timeIndex) * 3}%`}
                r={currentTime.precipMult * 30}
                fill="url(#rainGrad1)"
              />
            </svg>
          </div>
        )}

        {activeLayer === 'temperature' && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Heatmap Gradient Bands */}
            <div
              className="w-full h-full opacity-45 mix-blend-screen transition-all duration-500"
              style={{
                background: `radial-gradient(circle at 72% 25%, #f97316 0%, transparent 50%), radial-gradient(circle at 35% 65%, #eab308 0%, transparent 60%)`,
              }}
            />
          </div>
        )}

        {activeLayer === 'wind' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-70">
            {/* Directional Wind Stream Vectors */}
            <svg className="w-full h-full">
              {[15, 35, 55, 75, 90].map((yPercent, idx) => (
                <g key={idx} className="animate-pulse" style={{ animationDelay: `${idx * 0.3}s` }}>
                  <path
                    d={`M ${10 + Math.sin(timeIndex) * 10} ${yPercent}% Q ${50 + idx * 5} ${yPercent - 8}%, 90% ${yPercent + 4}%`}
                    fill="none"
                    stroke="#a5f3fc"
                    strokeWidth="1.8"
                    strokeDasharray="6 8"
                  />
                  <polygon
                    points={`90,${yPercent + 4} 85,${yPercent + 1} 85,${yPercent + 7}`}
                    fill="#a5f3fc"
                  />
                </g>
              ))}
            </svg>
          </div>
        )}

        {/* Field Polygon Boundaries */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Block A Boundary */}
          <polygon
            points="35%,30% 55%,32% 52%,55% 32%,50%"
            fill="rgba(34, 197, 94, 0.15)"
            stroke="#4ade80"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          {/* Field North-East Boundary */}
          <polygon
            points="65%,18% 85%,20% 82%,38% 62%,35%"
            fill="rgba(59, 130, 246, 0.15)"
            stroke="#60a5fa"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          {/* Sector B Boundary */}
          <polygon
            points="20%,60% 40%,62% 38%,80% 18%,78%"
            fill="rgba(234, 179, 8, 0.15)"
            stroke="#facc15"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
        </svg>

        {/* Registered Field Interactive Pins */}
        {FIELD_WEATHER_DATA.map((field) => {
          const isSelected = field.cropId === selectedFieldId;
          return (
            <div
              key={field.cropId}
              onClick={() => {
                setSelectedFieldId(field.cropId);
                if (onSelectCropField) onSelectCropField(field.cropId);
              }}
              style={{ left: `${field.x}%`, top: `${field.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group transition-all ${
                isSelected ? 'scale-110 z-30' : 'hover:scale-105'
              }`}
            >
              {/* Pulse Ring for Active Selection */}
              {isSelected && (
                <div className="absolute -inset-2 rounded-full bg-secondary-fixed/30 animate-ping pointer-events-none" />
              )}

              {/* Field Pin Badge */}
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-lg border backdrop-blur-md transition-all ${
                  isSelected
                    ? 'bg-primary text-on-primary border-secondary-fixed ring-2 ring-primary/40'
                    : 'bg-surface/90 text-on-surface border-outline-variant/40 hover:bg-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {activeLayer === 'precipitation'
                    ? 'water_drop'
                    : activeLayer === 'temperature'
                    ? 'thermostat'
                    : 'air'}
                </span>
                <span>{field.name}</span>
                <span className="ml-0.5 opacity-90 text-[10.5px]">
                  {activeLayer === 'precipitation'
                    ? `${field.precipRate}mm`
                    : activeLayer === 'temperature'
                    ? `${field.temp}°C`
                    : `${field.windSpeed}km/h`}
                </span>
              </div>
            </div>
          );
        })}

        {/* Map Legend & Active Time Tag */}
        <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl text-white font-label-sm text-[11px] flex items-center gap-2 border border-white/10 shadow-md">
          <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse" />
          <span className="font-bold">Valley View Estate</span>
          <span className="text-slate-400">({currentTime.label})</span>
        </div>

        <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl text-white font-label-sm text-[10.5px] flex items-center gap-1.5 border border-white/10 shadow-md">
          <span className="text-slate-300 capitalize">{activeLayer} Layer</span>
        </div>
      </div>

      {/* Time Trend Scrubber Slider */}
      <div className="bg-surface-container-low p-3 rounded-2xl border border-outline-variant/20 flex flex-col gap-2">
        <div className="flex items-center justify-between font-label-sm text-[11.5px]">
          <span className="text-on-surface-variant font-medium">Trend Timeline</span>
          <span className="text-primary font-bold">
            Showing: {currentTime.label} {currentTime.label === 'Now' ? '(Current Conditions)' : 'Forecast'}
          </span>
        </div>

        {/* Time Step Buttons */}
        <div className="grid grid-cols-6 gap-1">
          {TIME_STEPS.map((ts, idx) => (
            <button
              key={ts.label}
              onClick={() => {
                setTimeIndex(idx);
                setIsPlaying(false);
              }}
              className={`py-1.5 rounded-lg font-label-sm text-[11px] font-bold transition-all ${
                timeIndex === idx
                  ? 'bg-primary text-on-primary shadow-2xs scale-105'
                  : 'bg-surface text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {ts.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Field Real-Time Metrics Card */}
      <div className="bg-surface-container p-4 rounded-2xl border border-outline-variant/20 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-title-md text-[14.5px] font-bold text-on-surface">
                {selectedField.name}
              </span>
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full font-label-sm text-[10.5px] font-bold">
                {selectedField.location}
              </span>
            </div>
            <p className="font-body-md text-[11.5px] text-on-surface-variant">
              Micro-climate summary for selected farm block
            </p>
          </div>

          <button
            onClick={() => onSelectCropField && onSelectCropField(selectedField.cropId)}
            className="px-2.5 py-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-lg font-label-sm text-[11px] font-bold transition-all"
          >
            View Crop
          </button>
        </div>

        {/* 3 Metric Grid */}
        <div className="grid grid-cols-3 gap-2">
          {/* Precipitation Box */}
          <div
            className={`p-2.5 rounded-xl border flex flex-col gap-1 transition-all ${
              activeLayer === 'precipitation'
                ? 'bg-primary/10 border-primary/40'
                : 'bg-surface-container-low border-outline-variant/20'
            }`}
          >
            <div className="flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-[16px]">water_drop</span>
              <span className="font-label-sm text-[10.5px] font-bold">Precipitation</span>
            </div>
            <span className="font-display-lg text-[16px] font-bold text-on-surface">
              {currentPrecip} mm/h
            </span>
            <span className="font-label-sm text-[10px] text-on-surface-variant">
              {selectedField.precipChance}% chance
            </span>
          </div>

          {/* Temperature Box */}
          <div
            className={`p-2.5 rounded-xl border flex flex-col gap-1 transition-all ${
              activeLayer === 'temperature'
                ? 'bg-primary/10 border-primary/40'
                : 'bg-surface-container-low border-outline-variant/20'
            }`}
          >
            <div className="flex items-center gap-1 text-tertiary">
              <span className="material-symbols-outlined text-[16px]">thermostat</span>
              <span className="font-label-sm text-[10.5px] font-bold">Temperature</span>
            </div>
            <span className="font-display-lg text-[16px] font-bold text-on-surface">
              {currentTemp}°C
            </span>
            <span className="font-label-sm text-[10px] text-on-surface-variant">
              Humidity: {selectedField.humidity}%
            </span>
          </div>

          {/* Wind Speed Box */}
          <div
            className={`p-2.5 rounded-xl border flex flex-col gap-1 transition-all ${
              activeLayer === 'wind'
                ? 'bg-primary/10 border-primary/40'
                : 'bg-surface-container-low border-outline-variant/20'
            }`}
          >
            <div className="flex items-center gap-1 text-secondary">
              <span className="material-symbols-outlined text-[16px]">air</span>
              <span className="font-label-sm text-[10.5px] font-bold">Wind Speed</span>
            </div>
            <span className="font-display-lg text-[16px] font-bold text-on-surface">
              {currentWind} km/h
            </span>
            <span className="font-label-sm text-[10px] text-on-surface-variant">
              Direction: {selectedField.windDir}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
