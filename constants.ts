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

export const OBSERVATION_PROMPT = `Make 3-5 observations about how the grid was used to organize the image.
Tell me about where things are placed on the grid, like on lines or in specific spaces.
Notice what is in each row or column and in individual boxes.`;

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