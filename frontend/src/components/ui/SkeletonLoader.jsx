/**
 * SkeletonLoader — Skeleton loading components using the design system's
 * `.skeleton` class (shimmer animation defined in index.css).
 *
 * Exports:
 *   SkeletonCard   — card-shaped placeholder
 *   SkeletonTable  — table rows placeholder
 *   SkeletonText   — text lines placeholder
 */

/* ───────────────────────────────────────────────────────── helpers ── */
const Skel = ({ className = '' }) => (
  <div className={`skeleton rounded-xl ${className}`} />
);

/* ───────────────────────────────────────── SkeletonCard ── */
/**
 * SkeletonCard
 * Props: count {number} — number of cards to render (default 4)
 */
export function SkeletonCard({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Skel className="h-3.5 w-24" />
            <Skel className="h-9 w-9 rounded-xl" />
          </div>
          <Skel className="h-8 w-20 mt-1" />
          <Skel className="h-2.5 w-32 opacity-60" />
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────────────────────── SkeletonTable ── */
/**
 * SkeletonTable
 * Props:
 *   rows    {number} — number of body rows (default 6)
 *   columns {number} — number of columns (default 5)
 */
export function SkeletonTable({ rows = 6, columns = 5 }) {
  return (
    <div className="glass overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 border-b border-white/[0.06] bg-dark-900/50">
        {Array.from({ length: columns }).map((_, i) => (
          <Skel key={i} className="h-3 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex gap-4 px-4 py-3.5 border-b border-white/[0.04] last:border-0"
        >
          {Array.from({ length: columns }).map((_, c) => (
            <Skel
              key={c}
              className={`h-3 flex-1 ${c === 0 ? 'w-8 flex-none' : ''}`}
              style={{ opacity: 1 - r * 0.07 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────────────────────── SkeletonText ── */
/**
 * SkeletonText
 * Props:
 *   lines   {number}  — number of text lines (default 3)
 *   header  {boolean} — render a large heading skeleton first
 */
export function SkeletonText({ lines = 3, header = false }) {
  const widths = ['w-full', 'w-5/6', 'w-4/6', 'w-3/4', 'w-2/3', 'w-1/2'];
  return (
    <div className="space-y-2.5">
      {header && <Skel className="h-7 w-48 mb-4" />}
      {Array.from({ length: lines }).map((_, i) => (
        <Skel
          key={i}
          className={`h-3 ${widths[i % widths.length]}`}
          style={{ opacity: 1 - i * 0.1 }}
        />
      ))}
    </div>
  );
}

/* Default export: all three for convenience */
const SkeletonLoader = { SkeletonCard, SkeletonTable, SkeletonText };
export default SkeletonLoader;
