import React, { useState } from 'react';
import { ImageBundleItem } from '../types';
import Button from './Button';
import { ExitIcon } from './SvgIcons';

interface ImageGalleryProps {
  images: ImageBundleItem[];
  onSelectImages: (images: ImageBundleItem[]) => void;
  onExitPractice: () => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onSelectImages, onExitPractice }) => {
  const [selectedImages, setSelectedImages] = useState<ImageBundleItem[]>([]);

  const handleImageClick = (image: ImageBundleItem) => {
    setSelectedImages((prevSelected) => {
      const isSelected = prevSelected.includes(image);
      if (isSelected) {
        return prevSelected.filter((img) => img !== image);
      } else if (prevSelected.length < 4) {
        return [...prevSelected, image];
      }
      return prevSelected; // If 4 already selected, do nothing
    });
  };

  const handleBeginClick = () => {
    if (selectedImages.length === 4) {
      onSelectImages(selectedImages);
    } else {
      alert(`Please select exactly 4 images to begin. You have selected ${selectedImages.length}.`);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white shadow-xl rounded-lg max-w-5xl mx-auto my-8 w-full">
      <h2 className="text-3xl font-bold text-purple-700 mb-4 text-center">
        Image Selection Time!
      </h2>
      <p className="text-lg text-slate-600 mb-6 text-center max-w-xl">
        Choose exactly 4 images you'd like to practice the Rule of Thirds with. Think carefully about which ones look interesting!
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-8 w-full justify-items-center">
        {images.map((img, index) => (
          <div
            key={index}
            className={`relative w-40 h-40 border-4 rounded-lg cursor-pointer transition-all duration-200 overflow-hidden
              ${selectedImages.includes(img) ? 'border-yellow-500 shadow-lg scale-105' : 'border-slate-200 hover:border-purple-300 hover:shadow-md'}`}
            onClick={() => handleImageClick(img)}
          >
            <img
              src={img.base64}
              alt={img.name}
              className="w-full h-full object-contain bg-slate-50"
            />
            {selectedImages.includes(img) && (
              <div className="absolute inset-0 flex items-center justify-center bg-yellow-500 bg-opacity-30 text-white font-bold text-2xl">
                <span>✓</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-md text-slate-700 mb-6">
        Selected: <span className={`font-bold ${selectedImages.length === 4 ? 'text-green-600' : 'text-orange-500'}`}>{selectedImages.length}</span> / 4
      </p>

      <Button
        onClick={handleBeginClick}
        disabled={selectedImages.length !== 4}
        size="lg"
        className="w-full sm:w-auto px-8 py-3"
      >
        Begin Coaching!
      </Button>

      {selectedImages.length !== 4 && (
        <p className="text-sm text-orange-500 mt-2">
          You need to select exactly 4 images to start. Keep going!
        </p>
      )}
    </div>
  );
};

export default ImageGallery;