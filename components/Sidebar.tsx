import React from 'react';
import { specializations } from '../constants';
import { User } from '../types';

const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66C7.32 17.57 9.55 13 17 12V8z"/>
        <path d="M17 3c-5.52 0-10 4.48-10 10 0 .55.45 1 1 1s1-.45 1-1c0-4.41 3.59-8 8-8 .55 0 1-.45 1-1s-.45-1-1-1z"/>
    </svg>
);

const NewChatIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);

const LogoutIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);
const SupportIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);


interface SidebarProps {
  isOpen: boolean;
  isInitialLoad: boolean;
  currentSpecialization: string;
  onSpecializationChange: (newSpec: string) => void;
  onNewChat: () => void;
  currentUser: User | null;
  onLogout: () => void;
  onClose: () => void;
  onEditProfile: () => void;
  chatMode: 'ai' | 'admin';
  onChatModeChange: (mode: 'ai' | 'admin') => void;
  hasUnreadAdminMessage: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isInitialLoad, currentSpecialization, onSpecializationChange, onNewChat, currentUser, onLogout, onClose, onEditProfile, chatMode, onChatModeChange, hasUnreadAdminMessage }) => {

  const handleSelectSpecialization = (specName: string) => {
    onSpecializationChange(specName);
    onClose();
  };
  
  const handleNewChatClick = () => {
    onNewChat();
    onClose();
  }

  const handleAdminChatClick = () => {
      onChatModeChange('admin');
      onClose();
  }
  
  const transitionClass = isInitialLoad ? '' : 'transition-transform duration-300 ease-in-out';
  const roleDisplay = currentUser?.role === 'Engineer' ? 'مهندس' : 'مزارع';

  return (
    <aside className={`fixed top-0 right-0 h-full w-72 border-l flex flex-col z-20 ${transitionClass} ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-color)'}}>
        {/* Header */}
        <div className="p-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border-color)'}}>
            <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-md" style={{ backgroundColor: 'var(--accent-primary)', borderColor: 'var(--bg-main)'}}>
                    <LogoIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)'}}>
                    خبير الزراعة
                </h1>
            </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4 flex-shrink-0">
             <button
                onClick={handleNewChatClick}
                className="w-full flex items-center justify-center space-x-2 space-x-reverse px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ backgroundColor: 'var(--accent-primary)', '--tw-ring-color': 'var(--accent-primary)'}}
            >
                <NewChatIcon className="w-5 h-5" />
                <span>محادثة جديدة مع الخبير</span>
            </button>
        </div>

        {/* Specializations List */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
             <h2 className="px-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)'}}>الدعم</h2>
             <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleAdminChatClick(); }}
                    className={`relative flex items-center justify-end space-x-3 space-x-reverse w-full text-right p-3 rounded-md text-sm font-medium transition-colors ${
                        chatMode === 'admin' 
                        ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300' 
                        : 'hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                     style={{
                        color: chatMode === 'admin' ? 'var(--accent-primary)' : 'var(--text-primary)',
                     }}
                >
                   <span>التواصل مع الإدارة</span>
                   <SupportIcon className="w-5 h-5" />
                   {hasUnreadAdminMessage && (
                       <span className="absolute top-2 left-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                   )}
                </a>

            <h2 className="px-2 text-xs font-semibold uppercase tracking-wider pt-4" style={{ color: 'var(--text-secondary)'}}>التخصصات</h2>
            {specializations.map(spec => (
                <a
                    key={spec.name}
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleSelectSpecialization(spec.name); }}
                    className={`flex items-center justify-end space-x-3 space-x-reverse w-full text-right p-3 rounded-md text-sm font-medium transition-colors ${
                        chatMode === 'ai' && spec.name === currentSpecialization 
                        ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300' 
                        : 'hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                     style={{
                        color: chatMode === 'ai' && spec.name === currentSpecialization ? 'var(--accent-primary)' : 'var(--text-primary)',
                     }}
                >
                   <span>{spec.name}</span>
                   <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={spec.path} />
                   </svg>
                </a>
            ))}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t flex-shrink-0" style={{ borderColor: 'var(--border-color)'}}>
            {currentUser && (
                <div className="flex items-center justify-between">
                    <button onClick={onEditProfile} className="flex items-center space-x-3 space-x-reverse min-w-0 flex-1 text-right p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-200">
                           {currentUser.profilePicture ? (
                             <img src={currentUser.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                           ) : (
                             <UserIcon className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
                           )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)'}}>{currentUser.name}</p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)'}}>{roleDisplay}</p>
                        </div>
                    </button>
                    <button
                        onClick={onLogout}
                        className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex-shrink-0 ml-2"
                        style={{ color: 'var(--text-secondary)' }}
                        aria-label="تسجيل الخروج"
                    >
                         <LogoutIcon className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    </aside>
  );
};

export default Sidebar;