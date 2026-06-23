
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Message, Sender, User, DirectMessage, Story } from './types';
import { createSystemInstruction, specializations, ADMIN_EMAIL } from './constants';
import { fileToGenerativePart } from './services/geminiService';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import Header from './components/Header';
import LoginScreen from './components/LoginScreen';
import WelcomeScreen from './components/WelcomeScreen';
import ImageLightbox from './components/ImageLightbox';
import VoiceAssistantUI from './components/VoiceAssistantUI';
import Sidebar from './components/Sidebar';
import ProfileModal from './components/ProfileModal';
import AdminDashboard from './components/AdminDashboard';
import StoryViewer from './components/StoryViewer';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI, Chat, Part, Modality, LiveServerMessage, Blob } from '@google/genai';

const CHAT_SESSION_KEY = 'chat_session_v2';
const USER_SESSION_KEY = 'user_session_v2';
const USERS_STORAGE_KEY = 'app_users_v2';
const DIRECT_MESSAGES_KEY = 'direct_messages_v2';
const STORIES_KEY = 'app_stories_v2';
const APP_SETTINGS_KEY = 'app_settings_v2';

interface AppSettings {
    isChatEnabled: boolean;
}

const getInitialMessage = (specialization: string): Message => {  
  const text = specialization === specializations[0].name
    ? 'أهلاً بك! أنا المهندس يوسف، خبيرك الزراعي العام. كيف يمكنني مساعدتك اليوم في أي مجال زراعي؟'
    : `أهلاً بك! أنا المهندس يوسف، خبيرك في مجال ${specialization}. كيف يمكنني مساعدتك اليوم؟`;
  
  return {
    id: uuidv4(),
    sender: Sender.AI,
    text,
  };
};

interface ChatSession {
  specialization: string;
  messages: Message[];
}

interface UserSession {
    isLoggedIn: boolean;
    currentUser: User | null;
}

// Audio helper functions for Live API
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error("File reading resulted in a non-string value."));
            }
        };
        reader.onerror = () => reject(new Error("File reading failed."));
        reader.readAsDataURL(file);
    });
};


const App: React.FC = () => {
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [adminIsVerified, setAdminIsVerified] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [chatMode, setChatMode] = useState<'ai' | 'admin'>('ai');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [specialization, setSpecialization] = useState<string>(specializations[0].name);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [unreadDms, setUnreadDms] = useState<Record<string, boolean>>({});
  const [globalSettings, setGlobalSettings] = useState<AppSettings>({ isChatEnabled: true });

  const aiRef = useRef<GoogleGenAI | null>(null);
  const stopGenerationRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Voice session state and refs
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isMicrophoneActive, setIsMicrophoneActive] = useState(false);
  const liveSessionRef = useRef<{ promise: Promise<any>; session?: any } | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const outputSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);
  const isMicrophoneActiveRef = useRef(false);

  // Notification sound refs
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

  const unlockAudio = useCallback(() => {
    if (isAudioUnlocked || !notificationSoundRef.current) return;
    
    const audio = notificationSoundRef.current;
    // Mute the audio element to play it silently, unlocking the context.
    audio.muted = true; 
    const playPromise = audio.play();

    if (playPromise !== undefined) {
        playPromise.then(() => {
            // Pause immediately and reset, so it's ready for the actual notification.
            audio.pause();
            audio.currentTime = 0;
            audio.muted = false; // Unmute for future plays.
            setIsAudioUnlocked(true);
        }).catch(error => {
            // Autoplay was prevented.
            console.warn("Could not unlock audio context on user interaction:", error);
        });
    }
  }, [isAudioUnlocked]);

  useEffect(() => {
    isMicrophoneActiveRef.current = isMicrophoneActive;
  }, [isMicrophoneActive]);
  
  // FIX: The user object in local storage includes a password. Update the return type to reflect this, which fixes downstream type errors.
  const getUsers = (): Record<string, User & { password: string }> => {
    try {
        return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '{}');
    } catch {
        return {};
    }
  };

  const getLastWords = (text: string, count: number): string => {
      const words = text.trim().split(/\s+/);
      if (words.length > count) {
          return '... ' + words.slice(-count).join(' ');
      }
      return text;
  };

  const initializeChat = useCallback((spec: string) => {
    const ai = aiRef.current;
    if (!ai) {
      setError("AI Client not initialized.");
      return;
    }

    try {
      const chatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: createSystemInstruction(spec),
        },
      });
      setChat(chatSession);
      setSpecialization(spec);
      setMessages([getInitialMessage(spec)]);
      setError(null);
    } catch (e: any) {
      console.error("Failed to initialize AI session:", e);
      setError("فشل في تهيئة جلسة الذكاء الاصطناعي: " + e.message);
    }
  }, []);

  useEffect(() => {
     if (!process.env.API_KEY) {
        setError("API_KEY environment variable is not set.");
        return;
    }
    aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Init notification sound
    const audioSrc = 'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAASAAADbWFpbm1pdGlhbmZ1bmt0aW9uAP/7A/8AAAABAAAAAAAAA';
    notificationSoundRef.current = new Audio(audioSrc);
    notificationSoundRef.current.load();

    const savedUserSession = localStorage.getItem(USER_SESSION_KEY);
    if (savedUserSession) {
        try {
            const { isLoggedIn: savedIsLoggedIn, currentUser: savedUser } = JSON.parse(savedUserSession);
            if (savedIsLoggedIn && savedUser) {
                const allAppUsers = getUsers();
                // Refresh user data from "DB" on session load
                const freshUser = allAppUsers[savedUser.email];
                if (freshUser && !freshUser.isBanned) {
                    const { password, ...userProfile } = freshUser;
                    setCurrentUser(userProfile);
                    setIsLoggedIn(true);
                    setShowWelcomeScreen(false);
                } else {
                    // Stale/banned user, clear session
                    localStorage.removeItem(USER_SESSION_KEY);
                }
            }
        } catch (e) {
            console.error("Failed to parse user session:", e);
            localStorage.removeItem(USER_SESSION_KEY);
        }
    }
    
    // Load all users for admin view
    setAllUsers(Object.values(getUsers()).map(({password, ...user}) => user));

    // Load direct messages
    const savedDms = localStorage.getItem(DIRECT_MESSAGES_KEY);
    if(savedDms) {
        try {
            setDirectMessages(JSON.parse(savedDms));
        } catch (e) {
            console.error("Failed to parse direct messages:", e);
        }
    }
    
    // Load stories
    const savedStories = localStorage.getItem(STORIES_KEY);
    if(savedStories) {
        try {
            setStories(JSON.parse(savedStories));
        } catch (e) {
            console.error("Failed to parse stories:", e);
        }
    }

    // Load global settings
    const savedSettings = localStorage.getItem(APP_SETTINGS_KEY);
    if(savedSettings) {
        try {
            setGlobalSettings(JSON.parse(savedSettings));
        } catch (e) {
            console.error("Failed to parse app settings:", e);
        }
    }


    const savedSession = localStorage.getItem(CHAT_SESSION_KEY);
    if (savedSession) {
      try {
        const { specialization: savedSpec, messages: savedMessages } = JSON.parse(savedSession);
        if (savedSpec && savedMessages) {
          setSpecialization(savedSpec);
          setMessages(savedMessages);
          initializeChat(savedSpec);
        }
      } catch (e) {
        console.error("Failed to parse chat session:", e);
        initializeChat(specializations[0].name);
      }
    } else {
      initializeChat(specializations[0].name);
    }
     setTimeout(() => setIsInitialLoad(false), 300);
  }, [initializeChat]);


  useEffect(() => {
    if (isLoggedIn && currentUser) {
      const chatSessionData = { specialization, messages };
      localStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(chatSessionData));
    }
  }, [messages, specialization, isLoggedIn, currentUser]);
  
  useEffect(() => {
    localStorage.setItem(STORIES_KEY, JSON.stringify(stories));
  }, [stories]);
  
  const handleUpdateGlobalSettings = (newSettings: AppSettings) => {
    setGlobalSettings(newSettings);
    localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(newSettings));
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, directMessages, chatMode]);

  // Effect to calculate unread messages
  useEffect(() => {
    if (!currentUser) {
        setUnreadDms({});
        return;
    }

    const calculateUnread = () => {
        const newUnread: Record<string, boolean> = {};
        if (currentUser.role === 'admin') {
            const otherUsers = allUsers.filter(u => u.role !== 'admin');
            otherUsers.forEach(user => {
                const hasUnread = directMessages.some(dm => dm.senderEmail === user.email && dm.receiverEmail === currentUser.email && !dm.isRead);
                if (hasUnread) {
                    newUnread[user.email] = true;
                }
            });
        } else {
            const hasUnread = directMessages.some(dm => dm.senderEmail === ADMIN_EMAIL && dm.receiverEmail === currentUser.email && !dm.isRead);
            if (hasUnread) {
                newUnread[ADMIN_EMAIL] = true;
            }
        }
        setUnreadDms(newUnread);
    };

    calculateUnread();
  }, [directMessages, currentUser, allUsers]);


  // Effect for cross-tab storage sync and notifications
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === DIRECT_MESSAGES_KEY && event.newValue && currentUser) {
            try {
                const oldDms = directMessages;
                const newDms: DirectMessage[] = JSON.parse(event.newValue);

                const lastNewMessage = newDms[newDms.length - 1];
                const isNewForMe = 
                    newDms.length > oldDms.length &&
                    lastNewMessage &&
                    lastNewMessage.receiverEmail === currentUser.email;

                if (isNewForMe) {
                    setDirectMessages(newDms); // Sync state first to trigger UI update
                    if (notificationSoundRef.current && isAudioUnlocked) {
                       notificationSoundRef.current.play().catch(e => console.warn("Notification sound play failed:", e));
                    }
                } else {
                    setDirectMessages(newDms); // Sync state for other changes (e.g., read status)
                }
            } catch (e) {
                console.error("Failed to process direct message storage event:", e);
            }
        }

        // Sync user data changes (e.g., new user registration, admin updates)
        if (event.key === USERS_STORAGE_KEY && event.newValue) {
            try {
                const updatedUsers = JSON.parse(event.newValue);
                const usersArray = Object.values(updatedUsers).map(({password, ...user}) => user as User);
                setAllUsers(usersArray);

                // Also refresh current user data if they are logged in and their data changed
                if (currentUser && updatedUsers[currentUser.email]) {
                    const freshCurrentUser = updatedUsers[currentUser.email];
                    const { password, ...userProfile } = freshCurrentUser;
                    // Prevent overwriting local state if nothing actually changed, to avoid weird re-renders
                    if(JSON.stringify(currentUser) !== JSON.stringify(userProfile)) {
                        setCurrentUser(userProfile);
                    }
                }
            } catch (e) {
                console.error("Failed to process users storage event:", e);
            }
        }
        
        // Sync stories
        if (event.key === STORIES_KEY && event.newValue) {
            try {
                setStories(JSON.parse(event.newValue));
            } catch (e) {
                console.error("Failed to process stories storage event:", e);
            }
        }
        
        // Sync global settings
        if (event.key === APP_SETTINGS_KEY && event.newValue) {
            try {
                setGlobalSettings(JSON.parse(event.newValue));
            } catch (e) {
                console.error("Failed to process app settings storage event:", e);
            }
        }

    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUser, directMessages, isAudioUnlocked]);

  const handleStart = () => {
    setShowWelcomeScreen(false);
  };

  const handleLogin = (user: User) => {
    // Reload all users and messages from storage to ensure the state is fresh
    setAllUsers(Object.values(getUsers()).map(({password, ...u}) => u));
    const savedDms = localStorage.getItem(DIRECT_MESSAGES_KEY);
    if (savedDms) {
        try {
            setDirectMessages(JSON.parse(savedDms));
        } catch (e) {
            console.error("Failed to parse direct messages on login:", e);
        }
    }
    const savedStories = localStorage.getItem(STORIES_KEY);
    if (savedStories) {
        try {
            setStories(JSON.parse(savedStories));
        } catch (e) {
            console.error("Failed to parse stories on login:", e);
        }
    }


    setCurrentUser(user);
    setIsLoggedIn(true);
    
    // For admin, verify and set state
    if(user.email === ADMIN_EMAIL){
        setAdminIsVerified(true);
    }
    
    const userSession: UserSession = { isLoggedIn: true, currentUser: user };
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userSession));
  };
  
  const handleLogout = () => {
      setCurrentUser(null);
      setIsLoggedIn(false);
      localStorage.removeItem(USER_SESSION_KEY);
      localStorage.removeItem(CHAT_SESSION_KEY); // Clear chat history on logout
      setMessages([getInitialMessage(specializations[0].name)]); // Reset to initial state
      setSpecialization(specializations[0].name);
      initializeChat(specializations[0].name);
      setChatMode('ai');
  };
  
  const handleEditProfile = () => {
      setIsProfileModalOpen(true);
  }
  
  const handleSaveProfile = (updatedUser: User) => {
      const allAppUsers = getUsers();
      const existingUser = allAppUsers[updatedUser.email];
      if (existingUser) {
          allAppUsers[updatedUser.email] = { ...existingUser, ...updatedUser };
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(allAppUsers));
          
          const { password, ...userProfile } = allAppUsers[updatedUser.email];
          
          setCurrentUser(userProfile);
          setAllUsers(Object.values(allAppUsers).map(({password: p, ...u}) => u));
          
          // Update user session
          const userSession: UserSession = { isLoggedIn: true, currentUser: userProfile };
          localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userSession));
      }
      setIsProfileModalOpen(false);
  };

  const handleSpecializationChange = (newSpec: string) => {
    if (newSpec !== specialization) {
      initializeChat(newSpec);
    }
    setChatMode('ai'); // Switch to AI chat when specialization changes
    setIsSidebarOpen(false);
  };
  
  const handleNewChat = () => {
    initializeChat(specialization);
  }

  const handleSendMessage = async (text: string, files: File[]) => {
    if ((!text.trim() && files.length === 0) || !currentUser) return;
    
    // --- CHAT ACCESS CONTROL ---
    if (!globalSettings.isChatEnabled) {
      setError("تم إيقاف المحادثة من قبل الإدارة. يرجى الاشتراك في خطة مدفوعة والتواصل مع المدير.");
      return;
    }

    if (!currentUser.chatAccessExpiresAt || currentUser.chatAccessExpiresAt < Date.now()) {
      setError("تم إيقاف المحادثة. يرجى الاشتراك في خطة مدفوعة والتواصل مع المدير.");
      return;
    }
    // --- END OF ACCESS CONTROL ---

    unlockAudio();

    setIsLoading(true);
    stopGenerationRef.current = false;
    
    const userMessage: Message = { id: uuidv4(), sender: Sender.User, text: text.trim() };
    const imageParts: Part[] = [];

    if (files.length > 0) {
      try {
        const dataUrlPromises = files.map(fileToDataUrl);
        const dataUrls = await Promise.all(dataUrlPromises);
        userMessage.images = dataUrls;

        const filePartPromises = files.map(fileToGenerativePart);
        const resolvedImageParts = await Promise.all(filePartPromises);
        imageParts.push(...resolvedImageParts);
      } catch (err) {
        setError("فشل في معالجة الصور.");
        setIsLoading(false);
        return;
      }
    }
    
    setMessages(prev => [...prev, userMessage]);
    
    // Add an empty AI message to update with streaming content
    const aiMessageId = uuidv4();
    setMessages(prev => [...prev, { id: aiMessageId, sender: Sender.AI, text: '' }]);
    
    try {
      if (!chat) {
        throw new Error("Chat session not initialized.");
      }
      
      const contents: Part[] = [];
      if (text.trim()) {
          contents.push({ text: text.trim() });
      }
      contents.push(...imageParts);

      const stream = await chat.sendMessageStream({ message: contents });

      let fullResponse = '';
      for await (const chunk of stream) {
        if (stopGenerationRef.current) {
            console.log("Generation stopped by user.");
            break;
        }
        fullResponse += chunk.text;
        setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId ? { ...msg, text: fullResponse } : msg
        ));
      }

    } catch (e: any) {
      console.error("Error sending message:", e);
      const errorMessage = "عذرًا، حدث خطأ أثناء الاتصال بالخبير. يرجى المحاولة مرة أخرى.";
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId ? { ...msg, text: errorMessage } : msg
      ));
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStopGeneration = () => {
    stopGenerationRef.current = true;
    setIsLoading(false);
  };

  const handleMarkAdminMessagesAsRead = useCallback(() => {
    if (!currentUser) return;
    
    let changed = false;
    const updatedDms = directMessages.map(dm => {
        if (dm.senderEmail === ADMIN_EMAIL && dm.receiverEmail === currentUser.email && !dm.isRead) {
            changed = true;
            return { ...dm, isRead: true };
        }
        return dm;
    });
    
    if (changed) {
        setDirectMessages(updatedDms);
        localStorage.setItem(DIRECT_MESSAGES_KEY, JSON.stringify(updatedDms));
    }
  }, [currentUser, directMessages]);
  
  const handleChatModeChange = (mode: 'ai' | 'admin') => {
      if (mode === 'admin') {
          handleMarkAdminMessagesAsRead();
      }
      setChatMode(mode);
      setIsSidebarOpen(false);
  }

  // Admin specific functions
  const handleUpdateUser = (email: string, updates: Partial<User>) => {
      const allAppUsers = getUsers();
      if(allAppUsers[email]) {
          const updatedUserData = { ...allAppUsers[email], ...updates };
          // If undefined is passed, delete the key to disable chat permanently
          if (updates.chatAccessExpiresAt === undefined) {
              delete (updatedUserData as Partial<User>).chatAccessExpiresAt;
          }
          allAppUsers[email] = updatedUserData;
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(allAppUsers));
          setAllUsers(Object.values(allAppUsers).map(({password, ...u}) => u));
      }
  };

  const handleSendDirectMessage = async (receiverEmail: string, text: string, files: File[]) => {
      if (!currentUser || (!text.trim() && files.length === 0)) return;

      const newDm: DirectMessage = {
          id: uuidv4(),
          senderEmail: currentUser.email,
          receiverEmail,
          text: text.trim(),
          timestamp: Date.now(),
          isRead: false,
      };
      
      if (files.length > 0) {
          try {
            const dataUrlPromises = files.map(fileToDataUrl);
            newDm.images = await Promise.all(dataUrlPromises);
          } catch(err) {
            console.error("Failed to process images for DM", err);
            // Optionally set an error state for the admin UI
          }
      }

      setDirectMessages(prev => {
          const updatedDms = [...prev, newDm];
          localStorage.setItem(DIRECT_MESSAGES_KEY, JSON.stringify(updatedDms));
          return updatedDms;
      });
  };
  
  const handleBroadcastMessage = async (target: 'all' | string, text: string, files: File[]) => {
      if(!currentUser || currentUser.role !== 'admin') return;
      
      const targets = target === 'all' 
          ? allUsers.filter(u => u.role !== 'admin').map(u => u.email)
          : [target];
          
      const imagePromises = files.length > 0 ? files.map(fileToDataUrl) : [];
      const images = await Promise.all(imagePromises);
      
      const newDms: DirectMessage[] = targets.map(email => ({
          id: uuidv4(),
          senderEmail: currentUser.email,
          receiverEmail: email,
          text: text.trim(),
          images,
          timestamp: Date.now(),
          isRead: false
      }));
      
      setDirectMessages(prev => {
          const updatedDms = [...prev, ...newDms];
          localStorage.setItem(DIRECT_MESSAGES_KEY, JSON.stringify(updatedDms));
          return updatedDms;
      });
  };

  const handleMarkUserMessagesAsRead = useCallback((userEmail: string) => {
    if (!currentUser || currentUser.role !== 'admin') return;

    let changed = false;
    const updatedDms = directMessages.map(dm => {
        if (dm.senderEmail === userEmail && dm.receiverEmail === currentUser.email && !dm.isRead) {
            changed = true;
            return { ...dm, isRead: true };
        }
        return dm;
    });
    
    if (changed) {
        setDirectMessages(updatedDms);
        localStorage.setItem(DIRECT_MESSAGES_KEY, JSON.stringify(updatedDms));
    }
  }, [currentUser, directMessages]);
  
    // Story Handlers
  const handleAddStory = async (file: File) => {
      const mediaUrl = await fileToDataUrl(file);
      const newStory: Story = {
          id: uuidv4(),
          mediaUrl,
          likedBy: [],
          viewedBy: [],
          timestamp: Date.now(),
      };
      setStories(prev => [newStory, ...prev]);
  };
  
  const handleDeleteStory = (storyId: string) => {
      setStories(prev => prev.filter(s => s.id !== storyId));
  };
  
  const handleLikeStory = (storyId: string) => {
      if (!currentUser) return;
      setStories(prevStories => prevStories.map(story => {
          if (story.id === storyId) {
              const liked = story.likedBy.includes(currentUser.email);
              const newLikedBy = liked
                  ? story.likedBy.filter(email => email !== currentUser.email)
                  : [...story.likedBy, currentUser.email];
              return { ...story, likedBy: newLikedBy };
          }
          return story;
      }));
  };

  const handleMarkStoryAsViewed = (storyId: string) => {
      if (!currentUser) return;
      setStories(prevStories => prevStories.map(story => {
          if (story.id === storyId && !story.viewedBy.includes(currentUser.email)) {
              return { ...story, viewedBy: [...story.viewedBy, currentUser.email] };
          }
          return story;
      }));
  };


  const stopVoiceSession = useCallback(() => {
    setIsMicrophoneActive(false);

    // Make cleanup idempotent. If a ref is null, it's already cleaned up.
    if (liveSessionRef.current) {
        liveSessionRef.current.promise.then(session => session?.close()).catch(console.error);
        liveSessionRef.current = null;
    }
    
    if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
    }

    if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }
    
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close().catch(console.error);
    }
    inputAudioContextRef.current = null;

    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close().catch(console.error);
    }
    outputAudioContextRef.current = null;
    
    outputSourcesRef.current.forEach(source => {
        try {
            source.stop();
        } catch (e) {
            // Ignore errors if source is already stopped.
        }
    });
    outputSourcesRef.current.clear();
  }, []);

  // Voice session management
  const startVoiceSession = useCallback(async () => {
    if (!aiRef.current) return;
    
    unlockAudio();
    
    setIsMicrophoneActive(true);

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;

        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        inputAudioContextRef.current = inputCtx;
        outputAudioContextRef.current = outputCtx;
        outputSourcesRef.current = new Set();
        nextStartTimeRef.current = 0;
        
        const sessionPromise = aiRef.current.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    const source = inputCtx.createMediaStreamSource(stream);
                    mediaStreamSourceRef.current = source;
                    
                    const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = processor;

                    processor.onaudioprocess = (audioProcessingEvent) => {
                        if (!isMicrophoneActiveRef.current) return;
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        
                        liveSessionRef.current?.promise.then(session => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    source.connect(processor);
                    processor.connect(inputCtx.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio && outputCtx) {
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                        const source = outputCtx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputCtx.destination);
                        source.addEventListener('ended', () => {
                            outputSourcesRef.current.delete(source);
                        });
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        outputSourcesRef.current.add(source);
                    }
                    
                    if (message.serverContent?.interrupted) {
                        outputSourcesRef.current.forEach(source => source.stop());
                        outputSourcesRef.current.clear();
                        nextStartTimeRef.current = 0;
                    }
                },
                onerror: (e) => {
                    console.error("Live session error:", e);
                    setError("انقطع الاتصال الصوتي بسبب مشكلة في الشبكة.");
                    stopVoiceSession();
                    setIsVoiceModalOpen(false);
                },
                onclose: () => {
                    console.log("Live session closed.");
                    stopVoiceSession();
                    setIsVoiceModalOpen(false);
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
                },
                systemInstruction: createSystemInstruction(specialization),
            },
        });
        
        liveSessionRef.current = { promise: sessionPromise };
        sessionPromise.then(session => {
            if (liveSessionRef.current) {
                liveSessionRef.current.session = session;
            }
        }).catch(err => {
            console.error("Failed to initiate live session:", err);
            setError("فشل بدء المحادثة الصوتية. تحقق من اتصالك بالإنترنت وأذونات الميكروفون.");
            stopVoiceSession();
            setIsVoiceModalOpen(false);
        });

    } catch (err) {
        console.error("Failed to start voice session:", err);
        setError("لا يمكن الوصول إلى الميكروفون. يرجى التحقق من الأذونات.");
        setIsMicrophoneActive(false);
    }
  }, [specialization, unlockAudio, stopVoiceSession]);
  
  const handleToggleVoiceSession = () => {
    if (!isVoiceModalOpen) {
        setIsVoiceModalOpen(true);
        startVoiceSession();
    } else {
        stopVoiceSession();
        setIsVoiceModalOpen(false);
    }
  };
  
  const handleToggleMicrophone = () => {
    setIsMicrophoneActive(prev => !prev);
  }

  // Render logic
  if (!isLoggedIn || !currentUser) {
    return showWelcomeScreen ? <WelcomeScreen onStart={handleStart} /> : <LoginScreen onLogin={handleLogin} />;
  }
  
  const adminUser = allUsers.find(u => u.email === ADMIN_EMAIL);
  
  if (currentUser.role === 'admin') {
      return (
        <AdminDashboard 
            admin={currentUser}
            users={allUsers.filter(u => u.email !== ADMIN_EMAIL)}
            directMessages={directMessages}
            stories={stories}
            onUpdateUser={handleUpdateUser}
            onSendDirectMessage={handleSendDirectMessage}
            onBroadcastMessage={handleBroadcastMessage}
            onAddStory={handleAddStory}
            onDeleteStory={handleDeleteStory}
            onEditProfile={handleEditProfile}
            onLogout={handleLogout}
            unreadDms={unreadDms}
            onConversationOpen={handleMarkUserMessagesAsRead}
            globalSettings={globalSettings}
            onUpdateGlobalSettings={handleUpdateGlobalSettings}
            profileModal={
              <ProfileModal 
                isOpen={isProfileModalOpen}
                user={currentUser}
                onClose={() => setIsProfileModalOpen(false)}
                onSave={handleSaveProfile}
              />
            }
        />
      );
  }
  
  const messagesToDisplay = chatMode === 'ai' 
    ? messages 
    : directMessages
        .filter(dm => dm.receiverEmail === currentUser.email || dm.senderEmail === currentUser.email)
        .map(dm => {
            const isAdminSender = dm.senderEmail === ADMIN_EMAIL;
            return {
                id: dm.id,
                sender: isAdminSender ? Sender.AI : Sender.User,
                text: dm.text,
                images: dm.images
            }
        });

  return (
    <div dir="rtl" className="h-screen w-screen flex flex-col antialiased relative" style={{ backgroundColor: 'var(--bg-default)', color: 'var(--text-primary)'}}>
      {error && (
        <div className="absolute top-4 right-4 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg z-[100] flex items-center justify-between shadow-lg animate-fade-in-down">
          <span className="font-medium">{error}</span>
          <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-red-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </button>
        </div>
      )}
      {lightboxImage && <ImageLightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />}
      <ProfileModal 
        isOpen={isProfileModalOpen}
        user={currentUser}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveProfile}
      />
      <VoiceAssistantUI
        isOpen={isVoiceModalOpen}
        onClose={handleToggleVoiceSession}
        isMicrophoneActive={isMicrophoneActive}
        onToggleMicrophone={handleToggleMicrophone}
      />
      <StoryViewer
          isOpen={isStoryViewerOpen}
          stories={stories}
          onClose={() => setIsStoryViewerOpen(false)}
          onLike={handleLikeStory}
          onMarkViewed={handleMarkStoryAsViewed}
          currentUser={currentUser}
          admin={adminUser || null}
      />


      <div className={`fixed inset-0 bg-black/40 z-10 ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)} />
      
      <Sidebar 
        isOpen={isSidebarOpen}
        isInitialLoad={isInitialLoad}
        currentSpecialization={specialization}
        onSpecializationChange={handleSpecializationChange}
        onNewChat={handleNewChat}
        currentUser={currentUser}
        onLogout={handleLogout}
        onClose={() => setIsSidebarOpen(false)}
        onEditProfile={handleEditProfile}
        chatMode={chatMode}
        onChatModeChange={handleChatModeChange}
        hasUnreadAdminMessage={!!unreadDms[ADMIN_EMAIL]}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          currentSpecialization={chatMode === 'ai' ? specialization : 'التواصل مع الإدارة'}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          stories={stories}
          currentUser={currentUser}
          adminUser={adminUser || null}
          onViewStories={() => setIsStoryViewerOpen(true)}
        />
        
            <>
                <main ref={scrollContainerRef} className="flex-1 overflow-y-auto p-1 sm:p-4">
                  <ChatWindow 
                    messages={messagesToDisplay} 
                    isLoading={isLoading} 
                    onImageClick={setLightboxImage}
                    userProfilePicture={currentUser.profilePicture}
                    otherUserProfilePicture={chatMode === 'ai' ? undefined : adminUser?.profilePicture}
                    isVerified={chatMode === 'admin' ? adminUser?.isVerified : true}
                    isAiChat={chatMode === 'ai'}
                  />
                </main>
                
                <footer className="p-4 flex-shrink-0" style={{ backgroundColor: 'var(--bg-default)'}}>
                  <ChatInput 
                    onSendMessage={chatMode === 'ai' ? handleSendMessage : (text, files) => handleSendDirectMessage(ADMIN_EMAIL, text, files)} 
                    isLoading={isLoading} 
                    onStopGeneration={handleStopGeneration}
                    onToggleVoiceSession={handleToggleVoiceSession}
                    onInputFocus={unlockAudio}
                  />
                </footer>
            </>

      </div>
    </div>
  );
};

export default App;
