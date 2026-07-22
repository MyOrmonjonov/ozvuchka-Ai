import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TextEditorCard } from './components/TextEditorCard';
import { VoiceSettingsCard } from './components/VoiceSettingsCard';
import { AudioPlayerPanel } from './components/AudioPlayerPanel';
import { SynthesisHistory } from './components/SynthesisHistory';
import { SynthesizedTrack, StyleType } from './types';
import { AlertTriangle, X } from 'lucide-react';

const STORAGE_KEY = 'ozbek_ovoz_history_v1';

export default function App() {
  const [text, setText] = useState<string>(
    "Assalomu alaykum! O'zbek ovoz sun'iy intellekt xizmatiga xush kelibsiz. Bugun sizga qanday yordam bera olaman?"
  );
  const [selectedVoice, setSelectedVoice] = useState<string>('Dilnoza');
  const [selectedStyle, setSelectedStyle] = useState<StyleType>('natural');
  const [tempo, setTempo] = useState<number>(1.0);

  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [history, setHistory] = useState<SynthesizedTrack[]>([]);
  const [activeTrack, setActiveTrack] = useState<SynthesizedTrack | null>(null);

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
          setActiveTrack(parsed[0]);
        }
      }
    } catch (e) {
      console.warn("History parse error:", e);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (newHistory: SynthesizedTrack[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.warn("History save error:", e);
    }
  };

  // Text Orthography & Grammar Enhancer
  const handleEnhanceText = async () => {
    if (!text.trim()) return;
    setIsEnhancing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/enhance-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Matnni tahrirlashda xatolik yuz berdi");
      }

      if (data.enhancedText) {
        setText(data.enhancedText);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Tahrirlashda xatolik yuz berdi");
    } finally {
      setIsEnhancing(false);
    }
  };

  // Speech Synthesis Request
  const handleSynthesize = async () => {
    if (!text.trim()) return;
    setIsSynthesizing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceName: selectedVoice,
          style: selectedStyle,
          speed: tempo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ovoz sintez qilishda xatolik yuz berdi");
      }

      const now = new Date();
      const newTrack: SynthesizedTrack = {
        id: `track_${Date.now()}`,
        text: data.text,
        voiceName: data.voiceName,
        style: data.style,
        speed: data.speed,
        audioContentBase64: data.audioContent,
        timestamp: data.timestamp,
        formattedDate: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setActiveTrack(newTrack);

      const updatedHistory = [newTrack, ...history.filter(h => h.id !== newTrack.id)].slice(0, 10);
      saveHistory(updatedHistory);
    } catch (err: any) {
      setErrorMessage(err.message || "Sintez qilish jarayonida xatolik yuz berdi");
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Select item from history
  const handleSelectTrack = (track: SynthesizedTrack) => {
    setActiveTrack(track);
    setText(track.text);
    setSelectedVoice(track.voiceName);
    setSelectedStyle(track.style);
    setTempo(track.speed || 1.0);
  };

  // Delete item from history
  const handleDeleteTrack = (trackId: string) => {
    const updated = history.filter(t => t.id !== trackId);
    saveHistory(updated);
    if (activeTrack?.id === trackId) {
      setActiveTrack(updated.length > 0 ? updated[0] : null);
    }
  };

  // Clear entire history
  const handleClearHistory = () => {
    saveHistory([]);
    setActiveTrack(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-teal-500 selection:text-white">
      {/* Top Navigation */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
              <span className="text-xs font-semibold">{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Text Editor & Voice Settings */}
          <div className="lg:col-span-7 space-y-6">
            <TextEditorCard
              text={text}
              setText={setText}
              onEnhanceText={handleEnhanceText}
              isEnhancing={isEnhancing}
            />

            <VoiceSettingsCard
              selectedVoice={selectedVoice}
              setSelectedVoice={setSelectedVoice}
              selectedStyle={selectedStyle}
              setSelectedStyle={setSelectedStyle}
              tempo={tempo}
              setTempo={setTempo}
              onSynthesize={handleSynthesize}
              isSynthesizing={isSynthesizing}
              disabled={!text.trim()}
            />
          </div>

          {/* Right Panel: Active Track Player & Synthesis History */}
          <div className="lg:col-span-5 space-y-6">
            <AudioPlayerPanel
              activeTrack={activeTrack}
              tempo={tempo}
            />

            <SynthesisHistory
              history={history}
              activeTrackId={activeTrack?.id || null}
              onSelectTrack={handleSelectTrack}
              onDeleteTrack={handleDeleteTrack}
              onClearHistory={handleClearHistory}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 O'zbek Ovoz AI. Barcha huquqlar himoyalangan.</p>
          <p>Sintez va audio vizualizatsiya to'liq brauzerda va serverda xavfsiz boshqariladi.</p>
        </div>
      </footer>
    </div>
  );
}
