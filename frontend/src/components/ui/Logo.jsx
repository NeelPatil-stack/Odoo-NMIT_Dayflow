import React from 'react';
import logoImg from '../../assets/logo.png';

/**
 * Reusable Brand/Logo Component (BrandLogo)
 * Strictly renders: [Logo Icon] कार्य-सेतु | KaaryaSetu
 * Fixed brand text that NEVER changes regardless of language selection.
 */
export default function Logo({ size = 'md', variant = 'full', className = '' }) {
  const sizes = {
    sm: { icon: 'w-7 h-7', text: 'text-xs sm:text-sm', gap: 'gap-2' },
    md: { icon: 'w-9 h-9', text: 'text-sm sm:text-base', gap: 'gap-2.5' },
    lg: { icon: 'w-12 h-12', text: 'text-lg sm:text-xl', gap: 'gap-3' },
    xl: { icon: 'w-16 h-16', text: 'text-xl sm:text-2xl', gap: 'gap-3.5' },
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div className={`inline-flex items-center ${currentSize.gap} ${className}`}>
      {/* Official Circular Logo Image */}
      <img
        src={logoImg}
        alt="कार्य-सेतु | KaaryaSetu Logo"
        className={`${currentSize.icon} shrink-0 object-contain rounded-full shadow-sm hover:scale-105 transition-transform duration-200`}
      />

      {variant !== 'icon' && (
        <div className="flex items-center gap-1.5 leading-none select-none font-sans whitespace-nowrap">
          <span className={`font-extrabold ${currentSize.text} text-[#0B2D5C] tracking-tight`}>
            कार्य-सेतु
          </span>
          <span className={`font-normal ${currentSize.text} text-[#145DA0]/60 mx-0.5`}>
            |
          </span>
          <span className={`font-semibold ${currentSize.text} text-[#145DA0] tracking-tight`}>
            KaaryaSetu
          </span>
        </div>
      )}
    </div>
  );
}
