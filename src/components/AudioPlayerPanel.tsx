import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Download,
  Disc,
  Volume2,
  Clock,
  Sparkles,
  FileText,
  RotateCcw,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { SynthesizedTrack } from '../types';
import {
  base64ToInt16Array,
  pcmToWavBlob,
  encodePcmToMp3,
  generateWaveformBars,
  formatSeconds,
} from '../utils/audio';

interface AudioPlayerPanelProps {
  activeTrack: SynthesizedTrack | null;
  tempo: number;
}

export const AudioPlayerPanel: React.FC<AudioPlayerPanelProps> = ({
  activeTrack,
  tempo,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [pcmSamples, setPcmSamples] = useState<Int16Array | null>(null);
  const [waveformBars, setWaveformBars] = useState<number[]>([]);
  const [wavUrl, setWavUrl] = useState<string | null>(null);
  const [mp3Blob, setMp3Blob] = useState<Blob | null>(null);
  const [mp3Url, setMp3Url] = useState<string | null>(null);
  const [isEncodingMp3, setIsEncodingMp3] = useState(false);

  // AudioContext & Analyser references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Process track audio data on activeTrack change
  useEffect(() => {
    if (!activeTrack) {
      setPcmSamples(null);
      setWaveformBars([]);
      setWavUrl(null);
      setMp3Blob(null);
      setMp3Url(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    try {
      setIsEncodingMp3(true);
      const samples = base64ToInt16Array(activeTrack.audioContentBase64);
      setPcmSamples(samples);

      // Generate Waveform bars
      const bars = generateWaveformBars(samples, 64);
      setWaveformBars(bars);

      // WAV Blob URL for HTML5 Audio playback
      const wav = pcmToWavBlob(samples, 24000);
      const url = URL.createObjectURL(wav);
      setWavUrl(url);

      // Encode PCM to MP3 via lamejs
      setTimeout(() => {
        const mp3 = encodePcmToMp3(samples, 24000, 128);
        if (mp3) {
          setMp3Blob(mp3);
          setMp3Url(URL.createObjectURL(mp3));
        }
        setIsEncodingMp3(false);
      }, 50);

      setIsPlaying(false);
      setCurrentTime(0);
    } catch (err) {
      console.error("Audio processing error:", err);
      setIsEncodingMp3(false);
    }

    return () => {
      if (wavUrl) URL.revokeObjectURL(wavUrl);
      if (mp3Url) URL.revokeObjectURL(mp3Url);
    };
  }, [activeTrack]);

  // Sync tempo changes to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = tempo;
    }
  }, [tempo]);

  // Audio element event handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      audioRef.current.playbackRate = tempo;
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Toggle Play / Pause
  const togglePlay = async () => {
    if (!audioRef.current || !wavUrl) return;

    // Initialize Web Audio API Analyser on first play
    if (!audioCtxRef.current) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;

        if (audioRef.current) {
          const source = ctx.createMediaElementSource(audioRef.current);
          source.connect(analyser);
          analyser.connect(ctx.destination);
          sourceNodeRef.current = source;
        }

        audioCtxRef.current = ctx;
        analyserRef.current = analyser;
      } catch (e) {
        console.warn("Web Audio API visualizer init warning:", e);
      }
    }

    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        audioRef.current.playbackRate = tempo;
        await audioRef.current.play();
        setIsPlaying(true);
        drawSpectrum();
      } catch (err) {
        console.error("Play error:", err);
      }
    }
  };

  // Seek timeline by percentage
  const handleSeek = (percentage: number) => {
    if (audioRef.current && duration > 0) {
      const newTime = (percentage / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Draw Web Audio API spectrum onto canvas
  const drawSpectrum = () => {
    if (!canvasRef.current || !analyserRef.current || !isPlaying) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!isPlaying) return;
      animFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#14b8a6'); // teal-500
        gradient.addColorStop(1, '#06b6d4'); // cyan-500

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

        x += barWidth + 2;
      }
    };

    render();
  };

  useEffect(() => {
    if (isPlaying) {
      drawSpectrum();
    } else if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
  }, [isPlaying]);

  // Download MP3 file
  const handleDownloadMp3 = () => {
    if (!mp3Url && !wavUrl) return;
    const downloadLink = document.createElement('a');
    downloadLink.href = mp3Url || wavUrl || '';
    downloadLink.download = `Ozbek_Ovoz_${activeTrack?.voiceName || 'Sintez'}_${Date.now()}.mp3`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Style badge display helper
  const getStyleLabel = (style: string) => {
    switch (style) {
      case 'natural': return 'Tabiiy';
      case 'cheerful': return 'Xushchaqchaq';
      case 'calm': return 'Sokin';
      case 'serious': return 'Jiddiy';
      case 'dramatic': return 'Dramatik';
      default: return style;
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-white shadow-xl flex flex-col justify-between min-h-[440px] relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Hidden HTML5 Audio Element */}
      {wavUrl && (
        <audio
          ref={audioRef}
          src={wavUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
      )}

      {/* Top Header Status */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              activeTrack ? 'bg-teal-400 animate-pulse shadow-sm shadow-teal-400' : 'bg-slate-600'
            }`}
          ></span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {activeTrack ? 'FAOL OVOZ TRACK' : 'KUTISH REJIMI'}
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/60">
          Mono 24kHz • MP3 128kbps
        </span>
      </div>

      {/* Main Content Body */}
      {!activeTrack ? (
        /* Empty / Waiting State */
        <div className="my-auto py-12 flex flex-col items-center justify-center text-center space-y-4 relative z-10">
          <div className="h-20 w-20 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center shadow-inner">
            <Disc className="h-10 w-10 text-slate-500 animate-[spin_8s_linear_infinite]" />
          </div>
          <div className="max-w-md space-y-2">
            <h3 className="text-base font-bold text-slate-200">
              Ovoz tayyorlanishi kutilmoqda
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hozircha hech qanday ovoz sintez qilinmadi. Sintez qilish tugmasini bosing yoki tayyor andozalardan birini tanlab ovoz hosil qiling.
            </p>
          </div>
        </div>
      ) : (
        /* Active Track Player State */
        <div className="py-4 space-y-6 relative z-10">
          {/* Metadata Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-800/50 p-3.5 rounded-xl border border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {activeTrack.voiceName} ovozi
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px] font-semibold">
                  {getStyleLabel(activeTrack.style)}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {tempo.toFixed(1)}x
                </span>
              </div>
              <p className="text-xs text-slate-400 italic truncate max-w-sm mt-1">
                "{activeTrack.text}"
              </p>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 shrink-0">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              <span>{activeTrack.formattedDate}</span>
            </div>
          </div>

          {/* SoundCloud-style Waveform Scrubber */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>{formatSeconds(currentTime)}</span>
              <span>{formatSeconds(duration)}</span>
            </div>

            <div className="h-16 w-full bg-slate-950/80 rounded-xl p-2.5 flex items-center gap-1 border border-slate-800/90 overflow-hidden cursor-pointer group">
              {waveformBars.map((heightPct, idx) => {
                const barProgressPct = (idx / waveformBars.length) * 100;
                const currentProgressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
                const isPassed = barProgressPct <= currentProgressPct;

                return (
                  <div
                    key={idx}
                    onClick={() => handleSeek(barProgressPct)}
                    className="flex-1 h-full flex items-center justify-center py-1 transition-all"
                  >
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-full transition-colors ${
                        isPassed
                          ? 'bg-gradient-to-t from-teal-500 to-cyan-400 shadow-sm shadow-teal-500/50'
                          : 'bg-slate-800 group-hover:bg-slate-700'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Controls & Real-Time Spectrum Canvas */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            {/* Circular Play / Pause CTA */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                type="button"
                className="h-14 w-14 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-400 text-slate-950 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-teal-500/30 flex items-center justify-center font-bold"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 fill-current" />
                ) : (
                  <Play className="h-6 w-6 fill-current ml-0.5" />
                )}
              </button>

              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  {isPlaying ? 'Ijro etilmoqda...' : 'Ovozni tinglash'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isPlaying ? 'Visualizer faol' : 'Play tugmasini bosing'}
                </span>
              </div>
            </div>

            {/* Web Audio Canvas Visualizer */}
            <div className="w-full sm:w-48 h-10 bg-slate-950/60 rounded-lg p-1 border border-slate-800 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={180}
                height={32}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* MP3 Export Section */}
          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="font-semibold text-slate-200">
                  LameJS yordamida tezkor MP3 o'tkazish yakunlandi.
                </span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">
                Yuklab olish formati: .mp3
              </span>
            </div>

            <button
              onClick={handleDownloadMp3}
              disabled={isEncodingMp3}
              type="button"
              className="w-full py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs tracking-wider uppercase shadow-md shadow-teal-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download className="h-4 w-4 stroke-[2.5]" />
              <span>TAYYOR MP3 YUKLASH</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer Details */}
      <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between items-center relative z-10">
        <span>O'zbek Ovoz AI Audio Engine</span>
        <span>24000 Hz Mono PCM</span>
      </div>
    </div>
  );
};
