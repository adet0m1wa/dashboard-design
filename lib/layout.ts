// When the window is too narrow for the open sidebar + the narrowest page area + the Hop panel
// (8 + 224 + 8 + 720 + 368 + 8 = 1336 — tokens sidebar, main-min, panel, and the app padding),
// the sidebar starts collapsed and folds away as the window crosses that width. She can still
// open it; it only changes again at the next crossing.
export const NARROW_WINDOW = '(max-width: 1335px)';
