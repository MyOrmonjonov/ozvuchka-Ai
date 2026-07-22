import React from 'react';
import { Volume2, Cpu, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 p-0.5 shadow-md shadow-teal-500/20 flex items-center justify-center">
            <div className="h-full w-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Volume2 className="h-5 w-5 text-teal-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                O‘zbek Ovoz <span className="text-teal-600">AI</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full shadow-sm">
                AI SPEECH
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Eng ilg'or ovoz sintezlovchi platformasi
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 text-slate-700 text-xs font-medium">
          <Cpu className="h-3.5 w-3.5 text-teal-600" />
          <span>Eng so'nggi <strong className="font-semibold text-slate-900">gemini-3.1-flash-tts-preview</strong> modeli</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping ml-0.5"></span>
        </div>
      </div>
    </header>
  );
};
