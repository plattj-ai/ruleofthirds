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
    // and to ensure API_KEY check is within the try block.
    const ai = getGeminiClient();

    const prompt = `You are a friendly, encouraging, and organized Middle School Technology Teacher.
  You are giving feedback to a 6th-grade student on their observations about the Rule of Thirds in an image.
  Provide 3-4 concise, analytical sentences that help students see the design like a pro.
  Avoid being an over-enthusiastic cheerleader.

  Here is the image the student is observing:
  [Image provided]

  Here are the student's observations:
  ${observations.map((obs, i) => `${i + 1}. ${obs}`).join('\n')}

  Based on these observations and the image, provide constructive feedback.
  Critically evaluate if the observations actually demonstrate understanding of the Rule of Thirds,
  rather than just describing elements. Connections between placement and compositional impact are key.
  Then, assess the quality of their observations and the image's use of the Rule of Thirds
  by choosing one of the following emojis:
  - 'excellent' (🌟): For highly insightful and precise observations that clearly connect elements to Rule of Thirds principles, demonstrating deep understanding of compositional impact.
  - 'good' (😊): For accurate but somewhat general observations, or when key elements are identified but the analysis of their compositional impact is slightly less detailed.
  - 'ponder' (🧐): For observations that are vague, mostly descriptive without strong compositional analysis, or show some misunderstanding. This encourages deeper thought.
  - 'poor' (🙁): For observations that are largely inaccurate, completely off-topic, provide no analytical value, or are clearly "non-answers" despite basic filtering.

  Also, provide a single, actionable tip (1-2 sentences) for next time, focusing on how they could improve their observations or apply the Rule of Thirds more effectively.

  Your response MUST be in JSON format, using the following schema:
  {
    "feedback": "Your analytical feedback here.",
    "emoji": "excellent" | "good" | "ponder" | "poor",
    "tip": "An actionable tip for next time."
  }
  `;

    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg', // Assuming images are generally JPEG or PNG
        data: image.base64.split(',')[1], // Extract base64 data part
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Suitable for basic text and image understanding
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: { type: Type.STRING },
            emoji: { type: Type.STRING, enum: ['excellent', 'good', 'ponder', 'poor'] }, // Added 'poor'
            tip: { type: Type.STRING }, // Optional tip
          },
          required: ['feedback', 'emoji'],
          propertyOrdering: ['feedback', 'emoji', 'tip'],
        },
        temperature: 0.7, // A bit more creative but still focused
        maxOutputTokens: 250, // Increased token limit to accommodate tip
        thinkingConfig: { thinkingBudget: 50 }, // Allow some thinking
      },
    });

    let jsonStr = response.text.trim();
    // In case the model adds markdown backticks, remove them
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.substring(7);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.substring(0, jsonStr.length - 3);
    }

    try {
      const parsedResponse = JSON.parse(jsonStr) as GeminiFeedbackResponse;
      return { feedback: parsedResponse.feedback, emoji: parsedResponse.emoji, tip: parsedResponse.tip };
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError, 'Raw response:', jsonStr);
      return { error: `AI feedback format error. Please try again. (Parsing failed: ${parseError instanceof Error ? parseError.message : String(parseError)}). Raw AI response: ${jsonStr.substring(0, Math.min(jsonStr.length, 100))}...` };
    }

  } catch (apiError) {
    console.error('Gemini API call failed:', apiError);
    return { error: `Failed to get feedback from AI. (API error: ${apiError instanceof Error ? apiError.message : String(apiError)})` };
  }
};

export const getGeminiOverallSummary = async (
  studentObservations: StudentObservationData[],
): Promise<GeminiOverallSummaryResult> => {
  try {
    const ai = getGeminiClient();

    const allFeedback = studentObservations.map((data, index) => {
      const status = data.emoji === FeedbackEmoji.EXCELLENT ? 'Excellent' : data.emoji === FeedbackEmoji.GOOD ? 'Good' : data.emoji === FeedbackEmoji.POOR ? 'Poor' : 'Needs Work'; // Added 'Poor' status
      return `Image ${index + 1}:
      Observations: "${data.observations.join('", "')}"
      Feedback: "${data.feedback}"
      Tip: "${data.tip || 'No specific tip provided.'}"
      Status: ${status}`;
    }).join('\n\n');

    const prompt = `You are a friendly, encouraging, and organized Middle School Technology Teacher.
  A 6th-grade student has just completed a Rule of Thirds practice session with ${studentObservations.length} images.
  Below is a summary of their observations and the feedback they received for each image.

  ${allFeedback}

  Based on the overall quality of their observations, feedback, and understanding of the Rule of Thirds across all images,
  provide a concise overall summary of their work (3-4 sentences).
  Then, choose one of the following emojis to represent their overall performance:
  - 'excellent' (🌟): Demonstrates consistent strong understanding and insightful observations.
  - 'good' (😊): Shows good progress and understanding, with some areas for continued growth.
  - 'ponder' (🧐): Indicates significant areas for improvement or a foundational misunderstanding that needs more attention.
  - 'poor' (🙁): Shows a consistent lack of understanding or difficulty in applying Rule of Thirds principles, requiring significant further practice.

  Your response MUST be in JSON format, using the following schema:
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
            overallEmoji: { type: Type.STRING, enum: ['excellent', 'good', 'ponder', 'poor'] }, // Added 'poor'
          },
          required: ['summary', 'overallEmoji'],
          propertyOrdering: ['summary', 'overallEmoji'],
        },
        temperature: 0.7,
        maxOutputTokens: 250,
        thinkingConfig: { thinkingBudget: 50 },
      },
    });

    let jsonStr = response.text.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.substring(7);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.substring(0, jsonStr.length - 3);
    }

    try {
      const parsedResponse = JSON.parse(jsonStr) as GeminiOverallSummaryResponse;
      return { summary: parsedResponse.summary, overallEmoji: parsedResponse.overallEmoji };
    } catch (parseError) {
      console.error('Failed to parse Gemini overall summary JSON:', parseError, 'Raw response:', jsonStr);
      return { error: `AI summary format error. Please try again. (Parsing failed: ${parseError instanceof Error ? parseError.message : String(parseError)}). Raw AI response: ${jsonStr.substring(0, Math.min(jsonStr.length, 100))}...` };
    }

  } catch (apiError) {
    console.error('Gemini API call for overall summary failed:', apiError);
    return { error: `Failed to get overall summary from AI. (API error: ${apiError instanceof Error ? apiError.message : String(apiError)})` };
  }
};

// Check API key selection for models that require it (e.g., Veo, Pro-image).
// Not strictly required for gemini-3-flash-preview, but good practice for other models.
export const checkAndRequestApiKey = async () => {
  // Only applicable if `window.aistudio` is available in the environment (e.g., Google AI Studio)
  if (typeof window !== 'undefined' && (window as any).aistudio && typeof (window as any).aistudio.hasSelectedApiKey === 'function') {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      console.warn("API key not selected. Opening key selection dialog.");
      await (window as any).aistudio.openSelectKey();
      // Assume key selection was successful after triggering openSelectKey()
      // A new GoogleGenAI instance will be created on the next call to getGeminiClient()
    }
  } else {
    // For local development or environments without aistudio, API_KEY from process.env is assumed.
    if (!process.env.API_KEY) {
      console.warn("API_KEY environment variable is not set. Please configure it for local testing.");
    }
  }
};