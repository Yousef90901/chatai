import React, { useRef, useEffect } from 'react';
import { Message, Sender } from '../types';
import ChatMessage from './ChatMessage';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onImageClick: (src: string) => void;
  userProfilePicture?: string;
  otherUserProfilePicture?: string;
  isVerified?: boolean;
  isAiChat: boolean;
}

const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66C7.32 17.57 9.55 13 17 12V8z"/>
        <path d="M17 3c-5.52 0-10 4.48-10 10 0 .55.45 1 1 1s1-.45 1-1c0-4.41 3.59-8 8-8 .55 0 1-.45 1-1s-.45-1-1-1z"/>
    </svg>
);

const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-2 space-x-reverse p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-ai-message)'}}>
    <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--text-secondary)' }}></div>
    <div className="w-2.5 h-2.5 rounded-full animate-pulse delay-150" style={{ backgroundColor: 'var(--text-secondary)' }}></div>
    <div className="w-2.5 h-2.5 rounded-full animate-pulse delay-300" style={{ backgroundColor: 'var(--text-secondary)' }}></div>
  </div>
);


const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onImageClick, userProfilePicture, otherUserProfilePicture, isVerified, isAiChat }) => {
  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      {messages.map((msg) => (
        <ChatMessage 
          key={msg.id} 
          message={msg} 
          onImageClick={onImageClick} 
          userProfilePicture={userProfilePicture}
          otherUserProfilePicture={otherUserProfilePicture}
          isVerified={isVerified}
        />
      ))}
      {isLoading && isAiChat && (
        <div className="flex justify-start">
            <div className="flex items-start space-x-3 space-x-reverse">
                 <div className="relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--bg-ai-message)'}}>
                    <LogoIcon className="w-6 h-6" style={{ color: 'var(--accent-primary)'}} />
                    {isVerified && (
                        <svg className="absolute -bottom-1 -right-1 w-5 h-5 text-blue-500 bg-white dark:bg-gray-800 rounded-full" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>
                <TypingIndicator />
            </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;