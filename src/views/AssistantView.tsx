import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, FarmerProfile, ViewState } from '../types';

interface AssistantViewProps {
  profile: FarmerProfile;
  initialPrompt?: string | null;
  onNavigate?: (view: ViewState) => void;
  initialCropContext?: string;
}

export const AssistantView: React.FC<AssistantViewProps> = ({
  profile,
  initialPrompt,
  initialCropContext,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: `Hello ${profile.name || 'Farmer'}! I am your AI Agronomist. You can type or tap the microphone to verbally ask questions about your ${initialCropContext || 'crops'}, soil nutrition, or pest treatments in ${profile.language || 'English'}.`,
      timestamp: 'Today, 9:41 AM',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [autoSendVoice, setAutoSendVoice] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Map user profile language to SpeechRecognition locale codes
  const getLanguageCode = (lang: string): string => {
    switch (lang) {
      case 'Kannada':
        return 'kn-IN';
      case 'Hindi':
        return 'hi-IN';
      case 'Telugu':
        return 'te-IN';
      case 'Tamil':
        return 'ta-IN';
      case 'Marathi':
        return 'mr-IN';
      case 'English':
      default:
        return 'en-IN';
    }
  };

  useEffect(() => {
    if (initialPrompt) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, isRecording, interimTranscript]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    // Stop speaking if playing previous response
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setInterimTranscript('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          language: profile.language,
          history: messages.slice(-6).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }],
          })),
        }),
      });

      const data = await res.json();
      const assistantReply =
        data.reply ||
        'Early blight on tomatoes is best managed by pruning infected lower leaves, avoiding overhead watering, and spraying copper fungicide every 7-10 days.';

      const aiMsgId = `ai-${Date.now()}`;
      const aiMsg: ChatMessage = {
        id: aiMsgId,
        sender: 'assistant',
        text: assistantReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Automatically speak out response if user sent query via voice
      if (isRecording || autoSendVoice) {
        speakText(assistantReply, aiMsgId);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: 'For early blight or yellowing foliage, prune infected leaves, ensure good spacing for airflow, and apply copper fungicide.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Voice-to-Text Speech Recognition Trigger
  const handleMicToggle = () => {
    setSpeechError(null);

    // If currently recording, stop manually
    if (isRecording && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Voice recognition is not supported in this browser window. Please type your query.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      const langCode = getLanguageCode(profile.language);
      recognition.lang = langCode;
      recognition.continuous = false;
      recognition.interimResults = true;

      setIsRecording(true);
      setInterimTranscript('Listening... Speak now.');

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalStr = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalStr += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const currentText = finalStr || interim;
        setInterimTranscript(currentText);

        if (finalStr.trim()) {
          setInput(finalStr.trim());
          if (autoSendVoice) {
            handleSend(finalStr.trim());
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission was denied. Please allow microphone access in your browser.');
        } else if (event.error === 'no-speech') {
          setSpeechError('No speech was detected. Please try tapping the mic again.');
        } else {
          setSpeechError(`Speech recognition issue (${event.error}). Please try again.`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setIsRecording(false);
      setSpeechError('Could not access microphone. Please type your query below.');
    }
  };

  // Text-to-Speech (TTS) Read Aloud Handler
  const speakText = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLanguageCode(profile.language);
    utterance.rate = 0.95; // Slightly slower for clear agronomic advice

    utterance.onstart = () => setSpeakingMsgId(msgId);
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-80px)] pb-44 max-w-md mx-auto animate-fade-in relative">
      {/* Assistant Header */}
      <div className="px-margin-mobile pt-5 pb-3 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background flex items-center gap-2 font-bold">
            AgriAI Assistant <span className="text-2xl">🤖</span>
          </h2>
          <div className="flex items-center gap-1.5 bg-primary-container/30 px-2.5 py-1 rounded-full border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-label-sm text-[11px] font-semibold text-primary">
              {profile.language || 'English'} Voice
            </span>
          </div>
        </div>
        <p className="font-body-md text-on-surface-variant text-[13.5px]">
          Verbal & text crop care guidance tailored for {profile.name || 'your farm'}.
        </p>
      </div>

      {/* Voice Recognition Error Alert Banner */}
      {speechError && (
        <div className="mx-margin-mobile mb-3 p-3 bg-error-container/80 border border-error/30 rounded-2xl flex items-center justify-between gap-2 text-on-error-container animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-error shrink-0">mic_off</span>
            <span className="font-body-md text-[12px] font-medium leading-tight">{speechError}</span>
          </div>
          <button
            onClick={() => setSpeechError(null)}
            className="text-error font-bold text-[14px] p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Live Voice Recording Status Card Overlay */}
      {isRecording && (
        <div className="mx-margin-mobile mb-4 p-4 bg-primary text-on-primary rounded-[24px] shadow-xl border border-primary-container flex flex-col gap-3 animate-fade-in relative overflow-hidden">
          {/* Animated Wave Background Effect */}
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-secondary/20 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-error text-on-error flex items-center justify-center animate-bounce shadow-md">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  mic
                </span>
              </div>
              <div>
                <span className="font-title-md font-bold text-[15px] block leading-none">
                  Listening in {profile.language || 'English'}...
                </span>
                <span className="font-label-sm text-[11px] text-primary-fixed opacity-90">
                  Speak clearly about your crop issue
                </span>
              </div>
            </div>

            <button
              onClick={handleMicToggle}
              className="px-3 py-1.5 rounded-full bg-on-primary/20 hover:bg-on-primary/30 text-on-primary font-label-sm text-[12px] font-bold active:scale-95 transition-all"
            >
              Stop
            </button>
          </div>

          {/* Audio Equalizer Visualizer Bars */}
          <div className="flex items-center gap-1.5 h-6 my-1 justify-center z-10">
            {[12, 24, 16, 28, 20, 32, 14, 26, 18, 22].map((height, idx) => (
              <div
                key={idx}
                className="w-1.5 bg-secondary-fixed rounded-full animate-pulse"
                style={{
                  height: `${height}px`,
                  animationDuration: `${0.4 + (idx % 4) * 0.2}s`,
                }}
              />
            ))}
          </div>

          {/* Live Transcript Preview */}
          <div className="bg-black/20 backdrop-blur-sm p-3 rounded-xl border border-white/10 z-10">
            <span className="font-label-sm text-[10px] uppercase text-primary-fixed block mb-0.5 tracking-wider font-bold">
              Live Speech Transcript
            </span>
            <p className="font-body-md text-[13px] text-white italic min-h-[20px]">
              "{interimTranscript || 'Listening for your voice...'}"
            </p>
          </div>
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="flex flex-col gap-4 px-margin-mobile pb-8 flex-1">
        <div className="flex justify-center my-1">
          <span className="font-label-sm text-[11px] text-outline-variant bg-surface-container-low px-3 py-1 rounded-full shadow-2xs font-semibold">
            Today
          </span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 items-end ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 shadow-xs mb-1 border border-outline-variant/30 bg-primary/10 flex items-center justify-center text-primary font-bold">
                <span className="material-symbols-outlined text-[22px]">smart_toy</span>
              </div>
            )}

            <div
              className={`p-4 rounded-[22px] font-body-md text-[14.5px] leading-relaxed max-w-[85%] relative overflow-hidden shadow-2xs ${
                msg.sender === 'user'
                  ? 'bg-primary text-on-primary rounded-br-xs'
                  : 'bg-surface-container text-on-surface rounded-bl-xs border border-outline-variant/30'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
              )}

              <p className="whitespace-pre-line">{msg.text}</p>

              <div className="flex items-center justify-between gap-3 mt-2 pt-1 border-t border-outline-variant/15 text-[10px]">
                <span
                  className={msg.sender === 'user' ? 'text-primary-fixed' : 'text-on-surface-variant'}
                >
                  {msg.timestamp}
                </span>

                {/* Text-to-Speech Playback Button for AI Responses */}
                {msg.sender === 'assistant' && (
                  <button
                    onClick={() => speakText(msg.text, msg.id)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold transition-all active:scale-95 ${
                      speakingMsgId === msg.id
                        ? 'bg-secondary text-on-secondary shadow-xs animate-pulse'
                        : 'bg-surface-container-high text-primary hover:bg-surface-container-highest'
                    }`}
                    title="Read Aloud in native language"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {speakingMsgId === msg.id ? 'volume_up' : 'volume_down'}
                    </span>
                    {speakingMsgId === msg.id ? 'Speaking...' : 'Listen'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 items-end justify-start">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-xs mb-1 border border-outline-variant/30">
              <span className="material-symbols-outlined text-[22px]">smart_toy</span>
            </div>
            <div className="bg-surface-container text-on-surface p-4 rounded-[22px] rounded-bl-xs shadow-xs border border-outline-variant/30 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              <span className="font-label-sm text-[13px] text-on-surface-variant font-medium">
                AgriAI is thinking in {profile.language || 'English'}...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Bottom Input Bar & Quick Prompt Chips */}
      <div className="fixed bottom-[88px] left-0 right-0 z-40 max-w-md mx-auto bg-gradient-to-t from-background via-background/95 to-transparent pt-4 pb-2">
        {/* Quick Voice Prompt Chips */}
        <div className="flex gap-2.5 px-margin-mobile overflow-x-auto pb-2.5 scrollbar-none">
          <button
            onClick={() => handleSend('Why are my leaves turning yellow?')}
            className="shrink-0 px-3.5 py-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-full font-label-sm text-[12px] shadow-2xs transition-all active:scale-95 flex items-center gap-1.5 border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-secondary text-[15px]">psychiatry</span>
            Yellow Leaves?
          </button>

          <button
            onClick={() => handleSend('What fungicide is recommended for Early Blight?')}
            className="shrink-0 px-3.5 py-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-full font-label-sm text-[12px] shadow-2xs transition-all active:scale-95 flex items-center gap-1.5 border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-secondary text-[15px]">medical_services</span>
            Fungicide Advice?
          </button>

          <button
            onClick={() => handleSend('Ideal watering schedule for tomatoes?')}
            className="shrink-0 px-3.5 py-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-full font-label-sm text-[12px] shadow-2xs transition-all active:scale-95 flex items-center gap-1.5 border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-secondary text-[15px]">water_drop</span>
            Watering Schedule?
          </button>
        </div>

        {/* Text & Voice Input Form */}
        <div className="px-margin-mobile">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-1 bg-surface-container-high rounded-[28px] p-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-outline-variant/30 backdrop-blur-xl"
          >
            {/* Auto-Send Toggle Button */}
            <button
              type="button"
              onClick={() => setAutoSendVoice(!autoSendVoice)}
              className={`px-2 py-1 rounded-full text-[10px] font-bold transition-all ${
                autoSendVoice
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'bg-surface-container text-outline'
              }`}
              title="Auto-send query when speech recognition finishes"
            >
              {autoSendVoice ? 'Auto Send ON' : 'Auto Send OFF'}
            </button>

            {/* Voice Input Mic Button */}
            <button
              type="button"
              onClick={handleMicToggle}
              className={`w-11 h-11 flex items-center justify-center rounded-full active:scale-95 transition-all shadow-xs ${
                isRecording
                  ? 'bg-error text-on-error animate-pulse scale-105'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
              title={`Verbal Voice Input (${profile.language || 'English'})`}
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isRecording ? 'mic' : 'mic_none'}
              </span>
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask in ${profile.language || 'English'} or tap mic...`}
              className="flex-1 bg-transparent text-on-surface font-body-md text-[14.5px] outline-none placeholder:text-outline min-w-0 px-2"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className={`w-11 h-11 rounded-full shadow-md transition-all flex items-center justify-center shrink-0 ${
                input.trim() && !loading
                  ? 'bg-primary text-on-primary active:scale-95 hover:bg-primary-container'
                  : 'bg-surface-variant text-outline cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                send
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

