
import React from 'react';

interface ImageLightboxProps {
  src: string;
  onClose: () => void;
}

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ImageLightbox: React.FC<ImageLightboxProps> = ({ src, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-full max-h-full"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image itself
      >
        <img src={src} alt="Enlarged view" className="block max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 sm:-top-2 sm:-right-2 bg-white text-gray-800 rounded-full p-2 hover:bg-gray-200 transition-colors"
          aria-label="إغلاق الصورة"
        >
          <XIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ImageLightbox;
