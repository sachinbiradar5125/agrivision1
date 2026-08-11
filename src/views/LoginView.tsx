import React, { useState, useRef } from 'react';
import { ViewState, FarmerProfile, Language } from '../types';

interface LoginViewProps {
  onNavigate: (view: ViewState) => void;
  profile: FarmerProfile;
  onUpdateProfile: (updates: Partial<FarmerProfile>) => void;
}

interface CountryCode {
  code: string;
  country: string;
  flag: string;
}

const COUNTRY_CODES: CountryCode[] = [
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
];

const PRESET_AVATARS = [
  {
    id: 'f1',
    name: 'Preset 1',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'f2',
    name: 'Preset 2',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'f3',
    name: 'Preset 3',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'f4',
    name: 'Preset 4',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  },
];

const POPULAR_CROPS = [
  'Roma Tomato',
  'Paddy / Rice',
  'Winter Wheat',
  'Cotton',
  'Sugarcane',
  'Soybean',
  'Maize / Corn',
  'Chilli Pepper',
  'Onion',
  'Potato',
];

const LANGUAGES: { label: string; value: Language }[] = [
  { label: 'English', value: 'English' },
  { label: 'ಕನ್ನಡ (Kannada)', value: 'Kannada' },
  { label: 'हिंदी (Hindi)', value: 'Hindi' },
  { label: 'తెలుగు (Telugu)', value: 'Telugu' },
  { label: 'தமிழ் (Tamil)', value: 'Tamil' },
  { label: 'मराठी (Marathi)', value: 'Marathi' },
];

const SOIL_TYPES = [
  'Red Loam Soil',
  'Black Cotton Soil',
  'Alluvial Soil',
  'Clay Loam',
  'Sandy Loam',
];

export const LoginView: React.FC<LoginViewProps> = ({
  onNavigate,
  profile,
  onUpdateProfile,
}) => {
  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Registration & Login state
  const [fullNameInput, setFullNameInput] = useState<string>(profile.name || '');
  const [locationInput, setLocationInput] = useState<string>(profile.location || '');
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('+1');
  const [phoneInput, setPhoneInput] = useState<string>(
    profile.phone ? profile.phone.replace(/^\+\d+\s?/, '') : ''
  );
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [farmSizeInput, setFarmSizeInput] = useState<string>(
    profile.farmSizeAcres ? String(profile.farmSizeAcres) : '5.0'
  );
  const [selectedCrops, setSelectedCrops] = useState<string[]>(
    profile.primaryCrops && profile.primaryCrops.length > 0 ? profile.primaryCrops : ['Roma Tomato']
  );
  const [soilTypeInput, setSoilTypeInput] = useState<string>(profile.soilType || 'Red Loam Soil');
  const [languageInput, setLanguageInput] = useState<Language>(profile.language || 'English');

  // Photo
  const [avatarInput, setAvatarInput] = useState<string>(
    profile.avatar || PRESET_AVATARS[0].url
  );

  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Hidden File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Password reset modal
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [forgotPhone, setForgotPhone] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpInput, setOtpInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');

  const cleanPhoneDigits = phoneInput.replace(/\D/g, '');

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMessage('Photo size exceeds 8MB limit. Please select a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setAvatarInput(dataUrl);
          setErrorMessage('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleCrop = (cropName: string) => {
    if (selectedCrops.includes(cropName)) {
      setSelectedCrops(selectedCrops.filter((c) => c !== cropName));
    } else {
      setSelectedCrops([...selectedCrops, cropName]);
    }
  };

  const handleGuestLogin = () => {
    onUpdateProfile({
      name: 'Guest Farmer',
      avatar: PRESET_AVATARS[0].url,
      location: 'Demo Valley Farm',
      isLoggedIn: true,
    });
    onNavigate('home');
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onUpdateProfile({
        name: profile.name || 'Google User',
        avatar: profile.avatar || PRESET_AVATARS[1].url,
        email: 'user@gmail.com',
        isLoggedIn: true,
      });
      onNavigate('home');
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (mode === 'register') {
      if (!fullNameInput.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (!locationInput.trim()) {
        setErrorMessage('Please enter your farm location.');
        return;
      }
    }

    if (cleanPhoneDigits.length < 7) {
      setErrorMessage('Please enter a valid phone number.');
      return;
    }

    if (passwordInput.length < 4) {
      setErrorMessage('Password must be at least 4 characters.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const fullPhoneNumber = `${selectedCountryCode} ${phoneInput}`;

      if (mode === 'register') {
        const farmSize = parseFloat(farmSizeInput) || 5;
        onUpdateProfile({
          name: fullNameInput.trim(),
          avatar: avatarInput || PRESET_AVATARS[0].url,
          location: locationInput.trim(),
          phone: fullPhoneNumber,
          farmSizeAcres: farmSize,
          primaryCrops: selectedCrops.length > 0 ? selectedCrops : ['Roma Tomato'],
          soilType: soilTypeInput,
          language: languageInput,
          isLoggedIn: true,
          totalScans: 0,
          activeCropsCount: selectedCrops.length || 3,
          avgHealthScore: 94,
        });
        setSuccessMessage(`Account created for ${fullNameInput}!`);
      } else {
        onUpdateProfile({
          name: profile.name || fullNameInput || 'Farmer',
          phone: fullPhoneNumber,
          isLoggedIn: true,
        });
        setSuccessMessage(`Logged in successfully!`);
      }

      setTimeout(() => {
        onNavigate('home');
      }, 700);
    }, 600);
  };

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotPhone.replace(/\D/g, '').length < 7) {
      alert('Please enter a valid phone number.');
      return;
    }
    setOtpSent(true);
  };

  const handleResetPasswordWithOTP = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Password reset successfully!');
    setShowForgotPassword(false);
    setOtpSent(false);
    setPasswordInput(newPasswordInput || '123456');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col items-center px-4 pt-6 pb-28 max-w-md mx-auto animate-fade-in font-sans">
      {/* 1. App Logo Container Card matching screenshot */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[28px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-slate-100 flex items-center justify-center p-3 mb-6">
        <div className="flex items-center justify-center gap-1.5 text-[#0a5c36]">
          {/* Custom SVG logo matching AgriVision AI emblem */}
          <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M50 15C30 15 15 30 15 50C15 70 30 85 50 85C50 65 35 50 35 35C35 25 40 18 50 15Z"
              fill="#0a5c36"
            />
            <path
              d="M50 15C70 15 85 30 85 50C85 70 70 85 50 85C50 65 65 50 65 35C65 25 60 18 50 15Z"
              fill="#22c55e"
              opacity="0.85"
            />
            <path d="M50 15V85" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <path d="M50 35L65 25M50 50L70 40M50 65L62 58" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M50 35L35 25M50 50L30 40M50 65L38 58" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* 2. Headline & Subtitle matching screenshot */}
      <h1 className="text-[26px] sm:text-[28px] font-extrabold text-slate-900 tracking-tight text-center leading-tight mb-1.5">
        Grow Smarter with<br />AgriVision AI
      </h1>
      <p className="text-[14px] text-slate-500 font-medium text-center mb-6">
        Precision insights for modern farming.
      </p>

      {/* 3. Segmented Pill Switcher (Login vs Create Account) */}
      <div className="w-full bg-[#eef4ff] p-1.5 rounded-[22px] flex items-center mb-6 border border-slate-200/60 shadow-inner">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setErrorMessage('');
          }}
          className={`flex-1 py-3 rounded-[18px] text-[14px] font-bold transition-all text-center ${
            mode === 'login'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Login
        </button>

        <button
          type="button"
          onClick={() => {
            setMode('register');
            setErrorMessage('');
          }}
          className={`flex-1 py-3 rounded-[18px] text-[14px] font-bold transition-all text-center ${
            mode === 'register'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Error & Success Messages */}
      {errorMessage && (
        <div className="w-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-[13px] font-semibold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-[13px] font-semibold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* 4. Form Section matching exact visual input styling */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        {/* Create Account Extra Fields */}
        {mode === 'register' && (
          <div className="flex flex-col gap-3 p-4 bg-white rounded-[24px] border border-slate-200/80 shadow-xs mb-1">
            {/* Photo Upload Section */}
            <div className="flex flex-col items-center gap-2 pb-3 border-b border-slate-100">
              <span className="text-[12px] font-bold text-slate-700 self-start">
                Profile Photo / Photo Upload
              </span>

              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#0a5c36] shadow-sm bg-slate-100 flex items-center justify-center">
                  {avatarInput ? (
                    <img src={avatarInput} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-[36px] text-slate-400">person</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-[#0a5c36] text-white rounded-full shadow-md flex items-center justify-center border-2 border-white"
                >
                  <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handlePhotoFileUpload}
              />

              <div className="flex items-center gap-2 mt-1">
                {PRESET_AVATARS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setAvatarInput(p.url)}
                    className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all ${
                      avatarInput === p.url ? 'border-[#0a5c36] scale-110' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-slate-700">Full Name *</label>
              <input
                type="text"
                required
                value={fullNameInput}
                onChange={(e) => setFullNameInput(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full bg-[#eef4ff] border border-transparent focus:border-[#0a5c36] focus:bg-white rounded-2xl px-4 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all"
              />
            </div>

            {/* Farm Location */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-slate-700">Farm Location *</label>
              <input
                type="text"
                required
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="e.g. Valley View Farm, Karnataka"
                className="w-full bg-[#eef4ff] border border-transparent focus:border-[#0a5c36] focus:bg-white rounded-2xl px-4 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all"
              />
            </div>

            {/* Farm Size & Soil */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold text-slate-700">Acres</label>
                <input
                  type="number"
                  step="0.5"
                  value={farmSizeInput}
                  onChange={(e) => setFarmSizeInput(e.target.value)}
                  className="w-full bg-[#eef4ff] border border-transparent focus:border-[#0a5c36] focus:bg-white rounded-2xl px-3 py-2.5 text-[14px] font-bold text-slate-900 outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold text-slate-700">Soil Type</label>
                <select
                  value={soilTypeInput}
                  onChange={(e) => setSoilTypeInput(e.target.value)}
                  className="w-full bg-[#eef4ff] border border-transparent focus:border-[#0a5c36] focus:bg-white rounded-2xl px-2.5 py-2.5 text-[12px] font-bold text-slate-900 outline-none"
                >
                  {SOIL_TYPES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Primary Crops */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-slate-700">Primary Crops</label>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_CROPS.slice(0, 6).map((crop) => {
                  const isSelected = selectedCrops.includes(crop);
                  return (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => handleToggleCrop(crop)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                        isSelected
                          ? 'bg-[#0a5c36] text-white shadow-xs'
                          : 'bg-[#eef4ff] text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {crop}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Phone Number Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-slate-700 ml-1">
            Phone Number
          </label>
          <div className="w-full bg-[#eef4ff] rounded-[22px] px-3.5 py-1 flex items-center gap-2 border border-transparent focus-within:border-[#0a5c36] focus-within:bg-white transition-all">
            {/* Country flag selector */}
            <div className="flex items-center gap-1 text-slate-700 shrink-0 cursor-pointer py-2 px-1">
              <select
                value={selectedCountryCode}
                onChange={(e) => setSelectedCountryCode(e.target.value)}
                className="bg-transparent text-[14px] font-bold text-slate-800 outline-none cursor-pointer appearance-none pr-1"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined text-[18px] text-slate-500">
                arrow_drop_down
              </span>
            </div>

            {/* Input */}
            <input
              type="tel"
              required
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="(555) 000-0000"
              className="w-full bg-transparent py-2.5 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 outline-none"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-slate-700 ml-1">
            Password
          </label>
          <div className="w-full bg-[#eef4ff] rounded-[22px] px-4 py-1 flex items-center justify-between border border-transparent focus-within:border-[#0a5c36] focus-within:bg-white transition-all">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent py-2.5 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 outline-none tracking-widest"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-500 hover:text-slate-800 p-1 shrink-0"
              tabIndex={-1}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? 'visibility' : 'visibility_off'}
              </span>
            </button>
          </div>

          {/* Forgot Password Link right-aligned */}
          {mode === 'login' && (
            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-[13px] font-bold text-slate-800 hover:text-[#0a5c36] transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          )}
        </div>

        {/* 5. Main Login / Create Account Button matching exact dark green pill style */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-13 mt-2 bg-[#0a5c36] hover:bg-[#064e3b] active:scale-[0.98] text-white rounded-[24px] text-[16px] font-bold shadow-md transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <span>{mode === 'login' ? 'Login' : 'Create Account'}</span>
          )}
        </button>
      </form>

      {/* 6. "or" Divider */}
      <div className="w-full flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-slate-200"></div>
        <span className="text-[12px] font-medium text-slate-400">or</span>
        <div className="flex-1 h-px bg-slate-200"></div>
      </div>

      {/* 7. Continue with Google Button matching soft light blue pill design */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full py-3.5 px-4 bg-[#eef4ff] hover:bg-[#e2edff] active:scale-[0.98] rounded-[24px] text-slate-900 text-[14px] font-bold transition-all flex items-center justify-center gap-3 mb-4"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* 8. Try as Guest Text Button */}
      <button
        type="button"
        onClick={handleGuestLogin}
        className="text-[14px] font-semibold text-slate-700 hover:text-slate-900 transition-colors"
      >
        Try as Guest
      </button>

      {/* Forgot Password OTP Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[24px] p-5 shadow-2xl border border-slate-100 flex flex-col gap-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-[16px] text-slate-900">Reset Password</h3>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setOtpSent(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {!otpSent ? (
              <form onSubmit={handleSendOTP} className="flex flex-col gap-3">
                <p className="text-[12.5px] text-slate-600">
                  Enter your mobile phone number to receive a 4-digit SMS verification code.
                </p>
                <input
                  type="tel"
                  required
                  value={forgotPhone}
                  onChange={(e) => setForgotPhone(e.target.value)}
                  placeholder="Mobile phone number"
                  className="w-full bg-[#eef4ff] rounded-2xl px-4 py-3 text-[14px] font-medium text-slate-900 outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-[#0a5c36] text-white rounded-2xl text-[14px] font-bold mt-1"
                >
                  Send Reset SMS
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordWithOTP} className="flex flex-col gap-3">
                <p className="text-[12px] text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  Verification code sent! Enter test code: <strong>1234</strong>
                </p>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="1234"
                  className="w-full bg-[#eef4ff] rounded-2xl px-4 py-2.5 text-[16px] font-bold text-center tracking-widest text-slate-900 outline-none"
                />
                <input
                  type="password"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="New password"
                  className="w-full bg-[#eef4ff] rounded-2xl px-4 py-2.5 text-[14px] text-slate-900 outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-[#0a5c36] text-white rounded-2xl text-[14px] font-bold mt-1"
                >
                  Update Password
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
