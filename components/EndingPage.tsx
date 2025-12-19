import React, { useEffect, useState, useRef } from 'react';
import { StudentObservationData, FeedbackEmoji, GeminiOverallSummaryResult, UIIcon } from '../types';
import Button from './Button';
import { STUDENT_TITLES, FEEDBACK_EMOJI_COMPONENTS, UI_ICON_COMPONENTS } from '../constants';
import html2canvas from 'html2canvas'; // For converting HTML to Canvas/PNG
import { downloadPng } from '../utils/downloadUtils';
import { getGeminiOverallSummary } from '../services/geminiService'; // New AI service for overall summary

interface EndingPageProps {
  studentObservations: StudentObservationData[];
  onRestart: () => void;
}

const EndingPage: React.FC<EndingPageProps> = ({ studentObservations, onRestart }) => {
  const [overallEmoji, setOverallEmoji] = useState<FeedbackEmoji>(FeedbackEmoji.GOOD);
  const [studentTitle, setStudentTitle] = useState<string>('');
  const [overallSummary, setOverallSummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchOverallSummary = async () => {
      setIsSummaryLoading(true);
      setSummaryError(null);
      setOverallSummary(null); // Clear previous summary

      try {
        const result = await getGeminiOverallSummary(studentObservations);
        if (result.error) {
          setSummaryError(result.error);
          setOverallEmoji(FeedbackEmoji.POOR); // Indicate an error state visually with POOR emoji
          setStudentTitle(STUDENT_TITLES[FeedbackEmoji.POOR][0]); // Fallback title
        } else if (result.summary && result.overallEmoji) {
          setOverallSummary(result.summary);
          setOverallEmoji(result.overallEmoji);
          const titles = STUDENT_TITLES[result.overallEmoji];
          setStudentTitle(titles[Math.floor(Math.random() * titles.length)]);
        } else {
          setSummaryError("An unexpected issue occurred while fetching the overall summary.");
          setOverallEmoji(FeedbackEmoji.POOR); // Indicate an error state visually with POOR emoji
          setStudentTitle(STUDENT_TITLES[FeedbackEmoji.POOR][0]);
        }
      } catch (error) {
        console.error('Error fetching overall summary:', error);
        setSummaryError(`Failed to load overall summary: ${error instanceof Error ? error.message : String(error)}`);
        setOverallEmoji(FeedbackEmoji.POOR); // Indicate an error state visually with POOR emoji
        setStudentTitle(STUDENT_TITLES[FeedbackEmoji.POOR][0]);
      } finally {
        setIsSummaryLoading(false);
      }
    };

    fetchOverallSummary();
  }, [studentObservations]);

  const handleDownloadBadge = async () => {
    if (badgeRef.current && overallSummary) {
      // Temporarily hide scrollbar for screenshot, if present
      const overflowStyle = badgeRef.current.style.overflow;
      badgeRef.current.style.overflow = 'hidden';

      const canvas = await html2canvas(badgeRef.current, {
        useCORS: true, // Important for images loaded from data URLs
        scale: 2, // Improve resolution
        backgroundColor: '#f8fafc', // Match bg-slate-50
        logging: false, // Disable logging for cleaner console
        // Explicitly set width and height to prevent slight variations
        width: badgeRef.current.offsetWidth,
        height: badgeRef.current.offsetHeight,
      });
      const dataUrl = canvas.toDataURL('image/png');
      downloadPng(dataUrl, `RuleOfThirdsBadge_${studentTitle.replace(/\s+/g, '')}.png`);

      // Restore scrollbar
      badgeRef.current.style.overflow = overflowStyle;
    } else {
      alert("Summary not loaded yet or an error occurred. Please try again.");
    }
  };

  const FinalEmojiComponent = FEEDBACK_EMOJI_COMPONENTS[overallEmoji];
  const SummaryIconComponent = UI_ICON_COMPONENTS[UIIcon.SUMMARY];


  return (
    <div className="flex flex-col items-center p-6 bg-white shadow-xl rounded-lg max-w-2xl mx-auto my-8 w-full text-center">
      <h2 className="text-4xl font-bold text-purple-700 mb-4">
        Practice Complete!
      </h2>
      <p className="text-lg text-slate-600 mb-8">
        You've worked hard and honed your composition skills. Let's see your results!
      </p>

      <div
        ref={badgeRef}
        className="relative w-full p-8 bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-lg mb-8 shadow-lg flex flex-col items-center justify-center min-h-[400px] text-slate-800"
      >
        {isSummaryLoading ? (
          <div className="flex flex-col items-center justify-center p-4 text-slate-700 text-lg">
            <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-slate-600">Generating your final summary...</p>
          </div>
        ) : summaryError ? (
          <div className="flex flex-col items-center justify-center p-4 text-red-500 text-lg">
            <p className="mb-2">Error: {summaryError}</p>
            <p className="text-sm text-slate-600">Could not generate summary. Please restart practice.</p>
          </div>
        ) : (
          <>
            <div className="absolute top-4 left-4 p-2 bg-purple-100 rounded-full shadow-sm">
              {SummaryIconComponent && <SummaryIconComponent className="w-8 h-8 text-purple-600" />}
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2 mt-8">Your Achievement:</h3>
            <p className="text-5xl font-extrabold text-yellow-500 mb-4 tracking-wide leading-tight px-4">
              {studentTitle}
            </p>
            <div className="mt-4">
              <FinalEmojiComponent className="w-28 h-28 text-purple-600" />
            </div>
            <p className="text-base text-slate-700 mt-6 leading-relaxed px-4 text-left">
              {overallSummary}
            </p>
            <p className="text-sm text-slate-500 mt-6 italic">
              Your Rule of Thirds Coach Badge
            </p>
          </>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <Button onClick={handleDownloadBadge} size="lg" className="flex items-center justify-center" disabled={isSummaryLoading || !!summaryError || !overallSummary}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Results Badge
        </Button>
        <Button onClick={onRestart} variant="secondary" size="lg">
          Start New Practice
        </Button>
      </div>
    </div>
  );
};

export default EndingPage;