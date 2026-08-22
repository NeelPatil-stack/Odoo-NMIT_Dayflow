import { useState } from 'react';
import { MessageSquareHeart, X, HeartPulse, ShieldCheck, Sparkles } from 'lucide-react';
import WellnessChatbot from './WellnessChatbot';

export default function FloatingChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <div className="relative w-[360px] sm:w-[420px] shadow-2xl rounded-2xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 shadow-md transition-transform hover:scale-105"
            title="Minimize Assistant"
          >
            <X className="w-4 h-4" />
          </button>
          <WellnessChatbot fullPage={false} />
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl border border-indigo-500/30 transition-all hover:scale-105 active:scale-95"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-indigo-600/40 flex items-center justify-center text-indigo-300">
              <MessageSquareHeart className="w-4 h-4" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
          </div>

          <div className="text-left pr-1">
            <p className="text-xs font-bold leading-tight flex items-center gap-1">
              MindCare AI <Sparkles className="w-3 h-3 text-amber-400" />
            </p>
            <p className="text-[10px] text-slate-300 font-medium">Stress & Workplace Support</p>
          </div>
        </button>
      )}
    </div>
  );
}
