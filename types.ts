export enum AppState {
  PAGE_LANDING,
  PAGE_TEACHER_MODE,
  PAGE_IMAGE_GALLERY,
  PAGE_COACHING,
  PAGE_ENDING,
}

export interface ImageBundleItem {
  base64: string;
  name: string;
}

export interface LessonBundle {
  name: string;
  images: ImageBundleItem[];
}

export enum GridColor {
  WHITE = 'white',
  RED = 'red',
  GREEN = 'green',
  YELLOW = 'yellow',
  PURPLE = 'purple', // For inverse dots
}

export enum FeedbackEmoji {
  GOOD = 'good',
  PONDER = 'ponder',
  EXCELLENT = 'excellent',
  POOR = 'poor', // Added for less effective observations
}

// Additional icons for UI elements, not strictly feedback emojis but custom SVGs
export enum UIIcon {
  OBSERVATION = 'observation',
  TIP = 'tip',
  SUMMARY = 'summary', // New icon for the overall summary
}

export interface StudentObservationData {
  image: ImageBundleItem;
  observations: string[];
  feedback: string | null;
  tip?: string;
  emoji: FeedbackEmoji | null; // Added to store the emoji directly
}

export interface GeminiFeedbackResponse {
  feedback: string;
  emoji: FeedbackEmoji;
  tip?: string; // Optional tip from the AI
}

// New type to handle potential parsing errors from the service
export interface GeminiServiceResult {
  feedback?: string; // The parsed feedback text
  emoji?: FeedbackEmoji; // The parsed emoji
  tip?: string; // The parsed tip
  error?: string; // An error message if something went wrong in the service
}

export interface GeminiOverallSummaryResponse {
  summary: string;
  overallEmoji: FeedbackEmoji;
}

export interface GeminiOverallSummaryResult {
  summary?: string;
  overallEmoji?: FeedbackEmoji;
  error?: string;
}