import { GoogleGenAI, Type } from '@google/genai';
import { ImageBundleItem, FeedbackEmoji, GeminiServiceResult, GeminiFeedbackResponse, StudentObservationData, GeminiOverallSummaryResult, GeminiOverallSummaryResponse } from '../types';

/**
 * A simple singleton queue to ensure AI requests are processed sequentially
 * and to manage retry logic for rate limits.
 */
class AIRequestQueue {
  private queue: Promise<any> = Promise.resolve();
  private maxRetries = 5; // Increased retries for better success on free tier
  private baseDelay = 3000; // Increased base delay to 3 seconds

  /**
   * Adds a task to the sequential queue with automatic retry logic.
   */
  async enqueue<T>(task: () => Promise<T>): Promise<T> {
    const queuedTask = async (): Promise<T> => {
      let lastError: any;
      for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
        try {
          return await task();
        } catch (error: any) {
          lastError = error;
          
          // Check for 429 Rate Limit error in various places
          const errorMsg = error?.message || '';
          const isRateLimit = errorMsg.includes('429') || error?.status === 429 || errorMsg.includes('RESOURCE_EXHAUSTED');
          
          if (isRateLimit && attempt < this.maxRetries) {
            let delay = this.baseDelay * Math.pow(2, attempt);

            // Attempt to extract specific retry delay from the error message if provided by Google
            try {
              // The error message often contains a JSON string
              const jsonStart = errorMsg.indexOf('{');
              if (jsonStart !== -1) {
                const jsonStr = errorMsg.substring(jsonStart);
                const parsedError = JSON.parse(jsonStr);
                
                // Look for retryDelay in the error details (format: "28.345s")
                const retryInfo = parsedError?.error?.details?.find((d: any) => d.retryDelay || d['@type']?.includes('RetryInfo'));
                const specificDelayStr = retryInfo?.retryDelay;
                
                if (specificDelayStr && typeof specificDelayStr === 'string') {
                  const seconds = parseFloat(specificDelayStr.replace('s', ''));
                  if (!isNaN(seconds)) {
                    // Add 1 second buffer to be safe
                    delay = (seconds + 1) * 1000;
                  }
                }
              }
            } catch (e) {
              // If parsing fails, fall back to exponential backoff
            }

            console.warn(`AI is busy. Retrying in ${Math.round(delay/1000)}s... (Attempt ${attempt + 1}/${this.maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          throw error;
        }
      }
      throw lastError;
    };

    // Chain the task to the existing queue to ensure sequential processing
    const resultPromise = this.queue.then(() => queuedTask());
    // Update the queue head so the next request waits for this one (regardless of success/fail)
    this.queue = resultPromise.catch(() => {});
    return resultPromise;
  }
}

const aiQueue = new AIRequestQueue();

/**
 * Initializes the GoogleGenAI client with the API key from environment variables.
 */
const getGeminiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error('API_KEY is not defined. Please ensure the environment is configured correctly.');
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getGeminiFeedback = async (
  image: ImageBundleItem,
  observations: string[],
): Promise<GeminiServiceResult> => {
  return aiQueue.enqueue(async () => {
    try {
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
          maxOutputTokens: 400,
          thinkingConfig: { thinkingBudget: 50 },
        },
      });

      let jsonStr = response.text.trim();
      // Clean up potential markdown code blocks
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/```$/, '');
      }

      const parsedResponse = JSON.parse(jsonStr) as GeminiFeedbackResponse;
      return { 
        feedback: parsedResponse.feedback, 
        emoji: parsedResponse.emoji, 
        tip: parsedResponse.tip 
      };

    } catch (apiError: any) {
      console.error('Gemini API call failed:', apiError);
      // Clean up the error message for the student UI
      let displayError = "The AI is a bit busy right now.";
      if (apiError?.message?.includes('429') || apiError?.message?.includes('quota')) {
        displayError = "We've reached the AI's daily limit for now. Please try again in a little while!";
      } else if (apiError?.message) {
        displayError = "Oops! Something went wrong while getting feedback. Let's try again.";
      }
      return { error: displayError };
    }
  });
};

export const getGeminiOverallSummary = async (
  studentObservations: StudentObservationData[],
): Promise<GeminiOverallSummaryResult> => {
  return aiQueue.enqueue(async () => {
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
    Explain their progress in terms of "becoming a better visual storyteller" or "growing your design eye."
    
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
          maxOutputTokens: 400,
          thinkingConfig: { thinkingBudget: 50 },
        },
      });

      let jsonStr = response.text.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/```$/, '');
      }

      const parsedResponse = JSON.parse(jsonStr) as GeminiOverallSummaryResponse;
      return { summary: parsedResponse.summary, overallEmoji: parsedResponse.overallEmoji };

    } catch (apiError: any) {
      console.error('Gemini API call for overall summary failed:', apiError);
      return { error: "I couldn't put your summary together just yet. The AI is taking a quick break!" };
    }
  });
};

export const checkAndRequestApiKey = async () => {
  if (typeof window !== 'undefined' && (window as any).aistudio && typeof (window as any).aistudio.hasSelectedApiKey === 'function') {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
    }
  }
};
