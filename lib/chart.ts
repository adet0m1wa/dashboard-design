import { area, curveMonotoneX, line } from 'd3-shape';

// Chart geometry, read from the Figma "Chart lines" drawing (docs/DESIGN_NOTES.md > Chart geometry).
// The plot is 150 tall and as wide as its box (720 in the Analytics frames, wider when the
// sidebars are collapsed — "example 2"). The first and last days sit 12px in from the edges and
// the days are spread evenly between (720 wide → x = 12 + 116·i). A share of the chart max, r,
// maps to y = 140 − r · 118, so zero is at y 140 and the max at y 22. The baseline is at y 146.
export const CHART = {
  width: 720, // the Figma width, used until the box has been measured
  height: 150,
  baseline: 146,
  zeroY: 140,
  topY: 22,
  x0: 12,
} as const;

const DAYS = 7;

export const yAt = (ratio: number) => CHART.zeroY - ratio * (CHART.zeroY - CHART.topY);

type Pt = [number, number];

const lineGen = line<Pt>()
  .x((d) => d[0])
  .y((d) => d[1])
  .curve(curveMonotoneX);

const areaGen = area<Pt>()
  .x((d) => d[0])
  .y0(CHART.baseline)
  .y1((d) => d[1])
  .curve(curveMonotoneX);

/** Everything that depends on the plot's width. `ratios` are values ÷ the KPI's chart max. */
export function chartGeometry(width: number) {
  const step = (width - 2 * CHART.x0) / (DAYS - 1);
  const xAt = (i: number) => CHART.x0 + i * step;
  const points = (ratios: number[]): Pt[] => ratios.map((r, i) => [xAt(i), yAt(r)]);
  return {
    width,
    step,
    xAt,
    /** Nearest day to an x position inside the plot. */
    dayAt: (x: number) => Math.round((x - CHART.x0) / step),
    linePath: (ratios: number[]) => lineGen(points(ratios)) ?? '',
    areaPath: (ratios: number[]) => areaGen(points(ratios)) ?? '',
  };
}

export type ChartGeometry = ReturnType<typeof chartGeometry>;
