
import React, { useState, useEffect, useRef } from 'react';
import { Story, User } from '../types';

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const UserCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
    </svg>
);
const HeartIcon: React.FC<{ className?: string, isFilled?: boolean }> = ({ className, isFilled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill={isFilled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
  </svg>
);
const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);
const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);

const STORY_DURATION = 7000; // 7 seconds

interface StoryViewerProps {
  stories: Story[];
  isOpen: boolean;
  onClose: () => void;
  onLike: (storyId: string) => void;
  onMarkViewed: (storyId: string) => void;
  currentUser: User | null;
  admin: User | null;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ stories, isOpen, onClose, onLike, onMarkViewed, currentUser, admin }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // FIX: Use ReturnType<typeof setTimeout> for browser compatibility.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const currentStory = stories[currentIndex];
  
  const goToNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };
  
  useEffect(() => {
    if (!isOpen || !currentStory) return;

    onMarkViewed(currentStory.id);

    if (progressRef.current) {
        progressRef.current.style.transition = 'none';
        progressRef.current.style.width = '0%';
        // Force reflow
        progressRef.current.getBoundingClientRect(); 
        progressRef.current.style.transition = `width ${STORY_DURATION}ms linear`;
        progressRef.current.style.width = '100%';
    }

    timerRef.current = setTimeout(goToNext, STORY_DURATION);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, isOpen, stories]);
  
  if (!isOpen || !currentUser || !admin || !currentStory) {
    return null;
  }
  
  const handleLike = () => {
      onLike(currentStory.id);
  };

  const isLiked = currentStory.likedBy.includes(currentUser.email);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center select-none" dir="rtl">
        <div className="relative w-full h-full max-w-md max-h-[95vh] flex flex-col bg-gray-900 rounded-lg overflow-hidden">
            {/* Progress Bars */}
            <div className="absolute top-2 left-0 right-0 px-2 flex space-x-1 space-x-reverse z-10">
                {stories.map((_, index) => (
                    <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                        {index < currentIndex && <div className="h-full bg-white w-full"></div>}
                        {index === currentIndex && <div ref={progressRef} className="h-full bg-white"></div>}
                    </div>
                ))}
            </div>
            
            {/* Header */}
            <div className="absolute top-5 left-0 right-0 px-4 flex items-center justify-between z-10">
                <div className="flex items-center space-x-2 space-x-reverse">
                    {admin.profilePicture ? (
                        <img src={admin.profilePicture} alt={admin.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                        <UserCircleIcon className="w-8 h-8 text-gray-400"/>
                    )}
                    <span className="text-white text-sm font-semibold">{admin.name}</span>
                </div>
                <button onClick={onClose} className="text-white p-1">
                    <XIcon className="w-6 h-6"/>
                </button>
            </div>
            
            {/* Image */}
            <div className="flex-1 flex items-center justify-center">
                <img src={currentStory.mediaUrl} alt="Story" className="max-h-full max-w-full object-contain" />
            </div>

            {/* Navigation */}
            <button onClick={goToPrev} className="absolute left-0 top-1/3 -translate-y-1/2 z-20 p-2 m-2 bg-black/40 rounded-full text-white">
                <ChevronRightIcon className="w-6 h-6"/>
            </button>
             <button onClick={goToNext} className="absolute right-0 top-1/3 -translate-y-1/2 z-20 p-2 m-2 bg-black/40 rounded-full text-white">
                <ChevronLeftIcon className="w-6 h-6"/>
            </button>
            
            {/* Footer / Actions */}
            <div className="absolute bottom-5 right-5 z-10">
                <button onClick={handleLike} className={`p-2 rounded-full transition-transform transform hover:scale-110 ${isLiked ? 'text-red-500' : 'text-white'}`}>
                    <HeartIcon className="w-8 h-8" isFilled={isLiked} />
                </button>
            </div>
        </div>
    </div>
  );
};

export default StoryViewer;