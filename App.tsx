import React, { useState } from 'react';
import { AppState, LessonBundle, ImageBundleItem, FeedbackEmoji } from './types';
import LandingPage from './components/LandingPage';
import TeacherMode from './components/TeacherMode';
import ImageGallery from './components/ImageGallery';
import CoachingPage from './components/CoachingPage';
import EndingPage from './components/EndingPage';
import { ExitIcon } from './components/SvgIcons';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.PAGE_LANDING);
  const [lessonBundle, setLessonBundle] = useState<LessonBundle | null>(null);
  const [selectedImages, setSelectedImages] = useState<ImageBundleItem[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [studentObservations, setStudentObservations] = useState<
    { image: ImageBundleItem; observations: string[]; feedback: string | null; tip?: string; emoji: FeedbackEmoji | null }[]
  >([]);

  const handleStartPractice = (bundle: LessonBundle) => {
    setLessonBundle(bundle);
    setAppState(AppState.PAGE_IMAGE_GALLERY);
  };

  const handleTeacherModeExit = () => {
    setAppState(AppState.PAGE_LANDING);
  };

  const handleSelectImagesForCoaching = (images: ImageBundleItem[]) => {
    setSelectedImages(images);
    setStudentObservations(
      images.map((image) => ({
        image,
        observations: [],
        feedback: null,
        tip: undefined,
        emoji: null, // Initialize emoji
      }))
    );
    setCurrentImageIndex(0);
    setAppState(AppState.PAGE_COACHING);
  };

  const handleNextImage = () => {
    if (currentImageIndex < selectedImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      setAppState(AppState.PAGE_ENDING);
    }
  };

  const handleSaveObservationsAndFeedback = (
    index: number,
    observations: string[],
    feedback: string,
    tip: string | undefined, // Accept optional tip
    emoji: FeedbackEmoji // Accept emoji
  ) => {
    setStudentObservations((prev) => {
      const newState = [...prev];
      newState[index] = { ...newState[index], observations, feedback, tip, emoji };
      return newState;
    });
  };

  const resetApp = () => {
    setAppState(AppState.PAGE_LANDING);
    setLessonBundle(null);
    setSelectedImages([]);
    setCurrentImageIndex(0);
    setStudentObservations([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 relative">
      {(appState !== AppState.PAGE_LANDING && appState !== AppState.PAGE_TEACHER_MODE) && (
        <button
          onClick={resetApp}
          className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors duration-200 shadow-md"
          aria-label="Exit Practice"
          title="Exit Practice"
        >
          <ExitIcon className="w-6 h-6" />
        </button>
      )}

      {appState === AppState.PAGE_LANDING && (
        <LandingPage
          onStartPractice={handleStartPractice}
          onEnterTeacherMode={() => setAppState(AppState.PAGE_TEACHER_MODE)}
        />
      )}

      {appState === AppState.PAGE_TEACHER_MODE && (
        <TeacherMode onExitTeacherMode={handleTeacherModeExit} />
      )}

      {appState === AppState.PAGE_IMAGE_GALLERY && lessonBundle && (
        <ImageGallery
          images={lessonBundle.images}
          onSelectImages={handleSelectImagesForCoaching}
          onExitPractice={resetApp}
        />
      )}

      {appState === AppState.PAGE_COACHING && selectedImages.length > 0 && (
        <CoachingPage
          image={selectedImages[currentImageIndex]}
          currentImageIndex={currentImageIndex}
          totalImages={selectedImages.length}
          onNextImage={handleNextImage}
          onSaveObservationsAndFeedback={handleSaveObservationsAndFeedback}
          observationsData={studentObservations[currentImageIndex]}
        />
      )}

      {appState === AppState.PAGE_ENDING && (
        <EndingPage studentObservations={studentObservations} onRestart={resetApp} />
      )}
    </div>
  );
};

export default App;