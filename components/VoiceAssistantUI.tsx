

import React from 'react';

const StopCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 9a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);


interface VoiceAssistantUIProps {
  isOpen: boolean;
  onClose: () => void;
  isMicrophoneActive: boolean;
  onToggleMicrophone: () => void;
}

const VoiceVisualizer: React.FC<{ isActive: boolean }> = ({ isActive }) => {
    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full transition-opacity duration-500"
            style={{
              backgroundColor: 'rgba(137, 180, 248, 0.2)', // Corresponds to --accent-primary with opacity
              width: `${(i + 1) * 48}px`,
              height: `${(i + 1) * 48}px`,
              animation: isActive ? `pulse 2s infinite ease-in-out` : 'none',
              animationDelay: `${i * 0.25}s`,
              opacity: isActive ? 1 : 0.2,
            }}
          />
        ))}
        <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: 'var(--accent-primary)'}}>
            <MicrophoneIcon className="w-8 h-8 text-white" />
        </div>
      </div>
    );
};


const VoiceAssistantUI: React.FC<VoiceAssistantUIProps> = ({ isOpen, onClose, isMicrophoneActive, onToggleMicrophone }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex flex-col items-center justify-between p-8 antialiased" dir="rtl">
        <style>
        {`
          @keyframes pulse {
            0% { transform: scale(0.9); opacity: 0.7; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(0.9); opacity: 0.7; }
          }
        `}
        </style>

        {/* Top Text Area for state feedback */}
        <div className="w-full max-w-4xl text-center flex-grow flex flex-col justify-center">
            <p className="text-3xl md:text-4xl font-bold text-white mt-4 min-h-[5rem] transition-all duration-300">
                {isMicrophoneActive ? "أنا أستمع..." : "اضغط على الميكروفون للتحدث"}
            </p>
        </div>
        
        {/* Bottom Controls Container */}
        <div className="flex-shrink-0 flex flex-col items-center">
            {/* Center Visualizer & Mic Button */}
            <div className="mb-8 flex flex-col items-center space-y-4">
                <button onClick={onToggleMicrophone} aria-label={isMicrophoneActive ? "إيقاف الاستماع" : "بدء الاستماع"}>
                    <VoiceVisualizer isActive={isMicrophoneActive} />
                </button>
                <p className="text-white font-semibold">
                    {isMicrophoneActive ? "انقر للإيقاف" : "انقر للتحدث"}
                </p>
            </div>

            {/* Bottom Close Button */}
            <button
              onClick={onClose}
              className="bg-red-600 text-white font-bold py-3 px-8 rounded-full hover:bg-red-700 flex items-center space-x-2 space-x-reverse transition-colors shadow-lg"
              aria-label="إيقاف المحادثة الصوتية"
            >
                <StopCircleIcon className="h-6 w-6" />
                <span>إنهاء</span>
            </button>
        </div>
    </div>
  );
};

export default VoiceAssistantUI;