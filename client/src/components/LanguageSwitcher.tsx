import React, { useState, useRef, useEffect } from 'react';
import { useTranslation, SupportedLanguage } from '../context/LanguageContext';
import { Globe, Check, ChevronDown } from 'lucide-react';

export default function LanguageSwitcher() {
  const { language, setLanguage, languages } = useTranslation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = languages.find((l) => l.code === language) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 hover:border-cyber-500/50 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-all shadow-sm"
        aria-label={`Current language: ${current.name}. Click to change language.`}
        aria-expanded={open}
      >
        <Globe className="w-3.5 h-3.5 text-cyber-400" />
        <span className="hidden sm:inline">{current.nativeName}</span>
        <span className="sm:hidden uppercase">{current.code}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 py-1.5 rounded-xl bg-slate-900 border border-cyber-600/30 shadow-2xl z-50 animate-fade-in divide-y divide-slate-800/60">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Select Language (11 Languages)
          </div>
          <div className="max-h-72 overflow-y-auto py-1 space-y-0.5">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLanguage(l.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                  language === l.code
                    ? 'bg-cyber-600/20 text-cyber-300 font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{l.flag}</span>
                  <div>
                    <span className="font-medium text-slate-200">{l.nativeName}</span>
                    <span className="text-[10px] text-slate-500 ml-1.5 font-normal">({l.name})</span>
                  </div>
                </div>
                {language === l.code && <Check className="w-3.5 h-3.5 text-cyber-400 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
