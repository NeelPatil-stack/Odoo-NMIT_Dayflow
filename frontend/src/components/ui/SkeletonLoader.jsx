import React from 'react';

/**
 * Skeleton Loader Component (Section 28 requirement)
 * Very subtle shimmer placeholders for Dashboard KPI cards, Employee table, Attendance, Reports.
 */
const Skel = ({ className = '', style }) => (
  <div
    className={`animate-pulse bg-slate-200/80 rounded-[10px] ${className}`}
    style={style}
  />
);

export function SkeletonCard({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Skel className="h-3 w-20" />
            <Skel className="h-9 w-9 rounded-[12px]" />
          </div>
          <Skel className="h-7 w-16 mt-1" />
          <Skel className="h-2.5 w-24 opacity-60" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 5 }) {
  return (
    <div className="table-container bg-white overflow-hidden">
      <div className="flex gap-4 px-4 py-3.5 border-b border-slate-100 bg-slate-50/80">
        {Array.from({ length: columns }).map((_, i) => (
          <Skel key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 px-4 py-3.5 border-b border-slate-100/60 last:border-0">
          {Array.from({ length: columns }).map((_, c) => (
            <Skel key={c} className="h-3 flex-1" style={{ opacity: 1 - r * 0.08 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3, header = false }) {
  const widths = ['w-full', 'w-5/6', 'w-3/4', 'w-2/3', 'w-1/2'];
  return (
    <div className="space-y-2.5">
      {header && <Skel className="h-6 w-44 mb-3" />}
      {Array.from({ length: lines }).map((_, i) => (
        <Skel key={i} className={`h-3 ${widths[i % widths.length]}`} />
      ))}
    </div>
  );
}

const SkeletonLoader = { SkeletonCard, SkeletonTable, SkeletonText };
export default SkeletonLoader;
