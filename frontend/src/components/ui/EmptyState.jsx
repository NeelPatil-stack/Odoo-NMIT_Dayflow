import { Inbox } from 'lucide-react';

/**
 * EmptyState — Centre-aligned empty-state illustration component.
 *
 * Props:
 *   icon        {LucideIcon}  — icon component to render (default: Inbox)
 *   title       {string}      — main heading
 *   description {string}      — supporting text
 *   action      {string}      — CTA button label (omit to hide button)
 *   onAction    {function}    — CTA callback
 *   className   {string}      — extra wrapper classes
 */
function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description = 'There is no data to display at the moment.',
  action,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center select-none ${className}`}
    >
      {/* Glowing icon ring */}
      <div className="relative mb-6">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-primary-600/10 blur-xl scale-150 pointer-events-none" />
        <div className="relative w-20 h-20 rounded-2xl bg-dark-800 border border-white/[0.06] flex items-center justify-center shadow-card">
          <Icon size={36} className="text-primary-400 opacity-80" strokeWidth={1.5} />
        </div>
      </div>

      {/* Text */}
      <h3 className="text-base font-semibold text-gray-200 mb-1.5">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed">{description}</p>

      {/* CTA */}
      {action && onAction && (
        <button onClick={onAction} className="btn-primary mt-6">
          {action}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
