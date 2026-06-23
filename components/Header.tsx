import React, { useState, useEffect } from 'react';
import { Story, User } from '../types';

const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const UserCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
    </svg>
);

interface HeaderProps {
  currentSpecialization: string;
  onToggleSidebar: () => void;
  stories: Story[];
  currentUser: User;
  adminUser: User | null;
  onViewStories: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentSpecialization, onToggleSidebar, stories, currentUser, adminUser, onViewStories }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setTheme('dark');
    }
  }, []);

  const handleThemeToggle = () => {
    const root = document.documentElement;
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    root.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);

    // Re-initialize mermaid with the new theme and re-render existing diagrams
    if ((window as any).mermaid) {
        (window as any).mermaid.initialize({
            startOnLoad: false,
            theme: newTheme === 'dark' ? 'dark' : 'default',
        });
        // This will find all elements with class="mermaid" and re-render them
        (window as any).mermaid.run();
    }
  };

  const hasUnseenStories = stories.length > 0 && stories.some(story => !story.viewedBy.includes(currentUser.email));

  return (
    <header className="p-4 flex items-center justify-between border-b flex-shrink-0" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>

      {/* Right Side (RTL Start): Actions & Title */}
      <div className="flex-1 flex justify-start items-center space-x-2 space-x-reverse">
         <button
          onClick={onToggleSidebar}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="تبديل الشريط الجانبي"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
         <h1 className="text-lg sm:text-xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>
          {currentSpecialization}
        </h1>
      </div>

      {/* Left Side (RTL End): Theme Toggle */}
      <div className="flex-1 flex justify-end items-center space-x-1 space-x-reverse">
         {stories.length > 0 && adminUser && (
            <button
                onClick={onViewStories}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors group"
                aria-label="عرض الحالة"
            >
                <div 
                    className={`relative w-9 h-9 rounded-full flex items-center justify-center p-0.5 transition-transform group-hover:scale-110 ${
                        hasUnseenStories 
                        ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                >
                    <div className="w-full h-full rounded-full p-0.5" style={{ backgroundColor: 'var(--bg-main)' }}>
                        {adminUser.profilePicture ? (
                            <img src={adminUser.profilePicture} alt={adminUser.name || 'Admin'} className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <UserCircleIcon className="w-full h-full rounded-full" style={{ color: 'var(--bg-input)' }} />
                        )}
                    </div>
                </div>
            </button>
        )}
        <button
          onClick={handleThemeToggle}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
           style={{ color: 'var(--text-secondary)' }}
          aria-label="تبديل المظهر"
        >
          {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
        </button>
      </div>
    </header>
  );
};

export default Header;
