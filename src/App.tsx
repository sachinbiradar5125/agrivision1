import React, { useState, useEffect } from 'react';
import { ViewState, FarmerProfile, CropField, DiagnosticResult, AlertItem, FertilizerTask } from './types';
import { INITIAL_PROFILE, MOCK_CROPS, MOCK_ALERTS, DEFAULT_DIAGNOSIS, INITIAL_FERTILIZER_TASKS } from './data';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';

import { HomeView } from './views/HomeView';
import { ScanView } from './views/ScanView';
import { AnalyzingView } from './views/AnalyzingView';
import { ResultsView } from './views/ResultsView';
import { AssistantView } from './views/AssistantView';
import { CropsView } from './views/CropsView';
import { FieldDetailsView } from './views/FieldDetailsView';
import { ProfileView } from './views/ProfileView';
import { AlertsView } from './views/AlertsView';
import { OnboardingView } from './views/OnboardingView';
import { LanguageView } from './views/LanguageView';
import { LoginView } from './views/LoginView';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewState>(() => {
    try {
      const saved = localStorage.getItem('agrivision_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isLoggedIn) return 'home';
      }
    } catch {
      // fallback
    }
    return 'login';
  });
  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);

  // User Profile State
  const [profile, setProfile] = useState<FarmerProfile>(() => {
    try {
      const saved = localStorage.getItem('agrivision_profile');
      return saved ? JSON.parse(saved) : INITIAL_PROFILE;
    } catch {
      return INITIAL_PROFILE;
    }
  });

  // Save profile changes and apply dark mode class
  useEffect(() => {
    try {
      localStorage.setItem('agrivision_profile', JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }

    if (profile.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile]);

  const handleToggleTheme = () => {
    setProfile((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  };

  // Crops & Fields State
  const [crops, setCrops] = useState<CropField[]>(() => {
    try {
      const saved = localStorage.getItem('agrivision_crops');
      return saved ? JSON.parse(saved) : MOCK_CROPS;
    } catch {
      return MOCK_CROPS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('agrivision_crops', JSON.stringify(crops));
    } catch (e) {
      console.error('Failed to save crops', e);
    }
  }, [crops]);

  // Alerts State
  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    try {
      const saved = localStorage.getItem('agrivision_alerts');
      return saved ? JSON.parse(saved) : MOCK_ALERTS;
    } catch {
      return MOCK_ALERTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('agrivision_alerts', JSON.stringify(alerts));
    } catch (e) {
      console.error('Failed to save alerts', e);
    }
  }, [alerts]);

  // Fertilizer Application Tasks State
  const [fertilizerTasks, setFertilizerTasks] = useState<FertilizerTask[]>(() => {
    try {
      const saved = localStorage.getItem('agrivision_fertilizer_tasks');
      return saved ? JSON.parse(saved) : INITIAL_FERTILIZER_TASKS;
    } catch {
      return INITIAL_FERTILIZER_TASKS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('agrivision_fertilizer_tasks', JSON.stringify(fertilizerTasks));
    } catch (e) {
      console.error('Failed to save fertilizer tasks', e);
    }
  }, [fertilizerTasks]);

  const handleToggleFertilizerTask = (taskId: string) => {
    setFertilizerTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddFertilizerTask = (newTask: FertilizerTask) => {
    setFertilizerTasks((prev) => [newTask, ...prev]);

    // Generate synced notification alert
    const newAlert: AlertItem = {
      id: `alert-ftask-${Date.now()}`,
      title: `Fertilizer Task Scheduled: ${newTask.fertilizerName}`,
      description: `For ${newTask.cropName} (${newTask.growthStage} stage). Dosage: ${newTask.dosage} via ${newTask.applicationMethod}. Due: ${newTask.dueDate}.`,
      time: 'Just now',
      category: 'FERTILIZER TASK',
      type: 'task',
      severity: 'normal',
      dateGroup: 'Today',
      actionable: true,
      completed: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleDeleteFertilizerTask = (taskId: string) => {
    setFertilizerTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Diagnostic Scan Results State
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(DEFAULT_DIAGNOSIS);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // View Navigation Handler
  const handleNavigate = (view: ViewState, cropId?: string) => {
    if (cropId) {
      setSelectedCropId(cropId);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Diagnostic Flow Handlers
  const handleScanCaptured = (imageData: string) => {
    setCapturedImage(imageData);
    setCurrentView('analyzing');
  };

  const handleAnalysisComplete = (result: DiagnosticResult) => {
    setDiagnosticResult(result);
    setCurrentView('results');

    // Add alert for high risk diagnosis
    if (result.confidence > 70 && result.disease !== 'Healthy') {
      const actionText = result.actionPlan?.[0]?.title || 'Follow treatment steps';
      const newAlert: AlertItem = {
        id: `alert-${Date.now()}`,
        title: `${result.disease} Detected`,
        description: `AI detected ${result.disease} on ${result.cropName} (${result.confidence}% confidence). Recommended: ${actionText}.`,
        time: 'Just now',
        category: 'AI DIAGNOSTIC',
        severity: 'critical',
        dateGroup: 'Today',
        actionable: true,
        type: 'ai',
      };
      setAlerts((prev) => [newAlert, ...prev]);
    }
  };

  // Profile Update
  const handleUpdateProfile = (updates: Partial<FarmerProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  // Add Crop Field
  const handleAddCrop = (newCrop: CropField) => {
    setCrops((prev) => [newCrop, ...prev]);
  };

  // Delete Crop Field
  const handleDeleteCrop = (cropId: string) => {
    setCrops((prev) => prev.filter((c) => c.id !== cropId));
    setFertilizerTasks((prev) => prev.filter((t) => t.cropId !== cropId));
    if (selectedCropId === cropId) {
      setSelectedCropId(null);
    }
  };

  // Reset & Delete All Saved Application Data
  const handleResetAllData = () => {
    try {
      localStorage.removeItem('agrivision_profile');
      localStorage.removeItem('agrivision_crops');
      localStorage.removeItem('agrivision_alerts');
      localStorage.removeItem('agrivision_fertilizer_tasks');
      localStorage.clear();
    } catch (e) {
      console.error('Failed to clear storage', e);
    }
    setProfile({
      name: '',
      location: '',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
      totalScans: 0,
      activeCropsCount: 0,
      avgHealthScore: 0,
      farmSizeAcres: 0,
      primaryCrops: [],
      notificationsOn: true,
      darkMode: false,
      language: 'English',
      phone: '',
      email: '',
      soilType: 'Red Loam Soil',
      isLoggedIn: false,
    });
    setCrops([]);
    setAlerts([]);
    setFertilizerTasks([]);
    setDiagnosticResult(null);
    setCapturedImage(null);
    setSelectedCropId(null);
    setCurrentView('login');
  };

  // Dismiss Alert
  const handleDismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const handleClearAllAlerts = () => {
    setAlerts([]);
  };

  // Selected crop details object
  const selectedCrop = crops.find((c) => c.id === selectedCropId) || crops[0];

  // Views where Header and Navbar should be hidden
  const hideChrome = ['onboarding', 'scan', 'analyzing'].includes(currentView);

  return (
    <div className="min-h-screen bg-neutral-900 text-on-surface font-body flex justify-center selection:bg-primary-container selection:text-on-primary-container">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md min-h-screen bg-background relative shadow-2xl flex flex-col overflow-x-hidden">
        {/* App Header Bar */}
        {!hideChrome && (
          <Header
            profile={profile}
            unreadAlertsCount={alerts.length}
            onNavigate={handleNavigate}
            currentView={currentView}
            onToggleTheme={handleToggleTheme}
            onToggleLanguage={() => handleNavigate('language')}
          />
        )}

        {/* Main View Area */}
        <main className="flex-1 w-full relative flex flex-col">
          {currentView === 'onboarding' && (
            <OnboardingView
              onNavigate={handleNavigate}
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {currentView === 'home' && (
            <HomeView
              onNavigate={handleNavigate}
              profile={profile}
              crops={crops}
              onSelectLanguage={() => handleNavigate('language')}
              tasks={fertilizerTasks}
              onToggleTask={handleToggleFertilizerTask}
            />
          )}

          {currentView === 'scan' && (
            <ScanView
              onNavigate={handleNavigate}
              onCaptureImage={handleScanCaptured}
            />
          )}

          {currentView === 'analyzing' && (
            <AnalyzingView
              capturedImage={capturedImage}
              onNavigate={handleNavigate}
              onAnalysisComplete={handleAnalysisComplete}
            />
          )}

          {currentView === 'results' && (
            <ResultsView
              result={diagnosticResult || DEFAULT_DIAGNOSIS}
              capturedImage={capturedImage}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'assistant' && (
            <AssistantView
              profile={profile}
              onNavigate={handleNavigate}
              initialCropContext={diagnosticResult?.cropName}
            />
          )}

          {currentView === 'crops' && (
            <CropsView
              crops={crops}
              onNavigate={handleNavigate}
              onAddCrop={handleAddCrop}
              onDeleteCrop={handleDeleteCrop}
              tasks={fertilizerTasks}
            />
          )}

          {currentView === 'field-details' && (
            <FieldDetailsView
              crop={selectedCrop}
              tasks={fertilizerTasks}
              onToggleTask={handleToggleFertilizerTask}
              onAddTask={handleAddFertilizerTask}
              onDeleteTask={handleDeleteFertilizerTask}
              onDeleteCrop={handleDeleteCrop}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'profile' && (
            <ProfileView
              profile={profile}
              crops={crops}
              onUpdateProfile={handleUpdateProfile}
              onNavigate={handleNavigate}
              onResetAllData={handleResetAllData}
              onDeleteCrop={handleDeleteCrop}
            />
          )}

          {currentView === 'alerts' && (
            <AlertsView
              alerts={alerts}
              onDismissAlert={handleDismissAlert}
              onClearAll={handleClearAllAlerts}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'language' && (
            <LanguageView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'login' && (
            <LoginView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onNavigate={handleNavigate}
            />
          )}
        </main>

        {/* Bottom Navigation Bar */}
        {!hideChrome && (
          <Navbar
            currentView={currentView}
            onNavigate={handleNavigate}
            unreadAlertsCount={alerts.length}
          />
        )}
      </div>
    </div>
  );
}
