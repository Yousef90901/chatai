import React from 'react';
import { Story, User } from '../types';

interface StoriesTrayProps {
  stories: Story[];
  currentUser: User;
  onView: () => void;
  adminProfilePicture?: string;
  adminName?: string;
}

const UserCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
    </svg>
);

const StoriesTray: React.FC<StoriesTrayProps> = ({ stories, currentUser, onView, adminProfilePicture, adminName }) => {
  if (stories.length === 0) {
    return null;
  }

  const hasUnseenStories = stories.some(story => !story.viewedBy.includes(currentUser.email));

  return (
    <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
      <button onClick={onView} className="flex flex-col items-center space-y-1 text-center w-20 group">
        <div 
          className={`relative w-16 h-16 rounded-full flex items-center justify-center p-1 transition-transform group-hover:scale-110 ${
            hasUnseenStories 
            ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' 
            : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <div className="w-full h-full rounded-full p-0.5" style={{ backgroundColor: 'var(--bg-main)' }}>
            {adminProfilePicture ? (
              <img src={adminProfilePicture} alt={adminName || 'Admin'} className="w-full h-full object-cover rounded-full" />
            ) : (
               <UserCircleIcon className="w-full h-full rounded-full" style={{ color: 'var(--bg-input)' }} />
            )}
          </div>
        </div>
        <p className="text-xs font-medium truncate w-full" style={{ color: 'var(--text-secondary)' }}>
          {adminName || 'المدير'}
        </p>
      </button>
    </div>
  );
};

export default StoriesTray;
