import tokens from '@/design/Default.tokens.json';
import extras from '@/design/extras.tokens.json';
import { duration, easeExit, easeInOut, easeOut, indicatorSlide, timing } from '@/lib/motion';

// Phase 0 test page: every token rendered from its CSS variable, so a wrong or missing
// variable shows up as an empty swatch. Not linked from the app — open /tokens directly.

type Group = Record<string, { $value: unknown }>;
const isFractional = (k: string) => /\d-\d/.test(k) || k === '106';

export default function TokensPage() {
  const colorGroups = tokens.color as unknown as Record<string, Group>;
  const spacing = Object.keys(tokens.spacing).filter((k) => !isFractional(k));
  const radii = Object.keys(tokens.radius).filter((k) => !isFractional(k));
  const sizes = Object.keys(tokens.typography['font-size']).filter((k) => !isFractional(k) || /-5$/.test(k));

  return (
    <main className="min-h-screen bg-background-app p-28 text-text-primary">
      <h1 className="text-26 font-600 tracking-px-0-52">Hop tokens</h1>
      <p className="mt-4 text-14 leading-20 text-text-secondary">
        Rendered from styles/tokens.css (generated from design/Default.tokens.json). Fractional History-only values are hidden.
      </p>

      {Object.entries(colorGroups).map(([group, entries]) => (
        <section key={group} className="mt-24">
          <h2 className="text-13 font-600">color/{group}</h2>
          <div className="mt-8 flex flex-wrap gap-8">
            {Object.keys(entries).map((name) => (
              <div key={name} className="w-[120px] rounded-8 border border-surface-border-tint bg-surface-default p-6">
                <div className="h-[40px] rounded-6 border border-surface-border-tint" style={{ background: `var(--color-${group}-${name})` }} />
                <div className="mt-6 text-11 font-500">{name}</div>
                <div className="text-11 text-text-muted">{String((entries[name].$value as { hex: string }).hex)}</div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-24">
        <h2 className="text-13 font-600">spacing</h2>
        <div className="mt-8 flex flex-col gap-4">
          {spacing.map((k) => (
            <div key={k} className="flex items-center gap-8 text-11">
              <span className="w-[32px] text-text-secondary">{k}</span>
              <span className="h-[10px] bg-selection" style={{ width: `var(--spacing-${k})` }} />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-24">
        <h2 className="text-13 font-600">radius</h2>
        <div className="mt-8 flex flex-wrap gap-8">
          {radii.map((k) => (
            <div key={k} className="flex flex-col items-center gap-4 text-11 text-text-secondary">
              <span className="size-[48px] border border-text-primary bg-surface-subtle" style={{ borderRadius: `var(--radius-${k})` }} />
              {k}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-24">
        <h2 className="text-13 font-600">type (Geist)</h2>
        <div className="mt-8 flex flex-col gap-4">
          {sizes.map((k) => (
            <div key={k} style={{ fontSize: `var(--text-${k})` }}>
              {k}px — Good afternoon, Amara · $2,480 · 18.2k
            </div>
          ))}
        </div>
      </section>

      <section className="mt-24">
        <h2 className="text-13 font-600">Figma styles (extras)</h2>
        <div className="mt-8 flex flex-wrap gap-12">
          {Object.keys(extras.gradient).map((k) => (
            <div key={k} className="flex flex-col items-center gap-4 text-11 text-text-secondary">
              <span className="size-[48px] rounded-6" style={{ background: `var(--gradient-${k})` }} />
              {k}
            </div>
          ))}
          {Object.keys(extras.shadow).map((k) => (
            <div key={k} className="flex flex-col items-center gap-4 text-11 text-text-secondary">
              <span className="size-[48px] rounded-8 bg-surface-default" style={{ boxShadow: `var(--shadow-${k})` }} />
              {k}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-24 text-12 text-text-secondary">
        <h2 className="text-13 font-600 text-text-primary">motion (lib/motion.ts)</h2>
        <pre className="mt-8">{JSON.stringify({ duration, easeOut, easeExit, easeInOut, indicatorSlide, timing }, null, 2)}</pre>
      </section>
    </main>
  );
}
