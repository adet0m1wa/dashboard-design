// Seeded randomness for the prototype's generated data (last week's days, every order since the
// store opened): varied, but the same on every load.

/** mulberry32: tiny, seedable, good enough for picking rows. */
export function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rand = () => number;

export const between = (r: Rand, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));

export function pick<T>(r: Rand, items: readonly T[], n: number): T[] {
  const pool = [...items];
  const out: T[] = [];
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
  return out;
}

/** Splits `total` into whole parts by `weights`, largest remainder, so they add up exactly. */
export function split(total: number, weights: number[]) {
  const sum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (total * w) / sum);
  const parts = raw.map(Math.floor);
  const order = raw.map((v, i) => [v - Math.floor(v), i] as const).sort((a, b) => b[0] - a[0]);
  const left = total - parts.reduce((a, b) => a + b, 0); // counted once: it shrinks as parts grow
  for (let k = 0; k < left; k++) parts[order[k][1]]++;
  return parts;
}
