import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { ADMIN_EMAIL } from '../constants';

const USERS_STORAGE_KEY = 'app_users_v2';

const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66C7.32 17.57 9.55 13 17 12V8z"/>
        <path d="M17 3c-5.52 0-10 4.48-10 10 0 .55.45 1 1 1s1-.45 1-1c0-4.41 3.59-8 8-8 .55 0 1-.45 1-1s-.45-1-1-1z"/>
    </svg>
);

// Icons for the new screen
const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);
const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
);
const BriefcaseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 0H4v2h12V5zM2 11a2 2 0 012-2h12a2 2 0 012 2v5a2 2 0 01-2 2H4a2 2 0 01-2-2v-5z" clipRule="evenodd" />
  </svg>
);


interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Engineer' | 'Farmer'>('Farmer');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const getUsers = (): Record<string, User & {password: string}> => {
    try {
        return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '{}');
    } catch {
        return {};
    }
  };
  
  // Ensure admin account is correctly configured on load
  useEffect(() => {
    const users = getUsers();
    const adminUser = users[ADMIN_EMAIL];
    // This defensive check ensures the admin account exists and has the correct credentials.
    // It fixes issues where local storage might contain a corrupted or outdated admin entry.
    if (!adminUser || adminUser.password !== 'Yousef9090' || adminUser.role !== 'admin') {
        users[ADMIN_EMAIL] = {
            email: ADMIN_EMAIL,
            password: 'Yousef9090',
            name: 'المدير',
            role: 'admin',
            isVerified: true,
            isBanned: false,
            followers: adminUser?.followers || [],
            profilePicture: adminUser?.profilePicture,
        };
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  }, []);

  const clearMessages = () => {
      setError('');
      setSuccessMessage('');
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!email || !password) {
      setError('الرجاء إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }
    const users = getUsers();
    const user = users[email];
    if (user && user.password === password) {
        if(user.isBanned) {
            setError('تم حظر هذا الحساب. يرجى التواصل مع الإدارة.');
            return;
        }
        const { password, ...userProfile } = user;
        onLogin(userProfile);
    } else {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
    }
  };
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!email || !password || !confirmPassword || !name) {
      setError('الرجاء ملء جميع الحقول.');
      return;
    }
    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }
    
    const users = getUsers();
    if (users[email]) {
      setError('هذا البريد الإلكتروني مسجل بالفعل.');
      return;
    }

    users[email] = { email, name, role, password, isBanned: false, isVerified: false };
    
    // Auto-follow admin
    const admin = users[ADMIN_EMAIL];
    if (admin && admin.followers) {
        if (!admin.followers.includes(email)) {
            admin.followers.push(email);
        }
    } else if (admin) {
        admin.followers = [email];
    }
    
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    
    setIsRegistering(false);
    setSuccessMessage('تم إنشاء الحساب بنجاح. الرجاء تسجيل الدخول.');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
  };

  const formTitle = isRegistering ? 'إنشاء حساب جديد' : 'تسجيل الدخول';
  const formSubtitle = isRegistering ? 'أدخل بياناتك لإنشاء حساب' : 'سجل الدخول للمتابعة إلى حسابك';
  const buttonText = isRegistering ? 'إنشاء الحساب' : 'تسجيل الدخول';
  
  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center p-4 antialiased" style={{ backgroundColor: 'var(--bg-default)', color: 'var(--text-primary)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-lg mx-auto mb-4" style={{ backgroundColor: 'var(--accent-primary)', borderColor: 'var(--bg-main)'}}>
                <LogoIcon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              {formTitle}
            </h1>
            <p className="text-md mt-2" style={{ color: 'var(--text-secondary)'}}>
              {formSubtitle}
            </p>
        </div>

        <div className="shadow-2xl rounded-2xl p-8" style={{ backgroundColor: 'var(--bg-main)'}}>
            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-6">
                {isRegistering && (
                  <>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1 text-right" style={{ color: 'var(--text-secondary)'}}>الاسم الكامل</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3"><UserIcon className="h-5 w-5 text-gray-400" /></span>
                            <input id="name" name="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                className="block w-full px-3 py-2 pl-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm text-right"
                                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent-primary)' }}
                                placeholder="مثال: يوسف رجب"
                            />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="role" className="block text-sm font-medium mb-1 text-right" style={{ color: 'var(--text-secondary)'}}>أنا</label>
                        <div className="relative">
                           <span className="absolute inset-y-0 left-0 flex items-center pl-3"><BriefcaseIcon className="h-5 w-5 text-gray-400" /></span>
                            <select id="role" name="role" value={role} onChange={(e) => setRole(e.target.value as 'Engineer' | 'Farmer')}
                                className="block w-full px-3 py-2 pl-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm text-right appearance-none"
                                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent-primary)' }}>
                                <option value="Farmer">مزارع</option>
                                <option value="Engineer">مهندس</option>
                            </select>
                        </div>
                    </div>
                  </>
                )}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1 text-right" style={{ color: 'var(--text-secondary)'}}>
                        البريد الإلكتروني
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>
                        </span>
                        <input
                            id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                            className="block w-full px-3 py-2 pl-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm text-right"
                            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent-primary)' }}
                            placeholder="you@example.com"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password"  className="block text-sm font-medium mb-1 text-right" style={{ color: 'var(--text-secondary)'}}>
                        كلمة المرور
                    </label>
                    <div className="relative">
                         <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <LockIcon className="h-5 w-5 text-gray-400" />
                        </span>
                        <input
                            id="password" name="password" type="password" autoComplete={isRegistering ? "new-password" : "current-password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                            className="block w-full px-3 py-2 pl-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm text-right"
                            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent-primary)' }}
                            placeholder="********"
                        />
                    </div>
                </div>
                
                {isRegistering && (
                    <div>
                        <label htmlFor="confirm-password"  className="block text-sm font-medium mb-1 text-right" style={{ color: 'var(--text-secondary)'}}>
                            تأكيد كلمة المرور
                        </label>
                        <div className="relative">
                             <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <LockIcon className="h-5 w-5 text-gray-400" />
                            </span>
                            <input
                                id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full px-3 py-2 pl-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm text-right"
                                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent-primary)' }}
                                placeholder="********"
                            />
                        </div>
                    </div>
                )}

                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                {successMessage && <p className="text-sm text-green-500 text-center">{successMessage}</p>}

                <div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform hover:scale-105"
                        style={{ backgroundColor: 'var(--accent-primary)', '--tw-ring-color': 'var(--accent-primary)'}}
                    >
                        {buttonText}
                    </button>
                </div>
            </form>
             <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)'}}>
                {isRegistering ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}{' '}
                <button onClick={() => { setIsRegistering(!isRegistering); clearMessages(); }} className="font-medium" style={{ color: 'var(--accent-primary)'}}>
                     {isRegistering ? 'سجل الدخول' : 'أنشئ حساباً'}
                </button>
            </p>
        </div>
        <div className="mt-8 text-center text-sm" style={{ color: 'var(--text-secondary)'}}>
             <p>تطوير المهندس يوسف رجب</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;