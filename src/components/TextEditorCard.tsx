import React, { useState } from 'react';
import { Type, Sparkles, RefreshCw, AlertCircle, FileText } from 'lucide-react';
import { PresetChip } from '../types';

interface TextEditorCardProps {
  text: string;
  setText: (text: string) => void;
  onEnhanceText: () => Promise<void>;
  isEnhancing: boolean;
}

const PRESET_CHIPS: PresetChip[] = [
  {
    id: 'salom',
    emoji: '💬',
    label: 'Salomlashish',
    text: "Assalomu alaykum! O'zbek ovoz sun'iy intellekt xizmatiga xush kelibsiz. Bugun sizga qanday yordam bera olaman?",
  },
  {
    id: 'news',
    emoji: '📰',
    label: 'Yangiliklar',
    text: "Xayrli kun, hurmatli tinglovchilar! Bugun poytaxtimizda eng so'nggi zamonaviy AI texnologiyalari ko'rgazmasi o'z ishini boshladi.",
  },
  {
    id: 'poem',
    emoji: '✨',
    label: "She'riyat",
    text: "O'zbekiston, ey ona vatan, sening tuprog'ing muqaddasdir. Har bir giyohing, har bir irmog'ing biz uchun aziz va qadrlidir.",
  },
  {
    id: 'science',
    emoji: '🔬',
    label: "Ilmiy ma'ruzalar",
    text: "Inson miyasi neyronlari faoliyati va ularning matematik modellari zamonaviy sun'iy intellekt tizimlarining poydevorini tashkil etadi.",
  },
];

export const TextEditorCard: React.FC<TextEditorCardProps> = ({
  text,
  setText,
  onEnhanceText,
  isEnhancing,
}) => {
  const maxLength = 1200;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= maxLength) {
      setText(val);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
      {/* Title & Char Counter */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
            <Type className="h-4 w-4" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            O'zbekcha matn kiritish
          </h2>
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/60">
          <span className={text.length >= maxLength ? 'text-amber-600 font-bold' : 'text-slate-700'}>
            {text.length}
          </span>{' '}
          / {maxLength} belgi
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="O'zbek tilidagi matningizni shu yerga kiriting. O' va g' tutuq belgilariga e'tibor bering, bu ovoz sintezini yanada tabiiy va jozibali qiladi..."
          rows={5}
          className="w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all resize-none shadow-inner bg-slate-50/50"
        />
        {text.length > 0 && (
          <button
            onClick={() => setText('')}
            className="absolute top-3 right-3 text-xs text-slate-400 hover:text-slate-600 bg-white/80 hover:bg-slate-100 px-2 py-1 rounded-md border border-slate-200/80 transition-colors"
          >
            Tozalash
          </button>
        )}
      </div>

      {/* Preset Chips */}
      <div>
        <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wider">
          Tayyor andozalar:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_CHIPS.map((chip) => (
            <button
              key={chip.id}
              onClick={() => setText(chip.text)}
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-teal-50/60 hover:border-teal-300 text-xs font-medium text-slate-700 hover:text-teal-900 transition-all text-left group shadow-2xs"
            >
              <span className="text-sm group-hover:scale-110 transition-transform">{chip.emoji}</span>
              <span className="truncate">{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Actions and Info Caption */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <button
          onClick={onEnhanceText}
          disabled={isEnhancing || !text.trim()}
          type="button"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold text-xs shadow-md shadow-teal-600/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
        >
          {isEnhancing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin text-white" />
              <span>Imlo va grammatika tahrirlanmoqda...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-cyan-200" />
              <span>Tahrirlash va Imlo to‘g‘rilash (Gemini 3.5-Flash)</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-slate-500 flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5 text-teal-600 shrink-0" />
          <span>Imlo to'g'rilash o' va g' harflarini, tinish belgilarini chiroyli tekshiradi.</span>
        </p>
      </div>
    </div>
  );
};
