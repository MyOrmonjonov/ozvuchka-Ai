import React from 'react';
import { History, Trash2, Play, Pause, Volume2, Calendar } from 'lucide-react';
import { SynthesizedTrack } from '../types';

interface SynthesisHistoryProps {
  history: SynthesizedTrack[];
  activeTrackId: string | null;
  onSelectTrack: (track: SynthesizedTrack) => void;
  onDeleteTrack: (trackId: string) => void;
  onClearHistory: () => void;
}

export const SynthesisHistory: React.FC<SynthesisHistoryProps> = ({
  history,
  activeTrackId,
  onSelectTrack,
  onDeleteTrack,
  onClearHistory,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
            <History className="h-4 w-4" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Oxirgi sintez qilingan ovozlar
          </h2>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            type="button"
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/60 transition-colors flex items-center gap-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Tarixni tozalash</span>
          </button>
        )}
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="py-8 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700">
            Hali ovozlar sintez qilinmadi
          </p>
          <p className="text-xs text-slate-400">
            Siz yaratgan ovozlar shu yerda saqlanadi.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {history.slice(0, 6).map((track) => {
            const isActive = activeTrackId === track.id;
            return (
              <div
                key={track.id}
                onClick={() => onSelectTrack(track)}
                className={`group relative flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? 'border-teal-500 bg-teal-50/60 shadow-xs'
                    : 'border-slate-200/80 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                  <div
                    className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 font-bold ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-700 group-hover:bg-teal-100 group-hover:text-teal-700'
                    }`}
                  >
                    <Volume2 className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">
                        {track.voiceName} ovozi
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-600">
                        {track.style}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      "{track.text}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                    {track.formattedDate}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTrack(track.id);
                    }}
                    type="button"
                    title="O'chirish"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
