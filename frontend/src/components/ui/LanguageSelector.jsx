import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSelector({ className = '' }) {
  const { lang, setLang } = useLanguage();

  return (
    <div className={`inline-flex items-center gap-1 bg-slate-100/90 border border-slate-200 p-1 rounded-[12px] text-xs font-bold ${className}`}>
      <Globe className="w-3.5 h-3.5 text-[#145DA0] ml-1 shrink-0" />
      <button
        onClick={() => setLang('en')}
        className={`px-2 py-1 rounded-[8px] transition-all cursor-pointer ${
          lang === 'en'
            ? 'bg-white text-[#0B2D5C] font-extrabold shadow-xs'
            : 'text-slate-500 hover:text-[#0B2D5C]'
        }`}
      >
        English
      </button>
      <button
        onClick={() => setLang('mr')}
        className={`px-2 py-1 rounded-[8px] transition-all cursor-pointer ${
          lang === 'mr'
            ? 'bg-[#0B2D5C] text-white font-extrabold shadow-xs'
            : 'text-slate-500 hover:text-[#0B2D5C]'
        }`}
      >
        मराठी
      </button>
      <button
        onClick={() => setLang('hi')}
        className={`px-2 py-1 rounded-[8px] transition-all cursor-pointer ${
          lang === 'hi'
            ? 'bg-[#0B2D5C] text-white font-extrabold shadow-xs'
            : 'text-slate-500 hover:text-[#0B2D5C]'
        }`}
      >
        हिंदी
      </button>
    </div>
  );
}
