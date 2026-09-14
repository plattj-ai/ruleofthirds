import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ImageBundleItem, GridColor, StudentObservationData, FeedbackEmoji, GeminiServiceResult, UIIcon } from '../types';
import Button from './Button';
import { GRID_COLOR_MAP, OBSERVATION_PROMPT, OBSERVATION_CLUES, NON_ANSWER_KEYWORDS, FEEDBACK_EMOJI_COMPONENTS, UI_ICON_COMPONENTS } from '../constants';
import { getGeminiFeedback } from '../services/geminiService';
import { fileToBase64 } from '../utils/imageUtils';

interface CoachingPageProps {
  image: ImageBundleItem;
  currentImageIndex: number;
  totalImages: number;
  onNextImage: () => void;
  onSaveObservationsAndFeedback: (index: number, observations: string[], feedback: string, tip: string | undefined, emoji: FeedbackEmoji) => void;
  observationsData: StudentObservationData;
  isFreePlay?: boolean;
  onUploadAnotherFreePlayImage?: (image: ImageBundleItem) => void;
  onExitPractice?: () => void;
}

const CoachingPage: React.FC<CoachingPageProps> = ({
  image,
  currentImageIndex,
  totalImages,
  onNextImage,
  onSaveObservationsAndFeedback,
  observationsData,
  isFreePlay = false,
  onUploadAnotherFreePlayImage,
  onExitPractice,
}) => {
  const [gridColor, setGridColor] = useState<GridColor>(GridColor.WHITE);
  const [showGrid, setShowGrid] = useState<boolean>(true); // New state for toggling grid visibility
  const [observations, setObservations] = useState<string[]>(observationsData.observations.concat(Array(5 - observationsData.observations.length).fill('')));
  const [isFeedbackLoading, setIsFeedbackLoading] = useState<boolean>(false);
  const [feedbackResult, setFeedbackResult] = useState<GeminiServiceResult | null>(null); // Stores the full GeminiServiceResult
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);
  const [showNonAnswerWarning, setShowNonAnswerWarning] = useState<boolean>(false); // New state for non-answer warning
  const [showCluesModal, setShowCluesModal] = useState<boolean>(false); // Pop-up for clues/help

  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const freePlayInputRef = useRef<HTMLInputElement>(null);

  const handleFreePlayChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const base64 = await fileToBase64(file);
        setObservations(['', '', '', '', '']);
        setFeedbackResult(null);
        setApiErrorMessage(null);
        setShowNonAnswerWarning(false);
        onUploadAnotherFreePlayImage?.({
          base64,
          name: file.name || 'Uploaded Photo',
        });
      } catch (err) {
        console.error('Error loading image in free play:', err);
      }
    }
    if (freePlayInputRef.current) {
      freePlayInputRef.current.value = '';
    }
  };

  // Reset observations and feedback when image changes
  useEffect(() => {
    setObservations(observationsData.observations.concat(Array(5 - observationsData.observations.length).fill('')));
    // Initialize feedbackResult from observationsData if feedback exists
    if (observationsData.feedback && observationsData.emoji) {
      setFeedbackResult({
        feedback: observationsData.feedback,
        emoji: observationsData.emoji,
        tip: observationsData.tip,
      });
    } else {
      setFeedbackResult(null);
    }
    setApiErrorMessage(null);
    setShowNonAnswerWarning(false); // Reset warning on image change
  }, [image, observationsData]);


  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;

    if (!canvas || !img || !showGrid) return; // Only draw if grid is visible

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate image dimensions within its object-contain frame
    const imgContainerWidth = img.parentElement?.clientWidth || 0;
    const imgContainerHeight = img.parentElement?.clientHeight || 0;

    const imgNaturalWidth = img.naturalWidth;
    const imgNaturalHeight = img.naturalHeight;

    let renderedImageWidth: number;
    let renderedImageHeight: number;
    let offsetX: number;
    let offsetY: number;

    const containerAspectRatio = imgContainerWidth / imgContainerHeight;
    const imageAspectRatio = imgNaturalWidth / imgNaturalHeight;

    if (imageAspectRatio > containerAspectRatio) {
      // Image is wider than container, height is constrained
      renderedImageWidth = imgContainerWidth;
      renderedImageHeight = imgContainerWidth / imageAspectRatio;
      offsetX = 0;
      offsetY = (imgContainerHeight - renderedImageHeight) / 2;
    } else {
      // Image is taller than container, width is constrained
      renderedImageHeight = imgContainerHeight;
      renderedImageWidth = imgContainerHeight * imageAspectRatio;
      offsetX = (imgContainerWidth - renderedImageWidth) / 2;
      offsetY = 0;
    }

    // Set canvas size to match the image container, as it will overlay the image within the container
    canvas.width = imgContainerWidth;
    canvas.height = imgContainerHeight;

    // Convert Tailwind classes to actual colors for canvas drawing
    let lineColor: string;
    let dotCircleColor: string;

    switch (gridColor) {
      case GridColor.WHITE:
        lineColor = '#FFFFFF';
        dotCircleColor = '#1F2937'; // Slate-800
        break;
      case GridColor.RED:
        lineColor = '#EF4444'; // Red-500
        dotCircleColor = '#1F2937'; // Slate-800
        break;
      case GridColor.GREEN:
        lineColor = '#22C55E'; // Green-500
        dotCircleColor = '#1F2937'; // Slate-800
        break;
      case GridColor.YELLOW:
        lineColor = '#F59E0B'; // Yellow-500
        dotCircleColor = '#BE185D'; // Fuchsia-700 (inverse of yellow dots logic)
        break;
      default:
        lineColor = '#FFFFFF';
        dotCircleColor = '#1F2937';
        break;
    }


    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2; // Grid line thickness
    ctx.setLineDash([5, 5]); // Dashed lines for clarity

    // Draw vertical lines
    const thirdWidth = renderedImageWidth / 3;
    ctx.beginPath();
    ctx.moveTo(offsetX + thirdWidth, offsetY);
    ctx.lineTo(offsetX + thirdWidth, offsetY + renderedImageHeight);
    ctx.moveTo(offsetX + 2 * thirdWidth, offsetY);
    ctx.lineTo(offsetX + 2 * thirdWidth, offsetY + renderedImageHeight);
    ctx.stroke();

    // Draw horizontal lines
    const thirdHeight = renderedImageHeight / 3;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY + thirdHeight);
    ctx.lineTo(offsetX + renderedImageWidth, offsetY + thirdHeight);
    ctx.moveTo(offsetX, offsetY + 2 * thirdHeight);
    ctx.lineTo(offsetX + renderedImageWidth, offsetY + 2 * thirdHeight);
    ctx.stroke();

    // Draw intersection dots
    ctx.fillStyle = dotCircleColor;
    ctx.setLineDash([]); // Solid fill for dots
    const dotRadius = 6;

    const intersectionPoints = [
      { x: offsetX + thirdWidth, y: offsetY + thirdHeight },
      { x: offsetX + 2 * thirdWidth, y: offsetY + thirdHeight },
      { x: offsetX + thirdWidth, y: offsetY + 2 * thirdHeight },
      { x: offsetX + 2 * thirdWidth, y: offsetY + 2 * thirdHeight },
    ];

    intersectionPoints.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [gridColor, showGrid]); // Add showGrid to dependencies

  // Redraw grid when image loads, grid color changes, container resizes, or grid visibility changes
  useEffect(() => {
    const img = imageRef.current;
    if (img && img.complete) {
      drawGrid();
    } else if (img) {
      img.onload = drawGrid;
    }

    const resizeObserver = new ResizeObserver(drawGrid);
    if (img?.parentElement) {
      resizeObserver.observe(img.parentElement);
    }

    // Clear canvas when grid is hidden
    if (!showGrid) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    return () => {
      if (img?.parentElement) {
        resizeObserver.disconnect();
      }
    };
  }, [drawGrid, image, showGrid]);

  const handleObservationChange = (index: number, value: string) => {
    setObservations((prev) => {
      const newObs = [...prev];
      newObs[index] = value;
      return newObs;
    });
    setShowNonAnswerWarning(false); // Hide warning if student starts typing again
    setApiErrorMessage(null);
  };

  const isExactNonAnswer = (obs: string) => {
    const trimmedLowerObs = obs.trim().toLowerCase();
    return NON_ANSWER_KEYWORDS.some(keyword => trimmedLowerObs === keyword);
  }

  const getValidObservations = () => {
    return observations.filter(obs => {
      const trimmedObs = obs.trim();
      return (
        trimmedObs !== '' && // Must not be empty
        !isExactNonAnswer(trimmedObs) // Must not be an exact non-answer keyword
      );
    });
  };

  const handleSubmitObservations = async () => {
    const initiallyValidObservations = getValidObservations();

    if (initiallyValidObservations.length < 3) {
      alert("Please make at least 3 thoughtful observations before submitting!");
      return;
    }

    // Check if any of the initially valid observations are actually non-answers
    const hasNonAnswer = initiallyValidObservations.some(isExactNonAnswer);

    if (hasNonAnswer) {
      setShowNonAnswerWarning(true);
      return;
    } else {
      setShowNonAnswerWarning(false); // Clear warning if all good
    }

    setIsFeedbackLoading(true);
    setFeedbackResult(null); // Clear previous feedback
    setApiErrorMessage(null);

    try {
      const result = await getGeminiFeedback(image, initiallyValidObservations);

      if (result.error) {
        setApiErrorMessage(result.error);
      } else if (result.feedback && result.emoji) {
        setFeedbackResult(result);
        setApiErrorMessage(null);
        onSaveObservationsAndFeedback(
          currentImageIndex,
          initiallyValidObservations, // Pass the filtered, valid observations
          result.feedback,
          result.tip,
          result.emoji // Pass emoji to parent
        );
      } else {
        setApiErrorMessage("The AI could not generate feedback right now. Please click Submit to try again.");
      }
    } catch (error) {
      console.error('Unexpected error during feedback submission:', error);
      setApiErrorMessage("Could not connect to the AI service. Please check your connection and try again.");
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  const FeedbackEmojiComponent = feedbackResult?.emoji ? FEEDBACK_EMOJI_COMPONENTS[feedbackResult.emoji] : null;
  const ObservationIconComponent = UI_ICON_COMPONENTS[UIIcon.OBSERVATION];
  const TipIconComponent = UI_ICON_COMPONENTS[UIIcon.TIP];

  const getEmojiTitle = (emoji: FeedbackEmoji) => {
    switch (emoji) {
      case FeedbackEmoji.EXCELLENT: return 'Excellent!';
      case FeedbackEmoji.GOOD: return 'Good Job!';
      case FeedbackEmoji.PONDER: return 'Let\'s think deeper!';
      case FeedbackEmoji.POOR: return 'Needs more practice!'; // New title for POOR emoji
      default: return 'Feedback';
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto my-8 w-full">
      {/* Left Side: Image and Grid Controls */}
      <div className="lg:w-1/2 p-6 bg-white shadow-xl rounded-lg flex flex-col items-center">
        {isFreePlay ? (
          <div className="w-full flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex-shrink-0">
                Free Play
              </span>
              <span className="text-sm font-semibold text-slate-700 truncate" title={image.name}>
                {image.name}
              </span>
            </div>
            <button
              type="button"
              onClick={() => freePlayInputRef.current?.click()}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors cursor-pointer flex-shrink-0 ml-2"
            >
              Upload Different Photo
            </button>
            <input
              type="file"
              ref={freePlayInputRef}
              onChange={handleFreePlayChange}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
            />
          </div>
        ) : (
          <h3 className="text-xl font-semibold text-slate-700 mb-4">
            Image {currentImageIndex + 1} of {totalImages}
          </h3>
        )}
        <div className="relative w-full aspect-square max-w-lg mb-4 bg-slate-100 border border-slate-200 rounded-lg overflow-hidden">
          <img
            ref={imageRef}
            src={image.base64}
            alt={image.name}
            className="absolute inset-0 w-full h-full object-contain"
            onLoad={drawGrid}
          />
          {showGrid && (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 z-10 pointer-events-none"
            />
          )}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className="absolute bottom-4 right-4 bg-slate-700 text-white px-3 py-1 rounded-full text-sm hover:bg-slate-800 transition-colors duration-200 shadow-md z-20"
            aria-label={showGrid ? "Hide Grid" : "Show Grid"}
            title={showGrid ? "Hide Grid" : "Show Grid"}
          >
            {showGrid ? 'Hide Grid' : 'Show Grid'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mt-2">
          <span className="text-slate-700 font-medium mr-2">Grid Color:</span>
          {Object.values(GridColor)
            .filter(color => color !== GridColor.PURPLE) // Filter out the dot inverse color
            .map((color) => {
              let bgColorClass: string;
              let defaultBorderClass: string; // Border when not selected

              switch (color) {
                case GridColor.WHITE:
                  bgColorClass = 'bg-white';
                  defaultBorderClass = 'border-slate-300'; // A visible border for white dot
                  break;
                case GridColor.RED:
                  bgColorClass = 'bg-red-500';
                  defaultBorderClass = 'border-red-500';
                  break;
                case GridColor.GREEN:
                  bgColorClass = 'bg-green-500';
                  defaultBorderClass = 'border-green-500';
                  break;
                case GridColor.YELLOW:
                  bgColorClass = 'bg-yellow-500';
                  defaultBorderClass = 'border-yellow-500';
                  break;
                default:
                  bgColorClass = 'bg-gray-200'; // Fallback
                  defaultBorderClass = 'border-gray-200';
                  break;
              }

              const isSelected = gridColor === color;

              return (
                <button
                  key={color}
                  onClick={() => setGridColor(color)}
                  className={`
                    w-8 h-8 rounded-full border-2 focus:outline-none focus:ring-2
                    cursor-pointer transition-all duration-200 ease-in-out
                    ${bgColorClass}
                    ${isSelected
                      ? `border-purple-500 ring-purple-500 ring-offset-gray-50 scale-110 shadow-md`
                      : `${defaultBorderClass} hover:border-purple-300 hover:scale-105`
                    }
                  `}
                  aria-label={`Set grid color to ${color}`}
                  title={`Set grid color to ${color}`}
                  disabled={!!feedbackResult} // Disable grid controls after feedback
                />
              );
            })}
        </div>
      </div>

      {/* Right Side: Directions, Input, and Feedback */}
      <div className="lg:w-1/2 p-6 bg-white shadow-xl rounded-lg flex flex-col">
        {feedbackResult ? (
          // Feedback Display Section
          <div className="flex flex-col h-full">
            <div className="bg-emerald-600 text-white rounded-lg p-6 mb-6 flex flex-col items-center">
              {FeedbackEmojiComponent && <FeedbackEmojiComponent className="w-20 h-20 mb-2 text-white" />}
              <h4 className="text-3xl font-bold mb-4">
                {feedbackResult.emoji ? getEmojiTitle(feedbackResult.emoji) : 'Feedback'}
              </h4>
            </div>

            <h4 className="flex items-center text-xl font-bold text-slate-800 mb-4 px-2">
              Feedback
            </h4>
            <p className="text-slate-700 leading-relaxed mb-6 px-2">{feedbackResult.feedback}</p>

            {feedbackResult.tip && (
              <div className="mt-4 p-4 bg-emerald-700 text-white rounded-lg flex-grow flex flex-col">
                <h5 className="flex items-center text-lg font-bold mb-2">
                  {TipIconComponent && <TipIconComponent className="w-5 h-5 mr-2 text-yellow-300" />}
                  Tip for next time:
                </h5>
                <p className="text-emerald-100 leading-relaxed">{feedbackResult.tip}</p>
              </div>
            )}

            {isFreePlay ? (
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end items-center w-full">
                <Button
                  variant="secondary"
                  onClick={onExitPractice}
                  className="w-full sm:w-auto px-5 py-2.5 text-sm order-2 sm:order-1"
                >
                  ← Back to Home
                </Button>
                <Button
                  onClick={() => freePlayInputRef.current?.click()}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium order-1 sm:order-2 flex items-center justify-center gap-2"
                >
                  <span>📸</span>
                  <span>Analyze Another Photo</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={onNextImage}
                className="mt-6 w-full sm:w-auto px-6 py-3 self-end"
              >
                {currentImageIndex < totalImages - 1 ? 'Next Image →' : 'Finish Practice!'}
              </Button>
            )}
          </div>
        ) : (
          // Observations Input Section
          <div className="flex flex-col h-full">
            <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
              {ObservationIconComponent && <ObservationIconComponent className="w-7 h-7 mr-2" />}
              Your Observations
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
              <p className="text-slate-600 leading-relaxed flex-grow">
                {OBSERVATION_PROMPT}
              </p>
              <button
                type="button"
                onClick={() => setShowCluesModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-sm font-semibold transition-colors cursor-pointer shadow-xs self-start flex-shrink-0"
                title="Click for clues to help you observe"
              >
                <span>💡</span>
                <span>Clues to look for</span>
              </button>
            </div>

            <div className="mb-4 space-y-3 flex-grow">
              {observations.map((obs, index) => (
                <div key={index} className="flex items-center">
                  <span className="text-slate-700 font-medium mr-3 w-4 text-right">{index + 1}.</span>
                  <input
                    type="text"
                    value={obs}
                    onChange={(e) => handleObservationChange(index, e.target.value)}
                    placeholder=""
                    className="flex-grow p-2.5 border border-slate-700 rounded-md focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white bg-slate-800 text-sm"
                    disabled={isFeedbackLoading}
                    aria-label={`Observation ${index + 1}`}
                  />
                </div>
              ))}
            </div>

            {showNonAnswerWarning && (
              <div className="p-3 mb-4 text-orange-700 bg-orange-50 border border-orange-200 rounded-md text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2-98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Please make sure your observations are thoughtful answers! Avoid phrases like "idk" or "nope." Keep up the great work! 😊
              </div>
            )}

            {apiErrorMessage && (
              <div className="p-3 mb-4 text-amber-900 bg-amber-50 border border-amber-300 rounded-md text-sm flex items-start gap-2">
                <span className="text-lg flex-shrink-0">⚠️</span>
                <div className="flex-grow">
                  <p className="font-semibold">{apiErrorMessage}</p>
                  <p className="text-xs text-amber-700 mt-0.5">Your observations were kept! Click "Submit Observations" to try again.</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-2">
              <span className="text-sm">
                {getValidObservations().length >= 3 ? (
                  <span className="text-emerald-700 font-medium flex items-center">
                    ✓ Ready to submit ({getValidObservations().length} of 3 required observations completed)
                  </span>
                ) : (
                  <span className="text-slate-500">
                    Write at least {3 - getValidObservations().length} more observation{3 - getValidObservations().length === 1 ? '' : 's'} to submit (minimum 3).
                  </span>
                )}
              </span>

              <Button
                onClick={handleSubmitObservations}
                disabled={getValidObservations().length < 3 || isFeedbackLoading}
                className="w-full sm:w-auto px-6 py-3 self-end"
              >
                {isFeedbackLoading ? 'Processing...' : 'Submit Observations →'}
              </Button>
            </div>

            {isFeedbackLoading && (
              <div className="flex items-center justify-center p-4 bg-slate-100 rounded-md text-slate-700 text-lg mt-4 text-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div>
                  <p className="font-semibold">Thinking about your excellent ideas...</p>
                  <p className="text-sm text-slate-500">If it takes a moment, your request is in line with the AI.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Clues To Look For Pop-up Modal */}
      {showCluesModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setShowCluesModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="clues-modal-title"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowCluesModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-lg leading-none cursor-pointer"
              aria-label="Close clues"
            >
              ✕
            </button>

            <div className="flex items-center gap-2.5 text-purple-800 mb-2">
              <span className="text-2xl leading-none">💡</span>
              <h4 id="clues-modal-title" className="text-xl font-bold text-slate-800">
                Clues to Look For
              </h4>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              Need help making observations? Ask yourself these questions while looking at the image and the grid lines:
            </p>

            <ul className="space-y-3 text-sm text-slate-700 mb-6 bg-purple-50/70 p-4 rounded-xl border border-purple-100">
              {OBSERVATION_CLUES.map((clue, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-purple-600 font-bold mt-0.5">•</span>
                  <span className="leading-snug">{clue}</span>
                </li>
              ))}
            </ul>

            <div className="flex justify-end">
              <Button
                onClick={() => setShowCluesModal(false)}
                className="px-5 py-2.5 text-sm"
              >
                Got it, thanks!
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachingPage;