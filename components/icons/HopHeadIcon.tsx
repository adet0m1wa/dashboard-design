import type { SVGProps } from 'react';

// The custom Analytics nav icon (Figma "Nav/Home" > Icon): a Hop head outline.
// Figma builds it from bordered boxes; this is the same geometry as an SVG, with strokes
// inset by half their width so they sit inside each box exactly like the Figma borders.
export function HopHeadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false" {...props}>
      {/* Head: 13×13 at (1.5, 1.5), border 1.162, radius 3.5 */}
      <rect x="2.081" y="2.081" width="11.838" height="11.838" rx="2.919" stroke="currentColor" strokeWidth="1.162" />
      {/* Face screen: 9.533×6.933 at (3.23, 3.13), border 1.138, radius 1.75 */}
      <rect x="3.799" y="3.699" width="8.395" height="5.795" rx="1.181" stroke="currentColor" strokeWidth="1.138" />
      {/* Eyes: 1.625×3.25, radius 1.061 — the border fills them solid */}
      <rect x="5.4" y="4.97" width="1.625" height="3.25" rx="0.8" fill="currentColor" />
      <rect x="8.65" y="4.97" width="1.625" height="3.25" rx="0.8" fill="currentColor" />
    </svg>
  );
}
