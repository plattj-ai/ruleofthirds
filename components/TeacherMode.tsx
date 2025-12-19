import React, { useState, useRef } from 'react';
import Button from './Button';
import { ImageBundleItem, LessonBundle } from '../types';
import { fileToBase64 } from '../utils/imageUtils';
import { downloadJson } from '../utils/downloadUtils';
import { ExitIcon } from './SvgIcons';

interface TeacherModeProps {
  onExitTeacherMode: () => void;
}

const TeacherMode: React.FC<TeacherModeProps> = ({ onExitTeacherMode }) => {
  const [images, setImages] = useState<ImageBundleItem[]>([]);
  const [bundleName, setBundleName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: ImageBundleItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const base64 = await fileToBase64(file);
          newImages.push({ base64, name: file.name });
        }
      }
      setImages((prevImages) => [...prevImages, ...newImages]);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset file input
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prevImages) => prevImages.filter((_, index) => index !== indexToRemove));
  };

  const handleGenerateBundle = () => {
    if (images.length === 0) {
      alert("Please upload some images first!");
      return;
    }
    const name = bundleName.trim() === '' ? 'lesson-bundle' : bundleName.trim().replace(/\s+/g, '-').toLowerCase();
    const bundle: LessonBundle = {
      name: bundleName,
      images: images,
    };
    downloadJson(bundle, `${name}.thirds`);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white shadow-xl rounded-lg max-w-4xl mx-auto my-8 relative w-full">
      <h2 className="text-3xl font-bold text-purple-700 mb-6 text-center">
        Teacher Mode: Create Lesson Bundle
      </h2>

      <div className="absolute top-4 right-4">
        <button
          onClick={onExitTeacherMode}
          className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors duration-200 shadow-md"
          aria-label="Exit Teacher Mode"
          title="Exit Teacher Mode"
        >
          <ExitIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="mb-6 w-full">
        <label htmlFor="bundleName" className="block text-slate-700 text-lg font-medium mb-2">
          Lesson Bundle Name:
        </label>
        <input
          type="text"
          id="bundleName"
          value={bundleName}
          onChange={(e) => setBundleName(e.target.value)}
          placeholder="e.g., Nature Photography Basics"
          className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-purple-400 focus:border-transparent text-slate-700"
        />
      </div>

      <div className="mb-8 w-full">
        <label className="block text-slate-700 text-lg font-medium mb-2">
          Upload Images:
        </label>
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-purple-50 file:text-purple-700
            hover:file:bg-purple-100
            cursor-pointer"
        />
        <p className="text-sm text-slate-500 mt-2">
          (You can upload multiple JPEG, PNG, or GIF images.)
        </p>
      </div>

      {images.length > 0 && (
        <div className="mb-8 w-full">
          <h3 className="text-xl font-semibold text-slate-700 mb-4">Image Previews ({images.length} images)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-80 overflow-y-auto p-2 border border-slate-200 rounded-md bg-slate-50">
            {images.map((img, index) => (
              <div key={index} className="relative group w-32 h-32 overflow-hidden rounded-md shadow-sm border border-slate-100">
                <img
                  src={img.base64}
                  alt={img.name}
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  aria-label={`Remove ${img.name}`}
                  title="Remove Image"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={handleGenerateBundle}
        disabled={images.length === 0 || bundleName.trim() === ''}
        size="lg"
        className="w-full sm:w-auto px-8 py-3"
      >
        Generate & Download .thirds Bundle
      </Button>
      {images.length === 0 && (
          <p className="text-sm text-red-500 mt-2">Please upload at least one image and provide a bundle name to generate the bundle.</p>
      )}
    </div>
  );
};

export default TeacherMode;