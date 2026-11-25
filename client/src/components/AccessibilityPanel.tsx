import React from 'react';
import { useAccessibility, TextScale } from '../context/AccessibilityContext';
import { useTranslation } from '../context/LanguageContext';
import {
  Eye,
  Type,
  Activity,
  Mic,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export default function AccessibilityPanel() {
  const {
    highContrast,
    setHighContrast,
    textScale,
    setTextScale,
    reducedMotion,
    setReducedMotion,
    isListening,
    startSpeechInput,
    stopSpeechInput,
    speakText,
    stopSpeaking,
    isSpeaking,
    isPanelOpen,
    setIsPanelOpen,
  } = useAccessibility();

  const { t } = useTranslation();

  if (!isPanelOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setIsPanelOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-modal-title"
    >
      <div
        className="card max-w-lg w-full p-6 space-y-5 border border-cyber-600/40 shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyber-600/20 border border-cyber-500/40 flex items-center justify-center text-cyber-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h2 id="a11y-modal-title" className="text-base font-bold text-white">
                {t('a11y.title')}
              </h2>
              <p className="text-xs text-slate-400">
                Customise sensory and motor accessibility preferences
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPanelOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close Accessibility Controls"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* High Contrast Mode */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-200">{t('a11y.highContrast')}</div>
                <div className="text-slate-500 text-[11px]">
                  Pure black backgrounds with high-luminance borders and fonts
                </div>
              </div>
            </div>
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                highContrast ? 'bg-cyber-500' : 'bg-slate-700'
              }`}
              aria-pressed={highContrast}
              aria-label="Toggle High Contrast Mode"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  highContrast ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Text Size Scaling */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Type className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-200">{t('a11y.textSize')}</div>
                <div className="text-slate-500 text-[11px]">
                  Scales fonts proportionally across all navigation and forms
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {(
                [
                  { id: 'normal', label: t('a11y.normal') },
                  { id: 'large', label: t('a11y.large') },
                  { id: 'xlarge', label: t('a11y.xlarge') },
                ] as { id: TextScale; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTextScale(opt.id)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    textScale === opt.id
                      ? 'bg-cyber-600/30 border-cyber-500 text-white'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-200">{t('a11y.reducedMotion')}</div>
                <div className="text-slate-500 text-[11px]">
                  Suppresses pulsating radars, spinning loaders, and transitions
                </div>
              </div>
            </div>
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                reducedMotion ? 'bg-cyber-500' : 'bg-slate-700'
              }`}
              aria-pressed={reducedMotion}
              aria-label="Toggle Reduced Motion"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  reducedMotion ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Voice Input & Text-to-Speech Controls */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="font-semibold text-slate-200 flex items-center gap-2">
                <Mic className="w-4 h-4 text-rose-400" />
                {t('a11y.speechInput')}
              </div>
              <p className="text-[11px] text-slate-500">
                Dictate descriptions directly into forms without keyboard
              </p>
              <button
                onClick={() => {
                  if (isListening) stopSpeechInput();
                  else startSpeechInput((text) => alert(`Transcript received: ${text}`));
                }}
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                {isListening ? t('a11y.stopListening') : 'Test Voice Input'}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="font-semibold text-slate-200 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                {t('a11y.textToSpeech')}
              </div>
              <p className="text-[11px] text-slate-500">
                Reads current case status, alerts, and instructions aloud
              </p>
              <button
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  else
                    speakText(
                      'CRIMEVERSE AI Accessible Screen Reader active. All investigation and citizen complaint features are operational and ready.'
                    );
                }}
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  isSpeaking
                    ? 'bg-emerald-600 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" /> Stop Speaking
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" /> Test Audio TTS
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Keyboard navigation quick tips */}
        <div className="p-3 rounded-xl bg-cyber-950/40 border border-cyber-600/20 text-[11px] text-slate-400 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-cyber-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Keyboard Navigation Tip:</strong> Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Tab</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Shift+Tab</kbd> to cycle focus through all interactive elements with high-visibility cyan focus rings.
          </span>
        </div>

        <button
          onClick={() => setIsPanelOpen(false)}
          className="w-full btn-primary text-xs justify-center py-2.5"
        >
          Apply Preferences
        </button>
      </div>
    </div>
  );
}
