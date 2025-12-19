import { LessonBundle } from '../types';

/**
 * Downloads a JSON object as a file with a specified filename.
 * @param data The JSON object to download.
 * @param filename The name of the file (e.g., "lesson.thirds").
 */
export const downloadJson = (data: object, filename: string): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Loads a .thirds lesson bundle from a File object.
 * @param file The .thirds File object.
 * @returns A Promise that resolves with the parsed LessonBundle.
 */
export const loadLessonBundle = (file: File): Promise<LessonBundle> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (event.target && event.target.result) {
          const jsonString = event.target.result as string;
          const bundle: LessonBundle = JSON.parse(jsonString);
          // Basic validation to ensure it's a valid bundle structure
          if (bundle && typeof bundle.name === 'string' && Array.isArray(bundle.images)) {
            resolve(bundle);
          } else {
            reject(new Error("Invalid lesson bundle format."));
          }
        } else {
          reject(new Error("Failed to read file."));
        }
      } catch (e) {
        reject(new Error("Error parsing lesson bundle: " + e));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

/**
 * Downloads a Base64 data URL as a PNG image.
 * @param dataUrl The Base64 data URL of the PNG image.
 * @param filename The name of the file (e.g., "results-badge.png").
 */
export const downloadPng = (dataUrl: string, filename: string): void => {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};