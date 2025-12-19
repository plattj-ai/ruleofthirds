import React, { useRef } from 'react';
import Button from './Button';
import { LockIcon } from './SvgIcons';
import { LessonBundle } from '../types';
import { loadLessonBundle } from '../utils/downloadUtils'; // Assuming this utility exists

interface LandingPageProps {
  onStartPractice: (bundle: LessonBundle) => void;
  onEnterTeacherMode: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartPractice, onEnterTeacherMode }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.thirds')) {
      try {
        const bundle = await loadLessonBundle(file);
        onStartPractice(bundle);
      } catch (error) {
        console.error("Failed to load lesson bundle:", error);
        alert("Oops! There was a problem loading your lesson. Please make sure it's a valid .thirds file.");
      }
    } else if (file) {
      alert("Looks like that's not a .thirds file! Please choose the correct lesson bundle.");
    }
    // Reset the input to allow selecting the same file again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 w-full max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-slate-800 mb-8 text-center">
        Welcome to your Rule of Thirds Coach!
      </h1>
      <p className="text-lg text-slate-600 mb-12 text-center max-w-md">
        Get ready to sharpen your eye for composition and balance. Let's learn to make great photos!
      </p>

      <Button onClick={handleStartClick} size="lg" className="mb-4 w-full md:w-auto">
        Start Practice
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".thirds"
        className="hidden"
      />

      <div className="absolute top-4 right-4">
        <button
          onClick={onEnterTeacherMode}
          className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors duration-200 shadow-md"
          aria-label="Teacher Mode"
          title="Teacher Mode"
        >
          <LockIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default LandingPage;