// The prototype's clock. "Now" is 2:30 PM (brief A7). Each question and each page marker moves
// it on one minute, which reproduces the frames exactly: ask at 2:31, move page at 2:32, ask at 2:33.
export const START_MINUTES = 14 * 60 + 30;

export function clockLabel(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}
