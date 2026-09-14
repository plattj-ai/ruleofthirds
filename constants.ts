import { GridColor, FeedbackEmoji, UIIcon } from './types';
import React from 'react';
import { GoodJobEmoji, PonderEmoji, ExcellentEmoji, ObservationIcon, TipIcon, SummaryIcon, SadEmoji } from './components/SvgIcons';


export const GRID_COLOR_MAP: Record<GridColor, { line: string; dot: string; dotInverse: GridColor }> = {
  [GridColor.WHITE]: { line: 'stroke-white', dot: 'fill-slate-800', dotInverse: GridColor.PURPLE },
  [GridColor.RED]: { line: 'stroke-red-500', dot: 'fill-slate-800', dotInverse: GridColor.PURPLE },
  [GridColor.GREEN]: { line: 'stroke-green-500', dot: 'fill-slate-800', dotInverse: GridColor.PURPLE },
  [GridColor.YELLOW]: { line: 'stroke-yellow-500', dot: 'fill-slate-800', dotInverse: GridColor.PURPLE },
  [GridColor.PURPLE]: { line: 'stroke-fuchsia-700', dot: 'fill-slate-800', dotInverse: GridColor.YELLOW }, // Placeholder for dot inverse, if needed
};

export const OBSERVATION_PROMPT = `Take a close look at how the 3×3 grid divides the photo! Share 3 to 5 quick observations about where objects and spaces are placed on the grid.`;

export const OBSERVATION_CLUES = [
  "What is lined up along the vertical (up-and-down) or horizontal (side-to-side) lines?",
  "What lands right on the dots where lines cross (the sweet spots)?",
  "What fills the top, middle, or bottom rows?",
  "What fills the left, middle, or right columns?",
  "Where is the main subject located, and where is the open 'breathing room'?",
];

export const NON_ANSWER_KEYWORDS = [
  'idk', 'no', 'nope', 'idc', 'nah', 'dunno', 'n/a', 'nothing', 'skip', 'zero', 'none',
  'no idea', 'i don\'t know', 'i have no idea', 'don\'t know', 'no comment', 'empty', 'blank'
];

export const STUDENT_TITLES: Record<FeedbackEmoji, string[]> = {
  [FeedbackEmoji.GOOD]: [
    "Budding Balancer",
    "Composition Apprentice",
    "Insightful Observer",
  ],
  [FeedbackEmoji.PONDER]: [
    "Curious Composer",
    "Pattern Seeker",
    "Design Explorer",
  ],
  [FeedbackEmoji.EXCELLENT]: [
    "Master of Balance",
    "Composition Virtuoso",
    "Visual Alchemist",
  ],
  [FeedbackEmoji.POOR]: [ // New titles for POOR feedback
    "Visual Learner",
    "Composition Rookie",
    "Developing Designer",
  ],
};

export const FEEDBACK_EMOJI_COMPONENTS: Record<FeedbackEmoji, React.FC<{ className?: string }>> = {
  [FeedbackEmoji.GOOD]: GoodJobEmoji,
  [FeedbackEmoji.PONDER]: PonderEmoji,
  [FeedbackEmoji.EXCELLENT]: ExcellentEmoji,
  [FeedbackEmoji.POOR]: SadEmoji, // Map POOR to SadEmoji
};

export const UI_ICON_COMPONENTS: Record<UIIcon, React.FC<{ className?: string }>> = {
  [UIIcon.OBSERVATION]: ObservationIcon,
  [UIIcon.TIP]: TipIcon,
  [UIIcon.SUMMARY]: SummaryIcon, // New icon for overall summary
};