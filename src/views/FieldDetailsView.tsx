import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Crop, FertilizerTask } from '../types';
import { STAGE_FERTILIZER_GUIDE } from '../data';
import { HarvestPlanningTimeline } from '../components/HarvestPlanningTimeline';
import { SoilHealthTracker } from '../components/SoilHealthTracker';
import { YieldEstimationModule } from '../components/YieldEstimationModule';

interface FieldDetailsViewProps {
  crop: Crop | null;
  tasks?: FertilizerTask[];
  onToggleTask?: (taskId: string) => void;
  onAddTask?: (task: FertilizerTask) => void;
  onDeleteTask?: (taskId: string) => void;
  onDeleteCrop?: (cropId: string) => void;
  onNavigate?: (view: any) => void;
}

export const FieldDetailsView: React.FC<FieldDetailsViewProps> = ({
  crop,
  tasks = [],
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onDeleteCrop,
  onNavigate,
}) => {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const [chartMode, setChartMode] = useState<'growth' | 'yield' | 'fertilizer'>('growth');
  const [metricType, setMetricType] = useState<'health' | 'height'>('health');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Task creation modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedGuideStage, setSelectedGuideStage] = useState<string>('Flowering');
  const [formStage, setFormStage] = useState<FertilizerTask['growthStage']>('Flowering');
  const [formFertilizer, setFormFertilizer] = useState('');
  const [formMethod, setFormMethod] = useState<FertilizerTask['applicationMethod']>('Drip Fertigation');
  const [formDosage, setFormDosage] = useState('5 kg / acre');
  const [formDueDate, setFormDueDate] = useState('In 3 days');
  const [formNotes, setFormNotes] = useState('');

  const cropName = crop?.name || 'Roma Tomato';
  const cropId = crop?.id || 'crop-1';
  const location = crop?.location || 'Block A, Row 4';
  const score = crop?.healthScore || 87;
  const plantedDays = crop?.plantedDaysAgo || 42;

  // Determine current growth stage based on days planted
  const getCurrentStage = (days: number): FertilizerTask['growthStage'] => {
    if (days < 15) return 'Germination';
    if (days <= 35) return 'Vegetative';
    if (days <= 55) return 'Flowering';
    if (days <= 80) return 'Fruiting';
    return 'Maturation';
  };

  const currentStage = getCurrentStage(plantedDays);

  // Filter tasks specific to this crop field
  const fieldTasks = tasks.filter(
    (t) => t.cropId === cropId || t.cropName.toLowerCase() === cropName.toLowerCase()
  );

  const handleSliderMove = (clientX: number, rect: DOMRect) => {
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  const handleOpenModalForStage = (stageName: FertilizerTask['growthStage'], defaultFertilizer?: string) => {
    setFormStage(stageName);
    if (defaultFertilizer) {
      setFormFertilizer(defaultFertilizer);
    } else {
      const guide = STAGE_FERTILIZER_GUIDE.find((g) => g.stage === stageName);
      setFormFertilizer(guide?.recommended || 'NPK 19-19-19');
    }
    setShowTaskModal(true);
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFertilizer.trim()) return;

    const newTask: FertilizerTask = {
      id: `ftask-${Date.now()}`,
      cropId,
      cropName,
      growthStage: formStage,
      fertilizerName: formFertilizer.trim(),
      dosage: formDosage || '5 kg / acre',
      applicationMethod: formMethod,
      dueDate: formDueDate || 'In 3 days',
      daysFromPlanting: plantedDays,
      completed: false,
      notes: formNotes.trim() || `Scheduled for ${formStage} stage treatment.`,
    };

    if (onAddTask) {
      onAddTask(newTask);
    }

    setShowTaskModal(false);
    setFormFertilizer('');
    setFormNotes('');
  };

  // Export Soil Health Telemetry & Fertilizer Usage History as CSV
  const handleExportCSVReport = () => {
    try {
      // 1. Report Metadata & Header
      const reportHeaders = [
        ['AGRIVISION FIELD REPORT - SOIL HEALTH & FERTILIZER HISTORY'],
        ['Report Generated', new Date().toLocaleString()],
        ['Crop / Field Name', cropName],
        ['Field Location', location],
        ['Days Since Planting', `${plantedDays} Days`],
        ['Current Growth Stage', currentStage],
        ['Overall Soil Score', '94 / 100 (Optimal)'],
        [''],
      ];

      // 2. Section 1: Soil Health Telemetry History
      const soilSectionHeader = [
        ['--- SECTION 1: SOIL HEALTH & NUTRIENT TELEMETRY HISTORY ---'],
        ['Week Record', 'Date', 'Moisture (% VWC)', 'pH Level', 'Nitrogen (ppm)', 'Phosphorus (ppm)', 'Potassium (ppm)', 'EC (dS/m)', 'Organic Matter (%)'],
      ];

      const soilDataRows = [
        ['W1', 'Jul 01', '38', '6.1', '28', '18', '140', '1.1', '2.8'],
        ['W2', 'Jul 08', '42', '6.2', '34', '22', '155', '1.2', '2.9'],
        ['W3', 'Jul 15', '55', '6.3', '48', '26', '170', '1.4', '3.0'],
        ['W4', 'Jul 22', '46', '6.4', '42', '25', '165', '1.3', '3.1'],
        ['W5', 'Jul 29', '41', '6.3', '38', '24', '160', '1.2', '3.1'],
        ['W6', 'Aug 05', '52', '6.4', '46', '28', '180', '1.5', '3.2'],
        ['W7 (Current)', 'Aug 11', '48', '6.5', '45', '29', '182', '1.4', '3.2'],
      ];

      // 3. Section 2: Fertilizer Application History & Scheduled Tasks
      const fertilizerSectionHeader = [
        [''],
        ['--- SECTION 2: FERTILIZER USAGE HISTORY & SCHEDULED APPLICATIONS ---'],
        ['Growth Stage', 'Fertilizer Formula Name', 'Planned Volume (kg/acre)', 'Actual Volume (kg/acre)', 'Application Method', 'Status', 'Due Date / Schedule', 'Notes'],
      ];

      const fertilizerVolumeRows = [
        ['Germination', 'NPK 19-19-19', '2.5', '2.5', 'Soil Drenching', 'Completed', 'Day 10', 'Root establishment dose'],
        ['Vegetative', 'Urea (46% N)', '6.0', '5.8', 'Broadcast Application', 'Completed', 'Day 25', 'Foliar growth boost'],
        ['Flowering', 'Calcium Nitrate', '4.5', '4.5', 'Drip Fertigation', 'Active Stage', 'Day 42', 'Bloom development'],
        ['Fruiting', 'SOP (0-0-50)', '5.0', '3.2', 'Foliar Spray', 'In Progress', 'Day 60', 'Fruit sizing and quality'],
        ['Maturation', 'Micronutrient Mix', '3.0', '0.0', 'Drip Fertigation', 'Scheduled', 'Day 75', 'Pre-harvest ripening'],
      ];

      // Custom task reminders for this field
      const customTaskRows = fieldTasks.map((t) => [
        t.growthStage,
        t.fertilizerName,
        t.dosage,
        t.completed ? t.dosage : '0.0',
        t.applicationMethod,
        t.completed ? 'Completed' : 'Pending',
        t.dueDate,
        t.notes || '',
      ]);

      const customTaskHeader = customTaskRows.length > 0
        ? [[''], ['--- ADDITIONAL SCHEDULED REMINDERS ---']]
        : [];

      // Combine all sections into a single matrix
      const matrix = [
        ...reportHeaders,
        ...soilSectionHeader,
        ...soilDataRows,
        ...fertilizerSectionHeader,
        ...fertilizerVolumeRows,
        ...customTaskHeader,
        ...(customTaskRows.length > 0 ? customTaskRows : []),
      ];

      // Convert Matrix to CSV formatted string
      const csvContent = matrix
        .map((row) =>
          row
            .map((cell) => {
              const val = String(cell ?? '');
              if (val.includes(',') || val.includes('"') || val.includes('\n')) {
                return `"${val.replace(/"/g, '""')}"`;
              }
              return `"${val}"`;
            })
            .join(',')
        )
        .join('\r\n');

      // Create blob & trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const sanitizedName = cropName.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${sanitizedName}_Soil_And_Fertilizer_Report_${new Date().toISOString().slice(0, 10)}.csv`;

      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      triggerToast(`CSV report downloaded: ${filename}`);
    } catch (err) {
      console.error('Error generating CSV export', err);
      alert('Could not generate CSV report. Please try again.');
    }
  };

  // Growth Cycle Data (12 Weeks)
  const growthCycleData = [
    { week: 'W1', stage: 'Germination', health: 90, benchmarkHealth: 88, height: 4, canopy: 10, note: 'Sowing complete' },
    { week: 'W3', stage: 'Seedling', health: 88, benchmarkHealth: 89, height: 14, canopy: 25, note: 'First true leaves' },
    { week: 'W5', stage: 'Vegetative', health: 65, benchmarkHealth: 90, height: 32, canopy: 48, note: 'Early Blight detected' },
    { week: 'W7', stage: 'Treatment', health: 78, benchmarkHealth: 92, height: 50, canopy: 68, note: 'Copper spray applied' },
    { week: 'W9', stage: 'Flowering', health: 85, benchmarkHealth: 93, height: 72, canopy: 82, note: 'Peak bloom observed' },
    { week: 'W11', stage: 'Fruiting', health: 89, benchmarkHealth: 94, height: 86, canopy: 90, note: 'Fruit set healthy' },
    { week: 'Now', stage: 'Maturation', health: score, benchmarkHealth: 95, height: 92, canopy: 95, note: 'Harvest ready soon' },
  ];

  // Historical Yield Trends Data (5 Years + Projected)
  const historicalYieldData = [
    { year: '2021', actualYield: 3.4, regionalAvg: 3.1, revenue: 11200, qualityGrade: 'Grade B' },
    { year: '2022', actualYield: 4.1, regionalAvg: 3.3, revenue: 13940, qualityGrade: 'Grade A' },
    { year: '2023', actualYield: 3.2, regionalAvg: 3.4, revenue: 10560, qualityGrade: 'Grade B' },
    { year: '2024', actualYield: 4.7, regionalAvg: 3.6, revenue: 16450, qualityGrade: 'Grade A+' },
    { year: '2025', actualYield: 5.1, regionalAvg: 3.8, revenue: 18360, qualityGrade: 'Grade A+' },
    { year: '2026 (Est)', actualYield: 5.6, regionalAvg: 4.0, revenue: 20720, qualityGrade: 'Projected' },
  ];

  // Planned vs Actual Fertilizer Application Volumes Data (Growth Season)
  const fertilizerVolumeData = [
    { stage: 'Germination', planned: 2.5, actual: 2.5, formula: 'NPK 19-19-19', status: 'Completed' },
    { stage: 'Vegetative', planned: 6.0, actual: 5.8, formula: 'Urea (46% N)', status: 'Completed' },
    { stage: 'Flowering', planned: 4.5, actual: 4.5, formula: 'Calcium Nitrate', status: 'Active Stage' },
    { stage: 'Fruiting', planned: 5.0, actual: 3.2, formula: 'SOP (0-0-50)', status: 'In Progress' },
    { stage: 'Maturation', planned: 3.0, actual: 0.0, formula: 'Micronutrient Mix', status: 'Scheduled' },
  ];

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-surface/95 backdrop-blur-md p-3 rounded-xl border border-outline-variant/30 shadow-lg text-[12px] space-y-1 z-30">
          <p className="font-title-md font-bold text-on-surface">
            {`${label} ${dataPoint.formula ? `- ${dataPoint.formula}` : dataPoint.stage ? `(${dataPoint.stage})` : ''}`}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-on-surface-variant">{entry.name}:</span>
              <span className="font-bold text-on-surface">{entry.value} {dataPoint.planned ? 'kg/acre' : ''}</span>
            </div>
          ))}
          {dataPoint.status && (
            <p className="text-[10.5px] font-bold text-primary pt-1 border-t border-outline-variant/20">
              Status: {dataPoint.status}
            </p>
          )}
          {dataPoint.note && (
            <p className="text-[10px] text-tertiary italic pt-1 border-t border-outline-variant/20">
              {dataPoint.note}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col w-full gap-5 px-margin-mobile pt-4 pb-32 animate-fade-in max-w-md mx-auto relative">
      {/* Field Overview Header Card */}
      <div className="bg-surface-container rounded-[2rem] p-6 relative overflow-hidden shadow-sm border border-outline-variant/30">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-sm text-[11px] font-bold tracking-widest uppercase">
                {location}
              </span>
              <span className="text-on-surface-variant font-label-sm text-[12px]">
                Planted {plantedDays} days ago
              </span>
            </div>
            <h1 className="font-display-lg text-headline-lg-mobile text-on-surface font-bold">
              {cropName}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {onDeleteCrop && crop && (
              <button
                onClick={() => setShowDeleteModal(true)}
                title="Delete Crop Field"
                className="w-9 h-9 bg-error-container/30 text-error rounded-full flex items-center justify-center hover:bg-error-container hover:text-on-error-container transition-colors shadow-2xs"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            )}
            {onNavigate && (
              <button
                onClick={() => onNavigate('crops')}
                className="w-9 h-9 bg-surface-container-high rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-colors shadow-2xs"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Circular Score Gauge & Progress Bars */}
        <div className="flex items-center gap-6 relative z-10">
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                className="text-surface-variant"
                cx="50"
                cy="50"
                fill="none"
                r="44"
                stroke="currentColor"
                strokeWidth="8"
              />
              <circle
                className="text-secondary-fixed-dim drop-shadow-sm"
                cx="50"
                cy="50"
                fill="none"
                r="44"
                stroke="currentColor"
                strokeDasharray="276.4"
                strokeDashoffset={276.4 - (276.4 * score) / 100}
                strokeLinecap="round"
                strokeWidth="8"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display-lg text-headline-lg-mobile text-on-surface font-bold">
                {score}
              </span>
              <span className="font-label-sm text-on-surface-variant text-[11px]">/100</span>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <div className="flex justify-between font-label-sm mb-1 text-[12px]">
                <span className="text-on-surface-variant">Leaf Health</span>
                <span className="text-primary font-bold">92%</span>
              </div>
              <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                <div className="h-full bg-secondary-fixed-dim rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-label-sm mb-1 text-[12px]">
                <span className="text-on-surface-variant">Weather Risk</span>
                <span className="text-tertiary-container font-bold">20%</span>
              </div>
              <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                <div className="h-full bg-tertiary-fixed-dim rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-label-sm mb-1 text-[12px]">
                <span className="text-on-surface-variant">Disease Risk</span>
                <span className="text-primary font-bold">10%</span>
              </div>
              <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                <div className="h-full bg-secondary-fixed-dim rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Growth Stage Timeline Indicator */}
        <div className="mt-5 pt-4 border-t border-outline-variant/20 relative z-10">
          <div className="flex justify-between items-end mb-4">
            <span className="font-title-md text-[14px] font-bold text-on-surface">Growth Timeline</span>
            <span className="font-label-sm text-[12px] text-on-surface-variant font-medium">Day {plantedDays} / 100</span>
          </div>
          
          <div className="relative w-full mt-2 pb-6 px-3">
            <div className="relative w-full h-1.5 bg-surface-variant rounded-full">
              <div 
                className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min(100, Math.max(0, (plantedDays / 100) * 100))}%` }}
              ></div>
              
              {/* Stage Markers */}
              {[
                { label: 'Germ.', day: 0, percent: 0 },
                { label: 'Veg.', day: 15, percent: 15 },
                { label: 'Flower', day: 35, percent: 35 },
                { label: 'Fruit', day: 55, percent: 55 },
                { label: 'Mature', day: 80, percent: 80 },
                { label: 'Harvest', day: 100, percent: 100 }
              ].map((stage, i, arr) => {
                const isPast = plantedDays >= stage.day;
                const isCurrent = plantedDays >= stage.day && (i === arr.length - 1 || plantedDays < arr[i + 1].day);
                
                return (
                  <div 
                    key={stage.label} 
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center"
                    style={{ left: `${stage.percent}%` }}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border-[2.5px] bg-surface transition-all duration-500 z-10 ${isPast ? 'border-primary' : 'border-outline-variant'} ${isCurrent ? 'bg-primary border-primary scale-[1.3]' : ''}`}></div>
                    <span className={`absolute top-4 text-[10.5px] font-bold whitespace-nowrap transition-colors ${isCurrent ? 'text-primary' : 'text-on-surface-variant'} ${i === 0 ? 'translate-x-2' : i === arr.length - 1 ? '-translate-x-2' : ''}`}>{stage.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Professional CSV Report Export Button */}
        <div className="mt-2 pt-4 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">
              csv
            </span>
            <div className="text-left">
              <span className="font-title-md text-[13px] font-bold text-on-surface block">
                Professional Agronomy Report
              </span>
              <span className="font-body-md text-[11px] text-on-surface-variant block">
                Export soil moisture, pH, NPK & fertilizer telemetry to CSV
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExportCSVReport}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-primary text-on-primary font-title-md text-[13px] font-bold shadow-xs hover:bg-primary-container active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* FEATURE: Stage-Based Fertilizer Schedule & Task Tracker */}
      <div className="bg-surface-container-lowest rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30 flex flex-col gap-5">
        {/* Module Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                water_drop
              </span>
            </div>
            <div>
              <h2 className="font-title-md text-on-surface font-bold text-[16px]">
                Fertilizer Reminders
              </h2>
              <p className="font-body-md text-on-surface-variant text-[12px]">
                Stage-based crop nutrition & task tracking
              </p>
            </div>
          </div>

          <button
            onClick={() => handleOpenModalForStage(currentStage)}
            className="flex items-center gap-1.5 bg-primary text-on-primary hover:bg-primary/90 px-3 py-1.5 rounded-full font-label-sm text-[12px] font-semibold active:scale-95 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add Task
          </button>
        </div>

        {/* Current Growth Stage Stepper Progress */}
        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              Growth Stage Tracker
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-[11px] font-bold">
              Active Stage: {currentStage} ({plantedDays} days)
            </span>
          </div>

          {/* Stepper Dots */}
          <div className="grid grid-cols-5 gap-1 pt-1">
            {STAGE_FERTILIZER_GUIDE.map((g, idx) => {
              const isActive = g.stage === currentStage;
              const isPast =
                (currentStage === 'Vegetative' && idx < 1) ||
                (currentStage === 'Flowering' && idx < 2) ||
                (currentStage === 'Fruiting' && idx < 3) ||
                (currentStage === 'Maturation' && idx < 4);

              return (
                <div
                  key={g.stage}
                  onClick={() => setSelectedGuideStage(g.stage)}
                  className={`flex flex-col items-center gap-1.5 cursor-pointer group ${
                    isActive ? 'scale-105' : 'opacity-80'
                  }`}
                >
                  <div
                    className={`w-full h-2 rounded-full transition-all ${
                      isActive
                        ? 'bg-primary ring-2 ring-primary/30'
                        : isPast
                        ? 'bg-secondary'
                        : 'bg-surface-variant'
                    }`}
                  />
                  <span
                    className={`font-label-sm text-[10px] text-center truncate w-full ${
                      isActive
                        ? 'font-bold text-primary'
                        : isPast
                        ? 'font-medium text-on-surface'
                        : 'text-outline'
                    }`}
                  >
                    {g.stage}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Agronomic Guide Recommendations for Selected Stage */}
        <div className="bg-surface-container p-4 rounded-2xl border border-outline-variant/20 flex flex-col gap-2.5">
          {(() => {
            const guide =
              STAGE_FERTILIZER_GUIDE.find((g) => g.stage === selectedGuideStage) ||
              STAGE_FERTILIZER_GUIDE[2];

            return (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px]">
                      spa
                    </span>
                    <span className="font-title-md text-[14px] font-bold text-on-surface">
                      {guide.stage} Stage Recommendation
                    </span>
                  </div>
                  <span className="font-label-sm text-[11px] text-outline font-medium">
                    {guide.daysRange}
                  </span>
                </div>

                <div className="bg-surface p-3 rounded-xl border border-outline-variant/15 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-title-md text-[13.5px] font-bold text-primary block">
                        {guide.recommended}
                      </span>
                      <span className="font-body-md text-[12px] text-on-surface-variant block mt-0.5">
                        🎯 {guide.purpose}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        handleOpenModalForStage(guide.stage as FertilizerTask['growthStage'], guide.recommended)
                      }
                      className="shrink-0 px-2.5 py-1 bg-secondary-container hover:bg-secondary-container/80 text-on-secondary-container rounded-lg font-label-sm text-[11px] font-bold active:scale-95 transition-all shadow-2xs"
                    >
                      + Schedule
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-outline-variant/10 text-[11px] text-outline">
                    <span className="material-symbols-outlined text-[14px]">science</span>
                    <span>Method: {guide.method}</span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* Active Field Reminders List */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-title-md text-[14px] font-bold text-on-surface">
              Scheduled Field Tasks ({fieldTasks.length})
            </span>
            {fieldTasks.length > 0 && (
              <span className="font-label-sm text-[11px] text-outline">
                {fieldTasks.filter((t) => t.completed).length}/{fieldTasks.length} Done
              </span>
            )}
          </div>

          {fieldTasks.length === 0 ? (
            <div className="p-6 bg-surface-container-low rounded-2xl text-center border border-dashed border-outline-variant/40 flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-[32px] text-outline">
                event_available
              </span>
              <p className="font-body-md text-[13px] text-on-surface-variant font-medium">
                No fertilizer tasks scheduled for {cropName} yet.
              </p>
              <button
                onClick={() => handleOpenModalForStage(currentStage)}
                className="mt-1 px-4 py-2 bg-primary text-on-primary rounded-full font-label-sm text-[12px] font-bold shadow-xs active:scale-95 transition-all"
              >
                + Create Fertilizer Reminder
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {fieldTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 relative ${
                    task.completed
                      ? 'bg-surface-container-low border-outline-variant/20 opacity-70'
                      : 'bg-surface border-outline-variant/30 shadow-2xs'
                  }`}
                >
                  {/* Task Checkbox */}
                  <button
                    onClick={() => onToggleTask && onToggleTask(task.id)}
                    className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      task.completed
                        ? 'bg-secondary text-on-secondary shadow-xs'
                        : 'border-2 border-outline hover:border-primary text-transparent'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-title-md text-[14px] font-bold truncate ${
                          task.completed ? 'line-through text-outline' : 'text-on-surface'
                        }`}
                      >
                        {task.fertilizerName}
                      </span>
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-tertiary-container/30 text-tertiary font-label-sm text-[10.5px] font-bold">
                        {task.dueDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-md font-label-sm text-[10px] font-bold">
                        {task.growthStage} Stage
                      </span>
                      <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant rounded-md font-label-sm text-[10px] font-semibold">
                        {task.dosage}
                      </span>
                      <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant rounded-md font-label-sm text-[10px] font-semibold">
                        {task.applicationMethod}
                      </span>
                    </div>

                    {task.notes && (
                      <p className="font-body-md text-[11.5px] text-on-surface-variant mt-1.5 italic line-clamp-2">
                        "{task.notes}"
                      </p>
                    )}
                  </div>

                  {/* Delete Task Button */}
                  {onDeleteTask && (
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="text-outline hover:text-error p-1 rounded-full active:scale-95 transition-colors"
                      title="Delete Reminder"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Add Fertilizer Reminder */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-surface rounded-t-[28px] sm:rounded-[28px] p-6 w-full max-w-md border border-outline-variant/30 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  alarm_add
                </span>
                <h3 className="font-title-md text-[17px] font-bold text-on-surface">
                  Set Fertilizer Reminder
                </h3>
              </div>
              <button
                onClick={() => setShowTaskModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="flex flex-col gap-3.5">
              {/* Crop Field Info */}
              <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 flex items-center justify-between">
                <div>
                  <span className="font-label-sm text-[11px] text-outline uppercase block">Crop Field</span>
                  <span className="font-title-md text-[14px] font-bold text-on-surface">{cropName}</span>
                </div>
                <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full font-label-sm text-[11px] font-bold">
                  Day {plantedDays}
                </span>
              </div>

              {/* Growth Stage Dropdown */}
              <div>
                <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                  Growth Stage
                </label>
                <select
                  value={formStage}
                  onChange={(e) => setFormStage(e.target.value as any)}
                  className="w-full bg-surface-container p-3 rounded-xl font-body-md text-[14px] text-on-surface border border-outline-variant/30 outline-none focus:border-primary"
                >
                  <option value="Germination">Germination Stage (0-14 days)</option>
                  <option value="Vegetative">Vegetative Stage (15-35 days)</option>
                  <option value="Flowering">Flowering Stage (36-55 days)</option>
                  <option value="Fruiting">Fruiting Stage (56-80 days)</option>
                  <option value="Maturation">Maturation Stage (81+ days)</option>
                </select>
              </div>

              {/* Fertilizer Name & Presets */}
              <div>
                <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                  Fertilizer / Nutrient Formula
                </label>
                <input
                  type="text"
                  value={formFertilizer}
                  onChange={(e) => setFormFertilizer(e.target.value)}
                  placeholder="e.g. NPK 19-19-19 + Micronutrients"
                  required
                  className="w-full bg-surface-container p-3 rounded-xl font-body-md text-[14px] text-on-surface border border-outline-variant/30 outline-none focus:border-primary mb-2"
                />

                {/* Quick Presets */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    'NPK 19-19-19',
                    'Urea (46% N)',
                    'Calcium Nitrate',
                    'Organic Neem Cake',
                    'Micronutrient Mix',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormFertilizer(preset)}
                      className="shrink-0 px-2.5 py-1 bg-surface-container-high hover:bg-surface-container-highest rounded-lg font-label-sm text-[11px] text-on-surface-variant font-medium transition-all"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Application Method */}
              <div>
                <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                  Application Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Drip Fertigation',
                    'Foliar Spray',
                    'Soil Drenching',
                    'Basal Application',
                  ].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setFormMethod(method as any)}
                      className={`p-2.5 rounded-xl font-label-sm text-[12px] font-semibold border transition-all text-center ${
                        formMethod === method
                          ? 'bg-primary text-on-primary border-primary shadow-xs'
                          : 'bg-surface-container text-on-surface-variant border-outline-variant/20 hover:border-outline'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dosage & Due Date Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                    Dosage / Quantity
                  </label>
                  <input
                    type="text"
                    value={formDosage}
                    onChange={(e) => setFormDosage(e.target.value)}
                    placeholder="e.g. 5 kg / acre"
                    className="w-full bg-surface-container p-3 rounded-xl font-body-md text-[13.5px] text-on-surface border border-outline-variant/30 outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                    Due Date / Remind In
                  </label>
                  <select
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full bg-surface-container p-3 rounded-xl font-body-md text-[13.5px] text-on-surface border border-outline-variant/30 outline-none focus:border-primary"
                  >
                    <option value="Today">Today</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="In 3 days">In 3 days</option>
                    <option value="In 1 week">In 1 week</option>
                    <option value="In 2 weeks">In 2 weeks</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="font-label-sm text-[12px] font-bold text-on-surface block mb-1">
                  Agronomic Notes (Optional)
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Apply during late afternoon to prevent evaporation..."
                  rows={2}
                  className="w-full bg-surface-container p-3 rounded-xl font-body-md text-[13.5px] text-on-surface border border-outline-variant/30 outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-title-md text-[15px] font-bold shadow-md active:scale-95 transition-all mt-1"
              >
                Save Fertilizer Reminder
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Recharts Analytics Module: Growth Cycle, Historical Yield & Fertilizer Application */}
      <div className="bg-surface-container-lowest rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30 flex flex-col gap-4">
        {/* Module Header with Mode Switcher */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-title-md text-on-surface font-bold text-[17px]">
                {chartMode === 'growth'
                  ? 'Growth Cycle Analytics'
                  : chartMode === 'yield'
                  ? 'Historical Yield Trends'
                  : 'Fertilizer Application Volume'}
              </h2>
              <p className="font-body-md text-on-surface-variant text-[12px]">
                {chartMode === 'growth'
                  ? 'Real-time crop stage progression vs AI benchmarks'
                  : chartMode === 'yield'
                  ? 'Multi-year production & yield rate (Tons/Acre)'
                  : 'Planned vs actual fertilizer volume across growth season (kg/acre)'}
              </p>
            </div>
          </div>

          {/* 3 Tab Controls */}
          <div className="grid grid-cols-3 p-1 bg-surface-container-low rounded-2xl border border-outline-variant/20">
            <button
              onClick={() => setChartMode('growth')}
              className={`py-2 px-1.5 rounded-xl font-label-sm text-[11.5px] font-semibold transition-all flex items-center justify-center gap-1 ${
                chartMode === 'growth'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">show_chart</span>
              Growth
            </button>

            <button
              onClick={() => setChartMode('yield')}
              className={`py-2 px-1.5 rounded-xl font-label-sm text-[11.5px] font-semibold transition-all flex items-center justify-center gap-1 ${
                chartMode === 'yield'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">finance</span>
              Yields
            </button>

            <button
              onClick={() => setChartMode('fertilizer')}
              className={`py-2 px-1.5 rounded-xl font-label-sm text-[11.5px] font-semibold transition-all flex items-center justify-center gap-1 ${
                chartMode === 'fertilizer'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">compost</span>
              Fertilizer
            </button>
          </div>

          {/* Sub-Metric Toggle for Growth Mode */}
          {chartMode === 'growth' && (
            <div className="flex items-center justify-between pt-1">
              <span className="font-label-sm text-[11px] text-on-surface-variant font-medium">
                Metric Display:
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setMetricType('health')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                    metricType === 'health'
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  Health Index
                </button>
                <button
                  onClick={() => setMetricType('height')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                    metricType === 'height'
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  Canopy Height (cm)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recharts Chart Canvas */}
        <div className="w-full h-60 pt-2 pr-1">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'growth' ? (
              <LineChart data={growthCycleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  domain={metricType === 'health' ? [50, 100] : [0, 100]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  iconType="circle"
                />

                {metricType === 'health' ? (
                  <>
                    <Line
                      type="monotone"
                      dataKey="health"
                      name="Crop Health"
                      stroke="#166534"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#166534', strokeWidth: 2, stroke: '#ffffff' }}
                      activeDot={{ r: 7, fill: '#166534' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="benchmarkHealth"
                      name="AI Ideal Target"
                      stroke="#eab308"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </>
                ) : (
                  <>
                    <Line
                      type="monotone"
                      dataKey="height"
                      name="Plant Height (cm)"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#ffffff' }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="canopy"
                      name="Canopy Cover %"
                      stroke="#059669"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                      dot={false}
                    />
                  </>
                )}

                <ReferenceLine x="W5" stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Risk Alert', fill: '#ef4444', fontSize: 10, position: 'top' }} />
              </LineChart>
            ) : chartMode === 'yield' ? (
              <LineChart data={historicalYieldData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[2.5, 6.5]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  iconType="circle"
                />

                <Line
                  type="monotone"
                  dataKey="actualYield"
                  name="Field Yield (T/Acre)"
                  stroke="#0284c7"
                  strokeWidth={3.5}
                  dot={{ r: 5, fill: '#0284c7', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="regionalAvg"
                  name="District Avg"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            ) : (
              /* Planned vs Actual Fertilizer Application Bar Chart */
              <BarChart data={fertilizerVolumeData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis
                  dataKey="stage"
                  tick={{ fontSize: 10.5, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  unit=" kg"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  iconType="rect"
                />
                <Bar
                  dataKey="planned"
                  name="Planned Target (kg/acre)"
                  fill="#166534"
                  radius={[5, 5, 0, 0]}
                />
                <Bar
                  dataKey="actual"
                  name="Actual Applied (kg/acre)"
                  fill="#0284c7"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Quick Insights Footnote */}
        <div className="bg-surface-container-low p-3.5 rounded-2xl flex items-center gap-3 border border-outline-variant/20">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
            <span className="material-symbols-outlined text-[18px]">
              {chartMode === 'fertilizer' ? 'science' : 'insights'}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-label-sm text-[12px] font-bold text-on-surface">
              {chartMode === 'growth'
                ? `Growth Stage: ${currentStage}`
                : chartMode === 'yield'
                ? 'Yield Projection: +9.8% YoY'
                : 'Fertilizer Compliance Rate: 92%'}
            </p>
            <p className="font-body-md text-[11px] text-on-surface-variant">
              {chartMode === 'growth'
                ? 'Current canopy density exceeds benchmark by 4%. Sowing cycle complete.'
                : chartMode === 'yield'
                ? 'Projected 5.6 Tons/Acre harvest driven by timely fungicide treatment.'
                : '16.0 kg of 21.0 kg season target applied to date. High NPK efficiency.'}
            </p>
          </div>
        </div>
      </div>

      {/* Harvest Planning Feature: Optimal Harvest Windows & Timeline */}
      <HarvestPlanningTimeline crop={crop} />

      {/* Interactive Yield Estimation & Benchmarking Module */}
      <YieldEstimationModule
        crop={crop}
        onSaveYieldEstimate={(val, total) =>
          triggerToast(`Yield target updated to ${val} / acre (${total} total harvest)`)
        }
      />

      {/* Soil Health Module: Moisture, pH, and NPK Level Tracking */}
      <SoilHealthTracker crop={crop} onExportCSV={handleExportCSVReport} />

      {/* Treatment Efficacy Interactive Comparison Slider */}
      <div className="bg-surface-container-lowest rounded-[24px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30">
        <h2 className="font-title-md text-on-surface font-bold text-[17px] mb-1">Treatment Efficacy</h2>
        <p className="font-body-md text-on-surface-variant text-[13px] mb-4">
          Visual recovery of early blight after Copper Fungicide application. Slide to compare.
        </p>

        <div
          onMouseDown={(e) => {
            setIsDragging(true);
            handleSliderMove(e.clientX, e.currentTarget.getBoundingClientRect());
          }}
          onMouseMove={(e) => {
            if (isDragging) handleSliderMove(e.clientX, e.currentTarget.getBoundingClientRect());
          }}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onTouchMove={(e) => handleSliderMove(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())}
          className="relative w-full h-52 rounded-2xl overflow-hidden group select-none cursor-ew-resize border border-outline-variant/30 shadow-xs"
        >
          {/* AFTER Image */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDn1n1i2G4HXu-xwF2JQ0wAWwBWsN49F970eJ3tQ_jg0SvtTc8G64ydT1sqNxHr54z9DhqFnCEaYokFVrP_wqAPBh42sTsK9PtXFpaoeBQS-q9yoZdQAvg6b5pa2bq5hBCtuC_DY0Bkx3ixdulOp5SRoRemM5dWB1TZ3KhCXkXCBWkoFRvg1v9ZZHSrbFLcjBt5S04jw2p5MLnVfb13qGpqNRAC2lrRdvGrecRqJQQr5Ks8sFrQ7vvI')`,
            }}
          />

          {/* BEFORE Image */}
          <div
            className="absolute inset-y-0 left-0 h-full overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <div
              className="absolute inset-y-0 left-0 h-full w-[380px] sm:w-[420px] bg-cover bg-center"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAg0YJl8NxxbAabeArLYTUarbdZlMnX_d0VzES-QkfKaEtZK4yN6q8MXzKHnZ0OkiubzR5Jzj6YokyCBXyj9sSSqR7ZqRfp_JC-myRbQ-ItfwCp44URVNKBYq-tA6VsMG-4tEtIm4eVpn2pcyKMmWDeiI_GXUQW_XKjWmTGy2EXCD0ys9ID1Y0u0csmBSSKISYmwvX25eDuQVu47Y_wT8uloxS-tZ4JrypAlinLAOEjPG4arBbFbNRZ')`,
              }}
            />
          </div>

          {/* Draggable Divider Handle */}
          <div
            className="absolute inset-y-0 w-1 bg-white shadow-lg cursor-ew-resize flex items-center justify-center z-10"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="w-8 h-8 bg-surface rounded-full shadow-lg flex items-center justify-center text-primary border border-outline-variant/30">
              <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
            </div>
          </div>

          {/* Labels */}
          <div className="absolute bottom-2.5 left-2.5 bg-surface/85 backdrop-blur-md px-2.5 py-1 rounded-md font-label-sm text-[11px] text-on-surface font-semibold shadow-xs">
            Before
          </div>
          <div className="absolute bottom-2.5 right-2.5 bg-surface/85 backdrop-blur-md px-2.5 py-1 rounded-md font-label-sm text-[11px] text-on-surface font-semibold shadow-xs">
            After
          </div>
        </div>
      </div>

      {/* AI Crop Journey Timeline */}
      <div className="bg-surface-container-lowest rounded-[24px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30">
        <h2 className="font-title-md text-on-surface font-bold text-[17px] mb-6">Crop Journey</h2>
        <div className="relative pl-4 space-y-6">
          <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-surface-variant"></div>

          <div className="relative flex items-start gap-4">
            <div className="w-3.5 h-3.5 rounded-full bg-primary ring-4 ring-primary-fixed z-10 mt-1 flex-shrink-0"></div>
            <div>
              <h3 className="font-title-md text-on-surface text-[15px] font-semibold">
                Health Stabilized
              </h3>
              <p className="font-label-sm text-on-surface-variant mt-0.5 text-[12px]">
                Today • Score {score}/100
              </p>
              <div className="mt-2 bg-surface-container-low p-3 rounded-xl border-l-4 border-primary">
                <p className="font-body-md text-on-surface text-[13px] leading-relaxed">
                  New growth shows zero signs of infection. Continue regular irrigation and scheduled fertilizer applications.
                </p>
              </div>
            </div>
          </div>

          <div className="relative flex items-start gap-4">
            <div className="w-3.5 h-3.5 rounded-full bg-surface-variant ring-4 ring-surface z-10 mt-1 flex-shrink-0"></div>
            <div>
              <h3 className="font-title-md text-on-surface text-[15px] font-semibold">
                Treatment Applied
              </h3>
              <p className="font-label-sm text-on-surface-variant mt-0.5 text-[12px]">5 days ago</p>
              <p className="font-body-md text-on-surface-variant mt-0.5 text-[13px]">
                Copper Fungicide sprayed across field block.
              </p>
            </div>
          </div>

          <div className="relative flex items-start gap-4">
            <div className="w-3.5 h-3.5 rounded-full bg-error ring-4 ring-error-container z-10 mt-1 flex-shrink-0"></div>
            <div>
              <h3 className="font-title-md text-on-surface text-[15px] font-semibold">
                Early Blight Detected
              </h3>
              <p className="font-label-sm text-on-surface-variant mt-0.5 text-[12px]">
                7 days ago • Score dropped to 62/100
              </p>
            </div>
          </div>

          <div className="relative flex items-start gap-4">
            <div className="w-3.5 h-3.5 rounded-full bg-surface-variant ring-4 ring-surface z-10 mt-1 flex-shrink-0"></div>
            <div>
              <h3 className="font-title-md text-on-surface text-[15px] font-semibold">
                Seedlings Planted
              </h3>
              <p className="font-label-sm text-on-surface-variant mt-0.5 text-[12px]">
                {plantedDays} days ago
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Confirmation Popup */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-[13px] font-medium px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 border border-white/10 animate-fade-in max-w-[90vw] text-center">
          <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Delete Field Confirmation Modal */}
      {showDeleteModal && crop && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-[28px] p-6 w-full max-w-sm shadow-2xl border border-outline-variant/40 animate-fade-in flex flex-col gap-4">
            <div className="flex items-center gap-3 text-error">
              <div className="w-10 h-10 rounded-full bg-error-container/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">delete_forever</span>
              </div>
              <h3 className="font-headline-lg-mobile text-on-surface font-bold text-[18px]">Delete Field?</h3>
            </div>

            <p className="font-body-md text-on-surface-variant text-[14px]">
              Are you sure you want to delete <strong className="text-on-surface">{crop.name}</strong> ({crop.location})? All soil telemetry and fertilizer tasks for this field will be permanently erased.
            </p>

            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 rounded-full bg-surface-container text-on-surface font-title-md text-[14px] font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteCrop) {
                    onDeleteCrop(crop.id);
                  }
                  setShowDeleteModal(false);
                  if (onNavigate) {
                    onNavigate('crops');
                  }
                }}
                className="flex-1 py-3 rounded-full bg-error text-on-error font-title-md text-[14px] font-bold shadow-md hover:bg-error/90"
              >
                Delete Field
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
