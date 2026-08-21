import React from 'react';
import Logo from './Logo';

export default function LoadingScreen({ message = 'लोड होत आहे...' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F7F9FC] animate-fade-in">
      <div className="flex flex-col items-center space-y-4">
        {/* Animated Brand Logo */}
        <div className="animate-pulse">
          <Logo size="xl" />
        </div>

        {/* Subtle Line Shimmer Bar */}
        <div className="w-40 h-1 bg-slate-200 rounded-full overflow-hidden relative">
          <div className="absolute inset-y-0 bg-gradient-to-r from-[#0B2D5C] via-[#145DA0] to-[#F59A23] w-1/2 rounded-full animate-[slideUp_1s_infinite_alternate]" />
        </div>

        {/* Marathi subtitle */}
        <p className="text-xs font-semibold text-slate-500 tracking-wide font-marathi">
          {message}
        </p>
      </div>
    </div>
  );
}
