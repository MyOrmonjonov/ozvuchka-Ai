import React from 'react';
import { Sliders, Volume2, Play, RefreshCw, Check, Zap } from 'lucide-react';
import { VoiceCharacter, StyleOption, StyleType } from '../types';

interface VoiceSettingsCardProps {
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  selectedStyle: StyleType;
  setSelectedStyle: (style: StyleType) => void;
  tempo: number;
  setTempo: (tempo: number) => void;
  onSynthesize: () => Promise<void>;
  isSynthesizing: boolean;
  disabled: boolean;
}

const VOICE_CHARACTERS: VoiceCharacter[] = [
  {
    id: 'Dilnoza',
    name: 'Dilnoza',
    gender: 'Ayol',
    description: 'Mayin va ifodali ovoz (Tavsiya etiladi!)',
    mappedVoice: 'Zephyr',
    recommended: true,
  },
  {
    id: 'Madina',
    name: 'Madina',
    gender: 'Ayol',
    description: "Aniq va ravon ma'ruzachi ovozi.",
    mappedVoice: 'Kore',
  },
  {
    id: 'Sardor',
    name: 'Sardor',
    gender: 'Erkak',
    description: "Yoqimli, samimiy va do'stona ovoz.",
    mappedVoice: 'Puck',
  },
  {
    id: 'Jasur',
    name: 'Jasur',
    gender: 'Erkak',
    description: 'Shiddatli, chuqur va vazmin ovoz.',
    mappedVoice: 'Charon',
  },
  {
    id: 'Farrux',
    name: 'Farrux',
    gender: 'Erkak',
    description: 'Muloyim va iliq nutq ohangi.',
    mappedVoice: 'Fenrir',
  },
];

const STYLE_OPTIONS: StyleOption[] = [
  { id: 'natural', label: 'Tabiiy / Oddiy', description: 'Oqilona va muvozanatli ohang' },
  { id: 'cheerful', label: 'Xushchaqchaq', description: "Shodiyona va ko'tarinki ruhiyat" },
  { id: 'calm', label: 'Sokin va muloyim', description: 'Yumshoq, vazmin nutq' },
  { id: 'serious', label: 'Jiddiy / Rasmiy', description: 'Rasmiy va ishonchli nutq' },
  { id: 'dramatic', label: 'Hayajonli / Dramatik', description: "Ta'sirchan va hissiyotli" },
];

export const VoiceSettingsCard: React.FC<VoiceSettingsCardProps> = ({
  selectedVoice,
  setSelectedVoice,
  selectedStyle,
  setSelectedStyle,
  tempo,
  setTempo,
  onSynthesize,
  isSynthesizing,
  disabled,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
          <Sliders className="h-4 w-4" />
        </div>
        <h2 className="text-base font-bold text-slate-900">
          Ovoz sozlamalari va Uslublar
        </h2>
      </div>

      {/* Voice Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
          Ovoz ijrochisi:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {VOICE_CHARACTERS.map((v) => {
            const isSelected = selectedVoice === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVoice(v.id)}
                className={`relative flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20 shadow-xs'
                    : 'border-slate-200/80 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-300'
                }`}
              >
                <div
                  className={`mt-0.5 h-7 w-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                    v.gender === 'Ayol'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {v.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-900">{v.name}</span>
                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-md bg-slate-200/60 text-slate-600">
                      {v.gender}
                    </span>
                    {v.recommended && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                        TOP
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{v.description}</p>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 text-teal-600">
                    <Check className="h-4 w-4 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Style Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
          Nutq ohangi va kayfiyat:
        </label>
        <div className="flex flex-wrap gap-2">
          {STYLE_OPTIONS.map((style) => {
            const isSelected = selectedStyle === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => setSelectedStyle(style.id)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                  isSelected
                    ? 'border-teal-500 bg-teal-600 text-white font-semibold shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {style.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tempo Slider */}
      <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-teal-600" />
            <span>Nutq tezligi (Tempo):</span>
          </label>
          <span className="text-xs font-extrabold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
            {tempo.toFixed(1)}x
          </span>
        </div>
        <input
          type="range"
          min={0.5}
          max={2.0}
          step={0.1}
          value={tempo}
          onChange={(e) => setTempo(parseFloat(e.target.value))}
          className="w-full accent-teal-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
        />
        <div className="flex justify-between text-[11px] text-slate-400 font-medium pt-0.5">
          <span>Sekin (0.5x)</span>
          <span>Normal (1.0x)</span>
          <span>Tez (2.0x)</span>
        </div>
      </div>

      {/* Main CTA Button */}
      <button
        onClick={onSynthesize}
        disabled={disabled || isSynthesizing}
        type="button"
        className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 hover:from-teal-600 hover:to-cyan-600 text-white font-bold text-sm py-4 px-6 shadow-lg shadow-teal-500/25 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2.5"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {isSynthesizing ? (
          <>
            <RefreshCw className="h-5 w-5 animate-spin text-white" />
            <span>Ovoz Sintez Qilinmoqda (Gemini AI)...</span>
          </>
        ) : (
          <>
            <Volume2 className="h-5 w-5 text-teal-100 group-hover:scale-110 transition-transform" />
            <span className="tracking-wide">Matnni Ovozga Sintez Qilish</span>
          </>
        )}
      </button>
    </div>
  );
};
