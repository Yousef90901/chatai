import React from 'react';

const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66C7.32 17.57 9.55 13 17 12V8z"/>
        <path d="M17 3c-5.52 0-10 4.48-10 10 0 .55.45 1 1 1s1-.45 1-1c0-4.41 3.59-8 8-8 .55 0 1-.45 1-1s-.45-1-1-1z"/>
    </svg>
);


interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center p-4 antialiased" style={{ backgroundColor: 'var(--bg-default)', color: 'var(--text-primary)' }}>
      <div className="text-center mb-10 max-w-2xl flex flex-col items-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-lg mx-auto mb-6" style={{ backgroundColor: 'var(--accent-primary)', borderColor: 'var(--bg-main)'}}>
            <LogoIcon className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          مرحباً بك في خبير الزراعة الذكي
        </h1>
        <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)'}}>
          اضغط أدناه لبدء المحادثة وطرح استفساراتك.
        </p>
        <button
            onClick={onStart}
            className="text-white font-bold py-3 px-10 rounded-lg transition-transform transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ backgroundColor: 'var(--accent-primary)', '--tw-ring-color': 'var(--accent-primary)'}}
        >
            ابدأ الدردشة
        </button>
      </div>
      
      <div className="absolute bottom-6 text-sm" style={{ color: 'var(--text-secondary)'}}>
        <p>تطوير المهندس يوسف رجب</p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
