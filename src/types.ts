export type ViewState =
  | 'home'
  | 'crops'
  | 'scan'
  | 'analyzing'
  | 'results'
  | 'assistant'
  | 'profile'
  | 'alerts'
  | 'onboarding'
  | 'language'
  | 'field-details'
  | 'login';

export type Language = 'English' | 'Kannada' | 'Hindi' | 'Telugu' | 'Tamil' | 'Marathi';

export interface Crop {
  id: string;
  name: string;
  location: string;
  healthScore: number; // 0 - 100
  lastScanned: string;
  image: string;
  status: 'Healthy' | 'Warning' | 'Critical';
  plantedDaysAgo: number;
  leafHealth: number;
  weatherRisk: number;
  diseaseRisk: number;
  healthTrend: number[]; // e.g. [80, 85, 62, 75, 87]
}

export type CropField = Crop;


export interface Symptom {
  title: string;
  description: string;
  type: 'error' | 'warning' | 'info';
}

export interface ActionStep {
  step: number;
  title: string;
  description: string;
}

export interface DiagnosticResult {
  cropName: string;
  identifiedCrop?: string;
  scanTime: string;
  disease: string;
  scientificName: string;
  confidence: number;
  severity: 'Low' | 'Moderate' | 'High';
  plantVitality: number;
  symptoms: Symptom[];
  actionPlan: ActionStep[];
  image: string;
  summary: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  image?: string;
}

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  type: 'weather' | 'ai' | 'task' | 'system' | 'logistics';
  category: string; // e.g. WEATHER RISK, AI ANALYSIS
  time: string;
  dateGroup: 'Today' | 'Earlier';
  severity?: 'critical' | 'normal' | 'info';
  actionable?: boolean;
  completed?: boolean;
}

export interface FertilizerTask {
  id: string;
  cropId: string;
  cropName: string;
  growthStage: 'Germination' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Maturation';
  fertilizerName: string;
  dosage: string;
  applicationMethod: 'Soil Drenching' | 'Foliar Spray' | 'Drip Fertigation' | 'Basal Application';
  dueDate: string;
  daysFromPlanting: number;
  completed: boolean;
  notes?: string;
}

export interface FarmerProfile {
  name: string;
  location: string;
  avatar: string;
  totalScans: number;
  activeCropsCount: number;
  avgHealthScore: number;
  farmSizeAcres: number;
  primaryCrops: string[];
  notificationsOn: boolean;
  darkMode: boolean;
  language: Language;
  phone?: string;
  email?: string;
  soilType?: string;
  isLoggedIn?: boolean;
}
