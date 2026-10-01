'use client';

// A small segmented control (Sales "All · To pack · …", the Customers inbox tabs), in the week
// toggle's look: the chosen option sits on a white thumb. It switches at once — a filter is used
// many times a day (Emil Kowalski; user feedback 2026-10-01 on instant switching).
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  stretch = false,
}: {
  label: string;
  options: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (id: T) => void;
  stretch?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={`flex items-center gap-2 rounded-9 bg-surface-subtle p-3 ${stretch ? 'w-full' : ''}`}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.id)}
            className={`flex items-center justify-center gap-4 rounded-6 px-10 py-5 text-12 whitespace-nowrap ${stretch ? 'flex-1' : ''} ${
              on ? 'bg-surface-default font-500 text-text-primary shadow-toggle-thumb' : 'font-400 text-text-secondary hover:text-text-primary'
            }`}
          >
            {o.label}
            {o.count !== undefined && <span className={`tabular-nums ${on ? 'text-text-secondary' : 'text-text-muted'}`}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
