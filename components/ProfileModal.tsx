import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';

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


interface ProfileModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, user, onClose, onSave }) => {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [profilePicture, setProfilePicture] = useState(user.profilePicture);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setRole(user.role);
      setProfilePicture(user.profilePicture);
    }
  }, [user]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({ ...user, name, role, profilePicture });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-8 space-y-6" style={{ backgroundColor: 'var(--bg-main)'}} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)'}}>تعديل الملف الشخصي</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10" style={{ color: 'var(--text-secondary)'}}>
                <XIcon className="w-6 h-6" />
            </button>
        </div>
        
        <div className="flex flex-col items-center space-y-4">
            <div className="relative w-32 h-32">
                {profilePicture ? (
                    <img src={profilePicture} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4" style={{ borderColor: 'var(--bg-main)'}} />
                ) : (
                    <UserCircleIcon className="w-32 h-32" style={{ color: 'var(--bg-input)'}}/>
                )}
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 rounded-full shadow-md"
                    style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
                    aria-label="Change profile picture"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
        </div>

        <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1 text-right" style={{ color: 'var(--text-secondary)'}}>الاسم</label>
            <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm text-right"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent-primary)' }}
            />
        </div>

        <div>
            <label htmlFor="role" className="block text-sm font-medium mb-1 text-right" style={{ color: 'var(--text-secondary)'}}>الدور</label>
            <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'Engineer' | 'Farmer')}
                 className="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm text-right"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent-primary)' }}
            >
                <option value="Engineer">مهندس</option>
                <option value="Farmer">مزارع</option>
            </select>
        </div>

        <div className="flex justify-end space-x-3 space-x-reverse">
             <button
                onClick={onClose}
                className="py-2 px-6 border rounded-md text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)'}}
            >
                إلغاء
            </button>
            <button
                onClick={handleSave}
                className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
                style={{ backgroundColor: 'var(--accent-primary)', hover: { backgroundColor: 'var(--accent-primary-hover)' } }}
            >
                حفظ التغييرات
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
