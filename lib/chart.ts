import { area, curveMonotoneX, line } from 'd3-shape';

// Chart geometry, read from the Figma "Chart lines" drawing (docs/DESIGN_NOTES.md > Chart geometry).
// The plot is 720×150. Day i sits at x = 12 + 116·i. A value v maps to y = 140 − v/max · 118,
// so zero is at y 140 and the chart max at y 22. The baseline is drawn at y 146.
export const CHART = {
  width: 720,
  height: 150,
  baseline: 146,
  zeroY: 140,
  topY: 22,
  x0: 12,
  step: 116,
  split: 360, // where this week's solid baseline turns dashed (today)
} as const;

export const xAt = (i: number) => CHART.x0 + i * CHART.step;
export const yAt = (v: number, max: number) => CHART.zeroY - (v / max) * (CHART.zeroY - CHART.topY);

type Pt = [number, number];
const points = (values: number[], max: number): Pt[] => values.map((v, i) => [xAt(i), yAt(v, max)]);

const lineGen = line<Pt>()
  .x((d) => d[0])
  .y((d) => d[1])
  .curve(curveMonotoneX);

const areaGen = area<Pt>()
  .x((d) => d[0])
  .y0(CHART.baseline)
  .y1((d) => d[1])
  .curve(curveMonotoneX);

export const linePath = (values: number[], max: number) => lineGen(points(values, max)) ?? '';
export const areaPath = (values: number[], max: number) => areaGen(points(values, max)) ?? '';
