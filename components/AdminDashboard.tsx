


import React, { useState, useMemo, useRef, useEffect, ChangeEvent } from 'react';
import { User, DirectMessage, Message, Sender, Story } from '../types';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';

const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
);
const UserCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
    </svg>
);
const HeartIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
);
const LogoutIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);
const ChatIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72-3.72a1.5 1.5 0 010-2.122l3.72-3.72zM3.75 8.511c-.884.284-1.5 1.128-1.5 2.097v4.286c0 1.136.847 2.1 1.98 2.193l3.72-3.72a1.5 1.5 0 010-2.122L3.75 8.511zM11.25 11.25l-3.72 3.72a1.5 1.5 0 01-2.122 0l-3.72-3.72c-.236-.236-.337-.562-.284-.884A2.25 2.25 0 015.25 9h1.5_/.11zM12.75 11.25l3.72 3.72a1.5 1.5 0 002.122 0l3.72-3.72c.236-.236.337-.562-.284-.884A2.25 2.25 0 0018.75 9h-1.5" />
    </svg>
);
const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);
const PaperclipIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
    </svg>
);
const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
    </svg>
);
const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>);
const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>);
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const StoryIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-5.571 3-5.571-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l9.75 5.25L21.75 12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12v5.25l9.75 5.25L21.75 17.25V12" />
    </svg>
);
const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.007 1.11-1.226l.558-.224c.56-.225 1.18-.225 1.74 0l.558.224c.55.219 1.02.684 1.11 1.226l.09.542c.06.337.213.656.427.935l.285.378c.37.49.92.768 1.5.768h.61c.622 0 1.18.47 1.35 1.077l.09.542c.06.337.213.656.427.935l.285.378c.37.49.92.768 1.5.768h.61c.622 0 1.18.47 1.35 1.077l.09.542c.06.337.213.656.427.935l.285.378c.37.49.92.768 1.5.768h.61c.622 0 1.18.47 1.35 1.077l.09.542c-.09.542-.56 1.007-1.11 1.226l-.558.224c-.56.225-1.18.225-1.74 0l-.558-.224c-.55-.219-1.02-.684-1.11-1.226l-.09-.542c-.06-.337-.213-.656-.427-.935l-.285-.378c-.37-.49-.92-.768-1.5-.768h-.61c-.622 0-1.18-.47-1.35-1.077l-.09-.542c-.06-.337-.213-.656-.427-.935l-.285-.378c-.37-.49-.92-.768-1.5-.768h-.61c-.622 0-1.18-.47-1.35-1.077l-.09-.542zM15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
);


interface AppSettings {
    isChatEnabled: boolean;
}

interface AdminDashboardProps {
    admin: User;
    users: User[];
    directMessages: DirectMessage[];
    stories: Story[];
    onUpdateUser: (email: string, updates: Partial<User>) => void;
    onSendDirectMessage: (receiverEmail: string, text: string, files: File[]) => Promise<void>;
    onBroadcastMessage: (target: 'all' | string, text: string, files: File[]) => Promise<void>;
    onAddStory: (file: File) => Promise<void>;
    onDeleteStory: (storyId: string) => void;
    onEditProfile: () => void;
    onLogout: () => void;
    profileModal: React.ReactNode;
    unreadDms: Record<string, boolean>;
    onConversationOpen: (email: string) => void;
    globalSettings: AppSettings;
    onUpdateGlobalSettings: (settings: AppSettings) => void;
}

const BroadcastMessageForm: React.FC<{ users: User[], onSend: (target: 'all' | string, text: string, files: File[]) => Promise<void> }> = ({ users, onSend }) => {
    const [target, setTarget] = useState('all');
    const [text, setText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const newFile = e.target.files[0];
            setFile(newFile);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(newFile);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSend = async () => {
        if (!text.trim() && !file) {
            setError('الرجاء كتابة رسالة أو إرفاق صورة.');
            return;
        }
        setError('');
        setSuccess('');
        setIsSending(true);
        try {
            await onSend(target, text, file ? [file] : []);
            setSuccess('تم إرسال الرسالة بنجاح!');
            setText('');
            handleRemoveFile();
        } catch (e: any) {
            setError(e.message || 'حدث خطأ أثناء الإرسال.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="p-6 space-y-4">
            <h3 className="text-lg font-bold">إرسال رسالة للمستخدمين</h3>
            <div>
                <label htmlFor="target-user" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>إرسال إلى:</label>
                <select 
                    id="target-user" 
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm text-right"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent-primary)' }}
                >
                    <option value="all">الكل</option>
                    {users.map(user => (
                        <option key={user.email} value={user.email}>{user.name} ({user.email})</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="message-text" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>نص الرسالة:</label>
                <textarea
                    id="message-text"
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm text-right resize-y"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent-primary)' }}
                    placeholder="اكتب رسالتك هنا..."
                />
            </div>
            <div>
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" id="broadcast-file-upload"/>
                 <button onClick={() => fileInputRef.current?.click()} className="flex items-center space-x-2 space-x-reverse text-sm font-medium p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10" style={{ color: 'var(--text-secondary)'}}>
                    <PaperclipIcon className="w-5 h-5" />
                    <span>إرفاق صورة (اختياري)</span>
                 </button>
                 {preview && (
                    <div className="mt-2 relative w-24 h-24">
                        <img src={preview} alt="preview" className="w-24 h-24 rounded-md object-cover border-2" style={{ borderColor: 'var(--bg-main)'}} />
                        <button onClick={handleRemoveFile} className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors" aria-label="إزالة الصورة">
                            <XCircleIcon className="w-6 h-6" />
                        </button>
                    </div>
                 )}
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            {success && <p className="text-sm text-green-500 text-center">{success}</p>}
            <div className="text-left">
                <button
                    onClick={handleSend}
                    disabled={isSending}
                    className="text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    style={{ backgroundColor: 'var(--accent-primary)', hover: { backgroundColor: 'var(--accent-primary-hover)' } }}
                >
                    {isSending ? 'جارٍ الإرسال...' : 'إرسال'}
                </button>
            </div>
        </div>
    );
};

const StoryManager: React.FC<{ stories: Story[]; users: User[]; onAddStory: (file: File) => Promise<void>; onDeleteStory: (storyId: string) => void; }> = ({ stories, users, onAddStory, onDeleteStory }) => {
    const [storyFile, setStoryFile] = useState<File | null>(null);
    const [storyPreview, setStoryPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setStoryFile(file);
            const previewUrl = URL.createObjectURL(file);
            setStoryPreview(previewUrl);
        }
    };
    
    const handleUpload = async () => {
        if (!storyFile) return;
        setIsUploading(true);
        await onAddStory(storyFile);
        setStoryFile(null);
        setStoryPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setIsUploading(false);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-input)'}}>
                <h3 className="text-lg font-bold mb-4">إضافة قصة جديدة</h3>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <div className="flex flex-col sm:flex-row items-center gap-4">
                     <button className="w-48 h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500" style={{ borderColor: 'var(--border-color)'}} onClick={() => fileInputRef.current?.click()}>
                        {storyPreview ? (
                            <img src={storyPreview} alt="Story preview" className="w-full h-full object-cover rounded-md" />
                        ) : (
                            <>
                                <UploadIcon className="w-10 h-10 mx-auto" style={{ color: 'var(--text-secondary)'}} />
                                <p className="mt-2 text-sm">ارفع صورة</p>
                            </>
                        )}
                    </button>
                    <div className="flex-1 text-center sm:text-right">
                        <p className="mb-4" style={{ color: 'var(--text-secondary)'}}>اختر صورة لمشاركتها مع جميع المستخدمين. ستظهر الصورة لمدة 24 ساعة.</p>
                        <button onClick={handleUpload} disabled={!storyFile || isUploading} className="text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed" style={{ backgroundColor: 'var(--accent-primary)'}}>
                            {isUploading ? 'جارٍ الرفع...' : 'نشر القصة'}
                        </button>
                    </div>
                </div>
            </div>
            
            <div>
                 <h3 className="text-lg font-bold mb-4">القصص الحالية</h3>
                 {stories.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {stories.map(story => (
                            <div key={story.id} className="relative group aspect-w-9 aspect-h-16">
                                <img src={story.mediaUrl} alt="Story" className="w-full h-full object-cover rounded-lg shadow-md" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 text-white">
                                    <div className="flex justify-end">
                                        <button onClick={() => onDeleteStory(story.id)} className="p-1 bg-red-600 rounded-full hover:bg-red-700">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="text-xs">
                                        <div className="flex items-center gap-1">
                                            <EyeIcon className="w-4 h-4"/> {story.viewedBy.length}
                                        </div>
                                         <div className="flex items-center gap-1">
                                            <HeartIcon className="w-4 h-4"/> {story.likedBy.length}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 ) : (
                    <p className="text-center py-8" style={{ color: 'var(--text-secondary)'}}>لا توجد قصص منشورة حاليًا.</p>
                 )}
            </div>
        </div>
    );
};

const ChatAccessControlModal: React.FC<{ user: User; onClose: () => void; onUpdateUser: (email: string, updates: Partial<User>) => void; }> = ({ user, onClose, onUpdateUser }) => {
    const [duration, setDuration] = useState('1');
    const [unit, setUnit] = useState<'minute' | 'hour' | 'day' | 'year'>('day');

    const handleActivate = () => {
        const now = Date.now();
        const durationValue = parseInt(duration, 10);
        if (isNaN(durationValue) || durationValue <= 0) {
            alert("الرجاء إدخال رقم صحيح أكبر من صفر للمدة.");
            return;
        }

        let multiplier = 0;
        if (unit === 'minute') multiplier = 60 * 1000;
        else if (unit === 'hour') multiplier = 60 * 60 * 1000;
        else if (unit === 'day') multiplier = 24 * 60 * 60 * 1000;
        else if (unit === 'year') multiplier = 365 * 24 * 60 * 60 * 1000;

        const expiresAt = now + durationValue * multiplier;
        onUpdateUser(user.email, { chatAccessExpiresAt: expiresAt });
        onClose();
    };
    
    const handleDisable = () => {
        onUpdateUser(user.email, { chatAccessExpiresAt: undefined });
        onClose();
    };
    
    const getStatusText = () => {
        if (!user.chatAccessExpiresAt || user.chatAccessExpiresAt < Date.now()) {
            return "وصول الدردشة معطل حاليًا لهذا المستخدم.";
        }
        return `الوصول مفعل حاليًا وينتهي في: ${new Date(user.chatAccessExpiresAt).toLocaleString('ar-EG')}`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="w-full max-w-lg rounded-2xl p-6 space-y-6" style={{ backgroundColor: 'var(--bg-main)'}} onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)'}}>التحكم بوصول الدردشة لـِ {user.name}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10" style={{ color: 'var(--text-secondary)'}}>&times;</button>
                </div>

                <p className="text-sm" style={{ color: 'var(--text-secondary)'}}>{getStatusText()}</p>
                
                <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)'}}>تفعيل الوصول لمدة:</label>
                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            min="1"
                            className="block w-1/2 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm text-right"
                            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent-primary)' }}
                        />
                        <select
                            value={unit}
                            onChange={(e) => setUnit(e.target.value as any)}
                            className="block w-1/2 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm text-right"
                            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent-primary)' }}
                        >
                            <option value="minute">دقيقة</option>
                            <option value="hour">ساعة</option>
                            <option value="day">يوم</option>
                            <option value="year">سنة</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                    <button onClick={handleDisable} className="py-2 px-5 border rounded-md text-sm font-medium text-red-600 hover:bg-red-50" style={{ borderColor: 'var(--border-color)'}}>
                        تعطيل دائم
                    </button>
                    <div className="flex gap-3">
                         <button onClick={onClose} className="py-2 px-5 border rounded-md text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)'}}>
                            إلغاء
                        </button>
                        <button onClick={handleActivate} className="py-2 px-5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white" style={{ backgroundColor: 'var(--accent-primary)'}}>
                            تفعيل
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin, users, directMessages, stories, onUpdateUser, onSendDirectMessage, onBroadcastMessage, onAddStory, onDeleteStory, onEditProfile, onLogout, profileModal, unreadDms, onConversationOpen, globalSettings, onUpdateGlobalSettings }) => {
    const [activeTab, setActiveTab] = useState<'users' | 'followers' | 'chats' | 'broadcast' | 'stories' | 'settings'>('users');
    const [activeConversationEmail, setActiveConversationEmail] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [editingUserAccess, setEditingUserAccess] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeTab === 'chats' && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'auto'
            });
        }
    }, [directMessages, activeConversationEmail, activeTab]);

    useEffect(() => {
        if (activeConversationEmail) {
            onConversationOpen(activeConversationEmail);
        }
    }, [activeConversationEmail, onConversationOpen]);
    
    const totalUsers = users.filter(u => u.role !== 'admin').length;
    const followers = users.filter(u => admin.followers?.includes(u.email));
    
    const conversationPartners = useMemo(() => {
        const partnerEmails = new Set<string>();
        directMessages.forEach(msg => {
            if (msg.senderEmail === admin.email) partnerEmails.add(msg.receiverEmail);
            if (msg.receiverEmail === admin.email) partnerEmails.add(msg.senderEmail);
        });
        const partnerMap = new Map<string, number>();
        directMessages.forEach(msg => {
            const partnerEmail = msg.senderEmail === admin.email ? msg.receiverEmail : msg.senderEmail;
            if (msg.timestamp > (partnerMap.get(partnerEmail) || 0)) {
                partnerMap.set(partnerEmail, msg.timestamp);
            }
        });

        return Array.from(partnerEmails)
            .map(email => users.find(u => u.email === email))
            .filter((u): u is User => !!u)
            .sort((a, b) => (partnerMap.get(b.email) || 0) - (partnerMap.get(a.email) || 0));

    }, [directMessages, users, admin.email]);
    
    const getLastMessage = (userEmail: string): DirectMessage | undefined => {
        return directMessages
            .filter(dm => 
                (dm.senderEmail === userEmail && dm.receiverEmail === admin.email) ||
                (dm.senderEmail === admin.email && dm.receiverEmail === userEmail)
            )
            .sort((a, b) => b.timestamp - a.timestamp)[0];
    };

    const activeConversationUser = users.find(u => u.email === activeConversationEmail);

    const messagesForActiveConversation: Message[] = useMemo(() => {
        if (!activeConversationEmail) return [];
        return directMessages
            .filter(dm =>
                (dm.senderEmail === admin.email && dm.receiverEmail === activeConversationEmail) ||
                (dm.senderEmail === activeConversationEmail && dm.receiverEmail === admin.email)
            )
            .sort((a, b) => a.timestamp - b.timestamp)
            .map(dm => ({
                id: dm.id,
                sender: dm.senderEmail === admin.email ? Sender.User : Sender.AI,
                text: dm.text,
                images: dm.images,
            }));
    }, [directMessages, activeConversationEmail, admin.email]);
    
    const handleSendMessage = async (text: string, files: File[]) => {
        if (!activeConversationEmail) return;
        setIsLoading(true);
        await onSendDirectMessage(activeConversationEmail, text, files);
        setIsLoading(false);
    };

    const hasUnreadMessages = useMemo(() => Object.values(unreadDms).some(Boolean), [unreadDms]);

    const getAccessStatus = (user: User): { text: string; color: string } => {
        if (!user.chatAccessExpiresAt) {
            return { text: 'معطل', color: 'text-gray-500' };
        }
        const now = Date.now();
        if (user.chatAccessExpiresAt < now) {
            return { text: 'منتهي الصلاحية', color: 'text-red-500' };
        }
        const remainingMs = user.chatAccessExpiresAt - now;
        const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
        const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
        const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));

        if (remainingMinutes < 60) return { text: `مفعل (${remainingMinutes} د)`, color: 'text-green-600' };
        if (remainingHours < 24) return { text: `مفعل (${remainingHours} س)`, color: 'text-green-600' };
        return { text: `مفعل (${remainingDays} ي)`, color: 'text-green-600' };
    };
    
    const filteredUsers = useMemo(() => {
        return users.filter(u => 
            u.role !== 'admin' &&
            (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             u.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [users, searchTerm]);

    const StatCard: React.FC<{ icon: React.ReactNode, title: string, value: string | number }> = ({ icon, title, value }) => (
        <div className="p-6 rounded-2xl flex items-center space-x-4 space-x-reverse" style={{ backgroundColor: 'var(--bg-main)'}}>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--accent-primary)', color: 'white'}}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)'}}>{title}</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)'}}>{value}</p>
            </div>
        </div>
    );

    const UserRow: React.FC<{ user: User }> = ({ user }) => {
        const roleDisplay = user.role === 'Engineer' ? 'مهندس' : 'مزارع';
        const accessStatus = getAccessStatus(user);
        return (
            <tr style={{ backgroundColor: 'var(--bg-main)'}}>
                <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-10 h-10 rounded-full flex-shrink-0">
                            {user.profilePicture ? (
                                <img src={user.profilePicture} alt={user.name} className="w-10 h-10 rounded-full object-cover"/>
                            ) : (
                                <UserCircleIcon className="w-10 h-10" style={{ color: 'var(--bg-input)'}}/>
                            )}
                        </div>
                        <div>
                            <div className="font-semibold">{user.name}</div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)'}}>{user.email}</div>
                        </div>
                    </div>
                </td>
                <td className="p-4 whitespace-nowrap text-sm">{roleDisplay}</td>
                <td className="p-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {user.isBanned ? 'محظور' : 'نشط'}
                    </span>
                </td>
                <td className="p-4 whitespace-nowrap text-sm font-semibold">
                    <span className={accessStatus.color}>{accessStatus.text}</span>
                </td>
                <td className="p-4 whitespace-nowrap text-left text-sm font-medium space-x-2 space-x-reverse">
                    <button onClick={() => setEditingUserAccess(user)} className="font-medium text-blue-600 hover:text-blue-900">التحكم بالوصول</button>
                    <button 
                        onClick={() => onUpdateUser(user.email, { isBanned: !user.isBanned })}
                        className={`font-medium ${user.isBanned ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'}`}
                    >
                        {user.isBanned ? 'فك الحظر' : 'حظر'}
                    </button>
                </td>
            </tr>
        );
    };

    return (
        <div className="min-h-screen w-screen" style={{ backgroundColor: 'var(--bg-default)', color: 'var(--text-primary)' }}>
            {profileModal}
            {editingUserAccess && <ChatAccessControlModal user={editingUserAccess} onClose={() => setEditingUserAccess(null)} onUpdateUser={onUpdateUser} />}

            {/* Header */}
            <header className="p-4 flex items-center justify-between border-b" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
                <h1 className="text-xl font-bold">لوحة تحكم المدير</h1>
                <div className="flex items-center space-x-4 space-x-reverse">
                    <button onClick={onEditProfile} className="flex items-center space-x-2 space-x-reverse p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
                        <div className="relative w-8 h-8 rounded-full">
                           {admin.profilePicture ? (
                             <img src={admin.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                           ) : (
                             <UserCircleIcon className="w-8 h-8" style={{ color: 'var(--bg-input)'}} />
                           )}
                           {admin.isVerified && (
                             <svg className="absolute -bottom-1 -right-1 w-4 h-4 text-blue-500 bg-white dark:bg-gray-800 rounded-full" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                             </svg>
                           )}
                        </div>
                        <span className="text-sm font-semibold">{admin.name}</span>
                    </button>
                    <button onClick={onLogout} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10" aria-label="تسجيل الخروج">
                        <LogoutIcon className="w-6 h-6" style={{ color: 'var(--text-secondary)' }}/>
                    </button>
                </div>
            </header>

            <main className="p-4 sm:p-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard icon={<UsersIcon className="w-6 h-6"/>} title="إجمالي المستخدمين" value={totalUsers} />
                    <StatCard icon={<HeartIcon className="w-6 h-6"/>} title="المتابعين" value={admin.followers?.length || 0} />
                    <StatCard icon={<ChatIcon className="w-6 h-6"/>} title="المحادثات" value={conversationPartners.length} />
                    <StatCard icon={<StoryIcon className="w-6 h-6"/>} title="القصص المنشورة" value={stories.length} />
                </div>
                
                {/* Tabs */}
                <div className="mb-6 border-b" style={{ borderColor: 'var(--border-color)'}}>
                    <nav className="flex space-x-4 space-x-reverse overflow-x-auto" aria-label="Tabs">
                         <button onClick={() => { setActiveTab('users'); }} className={`shrink-0 px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'users' ? 'border-b-2' : 'hover:bg-black/5'}`} style={{ borderColor: activeTab === 'users' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'users' ? 'var(--accent-primary)' : 'var(--text-secondary)'}}>
                            إدارة المستخدمين
                        </button>
                         <button onClick={() => { setActiveTab('chats'); }} className={`relative shrink-0 px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'chats' ? 'border-b-2' : 'hover:bg-black/5'}`} style={{ borderColor: activeTab === 'chats' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'chats' ? 'var(--accent-primary)' : 'var(--text-secondary)'}}>
                            المحادثات
                            {hasUnreadMessages && <span className="absolute top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>}
                        </button>
                        <button onClick={() => { setActiveTab('stories'); }} className={`shrink-0 px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'stories' ? 'border-b-2' : 'hover:bg-black/5'}`} style={{ borderColor: activeTab === 'stories' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'stories' ? 'var(--accent-primary)' : 'var(--text-secondary)'}}>
                            القصص
                        </button>
                        <button onClick={() => { setActiveTab('followers'); }} className={`shrink-0 px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'followers' ? 'border-b-2' : 'hover:bg-black/5'}`} style={{ borderColor: activeTab === 'followers' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'followers' ? 'var(--accent-primary)' : 'var(--text-secondary)'}}>
                            قائمة المتابعين
                        </button>
                        <button onClick={() => { setActiveTab('broadcast'); }} className={`shrink-0 px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'broadcast' ? 'border-b-2' : 'hover:bg-black/5'}`} style={{ borderColor: activeTab === 'broadcast' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'broadcast' ? 'var(--accent-primary)' : 'var(--text-secondary)'}}>
                            إرسال رسالة
                        </button>
                        <button onClick={() => { setActiveTab('settings'); }} className={`shrink-0 px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'settings' ? 'border-b-2' : 'hover:bg-black/5'}`} style={{ borderColor: activeTab === 'settings' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'settings' ? 'var(--accent-primary)' : 'var(--text-secondary)'}}>
                            الإعدادات
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="shadow-lg rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-main)'}}>
                    {activeTab === 'users' && (
                        <div>
                            <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)'}}>
                                <input
                                    type="text"
                                    placeholder="ابحث عن مستخدم بالاسم أو البريد الإلكتروني..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full max-w-md px-4 py-2 border rounded-full shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 sm:text-sm"
                                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent-primary)' }}
                                />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y" style={{ divideColor: 'var(--border-color)'}}>
                                    <thead style={{ backgroundColor: 'var(--bg-sidebar)'}}>
                                        <tr>
                                            <th scope="col" className="p-4 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)'}}>المستخدم</th>
                                            <th scope="col" className="p-4 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)'}}>الدور</th>
                                            <th scope="col" className="p-4 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)'}}>حالة الحساب</th>
                                            <th scope="col" className="p-4 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)'}}>وصول الدردشة</th>
                                            <th scope="col" className="p-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)'}}>الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y" style={{ divideColor: 'var(--border-color)'}}>
                                        {filteredUsers.map(user => <UserRow key={user.email} user={user} />)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                     {activeTab === 'followers' && (
                        <div className="p-4">
                            {followers.length > 0 ? (
                                <ul className="divide-y" style={{ borderColor: 'var(--border-color)'}}>
                                    {followers.map(user => (
                                        <li key={user.email} className="py-3 flex items-center space-x-3 space-x-reverse">
                                            <div className="w-10 h-10 rounded-full flex-shrink-0">
                                                {user.profilePicture ? (
                                                    <img src={user.profilePicture} alt={user.name} className="w-10 h-10 rounded-full object-cover"/>
                                                ) : (
                                                    <UserCircleIcon className="w-10 h-10" style={{ color: 'var(--bg-input)'}}/>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{user.name}</p>
                                                <p className="text-sm" style={{ color: 'var(--text-secondary)'}}>{user.email}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center py-8" style={{ color: 'var(--text-secondary)'}}>لا يوجد متابعين بعد.</p>
                            )}
                        </div>
                    )}
                    {activeTab === 'chats' && (
                         <>
                            {activeConversationEmail && activeConversationUser ? (
                                <div className="flex flex-col h-[65vh]">
                                    <div className="p-4 border-b font-semibold flex items-center space-x-3 space-x-reverse" style={{ borderColor: 'var(--border-color)'}}>
                                        <button onClick={() => setActiveConversationEmail(null)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10" aria-label="الرجوع إلى المحادثات">
                                            <ArrowRightIcon className="w-5 h-5 transform rotate-180" />
                                        </button>
                                        <div className="w-8 h-8 rounded-full flex-shrink-0">
                                            {activeConversationUser.profilePicture ? <img src={activeConversationUser.profilePicture} alt={activeConversationUser.name} className="w-8 h-8 rounded-full object-cover"/> : <UserCircleIcon className="w-8 h-8" style={{ color: 'var(--bg-input)'}}/>}
                                        </div>
                                        <span>{activeConversationUser.name}</span>
                                    </div>
                                    <div ref={scrollContainerRef} className="flex-1 p-4 sm:p-6 overflow-y-auto" style={{backgroundColor: 'var(--bg-default)'}}>
                                        <ChatWindow 
                                            messages={messagesForActiveConversation} 
                                            isLoading={false} 
                                            onImageClick={() => {}} 
                                            userProfilePicture={admin.profilePicture}
                                            otherUserProfilePicture={activeConversationUser.profilePicture}
                                            isVerified={activeConversationUser.isVerified}
                                            isAiChat={false}
                                        />
                                    </div>
                                    <div className="border-t p-4" style={{ borderColor: 'var(--border-color)' }}>
                                        <ChatInput 
                                        onSendMessage={handleSendMessage} 
                                        isLoading={isLoading} 
                                        onStopGeneration={() => {}}
                                        onToggleVoiceSession={() => { alert('المحادثات الصوتية غير مدعومة هنا.'); }}
                                        onInputFocus={() => {}}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="overflow-y-auto h-[65vh]">
                                     {conversationPartners.length > 0 ? (
                                        <ul className="divide-y" style={{ borderColor: 'var(--border-color)'}}>
                                            {conversationPartners.map(user => {
                                                const lastMessage = getLastMessage(user.email);
                                                return (
                                                    <li key={user.email}>
                                                        <button onClick={() => setActiveConversationEmail(user.email)} className="w-full text-right p-4 flex items-center space-x-4 space-x-reverse hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                                                            <div className="relative w-12 h-12 rounded-full flex-shrink-0">
                                                                {user.profilePicture ? <img src={user.profilePicture} alt={user.name} className="w-12 h-12 rounded-full object-cover"/> : <UserCircleIcon className="w-12 h-12" style={{ color: 'var(--bg-input)'}}/>}
                                                                {unreadDms[user.email] && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-semibold">{user.name}</div>
                                                                <p className="text-sm truncate" style={{ color: 'var(--text-secondary)'}}>
                                                                    {lastMessage?.text ? lastMessage.text : (lastMessage?.images ? 'صورة' : 'لا توجد رسائل بعد')}
                                                                </p>
                                                            </div>
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <p style={{ color: 'var(--text-secondary)'}}>لا توجد محادثات لعرضها.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                         </>
                    )}
                    {activeTab === 'stories' && (
                        <StoryManager 
                            stories={stories}
                            users={users}
                            onAddStory={onAddStory}
                            onDeleteStory={onDeleteStory}
                        />
                    )}
                    {activeTab === 'broadcast' && (
                        <BroadcastMessageForm 
                            users={users.filter(u => u.role !== 'admin')}
                            onSend={onBroadcastMessage}
                        />
                    )}
                    {activeTab === 'settings' && (
                        <div className="p-6 space-y-4">
                            <h3 className="text-lg font-bold">الإعدادات العامة</h3>
                            <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-input)' }}>
                                <div>
                                    <label htmlFor="global-chat-toggle" className="font-semibold">تفعيل المحادثة لجميع المستخدمين</label>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        {globalSettings.isChatEnabled ? 'المحادثة مع الخبير الذكاء الاصطناعي متاحة حاليًا.' : 'المحادثة مع الخبير الذكاء الاصطناعي متوقفة حاليًا.'}
                                    </p>
                                </div>
                                <label htmlFor="global-chat-toggle" className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        id="global-chat-toggle"
                                        className="sr-only peer"
                                        checked={globalSettings.isChatEnabled}
                                        onChange={(e) => onUpdateGlobalSettings({ isChatEnabled: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;