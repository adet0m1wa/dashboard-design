'use client';

import { createContext, useContext } from 'react';

// Whether this render of Analytics is the one-time first-load entrance (brief B7.1), plus the
// schedule every part of it follows so the sequence reads as one moment:
//   greeting fades in → KPI numbers count up → line draws → dots pop in → cards fade up.
export const INTRO = {
  greeting: 0,
  numbers: 0.08,
  line: 0.12, // draws for timing.lineDraw (600ms)
  dots: 0.42, // then one every timing.dotStagger (60ms)
  cards: 0.24, // then timing.cardStagger (40ms) apart
} as const;

export const IntroContext = createContext(false);
export const useIntro = () => useContext(IntroContext);
