import React, { useRef, useState } from 'react';
import Button from './Button';
import { LockIcon, CameraIcon, UploadIcon } from './SvgIcons';
import { LessonBundle, ImageBundleItem } from '../types';
import { loadLessonBundle } from '../utils/downloadUtils';
import { fileToBase64 } from '../utils/imageUtils';

interface LandingPageProps {
  onStartPractice: (bundle: LessonBundle) => void;
  onEnterTeacherMode: () => void;
  onStartFreePlay: (image: ImageBundleItem) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onStartPractice,
  onEnterTeacherMode,
  onStartFreePlay,
}) => {
  const lessonFileInputRef = useRef<HTMLInputElement>(null);
  const freePlayFileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleLessonFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.thirds')) {
      try {
        const bundle = await loadLessonBundle(file);
        onStartPractice(bundle);
      } catch (error) {
        console.error("Failed to load lesson bundle:", error);
        setUploadError("Oops! There was a problem loading your lesson. Please make sure it's a valid .thirds file.");
      }
    } else if (file) {
      setUploadError("Looks like that's not a .thirds file! Please choose the correct lesson bundle.");
    }
    if (lessonFileInputRef.current) {
      lessonFileInputRef.current.value = '';
    }
  };

  const processFreePlayImageFile = async (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError("Please choose an image file (such as JPG, PNG, or WebP) for Free Play.");
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      onStartFreePlay({
        base64,
        name: file.name || 'My Uploaded Photo',
      });
    } catch (err) {
      console.error("Error reading photo:", err);
      setUploadError("Could not read that photo file. Please try a different image.");
    }
  };

  const handleFreePlayFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFreePlayImageFile(file);
    }
    if (freePlayFileInputRef.current) {
      freePlayFileInputRef.current.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.name.endsWith('.thirds')) {
        try {
          const bundle = await loadLessonBundle(file);
          onStartPractice(bundle);
        } catch {
          setUploadError("Oops! Problem loading that lesson bundle.");
        }
      } else if (file.type.startsWith('image/')) {
        await processFreePlayImageFile(file);
      } else {
        setUploadError("Please drop an image file (JPG, PNG) or a .thirds lesson file.");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col items-center p-4 pt-12 pb-16 w-full max-w-4xl mx-auto relative">
      <div className="text-center max-w-2xl mb-10">
        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 font-semibold text-xs rounded-full uppercase tracking-wider mb-3">
          Middle School Tech Lab
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight mb-3">
          Rule of Thirds Coach
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Learn how professional photographers and designers frame their shots. Line up your subjects, balance positive and negative space, and see the world through the 3×3 grid!
        </p>
      </div>

      {uploadError && (
        <div className="w-full max-w-2xl mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center justify-between">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-red-500 hover:text-red-800 font-bold ml-3 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Two Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {/* Free Play Mode Card */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col justify-between p-6 rounded-2xl bg-white border-2 transition-all duration-200 shadow-sm hover:shadow-md ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
              : 'border-emerald-200 hover:border-emerald-400'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CameraIcon className="w-6 h-6 text-emerald-700" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                Practice Any Photo
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Free Play Mode
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Upload your own picture (from your computer, phone, or camera). Analyze it with the 3×3 grid and get instant coaching feedback from the AI.
            </p>

            <ul className="text-xs text-slate-500 space-y-1.5 mb-6">
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span> One photo at a time
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span> Instant AI coaching & tips
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-slate-400 font-bold">•</span> Practice only (no badge)
              </li>
            </ul>
          </div>

          <div>
            <Button
              onClick={() => freePlayFileInputRef.current?.click()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <UploadIcon className="w-4 h-4" />
              Upload Photo for Free Play
            </Button>
            <input
              type="file"
              ref={freePlayFileInputRef}
              onChange={handleFreePlayFileChange}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
            />
            <p className="text-center text-xs text-slate-400 mt-2">
              or drag & drop a photo here
            </p>
          </div>
        </div>

        {/* Classroom Lesson Card */}
        <div className="flex flex-col justify-between p-6 rounded-2xl bg-white border-2 border-purple-200 hover:border-purple-400 transition-all duration-200 shadow-sm hover:shadow-md">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl font-bold">
                📁
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full">
                Teacher Assigned
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Classroom Lesson
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Got a lesson file from your teacher? Load your assigned <code className="bg-purple-50 text-purple-700 px-1 py-0.5 rounded font-mono text-xs">.thirds</code> bundle to analyze the photo set and earn your results badge.
            </p>

            <ul className="text-xs text-slate-500 space-y-1.5 mb-6">
              <li className="flex items-center gap-1.5">
                <span className="text-purple-600 font-bold">✓</span> Curated photo challenges
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-purple-600 font-bold">✓</span> Teacher-created image set
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-purple-600 font-bold">✓</span> Downloadable completion badge
              </li>
            </ul>
          </div>

          <div>
            <Button
              onClick={() => lessonFileInputRef.current?.click()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-xl"
            >
              Start Lesson (.thirds file)
            </Button>
            <input
              type="file"
              ref={lessonFileInputRef}
              onChange={handleLessonFileChange}
              accept=".thirds"
              className="hidden"
            />
            <p className="text-center text-xs text-slate-400 mt-2">
              requires teacher bundle file
            </p>
          </div>
        </div>
      </div>

      {/* Teacher Mode Button in Corner */}
      <div className="absolute top-4 right-4">
        <button
          onClick={onEnterTeacherMode}
          className="p-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-600 transition-colors duration-200 shadow-sm border border-slate-200 cursor-pointer"
          aria-label="Teacher Mode"
          title="Teacher Mode (Create Lesson Bundles)"
        >
          <LockIcon className="w-5 h-5 text-slate-600" />
        </button>
      </div>
    </div>
  );
};

export default LandingPage;