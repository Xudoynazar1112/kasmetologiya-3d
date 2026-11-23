import { Calendar, Pause, Play, RotateCcw, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DOCTOR_INTRO_CHAPTERS } from '../data/clinicData';
import { ResilientImage } from './ResilientImage';

interface DoctorIntroModalProps {
  open: boolean;
  onClose: () => void;
  onOpenBooking: () => void;
}

const TOTAL_SECONDS = 80; // 1:20

function formatTime(sec: number): string {
  const clamped = Math.max(0, Math.min(TOTAL_SECONDS, Math.floor(sec)));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function DoctorIntroModal({ open, onClose, onOpenBooking }: DoctorIntroModalProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSec, setCurrentSec] = useState(0);

  useEffect(() => {
    if (!open) return;
    setCurrentSec(0);
    setIsPlaying(true);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !isPlaying) return;
    const timer = window.setInterval(() => {
      setCurrentSec((prev) => {
        if (prev >= TOTAL_SECONDS) {
          setIsPlaying(false);
          return TOTAL_SECONDS;
        }
        return Number((prev + 0.2).toFixed(1));
      });
    }, 200);
    return () => window.clearInterval(timer);
  }, [open, isPlaying]);

  const activeChapter = useMemo(() => {
    return (
      DOCTOR_INTRO_CHAPTERS.find(
        (ch) => currentSec >= ch.startSec && currentSec < ch.endSec,
      ) || DOCTOR_INTRO_CHAPTERS[DOCTOR_INTRO_CHAPTERS.length - 1]
    );
  }, [currentSec]);

  if (!open) return null;

  const progressPct = (currentSec / TOTAL_SECONDS) * 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#070306]/88"
      role="dialog"
      aria-modal="true"
      aria-labelledby="doctor-intro-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[900px] bg-[#160A13] border border-[#F4A5C0]/20 rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F4A5C0]/12">
          <div>
            <p className="text-[12px] text-[#E5C185] font-medium">
              Video tanishuv · Dr. Dilnoza Cosmetologist
            </p>
            <h3
              id="doctor-intro-modal-title"
              className="font-display text-[24px] font-semibold text-[#F9EEF3] leading-tight"
            >
              Doktor bilan tanishing (1:20)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Oynani yopish"
            className="w-10 h-10 inline-flex items-center justify-center rounded-md border border-[#F4A5C0]/18 text-[#F9EEF3] hover:bg-[#241120] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Presentation Frame */}
        <div className="relative aspect-[16/9] bg-[#0D060B] overflow-hidden">
          <div
            key={activeChapter.id}
            className="absolute inset-0 transition-transform duration-[6000ms] ease-out"
            style={{ transform: isPlaying ? 'scale(1.06)' : 'scale(1.01)' }}
          >
            <ResilientImage
              src={activeChapter.image}
              alt={activeChapter.title}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Contrast scrim for legible captioning */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#0D060B] via-[#0D060B]/40 to-transparent"
            aria-hidden="true"
          />

          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col gap-3">
            <div className="flex items-center gap-3 text-[12px] text-[#E5C185] font-mono-num">
              <span>{activeChapter.timeRange}</span>
              <span aria-hidden="true">·</span>
              <span className="font-sans text-[#F4A5C0] font-medium">{activeChapter.title}</span>
            </div>
            <p className="text-[16px] sm:text-[18px] text-[#F9EEF3] leading-relaxed max-w-[66ch]">
              {activeChapter.caption}
            </p>

            {/* Playback controls */}
            <div className="pt-2 space-y-2.5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (currentSec >= TOTAL_SECONDS) {
                      setCurrentSec(0);
                      setIsPlaying(true);
                    } else {
                      setIsPlaying((p) => !p);
                    }
                  }}
                  className="w-10 h-10 inline-flex items-center justify-center rounded-md bg-[#E86B94] hover:bg-[#F182A7] text-[#14070F] transition-colors cursor-pointer shrink-0"
                  aria-label={isPlaying ? 'Pauza' : 'Ijro etish'}
                >
                  {currentSec >= TOTAL_SECONDS ? (
                    <RotateCcw className="w-4 h-4" />
                  ) : isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </button>

                <div className="flex-1 flex flex-col gap-1">
                  <input
                    type="range"
                    min={0}
                    max={TOTAL_SECONDS}
                    step={0.5}
                    value={currentSec}
                    aria-label="Video vaqt chizig‘i"
                    onChange={(e) => setCurrentSec(parseFloat(e.target.value))}
                    className="w-full accent-[#E86B94] cursor-pointer"
                  />
                  <div className="h-[2px] w-full bg-white/10 rounded overflow-hidden">
                    <div
                      className="h-full bg-[#E86B94] transition-all duration-150"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                <span className="font-mono-num text-[12px] text-[#F9EEF3]/85 whitespace-nowrap">
                  {formatTime(currentSec)} / 1:20
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters selector & CTA */}
        <div className="p-5 sm:p-6 bg-[#130810] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
            {DOCTOR_INTRO_CHAPTERS.map((ch, idx) => {
              const selected = ch.id === activeChapter.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    setCurrentSec(ch.startSec);
                    setIsPlaying(true);
                  }}
                  className={`text-left px-3 py-2 rounded-md border transition-colors cursor-pointer ${
                    selected
                      ? 'bg-[#251120] border-[#E86B94]/60 text-[#F9EEF3]'
                      : 'bg-[#180B14] border-[#F4A5C0]/10 text-[#B89EA9] hover:text-[#F9EEF3]'
                  }`}
                >
                  <div className="font-mono-num text-[11px] text-[#E5C185]">0{idx + 1} · {ch.timeRange.split(' ')[0]}</div>
                  <div className="text-[12px] font-medium truncate mt-0.5">{ch.title}</div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenBooking();
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-[13px] font-semibold bg-[#E86B94] hover:bg-[#F182A7] text-[#14070F] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Qabulga yozilish</span>
          </button>
        </div>
      </div>
    </div>
  );
}
