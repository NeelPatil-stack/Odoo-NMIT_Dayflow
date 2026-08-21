import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * EmptyState Component (Section 30 requirement)
 * Displays a clean, minimal illustration/icon with Marathi + English text and CTA button.
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title = 'सध्या कोणतीही माहिती नाही',
  description = 'येथे प्रदर्शित करण्यासाठी कोणताही डेटा आढळला नाही.',
  action,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center select-none ${className}`}>
      {/* Icon container with soft blue tint */}
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-[20px] bg-[#E6F0FA] border border-[#B7D5F2] flex items-center justify-center shadow-soft">
          <Icon size={28} className="text-[#145DA0]" strokeWidth={1.75} />
        </div>
      </div>

      {/* Title & Description */}
      <h3 className="text-base font-bold text-[#172033] mb-1 font-marathi">
        {title}
      </h3>
      <p className="text-xs font-medium text-slate-500 max-w-sm leading-relaxed">
        {description}
      </p>

      {/* CTA Button */}
      {action && onAction && (
        <button onClick={onAction} className="btn-primary btn-sm mt-5">
          {action}
        </button>
      )}
    </div>
  );
}
