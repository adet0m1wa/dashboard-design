import extras from '@/design/extras.tokens.json';

// Layout numbers the code needs as numbers, read from the layout tokens (one source of truth).
export const PANEL_MAX = extras.layout.panel.value; // the side panel's default and widest
export const PANEL_MIN = extras.layout['panel-min'].value; // the narrowest it can be dragged

// When the window is too narrow for the open sidebar + the narrowest page area + the Hop panel
// (8 + 224 + 8 + 720 + 368 + 8 = 1336 — tokens sidebar, main-min, panel, and the app padding),
// the sidebar starts collapsed and folds away as the window crosses that width. She can still
// open it; it only changes again at the next crossing.
export const NARROW_WINDOW = '(max-width: 1335px)';

// The fade at the bottom of the chat: the standard scroll fade — a fixed 48px (brief B7.2, from the
// Inventory frame) whenever there's more below, none once the last message is in view.
export const CHAT_FADE = 48;
