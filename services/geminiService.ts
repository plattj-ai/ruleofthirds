import { GoogleGenAI, Type } from '@google/genai';
import { ImageBundleItem, FeedbackEmoji, GeminiServiceResult, GeminiFeedbackResponse, StudentObservationData, GeminiOverallSummaryResult, GeminiOverallSummaryResponse } from '../types';

/**
 * Initializes the GoogleGenAI client with the API key from environment variables.
 * This function should be called right before making an API call to ensure the latest API key is used.
 */
const getGeminiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error('API_KEY is not defined in environment variables.');
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getGeminiFeedback = async (
  image: ImageBundleItem,
  observations: string[],
): Promise<GeminiServiceResult> => {
  try {
    // Always create a new client to ensure the latest API key is used
    const ai = getGeminiClient();

    const prompt = `You are a friendly, encouraging, and organized Middle School Technology Teacher.
  You are giving feedback to a 6th-grade student on their observations about the Rule of Thirds in an image.
  Provide 3-4 concise, analytical sentences that help students see the design like a pro.
  
  CRITICAL: Use vocabulary and terminology appropriate for 11-12 year olds (6th graders). 
  Instead of "compositional impact," use "how it guides the viewer's eye" or "how it makes the picture feel balanced."
  Instead of "visual hierarchy," talk about "what catches your eye first."
  Keep the analysis strong and thoughtful, but accessible. Avoid being an over-enthusiastic cheerleader.

  Here is the image the student is observing:
  [Image provided]

  Here are the student's observations:
  ${observations.map((obs, i) => `${i + 1}. ${obs}`).join('\n')}

  Based on these observations and the image, provide constructive feedback.
  Critically evaluate if the observations actually demonstrate understanding of the Rule of Thirds.
  Connections between placement and the "feeling" or "story" of the photo are key.
  
  Then, assess the quality of their observations by choosing one of the following:
  - 'excellent' (🌟): For highly insightful and precise observations that clearly connect elements to Rule of Thirds principles.
  - 'good' (😊): For accurate but somewhat general observations.
  - 'ponder' (🧐): For observations that are vague or show some misunderstanding.
  - 'poor' (🙁): For observations that are largely inaccurate or off-topic.

  Also, provide a single, actionable tip (1-2 sentences) for next time, using simple words.

  Your response MUST be in JSON format:
  {
    "feedback": "Your analytical feedback here.",
    "emoji": "excellent" | "good" | "ponder" | "poor",
    "tip": "An actionable tip for next time."
  }
  `;

    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: image.base64.split(',')[1],
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: { type: Type.STRING },
            emoji: { type: Type.STRING, enum: ['excellent', 'good', 'ponder', 'poor'] },
            tip: { type: Type.STRING },
          },
          required: ['feedback', 'emoji'],
          propertyOrdering: ['feedback', 'emoji', 'tip'],
        },
        temperature: 0.7,
        maxOutputTokens: 300,
        thinkingConfig: { thinkingBudget: 50 },
      },
    });

    let jsonStr = response.text.trim();
    if (jsonStr.startsWith('```json')) jsonStr = jsonStr.substring(7);
    if (jsonStr.endsWith('```')) jsonStr = jsonStr.substring(0, jsonStr.length - 3);

    try {
      const parsedResponse = JSON.parse(jsonStr) as GeminiFeedbackResponse;
      return { feedback: parsedResponse.feedback, emoji: parsedResponse.emoji, tip: parsedResponse.tip };
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      return { error: `AI feedback format error. Please try again.` };
    }

  } catch (apiError) {
    console.error('Gemini API call failed:', apiError);
    return { error: `Failed to get feedback from AI.` };
  }
};

export const getGeminiOverallSummary = async (
  studentObservations: StudentObservationData[],
): Promise<GeminiOverallSummaryResult> => {
  try {
    const ai = getGeminiClient();

    const allFeedback = studentObservations.map((data, index) => {
      const status = data.emoji === FeedbackEmoji.EXCELLENT ? 'Excellent' : data.emoji === FeedbackEmoji.GOOD ? 'Good' : data.emoji === FeedbackEmoji.POOR ? 'Poor' : 'Needs Work';
      return `Image ${index + 1}:
      Observations: "${data.observations.join('", "')}"
      Feedback: "${data.feedback}"
      Status: ${status}`;
    }).join('\n\n');

    const prompt = `You are a friendly, encouraging, and organized Middle School Technology Teacher.
  A 6th-grade student has just completed a Rule of Thirds practice session.
  Below is a summary of their work.

  ${allFeedback}

  Based on this, provide a concise overall summary of their work (3-4 sentences).
  IMPORTANT: Use vocabulary that a 6th grader (11-12 years old) will understand and feel proud of. 
  Explain their progress in terms of "becoming a better visual storyteller" or "growing their design eye."
  
  Then, choose an overall emoji:
  - 'excellent' (🌟): Consistent strong understanding.
  - 'good' (😊): Good progress and understanding.
  - 'ponder' (🧐): Needs more attention to foundations.
  - 'poor' (🙁): Difficulty applying principles, needs significant practice.

  Your response MUST be in JSON format:
  {
    "summary": "Your overall summary here (3-4 sentences).",
    "overallEmoji": "excellent" | "good" | "ponder" | "poor"
  }
  `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ text: prompt }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            overallEmoji: { type: Type.STRING, enum: ['excellent', 'good', 'ponder', 'poor'] },
          },
          required: ['summary', 'overallEmoji'],
          propertyOrdering: ['summary', 'overallEmoji'],
        },
        temperature: 0.7,
        maxOutputTokens: 300,
        thinkingConfig: { thinkingBudget: 50 },
      },
    });

    let jsonStr = response.text.trim();
    if (jsonStr.startsWith('```json')) jsonStr = jsonStr.substring(7);
    if (jsonStr.endsWith('```')) jsonStr = jsonStr.substring(0, jsonStr.length - 3);

    try {
      const parsedResponse = JSON.parse(jsonStr) as GeminiOverallSummaryResponse;
      return { summary: parsedResponse.summary, overallEmoji: parsedResponse.overallEmoji };
    } catch (parseError) {
      console.error('Failed to parse Gemini overall summary JSON:', parseError);
      return { error: `AI summary format error. Please try again.` };
    }

  } catch (apiError) {
    console.error('Gemini API call for overall summary failed:', apiError);
    return { error: `Failed to get overall summary from AI.` };
  }
};

export const checkAndRequestApiKey = async () => {
  if (typeof window !== 'undefined' && (window as any).aistudio && typeof (window as any).aistudio.hasSelectedApiKey === 'function') {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
    }
  }
};
