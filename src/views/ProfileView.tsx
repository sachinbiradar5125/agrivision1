import React, { useState, useEffect, useRef } from 'react';
import { ViewState, FarmerProfile, Crop } from '../types';
import { useOnlineStatus } from '../utils/pwa';

interface ProfileViewProps {
  onNavigate: (view: ViewState) => void;
  profile: FarmerProfile;
  crops?: Crop[];
  onUpdateProfile: (updates: Partial<FarmerProfile>) => void;
  onResetAllData?: () => void;
  onDeleteCrop?: (cropId: string) => void;
}

const PRESET_AVATARS = [
  {
    id: 'farmer_m',
    name: 'Farmer Avatar 1',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'farmer_f',
    name: 'Farmer Avatar 2',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'agronomist_m',
    name: 'Agronomist 1',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'agronomist_f',
    name: 'Agronomist 2',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'field_tech',
    name: 'Field Tech',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300',
  },
];

const COMMON_CROPS = [
  'Roma Tomato',
  'Cotton',
  'Wheat',
  'Sugarcane',
  'Maize / Corn',
  'Paddy Rice',
  'Chilli Pepper',
  'Soybean',
  'Red Onion',
  'Potato',
];

const COMMON_LOCATIONS = [
  'Karnataka, India',
  'Maharashtra, India',
  'Punjab, India',
  'Andhra Pradesh, India',
  'Gujarat, India',
  'Telangana, India',
  'Tamil Nadu, India',
  'Madhya Pradesh, India',
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  onNavigate,
  profile,
  crops = [],
  onUpdateProfile,
  onResetAllData,
  onDeleteCrop,
}) => {
  const { isOnline } = useOnlineStatus();
  const [swRegistered, setSwRegistered] = useState(false);
  const [cacheStatus, setCacheStatus] = useState('Checking...');

  // Modal Control States
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showEditDetailsModal, setShowEditDetailsModal] = useState(false);
  const [showScanHistoryModal, setShowScanHistoryModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Hidden File Input Ref for custom avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Farm & Profile Form State
  const [editName, setEditName] = useState(profile.name);
  const [editPhone, setEditPhone] = useState(profile.phone || '+91 98765 43210');
  const [editLocation, setEditLocation] = useState(profile.location);
  const [editFarmSize, setEditFarmSize] = useState<number>(profile.farmSizeAcres || 12.5);
  const [editPrimaryCrops, setEditPrimaryCrops] = useState<string[]>(profile.primaryCrops || []);
  const [customCropInput, setCustomCropInput] = useState('');

  // Sync edit form with profile when modal opens
  useEffect(() => {
    if (showEditDetailsModal) {
      setEditName(profile.name);
      setEditPhone(profile.phone || '+91 98765 43210');
      setEditLocation(profile.location);
      setEditFarmSize(profile.farmSizeAcres || 12.5);
      setEditPrimaryCrops(profile.primaryCrops || []);
    }
  }, [showEditDetailsModal, profile]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        setSwRegistered(!!reg);
      });
    }
    if ('caches' in window) {
      caches.keys().then((keys) => {
        setCacheStatus(`${keys.length} Cache Store(s) Active`);
      });
    } else {
      setCacheStatus('Cache API not supported');
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleClearOfflineCache = async () => {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      setCacheStatus('0 Cache Store(s) Active (Cleared)');
      triggerToast('PWA Offline Cache cleared successfully.');
    }
  };

  // Custom File Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB. Please select a smaller photo.');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          onUpdateProfile({ avatar: dataUrl });
          setShowPhotoModal(false);
          triggerToast('Profile photo updated successfully!');
        }
      };
      reader.onerror = () => {
        alert('Could not read photo file. Please try selecting another photo.');
      };
      reader.readAsDataURL(file);
    }
    // Always reset input value
    e.target.value = '';
  };

  // Select Preset Avatar
  const handleSelectPresetAvatar = (avatarUrl: string) => {
    onUpdateProfile({ avatar: avatarUrl });
    setShowPhotoModal(false);
    triggerToast('Profile photo updated!');
  };

  // Toggle Crop selection in edit form
  const handleToggleCrop = (cropName: string) => {
    if (editPrimaryCrops.includes(cropName)) {
      setEditPrimaryCrops(editPrimaryCrops.filter((c) => c !== cropName));
    } else {
      setEditPrimaryCrops([...editPrimaryCrops, cropName]);
    }
  };

  // Add Custom Crop Tag
  const handleAddCustomCrop = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customCropInput.trim();
    if (trimmed && !editPrimaryCrops.includes(trimmed)) {
      setEditPrimaryCrops([...editPrimaryCrops, trimmed]);
      setCustomCropInput('');
    }
  };

  // Save Profile & Farm Details Form
  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      alert('Please enter a valid farmer name.');
      return;
    }
    if (editFarmSize <= 0) {
      alert('Please enter a valid farm size in acres.');
      return;
    }

    onUpdateProfile({
      name: editName.trim(),
      phone: editPhone.trim(),
      location: editLocation.trim(),
      farmSizeAcres: editFarmSize,
      primaryCrops: editPrimaryCrops.length > 0 ? editPrimaryCrops : ['Roma Tomato'],
    });

    setShowEditDetailsModal(false);
    triggerToast('Farmer profile & farm details updated!');
  };

  return (
    <div className="flex flex-col w-full px-margin-mobile pt-4 pb-32 gap-6 relative max-w-md mx-auto animate-fade-in">
      {/* Decorative gradient glow */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary-fixed/20 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2.5 rounded-full shadow-2xl z-50 flex items-center gap-2 border border-white/20 animate-fade-in text-[12.5px] font-bold">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Profile Header */}
      <div className="flex flex-col items-center justify-center pt-2">
        <div className="relative mb-3.5 group">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-full p-[3px] animate-[spin_8s_linear_infinite]">
            <div className="absolute inset-0 bg-background rounded-full"></div>
          </div>
          <img
            src={profile.avatar}
            alt={profile.name}
            className="relative w-28 h-28 rounded-full object-cover shadow-xl m-[3px] bg-surface-container"
          />
          <button
            onClick={() => setShowPhotoModal(true)}
            className="absolute bottom-0 right-0 w-9 h-9 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform border-2 border-background"
            aria-label="Edit Profile Photo"
            title="Edit Profile Photo"
          >
            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background font-bold">
            {profile.name}
          </h2>
          <button
            onClick={() => setShowEditDetailsModal(true)}
            className="w-7 h-7 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-primary flex items-center justify-center active:scale-95 transition-all"
            title="Edit Name & Details"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-on-surface-variant font-body-md text-[13.5px] mt-0.5">
          <span className="material-symbols-outlined text-[18px] text-primary">location_on</span>
          <span>{profile.location}</span>
        </div>
      </div>

      {/* Stats Bar Bento */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface-container/60 backdrop-blur-md rounded-[22px] p-3.5 flex flex-col items-center justify-center text-center shadow-2xs border-l-[3px] border-l-primary border-outline-variant/20">
          <span className="material-symbols-outlined text-primary mb-1 text-[22px]">qr_code_scanner</span>
          <span className="font-display-lg text-[22px] font-bold text-on-surface mb-0.5">
            {profile.totalScans}
          </span>
          <span className="font-label-sm text-[11px] text-on-surface-variant font-semibold">
            Total Scans
          </span>
        </div>

        <div className="bg-surface-container/60 backdrop-blur-md rounded-[22px] p-3.5 flex flex-col items-center justify-center text-center shadow-2xs border-l-[3px] border-l-secondary border-outline-variant/20">
          <span className="material-symbols-outlined text-secondary mb-1 text-[22px]">local_florist</span>
          <span className="font-display-lg text-[22px] font-bold text-on-surface mb-0.5">
            {profile.activeCropsCount}
          </span>
          <span className="font-label-sm text-[11px] text-on-surface-variant font-semibold">
            Active Crops
          </span>
        </div>

        <div className="bg-surface-container/60 backdrop-blur-md rounded-[22px] p-3.5 flex flex-col items-center justify-center text-center shadow-2xs border-l-[3px] border-l-primary-fixed-dim border-outline-variant/20">
          <div className="relative w-7 h-7 mb-1">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-surface-variant"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
              />
              <path
                className="text-primary-fixed-dim"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray="94, 100"
                strokeLinecap="round"
                strokeWidth="3.5"
              />
            </svg>
          </div>
          <span className="font-display-lg text-[22px] font-bold text-on-surface mb-0.5">
            {profile.avgHealthScore}
          </span>
          <span className="font-label-sm text-[11px] text-on-surface-variant font-semibold">
            Health Score
          </span>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="flex flex-col gap-5 mt-1">
        {/* Account & Phone Login */}
        <div>
          <div className="flex items-center justify-between mb-2 px-2">
            <h3 className="font-title-md text-[13px] text-primary uppercase tracking-wider font-bold">
              Account & Credentials
            </h3>
            <button
              onClick={() => setShowEditDetailsModal(true)}
              className="font-label-sm text-[11.5px] font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">edit</span>
              Edit Profile
            </button>
          </div>

          <div className="bg-surface-container-lowest rounded-[22px] shadow-xs border border-outline-variant/30 overflow-hidden flex flex-col">
            <div
              onClick={() => onNavigate('login')}
              className="flex items-center justify-between p-4 hover:bg-surface-container/50 active:bg-surface-container cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">phone_iphone</span>
                </div>
                <div>
                  <p className="font-body-md text-on-surface font-semibold text-[15px]">Phone Account Login</p>
                  <p className="font-label-sm text-on-surface-variant text-[12px]">
                    {profile.phone ? `Connected: ${profile.phone}` : '+91 98765 43210'}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full font-label-sm text-[11px] font-bold bg-emerald-500/15 text-emerald-800 border border-emerald-500/30">
                {profile.isLoggedIn ? 'Authenticated' : 'Sign In'}
              </span>
            </div>
          </div>
        </div>

        {/* Farm Settings */}
        <div>
          <div className="flex items-center justify-between mb-2 px-2">
            <h3 className="font-title-md text-[13px] text-primary uppercase tracking-wider font-bold">
              Farm Details & Preferences
            </h3>
            <button
              onClick={() => setShowEditDetailsModal(true)}
              className="font-label-sm text-[11.5px] font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">edit</span>
              Edit Farm
            </button>
          </div>

          <div className="bg-surface-container-lowest rounded-[22px] shadow-xs border border-outline-variant/30 overflow-hidden flex flex-col">
            <div
              onClick={() => setShowEditDetailsModal(true)}
              className="flex items-center justify-between p-4 hover:bg-surface-container/50 active:bg-surface-container cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">map</span>
                </div>
                <div>
                  <p className="font-body-md text-on-surface font-semibold text-[15px]">Farm Location</p>
                  <p className="font-label-sm text-on-surface-variant text-[12px]">{profile.location}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline">edit</span>
            </div>

            <div className="h-[1px] w-full bg-outline-variant/20"></div>

            <div
              onClick={() => setShowEditDetailsModal(true)}
              className="flex items-center justify-between p-4 hover:bg-surface-container/50 active:bg-surface-container cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">square_foot</span>
                </div>
                <div>
                  <p className="font-body-md text-on-surface font-semibold text-[15px]">Farm Size</p>
                  <p className="font-label-sm text-on-surface-variant text-[12px]">{profile.farmSizeAcres} Acres</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline">edit</span>
            </div>

            <div className="h-[1px] w-full bg-outline-variant/20"></div>

            <div
              onClick={() => setShowEditDetailsModal(true)}
              className="flex items-center justify-between p-4 hover:bg-surface-container/50 active:bg-surface-container cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">agriculture</span>
                </div>
                <div>
                  <p className="font-body-md text-on-surface font-semibold text-[15px]">Primary Crops</p>
                  <p className="font-label-sm text-on-surface-variant text-[12px]">
                    {profile.primaryCrops.join(', ')}
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline">edit</span>
            </div>
          </div>
        </div>

        {/* App Preferences */}
        <div>
          <h3 className="font-title-md text-[13px] text-primary uppercase tracking-wider mb-2.5 px-2 font-bold">
            App Preferences
          </h3>
          <div className="bg-surface-container-lowest rounded-[22px] shadow-xs border border-outline-variant/30 overflow-hidden flex flex-col">
            <div
              onClick={() => onNavigate('language')}
              className="flex items-center justify-between p-4 hover:bg-surface-container/50 active:bg-surface-container cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">language</span>
                </div>
                <div>
                  <p className="font-body-md text-on-surface font-semibold text-[15px]">Language</p>
                  <p className="font-label-sm text-on-surface-variant text-[12px]">{profile.language}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline">chevron_right</span>
            </div>

            <div className="h-[1px] w-full bg-outline-variant/20"></div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                </div>
                <div>
                  <p className="font-body-md text-on-surface font-semibold text-[15px]">Notifications</p>
                  <p className="font-label-sm text-on-surface-variant text-[12px]">
                    {profile.notificationsOn ? 'All alerts on' : 'Muted'}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.notificationsOn}
                  onChange={(e) => onUpdateProfile({ notificationsOn: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>

            <div className="h-[1px] w-full bg-outline-variant/20"></div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">dark_mode</span>
                </div>
                <div>
                  <p className="font-body-md text-on-surface font-semibold text-[15px]">Dark Mode</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.darkMode}
                  onChange={(e) => onUpdateProfile({ darkMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Data & Offline PWA Storage */}
        <div>
          <h3 className="font-title-md text-[13px] text-primary uppercase tracking-wider mb-2.5 px-2 font-bold">
            Data & Offline PWA Storage
          </h3>
          <div className="bg-surface-container-lowest rounded-[22px] shadow-xs border border-outline-variant/30 overflow-hidden flex flex-col">
            {/* PWA Service Worker Status */}
            <div className="p-4 flex items-center justify-between bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">offline_pin</span>
                </div>
                <div>
                  <p className="font-body-md text-on-surface font-semibold text-[15px]">PWA Service Worker</p>
                  <p className="font-label-sm text-on-surface-variant text-[12px]">
                    {swRegistered ? 'Active & Caching Field Data' : 'Initializing Service Worker'}
                  </p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full font-label-sm text-[11px] font-bold ${isOnline ? 'bg-secondary-container text-on-secondary-container' : 'bg-amber-500/20 text-amber-700'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            <div className="h-[1px] w-full bg-outline-variant/20"></div>

            {/* Offline Diagnostics & Field Data Cache */}
            <div
              onClick={handleClearOfflineCache}
              className="flex items-center justify-between p-4 hover:bg-surface-container/50 active:bg-surface-container cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-tertiary-container/10 flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-[20px]">cached</span>
                </div>
                <div>
                  <p className="font-body-md text-on-surface font-semibold text-[15px]">Offline Diagnostics Cache</p>
                  <p className="font-label-sm text-on-surface-variant text-[12px]">{cacheStatus}</p>
                </div>
              </div>
              <span className="font-label-sm text-[11px] font-bold text-error hover:underline">
                Clear Cache
              </span>
            </div>

            <div className="h-[1px] w-full bg-outline-variant/20"></div>

            <div
              onClick={() => setShowScanHistoryModal(true)}
              className="flex items-center justify-between p-4 hover:bg-surface-container/50 active:bg-surface-container cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-tertiary-container/10 flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-[20px]">history</span>
                </div>
                <div>
                  <p className="font-body-md text-on-surface font-semibold text-[15px]">Scan History</p>
                  <p className="font-label-sm text-on-surface-variant text-[12px]">
                    {profile.totalScans} diagnostic scans recorded
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline">chevron_right</span>
            </div>

            <div className="h-[1px] w-full bg-outline-variant/20"></div>

            <div
              onClick={() => setShowPrivacyModal(true)}
              className="flex items-center justify-between p-4 hover:bg-surface-container/50 active:bg-surface-container cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-tertiary-container/10 flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-[20px]">security</span>
                </div>
                <div>
                  <p className="font-body-md text-on-surface font-semibold text-[15px]">Data Privacy</p>
                  <p className="font-label-sm text-on-surface-variant text-[12px]">Local encryption & permissions</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline">chevron_right</span>
            </div>

            <div className="h-[1px] w-full bg-outline-variant/20"></div>

            <div
              onClick={() => onNavigate('assistant')}
              className="flex items-center justify-between p-4 hover:bg-surface-container/50 active:bg-surface-container cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-tertiary-container/10 flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-[20px]">support_agent</span>
                </div>
                <div>
                  <p className="font-body-md text-on-surface font-semibold text-[15px]">Help & AI Assistant</p>
                  <p className="font-label-sm text-on-surface-variant text-[12px]">Instant agronomy chat support</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline">chevron_right</span>
            </div>
          </div>
        </div>
      </div>

      {/* Log Out Button */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => {
            onUpdateProfile({ isLoggedIn: false });
            onNavigate('login');
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-error-container/40 hover:bg-error-container text-on-error-container font-title-md text-[14px] font-semibold transition-all active:scale-95 shadow-2xs"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Log Out / Switch Account
        </button>
      </div>

      {/* 1. PHOTO EDITING MODAL */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-[24px] p-5 shadow-2xl border border-outline-variant/30 flex flex-col gap-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">add_a_photo</span>
                <h3 className="font-title-md text-[16px] font-bold text-on-surface">Update Profile Photo</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Current Avatar Preview */}
            <div className="flex flex-col items-center gap-2">
              <img
                src={profile.avatar}
                alt="Current Preview"
                className="w-24 h-24 rounded-full object-cover shadow-md border-2 border-primary"
              />
              <span className="font-label-sm text-[11.5px] text-on-surface-variant">Current Active Photo</span>
            </div>

            {/* Hidden Input File for custom photo */}
            <input
              id="profile-photo-input"
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {/* Upload Custom File Label Button */}
            <label
              htmlFor="profile-photo-input"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary font-title-md text-[14px] font-bold shadow-md hover:bg-primary-container active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer select-none text-center"
            >
              <span className="material-symbols-outlined text-[20px]">upload</span>
              <span>Upload Photo from Gallery / Device</span>
            </label>

            {/* Preset Avatars Selection */}
            <div className="flex flex-col gap-2 pt-1 border-t border-outline-variant/20">
              <span className="font-label-sm text-[11.5px] font-bold text-on-surface">
                Or choose a preset avatar:
              </span>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => handleSelectPresetAvatar(av.url)}
                    className="relative rounded-full overflow-hidden aspect-square border-2 border-transparent hover:border-primary active:scale-95 transition-all shadow-xs"
                  >
                    <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. EDIT PROFILE & FARM DETAILS MODAL */}
      {showEditDetailsModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-[24px] p-5 shadow-2xl border border-outline-variant/30 flex flex-col gap-4 animate-scale-up my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">edit_note</span>
                <h3 className="font-title-md text-[16px] font-bold text-on-surface">Edit Farmer & Farm Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditDetailsModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveDetails} className="flex flex-col gap-4">
              {/* Farmer Name */}
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-[12px] font-bold text-on-surface">
                  Farmer Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Ramesh Patil"
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2.5 font-body-md text-[14px] text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              {/* Mobile Phone Number */}
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-[12px] font-bold text-on-surface">
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2.5 font-body-md text-[14px] text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              {/* Farm Location */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-[12px] font-bold text-on-surface">
                  Farm Location & Region
                </label>
                <input
                  type="text"
                  required
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="e.g. Mandya, Karnataka"
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2.5 font-body-md text-[14px] text-on-surface focus:outline-none focus:border-primary"
                />
                {/* Location Suggestions */}
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {COMMON_LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setEditLocation(loc)}
                      className="px-2 py-0.5 rounded-md bg-surface-container text-[10.5px] font-medium text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Farm Size in Acres */}
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-[12px] font-bold text-on-surface">
                  Farm Size (Acres)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={editFarmSize}
                  onChange={(e) => setEditFarmSize(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 12.5"
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2.5 font-body-md text-[14px] text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              {/* Primary Crops Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-[12px] font-bold text-on-surface">
                  Primary Crops Grown
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_CROPS.map((cropName) => {
                    const isSelected = editPrimaryCrops.includes(cropName);
                    return (
                      <button
                        key={cropName}
                        type="button"
                        onClick={() => handleToggleCrop(cropName)}
                        className={`px-2.5 py-1 rounded-lg font-label-sm text-[11.5px] font-bold border transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-primary text-on-primary border-primary'
                            : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container'
                        }`}
                      >
                        {isSelected && <span className="material-symbols-outlined text-[14px]">check</span>}
                        {cropName}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Crop Input */}
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={customCropInput}
                    onChange={(e) => setCustomCropInput(e.target.value)}
                    placeholder="Add custom crop (e.g. Papaya)..."
                    className="flex-1 bg-surface-container-low border border-outline-variant/40 rounded-xl px-3 py-1.5 font-body-md text-[12px] text-on-surface"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomCrop}
                    className="px-3 py-1.5 bg-secondary text-on-secondary rounded-xl font-label-sm text-[12px] font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/20 mt-1">
                <button
                  type="button"
                  onClick={() => setShowEditDetailsModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface font-title-md text-[13.5px] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-title-md text-[13.5px] font-bold shadow-md hover:bg-primary-container transition-colors"
                >
                  Save Profile Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. SCAN HISTORY MODAL */}
      {showScanHistoryModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-[24px] p-5 shadow-2xl border border-outline-variant/30 flex flex-col gap-4 animate-scale-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[22px]">history</span>
                <h3 className="font-title-md text-[16px] font-bold text-on-surface">Recent Diagnostic Scans</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScanHistoryModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="bg-surface-container-low p-3 rounded-2xl border border-outline-variant/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[20px]">coronavirus</span>
                  </div>
                  <div>
                    <h4 className="font-title-md text-[13.5px] font-bold text-on-surface">Tomato Early Blight</h4>
                    <p className="font-label-sm text-[11px] text-on-surface-variant">Field 01 • Aug 10, 2026</p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-full bg-amber-500/15 text-amber-800 font-label-sm text-[10.5px] font-bold">
                  88% Match
                </span>
              </div>

              <div className="bg-surface-container-low p-3 rounded-2xl border border-outline-variant/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[20px]">verified</span>
                  </div>
                  <div>
                    <h4 className="font-title-md text-[13.5px] font-bold text-on-surface">Healthy Leaf Specimen</h4>
                    <p className="font-label-sm text-[11px] text-on-surface-variant">Field 02 • Aug 08, 2026</p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-800 font-label-sm text-[10.5px] font-bold">
                  Healthy
                </span>
              </div>

              <div className="bg-surface-container-low p-3 rounded-2xl border border-outline-variant/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-700 flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[20px]">water_drop</span>
                  </div>
                  <div>
                    <h4 className="font-title-md text-[13.5px] font-bold text-on-surface">Nitrogen Deficiency</h4>
                    <p className="font-label-sm text-[11px] text-on-surface-variant">Field 03 • Aug 02, 2026</p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-full bg-sky-500/15 text-sky-800 font-label-sm text-[10.5px] font-bold">
                  Nutrient
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowScanHistoryModal(false);
                onNavigate('scan');
              }}
              className="w-full py-2.5 bg-primary text-on-primary rounded-xl font-title-md text-[13.5px] font-bold shadow-xs mt-1"
            >
              Start New Leaf Diagnostic Scan
            </button>
          </div>
        </div>
      )}

      {/* 4. DATA PRIVACY MODAL */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-[24px] p-5 shadow-2xl border border-outline-variant/30 flex flex-col gap-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">security</span>
                <h3 className="font-title-md text-[16px] font-bold text-on-surface">Data Privacy & Security</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-[12.5px] text-on-surface-variant leading-relaxed">
              <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">lock</span>
                <div>
                  <p className="font-bold text-on-surface text-[13px]">100% Local Device Storage</p>
                  <p>All scanned crop photos and soil diagnostic metrics are saved encrypted in your local IndexedDB storage.</p>
                </div>
              </div>

              <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">verified_user</span>
                <div>
                  <p className="font-bold text-on-surface text-[13px]">No Unsolicited Commercial Sharing</p>
                  <p>Your yield statistics and farm acreage remain private to your account.</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPrivacyModal(false)}
              className="w-full py-2.5 bg-primary text-on-primary rounded-xl font-title-md text-[13.5px] font-bold shadow-xs mt-1"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
